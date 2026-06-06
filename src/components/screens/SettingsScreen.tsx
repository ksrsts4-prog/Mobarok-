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
import { cn, hashPin } from '../../lib/utils';
import { Type } from '@google/genai';
import { useAppStore } from '../../store/useAppStore';
import AboutScreen from '../AboutScreen';
import { Transaction, Category, Budget, TransactionType, SavingsGoal, RecurringTransaction, Debt, FamilyMember, Investment, Bill, SystemFeatures } from '../../types';
import { DEFAULT_CATEGORIES } from '../../constants';



// --- Dashboard Screen ---
// --- Transactions Screen ---
// --- Summary Screen ---
// --- Categories Screen ---
// --- Budgets Screen ---
// --- Transaction Modal ---

export default function SettingsScreen({ 
  currency, 
  setCurrency, 
  isDarkMode,
  setIsDarkMode,
  userPhoto,
  setUserPhoto,
  userName,
  setUserName,
  userEmail,
  setUserEmail,
  userPhone,
  setUserPhone,
  userOccupation,
  setUserOccupation,
  userAddress,
  setUserAddress,
  language,
  setLanguage,
  defaultTransactionType,
  setDefaultTransactionType,
  weekStartDay,
  setWeekStartDay,
  isBiometricEnabled,
  setIsBiometricEnabled,
  pinCode,
  setPinCode,
  accentColor,
  setAccentColor,
  showDecimals,
  setShowDecimals,
  autoBackup,
  setAutoBackup,
  aiInstructions,
  setAiInstructions,
  onImport, 
  onReset,
  onLogout,
  onLogoutOtherDevices,
  onDeleteAccount,
  onSubmitFeedback,
  userFeedback,
  transactions,
  categories,
  budgets,
  savingsGoals,
  features,
  lastBackupTime,
  isPremium,
  setIsPremium,
  deferredPrompt,
  handleInstallClick
}: { 
  currency: string, 
  setCurrency: (c: string) => void,
  isDarkMode: boolean,
  setIsDarkMode: (d: boolean) => void,
  userPhoto: string | null,
  setUserPhoto: (p: string | null) => void,
  userName: string,
  setUserName: (n: string) => void,
  userEmail: string,
  setUserEmail: (e: string) => void,
  userPhone: string,
  setUserPhone: (p: string) => void,
  userOccupation: string,
  setUserOccupation: (o: string) => void,
  userAddress: string,
  setUserAddress: (a: string) => void,
  language: 'bn' | 'en',
  setLanguage: (l: 'bn' | 'en') => void,
  defaultTransactionType: 'income' | 'expense',
  setDefaultTransactionType: (t: 'income' | 'expense') => void,
  weekStartDay: 'sunday' | 'monday',
  setWeekStartDay: (d: 'sunday' | 'monday') => void,
  isBiometricEnabled: boolean,
  setIsBiometricEnabled: (b: boolean) => void,
  pinCode: string | null,
  setPinCode: (p: string | null) => void,
  accentColor: string,
  setAccentColor: (c: string) => void,
  showDecimals: boolean,
  setShowDecimals: (b: boolean) => void,
  autoBackup: boolean,
  setAutoBackup: (b: boolean) => void,
  aiInstructions: string,
  setAiInstructions: (i: string) => void,
  onImport: (data: any) => void,
  onReset: () => void,
  onLogout: () => void,
  onLogoutOtherDevices: () => void,
  onDeleteAccount: () => void,
  onSubmitFeedback: (m: string) => void,
  userFeedback: any[],
  transactions: any[],
  categories: any[],
  budgets: any[],
  savingsGoals: any[],
  features: SystemFeatures,
  lastBackupTime: string | null,
  isPremium: boolean,
  setIsPremium: (v: boolean) => void,
  deferredPrompt: any,
  handleInstallClick: () => void
}) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [tempPhoto, setTempPhoto] = useState<string | null>(userPhoto || null);
  const [tempEmail, setTempEmail] = useState(userEmail);
  const [tempPhone, setTempPhone] = useState(userPhone);
  const [tempOccupation, setTempOccupation] = useState(userOccupation);
  const [tempAddress, setTempAddress] = useState(userAddress);
  const [feedback, setFeedback] = useState('');
  const [copied, setCopied] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLogoutOtherConfirm, setShowLogoutOtherConfirm] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [showPinRemoveConfirm, setShowPinRemoveConfirm] = useState(false);
  const [tempPin, setTempPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<1 | 2>(1);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'lifetime'>('lifetime');
  const [trxId, setTrxId] = useState('');

  const appUrl = "https://ais-pre-rvndkyvyy7wahac4gkadty-796971235730.asia-southeast1.run.app";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ব্যয় ট্র্যাকার (Expense Tracker)',
          text: 'আমার তৈরি নতুন ব্যয় ট্র্যাকার অ্যাপটি ব্যবহার করে দেখুন। এটি আপনার আয়-ব্যয়ের হিসাব রাখা অনেক সহজ করে দেবে।',
          url: appUrl,
        });
      } catch (error: any) {
        if (error.name !== 'AbortError' && !error.message?.includes('Share canceled')) {
          console.error('Error sharing:', error);
        }
      }
    } else {
      navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExport = () => {
    const data = { 
      transactions, categories, budgets, savingsGoals, currency, 
      userName, userEmail, userPhone, userOccupation, userAddress, language, defaultTransactionType, 
      weekStartDay, isBiometricEnabled 
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expense_tracker_backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
  };

  const handleNextPaymentStep = () => {
    setPaymentStep(2);
  };

  const handleUpgradePremium = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (trxId.length < 5) {
      alert(language === 'bn' ? 'সঠিক Transaction ID দিন।' : 'Enter a valid Transaction ID.');
      return;
    }
    setIsProcessingPayment(true);
    // Simulate payment verification flow
    setTimeout(async () => {
      try {
        if (auth.currentUser) {
          const token = await auth.currentUser.getIdToken();
          const res = await fetch('/api/upgrade-premium', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data?.error || 'Failed to upgrade via server');
        }
        setIsPremium(true);
        alert(language === 'bn' ? 'অভিনন্দন! আপনার পেমেন্ট সফলভাবে যাচাই করা হয়েছে।' : 'Congratulations! Your payment has been verified.');
        setShowPremiumModal(false);
        setPaymentStep(1);
        setTrxId('');
      } catch (e: any) {
        alert(e.message || (language === 'bn' ? 'অ্যাডমিন অনুমতি প্রয়োজন অথবা ট্রানজ্যাকশন আইডি ভুল!' : 'Admin permission required or invalid Transaction ID!'));
        console.warn('Upgrade error:', e);
      } finally {
        setIsProcessingPayment(false);
      }
    }, 2000);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Note'];
    const rows = transactions.map(t => [
      format(parseISO(t.date), 'yyyy-MM-dd HH:mm'),
      t.type === 'income' ? 'Income' : 'Expense',
      categories.find(c => c.id === t.categoryId)?.name || 'Unknown',
      t.amount,
      t.note || ''
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expense_tracker_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const handleExportExcel = () => {
    const tableData = transactions.map(t => ({
      Date: format(parseISO(t.date), 'yyyy-MM-dd HH:mm'),
      Type: t.type.toUpperCase(),
      Category: categories.find(c => c.id === t.categoryId)?.name || 'Unknown',
      Amount: t.amount,
      Note: t.note || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, `expense_tracker_report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    await exportToPDF(
      transactions,
      categories,
      language,
      currency
    );
    setIsExporting(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিত যে আপনি এই ডাটা ইমপোর্ট করতে চান? এটি আপনার বর্তমান ডাটা ওভাররাইট করতে পারে।' : 'Are you sure you want to import this data? It may overwrite your current data.')) {
          onImport(data);
          alert(language === 'bn' ? 'ডাটা সফলভাবে ইমপোর্ট করা হয়েছে!' : 'Data imported successfully!');
        }
      } catch (err) {
        alert(language === 'bn' ? 'ভুল ফাইল ফরম্যাট! দয়া করে সঠিক JSON ফাইল সিলেক্ট করুন।' : 'Invalid file format! Please select a valid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        const rows = csvText.split('\\n').filter(row => row.trim().length > 0);
        
        if (rows.length < 2) throw new Error("Empty CSV");

        // Assuming headers are: Date, Type, Category, Amount, Note
        const newTransactions = rows.slice(1).map(row => {
          const cols = row.split(',');
          if (cols.length < 4) return null;
          
          const date = new Date(cols[0]).toISOString();
          const type = cols[1].trim().toLowerCase() === 'income' ? 'income' : 'expense';
          const catName = cols[2].trim();
          const amount = parseFloat(cols[3]);
          const note = cols[4] ? cols[4].trim() : '';

          let catId = categories.find(c => c.name === catName)?.id;
          if (!catId) {
            catId = categories.find(c => c.type === type)?.id || '';
          }

          if (isNaN(amount) || amount <= 0) return null;

          return {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            date,
            type,
            categoryId: catId,
            amount,
            note
          };
        }).filter(Boolean);

        if (newTransactions.length > 0) {
          if (window.confirm(language === 'bn' ? `আপনি কি ${newTransactions.length} টি লেনদেন ইমপোর্ট করতে চান?` : `Are you sure you want to import ${newTransactions.length} transactions?`)) {
            const data = { transactions: [...transactions, ...newTransactions] };
            onImport(data);
            alert(language === 'bn' ? 'CSV ডাটা সফলভাবে ইমপোর্ট করা হয়েছে!' : 'CSV data imported successfully!');
          }
        } else {
           alert(language === 'bn' ? 'কোনো সঠিক লেনদেন পাওয়া যায়নি।' : 'No valid transactions found.');
        }

      } catch (err) {
        alert(language === 'bn' ? 'ভুল ফাইল ফরম্যাট! দয়া করে সঠিক CSV ফাইল সিলেক্ট করুন।' : 'Invalid file format! Please select a valid CSV file.');
      }
    };
    reader.readAsText(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit check before processing
         alert("Image size should be less than 5MB");
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 256;
          const MAX_HEIGHT = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setTempPhoto(dataUrl);
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  if (isEditingProfile) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="max-w-2xl mx-auto pb-24 pt-6 px-4 min-h-[90vh] relative"
      >
        <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#e8dffd] to-transparent dark:from-purple-900/30 -z-10 pointer-events-none" />

        <div className="flex items-center justify-center relative mb-12">
           <button onClick={() => setIsEditingProfile(false)} className="absolute left-0 w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-800 dark:text-gray-200 shadow-sm">
             <ChevronLeft className="w-5 h-5" />
           </button>
           <h2 className="text-xl font-bold">{language === 'bn' ? 'প্রোফাইল এডিট করুন' : 'Edit profile'}</h2>
        </div>

        <div className="flex justify-center mb-10">
          <div className="relative">
             <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-[#111827] shadow-sm flex items-center justify-center overflow-hidden">
                {tempPhoto ? (
                   <img src={tempPhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                   <User className="w-12 h-12 text-gray-300" />
                )}
             </div>
             <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#8c52ff] border-2 border-white dark:border-[#111827] text-white flex items-center justify-center shadow-md cursor-pointer">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
             </label>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] rounded-[32px] p-6 shadow-sm space-y-5">
           <div className="flex gap-4">
              <div className="flex-1">
                 <label className="text-xs font-bold text-gray-600 mb-2 block ml-2">{language === 'bn' ? 'First name' : 'First name'}</label>
                 <input 
                   className="w-full bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-[#8c52ff]" 
                   value={tempName.split(' ')[0] || ''}
                   onChange={(e) => {
                     const parts = tempName.split(' ');
                     parts[0] = e.target.value;
                     setTempName(parts.join(' '));
                   }}
                 />
              </div>
              <div className="flex-1">
                 <label className="text-xs font-bold text-gray-500 mb-2 block ml-2">{language === 'bn' ? 'Last name' : 'Last name'}</label>
                 <input 
                   className="w-full bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-[#8c52ff]" 
                   value={tempName.split(' ').slice(1).join(' ') || ''}
                   onChange={(e) => {
                     const first = tempName.split(' ')[0] || '';
                     setTempName(first + (e.target.value ? ' ' + e.target.value : ''));
                   }}
                 />
              </div>
           </div>
           <div>
              <label className="text-xs font-bold text-gray-500 mb-2 block ml-2">{language === 'bn' ? 'ইমেইল (Email)' : 'Email'}</label>
              <input 
                 type="email" 
                 className="w-full bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-[#8c52ff] text-gray-500" 
                 value={tempEmail}
                 onChange={(e) => setTempEmail(e.target.value)}
              />
           </div>
           <div>
              <label className="text-xs font-bold text-gray-500 mb-2 block ml-2">{language === 'bn' ? 'ফোন নম্বর (Phone Number)' : 'Phone Number'}</label>
              <input 
                 type="tel" 
                 placeholder="+8801XXXXXXXXX"
                 className="w-full bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-[#8c52ff]" 
                 value={tempPhone}
                 onChange={(e) => setTempPhone(e.target.value)}
              />
           </div>
           <div>
              <label className="text-xs font-bold text-gray-500 mb-2 block ml-2">{language === 'bn' ? 'পেশা (Occupation)' : 'Occupation'}</label>
              <input 
                 type="text" 
                 className="w-full bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-[#8c52ff]" 
                 value={tempOccupation}
                 onChange={(e) => setTempOccupation(e.target.value)}
              />
           </div>
           <div>
              <label className="text-xs font-bold text-gray-500 mb-2 block ml-2">{language === 'bn' ? 'ঠিকানা (Address)' : 'Address'}</label>
              <textarea 
                 rows={2}
                 className="w-full bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-[#8c52ff]" 
                 value={tempAddress}
                 onChange={(e) => setTempAddress(e.target.value)}
              />
           </div>
        </div>

        <div className="mt-16 sm:mt-10 w-full">
           <button 
             onClick={() => {
                setUserName(tempName);
                setUserEmail(tempEmail);
                setUserPhone(tempPhone);
                setUserOccupation(tempOccupation);
                setUserAddress(tempAddress);
                setUserPhoto(tempPhoto);
                setIsEditingProfile(false);
             }}
             className="w-full bg-[#8c52ff] hover:bg-[#7b46e3] text-white py-4 rounded-[32px] font-bold text-lg shadow-lg shadow-purple-500/20 transition-all"
           >
             {language === 'bn' ? 'আপডেট করুন (Update)' : 'Update Profile'}
           </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto space-y-6 pb-12 pt-6 px-4 relative"
    >
      <div className="fixed top-0 left-0 right-0 h-80 bg-gradient-to-b from-[#e8dffd] to-transparent dark:from-purple-900/30 -z-10 pointer-events-none" />

      {/* Profile Card */}
      <div className="bg-white dark:bg-[#111827] rounded-[32px] p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
             {userPhoto ? (
               <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
             ) : (
               <User className="w-6 h-6 text-gray-400" />
             )}
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
              {userName}
              {features.premiumBadges && isPremium && (
                <ShieldCheck className="w-4 h-4 text-yellow-500 inline ml-1" />
              )}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{userEmail}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsEditingProfile(true)}
          className="px-5 py-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-2xl text-xs transition-colors"
        >
          {language === 'bn' ? 'Edit' : 'Edit'}
        </button>
      </div>

      {/* Premium Banner */}
      <div className="bg-gradient-to-r from-[#a274ff] to-[#7f4ef2] rounded-[32px] p-6 text-white flex flex-col justify-center shadow-lg shadow-purple-500/20 relative overflow-hidden h-28">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
        <div className="flex items-center gap-4 relative z-10 w-full">
          <div className="p-3 bg-white/20 rounded-[20px]">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
             <h3 className="font-bold text-lg">{language === 'bn' ? 'প্রিমিয়াম অ্যাকাউন্ট' : 'Premium Account'}</h3>
             <p className="text-purple-100 text-xs font-medium mt-1">{language === 'bn' ? 'আপনার প্রিমিয়াম ফিচারগুলো উপভোগ করুন' : 'Enjoy your premium features'}</p>
          </div>
        </div>
      </div>


      {/* App Guide / How to use */}
      <div className={cn(
        "p-8 rounded-[40px] shadow-sm border space-y-6 transition-colors duration-300",
        isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-50"
      )}>
        <div className="flex items-center gap-4 mb-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            isDarkMode ? "bg-green-900/30 text-green-400" : "bg-green-50 text-green-600"
          )}>
            <FileText className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-lg">{language === 'bn' ? 'অ্যাপটি কীভাবে ব্যবহার করবেন?' : 'How to use the app?'}</h4>
        </div>
        <div className={cn("space-y-4 text-sm leading-relaxed", isDarkMode ? "text-gray-300" : "text-gray-600")}>
          <p><strong>{language === 'bn' ? '১. নতুন লেনদেন যোগ করা:' : '1. Add new transaction:'}</strong> {language === 'bn' ? 'ড্যাশবোর্ড বা যেকোনো পেজ থেকে' : 'From the dashboard or any page, click the'} <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full mx-1"><Plus className="w-4 h-4" /></span> {language === 'bn' ? 'বাটনে ক্লিক করে আপনার আয় বা ব্যয় যোগ করুন।' : 'button to add your income or expense.'}</p>
          <p><strong>{language === 'bn' ? '২. ক্যাটাগরি তৈরি:' : '2. Create category:'}</strong> {language === 'bn' ? '"ক্যাটাগরি" ট্যাবে গিয়ে আপনি আপনার প্রয়োজন অনুযায়ী নতুন ক্যাটাগরি তৈরি করতে পারবেন।' : 'Go to the "Categories" tab to create new categories according to your needs.'}</p>
          <p><strong>{language === 'bn' ? '৩. বাজেট সেট করা:' : '3. Set budget:'}</strong> {language === 'bn' ? '"বাজেট" ট্যাবে গিয়ে নির্দিষ্ট ক্যাটাগরির জন্য মাসিক বাজেট সেট করুন। বাজেট অতিক্রম করলে অ্যাপ আপনাকে সতর্ক করবে।' : 'Go to the "Budgets" tab to set a monthly budget for specific categories. The app will alert you if you exceed the budget.'}</p>
          <p><strong>{language === 'bn' ? '৪. সঞ্চয় লক্ষ্য:' : '4. Savings goal:'}</strong> {language === 'bn' ? '"সঞ্চয় লক্ষ্য" ট্যাবে গিয়ে আপনার ভবিষ্যৎ পরিকল্পনার জন্য টাকা জমানোর লক্ষ্য নির্ধারণ করুন এবং অগ্রগতি ট্র্যাক করুন।' : 'Go to the "Savings Goals" tab to set a goal for saving money for your future plans and track your progress.'}</p>
          <p><strong>{language === 'bn' ? '৫. অফলাইন ব্যবহার:' : '5. Offline use:'}</strong> {language === 'bn' ? 'ইন্টারনেট না থাকলেও আপনি অ্যাপটি ব্যবহার করতে পারবেন। ইন্টারনেট কানেকশন এলে ডাটা স্বয়ংক্রিয়ভাবে সিঙ্ক হয়ে যাবে।' : 'You can use the app even without the internet. Data will automatically sync when the internet connection is restored.'}</p>
        </div>
      </div>

      {/* General Preferences */}
      <div className={cn(
        "p-8 rounded-[40px] shadow-sm border space-y-6 transition-colors duration-300",
        isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-50"
      )}>
        <div className="flex items-center gap-4 mb-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            isDarkMode ? "bg-indigo-900/30 text-indigo-400" : "bg-indigo-50 text-indigo-600"
          )}>
            <LayoutGrid className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-lg">{language === 'bn' ? 'সাধারণ পছন্দসমূহ' : 'General Preferences'}</h4>
        </div>

        <div className="space-y-6">
          {/* API Key Selection */}
          {(window as any).aistudio && (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">{language === 'bn' ? 'এআই এপিআই কী (AI API Key)' : 'AI API Key'}</p>
                <p className={cn("text-xs", isDarkMode ? "text-gray-400" : "text-gray-500")}>
                  {language === 'bn' ? 'আপনার নিজস্ব জেমিনি এপিআই কী সেট করুন।' : 'Set your own Gemini API key.'}
                </p>
              </div>
              <button 
                onClick={async () => {
                  try {
                    if ((window as any).aistudio?.openSelectKey) {
                      await (window as any).aistudio.openSelectKey();
                      alert(language === 'bn' ? 'এপিআই কী সফলভাবে সেট করা হয়েছে!' : 'API Key set successfully!');
                    }
                  } catch (e) {
                    console.error("Error opening API key selection:", e);
                  }
                }}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                  isDarkMode ? "bg-gray-800 text-blue-400 hover:bg-gray-700" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                )}
              >
                {language === 'bn' ? 'কী সেট করুন' : 'Set Key'}
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">{language === 'bn' ? 'ডিফল্ট লেনদেনের ধরন' : 'Default Transaction Type'}</p>
              <p className={cn("text-xs", isDarkMode ? "text-gray-400" : "text-gray-500")}>{language === 'bn' ? 'নতুন লেনদেন যোগ করার সময় ডিফল্ট সিলেকশন।' : 'Default selection when adding a new transaction.'}</p>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setDefaultTransactionType('expense')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  defaultTransactionType === 'expense' ? "bg-white text-red-600 shadow-sm" : "text-gray-500"
                )}
              >
                {language === 'bn' ? 'ব্যয়' : 'Expense'}
              </button>
              <button 
                onClick={() => setDefaultTransactionType('income')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  defaultTransactionType === 'income' ? "bg-white text-green-600 shadow-sm" : "text-gray-500"
                )}
              >
                {language === 'bn' ? 'আয়' : 'Income'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">{language === 'bn' ? 'সপ্তাহ শুরু' : 'Week Starts On'}</p>
              <p className={cn("text-xs", isDarkMode ? "text-gray-400" : "text-gray-500")}>{language === 'bn' ? 'ক্যালেন্ডার এবং রিপোর্টে সপ্তাহের প্রথম দিন।' : 'First day of the week in calendar and reports.'}</p>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setWeekStartDay('sunday')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  weekStartDay === 'sunday' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
                )}
              >
                {language === 'bn' ? 'রবিবার' : 'Sunday'}
              </button>
              <button 
                onClick={() => setWeekStartDay('monday')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  weekStartDay === 'monday' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
                )}
              >
                {language === 'bn' ? 'সোমবার' : 'Monday'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">{language === 'bn' ? 'দশমিক সংখ্যা দেখান' : 'Show Decimals'}</p>
              <p className={cn("text-xs", isDarkMode ? "text-gray-400" : "text-gray-500")}>{language === 'bn' ? 'টাকার অংকে দশমিকের পরের অংশ দেখাবে কি না।' : 'Whether to show decimals in amounts.'}</p>
            </div>
            <button 
              onClick={() => setShowDecimals(!showDecimals)}
              className={cn(
                "w-12 h-6 rounded-full transition-all relative",
                showDecimals ? "bg-blue-600" : "bg-gray-300"
              )}
            >
              <div className={cn(
                "w-4 h-4 bg-white rounded-full absolute top-1 transition-all",
                showDecimals ? "right-1" : "left-1"
              )} />
            </button>
          </div>
        </div>
      </div>

      {/* Appearance & Language */}
      <div className={cn(
        "p-8 rounded-[40px] shadow-sm border space-y-6 transition-colors duration-300",
        isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-50"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              isDarkMode ? "bg-yellow-900/30 text-yellow-500" : "bg-yellow-50 text-yellow-600"
            )}>
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="font-bold text-lg">{language === 'bn' ? 'ডার্ক মোড' : 'Dark Mode'}</h4>
              <p className={cn("text-sm", isDarkMode ? "text-gray-400" : "text-gray-500")}>{language === 'bn' ? 'অ্যাপের থিম পরিবর্তন করুন।' : 'Change the app theme.'}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={cn(
              "w-14 h-8 rounded-full relative transition-all duration-300",
              isDarkMode ? "bg-blue-600" : "bg-gray-200"
            )}
          >
            <div className={cn(
              "absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300",
              isDarkMode ? "left-7" : "left-1"
            )} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              isDarkMode ? "bg-blue-900/30 text-blue-400" : "bg-blue-50 text-blue-600"
            )}>
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-lg">{language === 'bn' ? 'অ্যাপ কালার' : 'App Color'}</h4>
              <p className={cn("text-sm", isDarkMode ? "text-gray-400" : "text-gray-500")}>{language === 'bn' ? 'আপনার পছন্দের কালার বেছে নিন।' : 'Choose your favorite color.'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {['blue', 'purple', 'green', 'rose'].map((color) => (
              <button
                key={color}
                onClick={() => setAccentColor(color)}
                style={{ backgroundColor: color === 'blue' ? '#3b82f6' : color === 'purple' ? '#a855f7' : color === 'green' ? '#22c55e' : '#f43f5e' }}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-all",
                  accentColor === color ? "border-white scale-110 shadow-md" : "border-transparent opacity-50"
                )}
              />
            ))}
          </div>
        </div>

        <hr className={isDarkMode ? "border-gray-800" : "border-gray-100"} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              isDarkMode ? "bg-purple-900/30 text-purple-400" : "bg-purple-50 text-purple-600"
            )}>
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-lg">{language === 'bn' ? 'ভাষা (Language)' : 'Language'}</h4>
              <p className={cn("text-sm", isDarkMode ? "text-gray-400" : "text-gray-500")}>{language === 'bn' ? 'অ্যাপের ভাষা পরিবর্তন করুন।' : 'Change the app language.'}</p>
            </div>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setLanguage('bn')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                language === 'bn' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
              )}
            >
              বাংলা
            </button>
            <button 
              onClick={() => setLanguage('en')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                language === 'en' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
              )}
            >
              English
            </button>
          </div>
        </div>
      </div>

      {/* Currency Settings */}
      {features.multiCurrency && (
        <div className={cn(
          "p-8 rounded-[40px] shadow-sm border space-y-6 transition-colors duration-300",
          isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-50"
        )}>
          <div className="flex items-center gap-4 mb-2">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              isDarkMode ? "bg-blue-900/30 text-blue-400" : "bg-blue-50 text-blue-600"
            )}>
              <Globe className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-lg">{language === 'bn' ? 'মুদ্রা (Currency)' : 'Currency'}</h4>
          </div>
          <p className={cn("text-sm", isDarkMode ? "text-gray-400" : "text-gray-500")}>{language === 'bn' ? 'আপনার পছন্দের মুদ্রা চিহ্ন নির্বাচন করুন যা পুরো অ্যাপে ব্যবহৃত হবে।' : 'Select your preferred currency symbol to be used throughout the app.'}</p>
          <div className="flex flex-wrap gap-3">
            {['৳', '$', '€', '£', '₹', '¥', 'SAR', 'AED', 'SG$', 'QAR', 'KWD', 'MYR'].map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={cn(
                  "w-14 h-14 rounded-2xl font-bold text-xl transition-all border-2",
                  currency === c 
                    ? (isDarkMode ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-900" : "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100")
                    : (isDarkMode ? "bg-gray-800 text-gray-500 border-transparent hover:bg-gray-700" : "bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100")
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Security & Notifications */}
      <div className={cn(
        "p-8 rounded-[40px] shadow-sm border space-y-6 transition-colors duration-300",
        isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-50"
      )}>
        <div className="flex items-center gap-4 mb-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            isDarkMode ? "bg-red-900/30 text-red-400" : "bg-red-50 text-red-600"
          )}>
            <Lock className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-lg">{language === 'bn' ? 'নিরাপত্তা ও নোটিফিকেশন' : 'Security & Notifications'}</h4>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Fingerprint className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-bold">{language === 'bn' ? 'বায়োমেট্রিক লক' : 'Biometric Lock'}</p>
                <p className={cn("text-xs", isDarkMode ? "text-gray-400" : "text-gray-500")}>{language === 'bn' ? 'ফিঙ্গারপ্রিন্ট বা ফেস আইডি ব্যবহার করুন।' : 'Use fingerprint or face ID.'}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsBiometricEnabled(!isBiometricEnabled)}
              className={cn(
                "w-14 h-8 rounded-full relative transition-all duration-300",
                isBiometricEnabled ? "bg-green-600" : "bg-gray-200"
              )}
            >
              <div className={cn(
                "absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300",
                isBiometricEnabled ? "left-7" : "left-1"
              )} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Lock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-bold">{language === 'bn' ? 'অ্যাপ পিন (PIN)' : 'App PIN'}</p>
                <p className={cn("text-xs", isDarkMode ? "text-gray-400" : "text-gray-500")}>
                  {pinCode ? (language === 'bn' ? 'পিন সক্রিয় আছে' : 'PIN is active') : (language === 'bn' ? 'অ্যাপ খোলার সময় পিন কোড চাইবে।' : 'Require PIN code when opening the app.')}
                </p>
              </div>
            </div>
            <button 
              onClick={() => {
                if (pinCode) {
                  setShowPinRemoveConfirm(true);
                } else {
                  setTempPin('');
                  setPinError('');
                  setIsPinModalOpen(true);
                }
              }}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                pinCode ? (isDarkMode ? "bg-red-900/30 text-red-400 hover:bg-red-900/50" : "bg-red-50 text-red-600 hover:bg-red-100") : 
                          (isDarkMode ? "bg-gray-800 text-blue-400 hover:bg-gray-700" : "bg-blue-50 text-blue-600 hover:bg-blue-100")
              )}
            >
              {pinCode ? (language === 'bn' ? 'রিমুভ' : 'Remove') : (language === 'bn' ? 'সেটআপ' : 'Setup')}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Download className={cn("w-5 h-5", deferredPrompt ? "text-blue-500" : "text-gray-400")} />
              <div>
                <p className="font-bold">{language === 'bn' ? 'অ্যাপ ইন্সটল করুন' : 'Install App'}</p>
                <p className={cn("text-xs", isDarkMode ? "text-gray-400" : "text-gray-500")}>
                  {language === 'bn' ? 'দ্রুত অ্যাক্সেসের জন্য হোম স্ক্রিনে যোগ করুন।' : 'Add to home screen for faster access.'}
                </p>
              </div>
            </div>
            <button 
              onClick={handleInstallClick}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                deferredPrompt 
                  ? (isDarkMode ? "bg-blue-600 border-blue-500 text-white" : "bg-blue-50 border-blue-100 text-blue-600")
                  : (isDarkMode ? "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800")
              )}
            >
              {language === 'bn' ? 'ইন্সটল' : 'Install'}
            </button>
          </div>

          {features.automaticBackup && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Cloud className={cn("w-5 h-5", autoBackup ? "text-blue-500" : "text-gray-400")} />
                <div>
                  <p className="font-bold">{language === 'bn' ? 'অটো ব্যাকআপ' : 'Auto Backup'}</p>
                  <p className={cn("text-xs", isDarkMode ? "text-gray-400" : "text-gray-500")}>
                    {language === 'bn' ? 'স্বয়ংক্রিয় ক্লাউড ব্যাকআপ সক্রিয় করুন।' : 'Enable automatic cloud backup.'}
                  </p>
                  {lastBackupTime && (
                    <p className="text-[10px] text-green-500 font-bold mt-1">
                      {language === 'bn' ? 'সর্বশেষ ব্যাকআপ:' : 'Last Backup:'} {lastBackupTime}
                    </p>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setAutoBackup(!autoBackup)}
                className={cn(
                  "w-14 h-8 rounded-full relative transition-all duration-300",
                  autoBackup ? "bg-blue-600" : "bg-gray-200"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300",
                  autoBackup ? "left-7" : "left-1"
                )} />
              </button>
            </div>
          )}

          {features.cloudSync && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Database className="w-5 h-5 text-indigo-500" />
                <div>
                  <p className="font-bold">{language === 'bn' ? 'ক্লাউড ডেটা সিঙ্ক' : 'Cloud Data Sync'}</p>
                  <p className={cn("text-xs", isDarkMode ? "text-gray-400" : "text-gray-500")}>
                    {language === 'bn' ? 'ইন্টারনেটের মাধ্যমে আপনার স্বয়ংক্রিয় সিঙ্কিং সক্রিয় আছে।' : 'Your automatic cloud syncing is active over the internet.'}
                  </p>
                </div>
              </div>
              <div className="w-14 flex justify-end">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
            </div>
          )}
          
          {features.advancedSettings && (
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-start gap-4">
                <Bot className="w-5 h-5 text-gray-400 mt-1" />
                <div className="w-full">
                  <p className="font-bold">{language === 'bn' ? 'এআই এর জন্য কাস্টম নির্দেশনা' : 'Custom AI Instructions'}</p>
                  <p className={cn("text-xs mb-2", isDarkMode ? "text-gray-400" : "text-gray-500")}>
                    {language === 'bn' 
                      ? 'এআই সহকারীকে কীভাবে কাজ করতে হবে তার নির্দেশনা দিন। এটি আপনার নির্দেশ অনুযায়ী উত্তর দেবে।' 
                      : 'Provide instructions on how the AI assistant should behave. It will answer according to your instructions.'}
                  </p>
                  <textarea
                    value={aiInstructions}
                    onChange={(e) => setAiInstructions(e.target.value)}
                    placeholder={language === 'bn' ? "যেমন: তুমি একজন কড়া হিসাবরক্ষক, আমাকে সবসময় সঞ্চয় করতে বলবে..." : "e.g., You are a strict accountant, always tell me to save..."}
                    className={cn(
                      "w-full p-3 rounded-xl text-sm border-none focus:ring-2 focus:ring-blue-500 resize-none h-24",
                      isDarkMode ? "bg-gray-800 text-white placeholder-gray-500" : "bg-gray-50 text-gray-800 placeholder-gray-400"
                    )}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Premium Subscription Banner */}
      {!isPremium && (
        <div className={cn(
          "p-8 rounded-[40px] shadow-sm border space-y-6 transition-colors duration-300 relative overflow-hidden",
          isDarkMode ? "bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/30" : "bg-gradient-to-br from-indigo-50 border-indigo-100"
        )}>
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <ShieldCheck className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-lg"
                )}>
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <h4 className="font-bold text-xl">{language === 'bn' ? 'প্রিমিয়াম ভার্সন' : 'Premium Version'}</h4>
              </div>
              <p className={cn("text-sm max-w-sm", isDarkMode ? "text-indigo-200" : "text-indigo-800")}>
                {language === 'bn' ? 'মাসে ১৯ টাকা বা ৪৯ টাকায় আজীবন ব্যবহার করুন।' : 'Unlock for 19 Taka/month or 49 Taka lifetime.'}
              </p>
            </div>
            <button
              onClick={() => setShowPremiumModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-amber-500/30 hover:scale-105 transition-transform whitespace-nowrap"
            >
              {language === 'bn' ? 'আপগ্রেড করুন' : 'Upgrade Now'}
            </button>
          </div>
        </div>
      )}

      {/* Storage & Stats */}
      <div className={cn(
        "p-8 rounded-[40px] shadow-sm border space-y-6 transition-colors duration-300",
        isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-50"
      )}>
        <div className="flex items-center gap-4 mb-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            isDarkMode ? "bg-green-900/30 text-green-400" : "bg-green-50 text-green-600"
          )}>
            <Database className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-lg">{language === 'bn' ? 'স্টোরেজ ও পরিসংখ্যান' : 'Storage & Stats'}</h4>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className={cn("p-4 rounded-2xl", isDarkMode ? "bg-gray-800" : "bg-gray-50")}>
            <p className="text-xs text-gray-400 font-bold uppercase">{language === 'bn' ? 'মোট লেনদেন' : 'Total Transactions'}</p>
            <p className="text-xl font-bold">{transactions.length}</p>
          </div>
          <div className={cn("p-4 rounded-2xl", isDarkMode ? "bg-gray-800" : "bg-gray-50")}>
            <p className="text-xs text-gray-400 font-bold uppercase">{language === 'bn' ? 'ক্যাটাগরি' : 'Categories'}</p>
            <p className="text-xl font-bold">{categories.length}</p>
          </div>
          <div className={cn("p-4 rounded-2xl", isDarkMode ? "bg-gray-800" : "bg-gray-50")}>
            <p className="text-xs text-gray-400 font-bold uppercase">{language === 'bn' ? 'বাজেট সেট' : 'Budgets Set'}</p>
            <p className="text-xl font-bold">{budgets.length}</p>
          </div>
          <div className={cn("p-4 rounded-2xl", isDarkMode ? "bg-gray-800" : "bg-gray-50")}>
            <p className="text-xs text-gray-400 font-bold uppercase">{language === 'bn' ? 'সঞ্চয় লক্ষ্য' : 'Savings Goals'}</p>
            <p className="text-xl font-bold">{savingsGoals.length}</p>
          </div>
        </div>
      </div>

      {/* Share App */}
      <div className={cn(
        "p-8 rounded-[40px] shadow-sm border space-y-6 transition-colors duration-300",
        isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-50"
      )}>
        <div className="flex items-center gap-4 mb-2">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            isDarkMode ? "bg-blue-900/30 text-blue-400" : "bg-blue-50 text-blue-600"
          )}>
            <Share2 className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-lg">{language === 'bn' ? 'বন্ধুদের সাথে শেয়ার করুন' : 'Share with Friends'}</h4>
        </div>
        
        <p className={cn("text-sm", isDarkMode ? "text-gray-400" : "text-gray-500")}>
          {language === 'bn' ? 'আপনার বন্ধুদের এই অ্যাপটি শেয়ার করুন যাতে তারাও তাদের আয়-ব্যয়ের হিসাব রাখতে পারে।' : 'Share this app with your friends so they can also track their income and expenses.'}
        </p>

        <div className="flex flex-col md:flex-row gap-4">
          <div className={cn(
            "flex-1 p-4 rounded-2xl border flex items-center justify-between",
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-100"
          )}>
            <span className={cn("text-xs font-mono truncate mr-2", isDarkMode ? "text-gray-400" : "text-gray-500")}>
              {appUrl}
            </span>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(appUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className={cn(
                "p-2 rounded-xl transition-all",
                isDarkMode ? "hover:bg-gray-700 text-blue-400" : "hover:bg-blue-100 text-blue-600"
              )}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <button 
            onClick={handleShare}
            className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            {language === 'bn' ? 'শেয়ার করুন' : 'Share'}
          </button>
        </div>
      </div>

      {/* Feedback & Support */}
      <div className={cn(
        "p-8 rounded-[40px] shadow-sm border space-y-6 transition-colors duration-300",
        isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-50"
      )}>
        <div className="flex items-center gap-4 mb-2">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            isDarkMode ? "bg-indigo-900/30 text-indigo-400" : "bg-indigo-50 text-indigo-600"
          )}>
            <MessageSquare className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-lg">{language === 'bn' ? 'মতামত ও সাপোর্ট' : 'Feedback & Support'}</h4>
        </div>
        
        <div className="space-y-4">
          <textarea 
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={language === 'bn' ? "আপনার কোনো মতামত বা সমস্যা থাকলে এখানে লিখুন..." : "Write your feedback or issues here..."}
            className={cn(
              "w-full p-4 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-medium h-32 resize-none",
              isDarkMode ? "bg-gray-800 text-white" : "bg-gray-50 text-[#1B2559]"
            )}
          />
          <button 
            onClick={() => {
              if (feedback.trim()) {
                onSubmitFeedback(feedback);
                setFeedback('');
              }
            }}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
          >
            {language === 'bn' ? 'মতামত পাঠান' : 'Send Feedback'}
          </button>
        </div>

        {userFeedback && userFeedback.length > 0 && (
          <div className="mt-8 space-y-4">
            <h5 className="font-bold text-md mb-4">{language === 'bn' ? 'আপনার আগের মতামত ও রিপ্লাই' : 'Your Previous Feedback & Replies'}</h5>
            {userFeedback.map((item) => (
              <div key={item.id} className={cn(
                "p-4 rounded-2xl border",
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-100"
              )}>
                <p className={cn("text-sm mb-2", isDarkMode ? "text-gray-300" : "text-gray-600")}>{item.message}</p>
                <p className="text-xs text-gray-400 mb-3">
                  {item.createdAt?.toDate ? format(item.createdAt.toDate(), 'PPP p') : (item.createdAt ? format(parseISO(item.createdAt), 'PPP p') : 'N/A')}
                </p>
                {item.reply && (
                  <div className={cn(
                    "p-3 rounded-xl border-l-4 border-blue-500",
                    isDarkMode ? "bg-blue-900/20" : "bg-blue-100/50"
                  )}>
                    <p className="text-xs font-bold text-blue-600 mb-1">{language === 'bn' ? 'অ্যাডমিনের রিপ্লাই:' : 'Admin Reply:'}</p>
                    <p className={cn("text-sm", isDarkMode ? "text-gray-300" : "text-gray-700")}>{item.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 pt-4">
          <button 
            onClick={() => setIsFaqOpen(true)}
            className={cn(
            "flex items-center justify-between p-4 rounded-2xl transition-all",
            isDarkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-50 hover:bg-gray-100"
          )}>
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-blue-500" />
              <span className="font-medium">{language === 'bn' ? 'সচরাচর জিজ্ঞাসিত প্রশ্ন (FAQ)' : 'Frequently Asked Questions (FAQ)'}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button 
            onClick={() => setIsPrivacyOpen(true)}
            className={cn(
            "flex items-center justify-between p-4 rounded-2xl transition-all",
            isDarkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-50 hover:bg-gray-100"
          )}>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              <span className="font-medium">{language === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Account Management */}
      <div className={cn(
        "p-8 rounded-[40px] shadow-sm border space-y-6 transition-colors duration-300",
        isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-50"
      )}>
        <div className="flex items-center gap-4 mb-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            isDarkMode ? "bg-red-900/30 text-red-400" : "bg-red-50 text-red-600"
          )}>
            <Lock className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-lg">{language === 'bn' ? 'অ্যাকাউন্ট ম্যানেজমেন্ট' : 'Account Management'}</h4>
        </div>

        <div className={cn("overflow-hidden rounded-3xl border transition-colors duration-300", isDarkMode ? "border-gray-800 bg-[#1f2937]" : "border-gray-100 bg-gray-50/50")}>
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className={cn("w-full flex items-center p-4 transition-all text-left", isDarkMode ? "hover:bg-gray-800/80" : "hover:bg-white")}
          >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mr-4 transition-colors", isDarkMode ? "bg-red-900/40 text-red-400" : "bg-red-100 text-red-600")}>
              <ArrowLeftRight className="w-5 h-5 rotate-180" />
            </div>
            <div className="flex-1">
              <h5 className={cn("font-bold text-[15px]", isDarkMode ? "text-gray-200" : "text-gray-800")}>{language === 'bn' ? 'লগআউট করুন' : 'Logout'}</h5>
              <p className={cn("text-[13px] mt-0.5", isDarkMode ? "text-gray-400" : "text-gray-500")}>{language === 'bn' ? 'এই ডিভাইস থেকে সাইন আউট করুন' : 'Sign out from this device'}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          
          <div className={cn("h-px w-full", isDarkMode ? "bg-gray-800" : "bg-gray-200/60")} />

          <button 
            onClick={() => setShowLogoutOtherConfirm(true)}
            className={cn("w-full flex items-center p-4 transition-all text-left", isDarkMode ? "hover:bg-gray-800/80" : "hover:bg-white")}
          >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mr-4 transition-colors", isDarkMode ? "bg-orange-900/40 text-orange-400" : "bg-orange-100 text-orange-600")}>
              <Lock className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h5 className={cn("font-bold text-[15px]", isDarkMode ? "text-gray-200" : "text-gray-800")}>{language === 'bn' ? 'অন্যান্য ডিভাইস থেকে লগআউট' : 'Logout from Other Devices'}</h5>
              <p className={cn("text-[13px] mt-0.5", isDarkMode ? "text-gray-400" : "text-gray-500")}>{language === 'bn' ? 'অন্য সব সক্রিয় সেশন শেষ করুন' : 'End all other active sessions'}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <div className={cn("h-px w-full", isDarkMode ? "bg-gray-800" : "bg-gray-200/60")} />

          <button 
            onClick={() => setShowDeleteAccountConfirm(true)}
            className={cn("w-full flex items-center p-4 transition-all text-left", isDarkMode ? "hover:bg-red-900/10" : "hover:bg-red-50")}
          >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mr-4 transition-colors", isDarkMode ? "bg-red-900/50 text-red-500" : "bg-red-100 text-red-600")}>
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h5 className={cn("font-bold text-[15px]", isDarkMode ? "text-red-400" : "text-red-600")}>{language === 'bn' ? 'অ্যাকাউন্ট ডিলিট করুন' : 'Delete Account'}</h5>
              <p className={cn("text-[13px] mt-0.5", isDarkMode ? "text-gray-400" : "text-gray-500")}>{language === 'bn' ? 'আপনার অ্যাকাউন্ট সম্পূর্ণ মুছে ফেলুন' : 'Permanently remove your account'}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <div className={cn("h-px w-full", isDarkMode ? "bg-gray-800" : "bg-gray-200/60")} />

          <button 
            onClick={() => setShowResetConfirm(true)}
            className={cn("w-full flex items-center p-4 transition-all text-left", isDarkMode ? "hover:bg-red-900/10" : "hover:bg-red-50")}
          >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mr-4 transition-colors", isDarkMode ? "bg-red-900/50 text-red-500" : "bg-red-100 text-red-600")}>
              <Database className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h5 className={cn("font-bold text-[15px]", isDarkMode ? "text-red-400" : "text-red-600")}>{language === 'bn' ? 'সব ডাটা মুছে ফেলুন' : 'Delete All Data'}</h5>
              <p className={cn("text-[13px] mt-0.5", isDarkMode ? "text-gray-400" : "text-gray-500")}>{language === 'bn' ? 'অ্যাপ্লিকেশনের লোকাল ডাটা রিস্টোর করুন' : 'Clear all local data'}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Data Management */}
      {features.dataExport && (
        <div className={cn(
          "p-8 rounded-[40px] shadow-sm border space-y-6 transition-colors duration-300",
          isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-50"
        )}>
          <div className="flex items-center gap-4 mb-2">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              isDarkMode ? "bg-green-900/30 text-green-400" : "bg-green-50 text-green-600"
            )}>
              <Download className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-lg">{language === 'bn' ? 'ডাটা ব্যাকআপ ও রিপোর্ট' : 'Data Backup & Reports'}</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button 
              onClick={handleExport}
              className={cn(
                "flex flex-col items-center justify-center gap-3 p-5 rounded-3xl font-bold transition-all",
                isDarkMode ? "bg-blue-900/30 text-blue-400 hover:bg-blue-900/50" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
              )}
            >
              <Download className="w-5 h-5" />
              {language === 'bn' ? 'JSON ব্যাকআপ' : 'JSON Backup'}
            </button>
            <button 
              onClick={handleExportExcel}
              className={cn(
                "flex flex-col items-center justify-center gap-3 p-5 rounded-3xl font-bold transition-all",
                isDarkMode ? "bg-teal-900/30 text-teal-400 hover:bg-teal-900/50" : "bg-teal-50 text-teal-600 hover:bg-teal-100"
              )}
            >
              <FileSpreadsheet className="w-5 h-5" />
              {language === 'bn' ? 'Excel রিপোর্ট' : 'Excel Report'}
            </button>
            <button 
              onClick={handleExportCSV}
              className={cn(
                "flex flex-col items-center justify-center gap-3 p-5 rounded-3xl font-bold transition-all",
                isDarkMode ? "bg-purple-900/30 text-purple-400 hover:bg-purple-900/50" : "bg-purple-50 text-purple-600 hover:bg-purple-100"
              )}
            >
              <FileSpreadsheet className="w-5 h-5" />
              {language === 'bn' ? 'CSV রিপোর্ট' : 'CSV Report'}
            </button>
            <button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className={cn(
                "flex flex-col items-center justify-center gap-3 p-5 rounded-3xl font-bold transition-all",
                isExporting ? "opacity-50 cursor-not-allowed" : "",
                isDarkMode ? "bg-indigo-900/30 text-indigo-400 hover:bg-indigo-900/50" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
              )}
            >
              <FileText className={cn("w-5 h-5", isExporting && "animate-spin")} />
              {isExporting ? (language === 'bn' ? 'প্রস্তুত হচ্ছে...' : 'Preparing...') : (language === 'bn' ? 'PDF রিপোর্ট' : 'PDF Report')}
            </button>
            <label className={cn(
              "flex flex-col items-center justify-center gap-3 p-5 rounded-3xl font-bold transition-all cursor-pointer",
              isDarkMode ? "bg-green-900/30 text-green-400 hover:bg-green-900/50" : "bg-green-50 text-green-600 hover:bg-green-100"
            )}>
              <FileUp className="w-5 h-5" />
              {language === 'bn' ? 'ব্যাকআপ আপলোড' : 'Upload Backup'}
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            <label className={cn(
              "flex flex-col items-center justify-center gap-3 p-5 rounded-3xl font-bold transition-all cursor-pointer",
              isDarkMode ? "bg-orange-900/30 text-orange-400 hover:bg-orange-900/50" : "bg-orange-50 text-orange-600 hover:bg-orange-100"
            )}>
              <FileUp className="w-5 h-5" />
              {language === 'bn' ? 'CSV ইমপোর্ট' : 'Import CSV'}
              <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
            </label>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      {features.deepCleaning && (
        <div className={cn(
          "p-8 rounded-[40px] shadow-sm border space-y-6 transition-colors duration-300",
          isDarkMode ? "bg-[#111827] border-red-900/30" : "bg-white border-red-50"
        )}>
          <div className="flex items-center gap-4 mb-2">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              isDarkMode ? "bg-red-900/30 text-red-400" : "bg-red-50 text-red-600"
            )}>
              <Trash className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-lg text-red-600">{language === 'bn' ? 'বিপজ্জনক এলাকা' : 'Danger Zone'}</h4>
          </div>
          <p className={cn("text-sm", isDarkMode ? "text-gray-400" : "text-gray-500")}>{language === 'bn' ? 'সতর্কতা: নিচের বাটনে ক্লিক করলে আপনার সব লেনদেন এবং সেটিংস মুছে যাবে। এটি আর ফিরিয়ে আনা সম্ভব নয়।' : 'Warning: Clicking the button below will delete all your transactions and settings. This cannot be undone.'}</p>
          <button 
            onClick={() => setShowResetConfirm(true)}
            className={cn(
              "w-full p-5 rounded-3xl font-bold transition-all",
              isDarkMode ? "bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white" : "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
            )}
          >
            {language === 'bn' ? 'সব ডাটা রিসেট করুন' : 'Reset All Data'}
          </button>
        </div>
      )}

      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn("w-full max-w-sm p-6 rounded-3xl shadow-sm", isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900")}
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowLeftRight className="w-8 h-8 rotate-180" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">
                {language === 'bn' ? 'লগআউট' : 'Logout'}
              </h3>
              <p className="text-center text-gray-500 mb-6 font-medium">
                {language === 'bn' ? 'আপনি কি এই ডিভাইস থেকে লগআউট করতে চান?' : 'Are you sure you want to log out from this device?'}
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button 
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onLogout();
                  }}
                  className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/30"
                >
                  {language === 'bn' ? 'লগআউট' : 'Logout'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
        
        {showLogoutOtherConfirm && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn("w-full max-w-sm p-6 rounded-3xl shadow-sm", isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900")}
            >
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">
                {language === 'bn' ? 'নিশ্চিত করুন' : 'Confirm Action'}
              </h3>
              <p className="text-center text-gray-500 mb-6 font-medium">
                {language === 'bn' ? 'আপনি কি অন্যান্য সমস্ত ডিভাইস থেকে লগআউট করতে চান?' : 'Do you want to log out from all other devices?'}
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowLogoutOtherConfirm(false)}
                  className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button 
                  onClick={() => {
                    setShowLogoutOtherConfirm(false);
                    onLogoutOtherDevices();
                  }}
                  className="flex-1 py-3 rounded-xl font-bold bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-600/30"
                >
                  {language === 'bn' ? 'লগআউট' : 'Logout'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showDeleteAccountConfirm && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn("w-full max-w-sm p-6 rounded-3xl shadow-sm", isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900")}
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">
                {language === 'bn' ? 'অ্যাকাউন্ট ডিলিট' : 'Delete Account'}
              </h3>
              <p className="text-center text-red-500 mb-6 font-medium">
                {language === 'bn' ? 'আপনি কি নিশ্চিত যে আপনি আপনার অ্যাকাউন্ট এবং সমস্ত ডাটা মুছে ফেলতে চান? এই কাজ আর ফেরানো যাবে না!' : 'Are you sure you want to delete your account and all data? This cannot be undone!'}
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDeleteAccountConfirm(false)}
                  className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button 
                  onClick={() => {
                    setShowDeleteAccountConfirm(false);
                    onDeleteAccount();
                  }}
                  className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/30"
                >
                  {language === 'bn' ? 'ডিলিট করুন' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "w-full max-w-sm rounded-[40px] p-8 shadow-md text-center",
                isDarkMode ? "bg-[#111827] text-white" : "bg-white text-[#1B2559]"
              )}
            >
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6",
                isDarkMode ? "bg-red-900/30 text-red-400" : "bg-red-50 text-red-600"
              )}>
                <Trash className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{language === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?'}</h3>
              <p className={cn("text-sm mb-8", isDarkMode ? "text-gray-400" : "text-gray-500")}>
                {language === 'bn' ? 'আপনার সব লেনদেন, বাজেট এবং সঞ্চয় লক্ষ্য মুছে যাবে। এটি আর ফিরিয়ে আনা সম্ভব নয়।' : 'All your transactions, budgets, and savings goals will be deleted. This cannot be undone.'}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className={cn(
                    "flex-1 py-4 rounded-2xl font-bold transition-all",
                    isDarkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  onClick={async () => {
                    await onReset();
                    setShowResetConfirm(false);
                  }}
                  className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                >
                  {language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showPinRemoveConfirm && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "p-8 rounded-[40px] max-w-sm w-full shadow-md relative text-center",
                isDarkMode ? "bg-[#111827] text-white" : "bg-white text-gray-900"
              )}
            >
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {language === 'bn' ? 'পিন মুছে ফেলবেন?' : 'Remove PIN?'}
              </h3>
              <p className={cn("text-sm mb-8", isDarkMode ? "text-gray-400" : "text-gray-500")}>
                {language === 'bn' 
                  ? 'আপনি কি নিশ্চিত যে আপনি পিন কোড মুছে ফেলতে চান?' 
                  : 'Are you sure you want to remove the PIN code?'}
              </p>
              
              <div className="flex gap-4 w-full">
                <button
                  onClick={() => setShowPinRemoveConfirm(false)}
                  className={cn(
                    "flex-1 py-4 rounded-2xl font-bold transition-colors",
                    isDarkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    setPinCode(null);
                    setShowPinRemoveConfirm(false);
                  }}
                  className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                >
                  {language === 'bn' ? 'মুছে ফেলুন' : 'Remove'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isPinModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "p-8 rounded-[40px] max-w-sm w-full shadow-md relative",
                isDarkMode ? "bg-[#111827] text-white" : "bg-white text-gray-900"
              )}
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                  <Lock className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {language === 'bn' ? 'PIN সেট করুন' : 'Setup PIN Code'}
                </h3>
                <p className={cn("text-sm text-center mb-6", isDarkMode ? "text-gray-400" : "text-gray-500")}>
                  {language === 'bn' ? '৪ ডিজিটের নতুন পিন কোড দিন' : 'Enter new 4 digit PIN code'}
                </p>
                
                <input
                  type="password"
                  maxLength={4}
                  value={tempPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setTempPin(val);
                    if (pinError) setPinError('');
                  }}
                  className={cn(
                    "text-center text-3xl tracking-[1em] font-bold w-full rounded-2xl p-4 border outline-none transition-colors",
                    isDarkMode ? "bg-gray-800 border-gray-700 focus:border-blue-500" : "bg-gray-50 border-gray-200 focus:border-blue-500"
                  )}
                  placeholder="••••"
                  autoFocus
                />
                
                {pinError && (
                  <p className="text-red-500 text-sm mt-3">{pinError}</p>
                )}

                <div className="flex gap-4 w-full mt-8">
                  <button
                    onClick={() => {
                      setIsPinModalOpen(false);
                      setTempPin('');
                    }}
                    className={cn(
                      "flex-1 py-4 rounded-2xl font-bold transition-colors",
                      isDarkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    onClick={async () => {
                      if (tempPin.length === 4) {
                        const hashed = await hashPin(tempPin);
                        setPinCode(hashed);
                        setIsPinModalOpen(false);
                        setTempPin('');
                      } else {
                        setPinError(language === 'bn' ? 'অবশ্যই ৪ ডিজিটের সংখ্যা হতে হবে!' : 'Must be a 4 digit number!');
                      }
                    }}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                  >
                    {language === 'bn' ? 'সেভ করুন' : 'Save'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className={cn(
        "p-8 rounded-[40px] shadow-sm border space-y-4 transition-colors duration-300 text-center",
        isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-50"
      )}>
        <div className="flex justify-center mb-2">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center",
            isDarkMode ? "bg-gray-800 text-gray-400" : "bg-gray-50 text-gray-400"
          )}>
            <Info className="w-6 h-6" />
          </div>
        </div>
        <h4 className="font-bold text-lg">{language === 'bn' ? 'অ্যাপ সম্পর্কে' : 'About App'}</h4>
        <p className={cn("text-sm", isDarkMode ? "text-gray-400" : "text-gray-500")}>
          {language === 'bn' ? 'ব্যয় ট্র্যাকার একটি সহজ এবং শক্তিশালী অ্যাপ যা আপনাকে আপনার আর্থিক জীবন নিয়ন্ত্রণে রাখতে সাহায্য করে।' : 'Expense Tracker is a simple and powerful app that helps you take control of your financial life.'}
        </p>
        <div className="pt-4">
          <p className="text-gray-400 text-xs font-medium">ভার্সন v1.3.0</p>
          <p className="text-gray-300 text-[10px] mt-1 uppercase tracking-widest">Made with ❤️ for you</p>
        </div>
      </div>

      {/* FAQ Modal */}
      <AnimatePresence>
        {isFaqOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={cn(
                "w-full max-w-lg rounded-[32px] p-6 shadow-sm max-h-[80vh] overflow-y-auto",
                isDarkMode ? "bg-[#111827] text-white" : "bg-white text-gray-900"
              )}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{language === 'bn' ? 'সচরাচর জিজ্ঞাসিত প্রশ্ন (FAQ)' : 'Frequently Asked Questions'}</h3>
                <button onClick={() => setIsFaqOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold mb-1">{language === 'bn' ? 'কীভাবে নতুন লেনদেন যোগ করব?' : 'How to add a new transaction?'}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{language === 'bn' ? 'ড্যাশবোর্ডের নিচে থাকা + বাটনে ক্লিক করে নতুন আয় বা ব্যয় যোগ করতে পারবেন।' : 'Click the + button at the bottom of the dashboard to add a new income or expense.'}</p>
                </div>
                <div>
                  <h4 className="font-bold mb-1">{language === 'bn' ? 'আমি কি আমার ডাটা ব্যাকআপ রাখতে পারব?' : 'Can I backup my data?'}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{language === 'bn' ? 'হ্যাঁ, সেটিংস থেকে "ব্যাকআপ ডাউনলোড" অপশন ব্যবহার করে আপনার ডাটা সেভ করে রাখতে পারবেন।' : 'Yes, you can save your data using the "Download Backup" option from settings.'}</p>
                </div>
                <div>
                  <h4 className="font-bold mb-1">{language === 'bn' ? 'বাজেট কীভাবে কাজ করে?' : 'How does the budget work?'}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{language === 'bn' ? 'আপনি নির্দিষ্ট ক্যাটাগরির জন্য মাসিক বাজেট সেট করতে পারেন। খরচ বাজেটের কাছাকাছি গেলে অ্যাপ আপনাকে সতর্ক করবে।' : 'You can set a monthly budget for specific categories. The app will warn you when expenses approach the budget.'}</p>
                </div>
                <div>
                  <h4 className="font-bold mb-1">{language === 'bn' ? 'এআই চ্যাটবট কীভাবে ব্যবহার করব?' : 'How to use the AI chatbot?'}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{language === 'bn' ? 'স্ক্রিনের নিচে ডানদিকে থাকা চ্যাট আইকনে ক্লিক করে এআই-এর সাথে কথা বলতে পারবেন। এটি আপনার আর্থিক বিষয়ে পরামর্শ দিতে পারে।' : 'Click the chat icon at the bottom right of the screen to talk to the AI. It can provide financial advice.'}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {isPrivacyOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={cn(
                "w-full max-w-lg rounded-[32px] p-6 shadow-sm max-h-[80vh] overflow-y-auto",
                isDarkMode ? "bg-[#111827] text-white" : "bg-white text-gray-900"
              )}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{language === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}</h3>
                <button onClick={() => setIsPrivacyOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                <p>
                  {language === 'bn' 
                    ? 'আপনার গোপনীয়তা আমাদের কাছে অত্যন্ত গুরুত্বপূর্ণ। এই অ্যাপটি কীভাবে আপনার তথ্য সংগ্রহ এবং ব্যবহার করে তা নিচে দেওয়া হলো:' 
                    : 'Your privacy is very important to us. Here is how this app collects and uses your information:'}
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>{language === 'bn' ? 'ডাটা স্টোরেজ:' : 'Data Storage:'}</strong> 
                    {language === 'bn' 
                      ? ' আপনার সমস্ত আর্থিক লেনদেন, বাজেট এবং ক্যাটাগরি আপনার ডিভাইসে লোকাল স্টোরেজে সেভ করা হয়। ক্লাউড ব্যাকআপ চালু করলে তা ফায়ারবেস সার্ভারে সুরক্ষিতভাবে সেভ হয়।' 
                      : ' All your financial transactions, budgets, and categories are saved locally on your device. If cloud backup is enabled, it is securely saved on Firebase servers.'}
                  </li>
                  <li>
                    <strong>{language === 'bn' ? 'এআই প্রসেসিং:' : 'AI Processing:'}</strong> 
                    {language === 'bn' 
                      ? ' এআই চ্যাটবট এবং আর্থিক সারাংশ তৈরি করার জন্য আপনার কিছু ডাটা (যেমন: লেনদেনের পরিমাণ, ক্যাটাগরি) গুগল জেমিনি এআই-এর কাছে পাঠানো হয়। তবে এটি কোনো ব্যক্তিগত পরিচায়ক তথ্য (PII) পাঠায় না।' 
                      : ' To generate AI chatbot responses and financial summaries, some of your data (e.g., transaction amounts, categories) is sent to Google Gemini AI. However, no personally identifiable information (PII) is sent.'}
                  </li>
                  <li>
                    <strong>{language === 'bn' ? 'তৃতীয় পক্ষ:' : 'Third Parties:'}</strong> 
                    {language === 'bn' 
                      ? ' আমরা আপনার ডাটা কোনো তৃতীয় পক্ষের কাছে বিক্রি করি না বা শেয়ার করি না।' 
                      : ' We do not sell or share your data with any third parties.'}
                  </li>
                </ul>
                <p className="mt-4 font-medium">
                  {language === 'bn' 
                    ? 'অ্যাপটি ব্যবহার করার মাধ্যমে আপনি আমাদের এই গোপনীয়তা নীতির সাথে একমত পোষণ করছেন।' 
                    : 'By using the app, you agree to this privacy policy.'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Modal */}
      <AnimatePresence>
        {showPremiumModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className={cn(
                "w-full max-w-md rounded-[40px] p-8 shadow-md relative overflow-y-auto max-h-[90vh]",
                isDarkMode ? "bg-[#111827] text-white" : "bg-white text-gray-900"
              )}
            >
              {/* Background styling for Premium feel */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-yellow-400 to-amber-600 opacity-20" />
              <div className="relative z-10 text-center mb-8">
                <div className="w-20 h-20 mx-auto rounded-3xl mb-4 bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Star className="w-10 h-10 text-white fill-current" />
                </div>
                <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-yellow-500 to-amber-600">
                  {paymentStep === 1 
                    ? (language === 'bn' ? 'প্রিমিয়াম' : 'Premium')
                    : (language === 'bn' ? 'পেমেন্ট করুন' : 'Make Payment')}
                </h3>
                <p className={cn("mt-2 font-medium break-words", isDarkMode ? "text-gray-400" : "text-gray-500")}>
                  {paymentStep === 1
                    ? (language === 'bn' ? 'অ্যাডভান্সড এআই এবং আনলিমিটেড রিপোর্ট' : 'Advanced AI & Unlimited Reports')
                    : (language === 'bn' ? 'বিকাশ, নগদ বা রকেট এর মাধ্যমে পেমেন্ট করুন' : 'Pay via bKash, Nagad, or Rocket')}
                </p>
              </div>

              {paymentStep === 1 ? (
                <>
                  <div className="space-y-4 mb-4">
                    <button 
                      onClick={() => setSelectedPlan('monthly')}
                      className={cn(
                        "w-full p-4 rounded-2xl flex flex-col gap-1 border-2 text-left transition-all", 
                        selectedPlan === 'monthly'
                          ? "border-amber-500 bg-amber-500/10" 
                          : (isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200")
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <p className="font-bold">{language === 'bn' ? 'মাসিক প্ল্যান' : 'Monthly Plan'}</p>
                        <p className="font-extrabold text-amber-600">৳১৯</p>
                      </div>
                      <p className="text-xs text-gray-500">{language === 'bn' ? 'প্রতি মাসে রিনিউ হবে' : 'Renews every month'}</p>
                    </button>
                    
                    <button 
                      onClick={() => setSelectedPlan('lifetime')}
                      className={cn(
                        "w-full p-4 rounded-2xl flex flex-col gap-1 border-2 relative text-left transition-all", 
                        selectedPlan === 'lifetime'
                          ? "border-amber-500 bg-amber-500/10" 
                          : (isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200")
                      )}
                    >
                      <div className="absolute -top-3 right-4 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase">
                        {language === 'bn' ? 'সেরা ডিল' : 'Best Deal'}
                      </div>
                      <div className="flex items-center justify-between w-full">
                        <p className="font-bold">{language === 'bn' ? 'আজীবন অ্যাক্সেস' : 'Lifetime Access'}</p>
                        <p className="font-extrabold text-amber-600">৳৪৯</p>
                      </div>
                      <p className="text-xs text-gray-500">{language === 'bn' ? 'একবার পেমেন্ট, আজীবন ব্যবহার করুন' : 'Pay once, use forever'}</p>
                    </button>
                  </div>

                  <div className="space-y-4 mb-8 text-left">
                    <p className={cn("text-sm text-center italic mb-4", isDarkMode ? "text-gray-400" : "text-gray-500")}>
                      {language === 'bn' ? 'আপনি যা পাবেন:' : 'What you will get:'}
                    </p>
                    
                    <div className={cn("p-3 rounded-2xl flex items-center gap-4", isDarkMode ? "bg-gray-800" : "bg-gray-50")}>
                      <div className="p-2 rounded-full bg-blue-100 text-blue-600"><Sparkles className="w-5 h-5" /></div>
                      <p className="text-sm font-bold">{language === 'bn' ? 'আনলিমিটেড এআই অ্যাসিস্ট্যান্ট ইনপুট' : 'Unlimited AI Assistant Inputs'}</p>
                    </div>
                    <div className={cn("p-3 rounded-2xl flex items-center gap-4", isDarkMode ? "bg-gray-800" : "bg-gray-50")}>
                      <div className="p-2 rounded-full bg-purple-100 text-purple-600"><ShieldCheck className="w-5 h-5" /></div>
                      <p className="text-sm font-bold">{language === 'bn' ? 'পিডিএফ (PDF) ও এক্সেল (Excel) এক্সপোর্ট' : 'PDF & Excel Exports'}</p>
                    </div>
                    <div className={cn("p-3 rounded-2xl flex items-center gap-4", isDarkMode ? "bg-gray-800" : "bg-gray-50")}>
                      <div className="p-2 rounded-full bg-green-100 text-green-600"><Bot className="w-5 h-5" /></div>
                      <p className="text-sm font-bold">{language === 'bn' ? 'আরও স্মার্ট এআই প্রেডিকশন' : 'Smarter AI Predictions'}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={handleNextPaymentStep}
                      className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-amber-500/30 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                    >
                      {language === 'bn' ? 'পরবর্তী ধাপ' : 'Next Step'}
                    </button>
                    <button 
                      onClick={() => { setShowPremiumModal(false); setPaymentStep(1); }}
                      className={cn(
                        "w-full py-4 rounded-2xl font-bold transition-colors",
                        isDarkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-400"
                      )}
                    >
                      {language === 'bn' ? 'পরে দেখব' : 'Maybe Later'}
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleUpgradePremium} className="space-y-6">
                  <div className={cn("p-4 rounded-2xl text-left border", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200")}>
                    <p className="font-bold text-lg mb-2">
                      {language === 'bn' ? 'ধাপ ১: টাকা পাঠান' : 'Step 1: Send Money'}
                    </p>
                    <p className="text-sm mb-4">
                      {language === 'bn' 
                        ? `আপনার বিকাশ, নগদ অথবা রকেট অ্যাপ থেকে নিচের নাম্বারে Send Money করুন:`
                        : `Send Money from your bKash, Nagad or Rocket app to the following number:`}
                    </p>
                    <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 p-3 rounded-xl font-mono text-center text-xl font-bold tracking-wider mb-2 select-all">
                      01309573466
                    </div>
                    <p className="text-center font-bold">
                      {language === 'bn' ? 'পরিমান:' : 'Amount:'} {selectedPlan === 'monthly' ? '৳১৯' : '৳৪৯'}
                    </p>
                  </div>
                  
                  <div className={cn("p-4 rounded-2xl text-left border", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200")}>
                    <p className="font-bold text-lg mb-2">
                      {language === 'bn' ? 'ধাপ ২: ট্রানজেকশন আইডি' : 'Step 2: Transaction ID'}
                    </p>
                    <p className="text-sm mb-4">
                      {language === 'bn' 
                        ? 'টাকা পাঠানোর পর প্রাপ্ত Transaction ID (TrxID) নিচে প্রদান করুন:'
                        : 'Enter the Transaction ID (TrxID) received after sending money:'}
                    </p>
                    <input
                      type="text"
                      required
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      placeholder={language === 'bn' ? 'TrxID দিন...' : 'Enter TrxID...'}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-amber-500 outline-none transition-all uppercase",
                        isDarkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-300"
                      )}
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <button 
                      type="submit"
                      disabled={isProcessingPayment || trxId.length < 5}
                      className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-amber-500/30 hover:scale-[1.02] transition-transform disabled:opacity-75 disabled:scale-100 flex items-center justify-center gap-2"
                    >
                      {isProcessingPayment && <Loader2 className="w-5 h-5 animate-spin" />}
                      {isProcessingPayment 
                        ? (language === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying...') 
                        : (language === 'bn' ? 'পেমেন্ট নিশ্চিত করুন' : 'Confirm Payment')}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setPaymentStep(1)}
                      disabled={isProcessingPayment}
                      className={cn(
                        "w-full py-4 rounded-2xl font-bold transition-colors",
                        isDarkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-400"
                      )}
                    >
                      {language === 'bn' ? 'ফিরে যান' : 'Go Back'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}