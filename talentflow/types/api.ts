import { Database } from "./database";

export type CandidateRow = Database["public"]["Tables"]["candidates"]["Row"];
export type ApplicationRow = Database["public"]["Tables"]["applications"]["Row"];
export type JobRow = Database["public"]["Tables"]["jobs"]["Row"];

export type CandidateSource = Database["public"]["Enums"]["candidate_source"];
export type ApplicationStatus = Database["public"]["Enums"]["application_status"];
export type JobStatus = Database["public"]["Enums"]["job_status"];

export interface CandidateSearchResult {
  candidate: {
    id: string;
    full_name: string;
    email: string;
    headline: string;
    skills: string[];
    experience_years: number;
    source: CandidateSource;
  };
  similarity: number;
}

export interface Experience {
  company: string;
  title: string;
  duration?: string;
  description?: string;
}

export interface Education {
  institution: string;
  degree: string;
  year?: string;
}
