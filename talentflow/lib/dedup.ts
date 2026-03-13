import { createClient } from "@supabase/supabase-js";
import { checkDuplicateWithAI } from "./ai/dedup-checker";

// We use the environment variables directly to avoid dependency issues in worker
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export interface ParsedCandidate {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience_years: number;
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  location: string;
  companies: string[];
  source?: string;
  resume_url?: string;
  raw_text?: string;
}

export type DedupAction = 'create' | 'merge' | 'review';

export interface DedupResponse {
  action: DedupAction;
  existingId?: string;
}

/**
 * Deduplication Engine: Orchestrates merging or flagging records.
 */
export async function checkAndMerge(newCandidate: ParsedCandidate): Promise<DedupResponse> {
  const email = newCandidate.email;
  const name = newCandidate.name;
  if (email) {
    const { data: emailMatch } = await supabase
      .from('candidates')
      .select('*')
      .ilike('email', email)
      .eq('is_duplicate', false)
      .limit(1)
      .maybeSingle();

    if (emailMatch) {
      console.log(`[Dedup] Exact email match found: ${emailMatch.id}`);
      await performMerge(emailMatch, newCandidate);
      return { action: 'merge', existingId: emailMatch.id };
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
        const aiResult = await checkDuplicateWithAI(
          existing as Record<string, unknown>, 
          newCandidate as unknown as Record<string, unknown>
        );
        
        if (aiResult.is_duplicate && aiResult.confidence >= 80) {
          console.log(`[Dedup] AI confirmed duplicate (confidence ${aiResult.confidence}): ${existing.id}`);
          await performMerge(existing, newCandidate);
          return { action: 'merge', existingId: existing.id };
        }
        
        if (aiResult.confidence >= 50 && aiResult.confidence < 80) {
          console.log(`[Dedup] AI suggests potential duplicate (confidence ${aiResult.confidence}): ${existing.id}`);
          await flagForReview(existing, aiResult.confidence);
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
 * Keeps most complete fields and appends to sources list.
 */
async function performMerge(existing: Record<string, unknown>, incoming: ParsedCandidate) {
  const sources = (existing.sources as string[]) || [];
  const newSource = incoming.source || 'resume_upload';
  
  const updatedSources = Array.from(new Set([...sources, newSource]));

  const mergedData = {
    full_name: (existing.full_name as string) || incoming.name,
    email: (existing.email as string) || incoming.email,
    phone: (existing.phone as string) || incoming.phone,
    location: (existing.location as string) || incoming.location,
    skills: Array.from(new Set([...((existing.skills as string[]) || []), ...(incoming.skills || [])])),
    experience_years: Math.max((existing.experience_years as number) || 0, incoming.experience_years || 0),
    education: existing.education || incoming.education,
    work_history: existing.work_history || (incoming.companies || []).map(c => ({ company: c })),
    sources: updatedSources,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('candidates')
    .update(mergedData)
    .eq('id', existing.id as string);

  if (error) throw error;
}

async function flagForReview(existing: Record<string, unknown>, confidence: number) {
  const { error } = await supabase
    .from('candidates')
    .update({ 
      needs_review: true,
      dedup_confidence: confidence 
    })
    .eq('id', existing.id as string);

  if (error) console.error(`[Dedup] Error flagging for review: ${error.message}`);
}
