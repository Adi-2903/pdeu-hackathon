import axios from "axios";

/**
 * Fetches candidates from Zoho Recruit and queues them for parsing.
 */
export async function fetchZohoCandidates() {
  const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
  const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
  const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;
  const WORKER_URL = process.env.WORKER_URL || "http://localhost:3002";

  if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN) {
    throw new Error("Zoho Recruit credentials missing in environment");
  }

  try {
    // 1. Refresh Access Token
    const authUrl = `https://accounts.zoho.in/oauth/v2/token?refresh_token=${ZOHO_REFRESH_TOKEN}&client_id=${ZOHO_CLIENT_ID}&client_secret=${ZOHO_CLIENT_SECRET}&grant_type=refresh_token`;
    const authResp = await axios.post(authUrl);
    const accessToken = authResp.data.access_token;

    if (!accessToken) {
      throw new Error("Failed to get Zoho access token");
    }

    // 2. Fetch Candidates
    let page = 1;
    let queuedCount = 0;
    let hasMore = true;

    while (hasMore) {
      console.log(`[Zoho] Fetching page ${page}`);
      const candidatesResp = await axios.get(
        `https://recruit.zoho.in/recruit/v2/Candidates?page=${page}&per_page=200`,
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
          },
        }
      );

      const candidates = candidatesResp.data.data || [];
      if (candidates.length === 0) {
        hasMore = false;
        break;
      }

      for (const candidate of candidates) {
        let resumeText = `Name: ${candidate.Full_Name}\nEmail: ${candidate.Email}\nPhone: ${candidate.Phone}\nLocation: ${candidate.City}, ${candidate.State}`;

        // If attachment is present, we could fetch it here. 
        // For this hackathon step, we'll prefix with basic data.
        console.log(`[Zoho] Queuing candidate: ${candidate.Full_Name}`);

        await axios.post(`${WORKER_URL}/jobs`, {
          job: "parse_resume",
          text: resumeText,
          source: "zoho",
          source_id: candidate.id,
        });
        queuedCount++;
      }

      const info = candidatesResp.data.info;
      hasMore = info.more_records;
      page++;
    }

    return { queued: queuedCount };
  } catch (error) {
    console.error("[Zoho Integration] Error:", error instanceof Error ? error.message : error);
    throw error;
  }
}
