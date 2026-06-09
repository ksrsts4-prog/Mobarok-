const fs = require('fs');

['src/components/BudgetAIAssistant.tsx', 'src/components/AIChatbot.tsx', 'src/components/ForecastingScreen.tsx', 'src/components/AIFinancialSummary.tsx', 'src/components/AdminPanelScreen.tsx'].forEach(file => {
  let c = fs.readFileSync(file, 'utf8');
  if (c.includes("import { db } from '../firebase';")) {
    c = c.replace("import { db } from '../firebase';", "import { db, auth } from '../firebase';");
  } else if (!c.includes('auth') || !c.includes('../firebase')) {
    c = "import { auth } from '../firebase';\n" + c;
  }
  fs.writeFileSync(file, c);
  console.log('Fixed auth for', file);
});
