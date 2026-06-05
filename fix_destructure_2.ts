import fs from 'fs';

const appPath = './src/App.tsx';
let content = fs.readFileSync(appPath, 'utf8');

// Replace the store destructuring
const storeDestructure = `  const store = useAppStore();
  const { 
    user, isAdmin, transactions, categories, budgets, savingsGoals, 
    recurringTransactions, debts, familyMembers, investments, bills,
    currency, language, isDarkMode, accentColor, showDecimals, aiInstructions, 
    systemFeatures, defaultTransactionType, weekStartDay,
    setLanguage, setCurrency, setIsDarkMode, setAccentColor, setShowDecimals,
    setDefaultTransactionType, setWeekStartDay, setAiInstructions,
    setTransactions, setCategories, setBudgets, setSavingsGoals, setRecurringTransactions,
    setDebts, setFamilyMembers
  } = store;`;

content = content.replace(/const store = useAppStore\(\);\s*const \{\s*user[\s\S]*?\} = store;/, storeDestructure);

// Add sessionId and handleLogout to fbStore destructuring
content = content.replace('isSystemMaintenance, globalAlert, allFeedback,', 'isSystemMaintenance, globalAlert, allFeedback, sessionId,');
content = content.replace('submitFeedbackReply, toggleSystemFeature, lastBackupTime', 'submitFeedbackReply, toggleSystemFeature, lastBackupTime, autoBackup, setAutoBackup');

// We also need to define handleLogout somewhere if it's missing from fbStore destructure?
// It was in the fbStore destructure but let's double check.
fs.writeFileSync(appPath, content, 'utf8');
console.log('App.tsx updated remaining stores');
