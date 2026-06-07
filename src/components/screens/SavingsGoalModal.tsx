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
// --- Summary Screen ---
// --- Categories Screen ---
// --- Budgets Screen ---
// --- Transaction Modal ---

export default function SavingsGoalModal({ onClose, onSave, initialData, isDarkMode }: { onClose: () => void, onSave: (g: any) => void, initialData: SavingsGoal | null, isDarkMode: boolean }) {
  const [name, setName] = useState(initialData?.name || '');
  const [target, setTarget] = useState(initialData?.target.toString() || '');
  const [current, setCurrent] = useState(initialData?.current.toString() || '');
  const [icon, setIcon] = useState(initialData?.icon || 'Target');
  
  const mapOldColorToHex = (c: string) => {
    const map: Record<string, string> = {
      'bg-blue-500': '#3b82f6',
      'bg-purple-500': '#a855f7',
      'bg-pink-500': '#ec4899',
      'bg-orange-500': '#f97316',
      'bg-green-500': '#22c55e',
      'bg-cyan-500': '#06b6d4',
      'bg-indigo-500': '#6366f1',
      'bg-rose-500': '#f43f5e'
    };
    return map[c] || c;
  };
  
  const [color, setColor] = useState(mapOldColorToHex(initialData?.color || '#3b82f6'));

  const colors = [
    '#3b82f6', '#a855f7', '#ec4899', '#f97316', 
    '#22c55e', '#06b6d4', '#6366f1', '#f43f5e'
  ];

  const icons = ['Target', 'Home', 'Plane', 'Bus', 'ShoppingBag', 'Heart', 'Gift', 'Baby'];

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          "w-full max-w-md rounded-[40px] p-8 shadow-md relative",
          isDarkMode ? "bg-[#111827] text-white" : "bg-white text-[#1B2559]"
        )}
      >
        <button onClick={onClose} className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full transition-all">
          <Plus className="w-6 h-6 rotate-45" />
        </button>

        <h3 className="text-2xl font-bold mb-8">{initialData ? 'লক্ষ্য আপডেট করুন' : 'নতুন লক্ষ্য'}</h3>

        <form onSubmit={(e) => {
          e.preventDefault();
          onSave({ name, target: Number(target) || 0, current: Number(current) || 0, icon, color });
        }} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">লক্ষ্যের নাম</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: নতুন ফোন"
              className={cn(
                "w-full p-4 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold",
                isDarkMode ? "bg-gray-800" : "bg-gray-50"
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-2">টার্গেট পরিমাণ</label>
              <input 
                type="number"
                step="any"
                min="0.01"
                required
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className={cn(
                  "w-full p-4 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold",
                  isDarkMode ? "bg-gray-800" : "bg-gray-50"
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-2">বর্তমান জমানো</label>
              <input 
                type="number"
                step="any"
                min="0"
                required
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                className={cn(
                  "w-full p-4 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold",
                  isDarkMode ? "bg-gray-800" : "bg-gray-50"
                )}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2">আইকন এবং রঙ</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {icons.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    icon === i 
                      ? (isDarkMode ? "bg-blue-600 text-white" : "bg-blue-600 text-white") 
                      : (isDarkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-500")
                  )}
                >
                  <IconComponent name={i} className="w-5 h-5" />
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all border-2",
                    color === c ? "border-white scale-110 shadow-lg" : "border-transparent"
                  )}
                />
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-bold text-lg shadow-sm shadow-blue-100 hover:bg-blue-700 transition-all"
          >
            {initialData ? 'আপডেট করুন' : 'লক্ষ্য সেট করুন'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}