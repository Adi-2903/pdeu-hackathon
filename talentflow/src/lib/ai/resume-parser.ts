import Anthropic from "@anthropic-ai/sdk";

export interface ParsedCandidate {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience_years: number;
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  location: string;
  companies: string[];
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Parses resume text using Claude 3.5 Sonnet (requested model: claude-sonnet-4-20250514)
 */
export async function parseResume(text: string): Promise<ParsedCandidate> {
  const model = "claude-sonnet-4-20250514";
  
  const systemPrompt = "You are a resume parser. Return ONLY valid JSON, no markdown, no preamble. Fields: name (string), email (string), phone (string), skills (string[]), experience_years (number), education ({degree,institution,year}[]), location (string), companies (string[])";

  try {
    const response = await anthropic.messages.create({
      model: model,
      max_tokens: 2000,
      temperature: 0.1,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Parse the following resume text into structured JSON:\n\n${text}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error("Unexpected response type from Claude");
    }

    // Strip markdown fences
    const cleanJson = content.text.replace(/```json\n?|```/g, "").trim();

    const parsed = JSON.parse(cleanJson) as ParsedCandidate;
    return parsed;
  } catch (error) {
    console.error("[parseResume] Error:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to parse resume");
  }
}
