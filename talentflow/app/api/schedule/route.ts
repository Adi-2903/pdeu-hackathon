import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { scheduleInterview } from "@/lib/integrations/calendar";

const scheduleSchema = z.object({
  candidate_id: z.string().uuid(),
  job_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.json();
    const validated = scheduleSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
    }

    const { candidate_id, job_id } = validated.data;

    // 1. Fetch metadata
    console.log(`[Schedule API] Fetching metadata for Candidate: ${candidate_id}, Job: ${job_id}`);
    
    const [candidateRes, jobRes] = await Promise.all([
      supabase.from("candidates").select("full_name, email").eq("id", candidate_id).single(),
      supabase.from("jobs").select("title").eq("id", job_id).single(),
    ]);

    if (candidateRes.error || !candidateRes.data) throw new Error("Candidate not found");
    if (jobRes.error || !jobRes.data) throw new Error("Job not found");

    const candidate = candidateRes.data;
    const job = jobRes.data;

    // 2. Call calendar adapter
    const result = await scheduleInterview({
      candidateName: candidate.full_name,
      candidateEmail: candidate.email,
      jobTitle: job.title
    });

    // 3. Update application table (or upsert)
    console.log(`[Schedule API] Updating application with Meet URL...`);
    await supabase
      .from("applications")
      .upsert({
        candidate_id,
        job_id,
        status: "interviewing",
        recruiter_notes: `Scheduled interview via AI: ${result.meet_url || 'No link'}`
      }, { onConflict: "candidate_id,job_id" });

    return NextResponse.json({
      message: "Interview scheduled successfully",
      meet_url: result.meet_url,
      event_link: result.event_link,
      draft_email: result.draft_email
    });

  } catch (error) {
    console.error("[Schedule API] Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to schedule interview" }, { status: 500 });
  }
}
