import axios from "axios";

/**
 * Interface for the interview scheduling request
 */
export interface ScheduleRequest {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
}

/**
 * Interface for the interview scheduling response
 */
export interface ScheduleResponse {
  meet_url: string | null;
  event_id: string;
  event_link: string;
  draft_email: string;
}

/**
 * Schedules an interview via the MCP Bridge (Google Calendar MCP)
 */
export async function scheduleInterview(req: ScheduleRequest): Promise<ScheduleResponse> {
  const MCP_BRIDGE_URL = process.env.MCP_BRIDGE_URL || "http://localhost:3001";
  
  try {
    console.log(`[Calendar] Scheduling interview for ${req.candidateName} via MCP Bridge...`);
    
    // Set a default time (tomorrow at 10 AM)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    const endTime = new Date(tomorrow);
    endTime.setHours(11, 0, 0, 0);

    const response = await axios.post(`${MCP_BRIDGE_URL}/calendar/create`, {
      summary: `${req.candidateName} — ${req.jobTitle} Interview`,
      description: `Interview for ${req.jobTitle} position scheduled via TalentFlow.`,
      start_time: tomorrow.toISOString(),
      end_time: endTime.toISOString(),
      candidate_email: req.candidateEmail
    });

    const { meet_url, event_id, event_link } = response.data;

    const draft_email = `Hi ${req.candidateName},

We'd like to invite you for an interview for the ${req.jobTitle} position. 

Details:
Date: ${tomorrow.toLocaleDateString()}
Time: ${tomorrow.toLocaleTimeString()}
Meeting Link: ${meet_url || "Link will be shared shortly"}

Looking forward to speaking with you!

Best regards,
TalentFlow Recruitment Team`;

    return {
      meet_url,
      event_id,
      event_link,
      draft_email
    };
  } catch (error) {
    console.error("[Calendar Integration] Error:", error instanceof Error ? error.message : error);
    throw error;
  }
}
