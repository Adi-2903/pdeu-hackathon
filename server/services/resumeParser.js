const pdfParse = require('pdf-parse');

async function parseResume(buffer) {
  try {
    const data = await pdfParse(buffer);
    const text = data.text;
    
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      console.warn('GROQ_API_KEY not found, falling back to basic parsing');
      return basicParse(text);
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a professional resume parser. Extract structured data from the provided resume text and return it as a JSON object. 
Fields to extract:
{
  "name": "Full Name",
  "email": "Email Address",
  "phone": "Phone Number",
  "location": "City, State",
  "currentRole": "Most recent job title",
  "company": "Most recent company",
  "experience": ["Company 1: Role (Years)", "Company 2: Role (Years)"],
  "education": ["Degree from University"],
  "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"]
}
Return ONLY the raw JSON object, no markdown formatting.`
          },
          {
            role: 'user',
            content: text.substring(0, 10000)
          }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const result = await response.json();
    return JSON.parse(result.choices[0].message.content);

  } catch (err) {
    console.error('Error parsing PDF with AI:', err);
    // Fallback to basic parsing
    return basicParse(""); 
  }
}

function basicParse(text) {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
  
  return {
    name: lines[0] || 'Unknown Candidate',
    email: emailMatch ? emailMatch[1] : 'unknown@example.com',
    phone: '(555) 000-0000',
    location: 'Remote',
    currentRole: 'Software Engineer',
    company: 'Tech Corp',
    experience: [],
    education: [],
    skills: ['JavaScript', 'React', 'Node.js']
  };
}

module.exports = { parseResume };
