const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock Routes setup
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'TalentOS API is running normally.' });
});

// Root URL to prevent "Cannot GET /"
app.get('/', (req, res) => {
  res.send('TalentOS Backend API is running. Access API endpoints at /api/...');
});

// Import routes
const candidateRoutes = require('./routes/candidates');
const searchRoutes = require('./routes/search');
const uploadRoutes = require('./routes/upload');
const chatRoutes = require('./routes/chat');
const focusRoutes = require('./routes/focus');

// Mount routes
app.use('/api/candidates', candidateRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/focus', focusRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
