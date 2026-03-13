import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchCandidates } from "@/lib/ai/candidate-search";

const searchSchema = z.object({
  query: z.string().min(3, "Query must be at least 3 characters long"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = searchSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { query } = result.data;
    const searchResults = await searchCandidates(query);

    return NextResponse.json({
      query,
      results: searchResults,
      count: searchResults.length,
    });
  } catch (error) {
    console.error("[Search API] Error:", error);
    return NextResponse.json(
      { error: "Internal search engine error" },
      { status: 500 }
    );
  }
}
