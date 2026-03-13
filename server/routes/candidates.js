const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// GET all candidates with filters
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const { search, seniority, source, status, skill, location, sort, order, page = 1, limit = 50 } = req.query;
  
  let query = `SELECT c.*, GROUP_CONCAT(DISTINCT cs.skill_name) as skills_list, 
    GROUP_CONCAT(DISTINCT cs.category) as skill_categories
    FROM candidates c 
    LEFT JOIN candidate_skills cs ON c.id = cs.candidate_id`;
  let conditions = [];
  let params = [];

  if (search) { conditions.push(`(c.full_name LIKE ? OR c.email LIKE ? OR c.location LIKE ?)`); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (seniority) { conditions.push(`c.seniority_level = ?`); params.push(seniority); }
  if (source) { conditions.push(`c.source = ?`); params.push(source); }
  if (status) { conditions.push(`c.status = ?`); params.push(status); }
  if (location) { conditions.push(`c.location LIKE ?`); params.push(`%${location}%`); }
  if (skill) { conditions.push(`cs.skill_name LIKE ?`); params.push(`%${skill}%`); }

  if (conditions.length) query += ` WHERE ` + conditions.join(' AND ');
  query += ` GROUP BY c.id`;
  
  const sortField = sort || 'created_at';
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
  query += ` ORDER BY c.${sortField} ${sortOrder}`;
  query += ` LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

  try {
    const candidates = db.prepare(query).all(...params);
    const total = db.prepare(`SELECT COUNT(DISTINCT c.id) as count FROM candidates c LEFT JOIN candidate_skills cs ON c.id = cs.candidate_id ${conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''}`).get(...params.slice(0, -2));
    
    res.json({ candidates: candidates.map(c => ({ ...c, skills_list: c.skills_list ? c.skills_list.split(',') : [], skill_categories: c.skill_categories ? [...new Set(c.skill_categories.split(','))] : [] })), total: total.count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET candidate by ID with full details
router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  
  try {
    const candidate = db.prepare('SELECT * FROM candidates WHERE id = ?').get(id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    const skills = db.prepare('SELECT * FROM candidate_skills WHERE candidate_id = ? ORDER BY category, proficiency_level DESC').all(id);
    const experience = db.prepare('SELECT * FROM work_experience WHERE candidate_id = ? ORDER BY is_current DESC, start_date DESC').all(id);
    const education = db.prepare('SELECT * FROM education WHERE candidate_id = ? ORDER BY end_year DESC').all(id);
    const certs = db.prepare('SELECT * FROM certifications WHERE candidate_id = ?').all(id);
    const notes = db.prepare('SELECT * FROM notes WHERE candidate_id = ? ORDER BY created_at DESC').all(id);
    const activities = db.prepare('SELECT * FROM activity_log WHERE candidate_id = ? ORDER BY created_at DESC LIMIT 50').all(id);
    const applications = db.prepare(`SELECT a.*, j.title as job_title, j.department, ps.name as stage_name, ps.color as stage_color FROM applications a JOIN jobs j ON a.job_id = j.id LEFT JOIN pipeline_stages ps ON a.stage_id = ps.id WHERE a.candidate_id = ?`).all(id);
    const radar = db.prepare('SELECT * FROM talent_radar WHERE candidate_id = ?').get(id);
    const source = db.prepare('SELECT * FROM sources WHERE candidate_id = ? ORDER BY created_at DESC LIMIT 1').get(id);

    res.json({ ...candidate, skills, experience, education, certifications: certs, notes, activities, applications, radar, source_detail: source });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create candidate
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const id = uuidv4();
  const { full_name, email, phone, location, linkedin_url, github_url, portfolio_url, summary, seniority_level, years_experience, source, skills } = req.body;

  try {
    db.prepare(`INSERT INTO candidates (id, full_name, email, phone, location, linkedin_url, github_url, portfolio_url, summary, seniority_level, years_experience, source) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(id, full_name, email, phone, location, linkedin_url, github_url, portfolio_url, summary, seniority_level || 'Mid', years_experience || 0, source || 'Upload');
    
    if (skills && skills.length) {
      const insertSkill = db.prepare('INSERT INTO candidate_skills (candidate_id, skill_name, category, proficiency_level) VALUES (?,?,?,?)');
      skills.forEach(s => insertSkill.run(id, s.name, s.category || 'Other', s.proficiency || 3));
    }

    db.prepare('INSERT INTO activity_log (candidate_id, action, details, actor) VALUES (?,?,?,?)').run(id, 'Candidate created', `${full_name} added to the system`, 'User');
    
    const candidate = db.prepare('SELECT * FROM candidates WHERE id = ?').get(id);
    res.status(201).json(candidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update candidate
router.put('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  const fields = req.body;
  
  try {
    const sets = Object.keys(fields).map(k => `${k} = ?`).join(', ');
    const values = Object.values(fields);
    db.prepare(`UPDATE candidates SET ${sets}, updated_at = datetime('now') WHERE id = ?`).run(...values, id);
    const candidate = db.prepare('SELECT * FROM candidates WHERE id = ?').get(id);
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add note
router.post('/:id/notes', (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  const { content, author, type } = req.body;
  
  try {
    db.prepare('INSERT INTO notes (candidate_id, author, content, type) VALUES (?,?,?,?)').run(id, author || 'Recruiter', content, type || 'note');
    const notes = db.prepare('SELECT * FROM notes WHERE candidate_id = ? ORDER BY created_at DESC').all(id);
    res.status(201).json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ghost candidates
router.get('/status/ghosts', (req, res) => {
  const db = req.app.locals.db;
  try {
    const ghosts = db.prepare('SELECT * FROM candidates WHERE ghost_status = 1 ORDER BY ghost_days DESC').all();
    res.json(ghosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET passive pool
router.get('/pool/passive', (req, res) => {
  const db = req.app.locals.db;
  try {
    const passive = db.prepare(`SELECT c.*, pp.original_score, pp.reason, pp.added_at, j.title as original_job 
      FROM candidates c JOIN passive_pool pp ON c.id = pp.candidate_id 
      LEFT JOIN jobs j ON pp.original_job_id = j.id WHERE c.passive_pool = 1 ORDER BY pp.original_score DESC`).all();
    res.json(passive);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
