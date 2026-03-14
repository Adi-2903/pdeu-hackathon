const fs = require('fs');
['server/routes/candidates.js', 'client/src/pages/Candidates.jsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/<<<<<<< HEAD\r?\n([\s\S]*?)=======\r?\n([\s\S]*?)>>>>>>> origin\/vraj\r?\n?/g, '$1\n$2');
  fs.writeFileSync(file, content);
});
console.log('Force resolved');
