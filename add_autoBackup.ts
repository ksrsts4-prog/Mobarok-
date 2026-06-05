import fs from 'fs';

const appPath = './src/App.tsx';
let content = fs.readFileSync(appPath, 'utf8');

// Find activeTab useState and insert autoBackup
content = content.replace(
  "const [activeTab, setActiveTab] = useState",
  "const [autoBackup, setAutoBackup] = useState(false);\n  const [activeTab, setActiveTab] = useState"
);

fs.writeFileSync(appPath, content, 'utf8');
console.log('App.tsx added autoBackup');
