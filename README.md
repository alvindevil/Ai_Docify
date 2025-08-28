# AiDocify

**AI-powered PDF Summarizer & Q\&A — (MERN + OpenAI + Qdrant)**

> *Status:* **Working locally** (full backend + vector DB run locally). Frontend-only deployed link will be provided in the repo if needed — backend calls requiring API keys are disabled in any public deployment due to API cost/security. A short working video of the local app is included in this repo as proof of functionality.

---

## Table of Contents

1. Project overview
2. Why local-only deployment (honest note)
3. Key features
4. Tech stack
5. Architecture (conceptual)
6. Prerequisites
7. Repo structure
8. Environment variables (.env example)
9. Installation & run (local)
10. How to create the demo video and include it in README
11. Endpoints & usage
12. Embeddings & Qdrant notes
13. Limitations & known issues
14. Roadmap / Future improvements
15. Contribution guide
16. License & credits
17. Contact

---

## 1. Project overview

AiDocify is a student-focused tool that accepts PDF uploads, extracts text, creates embeddings for retrievable sections, and uses a large language model for:

* concise summaries
* lecture-style notes
* assignment-ready writeups
* chat-style Q\&A grounded in the uploaded document

This repo contains the working local implementation (frontend, backend, local Qdrant for vectors). To verify functionality, a recorded video showing the full flow (upload → extract → embed → summarize / chat) is included and linked in this README.

---

## 2. Why local-only deployment (honest note)

I intended to deploy a public full-stack version but ran into two practical blockers:

* **API cost & rate limits** for OpenAI (or similar) made hosting a live backend expensive.
* **Security**: exposing API keys or paying for a hosted inference layer wasn't feasible for this iteration.

To be transparent: the deployed link (if present) will only include the **frontend** and mock data; the full backend + vector DB remains runnable locally. The GitHub repo includes a demonstration video (proof-of-work) of the full local setup.

---

## 3. Key features

* PDF upload (drag & drop or file selector)
* Text extraction from PDFs (chunked for better embeddings)
* Embedding generation using OpenAI / compatible model
* Vector storage & search with Qdrant
* Retrieval-Augmented Generation (RAG) flow for grounded answers
* Multiple output modes: summary, notes, assignment-ready draft, Q\&A chat
* Optional user history (stores metadata only)

---

## 4. Tech stack

* **Frontend:** React, TailwindCSS
* **Backend:** Node.js, Express
* **Database (metadata):** MongoDB (optional)
* **Vector DB:** Qdrant (local in this repo; Qdrant Cloud recommended for production)
* **Embeddings / LLM:** OpenAI (or any provider) — abstracted via a service layer
* **File storage:** Local `uploads/` for the demo; production should use S3 / Google Cloud Storage

---

## 5. Architecture (conceptual)

```
[User Browser] --(upload)--> [Frontend React]
      ↳ (POST /api/upload)                      
                     [Express Backend] --extract--> [Text Chunks]
                                      --embed--> [OpenAI Embedding API]
                                      --upsert--> [Qdrant (vector DB)]
                                      --store--> [MongoDB metadata]

Query flow: Frontend -> Backend -> Qdrant (retrieve vectors) -> OpenAI / LLM (generate answer)
```

Notes:

* For local demo, Qdrant runs on `localhost:6333` (Docker or binary).
* For cloud production, use `Qdrant Cloud` or self-host Qdrant behind HTTPS.

---

## 6. Prerequisites

* Node.js (>=16)
* npm or yarn
* Docker (if you want to run Qdrant via Docker)
* MongoDB (optional; used for metadata/user history)
* OpenAI API key (or other provider API key) — **required to run embeddings/LLM** locally

---

## 7. Repo structure (suggested)

```
/aiddocify
├─ /backend
│  ├─ src/
│  ├─ routes/
│  ├─ services/
│  ├─ uploads/       # local PDF storage for demo
│  └─ package.json
├─ /frontend
│  ├─ src/
│  └─ package.json
├─ docker-compose.yml  # optional: qdrant + mongo
├─ demo.mp4            # working video proof
└─ README.md
```

---

## 8. Environment variables (.env example)

Create `.env` files in `backend/` and `frontend/` as needed.

**backend/.env**

```
PORT=8080
MONGO_URI=mongodb://localhost:27017/aiddocify
OPENAI_API_KEY=sk-xxxxx
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=        # optional if using Qdrant Cloud
S3_BUCKET_NAME=        # optional for cloud storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

**frontend/.env** (for local testing; do not commit keys)

```
REACT_APP_API_URL=http://localhost:8080
```

**Security reminder:** Never commit `.env` with real API keys. Use Git ignore.

---

## 9. Installation & run (local)

### 9.1 Start Qdrant (recommended via Docker)

```
# Quick run
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant

# OR use docker-compose (if provided)
docker-compose up -d
```

### 9.2 Backend

```
cd backend
npm install
# create .env with required keys
npm run dev
```

By default the backend will listen at `http://localhost:8080`.

### 9.3 Frontend

```
cd frontend
npm install
npm start
```

Open `http://localhost:3000` and test the flows.

---

## 10. How to create the demo video and include it in README

1. Use screen recorder (OBS Studio / ShareX / Loom) and record these steps: start backend, start qdrant, upload sample pdf, show embed/upsert logs, run query, show final AI result.
2. Keep the video 1–3 minutes long and highlight the exact flows.
3. Save the video to the repo root as `demo.mp4` or upload to YouTube and link it.

Add to README (example):

```markdown
### Demo
- Local working demo (recorded):

![AiDocify Demo](./demo.mp4)

Or watch on YouTube: [Working demo](https://youtu.be/yourvideo)
```

Note: GitHub will not autoplay large videos; hosting on YouTube or an external CDN is often better if the file is big.

---

## 11. Endpoints & usage (example)

> Adjust names to your actual routes.

**POST** `/api/upload` — `multipart/form-data` — Upload PDF

* Body: `file` (pdf)
* Response: `{ fileId, status }`

**POST** `/api/embed/:fileId` — Fire embedding + upsert to Qdrant

* Triggers extraction, chunking, embedding, and upsert

**POST** `/api/query` — Ask a question against uploaded file(s)

* Body: `{ query: string, fileIds: [id] }`
* Response: \`{ answer: string, sources: \[{fileId, chunkId, score}] }

**GET** `/api/history/:userId` — optional: list uploaded files metadata

---

## 12. Embeddings & Qdrant notes

* The preferred flow is: chunk text → embed each chunk → upsert vectors with `payload` containing `{fileUrl, page, chunkIndex, textSnippet}`.
* For local demo we store PDFs in `backend/uploads/` and put `fileUrl` as `http://localhost:8080/uploads/<file.pdf>` in payload.
* In production: store PDFs in S3 and put S3 URL in payload (so workers can fetch raw file if needed).
* Qdrant Cloud is recommended in production to avoid self-hosting complexity and get TLS + managed backups.

---

## 13. Limitations & known issues

* **No public backend hosting**: The public link (if present) will not expose endpoints requiring real API keys. This repo provides a **local** fully working demo and a recorded video as proof.
* **API cost**: OpenAI (LLM + embeddings) is the main recurring cost — be explicit in the README about why there's no hosted backend.
* **Qdrant in repo**: Local Qdrant is included for demo, but running it on a free hosted platform requires migration to Qdrant Cloud.
* **Scaling**: The current design is suitable for prototypes. For production, add batching, rate limiting, job queues (Bull / RabbitMQ), and worker scaling for embedding generation.

---

## 14. Roadmap / Future improvements

* Provide a deployable Helm chart / Docker Compose for full cloud deployment (Qdrant + backend + Mongo + S3)
* Migrate file storage to S3 and add signed URLs for secure downloads
* Add serverless workers for embedding to reduce costs (pay-per-use)
* Add user auth + quotas & billing to support paid usage and cover API costs
* Integrate Qdrant Cloud for managed vector storage
* Add automated tests & CI (GitHub Actions) to run integration tests with mocked LLM responses

---

## 15. Contribution guide

* Fork the repo → create a feature branch → open PR with description and demo steps
* For code changes that touch embeddings / LLM calls, provide mock/stub flows for CI so tests don't leak API keys
* Keep `.env.example` updated with required variables

---

## 16. License & credits

* License: **MIT** (or choose a license you prefer)
* Credits: Built by *\[Your Name]*. Uses OpenAI API, Qdrant, React, Node.js, TailwindCSS

---

## 17. Contact

If you want to test locally or need help running the demo, open an issue or contact me at: `yadavs47334@gmail.com`.

---

## Appendix: Quick .env.example (copy into backend/.env)

```
PORT=8080
MONGO_URI=mongodb://localhost:27017/aiddocify
OPENAI_API_KEY=sk-REPLACE_ME
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=
```

---

**Thanks for checking out AiDocify — the working demo you can see below , and on the deployed website also .**

