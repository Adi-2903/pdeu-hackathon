-- Add deduplication specific fields to candidates table
-- This aligns the schema with the Project Brief requirements

ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS sources TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS dedup_confidence INTEGER;

-- Migrate existing 'source' to 'sources' array for any existing records
UPDATE candidates 
SET sources = ARRAY[source::text] 
WHERE sources = '{}' OR sources IS NULL;

-- Create index on sources for better querying
CREATE INDEX IF NOT EXISTS candidates_sources_idx ON candidates USING GIN(sources);
