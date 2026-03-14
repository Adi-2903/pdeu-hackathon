import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

type Db = Database["public"];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY);

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

async function clearData() {
  console.log("Clearing existing data...");

  // Order to satisfy FKs (plus candidate_embeddings)
  const tables: (keyof Db["Tables"])[] = [
    "shortlists",
    "applications",
    "candidate_embeddings",
    "candidates",
    "jobs",
    "ingestion_logs",
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table as any).delete().neq("id", "");
    if (error) {
      console.error(`Failed to clear ${table}:`, error.message);
      throw error;
    }
  }
}

async function seedJobs() {
  const jobs: Db["Tables"]["jobs"]["Insert"][] = [
    {
      id: "job-001",
      title: "Senior React Developer",
      status: "open",
      description:
        "Looking for a senior React developer with 5+ years experience. TypeScript, Next.js, fintech background preferred.",
      requirements: [],
      remote: true,
    },
    {
      id: "job-002",
      title: "Backend Engineer — Node.js",
      status: "open",
      description:
        "Backend engineer for high-throughput APIs. Node.js, PostgreSQL, Redis, Docker. AI/LLM integration experience a plus.",
      requirements: [],
      remote: true,
    },
    {
      id: "job-003",
      title: "Product Manager — SaaS",
      status: "open",
      description:
        "Experienced PM for B2B SaaS product. SQL, Amplitude, fintech or HR tech background preferred.",
      requirements: [],
      remote: true,
    },
    {
      id: "job-004",
      title: "UX Designer",
      status: "open",
      description:
        "UX/UI designer with Figma proficiency. B2B SaaS dashboard experience required.",
      requirements: [],
      remote: true,
    },
    {
      id: "job-005",
      title: "Data Engineer — ML Platform",
      status: "open",
      description:
        "Data engineer for AI pipeline. Python, dbt, Airflow, pgvector experience essential.",
      requirements: [],
      remote: true,
    },
  ];

  const { error, count } = await supabase
    .from("jobs")
    .insert(jobs, { count: "exact" });

  if (error) {
    console.error("Error inserting jobs:", error.message);
    throw error;
  }

  console.log(`Inserted ${count ?? jobs.length} jobs.`);
}

async function seedCandidates() {
  type CandInsert = Db["Tables"]["candidates"]["Insert"];

  const baseCandidates: {
    id: string;
    email: string;
    name: string;
    sources: string[];
    needs_review: boolean;
    createdDaysAgo: number;
    parsed: {
      location: string;
      experience_years: number;
      skills: string[];
      companies: string[];
      education: { degree: string; institution: string; year: number }[];
      experience: { company: string; title: string; years: number }[];
    };
  }[] = [
    {
      id: "cand-001",
      email: "priya.sharma@gmail.com",
      name: "Priya Sharma",
      sources: ["gmail"],
      needs_review: false,
      createdDaysAgo: 6,
      parsed: {
        location: "Bangalore, India",
        experience_years: 6,
        skills: ["React", "TypeScript", "Next.js", "GraphQL", "AWS", "Tailwind CSS"],
        companies: ["Razorpay", "Flipkart"],
        education: [
          { degree: "B.Tech CS", institution: "IIT Bombay", year: 2018 },
        ],
        experience: [
          { company: "Razorpay", title: "Senior Frontend Engineer", years: 3 },
          { company: "Flipkart", title: "Frontend Developer", years: 2 },
        ],
      },
    },
    {
      id: "cand-002",
      email: "arjun.mehta@gmail.com",
      name: "Arjun Mehta",
      sources: ["gmail"],
      needs_review: false,
      createdDaysAgo: 5,
      parsed: {
        location: "Mumbai, India",
        experience_years: 8,
        skills: [
          "Node.js",
          "TypeScript",
          "PostgreSQL",
          "Redis",
          "Docker",
          "Kubernetes",
        ],
        companies: ["Paytm", "Zomato"],
        education: [
          { degree: "B.E. IT", institution: "Mumbai University", year: 2016 },
        ],
        experience: [
          { company: "Paytm", title: "Principal Backend Engineer", years: 4 },
          { company: "Zomato", title: "Senior SDE", years: 2 },
        ],
      },
    },
    {
      id: "cand-003",
      email: "neha.kapoor@gmail.com",
      name: "Neha Kapoor",
      sources: ["gmail"],
      needs_review: false,
      createdDaysAgo: 4,
      parsed: {
        location: "Delhi, India",
        experience_years: 4,
        skills: [
          "Figma",
          "Adobe XD",
          "Design Systems",
          "Prototyping",
          "User Research",
        ],
        companies: ["MakeMyTrip", "OYO"],
        education: [
          {
            degree: "B.Des Visual Communication",
            institution: "NID Ahmedabad",
            year: 2020,
          },
        ],
        experience: [
          { company: "MakeMyTrip", title: "Senior UX Designer", years: 2 },
          { company: "OYO", title: "UX Designer", years: 1 },
        ],
      },
    },
    {
      id: "cand-004",
      email: "rahul.gupta@outlook.com",
      name: "Rahul Gupta",
      sources: ["indeed"],
      needs_review: false,
      createdDaysAgo: 5,
      parsed: {
        location: "Hyderabad, India",
        experience_years: 5,
        skills: ["React", "Vue.js", "TypeScript", "Redux", "Jest"],
        companies: ["HDFC Bank", "Tech Mahindra"],
        education: [
          { degree: "MCA", institution: "JNTU Hyderabad", year: 2019 },
        ],
        experience: [
          { company: "HDFC Bank", title: "Senior UI Developer", years: 3 },
          { company: "Tech Mahindra", title: "Frontend Developer", years: 2 },
        ],
      },
    },
    {
      id: "cand-005",
      email: "kavitha.rajan@yahoo.com",
      name: "Kavitha Rajan",
      sources: ["indeed"],
      needs_review: false,
      createdDaysAgo: 3,
      parsed: {
        location: "Chennai, India",
        experience_years: 7,
        skills: [
          "Python",
          "dbt",
          "Airflow",
          "Spark",
          "SQL",
          "pgvector",
          "Snowflake",
        ],
        companies: ["Freshworks", "Zoho"],
        education: [
          {
            degree: "M.Tech Data Science",
            institution: "IIT Madras",
            year: 2017,
          },
        ],
        experience: [
          { company: "Freshworks", title: "Senior Data Engineer", years: 4 },
          { company: "Zoho", title: "Data Engineer", years: 3 },
        ],
      },
    },
    {
      id: "cand-006",
      email: "vikram.nair@proton.me",
      name: "Vikram Nair",
      sources: ["zoho"],
      needs_review: false,
      createdDaysAgo: 4,
      parsed: {
        location: "Kochi, India",
        experience_years: 9,
        skills: [
          "Node.js",
          "Go",
          "PostgreSQL",
          "Redis",
          "Kafka",
          "Docker",
          "GCP",
        ],
        companies: ["CRED", "PhonePe", "Oracle"],
        education: [
          { degree: "B.Tech CS", institution: "NIT Calicut", year: 2015 },
        ],
        experience: [
          { company: "CRED", title: "Staff Engineer", years: 3 },
          { company: "PhonePe", title: "Senior Backend Engineer", years: 3 },
        ],
      },
    },
    {
      id: "cand-007",
      email: "ananya.bose@gmail.com",
      name: "Ananya Bose",
      sources: ["zoho"],
      needs_review: true,
      createdDaysAgo: 2,
      parsed: {
        location: "Kolkata, India",
        experience_years: 3,
        skills: ["React", "Next.js", "Tailwind CSS", "Figma", "TypeScript"],
        companies: ["Byju's"],
        education: [
          {
            degree: "B.Sc CS",
            institution: "Jadavpur University",
            year: 2021,
          },
        ],
        experience: [
          { company: "Byju's", title: "Frontend Developer", years: 2 },
        ],
      },
    },
    {
      id: "cand-008",
      email: "rohan.verma@icloud.com",
      name: "Rohan Verma",
      sources: ["merge-greenhouse"],
      needs_review: false,
      createdDaysAgo: 3,
      parsed: {
        location: "Pune, India",
        experience_years: 6,
        skills: [
          "Product Management",
          "SQL",
          "Amplitude",
          "Mixpanel",
          "Jira",
          "A/B Testing",
        ],
        companies: ["Swiggy", "Ola"],
        education: [
          { degree: "MBA", institution: "IIM Ahmedabad", year: 2018 },
        ],
        experience: [
          { company: "Swiggy", title: "Senior Product Manager", years: 3 },
          { company: "Ola", title: "Product Manager", years: 3 },
        ],
      },
    },
    {
      id: "cand-009",
      email: "deepika.pillai@gmail.com",
      name: "Deepika Pillai",
      sources: ["merge-greenhouse"],
      needs_review: false,
      createdDaysAgo: 2,
      parsed: {
        location: "Bangalore, India",
        experience_years: 5,
        skills: [
          "React",
          "TypeScript",
          "GraphQL",
          "Node.js",
          "PostgreSQL",
          "Docker",
        ],
        companies: ["Meesho", "Nykaa"],
        education: [
          {
            degree: "B.Tech IS",
            institution: "BITS Pilani",
            year: 2019,
          },
        ],
        experience: [
          {
            company: "Meesho",
            title: "Senior Full Stack Engineer",
            years: 3,
          },
          { company: "Nykaa", title: "Software Engineer", years: 2 },
        ],
      },
    },
    {
      id: "cand-010",
      email: "suresh.iyer@gmail.com",
      name: "Suresh Iyer",
      sources: ["upload"],
      needs_review: false,
      createdDaysAgo: 1,
      parsed: {
        location: "Remote — Chennai",
        experience_years: 11,
        skills: [
          "Node.js",
          "Go",
          "AWS",
          "Terraform",
          "PostgreSQL",
          "Redis",
          "Kafka",
          "System Design",
        ],
        companies: ["Atlassian", "Grab", "Wipro"],
        education: [
          { degree: "B.Tech CS", institution: "Anna University", year: 2013 },
        ],
        experience: [
          { company: "Atlassian", title: "Principal Engineer", years: 4 },
          { company: "Grab", title: "Senior Engineer", years: 4 },
        ],
      },
    },
    {
      id: "cand-011",
      email: "meera.krishnan@gmail.com",
      name: "Meera Krishnan",
      sources: ["linkedin"],
      needs_review: false,
      createdDaysAgo: 1,
      parsed: {
        location: "Ahmedabad, India",
        experience_years: 4,
        skills: [
          "Product Management",
          "SQL",
          "Mixpanel",
          "Roadmapping",
          "User Research",
          "Figma",
        ],
        companies: ["Juspay", "Jupiter Money"],
        education: [
          {
            degree: "B.Tech + MBA",
            institution: "IIT Kharagpur",
            year: 2020,
          },
        ],
        experience: [
          { company: "Juspay", title: "Product Manager", years: 2 },
          { company: "Jupiter Money", title: "Associate PM", years: 2 },
        ],
      },
    },
    {
      id: "cand-012",
      email: "amit.desai@gmail.com",
      name: "Amit Desai",
      sources: ["gmail", "zoho", "linkedin"],
      needs_review: false,
      createdDaysAgo: 3,
      parsed: {
        location: "Ahmedabad, India",
        experience_years: 7,
        skills: [
          "React",
          "Next.js",
          "TypeScript",
          "Node.js",
          "PostgreSQL",
          "GraphQL",
          "Docker",
          "AWS",
        ],
        companies: ["Jio", "Reliance Retail", "Infosys"],
        education: [
          {
            degree: "B.Tech CE",
            institution: "Gujarat University",
            year: 2017,
          },
        ],
        experience: [
          { company: "Jio", title: "Senior Software Engineer", years: 3 },
          { company: "Reliance Retail", title: "Full Stack Developer", years: 2 },
        ],
      },
    },
    {
      id: "cand-013",
      email: "sarah.chen@gmail.com",
      name: "Sarah Chen",
      sources: ["indeed", "merge-greenhouse"],
      needs_review: false,
      createdDaysAgo: 2,
      parsed: {
        location: "Singapore (remote open)",
        experience_years: 8,
        skills: [
          "Python",
          "Machine Learning",
          "pgvector",
          "LangChain",
          "FastAPI",
          "PostgreSQL",
        ],
        companies: ["Grab", "Sea Group"],
        education: [
          {
            degree: "M.Sc CS (AI)",
            institution: "NUS",
            year: 2016,
          },
        ],
        experience: [
          { company: "Grab", title: "Senior ML Engineer", years: 4 },
          { company: "Sea Group", title: "ML Engineer", years: 4 },
        ],
      },
    },
    {
      id: "cand-014",
      email: "daniel.osei@gmail.com",
      name: "Daniel Osei",
      sources: ["gmail"],
      needs_review: false,
      createdDaysAgo: 1,
      parsed: {
        location: "London, UK (remote open)",
        experience_years: 6,
        skills: [
          "React",
          "TypeScript",
          "Next.js",
          "Supabase",
          "PostgreSQL",
          "Tailwind CSS",
          "Storybook",
        ],
        companies: ["Monzo", "Revolut"],
        education: [
          { degree: "BSc CS", institution: "UCL", year: 2018 },
        ],
        experience: [
          { company: "Monzo", title: "Senior Frontend Engineer", years: 3 },
          { company: "Revolut", title: "Frontend Engineer", years: 3 },
        ],
      },
    },
    {
      id: "cand-015",
      email: "pooja.agarwal@gmail.com",
      name: "Pooja Agarwal",
      sources: ["zoho"],
      needs_review: true,
      createdDaysAgo: 1,
      parsed: {
        location: "Jaipur, India",
        experience_years: 2,
        skills: [
          "Figma",
          "Adobe Illustrator",
          "UI Design",
          "Prototyping",
        ],
        companies: ["Freelance"],
        education: [
          {
            degree: "B.Des Graphic Design",
            institution: "Amity University",
            year: 2022,
          },
        ],
        experience: [
          { company: "Freelance", title: "UI/UX Designer", years: 2 },
        ],
      },
    },
  ];

  const mapPrimarySource = (s: string): Db["Enums"]["candidate_source"] => {
    switch (s) {
      case "gmail":
        return "gmail";
      case "indeed":
        return "indeed";
      case "zoho":
        return "zoho";
      case "upload":
        return "resume_upload";
      case "linkedin":
        return "linkedin";
      case "merge-greenhouse":
        return "merge_ats";
      default:
        return "gmail";
    }
  };

  const candidates: CandInsert[] = baseCandidates.map((c) => ({
    id: c.id,
    email: c.email,
    full_name: c.name,
    created_at: daysAgo(c.createdDaysAgo),
    updated_at: new Date().toISOString(),
    is_duplicate: false,
    source: mapPrimarySource(c.sources[0]),
    sources: c.sources,
    needs_review: c.needs_review,
    location: c.parsed.location,
    experience_years: c.parsed.experience_years,
    skills: c.parsed.skills,
    education: c.parsed.education,
    work_history: c.parsed.experience,
    headline: null,
    ai_score: null,
    ai_score_breakdown: null,
    dedup_confidence: null,
    dedup_hash: null,
    duplicate_of: null,
    linkedin_url: null,
    parsed_at: null,
    phone: null,
    raw_resume_text: null,
    resume_url: null,
    source_id: null,
    summary: null,
  }));

  const { error, count } = await supabase
    .from("candidates")
    .insert(candidates, { count: "exact" });

  if (error) {
    console.error("Error inserting candidates:", error.message);
    throw error;
  }

  console.log(`Inserted ${count ?? candidates.length} candidates.`);
}

async function seedApplications() {
  type AppInsert = Db["Tables"]["applications"]["Insert"];

  const baseApps: {
    candidate_id: string;
    job_id: string;
    status: "new" | "shortlisted" | "interviewing" | "rejected";
    score: number;
    meet_url?: string;
  }[] = [
    { candidate_id: "cand-001", job_id: "job-001", status: "shortlisted", score: 92 },
    { candidate_id: "cand-002", job_id: "job-002", status: "shortlisted", score: 88 },
    { candidate_id: "cand-003", job_id: "job-004", status: "new", score: 78 },
    { candidate_id: "cand-004", job_id: "job-001", status: "new", score: 71 },
    { candidate_id: "cand-005", job_id: "job-005", status: "shortlisted", score: 95 },
    {
      candidate_id: "cand-006",
      job_id: "job-002",
      status: "interviewing",
      score: 91,
      meet_url: "https://meet.google.com/abc-defg-hij",
    },
    { candidate_id: "cand-007", job_id: "job-001", status: "new", score: 62 },
    { candidate_id: "cand-008", job_id: "job-003", status: "shortlisted", score: 89 },
    { candidate_id: "cand-009", job_id: "job-001", status: "new", score: 84 },
    {
      candidate_id: "cand-010",
      job_id: "job-002",
      status: "interviewing",
      score: 96,
      meet_url: "https://meet.google.com/xyz-uvwx-yz1",
    },
    { candidate_id: "cand-011", job_id: "job-003", status: "new", score: 77 },
    { candidate_id: "cand-012", job_id: "job-001", status: "rejected", score: 55 },
    { candidate_id: "cand-012", job_id: "job-002", status: "new", score: 80 },
    { candidate_id: "cand-013", job_id: "job-005", status: "shortlisted", score: 97 },
    { candidate_id: "cand-014", job_id: "job-001", status: "new", score: 88 },
    { candidate_id: "cand-015", job_id: "job-004", status: "new", score: 48 },
  ];

  const now = new Date().toISOString();

  const apps: AppInsert[] = baseApps.map((a, idx) => ({
    id: undefined,
    candidate_id: a.candidate_id,
    job_id: a.job_id,
    status: a.status,
    ai_score: a.score,
    recruiter_notes: a.meet_url
      ? `Scheduled via seed script. Meet: ${a.meet_url}`
      : null,
    ai_notes: null,
    applied_at: daysAgo(7 - (idx % 7)),
    created_at: now,
    updated_at: now,
  }));

  const { error, count } = await supabase
    .from("applications")
    .insert(apps, { count: "exact" });

  if (error) {
    console.error("Error inserting applications:", error.message);
    throw error;
  }

  console.log(`Inserted ${count ?? apps.length} applications.`);
}

async function seedShortlists() {
  type ShortInsert = Db["Tables"]["shortlists"]["Insert"];

  const baseShort: {
    job_id: string;
    candidate_id: string;
    score: number;
    reason: string;
  }[] = [
    {
      job_id: "job-001",
      candidate_id: "cand-001",
      score: 92,
      reason: "Strong React + TypeScript, fintech exp at Razorpay",
    },
    {
      job_id: "job-001",
      candidate_id: "cand-014",
      score: 88,
      reason: "Next.js expert from Monzo + Revolut, clean fintech pedigree",
    },
    {
      job_id: "job-001",
      candidate_id: "cand-009",
      score: 84,
      reason: "Full-stack React + Node, solid architecture experience",
    },
    {
      job_id: "job-001",
      candidate_id: "cand-004",
      score: 71,
      reason: "React experience but limited TypeScript depth",
    },
    {
      job_id: "job-001",
      candidate_id: "cand-012",
      score: 55,
      reason: "Generalist, React not primary stack",
    },
    {
      job_id: "job-002",
      candidate_id: "cand-010",
      score: 96,
      reason: "Principal engineer, Atlassian + Grab, Go + Node expert",
    },
    {
      job_id: "job-002",
      candidate_id: "cand-006",
      score: 91,
      reason: "Staff eng at CRED, Kafka + Redis + PostgreSQL",
    },
    {
      job_id: "job-002",
      candidate_id: "cand-002",
      score: 88,
      reason: "Senior Node at Paytm, strong scale experience",
    },
    {
      job_id: "job-005",
      candidate_id: "cand-013",
      score: 97,
      reason: "ML engineer, pgvector + Python, exact fit",
    },
    {
      job_id: "job-005",
      candidate_id: "cand-005",
      score: 95,
      reason: "Data engineer, pgvector + dbt + Airflow at Freshworks",
    },
  ];

  const now = new Date().toISOString();

  const shorts: ShortInsert[] = baseShort.map((s, index) => ({
    id: undefined,
    job_id: s.job_id,
    candidate_id: s.candidate_id,
    score: s.score,
    rank: index + 1,
    notes: s.reason,
    shortlisted_by: null,
    created_at: now,
  }));

  const { error, count } = await supabase
    .from("shortlists")
    .insert(shorts, { count: "exact" });

  if (error) {
    console.error("Error inserting shortlists:", error.message);
    throw error;
  }

  console.log(`Inserted ${count ?? shorts.length} shortlists.`);
}

async function seedIngestionLogs() {
  type LogInsert = Db["Tables"]["ingestion_logs"]["Insert"];

  const mapSource = (s: string): Db["Enums"]["candidate_source"] => {
    switch (s) {
      case "gmail":
        return "gmail";
      case "indeed":
        return "indeed";
      case "zoho":
        return "zoho";
      case "merge-greenhouse":
        return "merge_ats";
      case "upload":
        return "resume_upload";
      case "linkedin":
        return "linkedin";
      default:
        return "gmail";
    }
  };

  const baseLogs: {
    source: string;
    count: number;
    status: "success" | "failed";
    daysAgo: number;
  }[] = [
    { source: "gmail", count: 4, status: "success", daysAgo: 6 },
    { source: "indeed", count: 2, status: "success", daysAgo: 5 },
    { source: "zoho", count: 0, status: "failed", daysAgo: 7 },
    { source: "zoho", count: 3, status: "success", daysAgo: 4 },
    { source: "merge-greenhouse", count: 2, status: "success", daysAgo: 3 },
    { source: "upload", count: 1, status: "success", daysAgo: 1 },
    { source: "linkedin", count: 5, status: "success", daysAgo: 1 },
    { source: "gmail", count: 2, status: "success", daysAgo: 2 },
    { source: "indeed", count: 3, status: "success", daysAgo: 1 },
    { source: "merge-greenhouse", count: 1, status: "success", daysAgo: 1 },
  ];

  const logs: LogInsert[] = baseLogs.map((l) => ({
    id: undefined,
    source: mapSource(l.source),
    total_fetched: l.count,
    total_inserted: l.count,
    total_duplicates: 0,
    total_failed: l.status === "failed" ? l.count : 0,
    status: l.status === "failed" ? "failed" : "completed",
    created_at: daysAgo(l.daysAgo),
    started_at: daysAgo(l.daysAgo),
    finished_at: daysAgo(l.daysAgo),
    metadata: null,
    error_message: l.status === "failed" ? "Zoho connection error (demo)" : null,
  }));

  const { error, count } = await supabase
    .from("ingestion_logs")
    .insert(logs, { count: "exact" });

  if (error) {
    console.error("Error inserting ingestion_logs:", error.message);
    throw error;
  }

  console.log(`Inserted ${count ?? logs.length} ingestion_logs.`);
}

async function main() {
  try {
    await clearData();
    await seedJobs();
    await seedCandidates();
    await seedApplications();
    await seedShortlists();
    await seedIngestionLogs();
    console.log("Seed completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

main();

