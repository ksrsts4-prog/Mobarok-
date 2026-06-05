import fs from 'fs';

const appPath = './src/App.tsx';
let content = fs.readFileSync(appPath, 'utf8');

// 1. Remove autoBackup and setAutoBackup from destructuring
content = content.replace(', autoBackup, setAutoBackup', '');
content = content.replace(', lastBackupTime', '');

// 2. Remove the inline handleLogoutOtherDevices and handleDeleteAccount in App.tsx
// They should be between } and return ( <div className={cn("min-h-screen ...
// Let's use a regex that deletes up to return
const regex = /const handleLogoutOtherDevices = async \(\) => \{[\s\S]*?return \(/;
content = content.replace(regex, '  return (');

fs.writeFileSync(appPath, content, 'utf8');
console.log('App.tsx cleaned up');
