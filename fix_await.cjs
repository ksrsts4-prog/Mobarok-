const fs = require('fs');
['src/components/BudgetAIAssistant.tsx', 'src/components/AIChatbot.tsx', 'src/components/ForecastingScreen.tsx', 'src/components/AIFinancialSummary.tsx', 'src/components/AdminPanelScreen.tsx', 'src/hooks/useFirebaseStore.ts'].forEach(file => {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/const token = auth\.currentUser\?\.getIdToken\(\);/g, 'const token = await auth.currentUser?.getIdToken();');
  fs.writeFileSync(file, c);
  console.log('Fixed', file);
});
