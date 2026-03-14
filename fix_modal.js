const fs = require('fs');
const path = 'client/src/pages/Candidates.jsx';
let content = fs.readFileSync(path, 'utf8');
let lines = content.split(/\r?\n/);

// Update CandidateModal props
lines[46] = 'const CandidateModal = ({ candidate, onClose, onOpenEmail }) => {';

// Safety check for isGhost
lines[52] = "  const isGhost = candidate.ghost_status || ((candidate.status === 'Interviewing' || candidate.status === 'Offer') && candidate.lastActive?.includes('d') && parseInt(candidate.lastActive) >= 3);";

fs.writeFileSync(path, lines.join('\n'));
console.log('Fixed CandidateModal props and isGhost safety');
