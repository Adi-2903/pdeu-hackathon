# TalentFlow — Unified AI Recruitment Platform
> 3-Day Hackathon · Antigravity Agent Manager · 12 Phases

TalentFlow is a premium, AI-powered recruitment engine designed to ingest candidates from multiple sources (Gmail, Indeed, Zoho, LinkedIn), perform semantic search using **pgvector**, and automate candidate shortlisting and interview scheduling using **Claude 3.5 Sonnet**.

---

## 🏗️ Project Structure

TalentFlow follows a modern monorepo-inspired architecture with Docker orchestration for local development.

```text
talentflow/
├── app/                      # Next.js 14 (App Router)
│   ├── (dashboard)/          # Authenticated dashboard views
│   │   ├── candidates/       # Candidate listing and profiles
│   │   ├── ingestion/        # Ingestion management UI
│   │   ├── search/           # AI semantic search interface
│   │   ├── shortlists/       # AI-scored shortlist views
│   │   └── page.tsx          # Main Dashboard Home
│   ├── api/                  # API Routes (Ingestion, Search, Scorer)
│   ├── auth/                 # Authentication logic
│   ├── globals.css           # Tailwind + Custom Global Styles
│   └── layout.tsx            # Root Layout with Fonts & Providers
├── components/               # React Components (shadcn/ui)
│   ├── candidates/           # Candidate-specific cards & details
│   ├── dashboard/            # Charts & Stats widgets
│   ├── ui/                   # Reusable UI primitives (Buttons, Dialogs, etc.)
│   └── layout/               # Sidebar, Header, and Shell
├── lib/                      # Core Logic & Integrations
│   ├── ai/                   # Claude (Resume parsing, Scoring, Search)
│   ├── integrations/         # External APIs (Gmail, Indeed, Zoho, LinkedIn)
│   └── supabase/             # DB Client & Vector utilities
├── workers/                  # Background Job Processing (Bull Queue)
│   ├── index.js              # Worker Entrypoint
│   └── jobs/                 # Job Handlers (Resume parsing, Deduplication)
├── mcp-bridge/               # MCP Server Adapter
│   ├── server.js             # Express REST proxy for MCP tools
│   └── package.json          # MCP SDK dependencies
├── supabase/                 # Database Management
│   └── migrations/           # SQL migration files (001-004)
├── data/                     # Static Mock Data
├── scripts/                  # Development & Seeding scripts
├── Dockerfile                # API server container
├── docker-compose.yml        # Orchestrates: API, Worker, MCP-Bridge, Redis
└── .env.local                # Environment variables (Gitignored)
```

---

## 🛠️ Technology Stack
- **Frontend**: Next.js 14, Tailwind CSS, shadcn/ui, Framer Motion
- **Database**: Supabase (PostgreSQL) + pgvector for semantic search
- **AI**: Anthropic Claude 3.5 Sonnet (Parsing & Scoring), OpenAI (Embeddings)
- **Infrastructure**: Docker, Railway (Services), Vercel (Frontend), Redis (Bull Queue)

## 🚀 Getting Started

1. **Environment Setup**:
   Copy `.env.example` to `.env.local` and fill in your Supabase and AI keys.

2. **Docker Orchestration**:
   ```bash
   docker-compose up --build
   ```

3. **Database Migration**:
   Use `npx supabase db push` or apply the migrations in the `supabase/migrations/` folder manually.

4. **Develop**:
   ```bash
   npm run dev
   ```
