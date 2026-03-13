# TalentFlow — Project Brief (Docker + Railway Edition)
> Paste this into Antigravity Agent Manager as your very first task.

---

## Product Definition
TalentFlow is a web-based AI recruitment dashboard that ingests candidates from Gmail, Indeed, Merge.dev (Zoho + Greenhouse), resume uploads, and simulated LinkedIn data into one deduplicated database — then lets recruiters find, score, and shortlist using plain-English AI search.

---

## Deployment Architecture

```
[External Sources]
  Gmail MCP · Indeed MCP · Calendar MCP · Merge.dev · Zoho · Upload · LinkedIn Mock
          |
          ▼
[Railway Platform — 3 Docker containers]
  ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
  │  MCP Bridge      │→  │   API Server     │ ←  │    Worker        │
  │  Dockerfile.mcp  │   │   Dockerfile.api │    │ Dockerfile.worker│
  │  port 3001       │   │   port 3000      │    │  port 3002       │
  └──────────────────┘   └──────────────────┘    └──────────────────┘
          └──────────────────────┬───────────────────────┘
                                 ▼
                      [Supabase — cloud]
                   Postgres + pgvector + Auth + Storage
                                 |
                                 ▼
                      [Vercel — Next.js frontend]
                       Calls Railway API server
```

### Why Docker + Railway (not all-Vercel)?
- MCP packages need persistent Node.js processes — Vercel serverless cold starts break MCP connections
- Merge.dev + Zoho SDKs need stable long-running connections
- Worker jobs (ingestion queue, dedup, embeddings) need a persistent process
- Railway free tier: $5/month credit covers all 3 containers for a hackathon

---

## Tech Stack

| Layer | Tool | Runs on | Free Tier |
|---|---|---|---|
| Frontend | Next.js 14 + TypeScript | Vercel | Free |
| Styling | Tailwind CSS + shadcn/ui | Vercel | Free |
| API Server | Next.js API routes (Dockerized) | Railway | $5 credit |
| MCP Bridge | Node.js + @modelcontextprotocol/sdk | Railway | Same credit |
| Worker | Bull queue + Node.js | Railway | Same credit |
| Queue | Redis | Railway plugin | Free |
| Database | Supabase Postgres | Supabase cloud | 500MB free |
| Vector Search | pgvector | Supabase cloud | Built-in free |
| Auth + Storage | Supabase | Supabase cloud | Free |
| AI | Claude API (claude-sonnet-4-20250514) | Railway API calls | $5 free credits |
| Unified ATS | Merge.dev SDK | Railway API container | 3 accounts free |
| Direct ATS | Zoho Recruit REST | Railway API container | Free dev account |
| Local dev | docker-compose | Local machine | Free |

---

## Docker Container Breakdown

### Container 1 — MCP Bridge (Dockerfile.mcp, port 3001)
Wraps all MCP clients behind a REST proxy so the API server can call them over HTTP.
```
npm packages: @modelcontextprotocol/sdk, express, axios
env vars:     GMAIL_OAUTH_TOKEN, INDEED_MCP_TOKEN, GCAL_OAUTH_TOKEN
```

### Container 2 — API Server (Dockerfile.api, port 3000)
All Next.js API routes, Claude calls, ATS integrations, resume parsing.
```
npm packages: next, @anthropic-ai/sdk, @supabase/supabase-js, merge, zod, pdf-parse
env vars:     ANTHROPIC_API_KEY, SUPABASE_*, MERGE_*, ZOHO_*,
              MCP_BRIDGE_URL=http://mcp-bridge:3001 (Railway internal DNS)
```

### Container 3 — Worker (Dockerfile.worker, port 3002)
Background job processor — ingestion queue, dedup runs, pgvector embedding generation.
```
npm packages: bull, @supabase/supabase-js, @anthropic-ai/sdk, pdf-parse
env vars:     SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, REDIS_URL
```

### docker-compose.yml (local dev)
```yaml
version: "3.9"
services:
  mcp-bridge:
    build: { context: ., dockerfile: Dockerfile.mcp }
    ports: ["3001:3001"]
    env_file: .env.local

  api:
    build: { context: ., dockerfile: Dockerfile.api }
    ports: ["3000:3000"]
    depends_on: [mcp-bridge]
    env_file: .env.local
    environment:
      - MCP_BRIDGE_URL=http://mcp-bridge:3001

  worker:
    build: { context: ., dockerfile: Dockerfile.worker }
    ports: ["3002:3002"]
    depends_on: [api]
    env_file: .env.local
```

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Claude AI
ANTHROPIC_API_KEY=

# Merge.dev
MERGE_API_KEY=
MERGE_ACCOUNT_TOKEN=

# Zoho Recruit
ZOHO_ACCESS_TOKEN=
ZOHO_CLIENT_ID=
ZOHO_CLIENT_SECRET=
ZOHO_REFRESH_TOKEN=

# MCP OAuth tokens
GMAIL_OAUTH_TOKEN=
INDEED_MCP_TOKEN=
GCAL_OAUTH_TOKEN=

# Internal service URLs (set automatically in docker-compose / Railway)
MCP_BRIDGE_URL=http://mcp-bridge:3001
WORKER_URL=http://worker:3002
REDIS_URL=redis://redis:6379
```

---

## Database Tables

| Table | Key Columns | Purpose |
|---|---|---|
| candidates | id, email, name, parsed_json, sources[] | Unified deduplicated records |
| candidate_embeddings | candidate_id, embedding (vector) | pgvector index |
| sources | id, type, raw_data, ingested_at | One row per ingestion event |
| jobs | id, title, description, status | Active job postings |
| applications | candidate_id, job_id, status, score | Candidate ↔ job relationships |
| shortlists | job_id, candidate_id, score, reason | AI shortlist results per JD |
| ingestion_logs | source, count, status, timestamp | Ingestion audit trail |

---

## The 3 Claude API Calls (run in API container)

**Call 1 — Resume Parser** `/lib/ai/resume-parser.ts`
- Input: raw PDF text → Output: structured JSON (skills, exp, education, location, companies)
- Temperature 0.1, return ONLY valid JSON

**Call 2 — Dedup Checker** `/lib/ai/dedup-checker.ts`
- Input: 2 candidate records → Output: `{ is_duplicate, confidence: 0-100, reason }`
- Confidence ≥ 80 = auto merge · 50-79 = flag for review

**Call 3 — NL Search + JD Scorer** `/lib/ai/candidate-search.ts`
- Input: plain-English query or JD text → Output: `[{ candidate_id, score, reason }]`

---

## Architecture Rules
- Frontend (Vercel): ONLY pages + UI. No direct DB or AI calls.
- API Server (Railway): All business logic, Claude calls, ATS integrations.
- MCP Bridge (Railway): All MCP connections. API calls it via HTTP on MCP_BRIDGE_URL.
- Worker (Railway): All background jobs triggered by Bull queue from API server.
- Never call Claude API directly in components — always through /lib/ai/
- Never call MCP directly from API routes — always through MCP_BRIDGE_URL
- .env.local for local, Railway dashboard env vars for production.

## Build Commands
- Local: `docker-compose up --build`
- Railway deploy: `railway up` (3 services, auto-detects each Dockerfile)
- Frontend deploy: `vercel --prod` (from project root)
- DB push: `npx supabase db push`

## Current Status
- Phase: Setup (not started)
- Completed: Nothing yet
- In Progress: —
- Blocked: —