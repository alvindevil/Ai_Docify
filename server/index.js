import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue, Worker } from 'bullmq';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { QdrantClient } from '@qdrant/js-client-rest';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import axios from 'axios';

dotenv.config();

// --- SERVICE AND CLIENT CONFIGURATION ---

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const openAIClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const redisConnection = process.env.REDIS_URL || { host: 'localhost', port: 6379 };
const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';
const qdrantCollectionName = 'ai_docs';

// --- BULLMQ QUEUE DEFINITION (FIX: Ensure this is defined before it's used) ---
console.log('[Server Setup] Initializing BullMQ file upload queue...');
const fileUploadQueue = new Queue('file-upload-queue', { connection: redisConnection });
console.log('[Server Setup] BullMQ queue initialized.');


// --- BULLMQ WORKER SETUP ---

const worker = new Worker('file-upload-queue', async job => {
    const { cloudinaryUrl, originalName, publicId } = job.data;
    console.log(`[Worker] Processing job for: ${originalName} (Public ID: ${publicId})`);
    
    // Create a temporary local path, replacing slashes in publicId to avoid subdir issues on some OS
    const tempFilePath = path.join(os.tmpdir(), publicId.replace(/[\/\\]/g, '_'));

    try {
        await fs.mkdir(path.dirname(tempFilePath), { recursive: true });
        
        console.log(`[Worker] Downloading from Cloudinary URL: ${cloudinaryUrl}`);
        const response = await axios.get(cloudinaryUrl, { responseType: 'arraybuffer' });
        await fs.writeFile(tempFilePath, Buffer.from(response.data));
        console.log(`[Worker] File downloaded to temporary path: ${tempFilePath}`);

        const loader = new PDFLoader(tempFilePath);
        const docs = await loader.load();
        if (!docs || docs.length === 0) throw new Error(`No content extracted from PDF: ${originalName}`);

        const documentsWithMetadata = docs.map(doc => {
            doc.metadata = { ...doc.metadata, source: publicId, original_filename: originalName };
            return doc;
        });

        const qdrantClient = new QdrantClient({ url: qdrantUrl });
        
        const collections = await qdrantClient.getCollections();
        const collectionExists = collections.collections.some(c => c.name === qdrantCollectionName);
        if (!collectionExists) {
            await qdrantClient.createCollection(qdrantCollectionName, { vectors: { size: 1536, distance: 'Cosine' } });
            console.log(`[Worker] Created Qdrant collection: ${qdrantCollectionName}`);
            
            // Also ensure index exists for the new collection
            await qdrantClient.createPayloadIndex(qdrantCollectionName, { field_name: 'source', field_schema: 'keyword' });
            console.log("[Worker] Payload index for 'source' field created.");
        }
        
        const embeddings = new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY });
        await QdrantVectorStore.fromDocuments(documentsWithMetadata, embeddings, { client: qdrantClient, collectionName: qdrantCollectionName });
        console.log(`[Worker] Successfully stored embeddings for: ${originalName}`);

    } catch (error) {
        console.error(`[Worker] Error processing job for ${originalName}:`, error);
        throw error;
    } finally {
        try {
            await fs.unlink(tempFilePath);
            console.log(`[Worker] Cleaned up temporary file: ${tempFilePath}`);
        } catch (cleanupError) {
            if (cleanupError.code !== 'ENOENT') {
                console.error(`[Worker] Error cleaning up temp file ${tempFilePath}:`, cleanupError);
            }
        }
    }
}, { connection: redisConnection, concurrency: 5 });

worker.on('completed', job => { console.log(`[Worker] Job ${job.id} for ${job.data.originalName} completed.`); });
worker.on('failed', (job, err) => { console.error(`[Worker] Job ${job.id} for ${job.data.originalName} failed: ${err.message}`); });

// --- EXPRESS APP SETUP ---

const app = express();
const PORT = process.env.PORT || 8000;
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000', process.env.FRONTEND_URL].filter(Boolean);
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
};
app.use(cors(corsOptions));
/* app.options('*', cors(corsOptions)); */ 

// --- API ROUTES ---

app.get('/', (req, res) => res.json({ status: "Server is healthy." }));

app.post('/upload/pdf', upload.single('pdf'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
    
    console.log(`[Server /upload/pdf] Received file: ${req.file.originalname}, size: ${req.file.size} bytes`);

    const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'raw', folder: 'pdfs' },
        async (error, result) => {
            if (error) {
                console.error('[Cloudinary] Upload failed:', error);
                return res.status(500).json({ message: 'Failed to upload file to cloud storage.' });
            }
            
            console.log(`[Cloudinary] File uploaded. Public ID: ${result.public_id}. Adding job to queue...`);
            
            await fileUploadQueue.add('file-ready', { 
                cloudinaryUrl: result.secure_url, 
                originalName: req.file.originalname, 
                publicId: result.public_id 
            });

            res.json({
                message: 'File uploaded and queued for processing!',
                fileName: req.file.originalname,
                publicId: result.public_id,
                fileUrl: result.secure_url
            });
        }
    );
    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
});

// ... (Rest of your API routes: /api/summarize, /api/get-pdf-preview-url, /chat) ...
// The helper function and routes from the last update are still good.

// Helper function to get document text from Qdrant
async function getFullTextFromQdrant(publicId) {
    const embeddings = new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY });
    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, { url: qdrantUrl, collectionName: qdrantCollectionName });
    
    const documentChunks = await vectorStore.similaritySearch(" ", 1000, { 
        filter: { must: [{ key: 'source', match: { value: publicId } }] } 
    });
    
    if (!documentChunks || documentChunks.length === 0) throw new Error(`No text chunks found in Qdrant for document ID: ${publicId}`);
    
    documentChunks.sort((a, b) => (a.metadata.page || 0) - (b.metadata.page || 0));
    return documentChunks.map(doc => doc.pageContent).join("\n\n");
}

app.get('/api/summarize', async (req, res) => {
    const { publicId } = req.query;
    if (!publicId) return res.status(400).json({ message: "publicId query parameter is required." });

    try {
        const fullPdfText = await getFullTextFromQdrant(publicId);
        const prompt = `Kindly generate a concise summary of the following document text.`;
        const completion = await openAIClient.chat.completions.create({ messages: [{ role: 'system', content: prompt }, { role: 'user', content: fullPdfText }], model: 'gpt-3.5-turbo' });
        res.json({ summary: completion.choices[0].message.content });
    } catch (error) {
        console.error(`[Server /summarize] Error:`, error);
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/get-pdf-preview-url', (req, res) => {
    const { publicId } = req.query;
    if (!publicId) return res.status(400).json({ message: 'A valid document publicId is required.' });
    try {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        if (!cloudName) throw new Error("Cloudinary cloud_name not configured.");
        const finalPreviewUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/fl_inline/${publicId}`;
        res.json({ previewUrl: finalPreviewUrl });
    } catch (error) {
        console.error(`[Server] Error generating preview URL for ${publicId}:`, error);
        res.status(500).json({ message: 'Failed to generate preview URL.' });
    }
});

app.get('/chat', async (req, res) => {
    const { message, publicId } = req.query;
    if (!message || !publicId) return res.status(400).json({ message: "message and publicId are required." });

    try {
        const embeddings = new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY });
        const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, { url: qdrantUrl, collectionName: qdrantCollectionName });
        const retriever = vectorStore.asRetriever({ k: 4, filter: { must: [{ key: 'source', match: { value: publicId } }] } });
        const relevantDocs = await retriever.invoke(message);
        const context = relevantDocs.map(doc => doc.pageContent).join("\n\n---\n\n");
        const prompt = `You are a helpful assistant. Answer the user's query based on the provided context from a PDF document. If the context doesn't contain the answer, say so. Context:\n---\n${context}`;
        const completion = await openAIClient.chat.completions.create({ messages: [{ role: 'system', content: prompt }, { role: 'user', content: message }], model: 'gpt-3.5-turbo' });
        res.json({ message: completion.choices[0].message.content, docs: relevantDocs });
    } catch (error) {
        console.error(`[Server /chat] Error:`, error);
        res.status(500).json({ message: `Chat error: ${error.message}` });
    }
});


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}.`);
});