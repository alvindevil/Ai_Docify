import { Worker } from 'bullmq';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';




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
        apiKey: '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',
        modelName: "text-embedding-3-small"
        });

        const vectorStore = await QdrantVectorStore.fromExistingCollection(
            embeddings,
            {
                url: 'http://localhost:6333',
                collectionName: 'Ai_Docs',
            }
        );
        await vectorStore.addDocuments(docs); //store the chunks in qdrant db
        console.log('Documents added to Qdrant:', docs.length);
    },
    { 
    concurrency: 100, 
    connection: {
        host: 'localhost',
        port: '6379'
        }
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



