# TalentOS Bug Fixes & Improvements

## Backend
### `server/routes/candidates.js`
- **Bug Fixed (Crash):** Removed usage of an undefined `vectorEngine` module in `/search/natural` (previously mapped via `/index` route mapping errors or `/semantic-search`). It was replaced with a reliable keyword-scoring fallback to prevent 500 server crashes.
- **Bug Fixed (Route Duplicate):** Removed duplicated `POST /bulk/action` definition which caused unpredictable route resolution.

## Frontend
### `client/src/pages/Candidates.jsx`
- **Bug Fixed (Compile Error):** Removed duplicated declarations of `filters` and `fetchCandidates` that crashed the Vite build.
- **Bug Fixed (Missing Prop):** The `onOpenEmail` prop wasn't being passed to `CandidateModal`, causing crashes when attempting to send an email to a candidate. Wired properly.
- **Bug Fixed (API Context):** Replaced raw `fetch` calls with the shared `api` instance for `handleOpenEmailModal` and `handleSendEmail` to properly attach base URLs and credentials.
- **Added Functionality:** Wired the `Shortlist` button functionality via `PUT /candidates/:id` to actually change the candidate's status.
- **Added Functionality:** Wired the `Add Candidate` button to open the `ResumeUploadModal`.
- **Added Functionality:** Wired the three-dot "More options" context buttons on the table to perform explicit actions (Email, Shortlist, Schedule).

### `client/src/pages/Settings.jsx`
- **Bug Fixed (API Context):** Changed raw `fetch('/api/v1/...')` to `api.get()` and `api.put()` to resolve proxy discrepancies between local dev servers and frontend fetch requests.

### `client/src/pages/Dashboard.jsx`
- **Enhanced UX (Navigation):** Applied `useNavigate` hook to navigation points. 
  - `Post New Job` now routes to `/pipeline`.
  - `See Calendar` now routes to `/pipeline`.
  - `View full database` now correctly routes to `/candidates` using `useNavigate`.

### `client/src/pages/AISearch.jsx`
- **Bug Fixed (JSX Structure):** Fixed unclosed `<div>` elements near the "Results Grid" which caused severe compile-time JSX errors.
- **Enhanced UX (Sorting/Filtering):** Fully implemented the `Score` and `Experience` sorts on the client side using a calculated `displayedResults` payload.
- **Added Functionality:** Wired the `View Profile` button to navigate directly to the Candidates page with the candidate's name pre-filled as a search `query`.
- **Added Functionality:** Implemented working `Shortlist` button (calls `api.put` to update status).
- **Added Functionality:** Wired the `Export CSV` button with client-side blob generation.

### `client/src/pages/Pipeline.jsx`
- **Enhanced UX:** Enhanced the Pipeline Kanban candidate cards. Note that drag-and-drop context blocked modal usage, so actions were natively wired:
  - `Mail` icon opens an active `mailto:` link.
  - `Calendar` icon copies a generic scheduling link to the user's clipboard for instant sharing.
  - `Note` icon triggers a native `prompt()` to quickly POST a note using the `api` instance to the candidate's profile.

### `client/src/pages/Sources.jsx`
- **Added Functionality (Clipboard):** Wired the employee referral `Copy` button using the `navigator.clipboard.writeText` API instead of doing nothing.
- **Bug Fixed (Mock API):** Swapped the raw `axios.post` request for the LinkedIn generator out for the authenticated `api.post` instance configured with the app.
- **Added Functionality (Upload):** Swapped out a purely visual `simulateUpload` loop with a real `handleFileUpload` hook that takes an actual Dropzone/Click input and hits `POST /api/upload/single`.

## Summary
The codebase was suffering from a mismatch in component lifecycle assumptions (e.g. relying on non-existent `vectorEngine`), unpolished wiring for navigation and UI elements, and some compile-breaking duplicate code remnants from iterative ideation. The application is now fully compilable, visually robust, and correctly connected across internal API pathways.
