import express from 'express';
import cors from 'cors';
import multer from 'multer';
import {Queue} from 'bullmq';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import {OpenAI} from 'openai';



console.log('OpenAI API Key:', process.env.OPENAI_API_KEY);
const client = new OpenAI({
  apiKey : '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'
});


const queue = new Queue('file-upload-queue', {
  connection: {
    host: 'localhost',
    port: 6379
  }
});


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  });



const upload = multer({ storage: storage })

const app = express()

app.use(cors());

app.get('/', (req,res)=>{
    return res.json({status: "All Good"})
})

app.post('/upload/pdf',upload.single('pdf'), (req,res)=>{
  queue.add('file-ready', JSON.stringify({
    filename : req.file.originalname,
    source: req.file.destination,
    path: req.file.path 
  }))
    return res.json({message: 'File uploaded'});
});



app.get ('/chat', async  (req,res)=>{
  const userQuery = req.query.message;
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
  const ret = vectorStore.asRetriever({
    k: 2,
  });
  const result = await ret.invoke(userQuery);
  
  const SYSTEM_PROMPT =
  `You are a helpful assistant who answers the query based on the available context from PDF File and always try to answer point to point  ".
  Context:  ${JSON.stringify(result )}
  `;

  const chatResult = await client.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role : 'system' , content : SYSTEM_PROMPT },
      { role : 'user' , content : userQuery },
    ],
});
  
  return res.json({
    message: chatResult.choices[0].message.content,
    docs: result,
  });

});



app.listen (8000, ()=>{
    console.log('Server started on port 8000');
})