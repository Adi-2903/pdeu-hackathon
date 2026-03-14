const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { v4: uuidv4 } = require('uuid');
const ai = require('../utils/aiSimulator');

router.post('/parse-resume', (req, res) => {
  try { res.json({ data: ai.simulateResumeParser(req.body.text || '', req.body.file_name || 'resume.pdf'), message: 'Resume parsed' }); }
  catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.post('/search', (req, res) => {
  try {
    const db = getDb();
    const { query } = req.body;
    const searchResult = ai.simulateNLSearch(query);
    let items = [...db.data.candidates];
    const f = searchResult.filters;
    if (f.seniority_level) items = items.filter(c => c.seniority_level === f.seniority_level);
    if (f.location) items = items.filter(c => (c.location||'').toLowerCase().includes(f.location.toLowerCase()));
    if (f.skills && f.skills.length) {
      const cids = new Set();
      db.data.candidate_skills.forEach(s => { if (f.skills.some(sk => s.skill_name.toLowerCase().includes(sk))) cids.add(s.candidate_id); });
      if (cids.size) items = items.filter(c => cids.has(c.id));
    }
    if (!items.length) items = [...db.data.candidates].sort((a,b) => (b.overall_score||0) - (a.overall_score||0)).slice(0, 20);
    items.sort((a,b) => (b.overall_score||0) - (a.overall_score||0));
    const results = items.slice(0, 20).map((c, i) => ({
      ...c, match_score: Math.max(95 - i * 4 - Math.floor(Math.random() * 5), 45),
      match_explanation: `${c.full_name} is a ${c.seniority_level||'experienced'} ${c.current_role||'engineer'} at ${c.current_company||'a tech company'} with ${c.years_of_experience||5}y experience.`,
      skills: db.data.candidate_skills.filter(s => s.candidate_id === c.id)
    }));
    db.insert('search_queries', { id: uuidv4(), query_text: query, structured_filters: JSON.stringify(f), created_by: 'Recruiter', created_at: new Date().toISOString() });
    db.save();
    res.json({ data: { interpreted: searchResult, results } });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.post('/score', (req, res) => {
  try {
    const db = getDb();
    const { job_id, candidate_ids } = req.body;
    const job = db.data.jobs.find(j => j.id === job_id);
    const ids = candidate_ids || db.data.candidates.slice(0, 50).map(c => c.id);
    const results = ids.map(cid => {
      const c = db.data.candidates.find(x => x.id === cid);
      if (!c) return null;
      const scoring = ai.simulateCandidateScoring(c, job?.description || '');
      const ci = db.data.candidates.findIndex(x => x.id === cid);
      if (ci >= 0) db.data.candidates[ci].overall_score = scoring.overall_score;
      const ai2 = db.data.applications.findIndex(a => a.candidate_id === cid && a.job_id === job_id);
      if (ai2 >= 0) { db.data.applications[ai2].match_score = scoring.overall_score; db.data.applications[ai2].ai_explanation = scoring.explanation; }
      return { candidate_id: cid, candidate_name: c.full_name, ...scoring };
    }).filter(Boolean);
    db.save();
    res.json({ data: results, message: `Scored ${results.length} candidates` });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.post('/salary-predict', (req, res) => {
  try {
    const db = getDb();
    const c = db.data.candidates.find(x => x.id === req.body.candidate_id);
    if (!c) return res.status(404).json({ error: { message: 'Not found' } });
    const p = ai.simulateSalaryPrediction(c);
    const ci = db.data.candidates.findIndex(x => x.id === c.id);
    if (ci >= 0) { db.data.candidates[ci].salary_min = p.min_salary; db.data.candidates[ci].salary_max = p.max_salary; }
    db.save();
    res.json({ data: p });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.post('/talent-radar', (req, res) => {
  try {
    const db = getDb();
    const c = db.data.candidates.find(x => x.id === req.body.candidate_id);
    if (!c) return res.status(404).json({ error: { message: 'Not found' } });
    const radar = ai.simulateTalentRadar(c);
    const existing = db.data.talent_radar_scores.findIndex(r => r.candidate_id === c.id);
    if (existing >= 0) db.data.talent_radar_scores[existing] = { ...db.data.talent_radar_scores[existing], ...radar };
    else db.insert('talent_radar_scores', { id: uuidv4(), candidate_id: c.id, ...radar });
    db.save();
    res.json({ data: radar });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.post('/culture-fit', (req, res) => {
  try {
    const db = getDb();
    const c = db.data.candidates.find(x => x.id === req.body.candidate_id);
    if (!c) return res.status(404).json({ error: { message: 'Not found' } });
    const vals = req.body.values || ['Ownership', 'Move Fast', 'Data-Driven', 'Remote-First', 'Continuous Learning'];
    const result = ai.simulateCultureFit(c, vals);
    const ci = db.data.candidates.findIndex(x => x.id === c.id);
    if (ci >= 0) db.data.candidates[ci].culture_fit_score = result.overall_score;
    db.save();
    res.json({ data: result });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.post('/interview-brief', (req, res) => {
  try {
    const db = getDb();
    const c = db.data.candidates.find(x => x.id === req.body.candidate_id);
    const j = req.body.job_id ? db.data.jobs.find(x => x.id === req.body.job_id) : null;
    if (!c) return res.status(404).json({ error: { message: 'Not found' } });
    res.json({ data: ai.simulateInterviewBrief(c, j) });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.post('/ghost-reengage', (req, res) => {
  try {
    const db = getDb();
    const c = db.data.candidates.find(x => x.id === req.body.candidate_id);
    if (!c) return res.status(404).json({ error: { message: 'Not found' } });
    res.json({ data: ai.simulateGhostReengagement(c) });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.post('/analyze-jd', (req, res) => {
  try { res.json({ data: ai.simulateJDAnalysis(req.body.description || '') }); }
  catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.post('/copilot', (req, res) => {
  try { res.json({ data: ai.simulateCopilotResponse(req.body.message || '') }); }
  catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.get('/passive-pool/resurface', (req, res) => {
  try {
    const db = getDb();
    const pool = (db.data.passive_pool||[]).slice(0, 10).map(pp => {
      const c = db.data.candidates.find(x => x.id === pp.candidate_id);
      const j = db.data.jobs.find(x => x.id === pp.original_job_id);
      if (!c) return null;
      return { ...c, ...pp, original_job_title: j?.title, resurface_message: `You interviewed ${c.full_name} for ${j?.title || 'a similar role'} — they scored ${pp.original_score} for this JD.`, new_match_score: Math.floor(70 + Math.random() * 25) };
    }).filter(Boolean);
    res.json({ data: pool });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

module.exports = router;
