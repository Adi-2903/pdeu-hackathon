import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import type { Database } from "@/types/database";

const searchSchema = z.object({
  query: z.string().min(3, "Query must be at least 3 characters long"),
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
    const result = searchSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { query } = result.data;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    const { data: candidates, error } = await supabase
      .from("candidates")
      .select("id, full_name, email, location, experience_years, skills, sources, summary");

    if (error) {
      console.error("[Search API] Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to load candidates" },
        { status: 500 }
      );
    }

    const summaryPayload = (candidates || []).map((c) => ({
      candidate_id: c.id,
      name: c.full_name,
      email: c.email,
      location: c.location,
      experience_years: c.experience_years,
      skills: c.skills,
      sources: c.sources,
      summary: c.summary,
    }));

    const systemPrompt =
      "You are a recruitment search engine. Given a plain-English query and a list of candidates, return ONLY a JSON array of the top matches: [{ candidate_id, score, reason }] sorted by score descending. Score 0-100. reason is max 12 words.";

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      temperature: 0.2,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "Query:\n" +
                query +
                "\n\nCandidates:\n" +
                JSON.stringify(summaryPayload, null, 2),
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
    let ranked: { candidate_id: string; score: number; reason: string }[] = [];

    try {
      ranked = JSON.parse(clean);
    } catch (e) {
      console.error("[Search API] Failed to parse Claude JSON:", e, clean);
      return NextResponse.json(
        { error: "LLM response parse error" },
        { status: 500 }
      );
    }

    const byId = new Map((candidates || []).map((c) => [c.id, c]));
    const results = ranked
      .map((r) => ({
        candidate_id: r.candidate_id,
        score: r.score,
        reason: r.reason,
        candidate: byId.get(r.candidate_id) || null,
      }))
      .filter((r) => r.candidate);

    return NextResponse.json({
      query,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error("[Search API] Error:", error);
    return NextResponse.json(
      { error: "Internal search engine error" },
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
