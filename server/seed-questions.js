const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.json');
const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

db.questions = [
  { id: 'q1', category: 'CS', topic: 'Data Structures', text: 'Explain the difference between a HashMap and a TreeMap. When would you use which?', rubric: '8+ for mentioning O(1) vs O(log n) and ordering requirements.' },
  { id: 'q2', category: 'CS', topic: 'Networking', text: 'Describe what happens when you type "google.com" in a browser and press enter.', rubric: 'Check for DNS, TCP/TLS handshake, HTTP lifecycle.' },
  { id: 'q3', category: 'CS', topic: 'Backend', text: 'How do you prevent SQL injection in a production application?', rubric: 'Look for Parameterized queries/ORMs, input validation.' },
  { id: 'q4', category: 'Electrical', topic: 'Circuits', text: 'What is Kirchoff\'s Current Law and how is it used in nodal analysis?', rubric: 'Sum of currents entering node = 0.' },
  { id: 'q5', category: 'Electrical', topic: 'AC Machines', text: 'Difference between synchronous and induction motors?', rubric: 'Slip, constant speed vs variable speed under load.' },
  { id: 'q6', category: 'Behavioral', topic: 'Integrity', text: 'Tell me about a time you made a mistake at work. How did you fix it?', rubric: 'Look for accountability and learning, not blame-shifting.' },
  { id: 'q7', category: 'Behavioral', topic: 'Leadership', text: 'How do you handle a team member who is not pulling their weight?', rubric: 'Check for empathy combined with performance-focused feedback.' },
  { id: 'q8', category: 'Logic', topic: 'Puzzles', text: 'You have two ropes. Each takes exactly 60 mins to burn. How do you measure 45 mins?', rubric: 'Light rope A at both ends, B at one end. When A finishes (30m), light other end of B.' }
];

fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
console.log('Seeded 8 specialized questions into database.');
