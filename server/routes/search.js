const express = require('express');
const router = express.Router();

// Natural language search
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  try {
    // Parse natural language into structured filters (simulated AI)
    const filters = parseNaturalLanguage(query);
    
    let sql = `SELECT DISTINCT c.*, GROUP_CONCAT(DISTINCT cs.skill_name) as skills_list,
      GROUP_CONCAT(DISTINCT cs.category) as skill_categories
      FROM candidates c
      LEFT JOIN candidate_skills cs ON c.id = cs.candidate_id`;
    let conditions = [];
    let params = [];

    if (filters.skills.length) {
      conditions.push(`cs.skill_name IN (${filters.skills.map(() => '?').join(',')})`);
      params.push(...filters.skills);
    }
    if (filters.seniority) { conditions.push('c.seniority_level = ?'); params.push(filters.seniority); }
    if (filters.location) { conditions.push('c.location LIKE ?'); params.push(`%${filters.location}%`); }
    if (filters.minYears) { conditions.push('c.years_experience >= ?'); params.push(filters.minYears); }

    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' GROUP BY c.id ORDER BY c.years_experience DESC LIMIT 20';

    const results = db.prepare(sql).all(...params);
    
    // Calculate match scores and generate explanations
    const scored = results.map(c => {
      const matchScore = calculateMatchScore(c, filters, query);
      return {
        ...c,
        skills_list: c.skills_list ? c.skills_list.split(',') : [],
        skill_categories: c.skill_categories ? [...new Set(c.skill_categories.split(','))] : [],
        match_score: matchScore,
        match_explanation: generateExplanation(c, filters, matchScore)
      };
    }).sort((a, b) => b.match_score - a.match_score);

    // Save search query
    db.prepare('INSERT INTO search_queries (query, filters, result_count) VALUES (?,?,?)').run(query, JSON.stringify(filters), scored.length);

    res.json({ results: scored, filters_applied: filters, total: scored.length, query });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function parseNaturalLanguage(query) {
  const q = query.toLowerCase();
  const filters = { skills: [], seniority: null, location: null, minYears: null, keywords: [] };

  // Skills mapping
  const skillMap = {
    'react': 'React', 'vue': 'Vue.js', 'angular': 'Angular', 'node': 'Node.js', 'python': 'Python',
    'java': 'Java', 'go': 'Go', 'rust': 'Rust', 'typescript': 'TypeScript', 'next.js': 'Next.js', 'nextjs': 'Next.js',
    'docker': 'Docker', 'kubernetes': 'Kubernetes', 'aws': 'AWS', 'gcp': 'GCP', 'azure': 'Azure',
    'tensorflow': 'TensorFlow', 'pytorch': 'PyTorch', 'machine learning': 'Scikit-learn', 'ml': 'Scikit-learn',
    'nlp': 'NLP', 'django': 'Django', 'fastapi': 'FastAPI', 'spring': 'Spring Boot',
    'flutter': 'Flutter', 'swift': 'Swift', 'kotlin': 'Kotlin', 'react native': 'React Native',
    'graphql': 'GraphQL Client', 'redux': 'Redux', 'terraform': 'Terraform',
    'sql': 'SQL', 'postgresql': 'SQL', 'css': 'HTML/CSS', 'html': 'HTML/CSS',
    'ruby': 'Ruby', 'php': 'PHP', 'c#': 'C#', 'laravel': 'Laravel'
  };
  Object.entries(skillMap).forEach(([key, val]) => { if (q.includes(key)) filters.skills.push(val); });

  // Seniority
  if (q.includes('senior') || q.includes('sr.')) filters.seniority = 'Senior';
  else if (q.includes('junior') || q.includes('jr.')) filters.seniority = 'Junior';
  else if (q.includes('lead') || q.includes('principal')) filters.seniority = 'Lead';
  else if (q.includes('executive') || q.includes('director') || q.includes('vp')) filters.seniority = 'Executive';
  else if (q.includes('mid')) filters.seniority = 'Mid';

  // Location
  const locationMap = {
    'bangalore': 'Bangalore', 'bengaluru': 'Bangalore', 'san francisco': 'San Francisco',
    'sf': 'San Francisco', 'new york': 'New York', 'nyc': 'New York', 'london': 'London',
    'berlin': 'Berlin', 'toronto': 'Toronto', 'singapore': 'Singapore', 'seattle': 'Seattle',
    'austin': 'Austin', 'remote': 'Remote', 'mumbai': 'Mumbai', 'chicago': 'Chicago',
    'boston': 'Boston', 'denver': 'Denver', 'amsterdam': 'Amsterdam', 'sydney': 'Sydney',
    'hyderabad': 'Hyderabad', 'dublin': 'Dublin', 'stockholm': 'Stockholm', 'tel aviv': 'Tel Aviv'
  };
  Object.entries(locationMap).forEach(([key, val]) => { if (q.includes(key) && !filters.location) filters.location = val; });

  // Years
  const yearsMatch = q.match(/(\d+)\+?\s*years?/);
  if (yearsMatch) filters.minYears = parseInt(yearsMatch[1]);

  return filters;
}

function calculateMatchScore(candidate, filters, query) {
  let score = 50;
  if (filters.seniority && candidate.seniority_level === filters.seniority) score += 20;
  if (filters.location && candidate.location && candidate.location.toLowerCase().includes(filters.location.toLowerCase())) score += 15;
  if (filters.skills.length && candidate.skills_list) {
    const candidateSkills = candidate.skills_list.map(s => s.toLowerCase());
    const matched = filters.skills.filter(s => candidateSkills.includes(s.toLowerCase()));
    score += (matched.length / Math.max(filters.skills.length, 1)) * 30;
  }
  if (filters.minYears && candidate.years_experience >= filters.minYears) score += 10;
  return Math.min(Math.round(score + Math.random() * 5), 99);
}

function generateExplanation(candidate, filters, score) {
  const parts = [];
  if (filters.seniority && candidate.seniority_level === filters.seniority) parts.push(`${candidate.seniority_level}-level match`);
  if (filters.location && candidate.location?.toLowerCase().includes(filters.location.toLowerCase())) parts.push(`Based in ${candidate.location}`);
  if (filters.skills.length && candidate.skills_list) {
    const matched = filters.skills.filter(s => candidate.skills_list.map(sk => sk.toLowerCase()).includes(s.toLowerCase()));
    if (matched.length) parts.push(`Skills: ${matched.join(', ')}`);
  }
  if (candidate.years_experience) parts.push(`${candidate.years_experience} years experience`);
  return parts.length ? parts.join(' · ') : `Potential match based on profile analysis`;
}

module.exports = router;
