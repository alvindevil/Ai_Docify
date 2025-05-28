// Ai_Docify/server/index.js
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue } from 'bullmq';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import fs from 'fs'; // Import fs for directory creation

dotenv.config();

// --- Configuration from Environment Variables ---
const UPLOADS_DIR_NAME = 'uploads'; // The actual name of the directory for uploads
// UPLOADS_BASE_DIR will be the absolute path to the uploads directory,
// potentially configurable for persistent storage in production.
// For local, it defaults to a directory named 'uploads' in the server's root.
// For Render persistent disk, process.env.UPLOADS_DIR could be '/var/data/uploads_disk'
const UPLOADS_BASE_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), UPLOADS_DIR_NAME);


const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || undefined; // Optional API key for Qdrant
const REDIS_URL = process.env.REDIS_URL || { host: 'localhost', port: 6379 };
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'; // For CORS
const PORT = process.env.PORT || 8000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("FATAL ERROR: OPENAI_API_KEY is not set in the environment variables. The application will not function correctly.");
  // Consider exiting if critical: process.exit(1);
}

// --- Initialize Services ---
const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const bullQueue = new Queue('file-upload-queue', {
  connection: REDIS_URL, // BullMQ v5+ can often take a URL string directly
});

// --- Ensure Uploads Directory Exists ---
if (!fs.existsSync(UPLOADS_BASE_DIR)) {
  console.log(`Uploads directory ${UPLOADS_BASE_DIR} does not exist. Creating it...`);
  try {
    fs.mkdirSync(UPLOADS_BASE_DIR, { recursive: true });
    console.log(`Uploads directory ${UPLOADS_BASE_DIR} created successfully.`);
  } catch (err) {
    console.error(`Error creating uploads directory ${UPLOADS_BASE_DIR}:`, err);
    // Consider exiting if this is critical: process.exit(1);
  }
}


// --- Multer Configuration for File Uploads ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_BASE_DIR); // Save directly into the base directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const newFilename = `${uniqueSuffix}-${file.originalname}`;
    cb(null, newFilename);
  },
});
const upload = multer({ storage: storage });

// --- Express App Setup ---
const app = express();

const corsOptions = {
  origin: FRONTEND_URL.includes(',') ? FRONTEND_URL.split(',') : FRONTEND_URL, // Allow multiple origins if comma-separated
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
// It's good practice to have a body parser for other types of requests if needed,
// but for file uploads, multer handles it. For JSON bodies for other routes:
app.use(express.json());


// --- API Routes ---

// Health Check
app.get('/', (req, res) => {
  return res.json({ status: "Server is healthy and running" });
});

// PDF Upload Endpoint
app.post('/upload/pdf', upload.single('pdf'), async (req, res) => {
  if (!req.file || !req.file.filename) {
    console.error('Server: No file received or filename missing in /upload/pdf.');
    return res.status(400).json({ message: 'No file uploaded or server error during upload processing.' });
  }

  try {
    const jobData = {
      originalName: req.file.originalname,
      // filePath will be the absolute path on the server where the file is stored
      filePath: req.file.path, // multer provides the full path of the uploaded file
      prefixedFilename: req.file.filename, // For Qdrant metadata & client reference
    };
    // console.log("Server: Adding job to queue with data:", jobData);
    const job = await bullQueue.add('file-ready', jobData);

    const responsePayload = {
      message: 'File uploaded and processing started!',
      fileName: req.file.filename, // Prefixed name for client to use
      originalName: req.file.originalname, // For display purposes on client
      jobId: job.id,
      fileUrl: `/uploads/${encodeURIComponent(req.file.filename)}` // For direct access if needed
    };
    // console.log('Server: Sending response to client:', responsePayload);
    return res.json(responsePayload);

  } catch (error) {
    console.error("Server: Error adding job to BullMQ queue:", error);
    return res.status(500).json({ message: "Failed to queue file for processing due to a server error." });
  }
});

// Serve Uploaded PDFs Statically
app.use('/uploads', express.static(UPLOADS_BASE_DIR));

// Job Status Endpoint
app.get('/api/job-status/:jobId', async (req, res) => {
  const { jobId } = req.params;
  if (!jobId) {
    return res.status(400).json({ message: "Job ID is required." });
  }
  try {
    const job = await bullQueue.getJob(jobId);
    if (!job) return res.status(404).json({ message: "Job not found." });

    const state = await job.getState();
    // console.log(`Server: Job status for ${jobId}: ${state}`);
    return res.json({
      jobId: job.id, status: state,
      isCompleted: await job.isCompleted(), isFailed: await job.isFailed(),
      progress: job.progress, failedReason: job.failedReason,
      timestamp: job.timestamp, processedOn: job.processedOn, finishedOn: job.finishedOn
    });
  } catch (error) {
    console.error(`Server: Error fetching status for job ${jobId}:`, error);
    return res.status(500).json({ message: "Error fetching job status." });
  }
});

// PDF Summarization Endpoint
app.get('/api/summarize', async (req, res) => {
  const { fileName } = req.query;
  if (!fileName || typeof fileName !== 'string') {
    return res.status(400).json({ message: "fileName query parameter is required." });
  }

  const filePath = path.join(UPLOADS_BASE_DIR, fileName);
  console.log(`[Server /api/summarize] Request for: ${fileName}. Path: ${filePath}`);

  try {
    // Check if file exists before attempting to load
    if (!fs.existsSync(filePath)) {
        console.error(`[Server /api/summarize] File not found at path: ${filePath}`);
        return res.status(404).json({ message: `PDF file not found on server: ${fileName}` });
    }

    const loader = new PDFLoader(filePath);
    const docs = await loader.load();

    if (!docs || docs.length === 0) {
      return res.status(404).json({ message: `Could not extract content from PDF: ${fileName}.` });
    }
    const fullPdfText = docs.map(doc => doc.pageContent).join('\n\n').trim();
    if (!fullPdfText) {
      return res.status(400).json({ message: `Extracted text from PDF is empty: ${fileName}.` });
    }

    const SUMMARIZATION_PROMPT = `Kindly generate a concise and insightful summary...`; // Your full prompt
    const summaryCompletion = await client.chat.completions.create({ /* ... */ }); // As before
    const summary = summaryCompletion.choices[0]?.message?.content?.trim();

    if (!summary) {
      return res.status(500).json({ message: "Failed to generate summary: OpenAI returned no content." });
    }
    return res.json({ summary });

  } catch (error) {
    console.error(`[Server /api/summarize] Error for ${fileName}:`, error);
    if (error.code === 'ENOENT') return res.status(404).json({ message: `PDF file not found: ${fileName}` });
    // Handle OpenAI specific errors (check error structure from openai library)
    if (error.status && error.error && error.error.message) { // Example structure
        return res.status(error.status).json({ message: `OpenAI API Error: ${error.error.message}` });
    }
    return res.status(500).json({ message: `Error generating summary: ${error.message}` });
  }
});

// Chat Endpoint
app.get('/chat', async (req, res) => {
  const { message: userQuery, selectedPdfPrefixedName } = req.query; // Expect selectedPdfPrefixedName for filtering

  if (!userQuery) {
    return res.status(400).json({ message: "Query message is required." });
  }
  // if (!selectedPdfPrefixedName) { // Uncomment if chat MUST be PDF-specific
  //   return res.status(400).json({ message: "selectedPdfPrefixedName is required for chat." });
  // }

  try {
    const embeddings = new OpenAIEmbeddings({ apiKey: OPENAI_API_KEY, modelName: "text-embedding-3-small" });
    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: QDRANT_URL,
      apiKey: QDRANT_API_KEY, // Pass API key if defined
      collectionName: 'Ai_Docs',
    });

    // Modify retriever if chat is to be PDF-specific
    let retrieverOptions = { k: 2 };
    if (selectedPdfPrefixedName) {
      // This assumes you've added 'pdf_source_id' as metadata in your worker.js
      // See Langchain JS Qdrant docs for exact filter syntax if this isn't precise
      // retrieverOptions.filter = { must: [{ key: 'metadata.pdf_source_id', match: { value: selectedPdfPrefixedName } }] };
      // For Qdrant JS client, the filter structure might be simpler, or you might pass it to a custom retriever.
      // For now, this is a placeholder for how you'd conceptually filter.
      // The direct `filter` option on `asRetriever` might need specific Qdrant filter object.
      // A more robust way: use vectorStore.similaritySearch(userQuery, k, filter)
      console.log(`[Server /chat] Filtering chat for PDF: ${selectedPdfPrefixedName}`);
    }

    const retriever = vectorStore.asRetriever(retrieverOptions);
    const relevantDocs = await retriever.invoke(userQuery); // These are your context docs

    const SYSTEM_PROMPT = `You are a helpful AI assistant. Answer the user's question based on the provided context from the PDF document. If the context doesn't contain the answer, say so.
Context:
---
${relevantDocs.map(doc => doc.pageContent).join("\n\n---\n\n")}
---
Question: ${userQuery}
Answer:`;

    const chatResult = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: SYSTEM_PROMPT }], // Simplified to a direct user prompt with context
    });

    return res.json({
      message: chatResult.choices[0]?.message?.content?.trim(),
      docs: relevantDocs, // For client to optionally display sources
    });
  } catch (error) {
    console.error("[Server /chat] Error:", error);
    return res.status(500).json({ message: `Error processing chat request: ${error.message}` });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server successfully started on port ${PORT}`);
  console.log(`Uploads directory configured at: ${UPLOADS_BASE_DIR}`);
  console.log(`Frontend should connect from: ${FRONTEND_URL}`);
  console.log(`Redis/BullMQ configured with: ${typeof REDIS_URL === 'string' ? REDIS_URL : JSON.stringify(REDIS_URL)}`);
  console.log(`Qdrant configured with: ${QDRANT_URL}`);
});