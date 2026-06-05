import React, { useState, useEffect, useMemo, Component, useRef } from 'react';
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
export default function TransactionModal({ onClose, onSave, categories, initialData, currency, familyMembers, isPremium }: { 
  onClose: () => void, 
  onSave: (t: Omit<Transaction, 'id'>) => void,
  categories: Category[],
  initialData?: Transaction | null,
  currency: string,
  familyMembers?: FamilyMember[],
  isPremium?: boolean
}) {
  const { language } = useAppStore();
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || categories.find(c => c.type === type)?.id || '');
  const [date, setDate] = useState(initialData ? format(parseISO(initialData.date), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [note, setNote] = useState(initialData?.note || '');
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(', ') || '');
  const [familyMemberId, setFamilyMemberId] = useState(initialData?.familyMemberId || '');
  const [isScanning, setIsScanning] = useState(false);
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);
  const [foreignCurrency, setForeignCurrency] = useState('');
  const [foreignAmount, setForeignAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isFetchingRate, setIsFetchingRate] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const symbolToIso: Record<string, string> = {
    '৳': 'BDT',
    '$': 'USD',
    '€': 'EUR',
    '£': 'GBP',
    '₹': 'INR',
    '¥': 'JPY',
    '₽': 'RUB',
    'د.إ': 'AED',
    'ر.س': 'SAR'
  };

  const commonCurrencies = [
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'GBP', name: 'British Pound (£)' },
    { code: 'SAR', name: 'Saudi Riyal (ر.س)' },
    { code: 'AED', name: 'UAE Dirham (د.إ)' },
    { code: 'INR', name: 'Indian Rupee (₹)' },
    { code: 'SGD', name: 'Singapore Dollar (S$)' },
    { code: 'MYR', name: 'Malaysian Ringgit (RM)' },
  ];

  useEffect(() => {
    let abortController: AbortController | null = null;
    
    if (foreignCurrency && foreignAmount) {
      const getRate = async () => {
        setIsFetchingRate(true);
        abortController = new AbortController();
        try {
          const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${foreignCurrency}`, {
            signal: abortController.signal
          });
          const data = await res.json();
          const baseIso = symbolToIso[currency] || 'BDT'; // fallback to BDT
          const rate = data.rates[baseIso];
          if (rate) {
            setExchangeRate(rate);
            const converted = (Number(foreignAmount) * rate).toFixed(2);
            setAmount(converted);
          }
        } catch (e: any) {
          if (e.name !== 'AbortError') {
            console.error("Exchange rate fetch error", e);
          }
        } finally {
          if (abortController && !abortController.signal.aborted) {
            setIsFetchingRate(false);
          }
        }
      };
      
      const timeoutId = setTimeout(getRate, 500); // debounce API call
      return () => {
        clearTimeout(timeoutId);
        if (abortController) {
          abortController.abort();
        }
      };
    } else if (!foreignCurrency) {
      setExchangeRate(null);
    }
  }, [foreignCurrency, foreignAmount, currency]);

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPremium) {
      e.preventDefault();
      setShowPremiumPrompt(true);
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      // Compress image before sending (Canvas API)
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;
            const maxDim = 1200; 
            if (width > height && width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject('No canvas context');
            ctx.drawImage(img, 0, 0, width, height);
            
            let quality = 0.8;
            let dataUrl = canvas.toDataURL('image/jpeg', quality);
            
            while (dataUrl.length > 500000 && quality > 0.1) {
              quality -= 0.1;
              dataUrl = canvas.toDataURL('image/jpeg', quality);
            }
            resolve(dataUrl.split(',')[1]);
          };
          img.onerror = reject;
        };
        reader.onerror = reject;
      });
      const mimeType = "image/jpeg";

      const prompt = "Analyze this receipt/memo image. Extract the total amount, a brief description of what was bought or the store name as note, and the date.";

      const token = await import('../../firebase').then(m => m.auth.currentUser?.getIdToken());
      const aiResponse = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          model: 'gemini-3-flash-preview',
          contents: { parts: [
            { text: prompt },
            { inlineData: { data: base64Data, mimeType } }
          ]},
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                amount: { type: Type.NUMBER, description: "Total amount" },
                note: { type: Type.STRING, description: "Brief description of what was bought or the store name" },
                date: { type: Type.STRING, description: "Date in YYYY-MM-DD format if visible" }
              },
              required: ["amount", "note"]
            }
          }
        })
      });
      
      if (!aiResponse.ok) {
        const errorData = await aiResponse.json().catch(() => ({}));
        throw new Error(`Failed to fetch AI response: ${errorData.error || ''} ${errorData.details || ''}`);
      }
      
      const response = await aiResponse.json();

      const text = response.text || "{}";
      const data = JSON.parse(text);

      if (isMounted.current) {
        if (data.amount) setAmount(data.amount.toString());
        if (data.note) setNote(data.note);
        if (data.date) {
          const currentTime = format(new Date(), "'T'HH:mm");
          setDate(data.date + currentTime);
        }
        setType('expense'); // Receipts are usually expenses
      }

    } catch (err: any) {
      console.error("Receipt scan error:", err);
      if (isMounted.current) {
        if (err?.message?.includes('API key not valid') || err?.message?.includes('API_KEY_INVALID') || err?.message?.includes('API key is not configured')) {
          alert(language === 'bn' ? "আপনার দেওয়া Gemini API Key সঠিক নয়। অনুগ্রহ করে Settings > Secrets-এ গিয়ে সঠিক API Key প্রদান করুন।" : "Invalid API Key. Please provide a valid Gemini API Key in Settings > Secrets.");
        } else {
          alert("রসিদ স্ক্যান করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
        }
      }
    } finally {
      if (isMounted.current) {
        setIsScanning(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert("দয়া করে একটি সঠিক বা ধনাত্মক পরিমাণ লিখুন।");
      return;
    }
    if (!categoryId) {
      alert("দয়া করে একটি ক্যাটাগরি নির্বাচন করুন।");
      return;
    }
    
    const newTx: any = {
      amount: numAmount,
      type,
      categoryId,
      date: new Date(date).toISOString(),
    };
    if (note) newTx.note = note;
    if (tagsInput) {
      newTx.tags = tagsInput.split(',').map(t => t.trim()).filter(t => t !== '');
    }
    if (familyMemberId) newTx.familyMemberId = familyMemberId;

    onSave(newTx as Omit<Transaction, 'id'>);
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/50 transform-gpu">
      <div className="flex min-h-full items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: 'tween', duration: 0.2 }}
          className="bg-white dark:bg-[#111827] w-full max-w-lg rounded-[40px] shadow-sm relative overflow-hidden my-8 transform-gpu will-change-transform"
        >
          <div className="bg-blue-600 p-8 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-xl transition-all">
            <X className="w-6 h-6" />
          </button>
          <h3 className="text-2xl font-bold mb-6">{initialData ? 'লেনদেন এডিট করুন' : 'নতুন লেনদেন'}</h3>
          <div className="flex bg-white/10 p-1 rounded-2xl">
            <button 
              onClick={() => { setType('expense'); setCategoryId(categories.find(c => c.type === 'expense')?.id || ''); }}
              className={cn(
                "flex-1 py-2.5 rounded-xl font-bold transition-all",
                type === 'expense' ? "bg-white text-blue-600 shadow-lg" : "text-blue-100 hover:text-white"
              )}
            >
              ব্যয় (Expense)
            </button>
            <button 
              onClick={() => { setType('income'); setCategoryId(categories.find(c => c.type === 'income')?.id || ''); }}
              className={cn(
                "flex-1 py-2.5 rounded-xl font-bold transition-all",
                type === 'income' ? "bg-white text-blue-600 shadow-lg" : "text-blue-100 hover:text-white"
              )}
            >
              আয় (Income)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <AnimatePresence>
            {showPremiumPrompt && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-900/50 mb-6 relative overflow-hidden"
              >
                <button onClick={() => setShowPremiumPrompt(false)} type="button" className="absolute top-2 right-2 p-2 text-yellow-600 dark:text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 rounded-full">
                  <X className="w-5 h-5" />
                </button>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex-shrink-0 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-yellow-900 dark:text-yellow-500 mb-1">
                      {language === 'bn' ? 'প্রিমিয়াম এআই স্ক্যানার' : 'Premium AI Scanner'}
                    </h4>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200/80 mb-3">
                      {language === 'bn' 
                        ? 'অটোমেটিক বিল বা রসিদ যুক্ত করতে প্রিমিয়াম আপগ্রেড করুন। জেমিনি এআই আপনার খরচের বিবরণ বের করে আনবে।' 
                        : 'Upgrade to Premium to automatically scan receipts and bills. Gemini AI will extract all details.'}
                    </p>
                    <button type="button" className="text-sm font-bold bg-yellow-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600 active:scale-95 transition-all shadow-sm">
                      {language === 'bn' ? 'প্রিমিয়াম আনলক করুন' : 'Unlock Premium'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!initialData && (
            <div className="flex justify-center mb-6">
              <label className={cn(
                "relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-3xl transition-all cursor-pointer group overflow-hidden",
                isScanning 
                  ? "border-blue-400 bg-blue-50 dark:border-blue-500/50 dark:bg-blue-900/20" 
                  : "border-blue-200 bg-blue-50/50 hover:bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/10 dark:hover:bg-blue-900/20"
              )}>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  className="hidden" 
                  onChange={handleScanReceipt}
                  disabled={isScanning}
                />
                {isScanning ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">রসিদ স্ক্যান করা হচ্ছে...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform shadow-sm">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400 block mb-1">এআই রসিদ স্ক্যানার</span>
                      <span className="text-xs text-gray-600 dark:text-gray-300">রসিদ বা মেমোর ছবি আপলোড করুন</span>
                    </div>
                  </div>
                )}
              </label>
            </div>
          )}

          <div className="w-full text-center rounded-3xl bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 flex flex-col items-center overflow-hidden box-border">
            <div className="flex justify-between items-center w-full mb-4">
               <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">পরিমাণ লিখুন</p>
               <button 
                  type="button" 
                  onClick={() => {
                     if (foreignCurrency) {
                        setForeignCurrency('');
                        setForeignAmount('');
                     } else {
                        setForeignCurrency('USD');
                     }
                  }} 
                  className="text-xs font-bold px-3 py-1.5 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 whitespace-nowrap"
               >
                  {foreignCurrency ? 'ট্রাভেল মোড বন্ধ করুন' : '✈️ ট্রাভেল মোড (Travel Mode)'}
               </button>
            </div>
            
            {foreignCurrency ? (
               <div className="w-full text-left">
                 <div className="flex flex-col md:flex-row gap-3 w-full">
                    <select 
                      value={foreignCurrency} 
                      onChange={e => setForeignCurrency(e.target.value)} 
                      className="w-full md:w-auto bg-white dark:bg-gray-700 font-bold border-none rounded-2xl text-base sm:text-lg focus:ring-2 focus:ring-blue-500 py-3 sm:py-4 px-3 sm:px-4 shadow-sm min-w-0"
                    >
                      {commonCurrencies.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                    <input 
                      type="number" step="any" min="0.01" 
                      value={foreignAmount} onChange={e => setForeignAmount(e.target.value)}
                      placeholder="0.00" autoFocus
                      className="flex-1 w-full text-3xl sm:text-4xl font-bold border-none rounded-2xl focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300 dark:placeholder:text-gray-600 bg-white dark:bg-gray-700 dark:text-white py-3 sm:py-4 px-3 sm:px-4 text-center md:text-left shadow-sm min-w-0 box-border"
                    />
                 </div>
                 <div className="flex flex-col mt-4 p-4 bg-white dark:bg-[#111827] rounded-2xl w-full">
                    <div className="flex justify-between items-center mb-1 text-xs sm:text-sm text-gray-500">
                      <span className="truncate mr-2">এক্সচেঞ্জ রেট: {exchangeRate ? `1 ${foreignCurrency} = ${exchangeRate.toFixed(2)} ${symbolToIso[currency] || 'BDT'}` : (isFetchingRate ? 'লোড হচ্ছে...' : '--')}</span>
                      <span className="whitespace-nowrap">{currency} তে মোট</span>
                    </div>
                    <div className="text-right">
                      {isFetchingRate ? (
                         <Loader2 className="w-5 h-5 animate-spin ml-auto text-blue-500" />
                      ) : (
                         <span className="text-2xl sm:text-3xl font-black text-blue-600">{currency} {amount || '0.00'}</span>
                      )}
                    </div>
                 </div>
               </div>
            ) : (
                <div className="flex items-center justify-center gap-2 mt-2 w-full max-w-full">
                  <span className="text-3xl font-bold text-gray-400 dark:text-gray-500 shrink-0">{currency}</span>
                  <input 
                    type="number"
                    step="any"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required={!foreignCurrency}
                    placeholder="0.00"
                    className="text-4xl sm:text-5xl font-bold w-full max-w-[200px] text-center border-none focus:ring-0 placeholder:text-gray-200 dark:placeholder:text-gray-700 bg-transparent dark:text-white min-w-0"
                    autoFocus
                  />
                </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">ক্যাটাগরি</label>
              <select 
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-4 bg-gray-50 dark:bg-gray-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {categories.filter(c => c.type === type).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">তারিখ ও সময়</label>
              <input 
                type="datetime-local" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-4 bg-gray-50 dark:bg-gray-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          {familyMembers && familyMembers.length > 0 && (
            <div>
              <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">ফ্যামিলি মেম্বার (ঐচ্ছিক)</label>
              <select 
                value={familyMemberId}
                onChange={(e) => setFamilyMemberId(e.target.value)}
                className="w-full p-4 bg-gray-50 dark:bg-gray-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="">-- কেউ না --</option>
                {familyMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.relation})</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">নোট (ঐচ্ছিক)</label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="লেনদেন সম্পর্কে কিছু লিখুন..."
              className="w-full p-4 bg-gray-50 dark:bg-gray-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-medium h-24 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">ট্যাগস (কমা দিয়ে লিখুন - ঐচ্ছিক)</label>
            <input 
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="যেমন: office, lunch, trip"
              className="w-full p-4 bg-gray-50 dark:bg-gray-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-bold text-lg shadow-sm shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all active:scale-[0.98]"
          >
            {initialData ? 'আপডেট করুন' : 'সেভ করুন'}
          </button>
        </form>
        </motion.div>
      </div>
    </div>
  );
}