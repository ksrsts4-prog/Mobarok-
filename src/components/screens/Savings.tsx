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
import { IconComponent, iconMap } from '../../utils/iconMap';
import SavingsGoalModal from './SavingsGoalModal';



// --- Dashboard Screen ---
// --- Transactions Screen ---
// --- Summary Screen ---
// --- Categories Screen ---
// --- Budgets Screen ---
// --- Transaction Modal ---

export default function Savings({ 
  goals, 
  onAdd,
  onUpdate,
  onDelete,
  currency, 
  isDarkMode,
  formatAmount
}: { 
  goals: SavingsGoal[], 
  onAdd: (g: Omit<SavingsGoal, 'id'>) => void,
  onUpdate: (g: SavingsGoal) => void,
  onDelete: (id: string) => void,
  currency: string,
  isDarkMode: boolean,
  formatAmount: (amount: number) => string
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const deleteGoal = (id: string) => {
    if (window.confirm('আপনি কি এই লক্ষ্যটি মুছে ফেলতে চান?')) {
      onDelete(id);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
            isDarkMode ? "bg-blue-500 shadow-blue-900" : "bg-blue-600 shadow-blue-100"
          )}>
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold">সঞ্চয় লক্ষ্য</h3>
        </div>
        <button 
          onClick={() => { setEditingGoal(null); setIsModalOpen(true); }}
          className={cn(
            "px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all",
            isDarkMode ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100"
          )}
        >
          <Plus className="w-5 h-5" />
          নতুন লক্ষ্য
        </button>
      </div>

      <div className={cn(
        "p-6 rounded-[32px] border-2",
        isDarkMode ? "bg-gray-800/30 border-gray-800" : "bg-blue-50/50 border-blue-100"
      )}>
        <h4 className="font-bold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          আপনার অর্জন (Achievements)
        </h4>
        <div className="flex flex-wrap gap-4">
          {goals.length === 0 && <span className="text-sm text-gray-600">আপনার এখনো কোনো ব্যাজ নেই!</span>}
          {goals.map((g) => {
            const isCompleted = g.current >= g.target;
            const progress = g.target > 0 ? (g.current / g.target) * 100 : 0;
            return (
              <div key={`badge-${g.id}`} className={cn(
                "px-4 py-2 rounded-2xl flex items-center gap-2 text-sm font-bold border-2 transition-transform hover:scale-105",
                isCompleted 
                  ? "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-400 dark:border-yellow-800"
                  : (progress >= 50 
                    ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800"
                    : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 grayscale")
              )}>
                {isCompleted ? '🏆' : (progress >= 50 ? '🏅' : '🔒')}
                {isCompleted ? 'Savings Warrior' : (progress >= 50 ? 'Budget Master' : 'Novice Saver')}
                <span className="text-xs opacity-70 ml-1">({g.name})</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {goals.map((goal) => {
            const progress = goal.target > 0 ? Math.min((goal.current / goal.target) * 100, 100) : 0;
            return (
              <motion.div 
                key={goal.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  "p-6 rounded-[32px] border transition-all relative overflow-hidden group",
                  isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-100 shadow-sm"
                )}
              >
                <div className="flex items-center justify-between mb-6">
                  <div 
                    style={{ backgroundColor: goal.color.startsWith('#') ? goal.color : undefined }}
                    className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-white",
                    !goal.color.startsWith('#') && goal.color
                  )}>
                    <IconComponent name={goal.icon} className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { setEditingGoal(goal); setIsModalOpen(true); }}
                      className={cn(
                        "p-2 rounded-xl transition-all",
                        isDarkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-50 text-gray-500"
                      )}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteGoal(goal.id)}
                      className={cn(
                        "p-2 rounded-xl transition-all",
                        isDarkMode ? "hover:bg-red-900/30 text-red-400" : "hover:bg-red-50 text-red-500"
                      )}
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h4 className="text-lg font-bold mb-1">{goal.name}</h4>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-2xl font-black">{currency}{formatAmount(goal.current)}</span>
                  <span className={cn("text-sm font-medium mb-1", isDarkMode ? "text-gray-400" : "text-gray-500")}>
                    / {currency}{formatAmount(goal.target)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span 
                      style={{ color: goal.color.startsWith('#') ? goal.color : undefined }}
                      className={cn(!goal.color.startsWith('#') && goal.color.replace('bg-', 'text-'))}
                    >
                      {progress.toFixed(0)}% সম্পন্ন
                    </span>
                    <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                      বাকি: {currency}{formatAmount(Math.max(0, goal.target - goal.current))}
                    </span>
                  </div>
                  <div className={cn("w-full h-3 rounded-full overflow-hidden", isDarkMode ? "bg-gray-800" : "bg-gray-100")}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      style={{ backgroundColor: goal.color.startsWith('#') ? goal.color : undefined }}
                      className={cn("h-full rounded-full", !goal.color.startsWith('#') && goal.color)}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {goals.length === 0 && (
        <div className={cn(
          "p-12 rounded-[40px] border-2 border-dashed flex flex-col items-center justify-center text-center",
          isDarkMode ? "border-gray-800 text-gray-500" : "border-gray-200 text-gray-400"
        )}>
          <Target className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg font-medium">আপনার কোনো সঞ্চয় লক্ষ্য নেই।<br/>নতুন একটি লক্ষ্য যোগ করুন!</p>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <SavingsGoalModal 
            onClose={() => setIsModalOpen(false)}
            onSave={(goal) => {
              if (editingGoal) {
                onUpdate({ ...editingGoal, ...goal });
              } else {
                onAdd(goal);
              }
              setIsModalOpen(false);
              setEditingGoal(null);
            }}
            initialData={editingGoal}
            isDarkMode={isDarkMode}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}