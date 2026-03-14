# 🚀 TalentOS - The AI-Powered Unified Recruitment Platform

**TalentOS** is a premium, blazing-fast, and deeply intelligent recruitment platform built for modern HR teams. Winning design aesthetics combined with powerful LLM integrations (Claude 3.5 Sonnet) makes evaluating candidates seamless.

---

## 🔥 Key Features

- **Semantic AI Search ("The Crown Jewel")**: Search 10,000+ candidates using plain English (e.g., *"Find me a Senior Python dev in Mumbai with Fintech experience"*). Claude automatically structures the query and ranks vectors.
- **Intelligent Resume Parsing**: Drag-and-drop PDFs. `pdf-parse` extracts raw details while Claude intelligently formats experience, education, strengths, and suggests interview questions.
- **Data Integrations Board**: 1-click ingest interfaces connecting Gmail, Outlook, LinkedIn exports, and direct HRMS API syncs (Greenhouse/Workday).
- **Kanban Pipeline**: Pure `@dnd-kit` powered drag-and-drop recruitment pipeline visually tracking candidate lifecycles.
- **Jaw-Dropping Aesthetics**: Pixel-perfect implementation of Apple Vision Pro glassmorphism elements, constrained exclusively to `#FF6B00` (Orange) and `#1C1C1E` (Dark Surface) palettes.

---

## 🏗 Architecture

```text
CLIENT (Vite + React)                       SERVER (Express.js)                        DATA & JOBS
-----------------------                      ---------------------                      ----------------
   [ Dashboard ]             REST / JSON        [ search.js ]   ---> Claude AI           [ Postgres db ]
   [ Candidates ]   <=======================>   [ candidates.js]                         with pgvector
   [ AI Search ]             (Axios)            [ upload.js ]   <--- pdf-parse
   [ Pipeline  ]                                                                         [ Redis cache ]
   [ Sources   ]                                [ emailService ] --> Gmail API             queue manager
```

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS v3 (Custom Utility Config), Recharts, Lucide Icons, `@dnd-kit/core`.
- **Backend**: Node.js 20, Express, `@anthropic-ai/sdk`, `multer`, `pdf-parse`.
- **Infrastructure**: Docker Compose, PostgreSQL (pgvector extension ready), Redis Alpine.

---

## 🚀 Setup Instructions (Docker)

To run the full stack locally with simulated AI responses:

```bash
# 1. Clone & Enter Directory
cd talentos

# 2. Configure Environment (Optional: add your real Anthropic Key inside)
cp .env.example .env

# 3. Build & Run
docker-compose up --build
```

**Services automatically run at:**
- 🖥 **Frontend App**: [http://localhost:3000](http://localhost:3000)
- 🔌 **Backend API**: [http://localhost:5000](http://localhost:5000)

_Note: If Docker is unavailable, you can manually run `npm install && npm run dev` inside both `/client` and `/server` folders natively._

---

## 🔑 Available API Documentation

| Endpoint                  | Method | Description                                                |
| ------------------------- | :----: | ---------------------------------------------------------- |
| `/api/candidates`         | `GET`  | Fetches paginated DB candidate pool                        |
| `/api/search/natural`     | `POST` | Primary logic pinging Anthropic semantic search            |
| `/api/upload/resume`      | `POST` | `multipart/form-data` ingest executing `pdf-parse`         |
| `/api/upload/bulk`        | `POST` | Max 10 attached resumes parsed sequentially in memory      |

---

**Built with ✨ for the Hackathon.**
