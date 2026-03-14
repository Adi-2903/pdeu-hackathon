const { getDb, initializeDatabase, getDefaultData } = require('./database');
const { v4: uuidv4 } = require('uuid');

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function seedDatabase({ force = false } = {}) {
  initializeDatabase();
  const db = getDb();

  if (!force && Array.isArray(db.data.candidates) && db.data.candidates.length > 0) {
    console.log('Database already seeded, skipping. Set FORCE_SEED=true to force re-seed.');
    return;
  }

  console.log('Seeding database with 50 rich candidates...');
  db.data = getDefaultData();
  const now = new Date().toISOString();

  // ──────────────────────────────────────────
  //  50 Realistic Candidates
  // ──────────────────────────────────────────
  const candidateData = [
    { name: 'Ava Johnson', email: 'ava.johnson@techmail.com', phone: '+1-415-555-0101', location: 'San Francisco, CA', seniority: 'Senior', years: 7, role: 'Senior Software Engineer', company: 'Stripe', source: 'LinkedIn', score: 92, summary: 'Full-stack engineer with 7 years building scalable payment systems and web applications. Expert in React, Node.js, and cloud-native architectures.', skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'GraphQL', 'PostgreSQL', 'Docker', 'Redis'] },
    { name: 'Miguel Torres', email: 'miguel.t@devmail.com', phone: '+1-213-555-0142', location: 'Los Angeles, CA', seniority: 'Mid-Level', years: 5, role: 'Backend Engineer', company: 'Netflix', source: 'Referral', score: 84, summary: 'Backend engineer focused on scalable APIs, data pipelines, and event-driven microservices at Netflix.', skills: ['Python', 'PostgreSQL', 'Kafka', 'Docker', 'AWS', 'Go', 'gRPC', 'Terraform'] },
    { name: 'Sofia Patel', email: 'sofia.patel@creative.io', phone: '+1-646-555-0167', location: 'New York, NY', seniority: 'Senior', years: 8, role: 'Frontend Engineer', company: 'Airbnb', source: 'Upload', score: 90, summary: 'Product-focused frontend engineer with strong design sense. Led design system at Airbnb impacting 200+ engineers.', skills: ['React', 'TypeScript', 'CSS-in-JS', 'Figma', 'Accessibility', 'Next.js', 'Storybook', 'Jest'] },
    { name: 'Ravi Krishnamurthy', email: 'ravi.k@techstartup.in', phone: '+91-9876543210', location: 'Bangalore, India', seniority: 'Lead', years: 10, role: 'Engineering Lead', company: 'Flipkart', source: 'LinkedIn', score: 95, summary: 'Engineering lead managing 12-person team. Shipped real-time recommendation engine processing 2M events/sec.', skills: ['Java', 'Spring Boot', 'Kafka', 'Kubernetes', 'AWS', 'Python', 'System Design', 'Leadership'] },
    { name: 'Emily Chen', email: 'emily.chen@dataworks.com', phone: '+1-206-555-0189', location: 'Seattle, WA', seniority: 'Senior', years: 6, role: 'Data Scientist', company: 'Amazon', source: 'LinkedIn', score: 88, summary: 'Data scientist specializing in ML models for supply chain optimization. Published 3 papers on NLP.', skills: ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'Spark', 'Scikit-learn', 'NLP', 'A/B Testing'] },
    { name: 'James O\'Brien', email: 'james.ob@cloudops.io', phone: '+1-312-555-0121', location: 'Chicago, IL', seniority: 'Senior', years: 9, role: 'DevOps Engineer', company: 'Salesforce', source: 'LinkedIn', score: 86, summary: 'DevOps engineer with expertise in CI/CD pipelines, infrastructure-as-code, and multi-cloud deployments.', skills: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'GCP', 'Jenkins', 'Ansible', 'Linux'] },
    { name: 'Priya Sharma', email: 'priya.sharma@ai.tech', phone: '+91-9876543211', location: 'Mumbai, India', seniority: 'Mid-Level', years: 4, role: 'ML Engineer', company: 'NVIDIA', source: 'LinkedIn', score: 82, summary: 'ML Engineer working on computer vision models for autonomous driving. Strong in PyTorch and edge deployment.', skills: ['Python', 'PyTorch', 'CUDA', 'TensorRT', 'OpenCV', 'C++', 'MLOps', 'Deep Learning'] },
    { name: 'Alexander Weber', email: 'alex.weber@eng.de', phone: '+49-170-555-0133', location: 'Berlin, Germany', seniority: 'Senior', years: 8, role: 'Platform Engineer', company: 'Spotify', source: 'LinkedIn', score: 89, summary: 'Platform engineer building internal developer tools and service mesh infrastructure at Spotify.', skills: ['Go', 'Kubernetes', 'gRPC', 'Terraform', 'Prometheus', 'Grafana', 'Python', 'Microservices'] },
    { name: 'Maria Garcia', email: 'maria.g@design.co', phone: '+34-611-555-0155', location: 'Barcelona, Spain', seniority: 'Senior', years: 7, role: 'UX Engineer', company: 'Figma', source: 'Upload', score: 87, summary: 'UX Engineer bridging design and engineering. Built accessible component libraries used by 50K+ developers.', skills: ['React', 'TypeScript', 'Figma API', 'CSS', 'Accessibility', 'Design Systems', 'Storybook', 'User Research'] },
    { name: 'Takeshi Yamamoto', email: 'takeshi.y@robotics.jp', phone: '+81-90-555-0177', location: 'Tokyo, Japan', seniority: 'Lead', years: 11, role: 'Robotics Engineer', company: 'Sony', source: 'LinkedIn', score: 91, summary: 'Robotics engineer leading autonomous systems team. Expert in ROS, computer vision, and embedded systems.', skills: ['C++', 'ROS', 'Python', 'SLAM', 'Computer Vision', 'Embedded Systems', 'FPGA', 'Control Systems'] },
    { name: 'Sarah Williams', email: 'sarah.w@fintech.com', phone: '+1-212-555-0199', location: 'New York, NY', seniority: 'Senior', years: 6, role: 'Full Stack Developer', company: 'Goldman Sachs', source: 'LinkedIn', score: 85, summary: 'Full stack developer in fintech, building low-latency trading platforms and real-time risk dashboards.', skills: ['Java', 'React', 'Spring Boot', 'SQL', 'Redis', 'WebSocket', 'Docker', 'Agile'] },
    { name: 'Ahmed Hassan', email: 'ahmed.h@cloud.ae', phone: '+971-50-555-0111', location: 'Dubai, UAE', seniority: 'Mid-Level', years: 5, role: 'Cloud Architect', company: 'Microsoft', source: 'Referral', score: 83, summary: 'Cloud architect specializing in Azure enterprise migrations. Certified Azure Solutions Architect Expert.', skills: ['Azure', 'Terraform', 'PowerShell', 'Kubernetes', 'Docker', 'Python', 'Networking', 'Security'] },
    { name: 'Lisa Anderson', email: 'lisa.a@product.io', phone: '+1-650-555-0144', location: 'Palo Alto, CA', seniority: 'Director', years: 15, role: 'VP of Engineering', company: 'Databricks', source: 'LinkedIn', score: 96, summary: 'VP Engineering managing 80+ engineers. Previously built data infrastructure at Facebook and Palantir.', skills: ['Leadership', 'System Design', 'Data Engineering', 'Python', 'Spark', 'AWS', 'Strategic Planning', 'Hiring'] },
    { name: 'Chen Wei', email: 'chen.wei@ai.cn', phone: '+86-138-555-0166', location: 'Shenzhen, China', seniority: 'Senior', years: 7, role: 'AI Research Engineer', company: 'Tencent', source: 'LinkedIn', score: 90, summary: 'AI researcher focused on NLP and large language models. 12 publications in top-tier conferences.', skills: ['Python', 'PyTorch', 'Transformers', 'NLP', 'CUDA', 'Distributed Computing', 'Research', 'LLMs'] },
    { name: 'David Kim', email: 'david.kim@mobile.kr', phone: '+82-10-555-0188', location: 'Seoul, South Korea', seniority: 'Senior', years: 8, role: 'Mobile Engineer', company: 'Samsung', source: 'LinkedIn', score: 87, summary: 'Mobile engineer with expertise in both iOS and Android. Built apps with 10M+ downloads.', skills: ['Kotlin', 'Swift', 'React Native', 'Flutter', 'GraphQL', 'CI/CD', 'Firebase', 'Performance Optimization'] },
    { name: 'Fatima Al-Rashid', email: 'fatima.r@security.com', phone: '+966-50-555-0122', location: 'Riyadh, Saudi Arabia', seniority: 'Senior', years: 9, role: 'Security Engineer', company: 'Aramco Digital', source: 'LinkedIn', score: 88, summary: 'Security engineer specializing in application security, penetration testing, and zero-trust architectures.', skills: ['Cybersecurity', 'Python', 'OWASP', 'AWS Security', 'IAM', 'Terraform', 'Docker', 'Threat Modeling'] },
    { name: 'Carlos Mendez', email: 'carlos.m@gaming.mx', phone: '+52-55-555-0133', location: 'Mexico City, Mexico', seniority: 'Mid-Level', years: 4, role: 'Game Developer', company: 'Riot Games', source: 'Upload', score: 80, summary: 'Game developer working on real-time multiplayer systems. Expert in C++ and Unreal Engine.', skills: ['C++', 'Unreal Engine', 'Networking', 'Graphics Programming', 'Python', 'Git', 'Game Design', 'Optimization'] },
    { name: 'Anna Kowalski', email: 'anna.k@data.pl', phone: '+48-601-555-0155', location: 'Warsaw, Poland', seniority: 'Mid-Level', years: 5, role: 'Data Engineer', company: 'Revolut', source: 'LinkedIn', score: 84, summary: 'Data engineer building real-time data pipelines for fintech analytics. Expert in Spark and Kafka.', skills: ['Python', 'Apache Spark', 'Kafka', 'Airflow', 'SQL', 'Snowflake', 'dbt', 'Docker'] },
    { name: 'Raj Gupta', email: 'raj.g@startup.in', phone: '+91-9876543212', location: 'Delhi, India', seniority: 'Junior', years: 2, role: 'Full Stack Developer', company: 'Swiggy', source: 'LinkedIn', score: 72, summary: 'Full stack developer building consumer-facing food delivery features. Quick learner with strong fundamentals.', skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express', 'Git', 'REST APIs', 'CSS'] },
    { name: 'Olivia Brown', email: 'olivia.b@health.com', phone: '+1-617-555-0177', location: 'Boston, MA', seniority: 'Senior', years: 7, role: 'Healthcare Tech Lead', company: 'Philips', source: 'LinkedIn', score: 86, summary: 'Tech lead in health-tech, building HIPAA-compliant patient monitoring systems and EHR integrations.', skills: ['Python', 'React', 'Node.js', 'FHIR', 'HL7', 'AWS', 'Docker', 'PostgreSQL'] },
    { name: 'Luca Rossi', email: 'luca.r@auto.it', phone: '+39-333-555-0199', location: 'Milan, Italy', seniority: 'Senior', years: 8, role: 'Embedded Software Engineer', company: 'Ferrari', source: 'Referral', score: 89, summary: 'Embedded software engineer developing real-time control systems for performance vehicles. Expert in C and RTOS.', skills: ['C', 'C++', 'RTOS', 'CAN Bus', 'MATLAB', 'Simulink', 'Embedded Linux', 'Python'] },
    { name: 'Yuki Tanaka', email: 'yuki.t@commerce.jp', phone: '+81-80-555-0111', location: 'Osaka, Japan', seniority: 'Mid-Level', years: 5, role: 'Backend Developer', company: 'Mercari', source: 'LinkedIn', score: 83, summary: 'Backend developer building e-commerce microservices handling 1M+ daily transactions.', skills: ['Go', 'Kubernetes', 'MySQL', 'Redis', 'gRPC', 'AWS', 'Prometheus', 'Microservices'] },
    { name: 'Zara Okafor', email: 'zara.o@tech.ng', phone: '+234-801-555-0144', location: 'Lagos, Nigeria', seniority: 'Mid-Level', years: 4, role: 'Frontend Developer', company: 'Andela', source: 'LinkedIn', score: 79, summary: 'Frontend developer passionate about building accessible and performant web applications for African markets.', skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Jest', 'GraphQL', 'PWA', 'Performance'] },
    { name: 'Thomas Mueller', email: 'thomas.m@auto.de', phone: '+49-171-555-0166', location: 'Munich, Germany', seniority: 'Lead', years: 12, role: 'Principal Engineer', company: 'BMW', source: 'LinkedIn', score: 94, summary: 'Principal engineer leading autonomous driving software. 15+ patents in sensor fusion and path planning.', skills: ['C++', 'Python', 'ROS', 'Deep Learning', 'LIDAR', 'Computer Vision', 'System Architecture', 'Leadership'] },
    { name: 'Aisha Patel', email: 'aisha.p@edtech.com', phone: '+1-408-555-0188', location: 'San Jose, CA', seniority: 'Senior', years: 6, role: 'iOS Developer', company: 'Duolingo', source: 'Upload', score: 85, summary: 'iOS developer building gamified learning experiences. Expert in SwiftUI and app performance optimization.', skills: ['Swift', 'SwiftUI', 'UIKit', 'Core Data', 'ARKit', 'TestFlight', 'CI/CD', 'Agile'] },
    { name: 'Nicolas Dupont', email: 'nicolas.d@cloud.fr', phone: '+33-6-555-0122', location: 'Paris, France', seniority: 'Senior', years: 7, role: 'Site Reliability Engineer', company: 'Datadog', source: 'LinkedIn', score: 87, summary: 'SRE ensuring 99.99% uptime for monitoring infrastructure. Expert in observability and incident response.', skills: ['Go', 'Kubernetes', 'Prometheus', 'Grafana', 'Terraform', 'AWS', 'Python', 'Linux'] },
    { name: 'Min-Jun Park', email: 'minjun.p@gaming.kr', phone: '+82-10-555-0133', location: 'Seoul, South Korea', seniority: 'Mid-Level', years: 4, role: 'Backend Engineer', company: 'Nexon', source: 'LinkedIn', score: 81, summary: 'Backend engineer building real-time game servers handling 500K+ concurrent players.', skills: ['C#', '.NET', 'Redis', 'MySQL', 'Docker', 'Kubernetes', 'RabbitMQ', 'Load Balancing'] },
    { name: 'Isabella Santos', email: 'isabella.s@finance.br', phone: '+55-11-555-0155', location: 'São Paulo, Brazil', seniority: 'Senior', years: 8, role: 'Data Analyst', company: 'Nubank', source: 'LinkedIn', score: 86, summary: 'Senior data analyst driving product decisions through advanced analytics and A/B testing at Nubank.', skills: ['Python', 'SQL', 'Tableau', 'Looker', 'dbt', 'Snowflake', 'Statistics', 'Product Analytics'] },
    { name: 'Viktor Petrov', email: 'viktor.p@cyber.ru', phone: '+7-903-555-0177', location: 'Moscow, Russia', seniority: 'Senior', years: 9, role: 'Security Researcher', company: 'Kaspersky', source: 'LinkedIn', score: 88, summary: 'Security researcher specializing in malware analysis, reverse engineering, and vulnerability discovery.', skills: ['C', 'Assembly', 'Python', 'IDA Pro', 'Ghidra', 'Malware Analysis', 'Cryptography', 'Network Security'] },
    { name: 'Grace Liu', email: 'grace.l@quantum.sg', phone: '+65-8555-0199', location: 'Singapore', seniority: 'Senior', years: 6, role: 'Quantum Computing Engineer', company: 'Google', source: 'LinkedIn', score: 91, summary: 'Quantum computing engineer working on error correction algorithms and quantum circuit optimization.', skills: ['Python', 'Qiskit', 'Cirq', 'Linear Algebra', 'Quantum Mechanics', 'C++', 'Research', 'TensorFlow Quantum'] },
    { name: 'Daniel Adeyemi', email: 'daniel.a@mobile.ng', phone: '+234-802-555-0111', location: 'Abuja, Nigeria', seniority: 'Junior', years: 2, role: 'Mobile Developer', company: 'Paystack', source: 'Referral', score: 73, summary: 'Mobile developer building fintech apps for African markets. Skilled in React Native and TypeScript.', skills: ['React Native', 'TypeScript', 'Node.js', 'Firebase', 'REST APIs', 'Git', 'Jest', 'Expo'] },
    { name: 'Elena Volkov', email: 'elena.v@biotech.ru', phone: '+7-916-555-0144', location: 'St. Petersburg, Russia', seniority: 'Senior', years: 7, role: 'Bioinformatics Engineer', company: 'Genentech', source: 'LinkedIn', score: 85, summary: 'Bioinformatics engineer analyzing genomic data and building drug discovery pipelines.', skills: ['Python', 'R', 'Bioconductor', 'AWS', 'Docker', 'SQL', 'Machine Learning', 'Genomics'] },
    { name: 'Hugo Martin', email: 'hugo.m@dev.fr', phone: '+33-7-555-0166', location: 'Lyon, France', seniority: 'Mid-Level', years: 4, role: 'DevOps Engineer', company: 'OVHcloud', source: 'LinkedIn', score: 80, summary: 'DevOps engineer managing cloud infrastructure in Europe. Certified Kubernetes administrator.', skills: ['Kubernetes', 'Docker', 'Terraform', 'Ansible', 'CI/CD', 'Linux', 'AWS', 'Monitoring'] },
    { name: 'Mei Wong', email: 'mei.w@ecommerce.hk', phone: '+852-555-0188', location: 'Hong Kong', seniority: 'Senior', years: 8, role: 'Tech Lead', company: 'Shopify', source: 'LinkedIn', score: 89, summary: 'Tech lead scaling e-commerce platform to handle Black Friday traffic (1M+ req/s). Expert in distributed systems.', skills: ['Ruby', 'Rails', 'Go', 'PostgreSQL', 'Redis', 'Kubernetes', 'System Design', 'Performance'] },
    { name: 'Omar Farah', email: 'omar.f@infra.ae', phone: '+971-55-555-0122', location: 'Abu Dhabi, UAE', seniority: 'Mid-Level', years: 5, role: 'Infrastructure Engineer', company: 'G42', source: 'LinkedIn', score: 82, summary: 'Infrastructure engineer building GPU clusters for AI workloads. Expert in high-performance computing.', skills: ['Linux', 'NVIDIA GPUs', 'CUDA', 'Docker', 'Kubernetes', 'Terraform', 'Networking', 'Python'] },
    { name: 'Sophie Laurent', email: 'sophie.l@ai.ch', phone: '+41-76-555-0133', location: 'Zurich, Switzerland', seniority: 'Senior', years: 7, role: 'ML Research Scientist', company: 'ETH Zurich', source: 'Upload', score: 93, summary: 'ML research scientist with 20+ publications in computer vision and generative AI. PhD from ETH.', skills: ['Python', 'PyTorch', 'Computer Vision', 'GANs', 'Diffusion Models', 'CUDA', 'Research', 'LaTeX'] },
    { name: 'Ryan Murphy', email: 'ryan.m@saas.ie', phone: '+353-86-555-0155', location: 'Dublin, Ireland', seniority: 'Senior', years: 6, role: 'Product Engineer', company: 'Intercom', source: 'LinkedIn', score: 84, summary: 'Product engineer building customer engagement tools used by 25K+ businesses worldwide.', skills: ['React', 'Ruby on Rails', 'TypeScript', 'PostgreSQL', 'Redis', 'GraphQL', 'Agile', 'Product Thinking'] },
    { name: 'Ananya Reddy', email: 'ananya.r@cloud.in', phone: '+91-9876543213', location: 'Hyderabad, India', seniority: 'Mid-Level', years: 4, role: 'Cloud Engineer', company: 'Infosys', source: 'LinkedIn', score: 78, summary: 'Cloud engineer certified in AWS and Azure. Building cloud-native solutions for enterprise clients.', skills: ['AWS', 'Azure', 'Terraform', 'Docker', 'Python', 'Linux', 'CloudFormation', 'CI/CD'] },
    { name: 'Lucas Silva', email: 'lucas.s@backend.br', phone: '+55-21-555-0177', location: 'Rio de Janeiro, Brazil', seniority: 'Senior', years: 7, role: 'Backend Architect', company: 'iFood', source: 'Referral', score: 87, summary: 'Backend architect scaling food delivery platform to 50M+ monthly orders across Latin America.', skills: ['Java', 'Kotlin', 'Spring Boot', 'Kafka', 'Redis', 'PostgreSQL', 'Microservices', 'System Design'] },
    { name: 'Nadia Benali', email: 'nadia.b@ai.ma', phone: '+212-6-555-0199', location: 'Casablanca, Morocco', seniority: 'Junior', years: 2, role: 'AI Engineer', company: 'OCP Group', source: 'LinkedIn', score: 71, summary: 'AI engineer applying computer vision to industrial quality control. Graduate of ENSIAS.', skills: ['Python', 'TensorFlow', 'OpenCV', 'Docker', 'SQL', 'Git', 'Deep Learning', 'Data Analysis'] },
    { name: 'Jake Thompson', email: 'jake.t@web3.au', phone: '+61-4-555-0111', location: 'Sydney, Australia', seniority: 'Mid-Level', years: 5, role: 'Blockchain Developer', company: 'Immutable', source: 'LinkedIn', score: 83, summary: 'Blockchain developer building NFT marketplace infrastructure. Expert in Solidity and smart contract security.', skills: ['Solidity', 'TypeScript', 'React', 'Ethereum', 'Web3.js', 'Hardhat', 'Node.js', 'Smart Contracts'] },
    { name: 'Hana Müller', email: 'hana.m@design.at', phone: '+43-660-555-0144', location: 'Vienna, Austria', seniority: 'Senior', years: 6, role: 'Design Technologist', company: 'Dynatrace', source: 'Upload', score: 85, summary: 'Design technologist bridging UX and engineering. Built monitoring dashboards used by 5000+ enterprise clients.', skills: ['React', 'D3.js', 'TypeScript', 'CSS', 'Figma', 'Data Visualization', 'Accessibility', 'Performance'] },
    { name: 'Kwame Asante', email: 'kwame.a@tech.gh', phone: '+233-20-555-0166', location: 'Accra, Ghana', seniority: 'Mid-Level', years: 4, role: 'Full Stack Developer', company: 'MTN Group', source: 'LinkedIn', score: 79, summary: 'Full stack developer building telecom solutions for African markets. Passionate about tech for social impact.', skills: ['Node.js', 'React', 'PostgreSQL', 'Docker', 'Python', 'REST APIs', 'Git', 'Agile'] },
    { name: 'Ingrid Larsen', email: 'ingrid.l@green.no', phone: '+47-9555-0188', location: 'Oslo, Norway', seniority: 'Senior', years: 8, role: 'Energy Systems Engineer', company: 'Equinor', source: 'LinkedIn', score: 87, summary: 'Energy systems engineer building software for renewable energy optimization and smart grid management.', skills: ['Python', 'MATLAB', 'Machine Learning', 'AWS', 'Docker', 'Time Series Analysis', 'IoT', 'SCADA'] },
    { name: 'Arjun Nair', email: 'arjun.n@mobile.in', phone: '+91-9876543214', location: 'Chennai, India', seniority: 'Senior', years: 7, role: 'Android Engineer', company: 'Dream11', source: 'LinkedIn', score: 86, summary: 'Android engineer building high-performance fantasy sports app with 150M+ users. Expert in Kotlin and Jetpack Compose.', skills: ['Kotlin', 'Jetpack Compose', 'MVVM', 'Room', 'Retrofit', 'Dagger/Hilt', 'Firebase', 'Performance'] },
    { name: 'Clara Fernandez', email: 'clara.f@health.es', phone: '+34-622-555-0122', location: 'Madrid, Spain', seniority: 'Mid-Level', years: 5, role: 'Health Tech Developer', company: 'Doctolib', source: 'LinkedIn', score: 82, summary: 'Health tech developer building telemedicine platforms. Expert in FHIR standards and real-time video.', skills: ['React', 'Node.js', 'WebRTC', 'FHIR', 'PostgreSQL', 'Docker', 'AWS', 'HIPAA Compliance'] },
    { name: 'Ben Taylor', email: 'ben.t@ops.uk', phone: '+44-7700-555-0133', location: 'London, UK', seniority: 'Senior', years: 9, role: 'Platform SRE', company: 'Monzo', source: 'Referral', score: 88, summary: 'Platform SRE building banking infrastructure handling £1B+ monthly transactions with 99.99% uptime.', skills: ['Go', 'Kubernetes', 'AWS', 'Terraform', 'Prometheus', 'Cassandra', 'Kafka', 'Incident Management'] },
    { name: 'Suki Watanabe', email: 'suki.w@creative.jp', phone: '+81-70-555-0155', location: 'Kyoto, Japan', seniority: 'Mid-Level', years: 4, role: 'Creative Technologist', company: 'Nintendo', source: 'Upload', score: 81, summary: 'Creative technologist combining art and code. Building interactive experiences and AR prototypes.', skills: ['Unity', 'C#', 'AR/VR', 'JavaScript', 'Three.js', 'WebGL', 'Blender', 'Creative Coding'] },
    { name: 'Patrick O\'Connor', email: 'patrick.o@cyber.ie', phone: '+353-87-555-0177', location: 'Cork, Ireland', seniority: 'Senior', years: 8, role: 'Security Architect', company: 'CrowdStrike', source: 'LinkedIn', score: 90, summary: 'Security architect designing zero-trust enterprise networks. CISSP and OSCP certified.', skills: ['Cybersecurity', 'Zero Trust', 'AWS Security', 'Python', 'Terraform', 'Kubernetes', 'Threat Intelligence', 'SIEM'] },
    { name: 'Leila Ahmadi', email: 'leila.a@data.ca', phone: '+1-604-555-0199', location: 'Vancouver, Canada', seniority: 'Senior', years: 6, role: 'Analytics Engineer', company: 'Shopify', source: 'LinkedIn', score: 85, summary: 'Analytics engineer building real-time dashboards and data models for merchant insights at Shopify.', skills: ['Python', 'SQL', 'dbt', 'Snowflake', 'Looker', 'Airflow', 'Spark', 'Data Modeling'] },
  ];

  const candidates = candidateData.map(d => ({
    id: uuidv4(),
    full_name: d.name, email: d.email, phone: d.phone, location: d.location,
    summary: d.summary, seniority_level: d.seniority, years_of_experience: d.years,
    current_role: d.role, current_company: d.company, source: d.source,
    status: 'Active', overall_score: d.score, ats_score: randomInt(55, 95),
    ghost_status: 0, in_passive_pool: 0, resume_text: d.summary, cover_letter: '',
    avatar_url: null, created_at: now, updated_at: now,
  }));

  candidates.forEach(c => db.insert('candidates', c));

  // Add skills for all candidates
  candidateData.forEach((d, i) => {
    d.skills.forEach(skill => {
      db.insert('candidate_skills', {
        id: uuidv4(), candidate_id: candidates[i].id,
        skill_name: skill, category: 'Technical', proficiency_level: randomInt(3, 5),
      });
    });
  });

  // Add work experience (2 entries per candidate)
  const companies = ['Google', 'Meta', 'Apple', 'Amazon', 'Microsoft', 'Stripe', 'Netflix', 'Airbnb', 'Uber', 'Spotify', 'Twitter', 'Slack', 'Datadog', 'MongoDB', 'Snowflake', 'Vercel', 'Figma', 'Notion', 'Linear', 'Retool'];
  const roles = ['Software Engineer', 'Backend Developer', 'Frontend Developer', 'DevOps Engineer', 'Data Engineer', 'ML Engineer', 'Product Engineer', 'Platform Engineer', 'SRE', 'Full Stack Developer'];

  candidates.forEach((c, i) => {
    const numExp = randomInt(2, 3);
    let year = 2024 - candidateData[i].years;
    for (let j = 0; j < numExp; j++) {
      const duration = randomInt(1, 4);
      db.insert('work_experience', {
        id: uuidv4(), candidate_id: c.id,
        company: j === 0 ? candidateData[i].company : randomFrom(companies),
        title: j === 0 ? candidateData[i].role : randomFrom(roles),
        start_date: `${year}`, end_date: j === 0 ? 'Present' : `${year + duration}`,
        description: `Led key initiatives and delivered impactful projects.`,
      });
      year += duration;
    }
  });

  // Add education
  const universities = ['MIT', 'Stanford', 'Carnegie Mellon', 'UC Berkeley', 'IIT Bombay', 'IIT Delhi', 'Oxford', 'Cambridge', 'ETH Zurich', 'NUS', 'University of Tokyo', 'TU Munich', 'ENSIAS', 'University of Lagos', 'Seoul National University'];
  const degrees = ['B.S. Computer Science', 'M.S. Computer Science', 'B.Tech Computer Engineering', 'M.S. Data Science', 'B.S. Software Engineering', 'M.S. AI & ML', 'Ph.D. Computer Science', 'B.E. Electronics', 'M.S. Cybersecurity', 'B.S. Mathematics'];

  candidates.forEach(c => {
    db.insert('education', {
      id: uuidv4(), candidate_id: c.id,
      institution: randomFrom(universities),
      degree: randomFrom(degrees),
      year: `${randomInt(2005, 2022)}`,
    });
  });

  // Add certifications (random subset)
  const certs = [
    { name: 'AWS Solutions Architect', issuer: 'Amazon' },
    { name: 'Google Cloud Professional', issuer: 'Google' },
    { name: 'Kubernetes Administrator (CKA)', issuer: 'CNCF' },
    { name: 'Azure Solutions Architect', issuer: 'Microsoft' },
    { name: 'Terraform Associate', issuer: 'HashiCorp' },
    { name: 'CISSP', issuer: 'ISC2' },
    { name: 'PMP', issuer: 'PMI' },
    { name: 'Scrum Master', issuer: 'Scrum.org' },
  ];

  candidates.forEach(c => {
    if (Math.random() > 0.4) {
      const cert = randomFrom(certs);
      db.insert('certifications', {
        id: uuidv4(), candidate_id: c.id,
        name: cert.name, issuer: cert.issuer,
      });
    }
  });

  // Jobs
  const jobs = [
    { title: 'Senior Full Stack Engineer', dept: 'Engineering', loc: 'Remote', type: 'Full-time', exp: '5+ years', salMin: 120000, salMax: 160000, desc: 'Build next-generation hiring product with React, Node.js, and cloud technologies.', req: 'Strong React and Node.js experience.', status: 'Active' },
    { title: 'ML Engineer', dept: 'AI/ML', loc: 'San Francisco, CA', type: 'Full-time', exp: '3+ years', salMin: 140000, salMax: 180000, desc: 'Build and deploy ML models for candidate matching and NLP search.', req: 'PyTorch, NLP, production ML experience.', status: 'Active' },
    { title: 'DevOps Engineer', dept: 'Infrastructure', loc: 'Remote', type: 'Full-time', exp: '4+ years', salMin: 130000, salMax: 170000, desc: 'Manage cloud infrastructure and CI/CD pipelines for SaaS platform.', req: 'Kubernetes, Terraform, AWS experience.', status: 'Active' },
  ];

  const jobIds = [];
  jobs.forEach(j => {
    const jobId = uuidv4();
    jobIds.push(jobId);
    db.insert('jobs', { id: jobId, ...j, salary_range_min: j.salMin, salary_range_max: j.salMax, experience_required: j.exp, job_type: j.type, department: j.dept, description: j.desc, requirements: j.req, created_at: now, updated_at: now });
  });

  // Pipeline stages
  const stages = [
    { name: 'New', color: '#3b82f6', order: 1 },
    { name: 'Screening', color: '#8b5cf6', order: 2 },
    { name: 'Interview', color: '#06b6d4', order: 3 },
    { name: 'Offer', color: '#10b981', order: 4 },
    { name: 'Hired', color: '#0ea5e9', order: 5 },
    { name: 'Rejected', color: '#ef4444', order: 6 },
  ];

  jobIds.forEach(jobId => {
    stages.forEach(stage => {
      db.insert('pipeline_stages', { id: uuidv4(), job_id: jobId, name: stage.name, stage_order: stage.order, color: stage.color });
    });
  });

  // Applications — distribute some candidates across pipeline stages
  const stageNames = ['New', 'Screening', 'Interview', 'Offer', 'Hired'];
  candidates.slice(0, 30).forEach((c, i) => {
    const jobId = jobIds[i % jobIds.length];
    const stageName = stageNames[i % stageNames.length];
    const stageRecord = db.data.pipeline_stages.find(s => s.job_id === jobId && s.name === stageName);
    if (stageRecord) {
      db.insert('applications', {
        id: uuidv4(), candidate_id: c.id, job_id: jobId,
        stage_id: stageRecord.id, match_score: randomInt(65, 95),
        stage_entered_at: now, applied_at: now, status: 'Active',
      });
    }
  });

  // Activity log
  candidates.slice(0, 20).forEach(c => {
    db.insert('activity_log', {
      id: uuidv4(), candidate_id: c.id, job_id: jobIds[0],
      action: randomFrom(['Application Received', 'Resume Screened', 'Interview Scheduled', 'Score Updated']),
      details: `Activity for ${c.full_name}`, actor: 'System', created_at: now,
    });
  });

  // Company Profile (default for demo)
  db.data.company_profile = {
    name: 'Acme Technologies',
    tagline: 'Building the Future of Innovation',
    address: '100 Innovation Drive, Suite 400',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    phone: '+1 (415) 555-0200',
    email: 'hr@acmetech.com',
    website: 'www.acmetech.com',
    hr_name: 'Sarah Mitchell',
    updated_at: now
  };
  db.data.offer_letters = [];

  db.save();
  console.log(`Seeding complete: ${candidates.length} candidates, ${jobs.length} jobs, ${db.data.candidate_skills.length} skills`);
}

module.exports = { seedDatabase };
