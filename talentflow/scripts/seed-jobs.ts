import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables. Make sure .env.local exists.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sampleJobs = [
  {
    title: "Senior React Developer",
    department: "Engineering",
    location: "Remote / Bangalore",
    remote: true,
    description: "We are looking for a Senior React Developer to join our frontend team. You will be responsible for building high-quality UI components and optimizing application performance.",
    requirements: ["React", "TypeScript", "Next.js", "State Management (Zustand/Redux)", "Unit Testing"],
    status: "open"
  },
  {
    title: "Backend Engineer - Node.js",
    department: "Engineering",
    location: "Mumbai",
    remote: false,
    description: "Join our core platform team as a Backend Engineer. You will design and implement scalable microservices using Node.js and PostgreSQL.",
    requirements: ["Node.js", "Express", "PostgreSQL", "Docker", "Redis"],
    status: "open"
  },
  {
    title: "Product Manager - SaaS",
    department: "Product",
    location: "Bangalore",
    remote: true,
    description: "As a Product Manager, you will define the product roadmap and work closely with engineering and design to deliver world-class SaaS features.",
    requirements: ["Product Strategy", "User Research", "Agile/Scrum", "Data Analytics", "SaaS Experience"],
    status: "open"
  },
  {
    title: "UX Designer",
    department: "Design",
    location: "Remote",
    remote: true,
    description: "We are seeking a UX Designer to create intuitive and beautiful user experiences. You will be involved in the entire design process from wireframing to high-fidelity prototypes.",
    requirements: ["Figma", "Design Systems", "Usability Testing", "Wireframing", "Prototyping"],
    status: "open"
  }
];

async function seed() {
  console.log("Seeding sample jobs...");
  
  const { data, error } = await supabase
    .from("jobs")
    .insert(sampleJobs)
    .select();

  if (error) {
    console.error("Error seeding jobs:", error.message);
  } else {
    console.log(`Successfully seeded ${data.length} jobs.`);
  }
}

seed();
