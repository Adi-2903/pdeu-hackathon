const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const EMBEDDING_MODEL = "text-embedding-3-small";

/**
 * Generates a vector embedding for a given text using OpenAI (text-embedding-3-small)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error("No text provided for embedding");
  }

  // Clean the text slightly: remove newlines and extra spaces
  const input = text.replace(/\n/g, " ").trim();

  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: input,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error("[generateEmbedding] Error:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to generate embedding");
  }
}

/**
 * Combines parsed candidate data into a rich string for embedding
 */
export function createCandidateEmbeddingString(data: {
  fullName: string;
  headline?: string;
  summary?: string;
  skills: string[];
  experienceYears: number;
}): string {
  const parts = [
    data.fullName,
    data.headline || "",
    data.summary || "",
    `Skills: ${data.skills.join(", ")}`,
    `Experience: ${data.experienceYears} years`,
  ];
  return parts.filter(Boolean).join(" | ");
}
