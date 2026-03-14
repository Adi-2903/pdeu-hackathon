import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anthropicKey = process.env.ANTHROPIC_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);
const anthropic = new Anthropic({ apiKey: anthropicKey });

export interface ShortlistResult {
  candidate_id: string;
  score: number;
  reason: string;
  candidate?: any;
}

/**
 * AI Shortlisting: Scores candidates against a Job Description.
 */
export async function scoreCandidates(
  jd: string, 
  jobId?: string,
  candidateIds?: string[]
): Promise<ShortlistResult[]> {
  try {
    // 1. Fetch candidates
    let query = supabase.from('candidates').select('*').eq('is_duplicate', false);
    
    if (candidateIds && candidateIds.length > 0) {
      query = query.in('id', candidateIds);
    }
    
    const { data: candidates, error: fetchError } = await query;
    if (fetchError) throw fetchError;
    if (!candidates || candidates.length === 0) return [];

    console.log(`[Shortlist] Scoring ${candidates.length} candidates against JD...`);

    // 2. Batch into groups of 10 to manage token limits/latency
    const batchSize = 10;
    const results: ShortlistResult[] = [];

    for (let i = 0; i < candidates.length; i += batchSize) {
      const batch = candidates.slice(i, i + batchSize);
      const batchData = batch.map(c => ({
        id: c.id,
        name: c.full_name,
        headline: c.headline,
        summary: c.summary,
        skills: c.skills,
        experience: c.experience_years,
        work_history: c.work_history,
        education: c.education
      }));

      const systemPrompt = `You are an elite technical recruiter. Score each candidate (0-100) based on their fit for the provided Job Description.
Return ONLY a valid JSON array: [{"candidate_id": "uuid", "score": number, "reason": "string (max 12 words)"}].
No markdown, no preamble.`;

      const userPrompt = `Job Description:\n"${jd}"\n\nCandidates:\n${JSON.stringify(batchData, null, 2)}`;

      const message = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 2000,
        temperature: 0.1,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });

      const responseText = (message.content[0] as any).text.trim();
      const cleanJson = responseText.replace(/```json\n?|```/g, "").trim();
      const batchScores: ShortlistResult[] = JSON.parse(cleanJson);
      
      results.push(...batchScores);
    }

    // 3. Merge with full candidate data and sort
    const finalResults = results.map(res => {
      const candidate = candidates.find(c => c.id === res.candidate_id);
      return { ...res, candidate };
    }).sort((a, b) => b.score - a.score);

    // 4. Optionally save to shortlists table if jobId is provided
    if (jobId) {
      console.log(`[Shortlist] Saving top results to shortlists table for job ${jobId}`);
      const shortlistInserts = finalResults.slice(0, 50).map((res, index) => ({
        job_id: jobId,
        candidate_id: res.candidate_id,
        score: res.score,
        rank: index + 1,
        notes: res.reason
      }));

      const { error: upsertError } = await supabase
        .from('shortlists')
        .upsert(shortlistInserts, { onConflict: 'job_id,candidate_id' });

      if (upsertError) console.error("[Shortlist] Error saving to DB:", upsertError.message);
    }

    return finalResults;

  } catch (error) {
    console.error("[Shortlist Scorer] Error:", error);
    throw error;
  }
}
