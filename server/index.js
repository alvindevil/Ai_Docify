import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue, Worker } from 'bullmq'; // Combined imports
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs'; // For checking/creating directories
import { fileURLToPath } from 'url'; // For __dirname in ES modules
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

dotenv.config();

// --- Path Configuration ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(`[Server Startup] Script directory (__dirname): ${__dirname}`);
console.log(`[Server Startup] Current working directory (process.cwd()): ${process.cwd()}`);

// Determine the upload path.
// For Render, if using a persistent disk, set PERSISTENT_UPLOAD_PATH to its mount point (e.g., /srv/uploads).
// Otherwise, it defaults to 'uploads_ephemeral' within the server's directory (this will be temporary on Render).
const configuredUploadPath = process.env.PERSISTENT_UPLOAD_PATH;
let absoluteUploadPath;

if (configuredUploadPath) {
    absoluteUploadPath = path.resolve(configuredUploadPath);
    console.log(`[Server Startup] Using PERSISTENT_UPLOAD_PATH: ${configuredUploadPath}, resolved to absolute path: ${absoluteUploadPath}`);
} else {
    absoluteUploadPath = path.join(__dirname, 'uploads_ephemeral');
    console.log(`[Server Startup] PERSISTENT_UPLOAD_PATH not set. Defaulting to ephemeral path: ${absoluteUploadPath}`);
}

// Ensure the upload directory exists
if (!fs.existsSync(absoluteUploadPath)) {
    try {
        fs.mkdirSync(absoluteUploadPath, { recursive: true });
        console.log(`[Server Startup] Upload directory ensured/created: ${absoluteUploadPath}`);
    } catch (err) {
        console.error(`[Server Startup] CRITICAL ERROR: Could not create upload directory ${absoluteUploadPath}. Error: ${err.message}`);
        // You might want to exit or prevent the server from starting if this fails.
    }
} else {
    console.log(`[Server Startup] Upload directory already exists: ${absoluteUploadPath}`);
}

// --- BullMQ Worker ---
// Ensure OPENAI_API_KEY, QDRANT_URL, and REDIS_URL are set in your .env file or Render environment variables
const worker = new Worker(
    'file-upload-queue',
    async job => {
        console.log('[Worker] Processing job:', job.data.filename);
        const data = JSON.parse(job.data); 
        
        try {
            const loader = new PDFLoader(data.path); // data.path should be absolute path to the (potentially ephemeral) file
            const docs = await loader.load();

            if (!docs || docs.length === 0) {
                console.error(`[Worker] No content extracted from PDF: ${data.filename} at path: ${data.path}`);
                return; // Or throw an error to mark job as failed
            }
            
            console.log(`[Worker] Loaded ${docs.length} pages from ${data.filename}`);

            const embeddings = new OpenAIEmbeddings({
                apiKey: process.env.OPENAI_API_KEY,
                modelName: "text-embedding-3-small"
            });

            const vectorStore = await QdrantVectorStore.fromDocuments( // Changed to fromDocuments for potential creation
                docs, // Pass loaded documents directly
                embeddings,
                {
                    url: process.env.QDRANT_URL ,
                    collectionName: 'Ai_Docs_main',
                    // You might need to specify vector size if fromDocuments doesn't infer it for a new collection:
                    // config: {
                    //   params: {
                    //     vectors: { size: 1536, distance: "Cosine" }, // for text-embedding-3-small
                    //   },
                    //   hnsw_config: { m: 16, ef_construct: 100 }
                    // }
                }
            );
            console.log(`[Worker] Documents from ${data.filename} added/updated in Qdrant. Count: ${docs.length}`);

            // IMPORTANT for ephemeral storage: If you don't need the original PDF file after this point,
            // and it was saved to an ephemeral path, you might consider deleting it here
            // if the upload process doesn't handle cleanup.
            // fs.unlink(data.path, (err) => {
            //   if (err) console.error(`[Worker] Error deleting ephemeral file ${data.path}:`, err);
            //   else console.log(`[Worker] Ephemeral file ${data.path} deleted.`);
            // });

        } catch (error) {
            console.error(`[Worker] Error processing job for ${data.filename} (path: ${data.path}):`, error);
            throw error; // Rethrow to mark job as failed
        }
    },
    {
        concurrency: process.env.WORKER_CONCURRENCY || 5, // Make concurrency configurable
        connection: process.env.REDIS_URL || { host: 'localhost', port: 6379 } // Use REDIS_URL for Render
    }
);

worker.on('completed', job => {
  console.log(`[Worker] Job ${job.id} for ${job.data.filename} has completed.`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job.id} for ${job.data.filename} failed with error: ${err.message}`, err.stack);
});


// --- OpenAI Client ---
const openAIClient = new OpenAI({ // Renamed to avoid conflict with langchain/openai
    apiKey: process.env.OPENAI_API_KEY,
});

// --- BullMQ Queue ---
const fileUploadQueue = new Queue('file-upload-queue', { // Renamed to be more specific
    connection: process.env.REDIS_URL || { host: 'localhost', port: 6379 } // Use REDIS_URL for Render
});

// --- Multer Storage ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(`[Multer] Saving to destination: ${absoluteUploadPath}`);
        cb(null, absoluteUploadPath); // Use the resolved absolute path
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const newFilename = `${uniqueSuffix}-${file.originalname}`;
        console.log(`[Multer] Generated filename: ${newFilename}`);
        cb(null, newFilename);
    },
});

const multerUploadInstance = multer({ // Renamed
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed!"), false);
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 } // Example: 10MB limit
});

// --- Express App Setup ---
const app = express();
const PORT = process.env.PORT || 8000;

// CORS Configuration (from your provided code, seems good)
const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://ai-docify-ten.vercel.app'];
const vercelFrontendUrl = process.env.FRONTEND_URL;
if (vercelFrontendUrl) {
    allowedOrigins.push(vercelFrontendUrl);
    if (vercelFrontendUrl.endsWith('/')) {
        allowedOrigins.push(vercelFrontendUrl.slice(0, -1));
    } else {
        allowedOrigins.push(vercelFrontendUrl + '/');
    }
}
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.some(allowed => origin.startsWith(allowed))) { // Using startsWith for flexibility
            callback(null, true);
        } else {
            console.error(`CORS Error: Origin '${origin}' not allowed. Allowed: ${allowedOrigins.join(', ')}`);
            callback(new Error(`Origin '${origin}' not allowed by CORS`));
        }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
/* app.options('*', cors(corsOptions)); */ // Handle preflight requests

// --- Routes ---
app.get('/', (req, res) => {
    return res.json({ status: "Server is healthy and running.", uploadPath: absoluteUploadPath });
});

// File Upload Route with better error handling
app.post('/upload/pdf', (req, res) => {
    const uploader = multerUploadInstance.single('pdf');
    uploader(req, res, async function (err) { // made async
        if (err instanceof multer.MulterError) {
            console.error('[Server /upload/pdf] Multer error:', err);
            return res.status(400).json({ message: `File upload error: ${err.message} (Code: ${err.code})` });
        } else if (err) {
            console.error('[Server /upload/pdf] Unknown upload error:', err);
            return res.status(500).json({ message: `Upload error: ${err.message || "An unknown error occurred."}` });
        }

        if (!req.file) {
            console.error('[Server /upload/pdf] No file received.');
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        console.log(`[Server /upload/pdf] File successfully received by multer.
            Original Name: ${req.file.originalname}
            Filename on Disk: ${req.file.filename}
            Destination: ${req.file.destination}
            Full Path: ${req.file.path}
            Size: ${req.file.size}`);

        try {
            await fileUploadQueue.add('file-ready', JSON.stringify({
                filename: req.file.originalname,      // Original name for user display
                serverFileName: req.file.filename,    // Unique name on server disk
                path: req.file.path,                  // Full absolute path to the file
            }));
            console.log(`[Server /upload/pdf] Job added to queue for: ${req.file.filename}`);

            const responsePayload = {
                message: 'File uploaded successfully and queued for processing!',
                fileName: req.file.filename,
                fileUrl: `/uploads_ephemeral/${encodeURIComponent(req.file.filename)}` // For ephemeral preview
            };
            // IMPORTANT: This fileUrl is for ephemeral storage. If you don't use persistent disk,
            // this URL might not work reliably after a short time or server restart.
            console.log('[Server /upload/pdf] Sending response to client:', responsePayload);
            return res.json(responsePayload);

        } catch (queueError) {
            console.error('[Server /upload/pdf] Error adding job to queue:', queueError);
            // Potentially try to clean up the uploaded file if queueing fails
            fs.unlink(req.file.path, unlinkErr => {
                if (unlinkErr) console.error(`[Server /upload/pdf] Error deleting file after queue error: ${req.file.path}`, unlinkErr);
            });
            return res.status(500).json({ message: 'File uploaded but failed to queue for processing.' });
        }
    });
});

// Serve files from the upload path (this will be ephemeral on Render without persistent disk)
app.use('/uploads', express.static(absoluteUploadPath));
console.log(`[Server Setup] Serving static files from /uploads, mapped to ${absoluteUploadPath}`);

// Summarization Endpoint
app.get('/api/summarize', async (req, res) => {
    const { fileName } = req.query;
    console.log(`[Server /api/summarize] Request for: ${fileName}. Base upload path: ${absoluteUploadPath}`);

    if (!fileName || typeof fileName !== 'string') {
        return res.status(400).json({ message: "fileName query parameter is required and must be a string." });
    }

    const filePath = path.join(absoluteUploadPath, fileName);
    console.log(`[Server /api/summarize] Attempting to load PDF from path: ${filePath}`);

    // IMPORTANT: If not using persistent storage, this filePath points to an ephemeral location.
    // The file might not exist if the server restarted or if it was cleaned up after worker processing.
    // For a "no persistent file" strategy, you'd fetch pre-extracted text from Qdrant/DB here.

    try {
        if (!fs.existsSync(filePath)) {
            console.error(`[Server /api/summarize] File not found at ephemeral path: ${filePath}`);
            return res.status(404).json({ message: `PDF file not found on server: ${fileName}. It may have been processed and removed or the server may have restarted.` });
        }

        const loader = new PDFLoader(filePath);
        const docs = await loader.load();

        if (!docs || docs.length === 0) {
            console.error(`[Server /api/summarize] No content found in PDF: ${fileName} at ${filePath}`);
            return res.status(404).json({ message: `Could not load or find content in PDF: ${fileName}` });
        }

        const fullPdfText = docs.map(doc => doc.pageContent).join('\n\n');
        if (fullPdfText.trim().length === 0) {
            console.error(`[Server /api/summarize] Extracted text is empty for PDF: ${fileName}`);
            return res.status(400).json({ message: `Extracted text from PDF is empty: ${fileName}. Cannot summarize.` });
        }

        const SUMMARIZATION_PROMPT = `Kindly generate a concise and insightful summary of the following document. Highlight the core purpose and subject matter, the key insights or information it offers, its relevance and potential value to the reader, and its significance within its respective domain or field.\n\nDocument Text:\n---\n${fullPdfText}\n---\n\nConcise Summary:`;
        
        const summaryCompletion = await openAIClient.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: SUMMARIZATION_PROMPT }],
            temperature: 0.3,
            max_tokens: 500,
        });
        
        const summary = summaryCompletion.choices[0]?.message?.content?.trim();
        if (!summary) {
            console.error(`[Server /api/summarize] OpenAI did not return summary for ${fileName}.`);
            return res.status(500).json({ message: "Failed to generate summary: OpenAI returned no content." });
        }
        
        console.log(`[Server /api/summarize] Summary generated for ${fileName}.`);
        return res.json({ summary });

    } catch (error) {
        console.error(`[Server /api/summarize] Error for ${fileName} at ${filePath}:`, error);
        if (error.code === 'ENOENT') {
            return res.status(404).json({ message: `PDF file not found: ${fileName}. It might be an ephemeral file that's no longer available.` });
        }
        // ... (your existing OpenAI error handling) ...
        if (error.response && error.response.data) { /* ... */ }
        return res.status(500).json({ message: `Error generating summary: ${error.message}` });
    }
});

// Chat Endpoint
app.get('/chat', async (req, res) => {
    const userQuery = req.query.message;
    if (!userQuery) {
        return res.status(400).json({ message: "message query parameter is required." });
    }

    try {
        console.log(`[Server /chat] Received query: ${userQuery}`);
        const embeddings = new OpenAIEmbeddings({
            apiKey: process.env.OPENAI_API_KEY,
            modelName: "text-embedding-3-small"
        });

        const vectorStore = await QdrantVectorStore.fromExistingCollection(
            embeddings,
            {
                url: process.env.QDRANT_URL , // Use ENV VAR
                collectionName: 'Ai_Docs_main',
            }
        );
        
        const retriever = vectorStore.asRetriever({ k: 2 });
        const relevantDocs = await retriever.invoke(userQuery);
        console.log(`[Server /chat] Retrieved ${relevantDocs.length} relevant documents from Qdrant.`);

        const context = relevantDocs.map(doc => doc.pageContent).join("\n\n---\n\n");
        const SYSTEM_PROMPT = `You are a helpful assistant. Answer the user's query based on the provided context from a PDF document. Structure your answer clearly, using bullet points if helpful. If the context doesn't contain the answer, say so.
Context from PDF:
---
${context}
---`;

        const chatResult = await openAIClient.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userQuery },
            ],
            temperature: 0.5,
        });

        const messageContent = chatResult.choices[0]?.message?.content;
        if (!messageContent) {
             console.error('[Server /chat] OpenAI did not return message content for chat.');
             return res.status(500).json({ message: "Failed to get response from AI." });
        }
        
        console.log('[Server /chat] Sending chat response to client.');
        return res.json({
            message: messageContent,
            docs: relevantDocs, // For potential frontend display of sources
        });

    } catch (error) {
        console.error('[Server /chat] Error in chat endpoint:', error);
        if (error.name === 'QdrantError' || error.message?.includes('Qdrant')) { // Example
             return res.status(500).json({ message: `Error communicating with vector store: ${error.message}` });
        }
        return res.status(500).json({ message: `Chat error: ${error.message}` });
    }
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}.`);
    console.log(`Uploads will be handled at: ${absoluteUploadPath}`);
    console.log(`Expecting frontend at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`Qdrant URL configured to: ${process.env.QDRANT_URL }`);
    console.log(`Redis URL configured for BullMQ: ${process.env.REDIS_URL || 'localhost:6379'}`);
});