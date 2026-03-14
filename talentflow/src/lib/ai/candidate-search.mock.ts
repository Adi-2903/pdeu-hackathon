import { mockSearchCandidates, SearchResult } from "@/data/mock-data";

/**
 * Natural Language Search: Mock version
 */
export async function searchCandidates(query: string): Promise<SearchResult[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log(`[Mock Search] Searching for: "${query}"`);
  const results = mockSearchCandidates(query);
  console.log(`[Mock Search] Found ${results.length} candidates`);
  
  return results;
}
