require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase, getDb } = require('./database');
const { seedDatabase } = require('./seed');
const aiSimulator = require('./utils/aiSimulator');

const candidatesRouter = require('./routes/candidates');
const jobsRouter = require('./routes/jobs');
const aiRouter = require('./routes/ai');
const analyticsRouter = require('./routes/analytics');
const webhooksRouter = require('./routes/webhooks');
const linkedinRouter = require('./routes/linkedin');
const companyRouter = require('./routes/company');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'HireX API is running', version: '2.0.0' });
});
app.get(['/api/health', '/api/v1/health'], (req, res) => {
  res.json({ status: 'ok', version: '2.0.0', name: 'HireX API' });
});

// Compatibility routes for frontend expecting /api/*
app.use(['/api/candidates', '/api/v1/candidates'], candidatesRouter);
app.use(['/api/jobs', '/api/v1/jobs'], jobsRouter);
app.use(['/api/ai', '/api/v1/ai'], aiRouter);
app.use(['/api/analytics', '/api/v1/analytics'], analyticsRouter);
app.use(['/api/webhooks', '/api/v1/webhooks'], webhooksRouter);
app.use(['/api/linkedin', '/api/v1/linkedin'], linkedinRouter);
app.use(['/api/company', '/api/v1/company'], companyRouter);

// AI Feature Routes
const uploadRoutes = require('./routes/upload');
const chatRoutes = require('./routes/chat');
const focusRoutes = require('./routes/focus');
const hireByFridayRoutes = require('./routes/hire-by-friday');

app.use(['/api/upload', '/api/v1/upload'], uploadRoutes);
app.use(['/api/chat', '/api/v1/chat'], chatRoutes);
app.use(['/api/focus', '/api/v1/focus'], focusRoutes);
app.use(['/api/hire-by-friday', '/api/v1/hire-by-friday'], hireByFridayRoutes);

// Legacy endpoints used by Jenil frontend
app.post(['/api/search/natural', '/api/v1/search/natural'], (req, res) => {
  try {
    const db = getDb();
    const { query } = req.body;
    if (!query) return res.status(400).json({ status: 'error', message: 'Query is required' });

    const parsed = aiSimulator.simulateNLSearch(query);
    // Use parsed filters to narrow down candidates
    let items = db.data.candidates || [];
    if (parsed.filters?.seniority_level) items = items.filter(c => c.seniority_level === parsed.filters.seniority_level);
    if (parsed.filters?.location) items = items.filter(c => (c.location || '').toLowerCase().includes(parsed.filters.location.toLowerCase()));
    if (parsed.filters?.skills?.length) {
      const skillSet = new Set(parsed.filters.skills.map(s => s.toLowerCase()));
      const matchingIds = new Set(db.data.candidate_skills.filter(s => skillSet.has(s.skill_name.toLowerCase())).map(s => s.candidate_id));
      items = items.filter(c => matchingIds.has(c.id));
    }

    const results = items.slice(0, 20).map(c => {
      const base = {
        id: c.id,
        name: c.full_name,
        role: c.current_role,
        company: c.current_company,
        location: c.location,
        experience: `${c.years_of_experience || 0} yrs`,
        skills: (db.data.candidate_skills || []).filter(s => s.candidate_id === c.id).map(s => s.skill_name),
        score: c.overall_score || 75,
        avatar: c.avatar_url ? c.avatar_url.charAt(0) : (c.full_name ? c.full_name.charAt(0) : 'U'),
        source: c.source,
      };
      const scoreData = aiSimulator.simulateCandidateScoring(c, '');
      return {
        ...base,
        matchReason: scoreData.explanation,
        matchScore: scoreData.overall_score,
        score: scoreData.overall_score,
      };
    });

    res.json({ status: 'success', data: { parsedQuery: parsed, results } });
  } catch (err) {
    console.error('Search legacy error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to perform semantic search' });
  }
});

app.post(['/api/chat', '/api/v1/chat'], (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const response = aiSimulator.simulateCopilotResponse(message);
    res.json({ reply: response.response || response });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to process AI chat message' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    error: { message: err.message || 'Internal server error', code: err.code || 'INTERNAL_ERROR' }
  });
});

// Serve the frontend build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch-all for React Router to prevent "Cannot GET /route"
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});


// Initialize DB, seed it (if needed), and start server
initializeDatabase();
seedDatabase({ force: process.env.FORCE_SEED === 'true' });

app.listen(PORT, () => {
  console.log(`HireX API running on http://localhost:${PORT}`);
});

module.exports = app;
