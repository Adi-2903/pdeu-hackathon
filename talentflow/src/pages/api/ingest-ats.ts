import { NextRequest, NextResponse } from "next/server";
import { fetchMergeCandidates } from "@/frontend/lib/integrations/merge";
import { fetchZohoCandidates } from "@/frontend/lib/integrations/zoho";
import { createClient } from "@supabase/supabase-js";

async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get("source");

  if (!source || !["merge", "zoho"].includes(source)) {
    return NextResponse.json({ error: "Invalid source. Must be 'merge' or 'zoho'." }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    let result;
    if (source === "merge") {
      result = await fetchMergeCandidates();
    } else {
      result = await fetchZohoCandidates();
    }

    // Log to ingestion_logs
    await supabase.from("ingestion_logs").insert({
      source: source === "merge" ? "merge_ats" : "zoho",
      status: "completed",
      total_fetched: result.queued,
      total_inserted: result.queued,
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      queued: result.queued, 
      message: `Successfully queued ${result.queued} candidates from ${source}.` 
    });
  } catch (error) {
    console.error(`[ATS Ingestion API] ${source} Error:`, error);
    
    await supabase.from("ingestion_logs").insert({
      source: source === "merge" ? "merge_ats" : "zoho",
      status: "failed",
      error_message: error instanceof Error ? error.message : "Unknown error",
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString()
    });

    return NextResponse.json({ error: `Failed to fetch from ${source}` }, { status: 500 });
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
