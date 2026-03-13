# TalentOS — AI-Powered Unified Recruitment Platform

> **One platform. All sources. AI doing the heavy lifting.**

TalentOS eliminates the chaos of modern recruiting — no more downloading resumes from emails, copying data into spreadsheets, or juggling 5 different platforms. Everything lives in one beautifully designed, AI-augmented workspace.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                     TalentOS                          │
├─────────────────────┬────────────────────────────────┤
│     React + Vite    │      Express + SQLite          │
│     (Frontend)      │       (Backend API)            │
│                     │                                │
│  • Dashboard        │  • REST API /api/v1/           │
│  • Candidates       │  • Candidate CRUD              │
│  • Jobs + Kanban    │  • Job Pipeline Management     │
│  • AI Search        │  • NL Search Parser            │
│  • Analytics/D&I    │  • AI Simulation Layer         │
│  • Recruiter Copilot│  • SQLite w/ 15+ tables        │
│  • Command Palette  │  • 55 seeded candidates        │
│  • Talent Radar     │  • 6 seeded jobs               │
└─────────────────────┴────────────────────────────────┘
```

## ⚡ Tech Stack & Justification

| Layer | Choice | Why |
|-------|--------|-----|
| **Frontend** | React 18 + Vite | Fastest DX, ESM-native HMR, tiny bundle. React 18's concurrent features enable smooth Kanban drag-and-drop and chart rendering without jank. |
| **Routing** | React Router v6 | Industry standard, nested routes, client-side navigation with zero page reloads. |
| **Charts** | Chart.js + react-chartjs-2 | Lightweight (60KB vs 200KB+ for alternatives), supports radar/doughnut/bar charts needed for Talent Radar and analytics. |
| **Backend** | Express.js | Same language as frontend (JS ecosystem), minimal boilerplate, huge middleware ecosystem, fastest time to working API. |
| **Database** | SQLite (better-sqlite3) | **Zero configuration** — no database server to install, single file, synchronous API (10x faster than async for reads), perfect for hackathon demo and small-to-medium deployments. |
| **AI Layer** | Simulated (structured mocks) | Deterministic, no API keys needed, responses mirror real GPT-4o output format. Drop-in replacement with real API — just swap the AI route handler. |
| **Styling** | Vanilla CSS | Full control over glassmorphism effects, dark theme, and animations. No framework overhead. |
| **Containerization** | Docker Compose | Single `docker-compose up` to run everything. |

### Why not other choices?

- **Not Next.js**: SSR is unnecessary for a recruitment dashboard (it's behind auth). Vite's DX is faster.
- **Not PostgreSQL/MySQL**: Requires running a database server. SQLite is zero-config and the schema is trivially migratable.
- **Not Tailwind**: For this level of custom glassmorphism and animation, vanilla CSS gives more control with less fighting the framework.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm

### Local Development

```bash
# 1. Clone and install
cd LAST\ COMMIT

# 2. Install server dependencies and seed database
cd server
npm install
npm run seed

# 3. Start the API server
npm start
# Server runs on http://localhost:3001

# 4. In another terminal, install and start the client
cd client
npm install
npm run dev
# Client runs on http://localhost:5173
```

### Docker (One Command)

```bash
docker-compose up --build
# Frontend: http://localhost:5173
# API: http://localhost:3001
```

---

## 📦 Feature Inventory

### Core Features
- ✅ Multi-source candidate ingestion (Upload, Email, LinkedIn, Referral, HRMS)
- ✅ AI resume parser with structured field extraction and confidence scores
- ✅ Unified candidate database with rich profile pages
- ✅ Pipeline management with drag-and-drop Kanban boards
- ✅ Natural language AI search with ranked results and match explanations
- ✅ AI candidate scoring against job descriptions
- ✅ Candidate comparison

### Unique AI Features
- ✅ **Talent Radar** — Spider chart mapping 6 skill axes
- ✅ **Ghost Detector** — Flags candidates who went silent, auto-drafts re-engagement emails
- ✅ **Passive Talent Pool** — AI resurfaces past candidates for new jobs
- ✅ **Interview Brief Generator** — One-click structured interview prep
- ✅ **Salary Predictor** — Market salary ranges by skills, experience, location
- ✅ **Culture Fit Analyzer** — Scores candidates against company values
- ✅ **Candidate Journey Timeline** — Visual timeline of every touchpoint
- ✅ **Recruiter Copilot** — Floating AI chat assistant on every page
- ✅ **D&I Dashboard** — Anonymized diversity metrics with bias detection
- ✅ **Smart JD Analyzer** — AI reviews job descriptions for issues and improvements
- ✅ **Command Palette** — Ctrl+K for power user navigation

### UI/UX
- ✅ Dark glassmorphism theme (#070a12 base)
- ✅ Custom typography (DM Sans + JetBrains Mono display fonts)
- ✅ Staggered card reveal animations
- ✅ Skeleton loading states
- ✅ Empty state illustrations
- ✅ Slide-up modals
- ✅ Responsive down to tablet
- ✅ Kanban drag-and-drop
- ✅ Progress bars with smooth animations
- ✅ Colored skill category chips

---

## 🗄️ Database Schema

15+ tables including: `candidates`, `candidate_skills`, `work_experience`, `education`, `certifications`, `jobs`, `pipeline_stages`, `applications`, `sources`, `notes`, `activity_log`, `email_threads`, `duplicate_groups`, `search_queries`, `passive_pool`, `company_values`, `talent_radar`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/candidates` | List candidates with filters |
| GET | `/api/v1/candidates/:id` | Full candidate profile |
| POST | `/api/v1/candidates` | Create candidate |
| PUT | `/api/v1/candidates/:id` | Update candidate |
| POST | `/api/v1/candidates/:id/notes` | Add note |
| GET | `/api/v1/jobs` | List all jobs |
| GET | `/api/v1/jobs/:id` | Job with pipeline |
| POST | `/api/v1/jobs` | Create job |
| PUT | `/api/v1/pipeline/move` | Move candidate between stages |
| POST | `/api/v1/search` | Natural language search |
| GET | `/api/v1/analytics/dashboard` | Dashboard analytics |
| GET | `/api/v1/analytics/diversity` | D&I metrics |
| POST | `/api/v1/ai/copilot` | Copilot chat |
| POST | `/api/v1/ai/interview-brief` | Generate interview brief |
| POST | `/api/v1/ai/salary-predict` | Predict salary range |
| POST | `/api/v1/ai/culture-fit` | Analyze culture fit |
| POST | `/api/v1/ai/analyze-jd` | Analyze job description |
| POST | `/api/v1/ai/score-candidates` | Score against JD |
| POST | `/api/v1/ai/ghost-reengage` | Generate re-engagement email |
| POST | `/api/v1/ai/compare` | Compare candidates |

---

## 📂 Project Structure

```
LAST COMMIT/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Shared components
│   │   │   ├── Copilot.jsx
│   │   │   ├── CommandPalette.jsx
│   │   │   └── TalentRadar.jsx
│   │   ├── pages/           # Route pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Candidates.jsx
│   │   │   ├── CandidateProfile.jsx
│   │   │   ├── Jobs.jsx
│   │   │   ├── JobDetail.jsx
│   │   │   ├── AISearch.jsx
│   │   │   ├── Analytics.jsx
│   │   │   └── Settings.jsx
│   │   ├── api.js           # API client
│   │   ├── App.jsx          # Root component + routing
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Complete design system
│   ├── Dockerfile
│   └── nginx.conf
├── server/                  # Express + SQLite backend
│   ├── db/
│   │   ├── schema.js        # Database schema (15+ tables)
│   │   └── seed.js          # 55 candidates, 6 jobs
│   ├── routes/
│   │   ├── candidates.js
│   │   ├── jobs.js
│   │   ├── pipeline.js
│   │   ├── search.js
│   │   ├── analytics.js
│   │   └── ai.js            # All AI simulation endpoints
│   ├── index.js             # Express server
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

**Built for hackathon demo — production-ready architecture with zero external dependencies.**
