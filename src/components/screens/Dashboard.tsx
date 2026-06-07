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
import { Virtuoso } from 'react-virtuoso';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { exportToPDF } from '../../lib/pdfExport';
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
import { Transaction, Category, Budget, TransactionType, SavingsGoal, RecurringTransaction, Debt, FamilyMember, Investment, Bill, SystemFeatures } from '../../types';
import { DEFAULT_CATEGORIES } from '../../constants';
import { IconComponent, iconMap } from '../../utils/iconMap';
import { ErrorBoundary as ComponentErrorBoundary } from '../ui/ErrorBoundary';
import { AIFinancialSummary } from '../AIFinancialSummary';



// --- Dashboard Screen ---
export default function Dashboard({ transactions, income, expense, balance, budgets, categories, currency, isDarkMode, language, aiInstructions, formatAmount, debts, isFetchingTx }: { 
  transactions: Transaction[], 
  income: number, 
  expense: number, 
  balance: number,
  budgets: Budget[],
  categories: Category[],
  currency: string,
  isDarkMode: boolean,
  language: 'bn' | 'en',
  aiInstructions?: string,
  formatAmount: (amount: number) => string,
  debts?: Debt[],
  isFetchingTx?: boolean
}) {
  const [chartRange, setChartRange] = useState<'week' | 'month' | 'year'>('week');

  const totalDebt = useMemo(() => {
    return (debts || []).filter(d => d.type === 'borrowed').reduce((acc, d) => acc + d.remaining, 0);
  }, [debts]);

  const nearestDueDate = useMemo(() => {
    const dates = (debts || [])
      .filter(d => d.type === 'borrowed' && d.remaining > 0 && d.dueDate)
      .map(d => new Date(d.dueDate!).getTime())
      .filter(time => !isNaN(time));
    if (dates.length === 0) return null;
    return new Date(Math.min(...dates));
  }, [debts]);

  const chartData = useMemo(() => {
    const data: any[] = [];
    const now = new Date();
    
    if (chartRange === 'week') {
      // Last 7 days including today
      for (let i = 6; i >= 0; i--) {
        const date = subDays(now, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        
        const dayIncome = (transactions || [])
          .filter(t => t && t.type === 'income' && t.date && t.date.startsWith(dateStr))
          .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
          
        const dayExpense = (transactions || [])
          .filter(t => t && t.type === 'expense' && t.date && t.date.startsWith(dateStr))
          .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
          
        data.push({
          name: language === 'bn' ? format(date, 'EEE', { locale: undefined }) : format(date, 'EEE'),
          income: dayIncome,
          expense: dayExpense,
          fullDate: format(date, 'dd MMM')
        });
      }
    } else if (chartRange === 'month') {
      // Last 30 days grouped into 5 periods
      for (let i = 4; i >= 0; i--) {
        const endDate = subDays(now, i * 6);
        const startDate = subDays(now, (i + 1) * 6 - 1);
        
        const periodIncome = (transactions || [])
          .filter(t => {
            try {
              if (!t || !t.date) return false;
              const tDate = parseISO(t.date);
              return t.type === 'income' && tDate >= startOfDay(startDate) && tDate <= endOfDay(endDate);
            } catch (e) { return false; }
          })
          .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
          
        const periodExpense = (transactions || [])
          .filter(t => {
            try {
              if (!t || !t.date) return false;
              const tDate = parseISO(t.date);
              return t.type === 'expense' && tDate >= startOfDay(startDate) && tDate <= endOfDay(endDate);
            } catch (e) { return false; }
          })
          .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
          
        data.push({
          name: `${format(startDate, 'd')}-${format(endDate, 'd')} ${format(endDate, 'MMM')}`,
          income: periodIncome,
          expense: periodExpense
        });
      }
    } else if (chartRange === 'year') {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthPrefix = format(monthDate, 'yyyy-MM');
        
        const monthIncome = (transactions || [])
          .filter(t => t && t.type === 'income' && t.date && t.date.startsWith(monthPrefix))
          .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
          
        const monthExpense = (transactions || [])
          .filter(t => t && t.type === 'expense' && t.date && t.date.startsWith(monthPrefix))
          .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
          
        data.push({
          name: format(monthDate, 'MMM'),
          income: monthIncome,
          expense: monthExpense
        });
      }
    }
    
    // Ensure all data points have numbers
    return data.map(item => ({
      ...item,
      income: Number(item.income) || 0,
      expense: Number(item.expense) || 0
    }));
  }, [transactions, chartRange, language]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ willChange: 'transform, opacity' }}
      className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6"
    >
      {/* Balance Cards */}
      <ComponentErrorBoundary name="Dashboard_BalanceCard">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10px" }}
          style={{ willChange: 'transform, opacity' }}
          transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
          className="col-span-1 lg:col-span-6 bg-blue-600 p-5 md:p-8 rounded-[24px] md:rounded-[32px] text-white shadow-sm shadow-blue-200 relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-blue-100 text-xs font-medium mb-1">মোট ব্যালেন্স</p>
                <h3 className="text-3xl font-bold">{currency} {formatAmount(balance)}</h3>
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">সক্রিয়</div>
            </div>
            <div className="flex items-center justify-between mt-8">
              <div>
                <p className="text-blue-100 text-[10px] mb-1 uppercase tracking-widest">কার্ড নম্বর</p>
                <p className="font-mono text-sm tracking-widest">**** **** **** 4582</p>
              </div>
              <CreditCard className="w-10 h-10 opacity-50" />
            </div>
          </div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full"></div>
        </motion.div>
      </ComponentErrorBoundary>

      <ComponentErrorBoundary name="Dashboard_IncomeCard">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10px" }}
          style={{ willChange: 'transform, opacity' }}
          transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
          className={cn(
            "col-span-1 md:col-span-6 lg:col-span-3 p-5 md:p-6 rounded-[24px] md:rounded-[32px] shadow-sm border transition-colors duration-300",
            isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-50"
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center",
              isDarkMode ? "bg-green-900/30 text-green-400" : "bg-green-50 text-green-500"
            )}>
              <ArrowLeftRight className="w-6 h-6 rotate-90" />
            </div>
            <div className="text-right">
              <p className={cn("text-xs font-medium uppercase tracking-wider", isDarkMode ? "text-gray-300" : "text-gray-600")}>এই মাসের আয়</p>
              <h3 className={cn("text-2xl font-bold", isDarkMode ? "text-white" : "text-[#1B2559]")}>{currency} {formatAmount(income)}</h3>
            </div>
          </div>
          <div className={cn(
            "flex items-center gap-2 text-xs font-bold w-fit px-2 py-1 rounded-lg",
            isDarkMode ? "text-green-400 bg-green-900/30" : "text-green-500 bg-green-50"
          )}>
            <Plus className="w-3 h-3" />
            {currency} {formatAmount(Math.round(income * 0.1))} (গত মাস থেকে)
          </div>
        </motion.div>
      </ComponentErrorBoundary>

      <ComponentErrorBoundary name="Dashboard_DebtCard">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10px" }}
          style={{ willChange: 'transform, opacity' }}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
          className={cn(
            "col-span-1 md:col-span-6 lg:col-span-3 p-5 md:p-6 rounded-[24px] md:rounded-[32px] shadow-sm border transition-colors duration-300",
            isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-50"
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center",
              isDarkMode ? "bg-blue-900/30 text-blue-400" : "bg-blue-50 text-blue-600"
            )}>
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className={cn("text-xs font-medium uppercase tracking-wider", isDarkMode ? "text-gray-400" : "text-gray-500")}>
                {language === 'bn' ? 'ক্রেডিট কার্ড ঋণ' : 'Credit Card Debt'}
              </p>
              <h3 className={cn("text-2xl font-bold", isDarkMode ? "text-white" : "text-[#1B2559]")}>{currency} {formatAmount(totalDebt)}</h3>
            </div>
          </div>
          {nearestDueDate ? (
            <div className={cn(
              "flex items-center gap-2 text-xs font-bold w-fit px-2 py-1 rounded-lg",
              isDarkMode ? "text-blue-400 bg-blue-900/30" : "text-blue-600 bg-blue-50"
            )}>
              {language === 'bn' ? 'পরিশোধের তারিখ:' : 'Due:'} {format(nearestDueDate, 'dd MMM')}
            </div>
          ) : (
            <div className={cn(
              "flex items-center gap-2 text-xs font-bold w-fit px-2 py-1 rounded-lg",
              isDarkMode ? "text-gray-400 bg-gray-800" : "text-gray-500 bg-gray-100"
            )}>
              {language === 'bn' ? 'কোনো বাকি ঋণ নেই' : 'No outstanding debt'}
            </div>
          )}
        </motion.div>
      </ComponentErrorBoundary>

      {/* Cash Flow Chart */}
      <ComponentErrorBoundary name="Dashboard_CashFlowChart">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10px" }}
        style={{ willChange: 'transform, opacity' }}
        transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
        className={cn(
          "col-span-1 md:col-span-12 lg:col-span-8 p-5 md:p-8 rounded-[24px] md:rounded-[32px] shadow-sm border transition-colors duration-300",
          isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-50"
        )}>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">ক্যাশ ফ্লো (Cash Flow)</h3>
          <div className={cn("flex p-1 rounded-2xl", isDarkMode ? "bg-gray-800" : "bg-gray-50")}>
            <button onClick={() => setChartRange('week')} className={cn("px-4 py-2 min-h-[44px] rounded-xl text-sm font-bold transition-all flex items-center justify-center", chartRange === 'week' ? (isDarkMode ? "bg-blue-600 text-white" : "bg-white shadow-sm text-blue-600") : (isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"))}>সপ্তাহ</button>
            <button onClick={() => setChartRange('month')} className={cn("px-4 py-2 min-h-[44px] rounded-xl text-sm font-bold transition-all flex items-center justify-center", chartRange === 'month' ? (isDarkMode ? "bg-blue-600 text-white" : "bg-white shadow-sm text-blue-600") : (isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"))}>মাস</button>
            <button onClick={() => setChartRange('year')} className={cn("px-4 py-2 min-h-[44px] rounded-xl text-sm font-bold transition-all flex items-center justify-center", chartRange === 'year' ? (isDarkMode ? "bg-blue-600 text-white" : "bg-white shadow-sm text-blue-600") : (isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"))}>বছর</button>
          </div>
        </div>
        <div className="h-[350px] w-full mt-4 flex items-center justify-center relative">
          {chartData.length > 0 && chartData.some(d => d.income > 0 || d.expense > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart key={chartRange} data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#374151" : "#F1F5F9"} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: isDarkMode ? '#9ca3af' : '#64748b', fontSize: 10 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: isDarkMode ? '#9ca3af' : '#64748b', fontSize: 10 }} 
                  width={35}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                    color: isDarkMode ? '#fff' : '#1B2559',
                    padding: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  name={language === 'bn' ? 'আয়' : 'Income'}
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  name={language === 'bn' ? 'ব্যয়' : 'Expense'}
                  stroke="#ef4444" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorExpense)" 
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 space-y-2">
              <Activity className="w-12 h-12 opacity-20" />
              <p className="text-sm font-medium">{language === 'bn' ? 'প্রদর্শনের জন্য কোনো তথ্য নেই' : 'No data to display'}</p>
            </div>
          )}
        </div>
      </motion.div>
      </ComponentErrorBoundary>

      <ComponentErrorBoundary name="Dashboard_AIFinancialSummary">
        <div className="col-span-1 md:col-span-12 lg:col-span-4">
          <AIFinancialSummary />
        </div>
      </ComponentErrorBoundary>

      {/* Budget Summary */}
      <ComponentErrorBoundary name="Dashboard_BudgetSummary">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10px" }}
          style={{ willChange: 'transform, opacity' }}
          transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
          className={cn(
            "col-span-1 md:col-span-6 lg:col-span-6 p-5 md:p-8 rounded-[24px] md:rounded-[32px] shadow-sm border transition-colors duration-300",
            isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-50"
          )}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">বাজেট সামারি</h3>
            <button className="text-blue-600 text-sm font-bold">সব দেখুন</button>
          </div>
          <div className="space-y-6">
            {budgets.slice(0, 3).map(budget => {
              const category = categories.find(c => c.id === budget.categoryId);
              const spent = transactions
                .filter(t => t.categoryId === budget.categoryId && t.type === 'expense')
                .reduce((acc, t) => acc + t.amount, 0);
              const percent = Math.min(Math.round((spent / budget.amount) * 100), 100);
              
              return (
                <div key={budget.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${category?.color}15`, color: category?.color }}>
                        <IconComponent name={category?.icon || ''} className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{category?.name}</p>
                        <p className="text-xs text-gray-500">{currency} {formatAmount(spent)} খরচ হয়েছে</p>
                      </div>
                    </div>
                    <p className="font-bold text-sm">{percent}%</p>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500" 
                      style={{ width: `${percent}%`, backgroundColor: category?.color }}
                    ></div>
                  </div>
                </div>
              );
            })}
            {budgets.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                কোনো বাজেট সেট করা নেই
              </div>
            )}
          </div>
        </motion.div>
      </ComponentErrorBoundary>

      <ComponentErrorBoundary name="Dashboard_RecentTransactions">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10px" }}
          style={{ willChange: 'transform, opacity' }}
          transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
          className={cn(
            "col-span-1 md:col-span-6 lg:col-span-6 p-5 md:p-8 rounded-[24px] md:rounded-[32px] shadow-sm border transition-colors duration-300",
            isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-50"
          )}
        >
          <h3 className="text-xl font-bold mb-6">সাম্প্রতিক লেনদেন</h3>
          <div className="space-y-4">
              {isFetchingTx && transactions.length === 0 ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-[#1B2559] rounded-[20px] md:rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-gray-200 dark:bg-gray-800" />
                        <div>
                          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded-md mb-2" />
                          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded-md" />
                        </div>
                      </div>
                      <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded-md" />
                    </div>
                  ))}
                </div>
              ) : transactions.slice(0, 5).map(t => {
                const category = categories.find(c => c.id === t.categoryId);
                return (
                  <div 
                    key={t.id} 
                    className="flex items-center justify-between p-2 md:p-3 hover:bg-gray-50 rounded-xl md:rounded-2xl transition-all"
                  >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${category?.color}15`, color: category?.color }}>
                      <IconComponent name={category?.icon || ''} className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="min-w-0 pr-2">
                      <p className="font-bold truncate">{category?.name}</p>
                      <p className="text-xs text-gray-500">{format(parseISO(t.date), 'dd MMM, hh:mm a')}</p>
                    </div>
                  </div>
                  <p className={cn("font-bold shrink-0", t.type === 'income' ? "text-green-500" : "text-red-500")}>
                    {t.type === 'income' ? '+' : '-'} {currency} {formatAmount(t.amount)}
                  </p>
                </div>
              );
            })}
            {!isFetchingTx && transactions.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                কোনো লেনদেন নেই
              </div>
            )}
          </div>
        </motion.div>
      </ComponentErrorBoundary>
    </motion.div>
  );
}