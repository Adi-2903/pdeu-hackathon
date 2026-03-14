---
description: Verify that frontend pages and components are correctly wired to backend API endpoints after refactors or folder reorganizations.
---

### 1. Inventory the API surface
- **List Next.js API routes**:
  - Scan `src/pages/api/**/*.ts` and record:
    - Route path (file path → URL, e.g. `src/pages/api/search.ts` → `/api/search`)
    - HTTP methods supported (by convention, `POST` only in this project)
    - Any environment-variable dependencies (`NEXT_PUBLIC_*`, `SUPABASE_*`, `WORKER_URL`, etc.).
- **Check runtime + exports**:
  - Confirm each API module:
    - Exports a handler compatible with the Pages Router (default export `handler`).
    - Optionally declares `export const config = { runtime: "edge" }` when required.

### 2. Inventory frontend API consumers
- **Search for API usage in the frontend**:
  - In `src/pages/**/*.tsx` and `src/components/**/*.tsx`, search for:
    - `fetch("/api/`
    - `axios.`
  - For each match, capture:
    - URL string (including query params)
    - HTTP method
    - Expected request body / shape (from `JSON.stringify(...)` or `FormData`).
- **Map pages to features**:
  - Note which pages rely on which endpoints, for example:
    - `search.tsx` → `/api/search`
    - `shortlists.tsx` → `/api/shortlist`
    - `ingestion.tsx` → `/api/ingest-*` routes.

### 3. Cross-check mappings
- **One-to-one mapping pass**:
  - For every frontend call, verify:
    - A corresponding API route exists at that exact path.
    - HTTP method matches (POST vs GET).
    - Request body schema (e.g. via `zod`) matches what the frontend sends.
  - For every API route, verify:
    - There is at least one frontend caller, or mark as internal/worker-only.
- **Common pitfalls to check**:
  - Old App Router style handlers (`export async function POST`) left in `src/pages/api` without a default export.
  - Old route names (`/api/ingest/...`) that no longer match renamed files (e.g. `/api/ingest-upload`).
  - Stale import paths, especially after alias changes (`@/components/*` → `@/frontend/components/*`, `@/lib/supabase/*` → `@/frontend/lib/db/*`).

### 4. Router + dynamic route correctness
- **Dynamic pages in the Pages Router**:
  - In `src/pages/**/[id].tsx`, ensure:
    - They use `useRouter` from `"next/router"` (not `"next/navigation"`).
    - IDs are read from `router.query.id` and guarded for `undefined`.
  - Confirm any links (e.g. `href={`/candidates/${id}`}`) line up with the dynamic routes.
- **Shared clients + env config**:
  - Confirm all client-side Supabase calls come from `@/frontend/lib/db/client`.
  - Confirm the Supabase environment variables used there (`env.supabase.url`, `env.supabase.anonKey`) are defined.

### 5. Automated sanity checks
- **Type + lint checks**:
  - Run `npm run lint` scoped to recently modified files when possible.
  - Fix obvious missing-import / wrong-alias errors introduced by refactors.
- **Build verification**:
  - Run `npm run build` and ensure:
    - No errors for missing handlers in `src/pages/api`.
    - No unresolved module imports from old paths.

### 6. Manual feature spot-checks
- **Core flows to validate in the browser**:
  - **AI search**:
    - From `/search`, run a query and confirm the network panel shows a successful `POST /api/search` with expected response data.
  - **Shortlist scoring**:
    - From `/shortlists`, paste a JD and confirm `POST /api/shortlist` returns scored candidates.
  - **Ingestion**:
    - From `/ingestion`, verify:
      - Resume upload calls `POST /api/ingest-upload`.
      - Source buttons call:
        - Gmail → `/api/ingest-gmail`
        - Indeed → `/api/ingest-indeed`
        - LinkedIn → `/api/ingest-linkedin`
        - Merge ATS → `/api/ingest-ats?source=merge`
        - Zoho → `/api/ingest-ats?source=zoho`
  - **Scheduling**:
    - From a candidate detail page, trigger scheduling and confirm `POST /api/schedule` returns a Meet URL and updates the application row.

### 7. Checklist before committing
- **Routing and alias checklist**:
  - [ ] All `src/pages/api/*.ts` have a default `handler` export.
  - [ ] No imports from old aliases (`"@/components/*"`, `"@/lib/supabase/*"`) remain; they are updated to `"@/frontend/components/*"` and `"@/frontend/lib/db/*"`.
  - [ ] Dynamic pages use `next/router` correctly for `router.query`.
  - [ ] Frontend `fetch`/`axios` URLs exactly match existing API route paths.
  - [ ] Lint and build pass without route/import errors.

