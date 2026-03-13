import axios from "axios";

/**
 * Fetches candidates from Merge.dev ATS and queues them for parsing/deduplication.
 */
export async function fetchMergeCandidates() {
  const MERGE_API_KEY = process.env.MERGE_API_KEY;
  const MERGE_ACCOUNT_TOKEN = process.env.MERGE_ACCOUNT_TOKEN;
  const WORKER_URL = process.env.WORKER_URL || "http://localhost:3002";

  if (!MERGE_API_KEY || !MERGE_ACCOUNT_TOKEN) {
    throw new Error("Merge.dev credentials missing in environment");
  }

  let queuedCount = 0;
  let nextUrl: string | null = "https://api.merge.dev/api/ats/v1/candidates";

  try {
    while (nextUrl) {
      console.log(`[Merge.dev] Fetching candidates from: ${nextUrl}`);
      const response = await axios.get(nextUrl, {
        headers: {
          Authorization: `Bearer ${MERGE_API_KEY}`,
          "X-Account-Token": MERGE_ACCOUNT_TOKEN,
        },
      });

      const { results, next } = response.data;
      nextUrl = next; // Update for next iteration

      for (const candidate of results) {
        const name = `${candidate.first_name || ""} ${candidate.last_name || ""}`.trim();
        const email = candidate.email_addresses?.[0]?.value || "";
        const phone = candidate.phone_numbers?.[0]?.value || "";
        const location = candidate.locations?.[0] || "";

        console.log(`[Merge.dev] Queuing candidate: ${name}`);

        await axios.post(`${WORKER_URL}/jobs`, {
          job: "parse_resume",
          text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nLocation: ${location}`,
          source: "merge-greenhouse",
          source_id: candidate.id,
        });
        queuedCount++;
      }
    }

    return { queued: queuedCount };
  } catch (error) {
    console.error("[Merge Integration] Error:", error instanceof Error ? error.message : error);
    throw error;
  }
}
