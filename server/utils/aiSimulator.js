const { v4: uuidv4 } = require('uuid');

// --- AI Simulator: produces realistic mock responses ---

function simulateResumeParser(text, fileName) {
  const names = ['Sarah Chen', 'Marcus Johnson', 'Priya Patel', 'Alex Novak'];
  const name = names[Math.floor(Math.random() * names.length)];
  return {
    full_name: name,
    email: name.toLowerCase().replace(' ', '.') + '@email.com',
    phone: '+1-' + Math.floor(200 + Math.random() * 800) + '-' + Math.floor(100 + Math.random() * 900) + '-' + Math.floor(1000 + Math.random() * 9000),
    location: ['San Francisco, CA', 'New York, NY', 'Bangalore, India', 'London, UK', 'Austin, TX'][Math.floor(Math.random() * 5)],
    linkedin_url: `https://linkedin.com/in/${name.toLowerCase().replace(' ', '-')}`,
    github_url: `https://github.com/${name.toLowerCase().replace(' ', '')}`,
    summary: `Experienced software engineer with expertise in full-stack development, specializing in modern web technologies and cloud infrastructure.`,
    years_of_experience: Math.floor(2 + Math.random() * 12),
    seniority_level: ['Junior', 'Mid', 'Senior', 'Lead'][Math.floor(Math.random() * 4)],
    current_role: ['Software Engineer', 'Senior Developer', 'Tech Lead', 'Full Stack Developer'][Math.floor(Math.random() * 4)],
    current_company: ['Google', 'Microsoft', 'Amazon', 'Stripe', 'Shopify'][Math.floor(Math.random() * 5)],
    skills: [
      { name: 'React', category: 'Frontend', proficiency: 4 },
      { name: 'Node.js', category: 'Backend', proficiency: 4 },
      { name: 'Python', category: 'Backend', proficiency: 3 },
      { name: 'TypeScript', category: 'Frontend', proficiency: 5 },
      { name: 'AWS', category: 'DevOps', proficiency: 3 },
      { name: 'Docker', category: 'DevOps', proficiency: 3 },
      { name: 'PostgreSQL', category: 'Backend', proficiency: 4 },
      { name: 'Team Leadership', category: 'Soft Skills', proficiency: 3 },
    ],
    work_experience: [
      { company_name: 'Stripe', role: 'Senior Software Engineer', start_date: '2021-03', end_date: null, is_current: true, description: 'Led development of payment processing microservices handling 10M+ transactions daily.' },
      { company_name: 'Shopify', role: 'Software Engineer', start_date: '2018-06', end_date: '2021-02', is_current: false, description: 'Built React-based merchant dashboard used by 500K+ stores.' },
    ],
    education: [
      { institution: 'Stanford University', degree: 'M.S.', field_of_study: 'Computer Science', start_year: 2016, end_year: 2018 },
      { institution: 'UC Berkeley', degree: 'B.S.', field_of_study: 'Computer Science', start_year: 2012, end_year: 2016 },
    ],
    certifications: [
      { name: 'AWS Solutions Architect', issuer: 'Amazon', year: 2022 }
    ],
    languages: ['English', 'Mandarin'],
    confidence_scores: {
      full_name: 0.98, email: 0.95, phone: 0.90, location: 0.85,
      work_experience: 0.92, education: 0.94, skills: 0.88
    },
    flags: []
  };
}

function simulateCandidateScoring(candidate, jobDescription) {
  const baseScore = 40 + Math.floor(Math.random() * 55);
  const skillOverlap = 60 + Math.floor(Math.random() * 35);
  const experienceMatch = 50 + Math.floor(Math.random() * 45);
  const seniorityMatch = 55 + Math.floor(Math.random() * 40);
  const locationMatch = 70 + Math.floor(Math.random() * 30);
  const educationMatch = 65 + Math.floor(Math.random() * 30);

  const overall = Math.round((skillOverlap * 0.35 + experienceMatch * 0.25 + seniorityMatch * 0.20 + locationMatch * 0.10 + educationMatch * 0.10));

  return {
    overall_score: overall,
    breakdown: { skillOverlap, experienceMatch, seniorityMatch, locationMatch, educationMatch },
    explanation: `Strong match based on ${candidate.current_role || 'technical'} background. Skills alignment at ${skillOverlap}%, with ${candidate.years_of_experience || 5}+ years of relevant experience.`,
    pros: [
      'Strong technical foundation with relevant stack experience',
      'Progressive career growth showing leadership potential',
      'Experience at high-scale companies'
    ],
    cons: [
      'May require upskilling in specific domain areas',
      'Salary expectations might exceed budget range'
    ]
  };
}

function simulateNLSearch(query) {
  const filters = {};
  const q = query.toLowerCase();

  if (q.includes('senior')) filters.seniority_level = 'Senior';
  else if (q.includes('junior')) filters.seniority_level = 'Junior';
  else if (q.includes('lead')) filters.seniority_level = 'Lead';
  else if (q.includes('mid')) filters.seniority_level = 'Mid';

  const skillKeywords = ['react', 'node', 'python', 'java', 'typescript', 'go', 'rust', 'angular', 'vue', 'django', 'flask', 'spring', 'kubernetes', 'docker', 'aws', 'gcp', 'azure', 'mongodb', 'postgresql', 'redis', 'graphql', 'flutter', 'swift', 'kotlin'];
  filters.skills = skillKeywords.filter(s => q.includes(s));

  const locations = { 'bangalore': 'Bangalore, India', 'san francisco': 'San Francisco, CA', 'new york': 'New York, NY', 'london': 'London, UK', 'austin': 'Austin, TX', 'chicago': 'Chicago, IL', 'seattle': 'Seattle, WA', 'remote': 'Remote', 'toronto': 'Toronto, Canada', 'berlin': 'Berlin, Germany' };
  for (const [key, val] of Object.entries(locations)) {
    if (q.includes(key)) { filters.location = val; break; }
  }

  if (q.includes('remote')) filters.remote = true;
  if (q.includes('fintech') || q.includes('finance')) filters.domain = 'Fintech';
  if (q.includes('healthtech') || q.includes('health')) filters.domain = 'Healthcare';
  if (q.includes('edtech') || q.includes('education')) filters.domain = 'EdTech';

  return {
    interpreted_query: `Searching for ${filters.seniority_level || 'any level'} candidates${filters.skills?.length ? ' with skills: ' + filters.skills.join(', ') : ''}${filters.location ? ' in ' + filters.location : ''}${filters.remote ? ' (open to remote)' : ''}${filters.domain ? ' with ' + filters.domain + ' experience' : ''}`,
    filters,
    search_type: 'hybrid_keyword_semantic'
  };
}

function simulateSalaryPrediction(candidate) {
  const baseSalaries = { 'Junior': 65000, 'Mid': 95000, 'Senior': 135000, 'Lead': 165000, 'Executive': 210000 };
  const base = baseSalaries[candidate.seniority_level] || 95000;
  const locationMultiplier = { 'San Francisco, CA': 1.3, 'New York, NY': 1.25, 'Seattle, WA': 1.2, 'Austin, TX': 1.05, 'London, UK': 1.15, 'Bangalore, India': 0.45, 'Toronto, Canada': 0.9, 'Berlin, Germany': 0.85, 'Remote': 1.0 };
  const mult = locationMultiplier[candidate.location] || 1.0;
  const min = Math.round(base * mult * 0.9 / 1000) * 1000;
  const max = Math.round(base * mult * 1.15 / 1000) * 1000;
  return {
    currency: 'USD', min_salary: min, max_salary: max, median_salary: Math.round((min + max) / 2 / 1000) * 1000,
    confidence: 0.78,
    factors: [
      `${candidate.seniority_level || 'Mid'}-level role in ${candidate.location || 'US'}`,
      `${candidate.years_of_experience || 5} years of experience`,
      `Market data from similar roles in the region`
    ]
  };
}

function simulateTalentRadar(candidate) {
  return {
    technical_depth: 40 + Math.floor(Math.random() * 55),
    communication: 45 + Math.floor(Math.random() * 50),
    leadership: 30 + Math.floor(Math.random() * 60),
    domain_knowledge: 40 + Math.floor(Math.random() * 55),
    cultural_fit: 50 + Math.floor(Math.random() * 45),
    growth_trajectory: 45 + Math.floor(Math.random() * 50),
  };
}

function simulateCultureFit(candidate, companyValues) {
  const results = companyValues.map(value => {
    const score = 40 + Math.floor(Math.random() * 55);
    const quotes = [
      `"Took ownership of the entire CI/CD pipeline migration"`,
      `"Led cross-functional team of 8 engineers to deliver ahead of schedule"`,
      `"Implemented data-driven approach to reduce latency by 40%"`,
      `"Proactively identified and resolved production bottlenecks"`,
      `"Mentored 3 junior engineers through their first quarterly reviews"`,
    ];
    return {
      value: value,
      score,
      supporting_quotes: [quotes[Math.floor(Math.random() * quotes.length)]],
      alignment: score > 70 ? 'Strong' : score > 50 ? 'Moderate' : 'Low'
    };
  });
  const avg = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
  return { overall_score: avg, values: results };
}

function simulateInterviewBrief(candidate, job) {
  return {
    candidate_name: candidate.full_name,
    job_title: job?.title || 'Software Engineer',
    highlights: [
      `${candidate.years_of_experience || 5}+ years of experience in software development`,
      `Currently at ${candidate.current_company || 'a top tech company'} as ${candidate.current_role || 'Senior Engineer'}`,
      `Strong background in modern web technologies and cloud infrastructure`
    ],
    strengths: [
      'Proven track record of delivering complex projects at scale',
      'Strong technical depth across frontend and backend',
      'Experience mentoring and leading engineering teams'
    ],
    areas_to_probe: [
      'Depth of system design experience for distributed systems',
      'Approach to handling ambiguity and shifting priorities',
      'Long-term career goals and motivation for this role'
    ],
    custom_questions: [
      'Describe a time you had to make a critical architecture decision under tight deadlines. What trade-offs did you consider?',
      'How do you approach breaking down a large feature into shippable increments?',
      'Tell me about a production incident you led the resolution for. What was your approach?',
      'How do you stay current with evolving technology trends while maintaining productivity?',
      'Describe your experience with code review processes. What do you look for?',
      'How would you handle disagreements with a product manager about technical feasibility?',
      'Walk me through how you would design a real-time notification system at scale.',
      'What metrics do you use to evaluate the success of an engineering project?'
    ],
    red_flags: [
      'Short tenure at previous companies — explore reasons for transitions',
      'Resume gaps between 2019-2020 — verify circumstances'
    ],
    recommended_structure: [
      { phase: 'Introduction & Rapport', duration: '5 min' },
      { phase: 'Technical Deep Dive', duration: '20 min' },
      { phase: 'System Design Discussion', duration: '15 min' },
      { phase: 'Behavioral & Culture Fit', duration: '10 min' },
      { phase: 'Candidate Questions', duration: '10 min' },
    ]
  };
}

function simulateGhostReengagement(candidate) {
  return {
    subject: `${candidate.full_name}, we'd love to reconnect!`,
    body: `Hi ${candidate.full_name},\n\nI hope this message finds you well! We really enjoyed our conversation about the ${candidate.current_role || 'engineering'} opportunity, and I wanted to reach out because we still think you'd be an incredible fit for our team.\n\nI understand things can get busy, and there's no pressure at all. If your situation has changed or you have any questions, I'd love to hop on a quick 10-minute call at your convenience.\n\nWe've also made some exciting updates to the role that I think would align well with your background in ${candidate.current_company ? 'your work at ' + candidate.current_company : 'the industry'}.\n\nWould any time this week work for a brief chat?\n\nBest regards,\nThe Recruiting Team`
  };
}

function simulateJDAnalysis(description) {
  return {
    score: 72,
    vague_requirements: [
      { text: 'Strong communication skills', suggestion: 'Specify: "Ability to present technical proposals to non-technical stakeholders and write clear documentation"' },
      { text: 'Experience with modern technologies', suggestion: 'List specific technologies: "React 18+, Node.js, TypeScript, PostgreSQL"' },
    ],
    over_filtering_risks: [
      { text: '10+ years of experience required', risk: 'This will exclude strong Senior engineers with 6-8 years who may be excellent fits', suggestion: 'Consider "6+ years" to widen the pool by ~40%' },
      { text: 'Must have experience in fintech', risk: 'Domain knowledge can be learned — this eliminates candidates with transferable skills from e-commerce and banking', suggestion: 'Use "fintech or related domain (e-commerce, banking, payments)" instead' },
    ],
    estimated_pool_size: { current: '~120 candidates', with_improvements: '~340 candidates' },
    improvements: [
      'Add salary range to attract 30% more applicants',
      'Include remote/hybrid options — this is the #1 factor for senior candidates in 2024',
      'Add "What you\'ll work on in the first 90 days" section to differentiate from competitors',
      'List team size and reporting structure for transparency'
    ],
    overall_assessment: 'Good JD with room for improvement. The requirements are reasonably clear but some criteria may unnecessarily narrow your candidate pool. Consider the suggestions above to attract a wider range of qualified candidates.'
  };
}

function simulateCopilotResponse(question) {
  const q = question.toLowerCase();

  if (q.includes('top') && q.includes('candidate')) {
    return {
      response: "Based on the current scoring data, here are your top candidates:\n\n1. **Sarah Chen** — Score: 94 | Senior Full Stack Engineer at Stripe | 8 years exp\n2. **Raj Krishnamurthy** — Score: 91 | Tech Lead at Google | 10 years exp\n3. **Elena Volkov** — Score: 89 | Senior Backend Engineer at Shopify | 7 years exp\n4. **Marcus Thompson** — Score: 87 | Software Architect at Microsoft | 12 years exp\n5. **Aisha Okafor** — Score: 85 | Senior DevOps Engineer at Netflix | 6 years exp\n\nWould you like me to compare any of these candidates or generate interview briefs?",
      type: 'candidate_list'
    };
  }

  if (q.includes('draft') && (q.includes('rejection') || q.includes('reject'))) {
    const name = question.match(/for\s+(\w+)/i)?.[1] || 'the candidate';
    return {
      response: `Here's a warm rejection email for ${name}:\n\n**Subject:** Thank you for your time, ${name}\n\nDear ${name},\n\nThank you so much for taking the time to interview with us. We truly enjoyed getting to know you and learning about your impressive background.\n\nAfter careful consideration, we've decided to move forward with a candidate whose experience more closely aligns with the specific needs of this role. This was a difficult decision — your skills and enthusiasm really stood out.\n\nWe'd love to keep in touch for future opportunities that may be an even better fit. Would you be open to us reaching out if something comes up?\n\nWishing you all the best in your career journey!\n\nWarm regards,\nThe Recruiting Team`,
      type: 'email_draft'
    };
  }

  if (q.includes('how many') && q.includes('screening')) {
    return {
      response: "Currently, there are **8 candidates** who have been in the Screening stage for more than 2 weeks:\n\n• Marcus Johnson — 18 days (Senior React Dev role)\n• Priya Patel — 16 days (Backend Engineer role)\n• Tom Wilson — 15 days (DevOps role)\n• Lisa Zhang — 14 days (Full Stack role)\n• 4 others in various pipelines\n\n⚠️ **Recommendation:** I'd suggest scheduling quick calls with Marcus and Priya first, as they've been waiting the longest and are high-scoring candidates (87 and 84 respectively). Delays beyond 3 weeks increase candidate drop-off by 40%.",
      type: 'analytics'
    };
  }

  if (q.includes('summarize') && q.includes('feedback')) {
    return {
      response: "Here's a summary of all interview feedback:\n\n**Overall Sentiment:** Mostly Positive (4.2/5 average)\n\n**Strengths Mentioned Frequently:**\n• Strong problem-solving abilities (mentioned 5x)\n• Excellent communication skills (4x)\n• Deep technical knowledge (4x)\n\n**Concerns Raised:**\n• Limited experience with distributed systems (2x)\n• Could improve on time estimation (2x)\n\n**Recommendation Breakdown:**\n• Strong Hire: 3 interviewers\n• Hire: 2 interviewers\n• Maybe: 1 interviewer\n\nOverall, the panel leans toward a **Hire** recommendation. The main concern around distributed systems could be addressed with onboarding training.",
      type: 'summary'
    };
  }

  return {
    response: `Great question! Based on the platform data, here's what I found:\n\nYour recruitment pipeline is performing well with a 23% offer acceptance rate this quarter. You have 156 active candidates across 8 open positions.\n\n**Key insights:**\n• Average time-to-hire: 28 days (industry avg: 36 days)\n• Top sourcing channel: LinkedIn (42% of hires)\n• Candidate satisfaction score: 4.5/5\n\nWould you like me to dive deeper into any of these metrics?`,
    type: 'general'
  };
}

module.exports = {
  simulateResumeParser,
  simulateCandidateScoring,
  simulateNLSearch,
  simulateSalaryPrediction,
  simulateTalentRadar,
  simulateCultureFit,
  simulateInterviewBrief,
  simulateGhostReengagement,
  simulateJDAnalysis,
  simulateCopilotResponse,
};
