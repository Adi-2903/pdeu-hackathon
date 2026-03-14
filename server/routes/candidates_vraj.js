const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { v4: uuidv4 } = require('uuid');
const aiSimulator = require('../utils/aiSimulator');
const vectorEngine = require('../utils/vector-engine');

function buildFrontendCandidate(c, db) {
  const skills = (db.data.candidate_skills || []).filter(s => s.candidate_id === c.id).map(s => s.skill_name);
  const education = (db.data.education || []).filter(e => e.candidate_id === c.id).map(e => ({ degree: e.degree, school: e.institution, year: e.end_year }));
  const timeline = (db.data.activity_log || [])
    .filter(a => a.candidate_id === c.id)
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .slice(0, 5)
    .map(a => ({
      date: new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      event: a.action,
      type: a.action.toLowerCase().includes('ai') ? 'ai' : 'action'
    }));

  const scoreData = aiSimulator.simulateCandidateScoring(c, c.summary || '');

  const statusMap = { Active: 'New', Hired: 'Hired', Rejected: 'Rejected' };
  const status = statusMap[c.status] || c.status || 'New';

  return {
    id: c.id,
    name: c.full_name,
    role: c.current_role,
    company: c.current_company,
    email: c.email,
    phone: c.phone,
    avatar: c.avatar_url ? c.avatar_url.charAt(0) : (c.full_name ? c.full_name.charAt(0) : 'U'),
    source: c.source,
    experience: `${c.years_of_experience || 0} yrs`,
    score: c.overall_score || scoreData.overall_score,
    location: c.location,
    status,
    skills,
    education,
    timeline,
    aiInsights: {
      strengths: ['Strong communication and collaboration skills.', 'Consistent delivery of high-quality work.', 'Fast learner with growth mindset.'],
      gaps: ['Limited experience with large distributed systems.', 'Needs more backend/DevOps exposure.'],
      summary: scoreData.explanation,
      questions: [
        'Describe a complex problem you solved recently.',
        'How do you stay up to date with new technology?',
        'How do you balance speed vs quality in delivery?'
      ],
      cultureFit: 'Highly collaborative and growth-oriented.',
      metrics: [
        { name: 'Skills Match', value: scoreData.overall_score },
        { name: 'Experience', value: c.years_of_experience || 0 },
        { name: 'Adaptability', value: 75 }
      ]
    }
  };
}

router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { search, seniority, source, status, skill, sort_by, sort_order, page = 1, limit = 20, location } = req.query;
    let items = db.data.candidates || [];

    if (search) { const s = search.toLowerCase(); items = items.filter(c => (c.full_name || '').toLowerCase().includes(s) || (c.email || '').toLowerCase().includes(s) || (c.current_role || '').toLowerCase().includes(s) || (c.current_company || '').toLowerCase().includes(s)); }
    if (seniority) items = items.filter(c => c.seniority_level === seniority);
    if (source) items = items.filter(c => c.source === source);
    if (status) items = items.filter(c => c.status === status);
    if (location) { const l = location.toLowerCase(); items = items.filter(c => (c.location || '').toLowerCase().includes(l)); }
    if (skill) { const sk = skill.toLowerCase(); const cids = new Set(db.data.candidate_skills.filter(s => s.skill_name.toLowerCase().includes(sk)).map(s => s.candidate_id)); items = items.filter(c => cids.has(c.id)); }

    const validSorts = ['full_name', 'created_at', 'overall_score', 'years_of_experience'];
    const sf = validSorts.includes(sort_by) ? sort_by : 'created_at';
    const dir = sort_order === 'asc' ? 1 : -1;
    items.sort((a, b) => { const va = a[sf] || ''; const vb = b[sf] || ''; return typeof va === 'number' ? (va - vb) * dir : String(va).localeCompare(String(vb)) * dir; });

    const total = items.length;
    const p = parseInt(page), l = parseInt(limit);
    const paged = items.slice((p - 1) * l, p * l);

    const enriched = paged.map(c => buildFrontendCandidate(c, db));

    res.json({ data: enriched, pagination: { total, page: p, limit: l, pages: Math.ceil(total / l) } });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.get('/compare/multi', (req, res) => {
  try {
    const db = getDb();
    const ids = (req.query.ids || '').split(',').filter(Boolean);
    const candidates = ids.map(id => {
      const c = db.data.candidates.find(x => x.id === id);
      if (!c) return null;
      return { ...c, skills: db.data.candidate_skills.filter(s => s.candidate_id === id), work_experience: db.data.work_experience.filter(w => w.candidate_id === id), education: db.data.education.filter(e => e.candidate_id === id), radar_scores: db.data.talent_radar_scores.find(r => r.candidate_id === id) };
    }).filter(Boolean);
    res.json({ data: candidates });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const c = db.data.candidates.find(x => x.id === req.params.id);
    if (!c) return res.status(404).json({ error: { message: 'Candidate not found' } });
    const base = buildFrontendCandidate(c, db);
    const result = {
      ...base,
      work_experience: (db.data.work_experience || []).filter(w => w.candidate_id === c.id).sort((a, b) => (b.start_date || '').localeCompare(a.start_date || '')),
      certifications: (db.data.certifications || []).filter(x => x.candidate_id === c.id),
      notes: (db.data.notes || []).filter(n => n.candidate_id === c.id).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')),
      activity_log: (db.data.activity_log || []).filter(a => a.candidate_id === c.id).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')).slice(0, 50),
      applications: (db.data.applications || []).filter(a => a.candidate_id === c.id).map(a => { const j = db.data.jobs.find(j => j.id === a.job_id); const ps = db.data.pipeline_stages.find(s => s.id === a.stage_id); return { ...a, job_title: j?.title, stage_name: ps?.name }; }),
      radar_scores: (db.data.talent_radar_scores || []).find(r => r.candidate_id === c.id),
      email_threads: (db.data.email_threads || []).filter(e => e.candidate_id === c.id),
    };
    res.json({ data: result });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.post('/', (req, res) => {
  try {
    const db = getDb();
    const id = uuidv4();
    const { full_name, email, phone, location, linkedin_url, github_url, portfolio_url, summary, seniority_level, years_of_experience, current_role, current_company, source, skills, work_experience, education, resume_text, cover_letter } = req.body;
    const candidate = { id, full_name, email, phone, location, linkedin_url, github_url, portfolio_url, summary, seniority_level, years_of_experience: years_of_experience || 0, current_role, current_company, source: source || 'Upload', status: 'Active', overall_score: 0, ghost_status: 0, in_passive_pool: 0, resume_text, cover_letter, avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    db.insert('candidates', candidate);
    if (skills) skills.forEach(s => db.insert('candidate_skills', { id: uuidv4(), candidate_id: id, skill_name: s.name || s.skill_name, category: s.category || 'Other', proficiency_level: s.proficiency || 3 }));
    if (work_experience) work_experience.forEach(w => db.insert('work_experience', { id: uuidv4(), candidate_id: id, ...w }));
    if (education) education.forEach(e => db.insert('education', { id: uuidv4(), candidate_id: id, ...e }));
    db.insert('activity_log', { id: uuidv4(), candidate_id: id, action: 'Candidate Created', details: `${full_name} added via ${source || 'Upload'}`, actor: 'System', created_at: new Date().toISOString() });
    db.save();
    res.status(201).json({ data: { id, full_name, email }, message: 'Candidate created' });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.put('/:id', (req, res) => {
  try {
    const db = getDb();
    const idx = db.data.candidates.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: { message: 'Not found' } });
    const allowed = ['full_name', 'email', 'phone', 'location', 'summary', 'seniority_level', 'years_of_experience', 'current_role', 'current_company', 'status', 'overall_score', 'culture_fit_score'];
    allowed.forEach(f => { if (req.body[f] !== undefined) db.data.candidates[idx][f] = req.body[f]; });
    db.data.candidates[idx].updated_at = new Date().toISOString();
    db.save();
    res.json({ message: 'Updated' });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.post('/:id/notes', (req, res) => {
  try {
    const db = getDb();
    const id = uuidv4();
    db.insert('notes', { id, candidate_id: req.params.id, author: req.body.author || 'Recruiter', content: req.body.content, created_at: new Date().toISOString() });
    db.insert('activity_log', { id: uuidv4(), candidate_id: req.params.id, action: 'Note Added', details: (req.body.content || '').substring(0, 100), actor: req.body.author || 'Recruiter', created_at: new Date().toISOString() });
    db.save();
    res.status(201).json({ data: { id }, message: 'Note added' });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

// ΓöÇΓöÇ Resume Generation (HTML) ΓÇö Professional Template ΓöÇΓöÇ
router.get('/:id/resume', (req, res) => {
  try {
    const db = getDb();
    const c = db.data.candidates.find(x => x.id === req.params.id);
    if (!c) return res.status(404).json({ error: { message: 'Candidate not found' } });

    const skills = (db.data.candidate_skills || []).filter(s => s.candidate_id === c.id);
    const workExp = (db.data.work_experience || []).filter(w => w.candidate_id === c.id).sort((a, b) => String(b.start_date || '').localeCompare(String(a.start_date || '')));
    const education = (db.data.education || []).filter(e => e.candidate_id === c.id);
    const certs = (db.data.certifications || []).filter(x => x.candidate_id === c.id);

    // Build skill descriptions with context
    const skillDescriptions = {
      'React': 'Extensive experience building production-grade SPAs and component libraries using React, Redux, and modern hooks patterns.',
      'Python': 'Proficient in Python for backend services, data pipelines, automation scripts, and machine learning model integration.',
      'Java': 'Strong foundation in Java for enterprise-grade applications, microservices architecture, and distributed systems.',
      'JavaScript': 'Deep expertise in JavaScript/ES6+ for full-stack development including Node.js backend and modern frontend frameworks.',
      'TypeScript': 'Hands-on experience with TypeScript for type-safe application development across frontend and backend codebases.',
      'Node.js': 'Built and maintained RESTful APIs and real-time services using Node.js, Express, and various middleware patterns.',
      'AWS': 'Proficient in AWS cloud infrastructure including EC2, S3, Lambda, RDS, CloudFront, and CI/CD pipeline automation.',
      'Docker': 'Containerized applications using Docker and orchestrated deployments with Docker Compose and Kubernetes.',
      'Kubernetes': 'Managed production Kubernetes clusters, configured auto-scaling, and implemented rolling deployment strategies.',
      'SQL': 'Expert-level SQL for complex queries, stored procedures, performance tuning, and database schema design.',
      'PostgreSQL': 'Designed and optimized PostgreSQL databases for high-throughput transactional and analytical workloads.',
      'MongoDB': 'Built scalable NoSQL data layers using MongoDB with aggregation pipelines and replica set configurations.',
      'Go': 'Developed high-performance backend services and CLI tools using Go with focus on concurrency patterns.',
      'C++': 'Systems-level programming experience in C++ for performance-critical applications and algorithm implementation.',
      'TensorFlow': 'Applied TensorFlow for building, training, and deploying machine learning models in production environments.',
      'GCP': 'Deployed and managed applications on Google Cloud Platform including BigQuery, Cloud Functions, and GKE.',
      'Azure': 'Experience with Microsoft Azure services including App Service, Azure Functions, and Azure DevOps pipelines.',
      'Redis': 'Implemented caching layers and message queues using Redis for improved application performance and reliability.',
      'GraphQL': 'Designed and implemented GraphQL APIs with schema stitching, subscriptions, and efficient resolver patterns.',
      'Rust': 'Built memory-safe, high-performance systems using Rust with focus on zero-cost abstractions.',
      'Swift': 'Developed native iOS applications using Swift with UIKit and SwiftUI frameworks.',
      'Kotlin': 'Built Android applications and backend services using Kotlin with coroutines and Jetpack components.',
      'Vue.js': 'Created reactive web interfaces using Vue.js with Vuex state management and Vue Router.',
      'Angular': 'Developed enterprise Angular applications with RxJS, NgRx, and modular architecture patterns.',
      'Django': 'Built full-stack web applications using Django with ORM, REST framework, and template engine.',
      'Flask': 'Created lightweight Python web services and APIs using Flask with SQLAlchemy integration.',
      'Spring Boot': 'Developed microservices using Spring Boot with Spring Security, JPA, and Cloud Config.',
      'CI/CD': 'Established continuous integration and deployment pipelines using Jenkins, GitHub Actions, and GitLab CI.',
      'Linux': 'Proficient in Linux system administration, shell scripting, and server configuration management.',
      'Git': 'Expert in Git version control workflows including branching strategies, code review, and conflict resolution.',
    };

    function getSkillDesc(name) {
      if (skillDescriptions[name]) return skillDescriptions[name];
      return name + ' -- Demonstrated proficiency through hands-on project work, continuous learning, and practical application in professional settings.';
    }

    // Top Skills (first 5-6 with descriptions)
    const topSkills = skills.slice(0, 6);
    const topSkillsHTML = topSkills.map(s =>
      `<li><strong>${s.skill_name}</strong> -- ${getSkillDesc(s.skill_name)}</li>`
    ).join('\n          ');

    // Work Experience
    const expHTML = workExp.map(w => {
      const dateStr = (w.start_date || 'N/A') + ' - ' + (w.end_date || 'Present');
      const desc = w.description || 'Contributed to critical projects across the engineering organization, collaborating with cross-functional teams to deliver high-quality software solutions. Participated in architecture reviews, code quality initiatives, and mentoring of junior engineers.';
      return `
      <div class="exp-block">
        <div class="exp-row">
          <div class="exp-left">
            <div class="exp-company">${w.company || 'Company'}, ${c.location || ''}</div>
            <div class="exp-title">${w.title || 'Software Engineer'}</div>
          </div>
          <div class="exp-date">${dateStr}</div>
        </div>
        <p class="exp-desc">${desc}</p>
      </div>`;
    }).join('\n');

    // Education
    const eduHTML = education.map(e => {
      const yearStr = e.end_year || e.year || '';
      return `<p class="edu-line">${e.degree || 'Degree'}${e.field_of_study ? ', ' + e.field_of_study : ''}, Graduation ${yearStr}, ${e.institution || 'University'}, ${c.location || ''}</p>`;
    }).join('\n    ');

    // Certifications
    const certListHTML = certs.length > 0 ? certs.map(ct =>
      `<li>${ct.name}${ct.issuer ? ' (' + ct.issuer + ')' : ''}${ct.year ? ', ' + ct.year : ''}</li>`
    ).join('\n          ') : '';

    const headline = c.summary || `Results-driven ${c.current_role || 'professional'} with ${c.years_of_experience || 0}+ years of experience delivering high-impact software solutions. Proven track record in full-stack development, system design, and cross-functional collaboration.`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${c.full_name} - Resume</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Noto Sans', 'Segoe UI', Arial, sans-serif;
    font-size: 13px;
    color: #1a1a1a;
    background: #fff;
    line-height: 1.55;
  }

  .page { max-width: 720px; margin: 0 auto; padding: 44px 48px; }

  /* Header */
  .hdr { border-bottom: 2px solid #111; padding-bottom: 10px; margin-bottom: 6px; }
  .hdr-top { display: flex; justify-content: space-between; align-items: baseline; }
  .hdr-top h1 { font-size: 24px; font-weight: 700; color: #000; }
  .hdr-contact { text-align: right; font-size: 12px; color: #333; line-height: 1.7; }
  .hdr-link { font-size: 12px; color: #333; margin-top: 2px; }
  .headline { font-weight: 700; font-size: 13px; color: #1a1a1a; margin: 10px 0 4px; line-height: 1.5; }

  /* Section */
  .section { margin-top: 16px; }
  .section-title {
    font-size: 14px;
    font-weight: 700;
    text-align: center;
    color: #000;
    border-bottom: 1px solid #999;
    padding-bottom: 4px;
    margin-bottom: 10px;
  }

  /* Top Skills */
  .skills-list { padding-left: 24px; }
  .skills-list li {
    margin-bottom: 6px;
    font-size: 12.5px;
    color: #222;
    line-height: 1.55;
  }
  .skills-list li strong { font-weight: 700; }

  /* Work Experience */
  .exp-block { margin-bottom: 16px; }
  .exp-row { display: flex; justify-content: space-between; align-items: baseline; }
  .exp-left {}
  .exp-company { font-size: 13px; font-weight: 400; color: #222; }
  .exp-title { font-size: 13px; font-weight: 700; font-style: italic; color: #000; }
  .exp-date { font-size: 12px; color: #333; white-space: nowrap; text-align: right; }
  .exp-desc {
    font-size: 12.5px;
    color: #222;
    margin-top: 4px;
    line-height: 1.55;
    text-align: justify;
  }

  /* Education */
  .edu-line {
    font-size: 12.5px;
    color: #222;
    margin-bottom: 4px;
    text-align: center;
  }

  /* Certifications */
  .cert-list { padding-left: 24px; }
  .cert-list li { font-size: 12.5px; color: #222; margin-bottom: 4px; }

  /* Print */
  @media print {
    .page { padding: 24px 32px; }
    body { font-size: 11px; }
  }
</style>
</head>
<body>
<div class="page">

  <div class="hdr">
    <div class="hdr-top">
      <h1>${c.full_name}</h1>
      <div class="hdr-contact">
        ${c.location || ''} | ${c.phone || ''}<br>
        ${c.email || ''}${c.linkedin_url ? ' | ' + c.linkedin_url : ''}
      </div>
    </div>
  </div>

  <p class="headline">${headline}</p>

  <!-- TOP SKILLS -->
  ${topSkillsHTML ? `
  <div class="section">
    <div class="section-title">Top Skills</div>
    <ul class="skills-list">
      ${topSkillsHTML}
    </ul>
  </div>` : ''}

  <!-- WORK EXPERIENCE -->
  ${expHTML ? `
  <div class="section">
    <div class="section-title">Work Experience</div>
    ${expHTML}
  </div>` : ''}

  <!-- EDUCATION -->
  ${eduHTML ? `
  <div class="section">
    <div class="section-title">Education</div>
    ${eduHTML}
  </div>` : ''}

  <!-- CERTIFICATIONS -->
  ${certListHTML ? `
  <div class="section">
    <div class="section-title">Certifications</div>
    <ul class="cert-list">
      ${certListHTML}
    </ul>
  </div>` : ''}

</div>
</body>
</html>`;

    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

// ΓöÇΓöÇ ATS Score ΓöÇΓöÇ
router.get('/:id/ats-score', (req, res) => {
  try {
    const db = getDb();
    const c = db.data.candidates.find(x => x.id === req.params.id);
    if (!c) return res.status(404).json({ error: { message: 'Candidate not found' } });

    const skills = (db.data.candidate_skills || []).filter(s => s.candidate_id === c.id).map(s => s.skill_name);
    const jd = req.query.jd || 'Senior Full Stack Engineer with expertise in React, Node.js, Python, AWS, and agile methodologies.';
    const jdLower = jd.toLowerCase();
    const jdWords = new Set(jdLower.match(/\b[a-z+#.]{2,}\b/g) || []);
    const candText = `${c.full_name} ${c.current_role} ${c.summary} ${skills.join(' ')}`.toLowerCase();
    const candWords = new Set(candText.match(/\b[a-z+#.]{2,}\b/g) || []);

    const matched = [...jdWords].filter(w => candWords.has(w));
    const missing = [...jdWords].filter(w => !candWords.has(w));
    const matchedSkills = skills.filter(s => jdLower.includes(s.toLowerCase()));

    const keywordScore = matched.length / Math.max(jdWords.size, 1);
    const skillScore = matchedSkills.length / Math.max(skills.length, 1);
    const expScore = Math.min((c.years_of_experience || 0) / 10, 1);
    const raw = keywordScore * 30 + skillScore * 35 + expScore * 15 + 10 + (skills.length > 0 ? 10 : 5);
    const finalScore = Math.max(25, Math.min(98, Math.round(raw)));

    res.json({
      ats_score: finalScore,
      grade: finalScore >= 85 ? 'A' : finalScore >= 70 ? 'B' : finalScore >= 55 ? 'C' : 'D',
      keyword_match: Math.round(keywordScore * 100),
      skills_match: Math.round(skillScore * 100),
      matched_skills: matchedSkills,
      matched_keywords: matched.slice(0, 15),
      missing_keywords: missing.slice(0, 10),
      recommendations: [
        missing.length > 0 ? `Add: ${missing.slice(0, 5).join(', ')}` : 'Great keyword coverage!',
        `Skills: ${matchedSkills.length}/${skills.length} match`,
      ],
    });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.post('/bulk/action', (req, res) => {
  try {
    const db = getDb();
    const { candidate_ids, action, params: ap } = req.body;
    if (action === 'move_stage' && ap?.stage_id && ap?.job_id) {
      candidate_ids.forEach(cid => { const idx = db.data.applications.findIndex(a => a.candidate_id === cid && a.job_id === ap.job_id); if (idx >= 0) { db.data.applications[idx].stage_id = ap.stage_id; db.data.applications[idx].stage_entered_at = new Date().toISOString(); } });
    } else if (action === 'update_status') {
      candidate_ids.forEach(cid => { const idx = db.data.candidates.findIndex(c => c.id === cid); if (idx >= 0) db.data.candidates[idx].status = ap?.status || 'Active'; });
    }
    db.save();
    res.json({ message: `Bulk action on ${candidate_ids.length} candidates` });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

// ΓöÇΓöÇ Semantic Search & Indexing ΓöÇΓöÇ

/**
 * Compiles a rich text representation of a candidate for embedding.
 */
function getCandidateSearchText(c, db) {
  const skills = (db.data.candidate_skills || []).filter(s => s.candidate_id === c.id).map(s => s.skill_name).join(', ');
  const exp = (db.data.work_experience || []).filter(w => w.candidate_id === c.id).map(w => `${w.title} at ${w.company}: ${w.description}`).join('. ');
  return `${c.full_name}. ${c.current_role} at ${c.current_company}. Skills: ${skills}. Summary: ${c.summary}. Exp: ${exp}`.substring(0, 5000);
}

/**
 * Index all candidates: Generate and store embeddings.
 */
router.post('/index', async (req, res) => {
  try {
    const db = getDb();
    const candidates = db.data.candidates || [];
    console.log(`Indexing ${candidates.length} candidates...`);

    if (!db.data.candidate_embeddings) db.data.candidate_embeddings = [];

    for (const c of candidates) {
      const text = getCandidateSearchText(c, db);
      const embedding = await vectorEngine.generateEmbedding(text);

      const idx = db.data.candidate_embeddings.findIndex(e => e.candidate_id === c.id);
      if (idx >= 0) {
        db.data.candidate_embeddings[idx].vector = embedding;
        db.data.candidate_embeddings[idx].updated_at = new Date().toISOString();
      } else {
        db.data.candidate_embeddings.push({
          candidate_id: c.id,
          vector: embedding,
          created_at: new Date().toISOString()
        });
      }
    }

    db.save();
    res.json({ status: 'success', message: `Indexed ${candidates.length} candidates.` });
  } catch (err) {
    console.error('Indexing Error:', err);
    res.status(500).json({ error: { message: err.message } });
  }
});

/**
 * Semantic Search: Find candidates by conceptual similarity.
 */
router.get('/semantic-search', async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;
    if (!query) return res.status(400).json({ error: { message: 'Query is required' } });

    const db = getDb();
    const queryEmbedding = await vectorEngine.generateEmbedding(query);
    const embeddings = db.data.candidate_embeddings || [];

    const results = embeddings.map(e => {
      const similarity = vectorEngine.cosineSimilarity(queryEmbedding, e.vector);
      return { candidate_id: e.candidate_id, score: similarity };
    });

    // Sort by similarity score descending
    results.sort((a, b) => b.score - a.score);

    const topResults = results.slice(0, parseInt(limit));
    const enriched = topResults.map(r => {
      const c = db.data.candidates.find(x => x.id === r.candidate_id);
      if (!c) return null;
      return {
        ...buildFrontendCandidate(c, db),
        match_score: Math.round(r.score * 100)
      };
    }).filter(Boolean);

    res.json({ status: 'success', data: enriched });
  } catch (err) {
    console.error('Semantic Search Error:', err);
    res.status(500).json({ error: { message: err.message } });
  }
});

module.exports = router;
