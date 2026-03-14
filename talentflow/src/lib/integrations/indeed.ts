import axios from "axios";

/**
 * Fetches candidates from Indeed via MCP Bridge and queues them for parsing.
 */
export async function fetchIndeedCandidates() {
  const MCP_BRIDGE_URL = process.env.MCP_BRIDGE_URL || "http://localhost:3001";
  const WORKER_URL = process.env.WORKER_URL || "http://localhost:3002";

  try {
    console.log(`[Indeed] Fetching candidates from MCP bridge: ${MCP_BRIDGE_URL}`);
    const response = await axios.post(`${MCP_BRIDGE_URL}/indeed/fetch`);
    const candidates = response.data.results || [];

    let queuedCount = 0;

    for (const applicant of candidates) {
      // Map Indeed fields to a format the worker expects
      // Often Indeed gives raw text if they've applied with a resume
      console.log(`[Indeed] Queuing applicant: ${applicant.name}`);
      
      await axios.post(`${WORKER_URL}/jobs`, {
        job: "parse_resume",
        text: applicant.resume_text || `Name: ${applicant.name}\nEmail: ${applicant.email}\nPhone: ${applicant.phone}`,
        source: "indeed",
        source_id: applicant.id,
      });
      queuedCount++;
    }

    return { queued: queuedCount };
  } catch (error) {
    console.error("[Indeed Integration] Error:", error instanceof Error ? error.message : error);
    throw error;
  }
}
