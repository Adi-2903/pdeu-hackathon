const fs = require('fs');
const vraj = fs.readFileSync('server/routes/candidates_vraj.js', 'utf8');
const head = fs.readFileSync('server/routes/candidates.js', 'utf8');

const regex = /\/\/\s*[─ΓöÇ]+\s*Resume Generation[\s\S]*?(?=module\.exports = router;)/;
const match = vraj.match(regex);

if (match) {
  let toAppend = match[0];
  let newHead = head.replace('module.exports = router;', toAppend + '\nmodule.exports = router;');
  
  if (!newHead.includes('puppeteer')) {
    newHead = newHead.replace("const { v4: uuidv4 } = require('uuid');", "const { v4: uuidv4 } = require('uuid');\nconst puppeteer = require('puppeteer');");
  }
  if (!newHead.includes('vectorEngine')) {
    newHead = newHead.replace("const { v4: uuidv4 } = require('uuid');", "const { v4: uuidv4 } = require('uuid');\nconst vectorEngine = require('../utils/vector-engine');");
  }
  
  fs.writeFileSync('server/routes/candidates.js', newHead);
  console.log('Server merged');
} else {
  console.log('Failed to match server block');
}

// Client
const clientVraj = fs.readFileSync('client/src/pages/Candidates_vraj.jsx', 'utf8');
let clientHead = fs.readFileSync('client/src/pages/Candidates.jsx', 'utf8');

// 1. imports
clientHead = clientHead.replace('MoreHorizontal, AlertCircle }', 'MoreHorizontal, AlertCircle, Link, Send, Paperclip, FileText }');
clientHead = clientHead.replace('import { Radar,', `import { Radar,`);

// 2. CandidateModal props
clientHead = clientHead.replace('const CandidateModal = ({ candidate, onClose, onRefresh }) => {', 'const CandidateModal = ({ candidate, onClose, onRefresh, onOpenEmail }) => {');

// 3. Actions in Modal
const vrajActions = `              <button
                onClick={() => onOpenEmail(candidate, 'outreach')}
                className="glass-panel text-gray-900 text-xs font-semibold hover:bg-white/10 py-2.5 rounded-xl transition-all flex items-center justify-center"
              >
                <Mail size={13} className="mr-1.5" /> Email
              </button>
              <button
                onClick={() => onOpenEmail(candidate, 'offer')}
                className="glass-panel text-gray-900 text-xs font-semibold hover:bg-white/10 py-2.5 rounded-xl transition-all flex items-center justify-center"
              >
                <FileText size={13} className="mr-1.5" /> Send Offer
              </button>
              <button
                onClick={() => window.open(\`/api/v1/company/offer-letter/\${candidate.id}\`, '_blank')}
                className="glass-panel text-gray-900 text-xs font-semibold hover:bg-white/10 py-2.5 rounded-xl transition-all flex items-center justify-center"
              >
                <FileText size={13} className="mr-1.5" /> Offer Letter
              </button>
              <button
                onClick={() => window.open(\`/api/v1/candidates/\${candidate.id}/resume\`, '_blank')}
                className="glass-panel text-gray-900 text-xs font-semibold hover:bg-white/10 py-2.5 rounded-xl transition-all flex items-center justify-center"
              >
                <Download size={13} className="mr-1.5" /> Resume
              </button>
            </div>`;

clientHead = clientHead.replace(
  /<div className="grid grid-cols-2 gap-3">[\s\S]*?<\/div>\s*<\/div>/,
  '<div className="grid grid-cols-2 gap-2">\n' + vrajActions + '\n          </div>'
);

// 4. Modal component
const modalRegex = /\{\/\* EMAIL MODAL \*\/\}[\s\S]*?(?=<\/div>\s*\);\s*\};)/;
const modalMatch = clientVraj.match(modalRegex);
if (modalMatch) {
  clientHead = clientHead.replace(
    '<ResumeUploadModal\n        isOpen={isUploadModalOpen}',
    modalMatch[0] + '\n\n      <ResumeUploadModal\n        isOpen={isUploadModalOpen}'
  );
}

// 5. State & Handlers
const handlersRegex = /\/\/ Email Modal State[\s\S]*?(?=useEffect\(\(\) => \{)/;
const handlersMatch = clientVraj.match(handlersRegex);
if (handlersMatch) {
  clientHead = clientHead.replace(
    '  const filters = [',
    handlersMatch[0] + '\n  const filters = ['
  );
}

// 6. onOpenEmail injection in Candidates render
clientHead = clientHead.replace(
  'onClose={() => setSelectedCandidate(null)}\n        onRefresh=',
  'onClose={() => setSelectedCandidate(null)}\n        onOpenEmail={handleOpenEmailModal}\n        onRefresh='
);

fs.writeFileSync('client/src/pages/Candidates.jsx', clientHead);
console.log('Client merged');
