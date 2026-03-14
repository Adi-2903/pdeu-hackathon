const fs = require('fs');
const content = fs.readFileSync('C:/Users/kapsa/OneDrive/Desktop/LAST COMMIT/server/data.json', 'utf8');
try {
  JSON.parse(content);
  console.log('JSON is valid');
} catch (e) {
  console.error(e.message);
  const match = e.message.match(/at position (\d+)/);
  if (match) {
    const pos = parseInt(match[1]);
    const lines = content.substring(0, pos).split('\n');
    const lineNum = lines.length;
    const colNum = lines[lineNum - 1].length;
    console.log(`Error at line ${lineNum}, column ${colNum}`);
    console.log('Context around error:');
    console.log(content.substring(pos - 50, pos + 50));
  }
}
