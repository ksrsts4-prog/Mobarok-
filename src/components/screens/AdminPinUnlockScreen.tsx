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

export default function AdminPinUnlockScreen({ onUnlock, isDarkMode, language }: { onUnlock: () => void, isDarkMode: boolean, language: 'bn' | 'en' }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (lockoutTime > Date.now()) {
      interval = setInterval(() => {
        const remaining = Math.ceil((lockoutTime - Date.now()) / 1000);
        if (remaining <= 0) {
          setLockoutTime(0);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutTime]);

  const verifyPin = async (val: string) => {
    if (lockoutTime > Date.now()) return;
    
    setIsVerifying(true);
    setError('');
    
    try {
      const user = auth.currentUser;
      const idToken = user ? await user.getIdToken() : '';
      
      const response = await fetch('/api/verify-admin-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ pin: val })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onUnlock();
      } else {
        setError(data.error || 'Invalid PIN');
        if (response.status === 429) {
          setLockoutTime(Date.now() + 60 * 1000); // 1 minute client-side lock UX
        }
      }
    } catch (e: any) {
      console.error(e);
      setError('Connection error');
    } finally {
      setIsVerifying(false);
    }
  };

  const isLockedOut = lockoutTime > Date.now();

  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center min-h-[60vh]", isDarkMode ? "text-white" : "text-[#1B2559]")}>
      <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mb-6", isDarkMode ? "bg-red-900/30 text-red-500" : "bg-red-50 text-red-600")}>
        <ShieldAlert className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-bold mb-2">{language === 'bn' ? 'অ্যাডমিন মাস্টার পিন' : 'Admin Master PIN'}</h2>
      <p className={cn("mb-8", isDarkMode ? "text-gray-300" : "text-gray-600")}>
        {language === 'bn' ? 'অ্যাডমিন প্যানেলে প্রবেশ করতে ৫ ডিজিটের মাস্টার পিন দিন।' : 'Enter the 5-digit master PIN to access the admin panel.'}
      </p>

      {isLockedOut ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-6 rounded-3xl w-full max-w-sm mb-4">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p className="font-bold">{language === 'bn' ? 'অ্যাকাউন্ট লক হয়ে গেছে!' : 'Account Locked!'}</p>
          <p className="text-sm mt-2">{language === 'bn' ? `খুব বেশি ভুল চেষ্টা করা হয়েছে। ১ মিনিট পর আবার চেষ্টা করুন।` : `Too many failed attempts. Try again in 1 minute.`}</p>
        </div>
      ) : (
        <>
          <input
            type="password"
            maxLength={5}
            value={pin}
            autoFocus
            disabled={isVerifying || isLockedOut}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '');
              setPin(val);
              setError('');
              if (val.length === 5) {
                verifyPin(val);
              }
            }}
            className={cn(
              "text-center text-4xl tracking-[1em] font-bold p-6 rounded-3xl w-full max-w-sm border-2 transition-all",
              isDarkMode ? "bg-gray-800 border-gray-700 text-white focus:border-blue-500" : "bg-gray-50 border-gray-200 text-[#1B2559] focus:border-blue-500",
              error ? "border-red-500 text-red-500 animate-pulse" : "",
              isVerifying ? "opacity-50 cursor-not-allowed" : ""
            )}
            placeholder="•••••"
          />
          {error && !isLockedOut && (
            <p className="text-red-500 mt-4 font-bold animate-bounce">
              {error === 'Invalid PIN' 
                ? (language === 'bn' ? `ভুল পিন!` : error) 
                : (language === 'bn' ? `অনেক বেশি চেষ্টা করা হয়েছে, ১ মিনিট পর আবার চেষ্টা করুন।` : error)}
            </p>
          )}
        </>
      )}
      
      {isVerifying && (
        <p className="text-blue-500 mt-4 font-bold flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin"/> {language === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying...'}
        </p>
      )}
    </div>
  );
}