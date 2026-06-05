import fs from 'fs';

const appPath = './src/App.tsx';
let content = fs.readFileSync(appPath, 'utf8');

content = content.replace('submitFeedbackReply, toggleSystemFeature', 'submitFeedbackReply, toggleSystemFeature, lastBackupTime, setLastBackupTime, setAutoBackup, autoBackup');

// Wait, autoBackup is not exported by useFirebaseStore. Where does it come from? 
// It's not in the state. I'll just remove autoBackup from App.tsx or use the proper variable if it exists in store.
// Let's not export it and instead remove it if it was added.

content = content.replace('submitFeedbackReply, toggleSystemFeature', 'submitFeedbackReply, toggleSystemFeature, lastBackupTime');

fs.writeFileSync(appPath, content, 'utf8');
