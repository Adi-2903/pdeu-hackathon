const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./db/schema');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

const db = initializeDatabase();
app.locals.db = db;

// Routes
const candidatesRouter = require('./routes/candidates');
const jobsRouter = require('./routes/jobs');
const pipelineRouter = require('./routes/pipeline');
const searchRouter = require('./routes/search');
const analyticsRouter = require('./routes/analytics');
const aiRouter = require('./routes/ai');

app.use('/api/v1/candidates', candidatesRouter);
app.use('/api/v1/jobs', jobsRouter);
app.use('/api/v1/pipeline', pipelineRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/ai', aiRouter);

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 TalentOS API running on http://localhost:${PORT}`);
});
