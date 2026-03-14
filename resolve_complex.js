const fs = require('fs');
const path = require('path');

const candidatesJsPath = path.join(__dirname, 'server', 'routes', 'candidates.js');
let apiContent = fs.readFileSync(candidatesJsPath, 'utf8');

apiContent = apiContent.replace(
/<<<<<<< HEAD\r?\n([\s\S]*?)=======\r?\n([\s\S]*?)>>>>>>> origin\/vraj/g,
(match, head, vraj) => {
  if (head.includes('ghost_status') && !vraj.includes('ghost_status')) {
      if (head.includes('// POST /candidates/bulk/action') || vraj.includes('/:id/resume')) {
          return vraj.trim() + '\n\n' + head.trim() + '\n';
      }
      return head;
  }
  return match;
}
);
fs.writeFileSync(candidatesJsPath, apiContent);

const candidatesJsxPath = path.join(__dirname, 'client', 'src', 'pages', 'Candidates.jsx');
let jsxContent = fs.readFileSync(candidatesJsxPath, 'utf8');

jsxContent = jsxContent.replace(
/<<<<<<< HEAD\r?\n([\s\S]*?)=======\r?\n([\s\S]*?)>>>>>>> origin\/vraj/g,
(match, head, vraj) => {
  if (head.includes('import ResumeUploadModal')) {
    return head;
  }
  if (head.includes('e?.stopPropagation()')) {
    return head;
  }
  if (head.includes('selectedCandidateIds') || vraj.includes('isSmartSearch')) {
    return head + '\n' + vraj;
  }
  if (vraj.includes('semantic-search') && head.includes('params.ghost')) {
    // combine
    return `
      let response;
      if (isSmartSearch && searchTerm) {
        response = await api.get('/candidates/semantic-search', {
          params: { query: searchTerm, limit: DEFAULT_PAGE_SIZE }
        });
        setCandidates(response.data.data || []);
        setTotalCandidates(response.data.data?.length || 0);
      } else {
        const params = {
          search: searchTerm || undefined,
          page: 1,
          limit: DEFAULT_PAGE_SIZE,
        };
        
        if (selectedFilter !== 'All' && selectedFilter !== '👻 Ghosts') {
          params.status = selectedFilter;
        }
        if (selectedFilter === '👻 Ghosts') {
          params.ghost = 'true';
        }

        response = await api.get('/candidates', { params });
        setCandidates(response.data.data || []);
        setTotalCandidates(response.data.pagination?.total || 0);
      }
    `;
  }
  if (head.includes('isGhost')) {
    return head + '\n' + vraj.replace(/<div className="flex justify-center items-center space-x-2 mb-8">[\s\S]*/, '');
  }
  return head + '\n' + vraj;
}
);
fs.writeFileSync(candidatesJsxPath, jsxContent);
console.log('Resolved');
