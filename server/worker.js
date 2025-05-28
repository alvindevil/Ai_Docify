import { Worker } from 'bullmq';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
/* import { CharacterTextSplitter } from "@langchain/textsplitters"; */
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import dotenv from 'dotenv'; 

dotenv.config();



const worker = new Worker(
    'file-upload-queue', 
    async job => {
        console.log('Processing job:', job.data);
        const data = JSON.parse(job.data);

        /*
        Path:  data.path
        read the pdf from path,
        chunk the pdf,
        call the openai embedding model for every chunk,
        store the chunk in qdrant db
        */
       

       const loader = new PDFLoader(data.path); //Load the pdf 
       const docs = await loader.load();
       
       const embeddings = new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: "text-embedding-3-small"
        });

        const vectorStore = await QdrantVectorStore.fromExistingCollection(
            embeddings,
            {
                url: process.env.QDRANT_URL || 'http://localhost:6333',
                collectionName: 'Ai_Docs',
            }
        );
        await vectorStore.addDocuments(docs); //store the chunks in qdrant db
        console.log('Documents added to Qdrant:', docs.length);
    },
    { 
    concurrency: 100, 
    connection: process.env.REDIS_URL || { host: 'localhost', port: 6379 }
    }
);


//use this code when need text splitter or texts wordswise
       /* const textSplitter = new CharacterTextSplitter({
        separator: "\n\n",
        chunkSize: 300,
        chunkOverlap: 20, 
      });
      const texts = await textSplitter.splitText(docs);
      console.log('texts:', texts); */



