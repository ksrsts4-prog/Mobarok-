import { Project, SyntaxKind } from 'ts-morph';
import fs from 'fs';
import path from 'path';

const project = new Project();
project.addSourceFileAtPath('src/App.tsx');
const appFile = project.getSourceFileOrThrow('src/App.tsx');

const screensDir = 'src/components/screens';
if (!fs.existsSync(screensDir)) {
  fs.mkdirSync(screensDir, { recursive: true });
}

const componentsToMove = [
  'Dashboard', 'Transactions', 'Summary', 'Categories', 'Budgets', 
  'TransactionModal', 'AdvancedChartsScreen', 'MonthlyOverviewScreen', 
  'ReportsScreen', 'SettingsScreen', 'Savings', 'SavingsGoalModal', 
  'AdminPinUnlockScreen'
];

const screenFiles = [];

for (const compName of componentsToMove) {
  const funcDecl = appFile.getFunction(compName);
  if (funcDecl) {
    const compCode = funcDecl.getFullText();
    const newFilePath = screensDir + '/' + compName + '.tsx';
    const newFile = project.createSourceFile(newFilePath, compCode, { overwrite: true });
    
    const newFunc = newFile.getFunctionOrThrow(compName);
    newFunc.setIsExported(true);
    newFunc.setIsDefaultExport(true);
    
    screenFiles.push({ name: compName, path: newFilePath });
    funcDecl.remove();
  }
}

for (const screenInfo of screenFiles) {
  const file = project.getSourceFileOrThrow(screenInfo.path);
  
  const modifiedImports = [];
  for (const impDecl of appFile.getImportDeclarations()) {
    const moduleSpecifier = impDecl.getModuleSpecifierValue();
    let newSpecifier = moduleSpecifier;
    
    if (moduleSpecifier.startsWith('./components/')) {
      newSpecifier = moduleSpecifier.replace('./components/', '../');
    } else if (moduleSpecifier.startsWith('./')) {
      newSpecifier = moduleSpecifier.replace('./', '../../');
    }
    
    const impText = impDecl.getText().replace(moduleSpecifier, newSpecifier);
    modifiedImports.push(impText);
  }
  
  file.insertText(0, modifiedImports.join('\\n') + '\\n\\n');
}

const lazyImportsStrings = [];
for (const comp of componentsToMove) {
  lazyImportsStrings.push("const " + comp + " = React.lazy(() => import('./components/screens/" + comp + "'));");
}
const lazyImportsText = lazyImportsStrings.join('\\n');

const lastImport = appFile.getImportDeclarations().pop();
if (lastImport) {
  appFile.insertText(lastImport.getEnd(), '\\n\\n' + lazyImportsText);
}

project.saveSync();
console.log('Refactoring done.');
