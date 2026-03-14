const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { v4: uuidv4 } = require('uuid');

const DEFAULT_STAGES = [
  { name: 'New', color: '#3b82f6', order: 1 },
  { name: 'Screening', color: '#8b5cf6', order: 2 },
  { name: 'Phone Interview', color: '#06b6d4', order: 3 },
  { name: 'Technical Interview', color: '#f59e0b', order: 4 },
  { name: 'Final Interview', color: '#ec4899', order: 5 },
  { name: 'Offer', color: '#06d6a0', order: 6 },
  { name: 'Hired', color: '#10b981', order: 7 },
  { name: 'Rejected', color: '#ef4444', order: 8 },
];

router.get('/', (req, res) => {
  try {
    const db = getDb();
    let jobs = db.data.jobs || [];
    const { status, search } = req.query;
    if (status) jobs = jobs.filter(j => j.status === status);
    if (search) { const s = search.toLowerCase(); jobs = jobs.filter(j => (j.title||'').toLowerCase().includes(s) || (j.department||'').toLowerCase().includes(s)); }
    const enriched = jobs.map(j => ({ ...j, candidate_count: (db.data.applications||[]).filter(a => a.job_id === j.id).length }));
    res.json({ data: enriched });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const job = db.data.jobs.find(j => j.id === req.params.id);
    if (!job) return res.status(404).json({ error: { message: 'Job not found' } });
    const stages = (db.data.pipeline_stages||[]).filter(s => s.job_id === req.params.id).sort((a,b) => a.stage_order - b.stage_order);
    const pipeline = stages.map(stage => {
      const apps = (db.data.applications||[]).filter(a => a.job_id === req.params.id && a.stage_id === stage.id);
      const candidates = apps.map(a => {
        const c = db.data.candidates.find(x => x.id === a.candidate_id);
        if (!c) return null;
        const skills = (db.data.candidate_skills||[]).filter(s => s.candidate_id === c.id).map(s => s.skill_name).slice(0, 5);
        const daysInStage = Math.floor((Date.now() - new Date(a.stage_entered_at || a.applied_at).getTime()) / 86400000);
        return { ...a, full_name: c.full_name, email: c.email, current_role: c.current_role, current_company: c.current_company, seniority_level: c.seniority_level, avatar_url: c.avatar_url, years_of_experience: c.years_of_experience, location: c.location, top_skills: skills, days_in_stage: daysInStage };
      }).filter(Boolean);
      return { ...stage, candidates };
    });
    res.json({ data: { ...job, pipeline } });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.post('/', (req, res) => {
  try {
    const db = getDb();
    const id = uuidv4();
    const { title, department, location, job_type, experience_required, salary_range_min, salary_range_max, description, requirements } = req.body;
    db.insert('jobs', { id, title, department, location, job_type: job_type || 'Full-time', experience_required, salary_range_min, salary_range_max, description, requirements, status: 'Active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    DEFAULT_STAGES.forEach(s => db.insert('pipeline_stages', { id: uuidv4(), job_id: id, name: s.name, stage_order: s.order, color: s.color }));
    db.save();
    res.status(201).json({ data: { id, title }, message: 'Job created' });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.put('/:id', (req, res) => {
  try {
    const db = getDb();
    const idx = db.data.jobs.findIndex(j => j.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: { message: 'Not found' } });
    ['title','department','location','job_type','experience_required','salary_range_min','salary_range_max','description','requirements','status'].forEach(f => { if (req.body[f] !== undefined) db.data.jobs[idx][f] = req.body[f]; });
    db.data.jobs[idx].updated_at = new Date().toISOString();
    db.save();
    res.json({ message: 'Job updated' });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.post('/:id/applications', (req, res) => {
  try {
    const db = getDb();
    const { candidate_id, stage_id, match_score } = req.body;
    let stageId = stage_id;
    if (!stageId) { const first = db.data.pipeline_stages.filter(s => s.job_id === req.params.id).sort((a,b) => a.stage_order - b.stage_order)[0]; stageId = first?.id; }
    const appId = uuidv4();
    db.insert('applications', { id: appId, candidate_id, job_id: req.params.id, stage_id: stageId, match_score: match_score || 0, stage_entered_at: new Date().toISOString(), applied_at: new Date().toISOString(), status: 'Active' });
    db.save();
    res.status(201).json({ data: { id: appId }, message: 'Candidate added to pipeline' });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.put('/:jobId/applications/:appId/move', (req, res) => {
  try {
    const db = getDb();
    const { stage_id } = req.body;
    const idx = db.data.applications.findIndex(a => a.id === req.params.appId);
    if (idx >= 0) {
      db.data.applications[idx].stage_id = stage_id;
      db.data.applications[idx].stage_entered_at = new Date().toISOString();
      const stage = db.data.pipeline_stages.find(s => s.id === stage_id);
      db.insert('activity_log', { id: uuidv4(), candidate_id: db.data.applications[idx].candidate_id, job_id: req.params.jobId, action: 'Stage Changed', details: `Moved to ${stage?.name}`, actor: 'Recruiter', created_at: new Date().toISOString() });
      db.save();
    }
    res.json({ message: 'Candidate moved' });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.get('/:id/stages', (req, res) => {
  try {
    const db = getDb();
    const stages = db.data.pipeline_stages.filter(s => s.job_id === req.params.id).sort((a,b) => a.stage_order - b.stage_order);
    res.json({ data: stages });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

module.exports = router;
