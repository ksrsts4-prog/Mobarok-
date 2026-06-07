const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'src', 'components', 'screens');
const files = fs.readdirSync(screensDir).filter(f => f.endsWith('.tsx'));

const importsToRemove = [
  "import { AIChatbot } from '../AIChatbot';",
  "import { BudgetAIAssistant } from '../BudgetAIAssistant';",
  "import { AIFinancialSummary } from '../AIFinancialSummary';",
  "import { RecurringTransactionsScreen } from '../RecurringTransactionsScreen';",
  "import { DebtsScreen } from '../DebtsScreen';",
  "import { FamilyBudgetScreen } from '../FamilyBudgetScreen';",
  "import { BillsScreen } from '../BillsScreen';",
  "import { InvestmentsScreen } from '../InvestmentsScreen';",
  "import { ForecastingScreen } from '../ForecastingScreen';",
  "import { GamificationScreen } from '../GamificationScreen';",
  "import { SplitBillsScreen } from '../SplitBillsScreen';",
  "import { AdminPanelScreen } from '../AdminPanelScreen';",
  "import AboutScreen from '../AboutScreen';"
];

for (const file of files) {
  const filePath = path.join(screensDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  for (const imp of importsToRemove) {
    if (content.includes(imp)) {
      content = content.replace(imp + '\n', '');
      content = content.replace(imp, '');
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', file);
  }
}
