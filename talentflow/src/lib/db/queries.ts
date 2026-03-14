import { createClient } from "@/frontend/lib/db/server";

export async function getStats() {
  const supabase = await createClient();
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [total, newThisWeek, pendingReview, activeJobs] = await Promise.all([
    supabase
      .from("candidates")
      .select("*", { count: "exact", head: true })
      .eq("is_duplicate", false),
    supabase
      .from("candidates")
      .select("*", { count: "exact", head: true })
      .gte("created_at", oneWeekAgo),
    supabase
      .from("candidates")
      .select("*", { count: "exact", head: true })
      .eq("needs_review", true),
    supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "open"),
  ]);

  return {
    total: total.count ?? 0,
    newThisWeek: newThisWeek.count ?? 0,
    pendingReview: pendingReview.count ?? 0,
    activeJobs: activeJobs.count ?? 0,
  };
}

export async function getCandidates({
  source,
  page = 0,
}: { source?: string; page?: number } = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("candidates")
    .select(
      "id, full_name, email, sources, needs_review, created_at, location, experience_years, skills"
    )
    .order("created_at", { ascending: false })
    .range(page * 20, page * 20 + 19);

  if (source && source !== "all") {
    query = query.contains("sources", [source]);
  }

  return query;
}

export async function getCandidateById(id: string) {
  const supabase = await createClient();
  const [candidate, applications] = await Promise.all([
    supabase.from("candidates").select("*").eq("id", id).single(),
    supabase
      .from("applications")
      .select("*, jobs(title, description)")
      .eq("candidate_id", id),
  ]);

  return { candidate: candidate.data, applications: applications.data ?? [] };
}

export async function getJobs() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jobs")
    .select("id, title, status")
    .eq("status", "open");
  return data ?? [];
}

export async function getIngestionLogs() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ingestion_logs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(10);
  return data ?? [];
}

export async function getSourceCounts() {
  const supabase = await createClient();
  const { data } = await supabase.from("candidates").select("sources");
  if (!data) return [];

  const counts: Record<string, number> = {};
  data.forEach((row) => {
    (row.sources as string[] | null)?.forEach((s) => {
      counts[s] = (counts[s] ?? 0) + 1;
    });
  });

  return Object.entries(counts).map(([source, count]) => ({ source, count }));
}

export async function getShortlistByJob(jobId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("shortlists")
    .select("*, candidates(id, full_name, skills, location, sources)")
    .eq("job_id", jobId)
    .order("score", { ascending: false });
  return data ?? [];
}

export async function getApplicationCountByJob() {
  const supabase = await createClient();
  const { data } = await supabase.from("applications").select("job_id");
  if (!data) return {};

  return data.reduce((acc: Record<string, number>, row: any) => {
    acc[row.job_id] = (acc[row.job_id] ?? 0) + 1;
    return acc;
  }, {});
}

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
    query_embedding: JSON.stringify(queryEmbedding),
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

// ──────────────────────────────────────────────

export async function getStats() {
  const client = await createClient();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [total, newThisWeek, pendingReview, activeJobs] = await Promise.all([
    client.from('candidates').select('*', { count: 'exact', head: true }),
    client.from('candidates').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
    client.from('candidates').select('*', { count: 'exact', head: true }).eq('needs_review', true),
    client.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'open' as any)
  ]);

  return {
    total: total.count || 0,
    newThisWeek: newThisWeek.count || 0,
    pendingReview: pendingReview.count || 0,
    activeJobs: activeJobs.count || 0,
  };
}

