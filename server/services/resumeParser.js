const pdfParse = require('pdf-parse');

async function parseResume(buffer) {
  try {
    const data = await pdfParse(buffer);
    const text = data.text;
    
    // Detailed parsing could be done here with Claude, 
    // but for now, we'll return a mocked parsed object based on text length/contents.
    
    // We can do some rudimentary parsing just to make it interesting
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    let name = 'Unknown Candidate';
    if (lines.length > 0) {
      name = lines[0]; // Usually the name is at the top
    }
    
    const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    const email = emailMatch ? emailMatch[1] : 'unknown@example.com';
    
    const phoneMatch = text.match(/(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : '(555) 123-4567';
    
    return {
      name: name,
      email: email,
      phone: phone,
      location: 'San Francisco, CA', // mock
      currentRole: 'Software Engineer', // mock
      company: 'Tech Corp', // mock
      experience: [1, 2, 3], // mock 3 jobs
      education: ['BS Computer Science'],
      skills: ['React', 'Node.js', 'JavaScript', 'SQL', 'Git', 'AWS']
    };
  } catch (err) {
    console.error('Error parsing PDF:', err);
    throw new Error('Failed to parse PDF document');
  }
}

module.exports = { parseResume };
