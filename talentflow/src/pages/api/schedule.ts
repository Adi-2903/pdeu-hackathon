import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const scheduleSchema = z.object({
  candidate_id: z.string().uuid(),
  job_id: z.string().uuid(),
});

async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    const body = await req.json();
    const validated = scheduleSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { candidate_id, job_id } = validated.data;

    const [candidateRes, jobRes] = await Promise.all([
      supabase
        .from("candidates")
        .select("full_name, email")
        .eq("id", candidate_id)
        .single(),
      supabase.from("jobs").select("title").eq("id", job_id).single(),
    ]);

    if (candidateRes.error || !candidateRes.data) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }
    if (jobRes.error || !jobRes.data) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const candidate = candidateRes.data;
    const job = jobRes.data;

    const mcpUrl = process.env.MCP_BRIDGE_URL;
    let meetUrl = "https://meet.google.com/mock-link";

    if (mcpUrl) {
      try {
        const res = await fetch(`${mcpUrl.replace(/\/$/, "")}/calendar/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            summary: `${candidate.full_name} — ${job.title} Interview`,
            duration_minutes: 60,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as { meet_url?: string };
          if (data.meet_url) {
            meetUrl = data.meet_url;
          }
        }
      } catch (err) {
        console.error("[Schedule API] MCP bridge error, falling back to mock:", err);
      }
    }

    const draftEmail = `Hi ${candidate.full_name}, We'd like to invite you for an interview for ${job.title}.
Join here: ${meetUrl}
Best regards, TalentFlow Recruiting`;

    await supabase
      .from("applications")
      .upsert(
        {
          candidate_id,
          job_id,
          status: "interviewing",
          recruiter_notes: `Scheduled interview via API: ${meetUrl}`,
        },
        { onConflict: "candidate_id,job_id" }
      );

    return NextResponse.json({
      meet_url: meetUrl,
      draft_email: draftEmail,
    });
  } catch (error) {
    console.error("[Schedule API] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to schedule interview" },
      { status: 500 }
    );
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
