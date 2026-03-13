// Reusable Supabase query helpers — import in API routes and Server Components

import { createClient } from "./server";
import type { CandidateSearchResult } from "@/types/api";

// ──────────────────────────────────────────────
// Candidates
// ──────────────────────────────────────────────
export async function getCandidates(options?: {
  page?: number;
  pageSize?: number;
  source?: string;
}) {
  const client = await createClient();
  const { page = 1, pageSize = 25, source } = options ?? {};
  const from = (page - 1) * pageSize;

  let query = client
    .from("candidates")
    .select("*", { count: "exact" })
    .eq("is_duplicate", false)
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (source) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query = query.eq("source", source as any);
  }

  return query;
}

export async function getCandidateById(id: string) {
  const client = await createClient();
  return client.from("candidates").select("*").eq("id", id).single();
}

// ──────────────────────────────────────────────
// Semantic search via pgvector RPC
// ──────────────────────────────────────────────
export async function searchCandidatesByEmbedding(
  queryEmbedding: number[],
  options?: { threshold?: number; limit?: number }
): Promise<CandidateSearchResult[]> {
  const client = await createClient();
  const { threshold = 0.7, limit = 20 } = options ?? {};

  const { data, error } = await client.rpc("match_candidates", {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: limit,
  });

  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    candidate: row,
    similarity: row.similarity as number,
  }));
}

// ──────────────────────────────────────────────
// Jobs
// ──────────────────────────────────────────────
export async function getJobs(options?: { status?: string; page?: number }) {
  const client = await createClient();
  const { page = 1, status } = options ?? {};
  const pageSize = 20;
  const from = (page - 1) * pageSize;

  let query = client
    .from("jobs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (status) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query = query.eq("status", status as any);
  }

  return query;
}

// ──────────────────────────────────────────────
// Shortlists
// ──────────────────────────────────────────────
export async function getShortlistsByJob(jobId: string) {
  const client = await createClient();
  return client
    .from("shortlists")
    .select("*, candidates(*)")
    .eq("job_id", jobId)
    .order("score", { ascending: false });
}

// ──────────────────────────────────────────────
// Ingestion logs
// ──────────────────────────────────────────────
export async function getIngestionLogs(limit = 50) {
  const client = await createClient();
  return client
    .from("ingestion_logs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit);
}
