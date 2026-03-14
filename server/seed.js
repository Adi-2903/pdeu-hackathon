const { getDb, initializeDatabase, getDefaultData } = require('./database');
const { v4: uuidv4 } = require('uuid');

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function seedDatabase({ force = false } = {}) {
  initializeDatabase();
  const db = getDb();

  if (!force && Array.isArray(db.data.candidates) && db.data.candidates.length > 0) {
    console.log('Database already seeded, skipping. Set FORCE_SEED=true to force re-seed.');
    return;
  }

  console.log('Seeding database...');
  db.data = getDefaultData();

  const now = new Date().toISOString();

  const candidates = [
    {
      id: uuidv4(),
      full_name: 'Ava Johnson',
      email: 'ava.johnson@example.com',
      phone: '+1-415-555-0101',
      location: 'San Francisco, CA',
      summary: 'Full-stack engineer with 7 years building scalable web applications.',
      seniority_level: 'Senior',
      years_of_experience: 7,
      current_role: 'Senior Software Engineer',
      current_company: 'Stripe',
      source: 'LinkedIn',
      status: 'Active',
      overall_score: 92,
      ghost_status: 0,
      in_passive_pool: 0,
      resume_text: 'Experienced in React, Node.js, and cloud-native architectures.',
      cover_letter: '',
      avatar_url: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuidv4(),
      full_name: 'Miguel Torres',
      email: 'miguel.torres@example.com',
      phone: '+1-213-555-0142',
      location: 'Los Angeles, CA',
      summary: 'Backend engineer focused on scalable APIs and data pipelines.',
      seniority_level: 'Mid',
      years_of_experience: 5,
      current_role: 'Backend Engineer',
      current_company: 'Netflix',
      source: 'Referral',
      status: 'Active',
      overall_score: 84,
      ghost_status: 0,
      in_passive_pool: 0,
      resume_text: 'Python, Node.js, SQL/NoSQL, and event-driven systems.',
      cover_letter: '',
      avatar_url: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuidv4(),
      full_name: 'Sofia Patel',
      email: 'sofia.patel@example.com',
      phone: '+1-646-555-0167',
      location: 'New York, NY',
      summary: 'Product-focused frontend engineer with strong design sense.',
      seniority_level: 'Senior',
      years_of_experience: 8,
      current_role: 'Frontend Engineer',
      current_company: 'Airbnb',
      source: 'Upload',
      status: 'Active',
      overall_score: 90,
      ghost_status: 0,
      in_passive_pool: 0,
      resume_text: 'React, TypeScript, CSS-in-JS, and accessibility best practices.',
      cover_letter: '',
      avatar_url: null,
      created_at: now,
      updated_at: now,
    },
  ];

  candidates.forEach(c => db.insert('candidates', c));

  const skills = [
    { candidate_index: 0, skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'GraphQL'] },
    { candidate_index: 1, skills: ['Python', 'PostgreSQL', 'Kafka', 'Docker', 'AWS'] },
    { candidate_index: 2, skills: ['React', 'Design Systems', 'CSS', 'Figma', 'Accessibility'] },
  ];

  skills.forEach(entry => {
    const candidate = candidates[entry.candidate_index];
    entry.skills.forEach(skill => {
      db.insert('candidate_skills', { id: uuidv4(), candidate_id: candidate.id, skill_name: skill, category: 'Technical', proficiency_level: 4 });
    });
  });

  // Create a sample job with pipeline stages and applications
  const jobId = uuidv4();
  db.insert('jobs', {
    id: jobId,
    title: 'Senior Full Stack Engineer',
    department: 'Engineering',
    location: 'Remote',
    job_type: 'Full-time',
    experience_required: '5+ years',
    salary_range_min: 120000,
    salary_range_max: 160000,
    description: 'We are looking for a full-stack engineer to help build our next-generation hiring product.',
    requirements: 'Strong experience in React and Node.js, plus a passion for developer tooling.',
    status: 'Active',
    created_at: now,
    updated_at: now,
  });

  const stages = [
    { name: 'New', color: '#3b82f6', order: 1 },
    { name: 'Screening', color: '#8b5cf6', order: 2 },
    { name: 'Interview', color: '#06b6d4', order: 3 },
    { name: 'Offer', color: '#10b981', order: 4 },
    { name: 'Hired', color: '#0ea5e9', order: 5 },
    { name: 'Rejected', color: '#ef4444', order: 6 },
  ];

  stages.forEach(stage => {
    db.insert('pipeline_stages', { id: uuidv4(), job_id: jobId, name: stage.name, stage_order: stage.order, color: stage.color });
  });

  const stageMap = {}; // stage name -> id
  db.data.pipeline_stages.forEach(s => {
    if (s.job_id === jobId) stageMap[s.name] = s.id;
  });

  // Add applications for the first two candidates
  [candidates[0], candidates[1]].forEach((candidate, idx) => {
    const stageName = idx === 0 ? 'Screening' : 'New';
    db.insert('applications', {
      id: uuidv4(),
      candidate_id: candidate.id,
      job_id: jobId,
      stage_id: stageMap[stageName],
      match_score: 80 + idx * 5,
      stage_entered_at: now,
      applied_at: now,
      status: 'Active',
    });

    db.insert('activity_log', {
      id: uuidv4(),
      candidate_id: candidate.id,
      job_id: jobId,
      action: 'Application Received',
      details: `Candidate applied to ${jobId}`,
      actor: 'System',
      created_at: now,
    });
  });

  db.save();
  console.log('Seeding complete');
}

module.exports = { seedDatabase };
