import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// The original Zustand call is lines ~376 to 402
const oldZustand = `  const {
    user, isAdmin, transactions, categories, budgets, savingsGoals, 
    recurringTransactions, debts, familyMembers, investments, bills,
    currency, language, isDarkMode, accentColor, showDecimals, aiInstructions, 
    systemFeatures, defaultTransactionType, weekStartDay, autoBackup,
    setLanguage, setCurrency, setIsDarkMode, setAccentColor, setShowDecimals,
    setDefaultTransactionType, setWeekStartDay, setAiInstructions, setAutoBackup,
    setTransactions, setCategories, setBudgets, setSavingsGoals, setRecurringTransactions,
    setDebts, setFamilyMembers
  } = useAppStore(useShallow((state) => ({
    user: state.user, isAdmin: state.isAdmin, transactions: state.transactions,
    categories: state.categories, budgets: state.budgets, savingsGoals: state.savingsGoals,
    recurringTransactions: state.recurringTransactions, debts: state.debts,
    familyMembers: state.familyMembers, investments: state.investments, bills: state.bills,
    currency: state.currency, language: state.language, isDarkMode: state.isDarkMode,
    accentColor: state.accentColor, showDecimals: state.showDecimals, aiInstructions: state.aiInstructions,
    systemFeatures: state.systemFeatures, defaultTransactionType: state.defaultTransactionType,
    weekStartDay: state.weekStartDay, autoBackup: state.autoBackup,
    setLanguage: state.setLanguage, setCurrency: state.setCurrency, setIsDarkMode: state.setIsDarkMode,
    setAccentColor: state.setAccentColor, setShowDecimals: state.setShowDecimals,
    setDefaultTransactionType: state.setDefaultTransactionType, setWeekStartDay: state.setWeekStartDay,
    setAiInstructions: state.setAiInstructions, setAutoBackup: state.setAutoBackup,
    setTransactions: state.setTransactions, setCategories: state.setCategories,
    setBudgets: state.setBudgets, setSavingsGoals: state.setSavingsGoals,
    setRecurringTransactions: state.setRecurringTransactions, setDebts: state.setDebts,
    setFamilyMembers: state.setFamilyMembers
  })));`;

const newZustand = `
  // --- ZUSTAND PERFORMANCE OPTIMIZATION ---
  // Why: Fetching 40+ states in a single block triggered re-renders on the massive App.tsx component tree
  // even if a non-active tab's state changed.
  // How: Separating core config from heavy data arrays ensures that changes to one chunk (like a new transaction)
  // do not needlessly force re-evaluations across unrelated slices.
  const { user, isAdmin, currency, language, isDarkMode, accentColor, showDecimals, autoBackup, aiInstructions, systemFeatures, defaultTransactionType, weekStartDay } = useAppStore(useShallow(state => ({
    user: state.user, isAdmin: state.isAdmin, currency: state.currency, language: state.language,
    isDarkMode: state.isDarkMode, accentColor: state.accentColor, showDecimals: state.showDecimals,
    autoBackup: state.autoBackup, aiInstructions: state.aiInstructions, systemFeatures: state.systemFeatures,
    defaultTransactionType: state.defaultTransactionType, weekStartDay: state.weekStartDay
  })));

  const { transactions, categories, budgets, savingsGoals, recurringTransactions, debts, familyMembers, investments, bills } = useAppStore(useShallow(state => ({
    transactions: state.transactions, categories: state.categories, budgets: state.budgets,
    savingsGoals: state.savingsGoals, recurringTransactions: state.recurringTransactions, debts: state.debts,
    familyMembers: state.familyMembers, investments: state.investments, bills: state.bills
  })));

  const { setLanguage, setCurrency, setIsDarkMode, setAccentColor, setShowDecimals, setDefaultTransactionType, setWeekStartDay, setAiInstructions, setAutoBackup, setTransactions, setCategories, setBudgets, setSavingsGoals, setRecurringTransactions, setDebts, setFamilyMembers } = useAppStore(useShallow(state => ({
    setLanguage: state.setLanguage, setCurrency: state.setCurrency, setIsDarkMode: state.setIsDarkMode,
    setAccentColor: state.setAccentColor, setShowDecimals: state.setShowDecimals,
    setDefaultTransactionType: state.setDefaultTransactionType, setWeekStartDay: state.setWeekStartDay,
    setAiInstructions: state.setAiInstructions, setAutoBackup: state.setAutoBackup,
    setTransactions: state.setTransactions, setCategories: state.setCategories, setBudgets: state.setBudgets,
    setSavingsGoals: state.setSavingsGoals, setRecurringTransactions: state.setRecurringTransactions,
    setDebts: state.setDebts, setFamilyMembers: state.setFamilyMembers
  })));
`;

content = content.replace(oldZustand, newZustand);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App.tsx Zustand selectors optimized.');
