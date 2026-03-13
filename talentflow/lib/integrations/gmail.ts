import axios from "axios";

/**
 * Fetches potential candidates from Gmail via MCP Bridge and queues them for parsing.
 */
export async function fetchGmailCandidates() {
  const MCP_BRIDGE_URL = process.env.MCP_BRIDGE_URL || "http://localhost:3001";
  const WORKER_URL = process.env.WORKER_URL || "http://localhost:3002";

  try {
    console.log(`[Gmail] Fetching candidates from MCP bridge: ${MCP_BRIDGE_URL}`);
    const response = await axios.post(`${MCP_BRIDGE_URL}/gmail/fetch`);
    const candidates = response.data.results || [];

    let queuedCount = 0;

    for (const item of candidates) {
      if (item.attachment_text) {
        console.log(`[Gmail] Queuing resume from: ${item.sender_email}`);
        await axios.post(`${WORKER_URL}/jobs`, {
          job: "parse_resume",
          text: item.attachment_text,
          source: "gmail",
          source_email: item.sender_email,
        });
        queuedCount++;
      }
    }

    return { queued: queuedCount };
  } catch (error) {
    console.error("[Gmail Integration] Error:", error instanceof Error ? error.message : error);
    throw error;
  }
}
