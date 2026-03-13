import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface DedupAIResult {
  is_duplicate: boolean;
  confidence: number;
  reason: string;
}

/**
 * Uses Claude to check if two candidate profiles refer to the same person.
 * Model: claude-sonnet-4-20250514, temperature: 0.1
 */
export async function checkDuplicateWithAI(
  candidate1: Record<string, unknown>,
  candidate2: Record<string, unknown>
): Promise<DedupAIResult> {
  const model = "claude-sonnet-4-20250514";
  
  const prompt = `Are these the same person? Return ONLY JSON: { is_duplicate: boolean, confidence: number (0-100), reason: string }

Candidate A:
${JSON.stringify(candidate1, null, 2)}

Candidate B:
${JSON.stringify(candidate2, null, 2)}

Consider name variations, email similarity, and work history overlap.`;

  try {
    const response = await anthropic.messages.create({
      model: model,
      max_tokens: 1000,
      temperature: 0.1,
      system: "You are a deduplication engine. Return ONLY valid JSON.",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    const cleanJson = content.text.replace(/```json\n?|```/g, "").trim();
    const parsed = JSON.parse(cleanJson) as DedupAIResult;
    
    return parsed;
  } catch (error) {
    console.error("[checkDuplicateWithAI] Error:", error);
    return {
      is_duplicate: false,
      confidence: 0,
      reason: "Error in AI deduplication: " + (error instanceof Error ? error.message : String(error))
    };
  }
}
