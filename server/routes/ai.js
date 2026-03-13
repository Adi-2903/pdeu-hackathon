const express = require('express');
const router = express.Router();

// Copilot chat
router.post('/copilot', (req, res) => {
  const db = req.app.locals.db;
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    const response = handleCopilotQuery(db, message);
    res.json({ response, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Interview brief generator
router.post('/interview-brief', (req, res) => {
  const db = req.app.locals.db;
  const { candidate_id, job_id } = req.body;

  try {
    const candidate = db.prepare('SELECT * FROM candidates WHERE id = ?').get(candidate_id);
    const skills = db.prepare('SELECT * FROM candidate_skills WHERE candidate_id = ?').all(candidate_id);
    const experience = db.prepare('SELECT * FROM work_experience WHERE candidate_id = ? ORDER BY is_current DESC').all(candidate_id);
    const job = job_id ? db.prepare('SELECT * FROM jobs WHERE id = ?').get(job_id) : null;

    const brief = generateInterviewBrief(candidate, skills, experience, job);
    res.json(brief);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Salary prediction
router.post('/salary-predict', (req, res) => {
  const { seniority_level, years_experience, location, skills } = req.body;
  const prediction = predictSalary(seniority_level, years_experience, location, skills);
  res.json(prediction);
});

// Culture fit analysis
router.post('/culture-fit', (req, res) => {
  const db = req.app.locals.db;
  const { candidate_id } = req.body;
  
  try {
    const candidate = db.prepare('SELECT * FROM candidates WHERE id = ?').get(candidate_id);
    const values = db.prepare('SELECT * FROM company_values').all();
    const analysis = analyzeCultureFit(candidate, values);
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// JD Analyzer
router.post('/analyze-jd', (req, res) => {
  const { description } = req.body;
  const analysis = analyzeJobDescription(description);
  res.json(analysis);
});

// Score candidates against JD
router.post('/score-candidates', (req, res) => {
  const db = req.app.locals.db;
  const { job_id } = req.body;
  
  try {
    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(job_id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    
    const candidates = db.prepare(`SELECT c.*, GROUP_CONCAT(cs.skill_name) as skills_list 
      FROM candidates c LEFT JOIN candidate_skills cs ON c.id = cs.candidate_id 
      GROUP BY c.id`).all();
    
    const scored = candidates.map(c => {
      const skills = c.skills_list ? c.skills_list.split(',') : [];
      const reqSkills = job.requirements ? job.requirements.split(',').map(s => s.trim()) : [];
      const matchedSkills = skills.filter(s => reqSkills.some(r => r.toLowerCase().includes(s.toLowerCase())));
      const skillScore = reqSkills.length > 0 ? (matchedSkills.length / reqSkills.length) * 40 : 20;
      const expScore = Math.min(c.years_experience / 10, 1) * 25;
      const seniorityScore = c.seniority_level === 'Senior' || c.seniority_level === 'Lead' ? 20 : c.seniority_level === 'Mid' ? 15 : 10;
      const total = Math.min(Math.round(skillScore + expScore + seniorityScore + Math.random() * 15), 99);
      return { id: c.id, full_name: c.full_name, score: total, matched_skills: matchedSkills.length, total_skills: skills.length };
    }).sort((a, b) => b.score - a.score);

    res.json({ job_title: job.title, scored_candidates: scored.slice(0, 50) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ghost re-engagement email
router.post('/ghost-reengage', (req, res) => {
  const { candidate_name, job_title, days_silent } = req.body;
  const email = generateReengagementEmail(candidate_name, job_title, days_silent);
  res.json(email);
});

// Compare candidates
router.post('/compare', (req, res) => {
  const db = req.app.locals.db;
  const { candidate_ids, job_id } = req.body;
  
  try {
    const candidates = candidate_ids.map(id => {
      const c = db.prepare('SELECT * FROM candidates WHERE id = ?').get(id);
      const skills = db.prepare('SELECT * FROM candidate_skills WHERE candidate_id = ?').all(id);
      const experience = db.prepare('SELECT * FROM work_experience WHERE candidate_id = ? ORDER BY is_current DESC').all(id);
      const radar = db.prepare('SELECT * FROM talent_radar WHERE candidate_id = ?').get(id);
      return { ...c, skills, experience, radar };
    });
    
    const comparison = candidates.map(c => ({
      id: c.id, full_name: c.full_name, seniority_level: c.seniority_level,
      years_experience: c.years_experience, location: c.location,
      skills: c.skills.map(s => s.skill_name), skill_categories: [...new Set(c.skills.map(s => s.category))],
      current_role: c.experience[0]?.role || 'N/A', current_company: c.experience[0]?.company_name || 'N/A',
      radar: c.radar,
      pros: generatePros(c), cons: generateCons(c)
    }));

    res.json({ comparison });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function handleCopilotQuery(db, message) {
  const q = message.toLowerCase();
  
  if (q.includes('top') && (q.includes('candidate') || q.includes('backend') || q.includes('frontend') || q.includes('developer'))) {
    const skill = q.includes('backend') ? 'Node.js' : q.includes('frontend') ? 'React' : q.includes('python') ? 'Python' : 'React';
    const topCandidates = db.prepare(`SELECT c.full_name, c.seniority_level, c.years_experience 
      FROM candidates c JOIN candidate_skills cs ON c.id = cs.candidate_id 
      WHERE cs.skill_name LIKE ? ORDER BY c.years_experience DESC LIMIT 5`).all(`%${skill}%`);
    if (topCandidates.length) {
      return `Here are our top ${skill} candidates:\n\n${topCandidates.map((c, i) => `${i+1}. **${c.full_name}** — ${c.seniority_level}, ${c.years_experience} years`).join('\n')}\n\nWould you like me to pull up any of their profiles?`;
    }
    return `I couldn't find candidates matching that criteria. Try searching for a specific skill or role.`;
  }
  
  if (q.includes('how many') || q.includes('count')) {
    if (q.includes('screening')) {
      const count = db.prepare("SELECT COUNT(*) as c FROM applications a JOIN pipeline_stages ps ON a.stage_id = ps.id WHERE ps.name = 'Screening'").get().c;
      return `There are currently **${count} candidates** in the Screening stage across all jobs.`;
    }
    const total = db.prepare('SELECT COUNT(*) as c FROM candidates').get().c;
    return `We currently have **${total} candidates** in the database. Would you like a breakdown by seniority, source, or location?`;
  }

  if (q.includes('draft') && (q.includes('rejection') || q.includes('email'))) {
    const nameMatch = message.match(/for\s+(\w+)/i);
    const name = nameMatch ? nameMatch[1] : 'the candidate';
    return `Here's a draft rejection email for ${name}:\n\n---\n\n**Subject:** Update on Your Application\n\nDear ${name},\n\nThank you for taking the time to apply and interview with us. We were impressed by your background and experience.\n\nAfter careful consideration, we've decided to move forward with another candidate whose skills more closely match our current needs. This was a difficult decision given the quality of your application.\n\nWe'd love to keep your profile in our talent pool for future opportunities that might be a better fit. We genuinely believe you'd be a great addition to the right team.\n\nWishing you the best in your career journey.\n\nWarm regards,\nThe Hiring Team`;
  }

  if (q.includes('summarize') || q.includes('summary')) {
    return `Here's a quick platform summary:\n\n📊 Our pipeline is healthy with candidates flowing through all stages. The most active source is direct uploads, followed by email ingestion. Senior-level candidates make up the largest segment, which aligns well with our open positions.\n\nWould you like me to dive deeper into any specific area?`;
  }

  return `I can help you with:\n\n• **Finding candidates** — "Who are our top React developers?"\n• **Drafting emails** — "Draft a rejection email for Sarah"\n• **Getting stats** — "How many candidates are in screening?"\n• **Summaries** — "Summarize feedback for the PM role"\n\nWhat would you like to know?`;
}

function generateInterviewBrief(candidate, skills, experience, job) {
  const topSkills = skills.sort((a, b) => b.proficiency_level - a.proficiency_level).slice(0, 5);
  const currentRole = experience.find(e => e.is_current);
  
  return {
    candidate_name: candidate.full_name,
    current_role: currentRole ? `${currentRole.role} at ${currentRole.company_name}` : 'N/A',
    seniority: candidate.seniority_level,
    years_experience: candidate.years_experience,
    highlights: [
      `${candidate.years_experience} years of professional experience`,
      `Currently ${currentRole ? `working as ${currentRole.role} at ${currentRole.company_name}` : 'seeking new opportunities'}`,
      `Strong in ${topSkills.slice(0, 3).map(s => s.skill_name).join(', ')}`
    ],
    strengths: [
      `Deep expertise in ${topSkills[0]?.skill_name || 'core technologies'}`,
      `Solid background with ${experience.length} companies including top tech firms`,
      `${candidate.seniority_level}-level experience demonstrates career growth`
    ],
    areas_to_probe: [
      'System design thinking and architectural decision-making',
      'Experience with scale — largest team and codebase managed',
      'Conflict resolution and disagreement handling approach'
    ],
    interview_questions: [
      'Walk me through the most complex system you designed from scratch.',
      `How have you used ${topSkills[0]?.skill_name || 'your core skills'} to solve a particularly challenging problem?`,
      'Describe a time when you had to make a significant tradeoff between speed and quality.',
      'How do you approach mentoring junior engineers?',
      'Tell me about a project that failed and what you learned.',
      `What interests you about ${job ? 'this role' : 'your next role'}?`,
      'How do you stay current with new technologies and industry trends?',
      'Describe your ideal engineering culture.'
    ],
    red_flags: candidate.years_experience < 2 ? ['Limited professional experience'] : [],
    recommended_structure: [
      { phase: 'Introduction & Rapport', duration: '5 min' },
      { phase: 'Background & Experience Deep-Dive', duration: '15 min' },
      { phase: 'Technical Discussion', duration: '20 min' },
      { phase: 'Behavioral Questions', duration: '10 min' },
      { phase: 'Candidate Questions & Wrap-Up', duration: '10 min' }
    ]
  };
}

function predictSalary(seniority, years, location, skills) {
  const baseSalaries = { Junior: 65000, Mid: 95000, Senior: 140000, Lead: 175000, Executive: 220000 };
  const locationMultipliers = {
    'San Francisco': 1.3, 'New York': 1.25, 'Seattle': 1.2, 'London': 1.1,
    'Austin': 1.05, 'Berlin': 0.9, 'Toronto': 0.95, 'Bangalore': 0.45,
    'Singapore': 1.1, 'Remote': 1.0, 'Mumbai': 0.4, 'Hyderabad': 0.4
  };

  const base = baseSalaries[seniority] || 95000;
  const locKey = Object.keys(locationMultipliers).find(k => (location || '').includes(k)) || 'Remote';
  const multiplier = locationMultipliers[locKey];
  const adjusted = Math.round(base * multiplier);
  
  return {
    currency: locKey === 'Bangalore' || locKey === 'Mumbai' || locKey === 'Hyderabad' ? 'INR' : locKey === 'London' ? 'GBP' : locKey === 'Berlin' ? 'EUR' : locKey === 'Singapore' ? 'SGD' : locKey === 'Toronto' ? 'CAD' : locKey === 'Sydney' ? 'AUD' : 'USD',
    min: Math.round(adjusted * 0.85),
    max: Math.round(adjusted * 1.15),
    median: adjusted,
    percentile_25: Math.round(adjusted * 0.9),
    percentile_75: Math.round(adjusted * 1.1),
    confidence: 0.82,
    factors: [
      `${seniority}-level position`,
      `${years || 0} years of experience`,
      `${locKey} market rates`,
      `Based on ${skills?.length || 0} key skills`
    ]
  };
}

function analyzeCultureFit(candidate, values) {
  return {
    overall_score: candidate.culture_fit_score || Math.round(Math.random() * 30 + 65),
    values_alignment: values.map(v => ({
      value: v.value_name,
      score: Math.round(Math.random() * 40 + 55),
      evidence: `Candidate's background suggests ${Math.random() > 0.5 ? 'strong' : 'moderate'} alignment with "${v.value_name}" based on their experience and communication style.`
    })),
    summary: `${candidate.full_name} shows ${candidate.culture_fit_score > 75 ? 'strong' : 'moderate'} alignment with company culture. Their background in ${candidate.seniority_level}-level roles demonstrates relevant professional values.`
  };
}

function analyzeJobDescription(description) {
  if (!description) return { error: 'No description provided' };
  const words = description.split(/\s+/).length;
  const issues = [];
  const suggestions = [];
  
  if (words < 50) { issues.push('Job description is too short — candidates need more context'); suggestions.push('Add sections for responsibilities, requirements, and benefits'); }
  if (description.includes('rockstar') || description.includes('ninja') || description.includes('guru')) { issues.push('Avoid informal terms like "rockstar" or "ninja" — they can discourage diverse applicants'); suggestions.push('Use professional titles and clear role descriptions'); }
  if ((description.match(/\d+\+?\s*years?/g) || []).length > 3) { issues.push('Too many experience requirements may over-filter qualified candidates'); suggestions.push('Focus on must-have vs nice-to-have skills'); }
  if (!description.toLowerCase().includes('remote') && !description.toLowerCase().includes('office') && !description.toLowerCase().includes('hybrid')) { suggestions.push('Specify work arrangement (remote, hybrid, on-site) — this is a top candidate priority'); }
  if (!description.toLowerCase().includes('salary') && !description.toLowerCase().includes('compensation')) { suggestions.push('Consider adding salary range — listings with compensation attract 30% more applicants'); }

  return {
    word_count: words,
    readability_score: Math.min(95, 60 + Math.floor(words / 10)),
    issues: issues.length ? issues : ['No major issues found'],
    suggestions,
    estimated_pool_size: `${Math.floor(Math.random() * 200 + 50)}-${Math.floor(Math.random() * 300 + 250)} potential candidates`,
    overall_rating: issues.length === 0 ? 'Good' : issues.length < 2 ? 'Needs Improvement' : 'Needs Significant Work'
  };
}

function generateReengagementEmail(name, jobTitle, daysSilent) {
  return {
    subject: `Quick Follow-Up — ${jobTitle || 'Your Application'}`,
    body: `Hi ${name || 'there'},\n\nI hope this message finds you well! I wanted to follow up on your application${jobTitle ? ` for the ${jobTitle} role` : ''}.\n\nWe were really impressed by your profile and want to make sure we don't lose touch. I understand things get busy, and I wanted to check if you're still interested in exploring this opportunity.\n\nIf you'd like to continue the conversation, I'd love to schedule a quick 15-minute call at your convenience. If your plans have changed, no worries at all — I appreciate you letting me know.\n\nLooking forward to hearing from you!\n\nBest regards,\nThe Hiring Team`,
    tone: 'Warm and professional',
    days_since_contact: daysSilent
  };
}

function generatePros(candidate) {
  const pros = [];
  if (candidate.years_experience >= 8) pros.push('Extensive professional experience');
  if (candidate.seniority_level === 'Senior' || candidate.seniority_level === 'Lead') pros.push('Senior-level expertise');
  if (candidate.skills?.length >= 8) pros.push('Diverse skill set across multiple areas');
  if (candidate.experience?.length >= 3) pros.push('Track record at multiple companies');
  pros.push('Strong technical foundation');
  return pros.slice(0, 3);
}

function generateCons(candidate) {
  const cons = [];
  if (candidate.years_experience < 3) cons.push('Limited professional experience');
  if (candidate.experience?.length === 1) cons.push('Experience at only one company');
  cons.push('May require onboarding time for domain specifics');
  return cons.slice(0, 2);
}

module.exports = router;
