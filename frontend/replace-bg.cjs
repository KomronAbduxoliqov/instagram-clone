const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      // Match bg-white surrounded by whitespace, quotes, or backticks
      const regex = /(?<=['"\s`])bg-white(?=['"\s`])/g;
      if (regex.test(content)) {
        content = content.replace(regex, 'bg-ig-card');
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

replaceInDir(path.join(__dirname, 'src'));
console.log('Done replacing bg-white with bg-ig-card');
