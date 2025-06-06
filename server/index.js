import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue, Worker } from 'bullmq';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import fetch from 'node-fetch';

dotenv.config();

// --- PATH AND DIRECTORY SETUP ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(`[Server Startup] Script directory: ${__dirname}`);

const ephemeralTempPath = path.join(__dirname, 'uploads_temp_ephemeral');
if (!fs.existsSync(ephemeralTempPath)) {
    fs.mkdirSync(ephemeralTempPath, { recursive: true });
    console.log(`[Server Startup] Ephemeral temp directory created at: ${ephemeralTempPath}`);
}

// --- CLOUDINARY CONFIG ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});
console.log('[Server Startup] Cloudinary configured.');

// --- OPENAI CLIENT ---
const openAIClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// --- BULLMQ QUEUE & WORKER CONFIG ---
const queueName = 'file-upload-queue';
const redisConnection = process.env.REDIS_URL || {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD || undefined,
};
console.log(`[Server Startup] BullMQ connecting to Redis: ${process.env.REDIS_URL ? 'via URL' : 'via Host/Port'}`);

const fileUploadQueue = new Queue(queueName, { connection: redisConnection });
console.log(`[Server Startup] BullMQ Queue '${queueName}' initialized.`);

// --- INTEGRATED BULLMQ WORKER ---
console.log('[Server Startup] Initializing integrated BullMQ Worker...');
const worker = new Worker(queueName, async (job) => {
    const { cloudinaryPublicId, cloudinarySecureUrl, originalFileName } = job.data;
    console.log(`[Worker] Processing job ${job.id} for: ${originalFileName} (${cloudinaryPublicId})`);
    let tempFilePathWorker = null;
    try {
        const urlToFetch = cloudinarySecureUrl || cloudinary.url(cloudinaryPublicId, { resource_type: "raw" });
        const response = await fetch(urlToFetch);
        if (!response.ok) throw new Error(`Download failed (${response.status})`);
        const pdfBuffer = await response.arrayBuffer();
        const safeOriginalFileName = originalFileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        tempFilePathWorker = path.join(ephemeralTempPath, `${Date.now()}-worker-${safeOriginalFileName}`);
        await fs.promises.writeFile(tempFilePathWorker, Buffer.from(pdfBuffer));

        const loader = new PDFLoader(tempFilePathWorker);
        const docs = await loader.load();
        if (!docs?.length) {
            console.warn(`[Worker] No content from PDF: ${originalFileName}. Skipping Qdrant.`);
            return;
        }
        
        const docsWithMetadata = docs.map((doc, index) => ({
            ...doc,
            metadata: { ...(doc.metadata || {}), source: cloudinaryPublicId, originalFileName, pageNumber: doc.metadata?.loc?.pageNumber || index + 1 }
        }));

        const embeddings = new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY, modelName: "text-embedding-3-small" });
        await QdrantVectorStore.fromDocuments(docsWithMetadata, embeddings, {
            url: process.env.QDRANT_URL || 'http://localhost:6333',
            collectionName: 'Ai_Docs',
        });
        console.log(`[Worker] Job ${job.id}: Docs from ${originalFileName} added to Qdrant.`);
    } catch (error) {
        console.error(`[Worker] Error processing job ${job.id} for ${originalFileName}:`, error);
        throw error;
    } finally {
        if (tempFilePathWorker) {
            try { await fs.promises.unlink(tempFilePathWorker); }
            catch (e) { console.error(`[Worker] Error deleting temp file ${tempFilePathWorker}:`, e); }
        }
    }
}, { connection: redisConnection, concurrency: 2 });
worker.on('completed', job => console.log(`[Worker Event] Job ${job.id} completed.`));
worker.on('failed', (job, err) => console.error(`[Worker Event] Job ${job?.id} failed: ${err.message}`));
console.log('[Server Startup] BullMQ Worker initialized and listening.');

// --- EXPRESS APP SETUP ---
const app = express();
const PORT = process.env.PORT || 8000;

// CORS
const feUrl = process.env.FRONTEND_URL;
const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
if (feUrl) {
    allowedOrigins.push(feUrl.replace(/\/$/, ''));
}
console.log('[Server Startup] Allowed CORS origins:', allowedOrigins);
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Origin '${origin}' not allowed by CORS`));
        }
    },
    credentials: true,
};
app.use(cors(corsOptions));
/* app.options('*', cors(corsOptions)); */

// --- ROUTES START ---
console.log('[Server Setup] Defining routes...');

app.get('/', (req, res) => res.json({ status: "Healthy" }));

const multerUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });
app.post('/upload/pdf', multerUpload.single('pdf'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file provided.' });
    try {
        const safeName = req.file.originalname.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9-_]/g, '_');

        // --- THIS IS THE CORRECTED UPLOAD LOGIC ---
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    resource_type: "raw",
                    // Use the 'folder' option to specify the directory
                    folder: "ai_docify_pdfs", 
                    // Provide just the desired filename part for public_id
                    public_id: `${Date.now()}-${safeName}`,
                }, 
                (err, res) => {
                    if (err) {
                        console.error("Cloudinary upload error:", err);
                        return reject(err);
                    }
                    resolve(res);
                }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
        // --- END OF CORRECTION ---

        if (!result) throw new Error("Cloudinary upload failed to return a result.");
        
        // result.public_id will now correctly be "ai_docify_pdfs/your-file-name"
        console.log(`[API /upload/pdf] File uploaded to Cloudinary. Public ID: ${result.public_id}`);

        await fileUploadQueue.add('process-pdf', { cloudinaryPublicId: result.public_id, cloudinarySecureUrl: result.secure_url, originalFileName: req.file.originalname });
        res.json({ message: 'File queued for processing!', fileName: result.public_id });
    } catch (error) {
        console.error('[API /upload/pdf] Error:', error);
        res.status(500).json({ message: 'Failed to upload file.' });
    }
});

app.get('/api/get-pdf-preview-url', (req, res) => {
    const { publicId } = req.query;
    if (!publicId || typeof publicId !== 'string') return res.status(400).json({ message: "Query 'publicId' is required." });
    try {
        // This will now work because the publicId from the frontend includes the folder path
        const fileUrl = cloudinary.url(publicId, { resource_type: "raw" });
        res.json({ previewUrl: fileUrl });
    } catch (error) {
        res.status(500).json({ message: 'Error generating preview URL.' });
    }
});

app.get('/chat', async (req, res) => {
    const { message, pdfId } = req.query;
    if (!message) return res.status(400).json({ message: "Query 'message' required." });
    try {
        const embeddings = new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY });
        const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, { url: process.env.QDRANT_URL || 'http://localhost:6333', collectionName: 'Ai_Docs' });
        
        // This filter is now critical for getting context from the correct PDF
        const filter = pdfId ? { must: [{ key: "metadata.source", match: { value: pdfId } }] } : undefined;
        
        const retriever = vectorStore.asRetriever({ k: 4, filter });
        const relevantDocs = await retriever.invoke(message);

        if (!relevantDocs.length) return res.json({ message: "I couldn't find information about that in the selected document.", docs: [] });

        const context = relevantDocs.map(doc => doc.pageContent).join("\n---\n");
        const prompt = `You are a helpful AI assistant. Answer the user's question based *only* on the following context from a PDF. If the answer is not in the context, say so.\n\nContext:\n${context}\n\nUser Question: ${message}\n\nAnswer:`;
        
        const completion = await openAIClient.chat.completions.create({ model: 'gpt-3.5-turbo', messages: [{ role: 'system', content: prompt }] });
        res.json({ message: completion.choices[0].message.content, docs: relevantDocs });
    } catch (error) {
        console.error('[API /chat] Error:', error);
        res.status(500).json({ message: 'Failed to get chat response.' });
    }
});

// --- ROUTES END ---
console.log('[Server Setup] Routes defined successfully.');

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`[Server Startup] Express server started on port ${PORT}.`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('[Process Shutdown] SIGINT received. Closing worker...');
    await worker.close();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('[Process Shutdown] SIGTERM received. Closing worker...');
    await worker.close();
    process.exit(0);
});