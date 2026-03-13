const { initializeDatabase } = require('./schema');
const { v4: uuidv4 } = require('uuid');

const db = initializeDatabase();

// Clear existing data
db.exec(`
  DELETE FROM talent_radar; DELETE FROM company_values; DELETE FROM passive_pool;
  DELETE FROM search_queries; DELETE FROM duplicate_groups; DELETE FROM email_threads;
  DELETE FROM activity_log; DELETE FROM notes; DELETE FROM sources;
  DELETE FROM applications; DELETE FROM pipeline_stages; DELETE FROM certifications;
  DELETE FROM education; DELETE FROM work_experience; DELETE FROM candidate_skills;
  DELETE FROM jobs; DELETE FROM candidates;
`);

const firstNames = ['Sarah','James','Priya','Marcus','Elena','David','Aisha','Chen','Sofia','Michael','Fatima','Alex','Maria','Ryan','Nadia','Tom','Zara','Kevin','Leila','Josh','Amara','Lucas','Yuki','Daniel','Olivia','Hassan','Emma','Raj','Isabella','Nathan','Mia','Andre','Chloe','Omar','Hannah','Satoshi','Rachel','Diego','Aaliya','Brandon','Mei','Jordan','Ananya','Tyler','Samira','Ethan','Lina','Chris','Valentina','Wei'];
const lastNames = ['Chen','Williams','Sharma','Johnson','Kowalski','Kim','Patel','Brown','Rodriguez','Nakamura','Ahmed','Taylor','Singh','Garcia','Okafor','Anderson','Nguyen','Thomas','Fernandez','Yamamoto','Hassan','Wilson','Gupta','Martinez','Tanaka','Ibrahim','Davis','Kumar','Lopez','Sato','Ali','Moore','Reddy','Hernandez','Watanabe','Khan','Jackson','Nair','Gonzalez','Park','Adams','Joshi','Rivera','Suzuki','Campbell','Desai','Phillips','Chowdhury','Bennett','Ito'];
const locations = ['San Francisco, CA','New York, NY','Bangalore, India','London, UK','Austin, TX','Berlin, Germany','Toronto, Canada','Singapore','Seattle, WA','Amsterdam, Netherlands','Mumbai, India','Chicago, IL','Dublin, Ireland','Sydney, Australia','Remote','Denver, CO','Boston, MA','Hyderabad, India','Stockholm, Sweden','Tel Aviv, Israel'];
const sources = ['Upload','Email','LinkedIn','Referral','HRMS'];
const seniorityLevels = ['Junior','Junior','Mid','Mid','Mid','Senior','Senior','Senior','Lead','Executive'];
const departments = ['Engineering','Product','Design','Data Science','DevOps','Marketing','Sales','HR'];

const skillsByCategory = {
  Frontend: ['React','Vue.js','Angular','TypeScript','Next.js','Svelte','HTML/CSS','Tailwind CSS','Redux','GraphQL Client','Webpack','Storybook','Jest','Cypress','React Native'],
  Backend: ['Node.js','Python','Java','Go','Rust','Ruby','C#','PHP','Django','FastAPI','Express','Spring Boot','NestJS','Laravel','ASP.NET'],
  DevOps: ['Docker','Kubernetes','AWS','GCP','Azure','Terraform','Jenkins','GitHub Actions','CI/CD','Linux','Nginx','Ansible','Prometheus','Grafana','ArgoCD'],
  'Data Science': ['Python','TensorFlow','PyTorch','Pandas','NumPy','Scikit-learn','SQL','Spark','Tableau','R','NLP','Computer Vision','MLOps','Jupyter','Airflow'],
  Mobile: ['React Native','Flutter','Swift','Kotlin','iOS','Android','Xamarin','Dart','SwiftUI','Jetpack Compose'],
  'Soft Skills': ['Leadership','Communication','Problem Solving','Team Management','Mentoring','Agile','Scrum','Public Speaking','Strategic Planning','Cross-functional Collaboration'],
  Management: ['Project Management','Product Strategy','Roadmap Planning','Stakeholder Management','Budget Management','Team Building','OKRs','Hiring','Performance Reviews','Vendor Management']
};

const companies = ['Google','Meta','Amazon','Apple','Microsoft','Netflix','Stripe','Airbnb','Uber','Spotify','Shopify','Atlassian','Salesforce','Adobe','Oracle','SAP','Twilio','DataDog','Snowflake','Palantir','Twitter','LinkedIn','Slack','Zoom','Square','Coinbase','Robinhood','DoorDash','Instacart','Figma','Notion','Vercel','Supabase','PlanetScale','Retool','Webflow','Canva','Miro','GitLab','HashiCorp'];
const degrees = ['B.S. Computer Science','B.Tech Information Technology','M.S. Computer Science','MBA','B.S. Data Science','M.S. AI/ML','B.S. Software Engineering','Ph.D. Computer Science','B.A. Mathematics','M.S. Information Systems'];
const universities = ['MIT','Stanford University','IIT Bombay','Carnegie Mellon','UC Berkeley','University of Cambridge','Georgia Tech','University of Toronto','NUS Singapore','ETH Zurich','IIT Delhi','University of Michigan','Columbia University','University of Tokyo','TU Munich','University of Waterloo','Caltech','BITS Pilani','University of Oxford','Harvard University'];
const certifications_list = ['AWS Solutions Architect','Google Cloud Professional','Kubernetes Administrator','PMP','Scrum Master','TensorFlow Developer','Azure Administrator','Cisco CCNA','CompTIA Security+','Databricks Lakehouse'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN(arr, n) { const s = [...arr].sort(() => Math.random() - 0.5); return s.slice(0, Math.min(n, s.length)); }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max) { return +(Math.random() * (max - min) + min).toFixed(1); }
function pastDate(daysBack) { const d = new Date(); d.setDate(d.getDate() - daysBack); return d.toISOString().split('T')[0]; }

const insertCandidate = db.prepare(`INSERT INTO candidates (id, full_name, email, phone, location, linkedin_url, github_url, portfolio_url, summary, seniority_level, years_experience, source, status, ghost_status, ghost_days, last_response_date, passive_pool, confidence_score, culture_fit_score, salary_min, salary_max, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
const insertSkill = db.prepare(`INSERT INTO candidate_skills (candidate_id, skill_name, category, proficiency_level) VALUES (?,?,?,?)`);
const insertWork = db.prepare(`INSERT INTO work_experience (candidate_id, company_name, role, start_date, end_date, description, is_current) VALUES (?,?,?,?,?,?,?)`);
const insertEdu = db.prepare(`INSERT INTO education (candidate_id, institution, degree, field_of_study, start_year, end_year) VALUES (?,?,?,?,?,?)`);
const insertCert = db.prepare(`INSERT INTO certifications (candidate_id, name, issuer, year) VALUES (?,?,?,?)`);
const insertNote = db.prepare(`INSERT INTO notes (candidate_id, author, content, type, created_at) VALUES (?,?,?,?,?)`);
const insertActivity = db.prepare(`INSERT INTO activity_log (candidate_id, job_id, action, details, actor, created_at) VALUES (?,?,?,?,?,?)`);
const insertSource = db.prepare(`INSERT INTO sources (candidate_id, type, details, created_at) VALUES (?,?,?,?)`);
const insertRadar = db.prepare(`INSERT INTO talent_radar (candidate_id, technical_depth, communication, leadership, domain_knowledge, cultural_fit, growth_trajectory) VALUES (?,?,?,?,?,?,?)`);

const roles = {
  Frontend: ['Frontend Developer','Senior Frontend Engineer','Lead UI Engineer','React Developer','Frontend Architect'],
  Backend: ['Backend Developer','Senior Backend Engineer','API Engineer','Platform Engineer','Backend Architect'],
  DevOps: ['DevOps Engineer','Senior SRE','Cloud Engineer','Infrastructure Lead','Platform SRE'],
  'Data Science': ['Data Scientist','ML Engineer','Senior Data Analyst','AI Researcher','Head of Data'],
  Mobile: ['iOS Developer','Android Developer','Mobile Engineer','Senior Mobile Developer','Mobile Lead'],
  Management: ['Engineering Manager','VP Engineering','CTO','Director of Engineering','Tech Lead Manager'],
  'Soft Skills': ['Product Manager','Scrum Master','Technical Program Manager','Agile Coach','Delivery Manager']
};

const summaries = [
  'Passionate engineer with a strong track record of building scalable systems.',
  'Full-stack developer who loves turning complex problems into simple solutions.',
  'Results-driven technologist with experience leading cross-functional teams.',
  'Creative problem solver with deep expertise in distributed systems.',
  'Innovative engineer focused on developer experience and productivity.',
  'Experienced leader who builds high-performing engineering teams from scratch.',
  'Data-driven professional with a passion for ML and AI applications.',
  'Detail-oriented developer committed to clean code and best practices.',
  'Versatile engineer comfortable across the stack, from databases to UIs.',
  'Strategic thinker who bridges the gap between business needs and technical solutions.'
];

const noteContents = [
  'Strong communication skills during initial screening.',
  'Impressive portfolio with well-documented projects.',
  'Looking for remote-first opportunities.',
  'Available to start within 2 weeks notice period.',
  'Has competing offers from other companies.',
  'Referred by a current team member.',
  'Interesting background in fintech and payments.',
  'Very enthusiastic about our mission and culture.',
  'Salary expectations align with our budget.',
  'Needs visa sponsorship for relocation.'
];

const candidates = [];
const seedTransaction = db.transaction(() => {
  for (let i = 0; i < 55; i++) {
    const id = uuidv4();
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const fullName = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i > 49 ? i : ''}@${pick(['gmail.com','outlook.com','yahoo.com','protonmail.com','company.com'])}`;
    const phone = `+1-${randInt(200,999)}-${randInt(100,999)}-${randInt(1000,9999)}`;
    const location = pick(locations);
    const seniority = pick(seniorityLevels);
    const yoe = seniority === 'Junior' ? randFloat(0.5, 3) : seniority === 'Mid' ? randFloat(3, 6) : seniority === 'Senior' ? randFloat(6, 12) : seniority === 'Lead' ? randFloat(8, 15) : randFloat(12, 25);
    const source = pick(sources);
    const isGhost = Math.random() < 0.15 ? 1 : 0;
    const ghostDays = isGhost ? randInt(7, 45) : 0;
    const isPassive = Math.random() < 0.12 ? 1 : 0;
    const confidence = randFloat(0.7, 0.99);
    const cultureFit = randFloat(40, 98);
    const salaryBase = seniority === 'Junior' ? 60000 : seniority === 'Mid' ? 90000 : seniority === 'Senior' ? 130000 : seniority === 'Lead' ? 160000 : 200000;
    const salaryMin = salaryBase + randInt(-10000, 10000);
    const salaryMax = salaryMin + randInt(20000, 50000);
    const createdAt = pastDate(randInt(1, 180));

    insertCandidate.run(id, fullName, email, phone, location,
      `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
      Math.random() > 0.4 ? `https://github.com/${firstName.toLowerCase()}${lastName.toLowerCase()}` : null,
      Math.random() > 0.6 ? `https://${firstName.toLowerCase()}${lastName.toLowerCase()}.dev` : null,
      pick(summaries), seniority, yoe, source,
      isPassive ? 'Passive' : 'Active', isGhost, ghostDays,
      isGhost ? pastDate(ghostDays) : pastDate(randInt(0, 10)),
      isPassive, confidence, cultureFit, salaryMin, salaryMax, createdAt
    );

    // Skills (5-12 per candidate)
    const primaryCategory = pick(Object.keys(skillsByCategory).filter(c => c !== 'Soft Skills' && c !== 'Management'));
    const primarySkills = pickN(skillsByCategory[primaryCategory], randInt(3, 6));
    primarySkills.forEach(s => insertSkill.run(id, s, primaryCategory, randInt(3, 5)));
    const secondaryCategory = pick(Object.keys(skillsByCategory).filter(c => c !== primaryCategory));
    const secondarySkills = pickN(skillsByCategory[secondaryCategory], randInt(2, 4));
    secondarySkills.forEach(s => insertSkill.run(id, s, secondaryCategory, randInt(2, 4)));
    const softSkills = pickN(skillsByCategory['Soft Skills'], randInt(1, 3));
    softSkills.forEach(s => insertSkill.run(id, s, 'Soft Skills', randInt(3, 5)));

    // Work experience (2-5 entries)
    const numJobs = randInt(2, 5);
    let currentYear = 2026;
    for (let j = 0; j < numJobs; j++) {
      const duration = randInt(1, 4);
      const endYear = currentYear;
      const startYear = endYear - duration;
      const roleList = roles[primaryCategory] || roles['Backend'];
      insertWork.run(id, pick(companies), pick(roleList),
        `${startYear}-${String(randInt(1,12)).padStart(2,'0')}-01`,
        j === 0 ? null : `${endYear}-${String(randInt(1,12)).padStart(2,'0')}-01`,
        `Led development of key features and maintained high code quality standards. Collaborated with cross-functional teams to deliver impactful products.`,
        j === 0 ? 1 : 0
      );
      currentYear = startYear;
    }

    // Education (1-2 entries)
    const numEdu = randInt(1, 2);
    for (let j = 0; j < numEdu; j++) {
      const endYear = currentYear - randInt(0, 2);
      insertEdu.run(id, pick(universities), pick(degrees), pick(['Computer Science','Information Technology','Software Engineering','Data Science','Mathematics']), endYear - 4, endYear);
    }

    // Certifications (0-3)
    pickN(certifications_list, randInt(0, 3)).forEach(c => {
      insertCert.run(id, c, pick(['AWS','Google','Microsoft','PMI','Linux Foundation']), randInt(2020, 2025));
    });

    // Notes
    pickN(noteContents, randInt(1, 3)).forEach(n => {
      insertNote.run(id, pick(['Alex Thompson','Sarah Chen','David Kim','Priya Sharma']), n, 'note', pastDate(randInt(0, 60)));
    });

    // Activity log
    const activities = ['Resume uploaded','Profile parsed by AI','Moved to screening','Email sent','Phone screen scheduled','Technical interview completed','Score calculated'];
    pickN(activities, randInt(2, 5)).forEach((a, idx) => {
      insertActivity.run(id, null, a, `Automated action for ${fullName}`, 'System', pastDate(randInt(0, 90) - idx));
    });

    // Source
    insertSource.run(id, source, source === 'Email' ? 'Scanned from Gmail inbox' : source === 'LinkedIn' ? 'Imported from LinkedIn profile' : source === 'Referral' ? `Referred by ${pick(firstNames)} ${pick(lastNames)}` : source === 'HRMS' ? 'Synced from BambooHR' : 'Drag and drop upload', createdAt);

    // Talent Radar
    insertRadar.run(id,
      randFloat(30, 98), randFloat(30, 98), randFloat(20, 95),
      randFloat(30, 98), randFloat(25, 95), randFloat(30, 98)
    );

    candidates.push({ id, fullName, seniority, primaryCategory });
  }

  // JOBS
  const jobsData = [
    { id: uuidv4(), title: 'Senior Frontend Engineer', dept: 'Engineering', loc: 'San Francisco, CA', type: 'Full-time', salMin: 150000, salMax: 200000, desc: 'We are looking for a Senior Frontend Engineer to lead the development of our customer-facing web applications. You will work closely with product and design teams to build beautiful, performant, and accessible user interfaces using React and TypeScript.', reqs: 'React, TypeScript, Next.js, GraphQL, 5+ years experience, Strong CSS skills, Performance optimization' },
    { id: uuidv4(), title: 'Backend Platform Engineer', dept: 'Engineering', loc: 'Remote', type: 'Full-time', salMin: 140000, salMax: 190000, desc: 'Join our platform team to build and scale the core services that power our product. You will design APIs, optimize database performance, and ensure our infrastructure can handle rapid growth.', reqs: 'Node.js or Python or Go, PostgreSQL, Redis, Kubernetes, API Design, Microservices, 4+ years experience' },
    { id: uuidv4(), title: 'ML Engineer — NLP', dept: 'Data Science', loc: 'New York, NY', type: 'Full-time', salMin: 160000, salMax: 220000, desc: 'We need an ML Engineer specializing in NLP to build and deploy language models that power our AI features. You will work on text classification, entity extraction, and generative AI capabilities.', reqs: 'Python, PyTorch or TensorFlow, NLP, Transformers, MLOps, 3+ years ML experience' },
    { id: uuidv4(), title: 'DevOps Lead', dept: 'DevOps', loc: 'Austin, TX', type: 'Full-time', salMin: 145000, salMax: 195000, desc: 'Lead our DevOps practices and build a world-class CI/CD pipeline. You will manage our cloud infrastructure, implement monitoring solutions, and drive our reliability engineering efforts.', reqs: 'AWS or GCP, Kubernetes, Terraform, CI/CD, Linux, Monitoring, 6+ years experience, Team leadership' },
    { id: uuidv4(), title: 'Product Manager — Growth', dept: 'Product', loc: 'London, UK', type: 'Full-time', salMin: 120000, salMax: 170000, desc: 'Drive growth initiatives by identifying opportunities, running experiments, and optimizing our user funnel. You will work with engineering, design, and data teams to ship features that move key metrics.', reqs: 'Product Management, A/B Testing, Data Analysis, SQL, User Research, 4+ years PM experience, Growth mindset' },
    { id: uuidv4(), title: 'Mobile Developer — React Native', dept: 'Engineering', loc: 'Bangalore, India', type: 'Full-time', salMin: 40000, salMax: 70000, desc: 'Build and maintain our cross-platform mobile applications using React Native. Deliver smooth, native-feeling experiences for both iOS and Android.', reqs: 'React Native, TypeScript, iOS, Android, REST APIs, Mobile CI/CD, 3+ years mobile experience' },
  ];

  const defaultStages = [
    { name: 'New', color: '#6b7280' },
    { name: 'Screening', color: '#3b82f6' },
    { name: 'Phone Interview', color: '#8b5cf6' },
    { name: 'Technical Interview', color: '#f59e0b' },
    { name: 'Final Interview', color: '#06d6a0' },
    { name: 'Offer', color: '#10b981' },
    { name: 'Hired', color: '#06d6a0' },
    { name: 'Rejected', color: '#ef4444' }
  ];

  const insertJob = db.prepare(`INSERT INTO jobs (id, title, department, location, type, salary_min, salary_max, description, requirements, status, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  const insertStage = db.prepare(`INSERT INTO pipeline_stages (job_id, name, position, color) VALUES (?,?,?,?)`);
  const insertApp = db.prepare(`INSERT INTO applications (id, candidate_id, job_id, stage_id, score, ai_summary, ai_pros, ai_cons, status, applied_at) VALUES (?,?,?,?,?,?,?,?,?,?)`);

  const stageIds = {};
  jobsData.forEach(job => {
    insertJob.run(job.id, job.title, job.dept, job.loc, job.type, job.salMin, job.salMax, job.desc, job.reqs, 'Open', pastDate(randInt(5, 60)));
    defaultStages.forEach((s, idx) => {
      insertStage.run(job.id, s.name, idx, s.color);
    });
    const stages = db.prepare('SELECT id, name FROM pipeline_stages WHERE job_id = ? ORDER BY position').all(job.id);
    stageIds[job.id] = stages;
  });

  // Assign candidates to jobs (3-8 candidates per job, spread across stages)
  jobsData.forEach(job => {
    const applicants = pickN(candidates, randInt(8, 18));
    const stages = stageIds[job.id];
    applicants.forEach(c => {
      const stage = pick(stages);
      const score = randFloat(35, 98);
      const pros = ['Strong technical background','Relevant industry experience','Good culture fit','Leadership potential','Quick learner'];
      const cons = ['Limited experience with specific tech','May need visa sponsorship','Salary expectations on higher end','Short tenure at previous roles','No open source contributions'];
      insertApp.run(uuidv4(), c.id, job.id, stage.id, score,
        `${c.fullName} is a ${c.seniority}-level professional with strong skills relevant to this role.`,
        JSON.stringify(pickN(pros, 3)),
        JSON.stringify(pickN(cons, 2)),
        stage.name === 'Rejected' ? 'Rejected' : stage.name === 'Hired' ? 'Hired' : 'Active',
        pastDate(randInt(1, 45))
      );
      insertActivity.run(c.id, job.id, `Applied to ${job.title}`, `Stage: ${stage.name}, Score: ${score}`, 'System', pastDate(randInt(1, 45)));
    });
  });

  // Company values
  const values = [
    ['Ownership','We take full responsibility for our work and its outcomes'],
    ['Move Fast','We ship quickly and iterate based on feedback'],
    ['Data-Driven','We make decisions backed by data and evidence'],
    ['Remote-First','We believe great work happens anywhere'],
    ['Continuous Learning','We invest in growing our skills every day']
  ];
  const insertValue = db.prepare('INSERT INTO company_values (value_name, description) VALUES (?,?)');
  values.forEach(v => insertValue.run(v[0], v[1]));

  // Email threads
  const insertEmail = db.prepare('INSERT INTO email_threads (candidate_id, subject, from_email, body_preview, has_attachment, status, received_at) VALUES (?,?,?,?,?,?,?)');
  candidates.slice(0, 15).forEach(c => {
    insertEmail.run(c.id, `Application for ${pick(['Frontend','Backend','ML','DevOps'])} Role`, `${c.fullName.toLowerCase().replace(' ','.')}@email.com`, `Hi, I am writing to express my interest in the open position. Please find my resume attached.`, 1, 'Processed', pastDate(randInt(1, 30)));
  });
});

seedTransaction();
console.log('✅ Database seeded with 55 candidates, 6 jobs, and all related data!');
process.exit(0);
