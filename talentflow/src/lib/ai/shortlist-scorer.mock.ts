import { mockScoreCandidates, ShortlistResult } from "@/data/mock-data";

/**
 * AI Shortlisting: Mock version
 */
export async function scoreCandidates(
  jd: string,
  jobId?: string,
  candidateIds?: string[]
): Promise<ShortlistResult[]> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 800));

  console.log(`[Mock Shortlist] Scoring candidates against JD (length: ${jd.length})`);
  const results = mockScoreCandidates(jd, jobId, candidateIds);
  console.log(`[Mock Shortlist] Scored ${results.length} candidates`);
  
  return results;
}
