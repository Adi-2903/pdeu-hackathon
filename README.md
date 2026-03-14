# 🚀 TalentOS - The AI-Powered Unified Recruitment Platform

**TalentOS** is a premium, blazing-fast, and deeply intelligent recruitment platform built for modern HR teams. Winning design aesthetics combined with powerful local AI integrations (using `@xenova/transformers`) makes evaluating candidates seamless, even without external API keys.

---

## 🔥 Key Features (No-API Required)

- **Semantic AI Search ("Local Intelligence")**: Search 10,000+ candidates using conceptual similarity (e.g., *"Frontend experts"*). Powered by a local **all-MiniLM-L6-v2** vector engine.
- **Instant Resume Generation**: Generate professional, print-ready HTML resumes for candidates with a single click.
- **ATS Match Scoring**: Automatically calculate how well a candidate fits a job description using local keyword and skill matching algorithms.
- **Intelligent Deduplication**: Multi-stage candidate matching using exact field checks and local vector similarity. Flag potential matches for manual review via the dedicated "Duplicates" dashboard.
- **Kanban Pipeline**: Pure `@dnd-kit` powered drag-and-drop recruitment pipeline visually tracking candidate lifecycles.
- **Jaw-Dropping Aesthetics**: Pixel-perfect implementation of glassmorphism elements, constrained exclusively to `#FF6B00` (Orange) and `#1C1C1E` (Dark Surface) palettes.

---

## 🏗 Architecture

```text
CLIENT (Vite + React)                       SERVER (Express.js)                        DATA & JOBS
-----------------------                      ---------------------                      ----------------
   [ Dashboard ]             REST / JSON        [ search.js ]   ---> Local Transformers  [ JSON DB ]
   [ Candidates ]   <=======================>   [ candidates.js]                         with Embeddings
   [ AI Search ]             (Axios)            [ resumeGen.js ]
   [ Pipeline  ]                                                                         [ data.json ]
   [ Sources   ]                                [ aiSimulator.js ]                       local storage
```

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS v3, Recharts, Lucide Icons, `@dnd-kit/core`.
- **Backend**: Node.js 20+, Express, `@xenova/transformers`, `puppeteer`, `sharp`.

---

## 🚀 Native Setup (Recommended)

To run the platform natively on your machine:

### 1. Backend Setup
```bash
cd server
npm install --ignore-scripts
# Critical: Explicitly install sharp for local vector engine support
npm install sharp 
node server.js
```
*Backend runs at: [http://localhost:5000](http://localhost:5000)*

### 2. Frontend Setup
```bash
cd client
npm install --ignore-scripts
npm run dev -- --port 3000
```
*Frontend runs at: [http://localhost:3000](http://localhost:3000)*

---

## 🔑 AI Features Initialization

To enable Semantic Search on your local data:
1. Ensure the server is running.
2. Trigger the local indexing:
   ```bash
   curl -X POST http://localhost:5000/api/v1/candidates/index
   ```
This will generate embeddings using the local transformer model and save them to `data.json`.

---

## 🛠 Troubleshooting

- **Sharp Module Error**: If the backend crashes with a "sharp" error, run `npm install sharp` in the `/server` directory. This is required for the `@xenova/transformers` library to function on Windows/Linux environments.
- **Port Conflicts**: Ensure ports `3000` and `5000` are free.

---

**Built with ✨ for the Hackathon.**
