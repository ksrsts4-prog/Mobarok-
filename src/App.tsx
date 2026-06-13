import { useFirebaseStore } from './hooks/useFirebaseStore';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, Component } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  PieChart as PieChartIcon, 
  Tags, 
  Wallet, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Menu,
  Bell,
  CreditCard,
  ShoppingBag,
  Bot,
  Home,
  Utensils,
  Plane,
  Bus,
  Heart,
  Dumbbell,
  Baby,
  Gift,
  Car,
  Shirt,
  Film,
  Monitor,
  Gamepad2,
  Umbrella,
  Scissors,
  Wifi,
  Tv,
  Briefcase,
  GraduationCap,
  Music,
  Code,
  Coffee,
  ShoppingCart,
  Anchor,
  Bike,
  Camera,
  MapPin,
  TrendingDown,
  TrendingUp,
  Smile,
  Shield,
  Snowflake,
  Sun,
  Moon,
  Cloud,
  Droplet,
  Zap,
  Battery,
  Award,
  Crown,
  MoreVertical,
  Edit2,
  Trash2,
  X,
  Download,
  Calendar,
  RotateCcw,
  Settings,
  FileUp,
  Trash,
  Globe,
  Target,
  FileSpreadsheet,
  User,
  Lock,
  HelpCircle,
  Info,
  Languages,
  ShieldCheck,
  MessageSquare,
  FileText,
  Filter,
  Printer,
  Fingerprint,
  BellRing,
  AlertTriangle,
  LayoutGrid,
  Database,
  History,
  Smartphone,
  Palette,
  Share2,
  Check,
  Copy,
  WifiOff,
  Repeat,
  Users,
  AlertCircle,
  Sparkles,
  ImageIcon,
  Loader2,
  ShieldAlert,
  Activity,
  Megaphone,
  UserCheck,
  Star,
  Trophy,
  Receipt
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  isWithinInterval, 
  parseISO, 
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  isAfter,
  isBefore,
  subDays
} from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  deleteUser,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc,
  onSnapshot, 
  query, 
  where, 
  deleteDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  orderBy,
  getDocFromServer,
  startAfter,
  limit
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { cn } from './lib/utils';
import { useAppStore } from './store/useAppStore';
import { ErrorBoundary as ComponentErrorBoundary } from './components/ui/ErrorBoundary';

import PWAPrompt from './components/PWAPrompt';
import { PageSkeleton } from './components/PageSkeleton';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { Header } from './components/layout/Header';


// --- Error Boundary ---
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  state = { hasError: false, error: null };

  constructor(props: { children: React.ReactNode }) {
    super(props);
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
          <div className="max-w-md w-full bg-white p-8 rounded-[32px] shadow-sm text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">কিছু ভুল হয়েছে</h2>
            <p className="text-gray-600">অ্যাপটি লোড করতে সমস্যা হচ্ছে। দয়া করে পেজটি রিফ্রেশ করুন।</p>
            <pre className="text-xs bg-gray-50 p-4 rounded-xl overflow-auto text-left max-h-40">
              {this.state.error?.message || String(this.state.error)}
            </pre>
            <button 
              onClick={() => {
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then((registrations) => {
                    for(let registration of registrations) {
                      registration.unregister();
                    }
                    window.location.reload();
                  }).catch(() => {
                    window.location.reload();
                  });
                } else {
                  window.location.reload();
                }
              }}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
            >
              রিফ্রেশ করুন
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
import { Transaction, Category, Budget, TransactionType, SavingsGoal, RecurringTransaction, Debt, FamilyMember, Investment, Bill, SystemFeatures } from './types/index';
import { DEFAULT_CATEGORIES } from './constants';

const Dashboard = React.lazy(() => import('./components/screens/Dashboard'));
const Transactions = React.lazy(() => import('./components/screens/Transactions'));
const Summary = React.lazy(() => import('./components/screens/Summary'));
const Categories = React.lazy(() => import('./components/screens/Categories'));
const Budgets = React.lazy(() => import('./components/screens/Budgets'));
const TransactionModal = React.lazy(() => import('./components/screens/TransactionModal'));
const AdvancedChartsScreen = React.lazy(() => import('./components/screens/AdvancedChartsScreen'));
const MonthlyOverviewScreen = React.lazy(() => import('./components/screens/MonthlyOverviewScreen'));
const ReportsScreen = React.lazy(() => import('./components/screens/ReportsScreen'));
const SettingsScreen = React.lazy(() => import('./components/screens/SettingsScreen'));
const Savings = React.lazy(() => import('./components/screens/Savings'));
const SavingsGoalModal = React.lazy(() => import('./components/screens/SavingsGoalModal'));
const AdminPinUnlockScreen = React.lazy(() => import('./components/screens/AdminPinUnlockScreen'));
const QuickAddTransaction = React.lazy(() => import('./components/screens/QuickAddTransaction').then(m => ({ default: m.QuickAddTransaction })));

// --- Lightweight Fallback Loader for Low-End Devices (Redmi 9A / Helio G25) ---
const LightweightLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 w-full">
    <div className="w-10 h-10 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin shadow-sm"></div>
    <p className="text-[#3b82f6] font-medium text-sm animate-pulse">লোড হচ্ছে...</p>
  </div>
);

// --- Lazy Loaded Screens for Code Splitting ---
const AIChatbot = React.lazy(() => import('./components/AIChatbot').then(m => ({ default: m.AIChatbot })));
const RecurringTransactionsScreen = React.lazy(() => import('./components/RecurringTransactionsScreen').then(m => ({ default: m.RecurringTransactionsScreen })));
const DebtsScreen = React.lazy(() => import('./components/DebtsScreen').then(m => ({ default: m.DebtsScreen })));
const FamilyBudgetScreen = React.lazy(() => import('./components/FamilyBudgetScreen').then(m => ({ default: m.FamilyBudgetScreen })));
const BillsScreen = React.lazy(() => import('./components/BillsScreen').then(m => ({ default: m.BillsScreen })));
const InvestmentsScreen = React.lazy(() => import('./components/InvestmentsScreen').then(m => ({ default: m.InvestmentsScreen })));
const ForecastingScreen = React.lazy(() => import('./components/ForecastingScreen').then(m => ({ default: m.ForecastingScreen })));
const GamificationScreen = React.lazy(() => import('./components/GamificationScreen').then(m => ({ default: m.GamificationScreen })));
const SplitBillsScreen = React.lazy(() => import('./components/SplitBillsScreen').then(m => ({ default: m.SplitBillsScreen })));
const AdminPanelScreen = React.lazy(() => import('./components/AdminPanelScreen').then(m => ({ default: m.AdminPanelScreen })));
const AboutScreen = React.lazy(() => import('./components/AboutScreen'));
const WelcomeScreen = React.lazy(() => import('./components/auth/WelcomeScreen').then(m => ({ default: m.WelcomeScreen })));
const LockScreen = React.lazy(() => import('./components/auth/LockScreen').then(m => ({ default: m.LockScreen })));


// --- Icons Mapping ---
const iconMap: Record<string, any> = {
  ShoppingBag,
  Home,
  Utensils,
  Plane,
  Bus,
  Heart,
  Dumbbell,
  Baby,
  Wallet,
  Gift,
  Target,
  FileText,
  CreditCard,
  Bell,
  Settings,
  Tags,
  Users,
  Activity,
  Car,
  Smartphone,
  Globe,
  Monitor,
  Zap: Sparkles,
  Music,
  Briefcase,
  Book: FileText,
  Coffee,
  ShoppingCart,
  Shirt,
  Film,
  Gamepad2,
  Umbrella,
  Scissors,
  Wifi,
  Tv,
  GraduationCap,
  Code,
  Anchor,
  Bike,
  Camera,
  MapPin,
  TrendingDown,
  TrendingUp,
  Smile,
  Shield,
  Snowflake,
  Sun,
  Moon,
  Cloud,
  Droplet,
  Battery,
  Award,
  Crown
};

const IconComponent = ({ name, className }: { name: string, className?: string }) => {
  const Icon = iconMap[name] || Wallet;
  return <Icon className={className} />;
};

// --- Main App Component ---
const AppLogo = ({ className = "w-12 h-12" }: { className?: string }) => {
  return (
    <div className={cn("relative flex items-center justify-center shrink-0 rounded-[28%] overflow-hidden shadow-md bg-[#3b82f6]", className)}>
        <svg viewBox="0 0 24 24" className="w-[60%] h-[60%] text-white" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-8 8H5a2 2 0 0 1-2-2V5.3"/>
          <path d="M22 10h-4a2 2 0 0 0 0 4h4V10z" fill="white" stroke="none"/>
        </svg>
    </div>
  );
};

function App() {
  const { 
    isAuthReady, isOnline, loginError, isLoggingIn, isFetchingTx, hasMoreTx, loadMoreTransactions,
    isSystemMaintenance, globalAlert, allFeedback, sessionId,
    userName, setUserName, userEmail, setUserEmail, userPhone, setUserPhone,
    userOccupation, setUserOccupation, userAddress, setUserAddress,
    userPhoto, setUserPhoto, isPremium, setIsPremium,
    dailyForecastCount, setDailyForecastCount,
    lastForecastDate, setLastForecastDate,
    dailyAssistantCount, setDailyAssistantCount,
    lastAssistantDate, setLastAssistantDate,
    isAppLocked, setIsAppLocked, pinCode, setPinCode, isBiometricEnabled, setIsBiometricEnabled,
    handleLogin, handleLogout, handleLogoutOtherDevices, handleDeleteAccount, handleBiometricAuth,
    addTransaction, updateTransaction, deleteTransaction,
    addCategory, updateCategory, deleteCategory,
    addBudget, updateBudget, deleteBudget,
    addSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
    addRecurringTransaction, deleteRecurringTransaction,
    addDebt, updateDebt, deleteDebt, addFamilyMember, deleteFamilyMember,
    addInvestment, updateInvestment, deleteInvestment,
    addBill, updateBill, deleteBill, updateSettings,
    submitFeedback, deleteFeedback, submitFeedbackReply, toggleSystemFeature, lastBackupTime, setLastBackupTime
  } = useFirebaseStore();


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


  const formatAmount = (amount: number) => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accentColor);
  }, [accentColor]);

  const totalBalance = useMemo(() => {
    return transactions.reduce((acc: number, t: Transaction) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
  }, [transactions]);

  const incomeThisMonth = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return transactions
      .filter((t: Transaction) => t.type === 'income' && isWithinInterval(parseISO(t.date), { start, end }))
      .reduce((acc: number, t: Transaction) => acc + t.amount, 0);
  }, [transactions]);

  const expenseThisMonth = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return transactions
      .filter((t: Transaction) => t.type === 'expense' && isWithinInterval(parseISO(t.date), { start, end }))
      .reduce((acc: number, t: Transaction) => acc + t.amount, 0);
  }, [transactions]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'summary' | 'categories' | 'budgets' | 'settings' | 'savings' | 'reports' | 'feedback_admin' | 'recurring' | 'debts' | 'family' | 'investments' | 'bills' | 'forecasting' | 'about' | 'advanced_charts' | 'monthly_overview' | 'gamification' | 'split_bills'>('dashboard');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] relative overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center justify-center gap-6 relative z-10"
        >
          <AppLogo className="w-24 h-24 shadow-md rounded-3xl" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full shadow-sm"
          />
        </motion.div>
      </div>
    );
  }

  if (isSystemMaintenance && !isAdmin) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center p-6", isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900")}>
        <div className="max-w-md w-full bg-yellow-100 p-8 rounded-[32px] text-center space-y-4">
          <div className="w-16 h-16 bg-yellow-200 text-yellow-700 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-yellow-800">{language === 'bn' ? 'মেইনটেন্যান্স চলছে' : 'System Maintenance'}</h2>
          <p className="text-yellow-700">{language === 'bn' ? 'অ্যাপটি সাময়িক সময়ের জন্য বন্ধ রাখা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।' : 'The application is temporarily down for maintenance. Please try again later.'}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <React.Suspense fallback={<LightweightLoader />}><WelcomeScreen 
        handleLogin={handleLogin}
        isLoggingIn={isLoggingIn}
        loginError={loginError}
      /></React.Suspense>
    );
  }

  if (isAppLocked && pinCode) {
    return (
      <React.Suspense fallback={<LightweightLoader />}><LockScreen
        pinCode={pinCode}
        isDarkMode={isDarkMode}
        language={language}
        isBiometricEnabled={isBiometricEnabled}
        user={user}
        setIsAppLocked={setIsAppLocked}
        setPinCode={setPinCode}
        updateSettings={updateSettings}
        handleBiometricAuth={handleBiometricAuth}
      /></React.Suspense>
    );
  }

    return (
    <div className={cn(
      "min-h-screen font-sans selection:bg-blue-100 transition-colors duration-300",
      isDarkMode ? "bg-[#0B1120] text-white dark" : "bg-[#F4F7FE] text-[#1B2559]"
    )}>
      <AnimatePresence>
        {globalAlert.active && globalAlert.msg && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-600 text-white w-full py-2 px-6 flex items-center justify-center gap-3 text-sm font-bold shadow-md z-[60] sticky top-0 transform-gpu will-change-transform"
          >
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1 text-center">{globalAlert.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInstallGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 transform-gpu">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "w-full max-w-md rounded-[32px] p-6 sm:p-8 shadow-md relative overflow-y-auto max-h-[90vh] transform-gpu will-change-transform",
                isDarkMode ? "bg-gray-800 text-white shadow-black/50" : "bg-white text-gray-900 shadow-blue-900/10"
              )}
            >
              <button 
                onClick={() => setShowInstallGuide(false)}
                className="absolute top-4 right-4 z-50 p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>
              
              <div className="text-center mb-6 mt-4">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-3xl mx-auto flex items-center justify-center mb-4">
                  <Download className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {language === 'bn' ? 'অ্যাপটি ইন্সটল করুন' : 'Install the App'}
                </h3>
                <p className="opacity-80 text-sm">
                  {language === 'bn' 
                    ? 'সর্বোত্তম অভিজ্ঞতার জন্য, এই ধাপগুলো অনুসরণ করে অ্যাপটি আপনার মোবাইল বা কম্পিউটারে ইন্সটল করুন:' 
                    : 'For the best experience, follow these steps to install the app on your mobile or computer:'}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className={cn("p-4 rounded-2xl", isDarkMode ? "bg-gray-700/50" : "bg-gray-50")}>
                  <div className="font-bold mb-1">{language === 'bn' ? 'অ্যান্ড্রয়েড (Android)' : 'Android'}</div>
                  <div className="text-sm opacity-80 flex flex-col gap-2">
                    <span className="flex items-center gap-2"><span className="bg-blue-200 dark:bg-blue-900 px-2 py-0.5 rounded text-xs">১</span> ব্রাউজারের Menu (⋮) আইকনে ক্লিক করুন</span>
                    <span className="flex items-center gap-2"><span className="bg-blue-200 dark:bg-blue-900 px-2 py-0.5 rounded text-xs">২</span> <strong>Add to Home Screen</strong> বা <strong>Install App</strong> নির্বাচন করুন</span>
                  </div>
                </div>

                <div className={cn("p-4 rounded-2xl", isDarkMode ? "bg-gray-700/50" : "bg-gray-50")}>
                  <div className="font-bold mb-1">{language === 'bn' ? 'আইওএস (iOS/Safari)' : 'iOS (Safari)'}</div>
                  <div className="text-sm opacity-80 flex flex-col gap-2">
                    <span className="flex items-center gap-2"><span className="bg-blue-200 dark:bg-blue-900 px-2 py-0.5 rounded text-xs">১</span> Safari-এর নীচে Share ( <Share2 className="inline w-4 h-4" /> ) আইকনে ক্লিক করুন</span>
                    <span className="flex items-center gap-2"><span className="bg-blue-200 dark:bg-blue-900 px-2 py-0.5 rounded text-xs">২</span> একটু নিচে গিয়ে <strong>Add to Home Screen</strong> নির্বাচন করুন</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowInstallGuide(false)}
                  className={cn(
                    "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all",
                    isDarkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200"
                  )}
                >
                  {language === 'bn' ? 'বুঝতে পেরেছি' : 'Got it'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOnline && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-900/90 dark:bg-gray-800/90 text-white backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center justify-center gap-2 text-xs md:text-sm font-bold z-[100] border border-gray-700 pointer-events-none"
          >
            <WifiOff className="w-4 h-4 text-amber-500" />
            <span>{language === 'bn' ? 'অফলাইন - রেকর্ড সেভ হচ্ছে' : 'Offline - Changes saving locally'}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        isAdmin={isAdmin}
        systemFeatures={systemFeatures}
        language={language}
        handleInstallClick={handleInstallClick}
        setIsAddModalOpen={setIsAddModalOpen}
        setIsQuickAddOpen={setIsQuickAddOpen}
      />

      {/* Main Content Area */}
      <main className="lg:ml-72 pb-36 lg:pb-8 min-h-screen">
        <Header 
          isDarkMode={isDarkMode}
          userPhoto={userPhoto}
          userName={userName}
        />

        <div className="px-6 max-w-7xl mx-auto">
          <React.Suspense fallback={<LightweightLoader />}>
            <AnimatePresence mode="wait">
              <ComponentErrorBoundary key={activeTab} name={`Screen_${activeTab}`}>
                {activeTab === 'dashboard' && (
              <Dashboard 
                transactions={transactions} 
                income={incomeThisMonth} 
                expense={expenseThisMonth} 
                balance={totalBalance} 
                budgets={budgets}
                categories={categories}
                currency={currency}
                isDarkMode={isDarkMode}
                language={language}
                aiInstructions={aiInstructions}
                formatAmount={formatAmount}
                debts={debts}
                isFetchingTx={isFetchingTx}
              />
            )}
            {activeTab === 'transactions' && (
              <Transactions 
                transactions={transactions} 
                categories={categories} 
                onEdit={(t) => { setEditingTransaction(t); setIsAddModalOpen(true); }}
                onDelete={deleteTransaction}
                currency={currency}
                isDarkMode={isDarkMode}
                formatAmount={formatAmount}
                loadMoreTransactions={loadMoreTransactions}
                isFetchingTx={isFetchingTx}
              />
            )}
            {activeTab === 'summary' && (
              <Summary 
                transactions={transactions} 
                categories={categories} 
                currency={currency}
                isDarkMode={isDarkMode}
                formatAmount={formatAmount}
                language={language as 'bn' | 'en'}
                onEditCategory={(catId) => {
                  const cat = categories.find(c => c.id === catId);
                  if (cat) {
                    setCategoryToEdit(cat);
                    setActiveTab('categories');
                  }
                }}
              />
            )}
            {activeTab === 'categories' && (
              <Categories 
                categories={categories} 
                onAdd={addCategory}
                onUpdate={updateCategory}
                onDelete={deleteCategory}
                initialCategoryToEdit={categoryToEdit}
                onModalClose={() => setCategoryToEdit(null)}
                isDarkMode={isDarkMode}
              />
            )}
            {activeTab === 'budgets' && (
              <Budgets 
                budgets={budgets} 
                onAdd={addBudget}
                onUpdate={updateBudget}
                onDelete={deleteBudget}
                transactions={transactions}
                categories={categories}
                currency={currency}
                isDarkMode={isDarkMode}
                language={language}
                aiInstructions={aiInstructions}
                formatAmount={formatAmount}
              />
            )}
            {activeTab === 'savings' && (
              <Savings 
                goals={savingsGoals} 
                onAdd={addSavingsGoal}
                onUpdate={updateSavingsGoal}
                onDelete={deleteSavingsGoal}
                currency={currency}
                isDarkMode={isDarkMode}
                formatAmount={formatAmount}
              />
            )}
            {activeTab === 'recurring' && (
              <RecurringTransactionsScreen
                recurringTransactions={recurringTransactions}
                onAdd={addRecurringTransaction}
                onDelete={deleteRecurringTransaction}
                categories={categories}
                isDarkMode={isDarkMode}
                language={language as 'bn' | 'en'}
                currency={currency}
              />
            )}
            {activeTab === 'debts' && (
              <DebtsScreen
                debts={debts}
                onAdd={addDebt}
                onUpdate={updateDebt}
                onDelete={deleteDebt}
                isDarkMode={isDarkMode}
                language={language as 'bn' | 'en'}
                currency={currency}
              />
            )}
            {activeTab === 'family' && (
              <FamilyBudgetScreen
                familyMembers={familyMembers}
                onAdd={addFamilyMember}
                onDelete={deleteFamilyMember}
                transactions={transactions}
                categories={categories}
                isDarkMode={isDarkMode}
                language={language as 'bn' | 'en'}
                currency={currency}
                isPremium={isPremium}
              />
            )}
            {activeTab === 'bills' && (
              <BillsScreen
                bills={bills}
                onAdd={addBill}
                onUpdate={updateBill}
                onDelete={deleteBill}
                isDarkMode={isDarkMode}
                language={language as 'bn' | 'en'}
                currency={currency}
              />
            )}
            {activeTab === 'investments' && (
              <InvestmentsScreen
                investments={investments}
                onAdd={addInvestment}
                onUpdate={updateInvestment}
                onDelete={deleteInvestment}
                isDarkMode={isDarkMode}
                language={language as 'bn' | 'en'}
                currency={currency}
              />
            )}
            {activeTab === 'forecasting' && (
              <ForecastingScreen
                transactions={transactions}
                categories={categories}
                isDarkMode={isDarkMode}
                language={language as 'bn' | 'en'}
                currency={currency}
                isPremium={isPremium}
                dailyForecastCount={dailyForecastCount}
                lastForecastDate={lastForecastDate}
                onUpdateSettings={updateSettings}
              />
            )}
            {activeTab === 'advanced_charts' && (
              <AdvancedChartsScreen 
                transactions={transactions}
                categories={categories}
                currency={currency}
                isDarkMode={isDarkMode}
                formatAmount={formatAmount}
                language={language as 'bn' | 'en'}
              />
            )}
            {activeTab === 'monthly_overview' && (
              <MonthlyOverviewScreen 
                transactions={transactions}
                currency={currency}
                isDarkMode={isDarkMode}
                formatAmount={formatAmount}
                language={language as 'bn' | 'en'}
              />
            )}
            {activeTab === 'reports' && (
              <ReportsScreen 
                transactions={transactions}
                categories={categories}
                currency={currency}
                isDarkMode={isDarkMode}
                formatAmount={formatAmount}
                language={language as 'bn' | 'en'}
                isFetchingTx={isFetchingTx}
                isPremium={isPremium}
              />
            )}
            {activeTab === 'feedback_admin' && isAdmin && (
              isAdminUnlocked ? (
                <AdminPanelScreen 
                  feedback={allFeedback}
                  isDarkMode={isDarkMode}
                  language={language}
                  onSubmitReply={submitFeedbackReply}
                  onDeleteFeedback={deleteFeedback}
                  transactions={transactions}
                  currency={currency}
                  features={systemFeatures}
                  onToggleFeature={toggleSystemFeature}
                />
              ) : (
                <AdminPinUnlockScreen
                  onUnlock={() => setIsAdminUnlocked(true)}
                  isDarkMode={isDarkMode}
                  language={language as 'bn' | 'en'}
                />
              )
            )}
            {activeTab === 'settings' && (
              <SettingsScreen 
                currency={currency}
                setCurrency={(c) => { setCurrency(c); updateSettings({ currency: c }); }}
                isDarkMode={isDarkMode}
                setIsDarkMode={(d) => { setIsDarkMode(d); updateSettings({ isDarkMode: d }); }}
                userPhoto={userPhoto}
                setUserPhoto={(p) => { setUserPhoto(p); updateSettings({ photo: p }); }}
                userName={userName}
                setUserName={(n) => { setUserName(n); updateSettings({ name: n }); }}
                userEmail={userEmail}
                setUserEmail={(e) => { setUserEmail(e); updateSettings({ email: e }); }}
                userPhone={userPhone}
                setUserPhone={(p) => { setUserPhone(p); updateSettings({ phone: p }); }}
                userOccupation={userOccupation}
                setUserOccupation={(o) => { setUserOccupation(o); updateSettings({ occupation: o }); }}
                userAddress={userAddress}
                setUserAddress={(a) => { setUserAddress(a); updateSettings({ address: a }); }}
                language={language}
                setLanguage={(l) => { setLanguage(l); updateSettings({ language: l }); }}
                defaultTransactionType={defaultTransactionType}
                setDefaultTransactionType={(t) => { setDefaultTransactionType(t); updateSettings({ defaultTransactionType: t }); }}
                weekStartDay={weekStartDay}
                setWeekStartDay={(d) => { setWeekStartDay(d); updateSettings({ weekStartDay: d }); }}
                isBiometricEnabled={isBiometricEnabled}
                setIsBiometricEnabled={(b) => { setIsBiometricEnabled(b); updateSettings({ isBiometricEnabled: b }); }}
                pinCode={pinCode}
                setPinCode={(p) => { setPinCode(p); updateSettings({ pinCode: p }); }}
                accentColor={accentColor}
                setAccentColor={(c) => { setAccentColor(c); updateSettings({ accentColor: c }); }}
                showDecimals={showDecimals}
                setShowDecimals={(b) => { setShowDecimals(b); updateSettings({ showDecimals: b }); }}
                autoBackup={autoBackup}
                setAutoBackup={(b) => { setAutoBackup(b); updateSettings({ autoBackup: b }); }}
                aiInstructions={aiInstructions}
                setAiInstructions={(i) => { setAiInstructions(i); updateSettings({ aiInstructions: i }); }}
                deferredPrompt={deferredPrompt}
                handleInstallClick={handleInstallClick}
                onImport={(data) => {
                  if (data.transactions) setTransactions(data.transactions);
                  if (data.categories) setCategories(data.categories);
                  if (data.budgets) setBudgets(data.budgets);
                  if (data.savingsGoals) setSavingsGoals(data.savingsGoals);
                  if (data.currency) setCurrency(data.currency);
                  if (data.userName) setUserName(data.userName);
                  if (data.userEmail) setUserEmail(data.userEmail);
                  if (data.userPhone) setUserPhone(data.userPhone);
                  if (data.userOccupation) setUserOccupation(data.userOccupation);
                  if (data.userAddress) setUserAddress(data.userAddress);
                  if (data.language) setLanguage(data.language);
                  if (data.defaultTransactionType) setDefaultTransactionType(data.defaultTransactionType);
                  if (data.weekStartDay) setWeekStartDay(data.weekStartDay);
                  if (data.isBiometricEnabled !== undefined) setIsBiometricEnabled(data.isBiometricEnabled);
                }}
                onReset={async () => {
                  // Delete all user data from Firestore
                  const uid = user.uid;
                  const collections = ['transactions', 'categories', 'budgets', 'savingsGoals', 'recurring', 'debts', 'familyMembers'];
                  for (const coll of collections) {
                    const snap = await getDocs(collection(db, `users/${uid}/${coll}`));
                    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
                  }
                  setTransactions([]);
                  setCategories(DEFAULT_CATEGORIES);
                  setBudgets([]);
                  setSavingsGoals([]);
                  setRecurringTransactions([]);
                  setDebts([]);
                  setFamilyMembers([]);
                }}
                onLogout={handleLogout}
                onLogoutOtherDevices={handleLogoutOtherDevices}
                onDeleteAccount={handleDeleteAccount}
                onSubmitFeedback={submitFeedback}
                userFeedback={allFeedback.filter(f => f.uid === user?.uid)}
                transactions={transactions}
                categories={categories}
                budgets={budgets}
                savingsGoals={savingsGoals}
                features={systemFeatures}
                lastBackupTime={lastBackupTime}
                isPremium={isPremium}
                setIsPremium={setIsPremium}
              />
            )}
            
            {activeTab === 'gamification' && (
              <GamificationScreen 
                transactions={transactions} 
                budgets={budgets} 
                savingsGoals={savingsGoals} 
                currency={currency} 
                isDarkMode={isDarkMode} 
                language={language as 'bn' | 'en'} 
              />
            )}

            {activeTab === 'split_bills' && (
              <SplitBillsScreen 
                familyMembers={familyMembers}
                currency={currency}
                isDarkMode={isDarkMode}
                language={language as 'bn' | 'en'}
                onAddDebt={addDebt}
                isFetchingTx={isFetchingTx}
              />
            )}

            {activeTab === 'about' && (
              <AboutScreen 
                language={language} 
                isDarkMode={isDarkMode} 
                handleInstallClick={handleInstallClick} 
                deferredPrompt={deferredPrompt} 
              />
            )}
              </ComponentErrorBoundary>
          </AnimatePresence>
          </React.Suspense>
        </div>
      </main>

      <MobileNav 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        isAdmin={isAdmin}
        systemFeatures={systemFeatures}
        language={language}
        handleInstallClick={handleInstallClick}
        setIsAddModalOpen={setIsAddModalOpen}
        setIsQuickAddOpen={setIsQuickAddOpen}
      />

      {systemFeatures.aiAssistant && (
        <ComponentErrorBoundary name="AIChatbot">
          <AIChatbot 
            isDarkMode={isDarkMode} 
            language={language} 
            user={user} 
            aiInstructions={aiInstructions}
            transactions={transactions}
            budgets={budgets}
            categories={categories}
            savingsGoals={savingsGoals}
            currency={currency}
            onAddTransaction={addTransaction}
            onAddCategory={addCategory}
            isPremium={isPremium}
            dailyAssistantCount={dailyAssistantCount}
            lastAssistantDate={lastAssistantDate}
            onUpdateSettings={updateSettings}
          />
        </ComponentErrorBoundary>
      )}

      {/* Add/Edit Transaction Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <TransactionModal 
            onClose={() => { setIsAddModalOpen(false); setEditingTransaction(null); }} 
            onSave={(t) => {
              if (editingTransaction) {
                updateTransaction(editingTransaction.id, t);
              } else {
                addTransaction(t);
              }
              setIsAddModalOpen(false);
              setEditingTransaction(null);
            }}
            categories={categories}
            initialData={editingTransaction}
            currency={currency}
            familyMembers={familyMembers}
            isPremium={isPremium}
          />
        )}
      </AnimatePresence>
      {/* Quick Add Transaction Bottom Sheet */}
      <AnimatePresence>
        {isQuickAddOpen && (
          <QuickAddTransaction
            onClose={() => setIsQuickAddOpen(false)}
            onSave={(t) => {
              addTransaction(t);
              setIsQuickAddOpen(false);
            }}
            onOpenDetailed={() => setIsAddModalOpen(true)}
            categories={categories}
            currency={currency}
            isDarkMode={isDarkMode}
            language={language as 'bn' | 'en'}
          />
        )}
      </AnimatePresence>

      <PWAPrompt />
    </div>
  );
}

export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <ComponentErrorBoundary name="AppLoader">
        <App />
      </ComponentErrorBoundary>
    </ErrorBoundary>
  );
}
