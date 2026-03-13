-- Simpler match_candidates function for Phase 7
CREATE OR REPLACE FUNCTION match_candidates(query_embedding vector, match_count int)
RETURNS TABLE(candidate_id uuid, similarity float)
LANGUAGE sql AS $$
  SELECT candidate_id, 1 - (embedding <=> query_embedding) AS similarity
  FROM candidate_embeddings
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
