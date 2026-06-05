import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import CryptoJS from 'crypto-js';
import { Transaction, Category, Budget, SavingsGoal, RecurringTransaction, Debt, FamilyMember, Investment, Bill, SystemFeatures } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

const ENCRYPTION_KEY = 'mobarok-finance-secure-key-2026';

const secureStorage = {
  getItem: (name: string): string | null => {
    const value = localStorage.getItem(name);
    if (!value) return null;
    try {
      const bytes = CryptoJS.AES.decrypt(value, ENCRYPTION_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      console.warn("Storage decryption error, clearing storage", e);
      localStorage.removeItem(name);
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    const encrypted = CryptoJS.AES.encrypt(value, ENCRYPTION_KEY).toString();
    localStorage.setItem(name, encrypted);
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  },
};

interface AppState {
  user: FirebaseUser | null;
  setUser: (u: FirebaseUser | null) => void;
  aiInstructions: string;
  setAiInstructions: (i: string) => void;
  currency: string;
  setCurrency: (c: string) => void;
  language: 'bn' | 'en';
  setLanguage: (l: 'bn' | 'en') => void;
  isDarkMode: boolean;
  setIsDarkMode: (d: boolean) => void;
  accentColor: string;
  setAccentColor: (c: string) => void;
  showDecimals: boolean;
  setShowDecimals: (s: boolean) => void;

  transactions: Transaction[];
  setTransactions: (t: Transaction[] | ((prev: Transaction[]) => Transaction[])) => void;
  categories: Category[];
  setCategories: (c: Category[]) => void;
  budgets: Budget[];
  setBudgets: (b: Budget[]) => void;
  savingsGoals: SavingsGoal[];
  setSavingsGoals: (s: SavingsGoal[]) => void;
  recurringTransactions: RecurringTransaction[];
  setRecurringTransactions: (r: RecurringTransaction[]) => void;
  debts: Debt[];
  setDebts: (d: Debt[]) => void;
  familyMembers: FamilyMember[];
  setFamilyMembers: (f: FamilyMember[]) => void;
  investments: Investment[];
  setInvestments: (i: Investment[]) => void;
  bills: Bill[];
  setBills: (b: Bill[]) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  defaultTransactionType: 'income' | 'expense';
  setDefaultTransactionType: (t: 'income' | 'expense') => void;
  weekStartDay: 'sunday' | 'monday';
  setWeekStartDay: (d: 'sunday' | 'monday') => void;
  systemFeatures: SystemFeatures;
  setSystemFeatures: (features: SystemFeatures) => void;
  autoBackup: boolean;
  setAutoBackup: (b: boolean) => void;
  adminPin: string;
  setAdminPin: (p: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      aiInstructions: '',
      setAiInstructions: (aiInstructions) => set({ aiInstructions }),
      currency: '৳',
      setCurrency: (currency) => set({ currency }),

      language: 'bn',
      setLanguage: (language) => set({ language }),
      isDarkMode: false,
      setIsDarkMode: (isDarkMode) => set({ isDarkMode }),
      accentColor: 'blue',
      setAccentColor: (accentColor) => set({ accentColor }),
      showDecimals: true,
      setShowDecimals: (showDecimals) => set({ showDecimals }),

      transactions: [],
      setTransactions: (transactions) => set((state) => ({ 
        transactions: typeof transactions === 'function' ? transactions(state.transactions) : transactions 
      })),
      categories: [],
      setCategories: (categories) => set({ categories }),
      budgets: [],
      setBudgets: (budgets) => set({ budgets }),
      savingsGoals: [],
      setSavingsGoals: (savingsGoals) => set({ savingsGoals }),
      recurringTransactions: [],
      setRecurringTransactions: (recurringTransactions) => set({ recurringTransactions }),
      debts: [],
      setDebts: (debts) => set({ debts }),
      familyMembers: [],
      setFamilyMembers: (familyMembers) => set({ familyMembers }),
      investments: [],
      setInvestments: (investments) => set({ investments }),
      bills: [],
      setBills: (bills) => set({ bills }),
      isAdmin: false,
      setIsAdmin: (isAdmin) => set({ isAdmin }),
      defaultTransactionType: 'expense',
      setDefaultTransactionType: (defaultTransactionType) => set({ defaultTransactionType }),
      weekStartDay: 'sunday',
      setWeekStartDay: (weekStartDay) => set({ weekStartDay }),
      systemFeatures: {
        aiAssistant: true,
        advancedAnalytics: true,
        forecasting: false,
        cloudSync: true,
        familyBudget: false,
        advancedSettings: false,
        dataExport: true,
        automaticBackup: false,
        multiCurrency: false,
        premiumBadges: false,
        deepCleaning: false,
        aiAutoReply: false
      },
      setSystemFeatures: (systemFeatures) => set({ systemFeatures }),
      autoBackup: false,
      setAutoBackup: (autoBackup) => set({ autoBackup }),
      adminPin: '2e5ad9980af6d86f40125576eebb5a2cff4f0e0250cd300bfe669290ec707336', // Hash for 83592
      setAdminPin: (adminPin) => set({ adminPin }),
    }),
    {
      name: 'finance-app-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => {
        // Performance Fix for low-end hardware:
        // Do not persist large state arrays to localStorage (synchronous JSON serialization)
        // Only persist lightweight user preferences
        const { 
          user, 
          transactions, 
          categories, 
          budgets, 
          savingsGoals, 
          recurringTransactions, 
          debts, 
          familyMembers, 
          investments, 
          bills, 
          ...preferencesToKeep 
        } = state;
        return preferencesToKeep;
      },
      version: 1,
    }
  )
);
