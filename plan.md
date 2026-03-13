# TalentFlow — Implementation Plan (Docker + Railway Edition)
> 3-Day Hackathon · Antigravity Agent Manager · 12 Phases

---

## Phase 0 — Docker + Project Setup
**Day 1 · Agent 1 · Do this FIRST**

### Tasks
1. Initialize Next.js 14 app with TypeScript and Tailwind CSS
2. Create monorepo structure:
   ```
   talentflow/
   ├── Dockerfile.api          ← API server container
   ├── Dockerfile.mcp          ← MCP bridge container
   ├── Dockerfile.worker       ← Worker container
   ├── docker-compose.yml      ← Local dev orchestration
   ├── .env.local              ← All env vars (gitignored)
   ├── app/                    ← Next.js pages + API routes
   ├── lib/                    ← AI, integrations, DB
   ├── components/             ← UI components
   └── workers/                ← Worker job definitions
   ```
3. Write `Dockerfile.api`:
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```
4. Write `Dockerfile.mcp`:
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY mcp-bridge/package*.json ./
   RUN npm ci
   COPY mcp-bridge/ .
   EXPOSE 3001
   CMD ["node", "server.js"]
   ```
5. Write `Dockerfile.worker`:
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY workers/package*.json ./
   RUN npm ci
   COPY workers/ .
   EXPOSE 3002
   CMD ["node", "index.js"]
   ```
6. Write `docker-compose.yml` with all 3 services + Redis
7. Set up Supabase project: enable pgvector, create all 7 tables
8. Install core packages: `@supabase/supabase-js @anthropic-ai/sdk zod pdf-parse`
9. Run `docker-compose up --build` → verify all 3 containers start

### Test Criteria
- `docker-compose up` starts mcp-bridge on :3001, api on :3000, worker on :3002
- Supabase tables visible in dashboard
- All folders exist

---

## Phase 1 — MCP Bridge Container
**Day 1 · Agent 2 (parallel with Phase 0)**

### Tasks
Build the `mcp-bridge/` folder — a standalone Express server that wraps MCP clients.

1. `mcp-bridge/package.json`:
   ```json
   { "dependencies": { "@modelcontextprotocol/sdk": "latest", "express": "^4", "axios": "^1" } }
   ```
2. `mcp-bridge/server.js` — Express REST proxy:
   - `GET /health` → returns `{ status: "ok" }`
   - `POST /gmail/fetch` → connects Gmail MCP, returns array of emails with attachments
   - `POST /indeed/fetch` → connects Indeed MCP, returns array of applicants
   - `POST /calendar/create` → connects Calendar MCP, creates event, returns Meet URL
3. Each MCP route:
   - Initialize MCP client with OAuth token from env
   - Call the relevant MCP tool
   - Return normalized JSON response
   - Handle errors with proper HTTP status codes
4. Test locally: `curl http://localhost:3001/health` returns 200

### Test Criteria
- `docker-compose up mcp-bridge` starts without errors
- GET /health returns `{ status: "ok" }`
- POST /gmail/fetch with valid token returns email array

---

## Phase 2 — Resume Upload + Claude Parser
**Day 1 · Agent 3 (parallel)**

### Tasks
1. `app/api/ingest/upload/route.ts`
   - Accept PDF/DOCX file upload (multipart form)
   - Store file in Supabase Storage bucket "resumes"
   - Extract text using pdf-parse
   - POST to worker queue: `{ job: "parse_resume", payload: { text, file_url } }`
   - Return `{ queued: true, job_id }`

2. `lib/ai/resume-parser.ts` — Claude Call 1
   - System prompt: "You are a resume parser. Return ONLY valid JSON. Fields: name (string), email (string), phone (string), skills (string[]), experience_years (number), education ({degree, institution, year}[]), location (string), companies (string[])"
   - Temperature: 0.1
   - Strip markdown fences before JSON.parse
   - Return typed `ParsedCandidate` object

3. `workers/jobs/parse-resume.js` — Worker job handler
   - Receives job from Bull queue
   - Calls resume-parser via API
   - Saves parsed candidate to Supabase `candidates` table
   - Triggers dedup check
   - Generates pgvector embedding and saves to `candidate_embeddings`

### Test Criteria
- Upload PDF → job appears in Bull queue → worker processes it → candidate in Supabase with parsed JSON + embedding

---

## Phase 3 — Deduplication Engine
**Day 1 · Agent 4 (parallel with Phase 2)**

### Tasks
1. `lib/dedup.ts` — orchestration
   - Step 1: Query candidates by email (ILIKE, case-insensitive)
   - Step 2: If no email match, query by similar name
   - Step 3: If name match found → call Claude dedup checker
   - Merge: append source to sources[], keep most complete fields
   - Confidence 50-79: set `needs_review: true`

2. `lib/ai/dedup-checker.ts` — Claude Call 2
   - Input: two candidate JSON objects
   - Output: `{ is_duplicate: boolean, confidence: number, reason: string }`
   - Temperature: 0.1

3. Wire into worker job `parse-resume.js` — runs after parse, before final save

### Test Criteria
- Upload same resume twice → second creates no new record, updates sources[]
- Different person with same name → creates separate record

---

## Phase 4 — Gmail + Indeed MCP Ingestion
**Day 1 · Agent 5 (parallel)**

### Tasks
1. `lib/integrations/gmail.ts`
   - POST to `${MCP_BRIDGE_URL}/gmail/fetch` with OAuth token
   - Parse response: extract sender name, email, attachment text
   - For each attachment: push parse_resume job to Worker queue

2. `app/api/ingest/gmail/route.ts`
   - POST endpoint (manual trigger)
   - Call gmail adapter → queue jobs → log to ingestion_logs
   - Return `{ queued: number }`

3. `lib/integrations/indeed.ts`
   - POST to `${MCP_BRIDGE_URL}/indeed/fetch`
   - Map applicant fields to TalentFlow schema
   - Push to worker queue

4. `app/api/ingest/indeed/route.ts`
   - Same pattern as Gmail

### Test Criteria
- POST /api/ingest/gmail → jobs queued → candidates appear in DB tagged "gmail"
- POST /api/ingest/indeed → candidates appear tagged "indeed"

---

## Phase 5 — ATS Ingestion (Merge.dev + Zoho)
**Day 2 · Agent 1**

### Tasks
1. `lib/integrations/merge-dev.ts`
   - Merge.dev REST: `GET https://api.merge.dev/api/ats/v1/candidates`
   - Auth: `Authorization: Bearer ${MERGE_API_KEY}` + `X-Account-Token`
   - Handle cursor-based pagination
   - Map → TalentFlow candidate schema

2. `lib/integrations/zoho.ts`
   - Zoho Recruit: `GET https://recruit.zoho.in/recruit/v2/Candidates`
   - Auth: Bearer `ZOHO_ACCESS_TOKEN`
   - Paginate 200/page, fetch resume if `Is_Attachment_Present = true`

3. `app/api/ingest/apifly/route.ts`
   - `?source=merge` or `?source=zoho`
   - Push each candidate to worker queue
   - Log to ingestion_logs

### Test Criteria
- POST /api/ingest/apifly?source=zoho → Zoho candidates in DB tagged "zoho"
- POST /api/ingest/apifly?source=merge → Merge candidates in DB tagged "merge-greenhouse"

---

## Phase 6 — LinkedIn Mock + Data Seeding
**Day 2 · Agent 2 (parallel with Phase 5)**

### Tasks
1. `data/linkedin-mock.json` — 20 realistic profiles:
   ```json
   [{ "name": "...", "headline": "...", "location": "...", "email": "...",
      "skills": [], "experience": [{"company": "...", "title": "...", "years": 3}],
      "education": [{"degree": "...", "institution": "...", "year": 2019}] }]
   ```
   Mix: engineers, designers, PMs. Some India-based. Vary experience levels.

2. `lib/integrations/linkedin-mock.ts`
   - Load and parse the JSON file
   - Map profile fields → TalentFlow candidate schema

3. `app/api/ingest/linkedin/route.ts`
   - Load all 20 profiles → push each to worker queue → log to ingestion_logs

4. Also create 3-4 sample jobs in the jobs table via a seed script `scripts/seed-jobs.ts`

### Test Criteria
- POST /api/ingest/linkedin → 20 mock candidates in DB tagged "linkedin"
- Jobs table has 3-4 seeded roles ready for shortlisting demo

---

## Phase 7 — NL Search + pgvector
**Day 2 · Agent 3**

### Tasks
1. `lib/ai/candidate-search.ts`
   - Input: plain-English query string
   - Generate query embedding (via Claude or Supabase's built-in)
   - pgvector cosine similarity: `SELECT candidate_id, 1-(embedding <=> $query_vec) AS sim FROM candidate_embeddings ORDER BY sim DESC LIMIT 20`
   - Re-rank top 20 with Claude: send query + candidate summaries → return `[{ candidate_id, score, reason }]`

2. `app/api/search/route.ts`
   - POST `{ query: string }` (Zod: min 3 chars)
   - Call candidate-search.ts
   - Join with candidates table → return full candidate data

3. `app/search/page.tsx`
   - Large search input ("Find candidates with specific skills, experience, location...")
   - Loading skeleton (3 placeholder cards) while waiting
   - Results: name, match score badge (purple), 1-line reason, source tags, skills chips
   - Empty state: "No candidates matched — try a different query"

### Test Criteria
- Query "senior React developer fintech remote" → relevant ranked results in < 3s
- Different query → different results
- Empty query → 400 error

---

## Phase 8 — AI Shortlisting
**Day 2 · Agent 4 (parallel with Phase 7)**

### Tasks
1. `lib/ai/shortlist-scorer.ts`
   - Input: job_description string, optional candidate_ids[]
   - Batch candidates in groups of 10 (token limit safety)
   - Per batch: Claude scores each 0-100 against JD, returns `[{ candidate_id, score, reason }]`
   - Sort desc, save to shortlists table

2. `app/api/shortlist/route.ts`
   - POST `{ job_description: string, job_id?: string }`
   - Run scorer → save → return top 20 with full candidate data joined

3. `app/shortlist/page.tsx`
   - Large JD textarea
   - "Score All Candidates" button + loading state "Scoring N candidates..."
   - Ranked list: score badge + reason + Approve/Reject/Schedule buttons
   - Approve → updates applications.status to "approved"

### Test Criteria
- Paste "Senior Backend Engineer" JD → ranked list with scores + reasons in < 10s
- Approve button → applications table updated

---

## Phase 9 — Candidate List + Profile UI
**Day 3 · Agent 1**

### Tasks
1. `app/candidates/page.tsx`
   - Paginated list (20/page) from Supabase
   - Each card: initials avatar, name, title, location, top 3 skills, source badge chips, merged indicator
   - Filter by source, search bar at top

2. `app/candidates/[id]/page.tsx`
   - Header: initials avatar, name, headline, location, source badges
   - Skills section (chips), Experience timeline, Education section
   - Source history: "Found in Gmail (date) · Also in Zoho (date)"
   - Applications section with status badges
   - "Schedule Interview" button → calls /api/schedule
   - "Add to Shortlist" button → navigates to /shortlist

### Test Criteria
- List loads paginated, source tags visible
- Profile shows merged source history
- Schedule button triggers calendar API

---

## Phase 10 — Dashboard
**Day 3 · Agent 2 (parallel with Phase 9)**

### Tasks
1. `app/page.tsx` — Dashboard homepage
   - Stats row: Total candidates · New this week · Pending review · Active jobs
   - Source breakdown bar chart (recharts BarChart)
   - Recent activity feed (last 10 ingestion_logs rows, relative timestamps)
   - Active jobs list with application counts
   - Quick action buttons: "Pull Gmail" / "Pull Zoho" / "Run Shortlist" (with loading states)

### Test Criteria
- Stats show correct DB counts
- Chart renders with real data
- Quick actions trigger correct API endpoints

---

## Phase 11 — Interview Scheduling
**Day 3 · Agent 3 (parallel)**

### Tasks
1. `lib/integrations/calendar.ts`
   - POST to `${MCP_BRIDGE_URL}/calendar/create` with candidate + job details
   - Receive: `{ meet_url, event_id, event_link }`

2. `app/api/schedule/route.ts`
   - POST `{ candidate_id, job_id }`
   - Fetch candidate name + job title
   - Call calendar adapter → get Meet URL
   - Save meet_url to applications table
   - Build draft email text (NOT auto-sent)
   - Return `{ meet_url, draft_email }`

3. Wire "Schedule Interview" button on candidate profile
   - Confirmation modal → POST → show Meet link + draft email

### Test Criteria
- Click button → modal → Meet URL generated → draft email shown

---

## Phase 12 — Railway Deploy + Polish
**Day 3 · Agent 4 · LAST**

### Tasks

**Railway deployment:**
1. Install Railway CLI: `npm i -g @railway/cli`
2. `railway login` → `railway init`
3. Create 3 Railway services: `api`, `mcp-bridge`, `worker`
4. Add Railway Redis plugin (free) for Bull queue
5. Set all env vars in Railway dashboard per service
6. Deploy: `railway up` for each service
7. Note Railway URLs — set `MCP_BRIDGE_URL` in api service env to Railway mcp-bridge URL

**Vercel frontend deployment:**
8. Update `next.config.js`: add `NEXT_PUBLIC_API_URL` pointing to Railway api URL
9. `vercel --prod`
10. Set env vars in Vercel dashboard

**Polish:**
11. Loading skeletons on all data-fetching pages
12. Error states with helpful messages
13. Empty states on all list pages
14. Hover states on all interactive elements
15. Mobile check at 375px

**Smoke test on production:**
16. Upload resume → worker processes → candidate in list → search → shortlist → schedule

### Test Criteria
- 3 Railway services running (green status)
- Vercel URL loads dashboard
- Full demo flow end-to-end on production URLs
- No console errors

---

## V2 Parking Lot (Post-Hackathon)
- Real LinkedIn API integration
- Multi-recruiter roles + permissions
- Automated email outreach via SendGrid
- Kanban pipeline board per job
- Analytics: source quality, time-to-hire
- Redis Streams for real-time ingestion updates
- GitHub Actions CI/CD pipeline