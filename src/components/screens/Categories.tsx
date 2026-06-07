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
export default function Categories({ 
  categories, 
  onAdd,
  onUpdate,
  onDelete,
  initialCategoryToEdit,
  onModalClose,
  isDarkMode
}: { 
  categories: Category[], 
  onAdd: (c: Omit<Category, 'id'>) => void,
  onUpdate: (c: Category) => void,
  onDelete: (id: string) => void,
  initialCategoryToEdit?: Category | null,
  onModalClose?: () => void,
  isDarkMode: boolean
}) {
  const [activeType, setActiveType] = useState<TransactionType>('expense');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Wallet');

  useEffect(() => {
    if (initialCategoryToEdit) {
      setEditingCategory(initialCategoryToEdit);
      setActiveType(initialCategoryToEdit.type);
      setSelectedIcon(initialCategoryToEdit.icon);
      setIsAddModalOpen(true);
    }
  }, [initialCategoryToEdit]);

  const handleSave = (cat: Omit<Category, 'id'>) => {
    if (editingCategory) {
      onUpdate({ ...editingCategory, ...cat });
    } else {
      onAdd(cat);
    }
    setIsAddModalOpen(false);
    setEditingCategory(null);
    onModalClose?.();
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(c => 
      c.type === activeType && 
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, activeType, searchTerm]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">ক্যাটাগরি ম্যানেজমেন্ট</h3>
        <button 
          onClick={() => {
            setEditingCategory(null);
            setSelectedIcon('Wallet');
            setIsAddModalOpen(true);
          }}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          নতুন ক্যাটাগরি
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className={cn(
          "p-1.5 rounded-2xl w-full max-w-md shadow-sm transition-all",
          isDarkMode ? "bg-gray-800" : "bg-white"
        )}>
          <div className="flex">
            <button 
              onClick={() => setActiveType('expense')}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold transition-all",
                activeType === 'expense' ? "bg-blue-600 text-white shadow-md" : (isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-700")
              )}
            >
              ব্যয় (Expense)
            </button>
            <button 
              onClick={() => setActiveType('income')}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold transition-all",
                activeType === 'income' ? "bg-blue-600 text-white shadow-md" : (isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700")
              )}
            >
              আয় (Income)
            </button>
          </div>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="ক্যাটাগরি খুঁজুন..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-2.5 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all",
              isDarkMode ? "bg-gray-800 text-white placeholder-gray-500" : "bg-white text-[#1B2559]"
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredCategories.map(cat => (
            <motion.div 
              key={cat.id} 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "p-6 rounded-[24px] shadow-sm border flex items-center justify-between group transition-all",
                isDarkMode ? "bg-gray-800 border-gray-700 hover:bg-gray-700" : "bg-white border-gray-50 hover:shadow-md"
              )}
            >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                <IconComponent name={cat.icon} className="w-7 h-7" />
              </div>
              <p className={cn("font-bold text-lg", isDarkMode ? "text-white" : "text-[#1B2559]")}>{cat.name}</p>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
              {!cat.isDefault ? (
                <>
                  <button 
                    onClick={() => { 
                      setEditingCategory(cat); 
                      setSelectedIcon(cat.icon);
                      setIsAddModalOpen(true); 
                    }}
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      isDarkMode ? "hover:bg-gray-600 text-blue-400" : "hover:bg-blue-50 text-blue-600"
                    )}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(cat.id)}
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      isDarkMode ? "hover:bg-gray-600 text-red-400" : "hover:bg-red-50 text-red-600"
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <span className="text-xs font-bold px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg dark:bg-gray-700 dark:text-gray-400">ডিফল্ট</span>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
        {filteredCategories.length === 0 && (
          <div className="col-span-full text-center py-20">
            <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4",
              isDarkMode ? "bg-gray-800 text-gray-600" : "bg-gray-100 text-gray-400"
            )}>
              <Search className="w-10 h-10" />
            </div>
            <p className={cn("font-medium", isDarkMode ? "text-gray-400" : "text-gray-500")}>কোনো ক্যাটাগরি পাওয়া যায়নি</p>
          </div>
        )}
      </div>

      {/* Add/Edit Category Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/50">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn("w-full max-w-md rounded-[40px] p-8 shadow-md my-8", isDarkMode ? "bg-[#111827] text-white" : "bg-white text-[#1B2559]")}
              >
                <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">{editingCategory ? 'ক্যাটাগরি এডিট করুন' : 'নতুন ক্যাটাগরি'}</h3>
                <button onClick={() => { setIsAddModalOpen(false); setEditingCategory(null); onModalClose?.(); }} className={cn("p-2 rounded-xl transition-all", isDarkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-600")}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSave({
                  name: formData.get('name') as string,
                  icon: formData.get('icon') as string,
                  color: formData.get('color') as string,
                  type: activeType
                });
              }} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2">নাম</label>
                  <input name="name" defaultValue={editingCategory?.name} required className={cn("w-full p-4 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-medium", isDarkMode ? "bg-gray-800 text-white placeholder-gray-500" : "bg-gray-50 text-[#1B2559]")} placeholder="ক্যাটাগরির নাম" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">আইকন</label>
                    <input type="hidden" name="icon" value={selectedIcon} />
                    <div className={cn("w-full rounded-2xl p-3 border-none focus-within:ring-2 focus-within:ring-blue-500 overflow-y-auto max-h-48 grid grid-cols-4 gap-2", isDarkMode ? "bg-gray-800" : "bg-gray-50")}>
                      {Object.keys(iconMap).map(icon => (
                        <div 
                          key={icon} 
                          onClick={() => setSelectedIcon(icon)}
                          className={cn(
                            "flex items-center justify-center p-3 rounded-xl cursor-pointer transition-all",
                            selectedIcon === icon ? "bg-blue-600 text-white shadow-md" : (isDarkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-200 text-gray-500")
                          )}
                          title={icon}
                        >
                          <IconComponent name={icon} className="w-5 h-5" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">রঙ</label>
                    <input name="color" type="color" defaultValue={editingCategory?.color || '#3b82f6'} className={cn("w-full h-12 md:h-full p-1 cursor-pointer rounded-2xl border-none focus:ring-2 focus:ring-blue-500", isDarkMode ? "bg-gray-800" : "bg-gray-50")} />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                  সেভ করুন
                </button>
              </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}