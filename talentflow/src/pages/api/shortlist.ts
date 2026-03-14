import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import type { Database } from "@/types/database";

const shortlistSchema = z.object({
  job_description: z
    .string()
    .min(50, "Job description must be at least 50 characters long"),
  job_id: z.string().uuid().optional(),
  candidate_ids: z.array(z.string().uuid()).optional(),
});

const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
const anthropic = anthropicApiKey
  ? new Anthropic({ apiKey: anthropicApiKey })
  : null;

async function POST(req: NextRequest) {
  try {
    if (!anthropic) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not set" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const result = shortlistSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.issues[0]?.message || "Invalid request" },
        { status: 400 }
      );
    }

    const { job_description, job_id } = result.data;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    const { data: candidates, error } = await supabase
      .from("candidates")
      .select("id, full_name, email, location, experience_years, skills, sources, summary");

    if (error) {
      console.error("[Shortlist API] Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to load candidates" },
        { status: 500 }
      );
    }

    const batches: typeof candidates[] = [];
    const all = candidates || [];
    const batchSize = 10;
    for (let i = 0; i < all.length; i += batchSize) {
      batches.push(all.slice(i, i + batchSize));
    }

    const systemPrompt =
      "Score each candidate 0-100 for this job description. Return ONLY JSON: [{ candidate_id, score, reason }]. reason is max 12 words.";

    const allScored: { candidate_id: string; score: number; reason: string }[] =
      [];

    for (const batch of batches) {
      if (batch.length === 0) continue;

      const payload = batch.map((c) => ({
        candidate_id: c.id,
        name: c.full_name,
        email: c.email,
        location: c.location,
        experience_years: c.experience_years,
        skills: c.skills,
        sources: c.sources,
        summary: c.summary,
      }));

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        temperature: 0.1,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  "Job description:\n" +
                  job_description +
                  "\n\nCandidates:\n" +
                  JSON.stringify(payload, null, 2),
              },
            ],
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== "text") {
        throw new Error("Unexpected response type from Claude");
      }

      const clean = content.text.replace(/```json\s*|```/g, "").trim();
      try {
        const parsed = JSON.parse(clean) as {
          candidate_id: string;
          score: number;
          reason: string;
        }[];
        allScored.push(...parsed);
      } catch (e) {
        console.error("[Shortlist API] Failed to parse batch JSON:", e, clean);
      }
    }

    const mergedMap = new Map<string, { score: number; reason: string }>();
    for (const r of allScored) {
      const existing = mergedMap.get(r.candidate_id);
      if (!existing || r.score > existing.score) {
        mergedMap.set(r.candidate_id, { score: r.score, reason: r.reason });
      }
    }

    const ranked = Array.from(mergedMap.entries())
      .map(([candidate_id, { score, reason }]) => ({
        candidate_id,
        score,
        reason,
      }))
      .sort((a, b) => b.score - a.score);

    if (job_id) {
      const rows = ranked.map((r, index) => ({
        job_id,
        candidate_id: r.candidate_id,
        score: r.score,
        rank: index + 1,
        notes: r.reason,
      }));

      const { error: upsertError } = await supabase
        .from("shortlists")
        .upsert(rows, { onConflict: "job_id,candidate_id" });

      if (upsertError) {
        console.error("[Shortlist API] Upsert error:", upsertError);
      }
    }

    const byId = new Map(all.map((c) => [c.id, c]));
    const top20 = ranked.slice(0, 20).map((r) => ({
      candidate_id: r.candidate_id,
      score: r.score,
      reason: r.reason,
      candidate: byId.get(r.candidate_id) || null,
    })).filter((r) => r.candidate);

    return NextResponse.json({
      count: top20.length,
      results: top20,
    });
  } catch (error) {
    console.error("[Shortlist API] Error:", error);
    return NextResponse.json(
      { error: "Internal shortlisting engine error" },
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
