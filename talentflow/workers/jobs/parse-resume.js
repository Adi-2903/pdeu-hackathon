const { createClient } = require('@supabase/supabase-js');
const Anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');
const { checkAndMerge } = require('../lib/dedup');

/**
 * Bull job handler for 'parse_resume'
 * Receives: { text, file_url }
 */
async function handleParseResume(job, { supabase, anthropic }) {
  const { text, file_url } = job.data;

  console.log(`[Worker] Started parsing resume: ${file_url}`);

  const model = "claude-sonnet-4-20250514";
  const systemPrompt = "You are a resume parser. Return ONLY valid JSON, no markdown, no preamble. Fields: name (string), email (string), phone (string), skills (string[]), experience_years (number), education ({degree,institution,year}[]), location (string), companies (string[])";

  try {
    // 1. Parse via Claude
    const response = await anthropic.messages.create({
      model: model,
      max_tokens: 2000,
      temperature: 0.1,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Parse this resume text:\n\n${text}`,
        },
      ],
    });

    const content = response.content[0].text;
    const cleanJson = content.replace(/```json\n?|```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    console.log(`[Worker] Parsed candidate: ${parsed.name}`);

    // 2. Deduplication Check
    const dedupResult = await checkAndMerge({
      ...parsed,
      source: 'resume_upload',
      resume_url: file_url,
      raw_text: text
    }, { supabase });

    let candidateId = dedupResult.existingId;

    if (dedupResult.action === 'create') {
      // 3. Save New Candidate to Supabase
      const { data: newCandidate, error: candidateError } = await supabase
        .from('candidates')
        .insert({
          full_name: parsed.name,
          email: parsed.email || `unknown-${Date.now()}@example.com`,
          phone: parsed.phone,
          location: parsed.location,
          skills: parsed.skills || [],
          experience_years: parsed.experience_years || 0,
          education: parsed.education || [],
          work_history: (parsed.companies || []).map(c => ({ company: c })),
          raw_resume_text: text,
          resume_url: file_url,
          source: 'resume_upload',
          sources: ['resume_upload']
        })
        .select()
        .single();

      if (candidateError) {
        throw new Error(`Supabase insert failed: ${candidateError.message}`);
      }
      candidateId = newCandidate.id;
      console.log(`[Worker] Created new candidate: ${candidateId}`);
    } else {
      console.log(`[Worker] Result of dedup: ${dedupResult.action} for ${candidateId}`);
    }

    // 4. Generate/Update Embedding
    // Always generate embedding for the combined text if it's a new or merged candidate
    const embeddingText = `${parsed.name} | ${parsed.location} | Skills: ${(parsed.skills || []).join(', ')} | Exp: ${parsed.experience_years}y`;
    
    try {
      const openaiKey = process.env.OPENAI_API_KEY;
      if (openaiKey && candidateId) {
        const embResponse = await axios.post('https://api.openai.com/v1/embeddings', {
          model: 'text-embedding-3-small',
          input: embeddingText.replace(/\n/g, " ").trim()
        }, {
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json'
          }
        });

        const embedding = embResponse.data.data[0].embedding;

        // Upsert embedding
        const { error: embError } = await supabase
          .from('candidate_embeddings')
          .upsert({
            candidate_id: candidateId,
            embedding: embedding,
            embedding_text: embeddingText,
            model: 'text-embedding-3-small'
          }, { onConflict: 'candidate_id' });

        if (embError) {
          console.error(`[Worker] Embedding save error: ${embError.message}`);
        }
      }
    } catch (embErr) {
      console.error(`[Worker] Embedding generation failed: ${embErr.message}`);
    }

    return { success: true, candidateId, action: dedupResult.action };
  } catch (error) {
    console.error(`[Worker] Job error: ${error.message}`);
    throw error;
  }
}

module.exports = handleParseResume;
