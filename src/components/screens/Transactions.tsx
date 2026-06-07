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



// --- Dashboard Screen ---
// --- Transactions Screen ---
export default function Transactions({ transactions, categories, onEdit, onDelete, currency, isDarkMode, formatAmount, loadMoreTransactions, isFetchingTx }: { 
  transactions: Transaction[], 
  categories: Category[],
  onEdit: (t: Transaction) => void,
  onDelete: (id: string) => void,
  currency: string,
  isDarkMode: boolean,
  formatAmount: (amount: number) => string,
  loadMoreTransactions: () => void,
  isFetchingTx: boolean
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'this-week' | 'this-month' | 'last-month' | 'custom'>('all');
  const [customRange, setCustomRange] = useState<{ start: string, end: string }>({
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  const hasActiveFilters = searchTerm !== '' || filterType !== 'all' || dateFilter !== 'all' || filterCategory !== 'all';

  const resetFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterCategory('all');
    setDateFilter('all');
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const category = categories.find(c => c.id === t.categoryId);
      const matchesSearch = category?.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.note?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesCategory = filterCategory === 'all' || t.categoryId === filterCategory;
      
      let matchesDate = true;
      const tDate = parseISO(t.date);
      const now = new Date();

      if (dateFilter === 'this-week') {
        matchesDate = isWithinInterval(tDate, { start: startOfWeek(now), end: endOfWeek(now) });
      } else if (dateFilter === 'this-month') {
        matchesDate = isWithinInterval(tDate, { start: startOfMonth(now), end: endOfMonth(now) });
      } else if (dateFilter === 'last-month') {
        const lastMonth = subMonths(now, 1);
        matchesDate = isWithinInterval(tDate, { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) });
      } else if (dateFilter === 'custom') {
        matchesDate = isWithinInterval(tDate, { 
          start: startOfDay(parseISO(customRange.start)), 
          end: endOfDay(parseISO(customRange.end)) 
        });
      }

      return matchesSearch && matchesType && matchesCategory && matchesDate;
    });
  }, [transactions, categories, searchTerm, filterType, filterCategory, dateFilter, customRange]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filteredTransactions.forEach(t => {
      const dateKey = format(parseISO(t.date), 'yyyy-MM-dd');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(t);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredTransactions]);

  const flattenedVirtualItems = useMemo(() => {
    const virtItems: any[] = [];
    groupedTransactions.forEach(([date, items]) => {
      virtItems.push({ type: 'header', date, id: `header-${date}` });
      items.forEach(t => {
        virtItems.push({ type: 'transaction', transaction: t, id: t.id });
      });
    });
    return virtItems;
  }, [groupedTransactions]);

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Note'];
    const rows = filteredTransactions.map(t => {
      const category = categories.find(c => c.id === t.categoryId);
      return [
        format(parseISO(t.date), 'yyyy-MM-dd HH:mm'),
        t.type === 'income' ? 'Income' : 'Expense',
        `"${(category?.name || 'Unknown').replace(/"/g, '""')}"`,
        t.amount,
        `"${(t.note || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{ willChange: 'transform, opacity' }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-bold">সব লেনদেন</h3>
          <button 
            onClick={exportToCSV}
            className={cn(
              "p-2.5 rounded-2xl transition-all flex items-center gap-2 text-sm font-bold",
              isDarkMode ? "bg-blue-900/30 text-blue-400 hover:bg-blue-900/50" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
            )}
            title="CSV এক্সপোর্ট করুন"
          >
            <Download className="w-4 h-4" />
            এক্সপোর্ট
          </button>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="relative flex-1 min-w-[200px] md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input 
              type="text" 
              placeholder="লেনদেন খুঁজুন..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "w-full pl-10 pr-4 py-2.5 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all",
                isDarkMode ? "bg-gray-800 text-white placeholder-gray-500" : "bg-white text-[#1B2559]"
              )}
            />
          </div>
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={cn(
              "border-none rounded-2xl px-4 py-2.5 shadow-sm focus:ring-2 focus:ring-blue-500 font-medium transition-all max-w-[150px] md:max-w-none text-sm md:text-base cursor-pointer",
              isDarkMode ? "bg-gray-800 text-white" : "bg-white text-[#1B2559]"
            )}
          >
            <option value="all">সব ক্যাটাগরি</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className={cn(
              "border-none rounded-2xl px-4 py-2.5 shadow-sm focus:ring-2 focus:ring-blue-500 font-medium transition-all",
              isDarkMode ? "bg-gray-800 text-white" : "bg-white text-[#1B2559]"
            )}
          >
            <option value="all">সব সময়</option>
            <option value="this-week">এই সপ্তাহ</option>
            <option value="this-month">এই মাস</option>
            <option value="last-month">গত মাস</option>
            <option value="custom">কাস্টম রেঞ্জ</option>
          </select>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className={cn(
              "border-none rounded-2xl px-4 py-2.5 shadow-sm focus:ring-2 focus:ring-blue-500 font-medium transition-all",
              isDarkMode ? "bg-gray-800 text-white" : "bg-white text-[#1B2559]"
            )}
          >
            <option value="all">সব ধরণ</option>
            <option value="income">আয়</option>
            <option value="expense">ব্যয়</option>
          </select>
          {hasActiveFilters && (
            <button 
              onClick={resetFilters}
              className={cn(
                "p-2.5 rounded-2xl transition-all flex items-center gap-2 text-sm font-bold",
                isDarkMode ? "bg-red-900/30 text-red-400 hover:bg-red-900/50" : "bg-red-50 text-red-600 hover:bg-red-100"
              )}
              title="ফিল্টার রিসেট করুন"
            >
              <RotateCcw className="w-4 h-4" />
              রিসেট
            </button>
          )}
        </div>
      </div>

      {dateFilter === 'custom' && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ willChange: 'transform, opacity' }}
          className={cn(
            "p-4 md:p-6 rounded-[24px] md:rounded-[32px] shadow-sm border flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 transition-all",
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-50"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              isDarkMode ? "bg-blue-900/30 text-blue-400" : "bg-blue-50 text-blue-600"
            )}>
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">কাস্টম সময়সীমা</p>
              <p className={cn("text-sm font-bold", isDarkMode ? "text-white" : "text-[#1B2559]")}>তারিখ নির্বাচন করুন</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 flex-1 w-full">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">শুরু</label>
              <input 
                type="date" 
                value={customRange.start}
                onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                className={cn(
                  "w-full border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all",
                  isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-700"
                )}
              />
            </div>
            <div className="hidden md:block text-gray-300 mt-4">
              <ChevronRight className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">শেষ</label>
              <input 
                type="date" 
                value={customRange.end}
                onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                className={cn(
                  "w-full border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all",
                  isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-700"
                )}
              />
            </div>
            <button 
              onClick={() => setDateFilter('all')}
              className={cn(
                "mt-4 md:mt-4 p-3 rounded-2xl transition-all",
                isDarkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-400"
              )}
              title="ফিল্টার মুছুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-8">
        <Virtuoso
          useWindowScroll
          data={flattenedVirtualItems}
          endReached={loadMoreTransactions}
          components={{
            Footer: () => (
              <>
                {isFetchingTx ? (
                  <div className="py-4 space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 md:p-4 bg-white dark:bg-[#1B2559] rounded-[20px] md:rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-gray-200 dark:bg-gray-800" />
                          <div>
                            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded-md mb-2" />
                            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded-md" />
                          </div>
                        </div>
                        <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded-md" />
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="h-32" />{/* Spacer for bottom nav and FAB */}
              </>
            )
          }}
          itemContent={(index, item) => {
            if (item.type === 'header') {
              return (
                <div className="flex items-center gap-4 mb-4 mt-8 pb-1">
                  <h4 className={cn("font-bold text-sm uppercase tracking-wider", isDarkMode ? "text-gray-600" : "text-gray-400")}>
                    {format(parseISO(item.date), 'EEEE, dd MMMM yyyy')}
                  </h4>
                  <div className={cn("flex-1 h-px", isDarkMode ? "bg-gray-800" : "bg-gray-100")}></div>
                </div>
              );
            } else {
              const t = item.transaction;
              const category = categories.find(c => c.id === t.categoryId);
              return (
                <div 
                  className={cn(
                    "group mb-2 md:mb-3 p-3 md:p-4 rounded-[20px] md:rounded-2xl border flex items-center justify-between transition-colors",
                    isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100/50"
                  )}
                >
                  <div className="flex flex-1 items-center gap-3 md:gap-4 min-w-0 pr-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${category?.color}15`, color: category?.color }}>
                      <IconComponent name={category?.icon || ''} className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <p className={cn("font-medium truncate", isDarkMode ? "text-white" : "text-[#1B2559]")}>{category?.name}</p>
                      <p className="text-xs text-gray-500">{format(parseISO(t.date), 'hh:mm a')}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <p className={cn("font-bold", t.type === 'income' ? "text-green-500" : "text-red-500")}>
                      {t.type === 'income' ? '+' : '-'} {currency} {formatAmount(t.amount)}
                    </p>
                    <div className="flex items-center gap-1">
                      <button onClick={() => onEdit(t)} className={cn("p-2 sm:p-2.5 rounded-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center", isDarkMode ? "active:bg-gray-700 text-blue-400" : "active:bg-blue-50 text-blue-600")}>
                        <Edit2 className="w-4 h-4 md:w-4 md:h-4" />
                      </button>
                      <button onClick={() => onDelete(t.id)} className={cn("p-2 sm:p-2.5 rounded-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center", isDarkMode ? "active:bg-gray-700 text-red-400" : "active:bg-red-50 text-red-600")}>
                        <Trash2 className="w-4 h-4 md:w-4 md:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            }
          }}
        />
        {!isFetchingTx && groupedTransactions.length === 0 && (
          <div className="text-center py-20">
            <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4", isDarkMode ? "bg-gray-800 text-gray-600" : "bg-gray-100 text-gray-400")}>
              <Search className="w-10 h-10" />
            </div>
            <p className={cn("font-medium", isDarkMode ? "text-gray-400" : "text-gray-500")}>কোনো লেনদেন পাওয়া যায়নি</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}