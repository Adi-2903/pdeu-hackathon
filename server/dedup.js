const { getExtractor } = require('./utils/vector-engine');

/**
 * Normalizes phone numbers to standard 10-digit format.
 */
function normalizePhone(phone) {
  if (!phone) return null;
  return phone.replace(/\D/g, '').replace(/^91/, '').slice(-10);
}

/**
 * Generates an embedding for the given text using the shared pipeline.
 */
async function getEmbedding(text) {
  const extractor = await getExtractor();
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

/**
 * Calculates cosine similarity between two vectors.
 */
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Builds a single string for embedding from candidate data.
 */
function buildCandidateText(c) {
  return [
    c.name || c.full_name || '',
    c.email || '',
    c.phone || '',
    c.location || '',
    Array.isArray(c.skills) ? c.skills.join(' ') : '',
    Array.isArray(c.companies) ? c.companies.join(' ') : '',
  ].join(' ').toLowerCase().trim();
}

/**
 * Main deduplication logic. Returns { action, matchedId, score, reason }.
 */
async function runDedup(newCand, allCandidates) {
  // STAGE 0 — exact email or normalized phone
  const normNew = normalizePhone(newCand.phone);
  for (const existing of allCandidates) {
    const emailMatch = existing.email && newCand.email && existing.email.toLowerCase() === newCand.email.toLowerCase();
    const phoneMatch = normNew && existing.phone && normalizePhone(existing.phone) === normNew;
    
    if (emailMatch || phoneMatch) {
      return { 
        action: 'merge', 
        matchedId: existing.id, 
        score: 1.0, 
        reason: emailMatch ? 'exact_email' : 'exact_phone' 
      };
    }
  }

  // STAGE 1 — vector similarity
  const newText = buildCandidateText(newCand);
  const newEmb = await getEmbedding(newText);

  let bestScore = 0;
  let bestMatch = null;

  for (const existing of allCandidates) {
    // Check if existing candidate has embedding (in data.json or indexed separately)
    // In our system, embeddings are often in a separate 'candidate_embeddings' table/array
    // But for runDedup, we expect them to be accessible. 
    // If they aren't on the candidate object, we might need to look them up.
    // The prompt implies checking 'existing.embedding'.
    if (!existing.embedding) continue; 
    
    const score = cosineSimilarity(newEmb, existing.embedding);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = existing;
    }
  }

  if (bestScore > 0.85) {
    return { action: 'merge', matchedId: bestMatch.id, score: bestScore, reason: 'vector_high' };
  }
  if (bestScore > 0.70) {
    return { action: 'review', matchedId: bestMatch.id, score: bestScore, reason: 'vector_medium' };
  }
  
  return { action: 'create', matchedId: null, score: bestScore, reason: 'no_match' };
}

/**
 * Merges data from a new candidate into an existing record.
 */
function mergeCandidates(existing, newCand, score, reason) {
  // Union sources
  const existingSources = existing.sources || (existing.source ? [existing.source] : []);
  const newSources = newCand.sources || (newCand.source ? [newCand.source] : []);
  existing.sources = [...new Set([...existingSources, ...newSources])];
  
  // Union skills
  const existingSkills = Array.isArray(existing.skills) ? existing.skills : [];
  const newSkills = Array.isArray(newCand.skills) ? newCand.skills : [];
  existing.skills = [...new Set([...existingSkills, ...newSkills])];
  
  // Fill missing fields
  existing.phone = existing.phone || newCand.phone;
  existing.location = existing.location || newCand.location;
  existing.summary = existing.summary || newCand.summary;
  
  // Keep most complete resume text
  if ((newCand.resume_text || '').length > (existing.resume_text || '').length) {
    existing.resume_text = newCand.resume_text;
  }
  if ((newCand.resumeText || '').length > (existing.resumeText || '').length) {
    existing.resume_text = newCand.resumeText;
  }
  
  // Append to merge history
  existing.mergeHistory = existing.mergeHistory || [];
  existing.mergeHistory.push({
    timestamp: new Date().toISOString(),
    fromSource: newSources[0] || 'unknown',
    similarityScore: score,
    reason,
    action: 'auto_merged',
    mergedName: newCand.name || newCand.full_name,
    mergedEmail: newCand.email,
  });
  
  return existing;
}

module.exports = { 
  runDedup, 
  mergeCandidates, 
  buildCandidateText, 
  getEmbedding, 
  normalizePhone 
};
