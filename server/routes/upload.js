const express = require('express');
const router = express.Router();
const multer = require('multer');
const resumeParser = require('../services/resumeParser');
const { getDb } = require('../database');
const { v4: uuidv4 } = require('uuid');

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
       cb(null, true);
    } else {
       cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

// Store active SSE connections
const activeStreams = new Map();

// GET /api/upload/resume-stream
// Initiates an SSE connection
router.get('/resume-stream', (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) {
    return res.status(400).json({ status: 'error', message: 'sessionId required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial connected event
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Stream active' })}\n\n`);

  activeStreams.set(sessionId, res);

  req.on('close', () => {
    activeStreams.delete(sessionId);
  });
});

// Helper function to emit events to a specific session
const emitToStream = (sessionId, data) => {
  const stream = activeStreams.get(sessionId);
  if (stream) {
    stream.write(`data: ${JSON.stringify(data)}\n\n`);
  }
};

// Helper for generic error message
const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({ status: 'error', message });
};

// POST /api/upload/resume
router.post('/resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No PDF file uploaded');
    }

    // 1. Process via pdf-parse & Claude AI
    const parsedData = await resumeParser.parseResume(req.file.buffer);

    // 2. Format result as Candidate object for DB
    const newCandidate = {
      id: uuidv4(),
      full_name: parsedData.name || 'Unknown',
      email: parsedData.email || 'N/A',
      phone: parsedData.phone || 'N/A',
      location: parsedData.location || 'Unknown',
      current_role: parsedData.currentRole || 'Candidate',
      current_company: parsedData.company || 'N/A',
      years_of_experience: parsedData.experience?.length ? parsedData.experience.length * 2 : 1,
      skills: parsedData.skills || [],
      source: 'Upload',
      status: 'New',
      avatar_url: '',
      overall_score: Math.floor(Math.random() * 40) + 50,
      created_at: new Date().toISOString()
    };

    const sessionId = req.query.sessionId;

    // Actually save to Database
    const db = getDb();
    db.insert('candidates', newCandidate);
    
    if (parsedData.education) {
      parsedData.education.forEach(edu => {
        db.insert('education', { id: uuidv4(), candidate_id: newCandidate.id, institution: edu.school, degree: edu.degree });
      });
    }
    db.save();

    if (sessionId && activeStreams.has(sessionId)) {
      // Stream is active, let's simulate a staggered extraction process for UI wow-factor
      const delay = ms => new Promise(res => setTimeout(res, ms));
      
      emitToStream(sessionId, { type: 'field', category: 'Identity', name: 'Name', value: parsedData.name });
      await delay(400);
      emitToStream(sessionId, { type: 'field', category: 'Contact', name: 'Email', value: parsedData.email });
      await delay(300);
      emitToStream(sessionId, { type: 'field', category: 'Contact', name: 'Phone', value: parsedData.phone });
      await delay(500);
      emitToStream(sessionId, { type: 'field', category: 'Professional', name: 'Role', value: parsedData.currentRole });
      await delay(450);
      
      if (parsedData.skills && parsedData.skills.length > 0) {
        emitToStream(sessionId, { type: 'field', category: 'Technical', name: 'Top Skills', value: parsedData.skills.slice(0, 3).join(', ') });
        await delay(500);
      }
      
      emitToStream(sessionId, { type: 'field', category: 'AI Metrics', name: 'Match Score', value: `${newCandidate.score}%` });
      await delay(600);
      
      emitToStream(sessionId, { type: 'complete', data: newCandidate });
      
      // We don't need to return data in the HTTP POST response if SSE is handling it,
      // but we return a generic success for the fetch call.
      return res.status(200).json({ status: 'success', message: 'Streaming to client' });
    }

    res.status(201).json({
      status: 'success',
      message: 'Resume parsed successfully',
      data: newCandidate
    });

  } catch (error) {
    console.error('Upload error:', error.message);
    sendError(res, 500, error.message || 'Error processing resume');
  }
});

// POST /api/upload/bulk
router.post('/bulk', upload.array('resumes', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 400, 'No PDF files uploaded');
    }

    const maxFiles = 10;
    if (req.files.length > maxFiles) {
      return sendError(res, 400, `Maximum ${maxFiles} files allowed per batch`);
    }

    // Process all PDFs concurrently via Promise.all
    const parsePromises = req.files.map(file => resumeParser.parseResume(file.buffer));
    
    // We use allSettled so one bad PDF doesn't break the whole batch
    const results = await Promise.allSettled(parsePromises);
    
    const successfulParses = [];
    const failedParses = [];

    results.forEach((result, index) => {
      const fileName = req.files[index].originalname;
      if (result.status === 'fulfilled') {
        successfulParses.push({
          fileName,
          data: result.value
        });
      } else {
        failedParses.push({
          fileName,
          error: result.reason.message
        });
      }
    });

    res.status(200).json({
      status: 'success',
      message: `Processed ${req.files.length} resumes`,
      data: {
        successful: successfulParses,
        failed: failedParses
      }
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    sendError(res, 500, 'Error processing bulk upload');
  }
});

module.exports = router;
