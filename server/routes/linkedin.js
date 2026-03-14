const express = require('express');
const router = express.Router();
const http = require('http');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:5001';

function proxyToAI(method, path, body, timeout = 300000) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, AI_SERVICE_URL);
        const options = {
            hostname: url.hostname, port: url.port,
            path: url.pathname + url.search, method,
            headers: { 'Content-Type': 'application/json' },
            timeout,
        };
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
                catch (e) { resolve({ status: res.statusCode, data: { raw: data } }); }
            });
        });
        req.on('error', (err) => reject(new Error(`AI Service unavailable: ${err.message}`)));
        req.on('timeout', () => { req.destroy(); reject(new Error('AI Service timed out')); });
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

// Generate candidates → embed into FAISS → synced to data.json
router.post('/generate', async (req, res) => {
    try {
        const { count = 50, domain } = req.body;
        console.log(`[LinkedIn] Generating ${count} candidates${domain ? ` (${domain})` : ''}...`);

        const genResult = await proxyToAI('POST', '/generate', { count, domain });
        if (genResult.status !== 200) return res.status(genResult.status).json(genResult.data);

        console.log('[LinkedIn] Embedding into FAISS...');
        const embedResult = await proxyToAI('POST', '/embed', {});

        res.json({
            status: 'success',
            generated: genResult.data.generated,
            embedded: embedResult.data?.embedded || 0,
            total_candidates: genResult.data.total_candidates,
            total_vectors: embedResult.data?.total_vectors || 0,
            message: `Generated ${genResult.data.generated} candidates and indexed for semantic search`,
        });
    } catch (err) {
        console.error('[LinkedIn] Error:', err.message);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// FAISS Semantic Search
router.post('/search', async (req, res) => {
    try {
        const { query, top_k = 20 } = req.body;
        if (!query) return res.status(400).json({ status: 'error', message: 'Query required' });
        const result = await proxyToAI('POST', '/search', { query, top_k });
        res.json(result.data);
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Get candidates
router.get('/candidates', async (req, res) => {
    try {
        const { skip = 0, limit = 200 } = req.query;
        const result = await proxyToAI('GET', `/candidates?skip=${skip}&limit=${limit}`);
        res.json(result.data);
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Stats
router.get('/stats', async (req, res) => {
    try {
        const result = await proxyToAI('GET', '/stats');
        res.json(result.data);
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Generate HTML Resume
router.get('/generate-resume/:id', async (req, res) => {
    try {
        const url = new URL(`/generate-resume/${req.params.id}`, AI_SERVICE_URL);
        const options = { hostname: url.hostname, port: url.port, path: url.pathname, method: 'GET', timeout: 30000 };
        const proxyReq = http.request(options, (proxyRes) => {
            let data = '';
            proxyRes.on('data', chunk => data += chunk);
            proxyRes.on('end', () => {
                res.set('Content-Type', proxyRes.headers['content-type'] || 'text/html');
                res.send(data);
            });
        });
        proxyReq.on('error', (err) => res.status(500).json({ error: err.message }));
        proxyReq.end();
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// ATS Score
router.post('/ats-score', async (req, res) => {
    try {
        const result = await proxyToAI('POST', '/ats-score', req.body);
        res.json(result.data);
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Clear all
router.delete('/candidates', async (req, res) => {
    try {
        const result = await proxyToAI('DELETE', '/candidates');
        res.json(result.data);
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Re-embed
router.post('/embed', async (req, res) => {
    try {
        const result = await proxyToAI('POST', '/embed', req.body || {});
        res.json(result.data);
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

module.exports = router;
