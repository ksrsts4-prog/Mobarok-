export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string; // ISO string
  note?: string;
  tags?: string[];
  receiptUrl?: string;
  familyMemberId?: string; // For Family/Shared Budget
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'monthly' | 'yearly';
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  icon: string;
  color: string;
}

export interface Account {
  balance: number;
  incomeThisMonth: number;
  creditCardDebt: number;
}

export interface RecurringTransaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  note?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDate: string; // ISO string
  lastProcessed?: string; // ISO string
}

export interface Debt {
  id: string;
  type: 'borrowed' | 'lent';
  person: string;
  amount: number;
  remaining: number;
  dueDate?: string; // ISO string
  note?: string;
  createdAt: string; // ISO string
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  color: string;
}

export interface Investment {
  id: string;
  name: string;
  type: 'dps' | 'fdr' | 'stocks' | 'mutual_fund' | 'bonds' | 'other';
  amountInvested: number;
  currentValue: number;
  startDate: string; // ISO string
  maturityDate?: string; // ISO string
  interestRate?: number;
  note?: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO string
  isPaid: boolean;
  category: string;
  note?: string;
}

export interface SystemFeatures {
  aiAssistant: boolean;
  advancedAnalytics: boolean;
  forecasting: boolean;
  cloudSync: boolean;
  familyBudget: boolean;
  advancedSettings: boolean;
  dataExport: boolean;
  automaticBackup: boolean;
  multiCurrency: boolean;
  premiumBadges: boolean;
  deepCleaning: boolean;
  aiAutoReply: boolean;
}

