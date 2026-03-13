const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// GET all jobs
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  try {
    const jobs = db.prepare('SELECT * FROM jobs ORDER BY created_at DESC').all();
    const jobsWithCounts = jobs.map(j => {
      const counts = db.prepare(`SELECT ps.name, ps.color, ps.position, COUNT(a.id) as count 
        FROM pipeline_stages ps LEFT JOIN applications a ON a.stage_id = ps.id AND a.job_id = ps.job_id 
        WHERE ps.job_id = ? GROUP BY ps.id ORDER BY ps.position`).all(j.id);
      const totalApplicants = counts.reduce((sum, c) => sum + c.count, 0);
      return { ...j, stages: counts, total_applicants: totalApplicants };
    });
    res.json(jobsWithCounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET job by ID with pipeline
router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  try {
    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const stages = db.prepare('SELECT * FROM pipeline_stages WHERE job_id = ? ORDER BY position').all(id);
    const applications = db.prepare(`
      SELECT a.*, c.full_name, c.email, c.location, c.seniority_level, c.years_experience, c.source, c.avatar_url,
        GROUP_CONCAT(cs.skill_name) as skills, ps.name as stage_name, ps.color as stage_color, ps.position as stage_position
      FROM applications a
      JOIN candidates c ON a.candidate_id = c.id
      LEFT JOIN candidate_skills cs ON c.id = cs.candidate_id
      LEFT JOIN pipeline_stages ps ON a.stage_id = ps.id
      WHERE a.job_id = ?
      GROUP BY a.id
      ORDER BY a.score DESC
    `).all(id);

    const pipeline = stages.map(s => ({
      ...s,
      candidates: applications.filter(a => a.stage_id === s.id).map(a => ({
        ...a,
        skills: a.skills ? a.skills.split(',').slice(0, 5) : []
      }))
    }));

    res.json({ ...job, pipeline, total_applicants: applications.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create job
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const id = uuidv4();
  const { title, department, location, type, salary_min, salary_max, description, requirements } = req.body;
  
  try {
    db.prepare('INSERT INTO jobs (id, title, department, location, type, salary_min, salary_max, description, requirements) VALUES (?,?,?,?,?,?,?,?,?)').run(id, title, department, location, type, salary_min, salary_max, description, requirements);
    
    const defaultStages = [
      { name: 'New', color: '#6b7280' },
      { name: 'Screening', color: '#3b82f6' },
      { name: 'Phone Interview', color: '#8b5cf6' },
      { name: 'Technical Interview', color: '#f59e0b' },
      { name: 'Final Interview', color: '#06d6a0' },
      { name: 'Offer', color: '#10b981' },
      { name: 'Hired', color: '#06d6a0' },
      { name: 'Rejected', color: '#ef4444' }
    ];
    const insertStage = db.prepare('INSERT INTO pipeline_stages (job_id, name, position, color) VALUES (?,?,?,?)');
    defaultStages.forEach((s, i) => insertStage.run(id, s.name, i, s.color));
    
    res.status(201).json(db.prepare('SELECT * FROM jobs WHERE id = ?').get(id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update job
router.put('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  const fields = req.body;
  try {
    const sets = Object.keys(fields).map(k => `${k} = ?`).join(', ');
    db.prepare(`UPDATE jobs SET ${sets}, updated_at = datetime('now') WHERE id = ?`).run(...Object.values(fields), id);
    res.json(db.prepare('SELECT * FROM jobs WHERE id = ?').get(id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
