import fs from 'fs';
import path from 'path';

const screensDir = path.join(process.cwd(), 'src/components/screens');
const files = fs.readdirSync(screensDir);

for (const file of files) {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(screensDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    content = content.replace(/\\n/g, '\n');
    fs.writeFileSync(filePath, content);
  }
}
