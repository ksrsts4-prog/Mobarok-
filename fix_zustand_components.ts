import fs from 'fs';
import path from 'path';

const filesToFix = [
  'src/components/screens/TransactionModal.tsx',
  'src/components/AdminPanelScreen.tsx',
  'src/components/AIChatbot.tsx',
  'src/components/AIFinancialSummary.tsx',
  'src/components/BudgetAIAssistant.tsx',
  'src/components/AboutScreen.tsx',
  'src/components/screens/Transactions.tsx',
  'src/components/screens/Dashboard.tsx'
];

function fixZustandInFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('useAppStore()') && !content.includes('useShallow')) {
    // Add import
    content = content.replace("import { useAppStore }", "import { useShallow } from 'zustand/react/shallow';\nimport { useAppStore }");
    
    // Find const { ... } = useAppStore();
    const regex = /const\s+\{([^}]+)\}\s*=\s*useAppStore\(\);/g;
    content = content.replace(regex, (match, props) => {
      const keys = props.split(',').map((p: string) => p.trim()).filter((p: string) => p);
      const mapping = keys.map((k: string) => `${k}: state.${k}`).join(', ');
      return `const { ${props.trim()} } = useAppStore(useShallow(state => ({ ${mapping} })));`;
    });
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed ' + filePath);
  }
}

filesToFix.forEach(fixZustandInFile);
