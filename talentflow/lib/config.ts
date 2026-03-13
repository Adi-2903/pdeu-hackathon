/**
 * Feature flag for using mock data instead of real APIs
 * Set NEXT_PUBLIC_USE_MOCKS=true in .env.local to enable
 */
export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

/**
 * Dynamically imports either mock or real implementation
 */
export async function getSearchImplementation() {
  if (USE_MOCKS) {
    return await import("@/lib/ai/candidate-search.mock");
  }
  return await import("@/lib/ai/candidate-search");
}

export async function getShortlistImplementation() {
  if (USE_MOCKS) {
    return await import("@/lib/ai/shortlist-scorer.mock");
  }
  return await import("@/lib/ai/shortlist-scorer");
}

export async function getCalendarImplementation() {
  if (USE_MOCKS) {
    return await import("@/lib/integrations/calendar.mock");
  }
  return await import("@/lib/integrations/calendar");
}

console.log(`[Config] Using ${USE_MOCKS ? "MOCK" : "REAL"} implementations`);
