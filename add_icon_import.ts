import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  'Budgets.tsx',
  'Categories.tsx',
  'Dashboard.tsx',
  'ReportsScreen.tsx',
  'Savings.tsx',
  'Transactions.tsx',
  'SavingsGoalModal.tsx'
];

for (const file of filesToUpdate) {
  const filePath = path.join(process.cwd(), 'src/components/screens', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    if (!content.includes('import { IconComponent')) {
      // Find the last import
      const importRegex = /import .* from '.*';\n/g;
      let lastIndex = 0;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        lastIndex = match.index + match[0].length;
      }
      
      const toInsert = "import { IconComponent, iconMap } from '../../utils/iconMap';\n";
      content = content.slice(0, lastIndex) + toInsert + content.slice(lastIndex);
      fs.writeFileSync(filePath, content);
    }
  }
}
