import fs from 'fs';

const appPath = './src/App.tsx';
let content = fs.readFileSync(appPath, 'utf8');
const lines = content.split('\n');

const fixedLines = [...lines.slice(0, 698), ...lines.slice(964)];
fs.writeFileSync(appPath, fixedLines.join('\n'), 'utf8');
console.log('App.tsx repaired.');
