import { mockScheduleInterview } from "@/data/mock-data";

export interface ScheduleRequest {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
}

export interface ScheduleResponse {
  meet_url: string | null;
  event_id: string;
  event_link: string;
  draft_email: string;
}

/**
 * Schedules an interview via the MCP Bridge: Mock version
 */
export async function scheduleInterview(req: ScheduleRequest): Promise<ScheduleResponse> {
  // Simulate calendar API delay
  await new Promise(resolve => setTimeout(resolve, 600));

  console.log(`[Mock Calendar] Scheduling interview for ${req.candidateName}...`);
  const response = mockScheduleInterview(
    req.candidateName,
    req.candidateEmail,
    req.jobTitle
  );
  console.log(`[Mock Calendar] Interview scheduled with link: ${response.meet_url}`);
  
  return response;
}
