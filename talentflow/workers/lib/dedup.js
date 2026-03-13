const { checkDuplicateWithAI } = require("./ai/dedup-checker");

/**
 * Deduplication Engine: Orchestrates merging or flagging records.
 */
async function checkAndMerge(newCandidate, { supabase }) {
  const email = newCandidate.email;
  const name = newCandidate.name;

  // Step 1: Check by email (case-insensitive)
  if (email) {
    const { data: emailMatch, error: emailError } = await supabase
      .from('candidates')
      .select('*')
      .ilike('email', email)
      .eq('is_duplicate', false)
      .limit(1)
      .maybeSingle();

    if (emailMatch) {
      console.log(`[Dedup] Exact email match found: ${emailMatch.id}`);
      const mergedId = await performMerge(emailMatch, newCandidate, supabase);
      return { action: 'merge', existingId: mergedId };
    }
  }

  // Step 2: Check by name (fuzzy)
  if (name) {
    const { data: nameMatches } = await supabase
      .from('candidates')
      .select('*')
      .ilike('full_name', `%${name}%`) 
      .eq('is_duplicate', false)
      .limit(5);

    if (nameMatches && nameMatches.length > 0) {
      // Step 3: Name match(es) found → Call Claude dedup-checker
      for (const existing of nameMatches) {
        const aiResult = await checkDuplicateWithAI(existing, newCandidate);
        
        if (aiResult.is_duplicate && aiResult.confidence >= 80) {
          console.log(`[Dedup] AI confirmed duplicate (confidence ${aiResult.confidence}): ${existing.id}`);
          const mergedId = await performMerge(existing, newCandidate, supabase);
          return { action: 'merge', existingId: mergedId };
        }
        
        if (aiResult.confidence >= 50 && aiResult.confidence < 80) {
          console.log(`[Dedup] AI suggests potential duplicate (confidence ${aiResult.confidence}): ${existing.id}`);
          await flagForReview(existing, aiResult.confidence, supabase);
          return { action: 'review', existingId: existing.id };
        }
      }
    }
  }

  // No duplicate found
  return { action: 'create' };
}

/**
 * Merges new data into an existing record.
 */
async function performMerge(existing, incoming, supabase) {
  const sources = existing.sources || [];
  const newSource = incoming.source || 'resume_upload';
  
  const updatedSources = Array.from(new Set([...sources, newSource]));

  const mergedData = {
    full_name: existing.full_name || incoming.name,
    email: existing.email || incoming.email,
    phone: existing.phone || incoming.phone,
    location: existing.location || incoming.location,
    skills: Array.from(new Set([...(existing.skills || []), ...(incoming.skills || [])])),
    experience_years: Math.max(existing.experience_years || 0, incoming.experience_years || 0),
    education: existing.education || incoming.education,
    work_history: existing.work_history || (incoming.companies || []).map(c => ({ company: c })),
    sources: updatedSources,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('candidates')
    .update(mergedData)
    .eq('id', existing.id);

  if (error) throw error;
  return existing.id;
}

async function flagForReview(existing, confidence, supabase) {
  const { error } = await supabase
    .from('candidates')
    .update({ 
      needs_review: true,
      dedup_confidence: confidence 
    })
    .eq('id', existing.id);

  if (error) console.error(`[Dedup] Error flagging for review: ${error.message}`);
}

module.exports = { checkAndMerge };
