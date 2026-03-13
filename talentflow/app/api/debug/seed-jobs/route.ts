import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const sampleJobs = [
    {
      title: "Senior React Developer",
      department: "Engineering",
      location: "Remote / Bangalore",
      remote: true,
      description: "We are looking for a Senior React Developer to join our frontend team.",
      requirements: ["React", "TypeScript", "Next.js"],
      status: "open"
    },
    {
      title: "Backend Engineer - Node.js",
      department: "Engineering",
      location: "Mumbai",
      remote: false,
      description: "Join our core platform team as a Backend Engineer.",
      requirements: ["Node.js", "PostgreSQL", "Docker"],
      status: "open"
    },
    {
      title: "Product Manager - SaaS",
      department: "Product",
      location: "Bangalore",
      remote: true,
      description: "As a Product Manager, you will define the product roadmap.",
      requirements: ["Product Strategy", "Agile", "SaaS"],
      status: "open"
    },
    {
      title: "UX Designer",
      department: "Design",
      location: "Remote",
      remote: true,
      description: "We are seeking a UX Designer to create intuitive and beautiful user experiences.",
      requirements: ["Figma", "Design Systems", "Prototyping"],
      status: "open"
    }
  ];

  try {
    const { data, error } = await supabase
      .from("jobs")
      .insert(sampleJobs)
      .select();

    if (error) throw error;

    return NextResponse.json({ message: `Successfully seeded ${data?.length} jobs.`, data });
  } catch (error) {
    console.error("[Seed API] Error:", error);
    return NextResponse.json({ error: "Failed to seed jobs" }, { status: 500 });
  }
}
