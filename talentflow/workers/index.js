const Bull = require('bull');
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');
const handleParseResume = require('./jobs/parse-resume');

// Configuration
const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
const ingestionQueue = new Bull('ingestion', redisUrl);

// Clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Job Registry
const handlers = {
  'parse_resume': handleParseResume
};

// Bull Queue Processor
ingestionQueue.process(async (job) => {
  const { job: jobType } = job.data;
  console.log(`[Queue] Processing job ${job.id} (Type: ${jobType})`);
  
  const handler = handlers[jobType];
  
  if (handler) {
    try {
      const result = await handler(job, { supabase, anthropic });
      console.log(`[Queue] Job ${job.id} completed. Result:`, result);
      return result;
    } catch (error) {
      console.error(`[Queue] Job ${job.id} FAILED:`, error.message);
      throw error;
    }
  } else {
    console.warn(`[Queue] No handler found for job type: ${jobType}`);
    return { status: 'unhandled' };
  }
});

// HTTP API for adding jobs
const app = express();
app.use(express.json());

// Main endpoint to accept jobs from the Next.js API
app.post('/jobs', async (req, res) => {
  const { job: jobType, ...data } = req.body;
  
  if (!jobType) {
    return res.status(400).json({ error: 'Job type is required' });
  }

  console.log(`[HTTP] Received job request: ${jobType}`);
  
  try {
    const queuedJob = await ingestionQueue.add({ job: jobType, ...data }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    });
    
    res.json({ id: queuedJob.id, status: 'queued' });
  } catch (error) {
    console.error(`[HTTP] Failed to queue job:`, error.message);
    res.status(500).json({ error: 'Failed to queue job' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', queue: 'ingestion' });
});

const PORT = 3002;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Worker service started.`);
  console.log(`- Webhook listener: http://0.0.0.0:${PORT}/jobs`);
  console.log(`- Bull queue: ingestion`);
});
