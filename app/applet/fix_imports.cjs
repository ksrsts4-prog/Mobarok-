const fs = require('fs');

function fix(file) {
  let c = fs.readFileSync(file, 'utf8');
  let ch = false;
  
  if (c.match(/await import\(['"].*?firebase['"]\)\.then\(m => m\.auth\.currentUser\?\.getIdToken\(\)\)/)) {
    c = c.replace(/await import\(['"].*?firebase['"]\)\.then\(m => m\.auth\.currentUser\?\.getIdToken\(\)\)/g, 'auth.currentUser?.getIdToken()');
    ch = true;
  }
  
  if (c.match(/const \{ db \} = await import\(['"].*?firebase['"]\);/)) {
    c = c.replace(/const \{ db \} = await import\(['"].*?firebase['"]\);/g, '');
    ch = true;
  }

  if (ch) {
    if (!c.includes('import {') || !c.includes(' auth')) {
      const depth = file.split('/').length - 2;
      const relPath = depth === 2 ? '../../firebase' : '../firebase';
      if (!c.includes('import { auth')) {
        c = `import { auth } from '${relPath}';\n` + c;
      }
    }
    fs.writeFileSync(file, c, 'utf8');
    console.log('Fixed', file);
  }
}

fix('./src/components/BudgetAIAssistant.tsx');
fix('./src/components/AIChatbot.tsx');
fix('./src/components/ForecastingScreen.tsx');
fix('./src/components/AIFinancialSummary.tsx');
fix('./src/components/AdminPanelScreen.tsx');
fix('./src/hooks/useFirebaseStore.ts');
