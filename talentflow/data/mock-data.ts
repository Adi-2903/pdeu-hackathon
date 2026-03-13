/**
 * Mock data for frontend development
 * Replace with real API calls by configuring NEXT_PUBLIC_USE_MOCKS=false
 */

export const MOCK_CANDIDATES = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    full_name: "Alice Johnson",
    email: "alice@example.com",
    phone: "+1-555-0101",
    location: "San Francisco, CA",
    resume_text: "Senior Software Engineer with 8 years experience in React, Node.js, TypeScript. Led team of 5 engineers. Strong background in system design and scalability.",
    skills: ["React", "Node.js", "TypeScript", "System Design", "Leadership"],
    source: "linkedin",
    created_at: new Date().toISOString(),
    is_duplicate: false,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    full_name: "Bob Smith",
    email: "bob@example.com",
    phone: "+1-555-0102",
    location: "New York, NY",
    resume_text: "Full Stack Developer with 5 years experience. Proficient in Python, Django, React. Interested in startup environments.",
    skills: ["Python", "Django", "React", "PostgreSQL", "Docker"],
    source: "indeed",
    created_at: new Date().toISOString(),
    is_duplicate: false,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    full_name: "Carol White",
    email: "carol@example.com",
    phone: "+1-555-0103",
    location: "Austin, TX",
    resume_text: "Frontend Engineer specializing in Vue.js and modern CSS. 4 years experience building responsive web applications. Passionate about accessibility.",
    skills: ["Vue.js", "CSS", "JavaScript", "Accessibility", "UI/UX"],
    source: "linkedin",
    created_at: new Date().toISOString(),
    is_duplicate: false,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    full_name: "David Lee",
    email: "david@example.com",
    phone: "+1-555-0104",
    location: "Seattle, WA",
    resume_text: "DevOps Engineer with 6 years AWS and Kubernetes experience. Pipeline automation, infrastructure as code with Terraform.",
    skills: ["AWS", "Kubernetes", "Terraform", "CI/CD", "Linux"],
    source: "gmail",
    created_at: new Date().toISOString(),
    is_duplicate: false,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    full_name: "Eva Martinez",
    email: "eva@example.com",
    phone: "+1-555-0105",
    location: "Los Angeles, CA",
    resume_text: "Product Manager with 7 years experience in SaaS. Led go-to-market strategy for 2 successful products. Strong analytical and communication skills.",
    skills: ["Product Management", "Data Analysis", "Go-to-Market", "Agile", "Stakeholder Management"],
    source: "linkedin",
    created_at: new Date().toISOString(),
    is_duplicate: false,
  },
];

export const MOCK_JOBS = [
  {
    id: "650e8400-e29b-41d4-a716-446655440001",
    title: "Senior React Engineer",
    description: "Looking for an experienced React engineer to join our platform team. Must have 5+ years experience with modern JavaScript/TypeScript.",
    status: "open",
    created_at: new Date().toISOString(),
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440002",
    title: "Full Stack Developer",
    description: "Build scalable web applications with Node.js and React. Experience with relational databases required.",
    status: "open",
    created_at: new Date().toISOString(),
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440003",
    title: "DevOps Engineer",
    description: "Manage and optimize our cloud infrastructure on AWS. Kubernetes, Terraform, and CI/CD pipeline experience needed.",
    status: "open",
    created_at: new Date().toISOString(),
  },
];

export interface SearchResult {
  candidate_id: string;
  score: number;
  reason: string;
  candidate?: any;
}

export interface ShortlistResult {
  candidate_id: string;
  score: number;
  reason: string;
  candidate?: any;
}

/**
 * Mock search - returns candidates matching keywords from query
 */
export function mockSearchCandidates(query: string): SearchResult[] {
  const lowerQuery = query.toLowerCase();
  
  return MOCK_CANDIDATES
    .filter(c => 
      c.full_name.toLowerCase().includes(lowerQuery) ||
      c.skills.some(s => s.toLowerCase().includes(lowerQuery)) ||
      c.resume_text.toLowerCase().includes(lowerQuery)
    )
    .map(c => ({
      candidate_id: c.id,
      score: Math.random() * 0.3 + 0.7, // 0.7-1.0
      reason: `Matches query "${query}" in skills: ${c.skills.join(", ")}`,
      candidate: c,
    }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Mock shortlist - scores candidates against JD
 */
export function mockScoreCandidates(
  jd: string,
  jobId?: string,
  candidateIds?: string[]
): ShortlistResult[] {
  const keywords = jd.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  
  let candidates = MOCK_CANDIDATES;
  if (candidateIds && candidateIds.length > 0) {
    candidates = candidates.filter(c => candidateIds.includes(c.id));
  }

  return candidates
    .map(c => {
      const matchingSkills = c.skills.filter(s =>
        keywords.some(kw => s.toLowerCase().includes(kw))
      );
      const score = Math.min(1, (matchingSkills.length / c.skills.length) * 0.8 + Math.random() * 0.2);
      
      return {
        candidate_id: c.id,
        score,
        reason: `Matched ${matchingSkills.length} required skills: ${matchingSkills.join(", ") || "general fit"}`,
        candidate: c,
      };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * Mock interview scheduling
 */
export function mockScheduleInterview(
  candidateName: string,
  candidateEmail: string,
  jobTitle: string
) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  return {
    meet_url: `https://meet.google.com/abc-defg-hij`,
    event_id: `mock_event_${Date.now()}`,
    event_link: `https://calendar.google.com/calendar/u/0/r/eventedit/mock_event_${Date.now()}`,
    draft_email: `Hi ${candidateName},\n\nYou're invited to an interview for the ${jobTitle} position.\n\nDate & Time: ${tomorrow.toLocaleString()}\nMeet Link: https://meet.google.com/abc-defg-hij\n\nBest regards,\nTalent Team`,
  };
}
