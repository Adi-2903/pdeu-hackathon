const express = require('express');
const router = express.Router();
const { Anthropic } = require('@anthropic-ai/sdk');
const { getDb } = require('../database');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key',
});

function buildLiveCandidateContext(db) {
  const candidates = db.data.candidates || [];
  if (!candidates.length) return 'No candidates in database yet.';

  const top = [...candidates]
    .sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0))
    .slice(0, 10);

  const lines = top.map((c) => {
    const skills = (db.data.candidate_skills || [])
      .filter(s => s.candidate_id === c.id)
      .map(s => s.skill_name)
      .slice(0, 4)
      .join(', ');
    const ghostFlag = c.ghost_status ? ' [GHOST_RISK]' : '';
    const poolFlag = c.in_passive_pool ? ' [PASSIVE_POOL]' : '';
    return `- ${c.full_name}: ${c.current_role || 'Role N/A'} at ${c.current_company || 'Unknown'}, ${c.years_of_experience || 0} yrs exp, Score: ${c.overall_score || '?'}%, Skills: ${skills || 'None listed'}${ghostFlag}${poolFlag}`;
  });

  const ghostCount = candidates.filter(c => c.ghost_status).length;
  const passiveCount = (db.data.passive_pool || []).length;
  const activeJobs = (db.data.jobs || []).filter(j => j.status === 'Active').length;

  return `Pipeline Summary:
- Total Candidates: ${candidates.length}
- Active Jobs: ${activeJobs}
- Ghost Risks: ${ghostCount}
- Passive Pool: ${passiveCount}

Top Candidates by AI Score:
${lines.join('\n')}`;
}

router.post('/', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    // Load live context from DB
    const db = getDb();
    const candidatesContext = buildLiveCandidateContext(db);

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here' || process.env.ANTHROPIC_API_KEY === 'dummy_key') {
       // Context-aware mock response using live DB data
       let contextIntro = '';
       if (context && context.path) {
         if (context.path.includes('/candidates')) {
           contextIntro = '**[Candidate Database View]** ';
         } else if (context.path === '/' || context.path.includes('/dashboard')) {
           contextIntro = '**[Dashboard Overview]** ';
         } else if (context.path.includes('/pipeline')) {
           contextIntro = '**[Pipeline Board View]** ';
         }
       }

       const lowerMsg = message.toLowerCase();
       let smartReply = '';

       // Generate context-specific responses using live DB data
       const db2 = getDb();
       const candidates = db2.data.candidates || [];
       const topCand = [...candidates].sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0)).slice(0, 3);
       const ghosts = candidates.filter(c => c.ghost_status);

       if (lowerMsg.includes('ghost') || lowerMsg.includes('unresponsive')) {
         smartReply = ghosts.length > 0
           ? `I found **${ghosts.length} ghost candidates** in your pipeline — candidates who have gone unresponsive. \n\nTop ghost risk: **${ghosts[0].full_name}** (${ghosts[0].current_role}). I recommend sending a personalized re-engagement email to each of them.`
           : `Good news — no ghost candidates detected in your pipeline right now. All active candidates have recent activity. 🎉`;
       } else if (lowerMsg.includes('top') || lowerMsg.includes('best') || lowerMsg.includes('recommend') || lowerMsg.includes('who')) {
         if (topCand.length > 0) {
           const names = topCand.map(c => `**${c.full_name}** (${c.overall_score || 0}% match, ${c.current_role})`).join(', ');
           smartReply = `Your top AI-matched candidates right now are: ${names}. They score highest on skills overlap, experience depth, and culture fit signals.`;
         } else {
           smartReply = `No candidates in the database yet. Upload some resumes to get AI-powered match rankings!`;
         }
       } else if (lowerMsg.includes('hire by friday') || lowerMsg.includes('fast') || lowerMsg.includes('urgent')) {
         smartReply = `For a fast hire, I suggest focusing on candidates already in the **Interview or Offer** stages. Check the **Hire by Friday** mode on the Dashboard — it'll generate a prioritized action plan based on your target date and pipeline status.`;
       } else if (lowerMsg.includes('passive') || lowerMsg.includes('pool')) {
         const poolCount = (db2.data.passive_pool || []).length;
         smartReply = poolCount > 0
           ? `Your Passive Talent Pool has **${poolCount} candidates** who were previously rejected but match our role profiles. You can re-activate any of them from the Pipeline page. They're often the fastest hires!`
           : `Your Passive Talent Pool is currently empty. When you reject candidates in the Pipeline, you'll have the option to add them to the pool for future role matching.`;
       } else if (lowerMsg.includes('email') || lowerMsg.includes('draft') || lowerMsg.includes('message')) {
         const cand = topCand[0];
         const targetName = cand ? cand.full_name.split(' ')[0] : 'Candidate';
         const targetRole = cand ? cand.current_role : 'the role';
         smartReply = `Here's a draft outreach email:\n\n---\nHi ${targetName},\n\nWe were impressed by your background in **${targetRole}** and would love to discuss an exciting opportunity. Are you open to a quick 30-minute call this week?\n\nLooking forward to hearing from you!\n\nBest,\nThe Talent Team\n---\n\nFeel free to personalize before sending!`;
       } else {
         const totalCands = candidates.length;
         const activeJobs = (db2.data.jobs || []).filter(j => j.status === 'Active').length;
         smartReply = `${contextIntro}I have access to **${totalCands} candidates** across **${activeJobs} active jobs**. Ask me to:\n• Find top matches for a role\n• Identify ghost candidates\n• Draft outreach emails\n• Summarize pipeline health\n• Recommend next actions\n\nReceived your query: "${message}"`;
       }

       return res.json({ 
         reply: smartReply || `${contextIntro}${message}. *(Mock mode — add ANTHROPIC_API_KEY for full AI responses.)*` 
       });
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      system: `You are TalentOS AI, an intelligent recruitment assistant. Be concise, professional, and data-driven. 
Always reference actual candidate data from the context below.

${candidatesContext}

For email drafts, write the full email. For analysis, cite specific names and scores. For recommendations, be actionable and specific.`,
      max_tokens: 600,
      messages: [{ role: 'user', content: message }]
    });

    res.json({ reply: response.content[0].text });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process AI chat message' });
  }
});

module.exports = router;
