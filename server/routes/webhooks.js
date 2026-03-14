const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { v4: uuidv4 } = require('uuid');

router.post('/hrms/candidates', (req, res) => {
  try {
    const db = getDb();
    const { candidate, source_system } = req.body;
    if (!candidate?.full_name) return res.status(400).json({ error: { message: 'candidate.full_name required' } });
    const id = uuidv4();
    db.insert('candidates', { id, full_name: candidate.full_name, email: candidate.email, phone: candidate.phone, location: candidate.location, current_role: candidate.current_role, current_company: candidate.current_company, source: 'HRMS', summary: candidate.summary, status: 'Active', overall_score: 0, ghost_status: 0, in_passive_pool: 0, years_of_experience: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    db.insert('activity_log', { id: uuidv4(), candidate_id: id, action: 'Webhook Ingestion', details: `From ${source_system || 'External HRMS'}`, actor: 'Webhook', created_at: new Date().toISOString() });
    db.save();
    res.status(201).json({ message: 'Candidate ingested', candidate_id: id });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.post('/email/ingest', (req, res) => {
  try {
    const db = getDb();
    const results = (req.body.emails || []).map(email => {
      const id = uuidv4();
      db.insert('email_threads', { id, subject: email.subject, sender: email.sender, recipient: email.recipient || 'recruiting@company.com', body_preview: (email.body_preview || email.body || '').substring(0, 200), has_attachment: email.has_attachment ? 1 : 0, attachment_name: email.attachment_name, email_date: email.date || new Date().toISOString(), source: email.source || 'Gmail', status: 'Processed', created_at: new Date().toISOString() });
      return { thread_id: id, subject: email.subject, status: 'processed' };
    });
    db.save();
    res.json({ data: results, message: `Processed ${results.length} emails` });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.post('/referrals', (req, res) => {
  try {
    const db = getDb();
    const { candidate_name, candidate_email, candidate_phone, referrer_name, referrer_email, job_id, notes } = req.body;
    const id = uuidv4();
    db.insert('candidates', { id, full_name: candidate_name, email: candidate_email, phone: candidate_phone, source: 'Referral', status: 'Active', overall_score: 0, ghost_status: 0, in_passive_pool: 0, years_of_experience: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    db.insert('activity_log', { id: uuidv4(), candidate_id: id, action: 'Referral Submitted', details: `By ${referrer_name}${notes ? ': ' + notes : ''}`, actor: referrer_name, created_at: new Date().toISOString() });
    if (job_id) { const stage = db.data.pipeline_stages.filter(s => s.job_id === job_id).sort((a,b) => a.stage_order - b.stage_order)[0]; if (stage) db.insert('applications', { id: uuidv4(), candidate_id: id, job_id, stage_id: stage.id, match_score: 0, stage_entered_at: new Date().toISOString(), applied_at: new Date().toISOString(), status: 'Active' }); }
    db.save();
    res.status(201).json({ data: { candidate_id: id }, message: 'Referral submitted' });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

module.exports = router;
