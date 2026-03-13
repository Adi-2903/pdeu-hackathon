import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const shortlistSchema = z.object({
  job_description: z.string().min(50, "Job description must be at least 50 characters long"),
  job_id: z.string().uuid().optional(),
  candidate_ids: z.array(z.string().uuid()).optional(),
});

// Dynamically load mock or real implementation
const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = shortlistSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { job_description, job_id, candidate_ids } = result.data;
    
    // Import the appropriate implementation
    const { scoreCandidates } = useMocks
      ? await import("@/lib/ai/shortlist-scorer.mock")
      : await import("@/lib/ai/shortlist-scorer");
    
    const rankedCandidates = await scoreCandidates(job_description, job_id, candidate_ids);

    return NextResponse.json({
      count: rankedCandidates.length,
      results: rankedCandidates,
    });
  } catch (error) {
    console.error("[Shortlist API] Error:", error);
    return NextResponse.json(
      { error: "Internal shortlisting engine error" },
      { status: 500 }
    );
  }
}
