import fs from 'fs';

let content = fs.readFileSync('src/hooks/useFirebaseStore.ts', 'utf8');

// Add import if missing
if (!content.includes("from 'zustand/react/shallow'")) {
  content = content.replace("import { useAppStore } from '../store/useAppStore';", "import { useAppStore } from '../store/useAppStore';\nimport { useShallow } from 'zustand/react/shallow';");
}

// Replace const store = useAppStore();
content = content.replace("const store = useAppStore();", `const store = useAppStore(useShallow(state => ({
  user: state.user,
  isAdmin: state.isAdmin,
  language: state.language,
  autoBackup: state.autoBackup,
  transactions: state.transactions,
  bills: state.bills,
  systemFeatures: state.systemFeatures,
  setUser: state.setUser,
  setIsAdmin: state.setIsAdmin,
  setCurrency: state.setCurrency,
  setIsDarkMode: state.setIsDarkMode,
  setLanguage: state.setLanguage,
  setDefaultTransactionType: state.setDefaultTransactionType,
  setWeekStartDay: state.setWeekStartDay,
  setAccentColor: state.setAccentColor,
  setShowDecimals: state.setShowDecimals,
  setAiInstructions: state.setAiInstructions,
  setAutoBackup: state.setAutoBackup,
  setTransactions: state.setTransactions,
  setCategories: state.setCategories,
  setBudgets: state.setBudgets,
  setSavingsGoals: state.setSavingsGoals,
  setRecurringTransactions: state.setRecurringTransactions,
  setDebts: state.setDebts,
  setFamilyMembers: state.setFamilyMembers,
  setInvestments: state.setInvestments,
  setBills: state.setBills,
  setSystemFeatures: state.setSystemFeatures
})));`);

fs.writeFileSync('src/hooks/useFirebaseStore.ts', content, 'utf8');
console.log('useFirebaseStore.ts optimized.');
