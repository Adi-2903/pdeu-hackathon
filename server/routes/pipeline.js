const express = require('express');
const router = express.Router();

// Move candidate between pipeline stages
router.put('/move', (req, res) => {
  const db = req.app.locals.db;
  const { application_id, new_stage_id } = req.body;
  
  try {
    const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(application_id);
    if (!app) return res.status(404).json({ error: 'Application not found' });
    
    const newStage = db.prepare('SELECT * FROM pipeline_stages WHERE id = ?').get(new_stage_id);
    if (!newStage) return res.status(404).json({ error: 'Stage not found' });
    
    db.prepare(`UPDATE applications SET stage_id = ?, updated_at = datetime('now') WHERE id = ?`).run(new_stage_id, application_id);
    db.prepare('INSERT INTO activity_log (candidate_id, job_id, action, details, actor) VALUES (?,?,?,?,?)').run(app.candidate_id, app.job_id, 'Stage changed', `Moved to ${newStage.name}`, 'Recruiter');
    
    res.json({ success: true, stage: newStage.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET pipeline stages for a job
router.get('/stages/:jobId', (req, res) => {
  const db = req.app.locals.db;
  try {
    const stages = db.prepare('SELECT * FROM pipeline_stages WHERE job_id = ? ORDER BY position').all(req.params.jobId);
    res.json(stages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
