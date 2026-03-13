const express = require('express');
const router = express.Router();
const { Anthropic } = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key',
});

// Mock database context
const candidatesContext = `Available Candidates:
1. Alex Rivera - Sr Frontend Engineer - React, TypeScript (94% match)
2. Sarah Chen - Product Manager - Agile, Jira (88% match)
3. Michael Scott - Sales Director - B2B Sales (76% match)
4. Emma Watson - UX Designer - Figma (98% match)
5. David Lee - Sr Frontend - Vue, Node (91% match)`;

router.post('/', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
       // Context-aware Mock response
       let contextIntro = "";
       if (context && context.path) {
         if (context.path.includes('/candidates')) {
           contextIntro = "**[Context: Candidate Database]**\nI see you are looking at the Candidates pool. ";
         } else if (context.path.includes('/dashboard') || context.path === '/') {
           contextIntro = "**[Context: Dashboard]**\nI'm analyzing your high-level pipeline metrics. ";
         } else if (context.path.includes('/pipeline')) {
           contextIntro = "**[Context: Pipeline Board]**\nI see the current stage progressions. ";
         }
       }

       return res.json({ reply: `${contextIntro}\nI received: "${message}".\n\n*(Note: Operating in Mock mode since no API key is set. I found 3 engineers matching your query.)*` });
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      system: `You are TalentOS AI, the recruiter's intelligent assistant. \n\nContext:\n${candidatesContext}\n\nKeep answers concise, professional, and reference available candidate data. For drafts, write the email directly.`,
      max_tokens: 500,
      messages: [{ role: 'user', content: message }]
    });

    res.json({ reply: response.content[0].text });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process AI chat message' });
  }
});

module.exports = router;
