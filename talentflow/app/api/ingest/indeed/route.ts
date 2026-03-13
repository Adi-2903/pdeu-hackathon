import { NextResponse } from "next/server";
import { fetchIndeedCandidates } from "@/lib/integrations/indeed";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const result = await fetchIndeedCandidates();

    // Log to ingestion_logs
    await supabase.from("ingestion_logs").insert({
      source: "indeed",
      status: "completed",
      total_fetched: result.queued,
      total_inserted: result.queued,
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      queued: result.queued, 
      message: `Successfully queued ${result.queued} candidates from Indeed.` 
    });
  } catch (error) {
    console.error("[Indeed API] Error:", error);

    await supabase.from("ingestion_logs").insert({
      source: "indeed",
      status: "failed",
      error_message: error instanceof Error ? error.message : "Unknown error",
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString()
    });

    return NextResponse.json({ error: "Failed to fetch from Indeed" }, { status: 500 });
  }
}
