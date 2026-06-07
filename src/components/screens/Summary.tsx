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



// --- Dashboard Screen ---
// --- Transactions Screen ---
// --- Summary Screen ---
export default function Summary({ transactions, categories, onEditCategory, currency, isDarkMode, formatAmount, language }: { 
  transactions: Transaction[], 
  categories: Category[],
  onEditCategory: (id: string) => void,
  currency: string,
  isDarkMode: boolean,
  formatAmount: (amount: number) => string,
  language: 'bn' | 'en'
}) {
  const expenseData = useMemo(() => {
    const data: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        data[t.categoryId] = (data[t.categoryId] || 0) + t.amount;
      });
    
    return Object.entries(data).map(([id, amount]) => {
      const cat = categories.find(c => c.id === id);
      return {
        id,
        name: cat?.name || 'Unknown',
        value: amount,
        color: cat?.color || '#CBD5E1',
        isDefault: cat?.isDefault || false
      };
    }).sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  const totalExpense = expenseData.reduce((acc, d) => acc + d.value, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-6"
    >
      <h3 className="text-2xl font-bold">{language === 'bn' ? 'ক্যাটাগরি সারসংক্ষেপ' : 'Category Summary'}</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={cn(
          "p-6 sm:p-8 rounded-[40px] shadow-lg border flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden transition-all",
          isDarkMode ? "bg-gradient-to-br from-[#1e293b] to-[#0f172a] border-gray-800" : "bg-gradient-to-br from-white to-gray-50 border-gray-100"
        )}>
          {/* Decorative background glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full pointer-events-none" />
          
          <div className="relative w-full h-[350px] z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={100}
                  outerRadius={140}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'none',
                    color: isDarkMode ? '#fff' : '#1B2559',
                    padding: '12px 20px'
                  }}
                  itemStyle={{
                    fontWeight: 600,
                    paddingTop: '4px'
                  }}
                  formatter={(value: number) => `${currency} ${formatAmount(value)}`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className={cn("text-xs font-bold uppercase tracking-widest mb-1", isDarkMode ? "text-gray-300" : "text-gray-600")}>{language === 'bn' ? 'মোট ব্যয়' : 'Total Expense'}</p>
              <p className={cn("text-3xl font-black", isDarkMode ? "text-white" : "text-gray-900")}>{currency} {formatAmount(totalExpense)}</p>
            </div>
          </div>
        </div>

        <div className={cn(
          "p-6 sm:p-8 rounded-[40px] shadow-lg border relative overflow-hidden transition-all",
          isDarkMode ? "bg-gradient-to-bl from-[#1e293b] to-[#0f172a] border-gray-800" : "bg-gradient-to-bl from-white to-gray-50 border-gray-100"
        )}>
          {/* Decorative background glow */}
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-blue-500/10 rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-rose-500/10 rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between mb-8">
              <h4 className={cn("font-bold text-xl", isDarkMode ? "text-white" : "text-gray-900")}>{language === 'bn' ? 'বিস্তারিত তালিকা' : 'Detailed List'}</h4>
              <div className={cn(
                "px-4 py-1.5 rounded-xl text-xs font-bold",
                isDarkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-50 text-blue-600"
              )}>{language === 'bn' ? 'এই মাস' : 'This Month'}</div>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {expenseData.map((item, index) => (
                  <motion.div 
                    key={item.id} 
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "flex items-center justify-between p-5 rounded-[24px] transition-all group hover:scale-[1.02]",
                      isDarkMode ? "bg-gray-800/50 hover:bg-gray-700/80" : "bg-white hover:bg-gray-50 hover:shadow-md border border-gray-100"
                    )}
                  >
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                    <div>
                      <p className={cn("font-bold", isDarkMode ? "text-white" : "text-gray-900")}>{item.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{Math.round((item.value / (totalExpense || 1)) * 100)}% {language === 'bn' ? 'খরচ' : 'Expense'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={cn("font-bold text-lg", isDarkMode ? "text-white" : "text-gray-900")}>{currency} {formatAmount(item.value)}</p>
                    </div>
                  {!item.isDefault && (
                    <button 
                      onClick={() => onEditCategory(item.id)}
                      className={cn(
                        "p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all",
                        isDarkMode ? "hover:bg-gray-600 text-blue-400" : "hover:bg-blue-50 text-blue-600"
                      )}
                      title={language === 'bn' ? 'ক্যাটাগরি এডিট করুন' : 'Edit Category'}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
            {expenseData.length === 0 && (
              <div className="text-center py-20">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                  isDarkMode ? "bg-gray-800 text-gray-700" : "bg-gray-50 text-gray-300"
                )}>
                  <PieChartIcon className="w-8 h-8" />
                </div>
                <p className="text-gray-400 font-medium">{language === 'bn' ? 'কোনো তথ্য নেই' : 'No data'}</p>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}