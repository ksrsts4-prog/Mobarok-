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



// --- Dashboard Screen ---
// --- Transactions Screen ---
// --- Summary Screen ---
// --- Categories Screen ---
// --- Budgets Screen ---
// --- Transaction Modal ---

export default function AdvancedChartsScreen({ 
  transactions, 
  categories, 
  currency, 
  isDarkMode,
  formatAmount,
  language
}: { 
  transactions: Transaction[], 
  categories: Category[], 
  currency: string, 
  isDarkMode: boolean,
  formatAmount: (val: number) => string,
  language: 'bn' | 'en'
}) {
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];
      
      const dayTransactions = transactions.filter(t => t.date.startsWith(dayStr));
      const income = dayTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const expense = dayTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      
      data.push({
        date: format(date, 'MMM dd'),
        income,
        expense
      });
    }
    return data;
  }, [transactions]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h3 className="text-2xl font-bold">{language === 'bn' ? 'অ্যাডভান্সড চার্টস' : 'Advanced Charts'}</h3>
      
      <div className={cn(
        "p-4 sm:p-6 lg:p-8 rounded-[32px] shadow-lg border relative overflow-hidden",
        isDarkMode ? "bg-gradient-to-br from-[#1e293b] to-[#0f172a] border-gray-800" : "bg-gradient-to-br from-white to-gray-50 border-gray-100"
      )}>
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h4 className="text-xl font-bold">{language === 'bn' ? 'গত ৩০ দিনের ট্রেন্ড' : 'Last 30 Days Trend'}</h4>
            <p className={cn("text-sm mt-1", isDarkMode ? "text-gray-300" : "text-gray-600")}>
              {language === 'bn' ? 'আপনার আয় এবং ব্যয়ের দৈনিক বিশ্লেষণ' : 'Daily analysis of your income and expenses'}
            </p>
          </div>
        </div>

        <div className="h-[300px] sm:h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="date" 
                stroke={isDarkMode ? '#9ca3af' : '#6b7280'} 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
                dy={10}
                minTickGap={20}
              />
              <YAxis 
                stroke={isDarkMode ? '#9ca3af' : '#6b7280'} 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                dx={-10}
                tickFormatter={(val) => {
                  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
                  if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
                  return val;
                }} 
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className={cn(
                        "p-4 rounded-2xl shadow-sm border",
                        isDarkMode ? "bg-gray-900/90 border-gray-700" : "bg-white/90 border-gray-100"
                      )}>
                        <p className={cn("text-sm font-semibold mb-3", isDarkMode ? "text-gray-300" : "text-gray-600")}>{label}</p>
                        {payload.map((entry, index) => (
                          <div key={index} className="flex items-center justify-between gap-6 mb-1 last:mb-0">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                              <span className={cn("text-sm font-medium", isDarkMode ? "text-gray-200" : "text-gray-700")}>{entry.name}</span>
                            </div>
                            <span className="text-sm font-bold" style={{ color: entry.color }}>{currency} {formatAmount(entry.value as number)}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ paddingBottom: '20px', fontSize: '14px' }}
              />
              <Area type="monotone" dataKey="income" name={language === 'bn' ? "আয়" : "Income"} stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="expense" name={language === 'bn' ? "ব্যয়" : "Expense"} stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}