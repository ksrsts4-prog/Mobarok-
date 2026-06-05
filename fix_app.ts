import fs from 'fs';

const appPath = './src/App.tsx';
let content = fs.readFileSync(appPath, 'utf8');
const lines = content.split('\n');

const startIdx = lines.findIndex((l, i) => i > 690 && l.trim() === ') => window.removeEventListener(\'beforeinstallprompt\', handleBeforeInstallPrompt);');
const endIdx = lines.findIndex((l, i) => i > 1500 && l.trim() === 'return (' && lines[i+1].includes('<div className={cn('));

console.log('startIdx', startIdx);
console.log('endIdx', endIdx);

if (startIdx !== -1 && endIdx !== -1) {
    const fixedLines = [...lines.slice(0, startIdx), ...lines.slice(endIdx + 1)];
    fs.writeFileSync(appPath, fixedLines.join('\n'), 'utf8');
    console.log('App.tsx fixed successfully.');
} else {
    console.log('Could not find indices.');
}
