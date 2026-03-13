import { createClient } from "@supabase/supabase-js";
import { generateEmbedding } from "./search-embeddings";
import Anthropic from "@anthropic-ai/sdk";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anthropicKey = process.env.ANTHROPIC_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);
const anthropic = new Anthropic({ apiKey: anthropicKey });

export interface SearchResult {
  candidate_id: string;
  score: number;
  reason: string;
  candidate?: any;
}

/**
 * Natural Language Search: Combines pgvector similarity with Claude re-ranking.
 */
export async function searchCandidates(query: string): Promise<SearchResult[]> {
  try {
    // Step 1: Generate embedding for the query
    console.log(`[Search] Generating embedding for query: "${query}"`);
    const query_embedding = await generateEmbedding(query);

    // Step 2: Vector similarity search via RPC
    console.log(`[Search] Performing vector search...`);
    const { data: vectorResults, error: vectorError } = await supabase.rpc('match_candidates', {
      query_embedding,
      match_count: 20
    });

    if (vectorError) throw vectorError;
    if (!vectorResults || vectorResults.length === 0) return [];

    // Fetch full candidate details for re-ranking
    const candidateIds = vectorResults.map((r: any) => r.candidate_id);
    const { data: candidates, error: fetchError } = await supabase
      .from('candidates')
      .select('*')
      .in('id', candidateIds);

    if (fetchError) throw fetchError;

    // Step 3: Re-rank with Claude
    console.log(`[Search] Re-ranking ${candidates.length} candidates with Claude...`);
    
    const candidateSummaries = candidates.map(c => ({
      id: c.id,
      name: c.full_name,
      headline: c.headline,
      skills: c.skills,
      experience: c.experience_years,
      location: c.location
    }));

    const systemPrompt = `You are an expert technical recruiter. Rank the following candidates (0-100) based on their relevance to the user's search query.
Return ONLY a valid JSON array of objects: [{"candidate_id": "uuid", "score": number, "reason": "short explanation"}].
No markdown, no preamble.`;

    const userPrompt = `Search Query: "${query}"\n\nCandidates:\n${JSON.stringify(candidateSummaries, null, 2)}`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620", // Use the latest stable sonnet
      max_tokens: 1500,
      temperature: 0.1,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const responseText = (message.content[0] as any).text.trim();
    const cleanJson = responseText.replace(/```json\n?|```/g, "").trim();
    const rankedResults: SearchResult[] = JSON.parse(cleanJson);

    // Map candidates back to results for the UI
    return rankedResults.map(res => {
      const fullCandidate = candidates.find(c => c.id === res.candidate_id);
      return {
        ...res,
        candidate: fullCandidate
      };
    }).sort((a, b) => b.score - a.score);

  } catch (error) {
    console.error("[Search Engine] Error:", error);
    throw error;
  }
}
