const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { v4: uuidv4 } = require('uuid');
const aiSimulator = require('../utils/aiSimulator');

function buildFrontendCandidate(c, db) {
  const skills = (db.data.candidate_skills || []).filter(s => s.candidate_id === c.id).map(s => s.skill_name);
  const education = (db.data.education || []).filter(e => e.candidate_id === c.id).map(e => ({ degree: e.degree, school: e.institution, year: e.end_year }));
  const timeline = (db.data.activity_log || [])
    .filter(a => a.candidate_id === c.id)
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .slice(0, 5)
    .map(a => ({
      date: new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      event: a.action,
      type: a.action.toLowerCase().includes('ai') ? 'ai' : 'action'
    }));

  const scoreData = aiSimulator.simulateCandidateScoring(c, c.summary || '');

  const statusMap = { Active: 'New', Hired: 'Hired', Rejected: 'Rejected' };
  const status = statusMap[c.status] || c.status || 'New';

  return {
    id: c.id,
    name: c.full_name,
    role: c.current_role,
    company: c.current_company,
    email: c.email,
    phone: c.phone,
    avatar: c.avatar_url ? c.avatar_url.charAt(0) : (c.full_name ? c.full_name.charAt(0) : 'U'),
    source: c.source,
    experience: `${c.years_of_experience || 0} yrs`,
    score: c.overall_score || scoreData.overall_score,
    location: c.location,
    status,
    skills,
    education,
    timeline,
    aiInsights: {
      strengths: ['Strong communication and collaboration skills.', 'Consistent delivery of high-quality work.', 'Fast learner with growth mindset.'],
      gaps: ['Limited experience with large distributed systems.', 'Needs more backend/DevOps exposure.'],
      summary: scoreData.explanation,
      questions: [
        'Describe a complex problem you solved recently.',
        'How do you stay up to date with new technology?',
        'How do you balance speed vs quality in delivery?'
      ],
      cultureFit: 'Highly collaborative and growth-oriented.',
      metrics: [
        { name: 'Skills Match', value: scoreData.overall_score },
        { name: 'Experience', value: c.years_of_experience || 0 },
        { name: 'Adaptability', value: 75 }
      ]
    }
  };
}

router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { search, seniority, source, status, skill, sort_by, sort_order, page = 1, limit = 20, location } = req.query;
    let items = db.data.candidates || [];

    if (search) { const s = search.toLowerCase(); items = items.filter(c => (c.full_name||'').toLowerCase().includes(s) || (c.email||'').toLowerCase().includes(s) || (c.current_role||'').toLowerCase().includes(s) || (c.current_company||'').toLowerCase().includes(s)); }
    if (seniority) items = items.filter(c => c.seniority_level === seniority);
    if (source) items = items.filter(c => c.source === source);
    if (status) items = items.filter(c => c.status === status);
    if (location) { const l = location.toLowerCase(); items = items.filter(c => (c.location||'').toLowerCase().includes(l)); }
    if (skill) { const sk = skill.toLowerCase(); const cids = new Set(db.data.candidate_skills.filter(s => s.skill_name.toLowerCase().includes(sk)).map(s => s.candidate_id)); items = items.filter(c => cids.has(c.id)); }

    const validSorts = ['full_name','created_at','overall_score','years_of_experience'];
    const sf = validSorts.includes(sort_by) ? sort_by : 'created_at';
    const dir = sort_order === 'asc' ? 1 : -1;
    items.sort((a, b) => { const va = a[sf] || ''; const vb = b[sf] || ''; return typeof va === 'number' ? (va - vb) * dir : String(va).localeCompare(String(vb)) * dir; });

    const total = items.length;
    const p = parseInt(page), l = parseInt(limit);
    const paged = items.slice((p - 1) * l, p * l);

    const enriched = paged.map(c => buildFrontendCandidate(c, db));

    res.json({ data: enriched, pagination: { total, page: p, limit: l, pages: Math.ceil(total / l) } });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.get('/compare/multi', (req, res) => {
  try {
    const db = getDb();
    const ids = (req.query.ids || '').split(',').filter(Boolean);
    const candidates = ids.map(id => {
      const c = db.data.candidates.find(x => x.id === id);
      if (!c) return null;
      return { ...c, skills: db.data.candidate_skills.filter(s => s.candidate_id === id), work_experience: db.data.work_experience.filter(w => w.candidate_id === id), education: db.data.education.filter(e => e.candidate_id === id), radar_scores: db.data.talent_radar_scores.find(r => r.candidate_id === id) };
    }).filter(Boolean);
    res.json({ data: candidates });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const c = db.data.candidates.find(x => x.id === req.params.id);
    if (!c) return res.status(404).json({ error: { message: 'Candidate not found' } });
    const base = buildFrontendCandidate(c, db);
    const result = {
      ...base,
      work_experience: (db.data.work_experience||[]).filter(w => w.candidate_id === c.id).sort((a,b) => (b.start_date||'').localeCompare(a.start_date||'')),
      certifications: (db.data.certifications||[]).filter(x => x.candidate_id === c.id),
      notes: (db.data.notes||[]).filter(n => n.candidate_id === c.id).sort((a,b) => (b.created_at||'').localeCompare(a.created_at||'')),
      activity_log: (db.data.activity_log||[]).filter(a => a.candidate_id === c.id).sort((a,b) => (b.created_at||'').localeCompare(a.created_at||'')).slice(0,50),
      applications: (db.data.applications||[]).filter(a => a.candidate_id === c.id).map(a => { const j = db.data.jobs.find(j => j.id === a.job_id); const ps = db.data.pipeline_stages.find(s => s.id === a.stage_id); return { ...a, job_title: j?.title, stage_name: ps?.name }; }),
      radar_scores: (db.data.talent_radar_scores||[]).find(r => r.candidate_id === c.id),
      email_threads: (db.data.email_threads||[]).filter(e => e.candidate_id === c.id),
    };
    res.json({ data: result });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.post('/', (req, res) => {
  try {
    const db = getDb();
    const id = uuidv4();
    const { full_name, email, phone, location, linkedin_url, github_url, portfolio_url, summary, seniority_level, years_of_experience, current_role, current_company, source, skills, work_experience, education, resume_text, cover_letter } = req.body;
    const candidate = { id, full_name, email, phone, location, linkedin_url, github_url, portfolio_url, summary, seniority_level, years_of_experience: years_of_experience || 0, current_role, current_company, source: source || 'Upload', status: 'Active', overall_score: 0, ghost_status: 0, in_passive_pool: 0, resume_text, cover_letter, avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    db.insert('candidates', candidate);
    if (skills) skills.forEach(s => db.insert('candidate_skills', { id: uuidv4(), candidate_id: id, skill_name: s.name || s.skill_name, category: s.category || 'Other', proficiency_level: s.proficiency || 3 }));
    if (work_experience) work_experience.forEach(w => db.insert('work_experience', { id: uuidv4(), candidate_id: id, ...w }));
    if (education) education.forEach(e => db.insert('education', { id: uuidv4(), candidate_id: id, ...e }));
    db.insert('activity_log', { id: uuidv4(), candidate_id: id, action: 'Candidate Created', details: `${full_name} added via ${source || 'Upload'}`, actor: 'System', created_at: new Date().toISOString() });
    db.save();
    res.status(201).json({ data: { id, full_name, email }, message: 'Candidate created' });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.put('/:id', (req, res) => {
  try {
    const db = getDb();
    const idx = db.data.candidates.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: { message: 'Not found' } });
    const allowed = ['full_name','email','phone','location','summary','seniority_level','years_of_experience','current_role','current_company','status','overall_score','culture_fit_score'];
    allowed.forEach(f => { if (req.body[f] !== undefined) db.data.candidates[idx][f] = req.body[f]; });
    db.data.candidates[idx].updated_at = new Date().toISOString();
    db.save();
    res.json({ message: 'Updated' });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.post('/:id/notes', (req, res) => {
  try {
    const db = getDb();
    const id = uuidv4();
    db.insert('notes', { id, candidate_id: req.params.id, author: req.body.author || 'Recruiter', content: req.body.content, created_at: new Date().toISOString() });
    db.insert('activity_log', { id: uuidv4(), candidate_id: req.params.id, action: 'Note Added', details: (req.body.content||'').substring(0, 100), actor: req.body.author || 'Recruiter', created_at: new Date().toISOString() });
    db.save();
    res.status(201).json({ data: { id }, message: 'Note added' });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.post('/bulk/action', (req, res) => {
  try {
    const db = getDb();
    const { candidate_ids, action, params: ap } = req.body;
    if (action === 'move_stage' && ap?.stage_id && ap?.job_id) {
      candidate_ids.forEach(cid => { const idx = db.data.applications.findIndex(a => a.candidate_id === cid && a.job_id === ap.job_id); if (idx >= 0) { db.data.applications[idx].stage_id = ap.stage_id; db.data.applications[idx].stage_entered_at = new Date().toISOString(); } });
    } else if (action === 'update_status') {
      candidate_ids.forEach(cid => { const idx = db.data.candidates.findIndex(c => c.id === cid); if (idx >= 0) db.data.candidates[idx].status = ap?.status || 'Active'; });
    }
    db.save();
    res.json({ message: `Bulk action on ${candidate_ids.length} candidates` });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

module.exports = router;
