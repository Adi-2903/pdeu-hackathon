const API_BASE = 'http://localhost:3001/api/v1';

export const api = {
  // Candidates
  getCandidates: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/candidates?${qs}`).then(r => r.json());
  },
  getCandidate: (id) => fetch(`${API_BASE}/candidates/${id}`).then(r => r.json()),
  createCandidate: (data) => fetch(`${API_BASE}/candidates`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  updateCandidate: (id, data) => fetch(`${API_BASE}/candidates/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  addNote: (id, data) => fetch(`${API_BASE}/candidates/${id}/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),

  // Jobs
  getJobs: () => fetch(`${API_BASE}/jobs`).then(r => r.json()),
  getJob: (id) => fetch(`${API_BASE}/jobs/${id}`).then(r => r.json()),
  createJob: (data) => fetch(`${API_BASE}/jobs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),

  // Pipeline
  moveCandidate: (applicationId, newStageId) => fetch(`${API_BASE}/pipeline/move`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ application_id: applicationId, new_stage_id: newStageId }) }).then(r => r.json()),

  // Search
  search: (query) => fetch(`${API_BASE}/search`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) }).then(r => r.json()),

  // Analytics
  getDashboard: () => fetch(`${API_BASE}/analytics/dashboard`).then(r => r.json()),
  getDiversity: () => fetch(`${API_BASE}/analytics/diversity`).then(r => r.json()),

  // AI
  copilot: (message) => fetch(`${API_BASE}/ai/copilot`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message }) }).then(r => r.json()),
  interviewBrief: (candidateId, jobId) => fetch(`${API_BASE}/ai/interview-brief`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ candidate_id: candidateId, job_id: jobId }) }).then(r => r.json()),
  salaryPredict: (data) => fetch(`${API_BASE}/ai/salary-predict`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  cultureFit: (candidateId) => fetch(`${API_BASE}/ai/culture-fit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ candidate_id: candidateId }) }).then(r => r.json()),
  analyzeJD: (description) => fetch(`${API_BASE}/ai/analyze-jd`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description }) }).then(r => r.json()),
  scoreCandidates: (jobId) => fetch(`${API_BASE}/ai/score-candidates`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ job_id: jobId }) }).then(r => r.json()),
  ghostReengage: (data) => fetch(`${API_BASE}/ai/ghost-reengage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  compareCandidates: (candidateIds, jobId) => fetch(`${API_BASE}/ai/compare`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ candidate_ids: candidateIds, job_id: jobId }) }).then(r => r.json()),
};
