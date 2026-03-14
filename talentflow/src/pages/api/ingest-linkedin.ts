import { NextRequest, NextResponse } from "next/server";
import { loadLinkedInMock } from "@/frontend/lib/integrations/linkedin-mock";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

async function POST(_req: NextRequest) {
  const WORKER_URL = process.env.WORKER_URL || "http://localhost:3002";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const profiles = await loadLinkedInMock();
    
    console.log(`[LinkedIn Mock] Triggering ingestion for ${profiles.length} profiles`);

    for (const profile of profiles) {
      // For mock data, we simulate a "parse_resume" job but pass the data directly
      // In a real scenario, we might pass a text block, but here we can simulate the parsed output
      await axios.post(`${WORKER_URL}/jobs`, {
        job: "parse_resume",
        text: `LinkedIn Profile: ${profile.name}\nHeadline: ${profile.headline}\nSkills: ${profile.skills.join(", ")}`,
        source: "linkedin",
        // We can pass pre-mapped fields if the worker supports it, or just let it "parse" the mock text
      });
    }

    // Log to ingestion_logs
    await supabase.from("ingestion_logs").insert({
      source: "linkedin",
      status: "completed",
      total_fetched: profiles.length,
      total_inserted: profiles.length,
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      queued: profiles.length,
      message: `Successfully queued ${profiles.length} mock LinkedIn candidates.`
    });
  } catch (error) {
    console.error("[LinkedIn API] Error:", error);
    
    await supabase.from("ingestion_logs").insert({
      source: "linkedin",
      status: "failed",
      error_message: error instanceof Error ? error.message : "Unknown error",
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString()
    });

    return NextResponse.json({ error: "Failed to queue mock LinkedIn candidates" }, { status: 500 });
  }
}

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  if (req.method === "POST") {
    return POST(req);
  }

  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
