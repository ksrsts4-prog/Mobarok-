import React, { useState, useEffect, useMemo, Component } from 'react';
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
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend
} from 'recharts';
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
import { Virtuoso, TableVirtuoso } from 'react-virtuoso';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { exportToPDF } from '../../lib/pdfExport';
import { ErrorBoundary as ComponentErrorBoundary } from '../ui/ErrorBoundary';
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
import { auth, db, handleFirestoreError, OperationType } from '../../firebase';
import { cn } from '../../lib/utils';
import { Type } from '@google/genai';
import { useAppStore } from '../../store/useAppStore';
import { AIChatbot } from '../AIChatbot';
import { BudgetAIAssistant } from '../BudgetAIAssistant';
import { AIFinancialSummary } from '../AIFinancialSummary';
import { RecurringTransactionsScreen } from '../RecurringTransactionsScreen';
import { DebtsScreen } from '../DebtsScreen';
import { FamilyBudgetScreen } from '../FamilyBudgetScreen';
import { BillsScreen } from '../BillsScreen';
import { InvestmentsScreen } from '../InvestmentsScreen';
import { ForecastingScreen } from '../ForecastingScreen';
import { GamificationScreen } from '../GamificationScreen';
import { SplitBillsScreen } from '../SplitBillsScreen';
import { AdminPanelScreen } from '../AdminPanelScreen';
import AboutScreen from '../AboutScreen';
import { Transaction, Category, Budget, TransactionType, SavingsGoal, RecurringTransaction, Debt, FamilyMember, Investment, Bill, SystemFeatures } from '../../types';
import { DEFAULT_CATEGORIES } from '../../constants';
import { IconComponent, iconMap } from '../../utils/iconMap';



// --- Dashboard Screen ---
// --- Transactions Screen ---
// --- Summary Screen ---
// --- Categories Screen ---
// --- Budgets Screen ---
// --- Transaction Modal ---

export default function ReportsScreen({ 
  transactions, 
  categories, 
  currency, 
  isDarkMode,
  formatAmount,
  language,
  isFetchingTx,
  isPremium
}: { 
  transactions: Transaction[], 
  categories: Category[], 
  currency: string, 
  isDarkMode: boolean,
  formatAmount: (amount: number) => string,
  language: 'bn' | 'en',
  isFetchingTx?: boolean,
  isPremium?: boolean
}) {
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const date = parseISO(t.date);
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      
      const dateMatch = (isAfter(date, start) || format(date, 'yyyy-MM-dd') === startDate) && 
                        (isBefore(date, end) || format(date, 'yyyy-MM-dd') === endDate);
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(t.categoryId);
      const typeMatch = typeFilter === 'all' || t.type === typeFilter;
      
      return dateMatch && categoryMatch && typeMatch;
    }).sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [transactions, startDate, endDate, selectedCategories, typeFilter]);

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    await exportToPDF(
      filteredTransactions,
      categories,
      language,
      currency,
      startDate,
      endDate,
      typeFilter
    );
    setIsExporting(false);
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Note'];
    const rows = filteredTransactions.map(t => [
      format(parseISO(t.date), 'yyyy-MM-dd'),
      t.type.toUpperCase(),
      categories.find(c => c.id === t.categoryId)?.name || 'Unknown',
      t.amount,
      t.note || '-'
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financial_report_${startDate}_to_${endDate}.csv`;
    link.click();
  };

  const handleExportExcel = () => {
    const tableData = filteredTransactions.map(t => ({
      Date: format(parseISO(t.date), 'yyyy-MM-dd'),
      Type: t.type.toUpperCase(),
      Category: categories.find(c => c.id === t.categoryId)?.name || 'Unknown',
      Amount: t.amount,
      Note: t.note || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, `financial_report_${startDate}_to_${endDate}.xlsx`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-8 pb-12"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
            isDarkMode ? "bg-blue-500 shadow-blue-900" : "bg-blue-600 shadow-blue-100"
          )}>
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold">{language === 'bn' ? 'আর্থিক রিপোর্ট' : 'Financial Report'}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isPremium && (
            <div className="w-full flex items-center justify-between bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-4 rounded-2xl border border-yellow-200 dark:border-yellow-900/50 mb-4">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
                <div>
                  <h4 className="font-bold text-yellow-900 dark:text-yellow-500">
                    {language === 'bn' ? 'অ্যাডভান্সড রিপোর্ট এক্সপোর্ট' : 'Advanced Report Export'}
                  </h4>
                  <p className="text-xs text-yellow-800 dark:text-yellow-200/80">
                    {language === 'bn' ? 'দারুণ ডিজাইনের PDF এবং Excel রিপোর্ট পেতে প্রিমিয়াম আপগ্রেড করুন।' : 'Upgrade to premium for beautiful PDF and Excel exports.'}
                  </p>
                </div>
              </div>
              <button className="text-sm font-bold bg-yellow-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600 shadow-sm">
                {language === 'bn' ? 'আনলক করুন' : 'Unlock'}
              </button>
            </div>
          )}

          <button 
            onClick={isPremium ? handleExportPDF : undefined}
            disabled={filteredTransactions.length === 0 || isExporting || !isPremium}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg relative",
              filteredTransactions.length === 0 || isExporting || !isPremium
                ? "bg-gray-300 cursor-not-allowed text-gray-600 dark:bg-gray-800 dark:text-gray-500" 
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100"
            )}
          >
            {!isPremium && <Lock className="w-4 h-4 absolute top-1 right-1 text-gray-500" />}
            <Printer className={cn("w-5 h-5", isExporting && "animate-spin")} />
            {isExporting ? (language === 'bn' ? 'প্রস্তুত হচ্ছে...' : 'Preparing...') : 'PDF'}
          </button>
          <button 
            onClick={isPremium ? handleExportExcel : undefined}
            disabled={filteredTransactions.length === 0 || !isPremium}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg relative",
              filteredTransactions.length === 0 || !isPremium
                ? "bg-gray-300 cursor-not-allowed text-gray-500 dark:bg-gray-800 dark:text-gray-500" 
                : "bg-green-600 text-white hover:bg-green-700 shadow-green-100 dark:bg-green-700 dark:hover:bg-green-600"
            )}
          >
             {!isPremium && <Lock className="w-4 h-4 absolute top-1 right-1 text-gray-500" />}
             <FileSpreadsheet className="w-5 h-5" />
            Excel
          </button>
          <button 
            onClick={isPremium ? handleExportCSV : undefined}
            disabled={filteredTransactions.length === 0 || !isPremium}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg relative",
              filteredTransactions.length === 0 || !isPremium
                ? "bg-gray-300 cursor-not-allowed text-gray-500 dark:bg-gray-800 dark:text-gray-500" 
                : "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-100 dark:bg-orange-600 dark:hover:bg-orange-500"
            )}
          >
            {!isPremium && <Lock className="w-4 h-4 absolute top-1 right-1 text-gray-500" />}
            <FileText className="w-5 h-5" />
            CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={cn(
        "p-8 rounded-[40px] shadow-sm border space-y-8 transition-colors duration-300",
        isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-50"
      )}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              {language === 'bn' ? 'সময়সীমা নির্বাচন করুন' : 'Select Time Range'}
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1 uppercase tracking-wider">{language === 'bn' ? 'শুরু' : 'Start'}</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={cn(
                    "w-full p-3 rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-medium",
                    isDarkMode ? "bg-gray-800 text-white" : "bg-gray-50 text-[#1B2559]"
                  )}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">{language === 'bn' ? 'শেষ' : 'End'}</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={cn(
                    "w-full p-3 rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-medium",
                    isDarkMode ? "bg-gray-800 text-white" : "bg-gray-50 text-[#1B2559]"
                  )}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-500" />
              {language === 'bn' ? 'লেনদেনের ধরন' : 'Transaction Type'}
            </h4>
            <div className="flex bg-gray-100 p-1 rounded-xl w-fit dark:bg-gray-800">
              {(['all', 'income', 'expense'] as const).map((type) => (
                <button 
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                    typeFilter === type ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400" : "text-gray-500"
                  )}
                >
                  {type === 'all' ? (language === 'bn' ? 'সব' : 'All') : type === 'income' ? (language === 'bn' ? 'আয়' : 'Income') : (language === 'bn' ? 'ব্যয়' : 'Expense')}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold">{language === 'bn' ? 'ক্যাটাগরি ফিল্টার' : 'Category Filter'} ({selectedCategories.length === 0 ? (language === 'bn' ? 'সব' : 'All') : selectedCategories.length})</h4>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all border-2",
                  selectedCategories.includes(cat.id)
                    ? "bg-blue-600 text-white border-blue-600"
                    : (isDarkMode ? "bg-gray-800 text-gray-400 border-transparent hover:bg-gray-700" : "bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100")
                )}
              >
                {cat.name}
              </button>
            ))}
            {selectedCategories.length > 0 && (
              <button 
                onClick={() => setSelectedCategories([])}
                className="px-4 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all dark:hover:bg-red-900/30"
              >
                {language === 'bn' ? 'রিসেট' : 'Reset'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <ComponentErrorBoundary name="ReportsScreen_SummaryCards">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={cn(
            "p-6 rounded-[32px] border transition-all",
            isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-50"
          )}>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{language === 'bn' ? 'মোট আয়' : 'Total Income'}</p>
            <p className="text-2xl font-bold text-green-500">{currency} {formatAmount(totalIncome)}</p>
          </div>
          <div className={cn(
            "p-6 rounded-[32px] border transition-all",
            isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-50"
          )}>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{language === 'bn' ? 'মোট ব্যয়' : 'Total Expense'}</p>
            <p className="text-2xl font-bold text-red-500">{currency} {formatAmount(totalExpense)}</p>
          </div>
          <div className={cn(
            "p-6 rounded-[32px] border transition-all",
            isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-50"
          )}>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{language === 'bn' ? 'নিট ব্যালেন্স' : 'Net Balance'}</p>
            <p className={cn("text-2xl font-bold", netBalance >= 0 ? "text-emerald-500" : "text-red-500")}>
              {currency} {formatAmount(netBalance)}
            </p>
          </div>
        </div>
      </ComponentErrorBoundary>

      {/* Results Table */}
      <ComponentErrorBoundary name="ReportsScreen_TransactionList">
        <div className={cn(
          "rounded-[40px] shadow-sm border overflow-hidden transition-colors duration-300",
          isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-50"
        )}>
          <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
            <h4 className="font-bold text-lg">{language === 'bn' ? 'লেনদেনের তালিকা' : 'Transaction List'} ({filteredTransactions.length})</h4>
          </div>
        <div className="overflow-hidden bg-white dark:bg-[#111827]">
          {isFetchingTx && filteredTransactions.length === 0 ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                 <div key={i} className="flex gap-4 animate-pulse">
                   <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-1/4"></div>
                   <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-1/4"></div>
                   <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-1/4"></div>
                 </div>
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="px-8 py-20 text-center text-gray-400 border-t border-gray-50 dark:border-gray-800">
              {language === 'bn' ? 'নির্বাচিত ফিল্টারের সাথে কোনো লেনদেন পাওয়া যায়নি।' : 'No transactions found with selected filters.'}
            </div>
          ) : (
            <TableVirtuoso
              style={{ height: 600 }}
              data={filteredTransactions}
              fixedHeaderContent={() => (
                <tr className={cn(
                  "text-xs font-bold uppercase tracking-widest",
                  isDarkMode ? "text-gray-500 bg-[#111827]" : "text-gray-400 bg-white"
                )} style={{ boxShadow: "0 1px 0 0 rgba(0,0,0,0.05)" }}>
                  <th className="px-8 py-4 border-b border-gray-50 dark:border-gray-800">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                  <th className="px-8 py-4 border-b border-gray-50 dark:border-gray-800">{language === 'bn' ? 'ক্যাটাগরি' : 'Category'}</th>
                  <th className="px-8 py-4 border-b border-gray-50 dark:border-gray-800">{language === 'bn' ? 'পরিমাণ' : 'Amount'}</th>
                  <th className="px-8 py-4 border-b border-gray-50 dark:border-gray-800">{language === 'bn' ? 'নোট' : 'Note'}</th>
                </tr>
              )}
              itemContent={(index, t) => {
                const category = categories.find(c => c.id === t.categoryId);
                return (
                  <>
                    <td className="px-8 py-5 border-b border-gray-50 dark:border-gray-800 bg-white dark:bg-[#111827]">
                      <p className="font-bold">{format(parseISO(t.date), 'dd MMM, yyyy')}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{format(parseISO(t.date), 'hh:mm a')}</p>
                    </td>
                    <td className="px-8 py-5 border-b border-gray-50 dark:border-gray-800 bg-white dark:bg-[#111827]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${category?.color}15`, color: category?.color }}>
                          <IconComponent name={category?.icon || ''} className="w-4 h-4" />
                        </div>
                        <span className="font-bold">{category?.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 border-b border-gray-50 dark:border-gray-800 bg-white dark:bg-[#111827]">
                      <p className={cn("font-bold text-lg", t.type === 'income' ? "text-green-500" : "text-red-500")}>
                        {t.type === 'income' ? '+' : '-'} {currency} {formatAmount(t.amount)}
                      </p>
                    </td>
                    <td className="px-8 py-5 border-b border-gray-50 dark:border-gray-800 bg-white dark:bg-[#111827]">
                      <p className="text-sm text-gray-500 max-w-xs truncate">{t.note || '-'}</p>
                    </td>
                  </>
                );
              }}
            />
          )}
        </div>
      </div>
      </ComponentErrorBoundary>
    </motion.div>
  );
}