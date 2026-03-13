-- ============================================================
-- TalentFlow — Supabase Migration
-- Migration: 001_initial_schema
-- Description: Create all 7 tables with pgvector extension
-- ============================================================

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────
-- ENUMS
-- ──────────────────────────────────────────────
CREATE TYPE candidate_source AS ENUM (
  'gmail',
  'indeed',
  'merge_ats',
  'resume_upload',
  'linkedin'
);

CREATE TYPE application_status AS ENUM (
  'new',
  'reviewing',
  'shortlisted',
  'interviewing',
  'offered',
  'hired',
  'rejected'
);

CREATE TYPE ingestion_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed'
);

CREATE TYPE job_status AS ENUM (
  'draft',
  'open',
  'closed',
  'archived'
);

-- ──────────────────────────────────────────────
-- TABLE 1: candidates
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidates (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email                 TEXT NOT NULL,
  full_name             TEXT NOT NULL,
  phone                 TEXT,
  location              TEXT,
  headline              TEXT,
  summary               TEXT,
  skills                TEXT[]        NOT NULL DEFAULT '{}',
  experience_years      INTEGER,
  education             JSONB,
  work_history          JSONB,
  raw_resume_text       TEXT,
  resume_url            TEXT,
  linkedin_url          TEXT,
  source                candidate_source NOT NULL,
  source_id             TEXT,             -- external ID from originating system
  dedup_hash            TEXT,             -- fingerprint for deduplication
  is_duplicate          BOOLEAN       NOT NULL DEFAULT FALSE,
  duplicate_of          UUID          REFERENCES candidates(id) ON DELETE SET NULL,
  ai_score              NUMERIC(4,2),     -- 0.00–100.00
  ai_score_breakdown    JSONB,
  parsed_at             TIMESTAMPTZ,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Unique constraint: one canonical record per email (non-duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS candidates_email_unique
  ON candidates(email)
  WHERE is_duplicate = FALSE;

CREATE INDEX IF NOT EXISTS candidates_source_idx       ON candidates(source);
CREATE INDEX IF NOT EXISTS candidates_dedup_hash_idx   ON candidates(dedup_hash);
CREATE INDEX IF NOT EXISTS candidates_skills_gin_idx   ON candidates USING GIN(skills);
CREATE INDEX IF NOT EXISTS candidates_created_at_idx   ON candidates(created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER candidates_updated_at
  BEFORE UPDATE ON candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────
-- TABLE 2: candidate_embeddings
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidate_embeddings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id  UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  embedding     VECTOR(1536) NOT NULL,   -- pgvector: text-embedding-3-small dimensions
  embedding_text TEXT,                   -- the text that was embedded
  model         TEXT NOT NULL DEFAULT 'text-embedding-3-small',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(candidate_id)                   -- one embedding per candidate
);

-- IVFFlat index for approximate nearest-neighbor search
-- Requires at least 100 rows before becoming effective; HNSW preferred for <1M rows
CREATE INDEX IF NOT EXISTS candidate_embeddings_hnsw_idx
  ON candidate_embeddings USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ──────────────────────────────────────────────
-- TABLE 3: sources
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sources (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                  TEXT NOT NULL,
  type                  candidate_source NOT NULL,
  config                JSONB NOT NULL DEFAULT '{}',   -- encrypted credentials (never raw keys!)
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  last_synced_at        TIMESTAMPTZ,
  candidates_imported   INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER sources_updated_at
  BEFORE UPDATE ON sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Default sources seed
INSERT INTO sources (name, type, is_active) VALUES
  ('Gmail', 'gmail', FALSE),
  ('Indeed', 'indeed', FALSE),
  ('Merge ATS (Greenhouse + Zoho)', 'merge_ats', FALSE),
  ('Resume Upload', 'resume_upload', TRUE),
  ('LinkedIn (Simulated)', 'linkedin', FALSE)
ON CONFLICT DO NOTHING;

-- ──────────────────────────────────────────────
-- TABLE 4: jobs
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  department      TEXT,
  location        TEXT,
  remote          BOOLEAN NOT NULL DEFAULT FALSE,
  description     TEXT NOT NULL,
  requirements    TEXT[] NOT NULL DEFAULT '{}',
  salary_min      INTEGER,
  salary_max      INTEGER,
  status          job_status NOT NULL DEFAULT 'open',
  recruiter_id    UUID,               -- future: references auth.users
  external_id     TEXT,               -- ID in external ATS
  external_source TEXT,               -- e.g. 'greenhouse', 'zoho'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS jobs_status_idx ON jobs(status);
CREATE INDEX IF NOT EXISTS jobs_created_at_idx ON jobs(created_at DESC);

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────
-- TABLE 5: applications
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id      UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  job_id            UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status            application_status NOT NULL DEFAULT 'new',
  ai_score          NUMERIC(4,2),
  ai_notes          TEXT,
  recruiter_notes   TEXT,
  applied_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(candidate_id, job_id)
);

CREATE INDEX IF NOT EXISTS applications_job_id_idx       ON applications(job_id);
CREATE INDEX IF NOT EXISTS applications_candidate_id_idx ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS applications_status_idx       ON applications(status);

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────
-- TABLE 6: shortlists
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shortlists (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id            UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id      UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  score             NUMERIC(4,2),
  rank              INTEGER,
  notes             TEXT,
  shortlisted_by    UUID,             -- future: references auth.users
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);

CREATE INDEX IF NOT EXISTS shortlists_job_id_idx ON shortlists(job_id);

-- ──────────────────────────────────────────────
-- TABLE 7: ingestion_logs
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ingestion_logs (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source            candidate_source NOT NULL,
  status            ingestion_status NOT NULL DEFAULT 'pending',
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at       TIMESTAMPTZ,
  total_fetched     INTEGER NOT NULL DEFAULT 0,
  total_inserted    INTEGER NOT NULL DEFAULT 0,
  total_duplicates  INTEGER NOT NULL DEFAULT 0,
  total_failed      INTEGER NOT NULL DEFAULT 0,
  error_message     TEXT,
  metadata          JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ingestion_logs_source_idx ON ingestion_logs(source);
CREATE INDEX IF NOT EXISTS ingestion_logs_status_idx ON ingestion_logs(status);
CREATE INDEX IF NOT EXISTS ingestion_logs_started_at ON ingestion_logs(started_at DESC);

-- ──────────────────────────────────────────────
-- FUNCTION: Semantic candidate search via pgvector
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION match_candidates(
  query_embedding   VECTOR(1536),
  match_threshold   FLOAT  DEFAULT 0.7,
  match_count       INT    DEFAULT 20
)
RETURNS TABLE (
  id                UUID,
  email             TEXT,
  full_name         TEXT,
  headline          TEXT,
  skills            TEXT[],
  experience_years  INTEGER,
  source            candidate_source,
  ai_score          NUMERIC,
  similarity        FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.email,
    c.full_name,
    c.headline,
    c.skills,
    c.experience_years,
    c.source,
    c.ai_score,
    1 - (ce.embedding <=> query_embedding) AS similarity
  FROM candidate_embeddings ce
  JOIN candidates c ON c.id = ce.candidate_id
  WHERE
    c.is_duplicate = FALSE
    AND 1 - (ce.embedding <=> query_embedding) > match_threshold
  ORDER BY ce.embedding <=> query_embedding ASC
  LIMIT match_count;
END;
$$;

-- ──────────────────────────────────────────────
-- ROW LEVEL SECURITY (placeholder — enable per table when auth is configured)
-- ──────────────────────────────────────────────
-- ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE shortlists ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ingestion_logs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE candidate_embeddings ENABLE ROW LEVEL SECURITY;

-- Create resumes storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', false) 
ON CONFLICT (id) DO NOTHING;
