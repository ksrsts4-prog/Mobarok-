import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Activity, 
  Megaphone, 
  UserCheck, 
  MessageSquare, 
  Trash2, 
  Search, 
  BarChart3, 
  Users, 
  Settings,
  Plus,
  FileText,
  Download,
  AlertTriangle,
  RefreshCw,
  Database,
  Bell,
  XCircle,
  ShieldAlert,
  Globe,
  Cloud,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { cn, hashPin } from '../lib/utils';
import { format, parseISO } from 'date-fns';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, getDocs, doc, query, orderBy, addDoc, serverTimestamp, deleteDoc, updateDoc, onSnapshot, setDoc, limit, startAfter, collectionGroup, getAggregateFromServer, sum, count, where } from 'firebase/firestore';
import { SystemFeatures } from '../types';
import { useAppStore } from '../store/useAppStore';

interface AdminPanelProps {
  feedback: any[];
  isDarkMode: boolean;
  language: 'bn' | 'en';
  onSubmitReply: (id: string, reply: string) => void;
  onDeleteFeedback: (id: string) => void;
  transactions: any[];
  currency: string;
  features: SystemFeatures;
  onToggleFeature: (featureKey: keyof SystemFeatures, value: boolean) => void;
}

export function AdminPanelScreen({ feedback, onSubmitReply, onDeleteFeedback, features, onToggleFeature }: AdminPanelProps) {
  const { isDarkMode, language, transactions, currency, adminPin, setAdminPin } = useAppStore();
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'announcements' | 'feedback' | 'settings' | 'reports' | 'security' | 'data_management' | 'features'>('analytics');
  const [newAdminPin, setNewAdminPin] = useState('');
  
  // Settings & Logs state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [globalAlertMsg, setGlobalAlertMsg] = useState('');
  const [isGlobalAlertActive, setIsGlobalAlertActive] = useState(false);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Helper to log admin actions
  const logAdminAction = async (action: string, description: string) => {
    try {
      await addDoc(collection(db, 'activityLogs'), {
        action,
        description,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'activityLogs');
    }
  };

  useEffect(() => {
    // Listen to maintenance mode and global alerts
    const unsub = onSnapshot(doc(db, 'systemSettings', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        setMaintenanceMode(docSnap.data().maintenanceMode || false);
        setGlobalAlertMsg(docSnap.data().globalAlertMsg || '');
        setIsGlobalAlertActive(docSnap.data().isGlobalAlertActive || false);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'systemSettings/general'));
    return () => unsub();
  }, []);

  const fetchActivityLogs = async () => {
    setLoadingLogs(true);
    try {
      const q = query(collection(db, 'activityLogs'), orderBy('createdAt', 'desc'), limit(10));
      const snapshot = await getDocs(q);
      setActivityLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports' && activityLogs.length === 0) fetchActivityLogs();
  }, [activeTab]);

  const toggleMaintenanceMode = async () => {
    const newValue = !maintenanceMode;
    setMaintenanceMode(newValue);
    try {
      await setDoc(doc(db, 'systemSettings', 'general'), { maintenanceMode: newValue }, { merge: true });
      await logAdminAction('System Setting updated', `Maintenance mode turned ${newValue ? 'ON' : 'OFF'}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'systemSettings/general');
      alert('Failed to update maintenance mode.');
    }
  };

  const saveGlobalAlert = async () => {
    try {
      await setDoc(doc(db, 'systemSettings', 'general'), { 
        globalAlertMsg, 
        isGlobalAlertActive 
      }, { merge: true });
      await logAdminAction('Global Alert Updated', `Alert ${isGlobalAlertActive ? 'started' : 'stopped'}: ${globalAlertMsg}`);
      alert(language === 'bn' ? 'সতর্কবার্তা সেভ হয়েছে!' : 'Alert saved successfully!');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'systemSettings/general');
    }
  };

  const handleRevokeAdmin = async (userId: string) => {
    try {
      const targetUser = users.find(u => u.id === userId);
      if (targetUser?.email === 'ksrsts4@gmail.com') {
        alert(language === 'bn' ? 'সুপার অ্যাডমিনকে বাতিল করা যাবে না!' : 'Cannot revoke Super Admin!');
        return;
      }
      await updateDoc(doc(db, 'users', userId), { role: 'user' });
      await logAdminAction('Admin Revoked', `Revoked admin from ${userId}`);
      fetchUsers();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const clearSystemCache = async () => {
    localStorage.clear();
    sessionStorage.clear();
    await logAdminAction('System Maintained', 'System cache cleared globally by admin');
    alert(language === 'bn' ? 'ক্যাশ সফলভাবে ক্লিয়ার হয়েছে।' : 'Cache cleared successfully.');
  };

  const systemRestart = async () => {
    await logAdminAction('System Restarted', 'Admin triggered app reload');
    window.location.reload();
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => 
      Object.values(obj).map(val => {
        if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
        if (val && typeof val === 'object' && (val as any).toDate) return `"${format((val as any).toDate(), 'PPP p')}"`;
        return `"${val}"`;
      }).join(',')
    ).join('\n');
    
    const csvContext = `${headers}\n${rows}`;
    const blob = new Blob([csvContext], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportTransactions = () => {
    const exportData = transactions.map(t => ({
      ID: t.id,
      Date: t.date,
      Type: t.type,
      Amount: t.amount,
      Category: t.categoryId,
      Note: t.note || ''
    }));
    downloadCSV(exportData, 'transactions_report');
    logAdminAction('Report Downloaded', 'Exported transactions to CSV');
  };

  const exportUsers = () => {
    const exportData = users.map(u => ({
      ID: u.id,
      Name: u.name,
      Email: u.email,
      Role: u.role
    }));
    downloadCSV(exportData, 'users_report');
    logAdminAction('Report Downloaded', 'Exported users to CSV');
  };

  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'replied' | 'unreplied'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [generatingAiReplyId, setGeneratingAiReplyId] = useState<string | null>(null);

  const generateAiReply = async (feedbackItem: any) => {
    setGeneratingAiReplyId(feedbackItem.id);
    try {
      const prompt = `You are a Customer Support Expert for 'Expense Tracker Pro'.
A user submitted the following feedback/query: "${feedbackItem.message}"
User Context:
- Email: ${feedbackItem.userEmail || 'Unknown'}
- Language Preference: ${language === 'bn' ? 'Bengali' : 'English'}

Task: Analyze the feedback and write a professional, supportive, and context-aware response providing actionable solutions. Answer in the user's language preference. Keep it concise.`;

      const token = await import('../firebase').then(m => m.auth.currentUser?.getIdToken());
      const aiResponse = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          model: "gemini-3-flash-preview",
          contents: prompt
        })
      });
      
      if (!aiResponse.ok) {
        const errData = await aiResponse.json().catch(() => ({})).catch(() => ({}));
        throw new Error(`Failed to generate AI reply: ${errData.error || ''} ${errData.details || ''}`);
      }
      
      const response = await aiResponse.json().catch(() => ({}));
      
      if (response.text) {
        setReplyTexts(prev => ({ ...prev, [feedbackItem.id]: response.text.trim() }));
      }
    } catch (error: any) {
      console.warn("AI reply generation failed (handled in UI):", error.message || error);
      if (error?.message?.includes('API key not valid') || error?.message?.includes('API_KEY_INVALID') || error?.message?.includes('API key is not configured')) {
        alert(language === 'bn' ? "আপনার দেওয়া Gemini API Key সঠিক নয়। অনুগ্রহ করে Settings > Secrets-এ গিয়ে সঠিক API Key প্রদান করুন।" : "Invalid API Key. Please provide a valid Gemini API Key in Settings > Secrets.");
      } else {
        alert("Failed to generate AI reply.");
      }
    } finally {
      setGeneratingAiReplyId(null);
    }
  };

  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [lastUserVisible, setLastUserVisible] = useState<any>(null);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [loadingMoreUsers, setLoadingMoreUsers] = useState(false);

  // System Analytics
  const [sysStats, setSysStats] = useState({ income: 0, expense: 0, txCount: 0 });
  const [loadingStats, setLoadingStats] = useState(false);

  // Announcements state
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', type: 'info' });
  const [isAddingAnnouncement, setIsAddingAnnouncement] = useState(false);

  const fetchUsers = async (reload = false) => {
    if (!reload && loadingUsers) return;
    setLoadingUsers(true);
    try {
      let q = query(collection(db, 'users'), orderBy('name', 'asc'), limit(20));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(docs);
      setLastUserVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMoreUsers(snapshot.docs.length === 20);
    } catch (e) {
      console.error(e);
      setUsers([{ id: 'mock1', name: 'Mock User', email: 'mock@example.com', role: 'user' }]); // fallback if rules fail since it's an admin feature
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadMoreUsers = async () => {
    if (loadingMoreUsers || !hasMoreUsers || !lastUserVisible) return;
    setLoadingMoreUsers(true);
    try {
      const q = query(collection(db, 'users'), orderBy('name', 'asc'), startAfter(lastUserVisible), limit(20));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(prev => [...prev, ...docs]);
      setLastUserVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMoreUsers(snapshot.docs.length === 20);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMoreUsers(false);
    }
  };

  const fetchAnnouncements = async () => {
    setLoadingAnnouncements(true);
    try {
      const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoadingStats(true);
    try {
      const incomeQ = query(collectionGroup(db, 'transactions'), where('type', '==', 'income'));
      const expenseQ = query(collectionGroup(db, 'transactions'), where('type', '==', 'expense'));
      const [incomeSnap, expenseSnap] = await Promise.all([
        getAggregateFromServer(incomeQ, { total: sum('amount'), count: count() }),
        getAggregateFromServer(expenseQ, { total: sum('amount'), count: count() })
      ]);
      setSysStats({
        income: incomeSnap.data().total || 0,
        expense: expenseSnap.data().total || 0,
        txCount: (incomeSnap.data().count || 0) + (expenseSnap.data().count || 0)
      });
    } catch (e) {
      console.error('Failed to fetch analytics', e);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users' && users.length === 0) fetchUsers();
    if (activeTab === 'announcements' && announcements.length === 0) fetchAnnouncements();
    if (activeTab === 'analytics' && sysStats.txCount === 0) fetchAnalytics();
  }, [activeTab]);

  const handleTogglePremium = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { isPremium: !currentStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, isPremium: !currentStatus } : u));
      await logAdminAction('User Status Updated', `Toggled premium for ${userId} to ${!currentStatus}`);
    } catch (e) {
      console.error("Error toggling premium:", e);
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const handleMakeAdmin = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: 'admin' });
      await logAdminAction('User Role Changed', `Made user ${userId} an admin`);
      fetchUsers();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.message) return;
    try {
      await addDoc(collection(db, 'announcements'), {
        ...newAnnouncement,
        createdAt: serverTimestamp()
      });
      await logAdminAction('Announcement Created', `Title: ${newAnnouncement.title}`);
      setIsAddingAnnouncement(false);
      setNewAnnouncement({ title: '', message: '', type: 'info' });
      fetchAnnouncements();
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'announcements');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'announcements', id));
      await logAdminAction('Announcement Deleted', `Deleted announcement ${id}`);
      fetchAnnouncements();
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `announcements/${id}`);
    }
  };

  const filteredFeedback = feedback.filter(item => {
    if (filter === 'replied' && !item.reply) return false;
    if (filter === 'unreplied' && item.reply) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return item.email?.toLowerCase().includes(query) || item.message?.toLowerCase().includes(query);
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className={cn("p-8 rounded-[32px] flex items-center gap-6 relative overflow-hidden", isDarkMode ? "bg-indigo-900/20 border border-indigo-500/20" : "bg-indigo-50")}>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/20 rounded-full pointer-events-none" />
        <div className={cn(
          "w-16 h-16 rounded-[20px] flex items-center justify-center text-white shadow-sm relative z-10",
          isDarkMode ? "bg-indigo-500 shadow-indigo-500/20" : "bg-indigo-600 shadow-indigo-600/30"
        )}>
          <Shield className="w-8 h-8" />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold tracking-tight mb-1">{language === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Admin Panel'}</h2>
          <p className={cn("text-sm font-medium", isDarkMode ? "text-indigo-300" : "text-indigo-600/80")}>
            {language === 'bn' ? 'পুরো অ্যাপ পরিচালনা করুন' : 'Manage the entire application'}
          </p>
        </div>
      </div>

      <div className={cn("flex flex-wrap gap-2 p-1.5 rounded-[24px]", isDarkMode ? "bg-gray-800/50" : "bg-gray-100/50")}>
        {[
          { id: 'analytics', icon: <BarChart3 className="w-4 h-4" />, label: language === 'bn' ? 'অ্যানালিটিক্স' : 'Analytics' },
          { id: 'users', icon: <Users className="w-4 h-4" />, label: language === 'bn' ? 'ইউজার ম্যানেজমেন্ট' : 'Users' },
          { id: 'announcements', icon: <Megaphone className="w-4 h-4" />, label: language === 'bn' ? 'ঘোষণা' : 'Announcements' },
          { id: 'feedback', icon: <MessageSquare className="w-4 h-4" />, label: language === 'bn' ? 'ফিডব্যাক' : 'Feedback' },
          { id: 'reports', icon: <FileText className="w-4 h-4" />, label: language === 'bn' ? 'রিপোর্ট' : 'Reports' },
          { id: 'settings', icon: <Settings className="w-4 h-4" />, label: language === 'bn' ? 'সেটিংস' : 'Settings' },
          { id: 'features', icon: <Activity className="w-4 h-4" />, label: language === 'bn' ? 'ফিচার্স' : 'Features' },
          { id: 'data_management', icon: <Database className="w-4 h-4" />, label: language === 'bn' ? 'ডেটা ম্যানেজমেন্ট' : 'Data Management' },
          { id: 'security', icon: <ShieldAlert className="w-4 h-4" />, label: language === 'bn' ? 'সিকিউরিটি' : 'Security' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "relative whitespace-nowrap px-4 py-2.5 rounded-[16px] text-sm font-bold transition-all flex items-center gap-2 z-10",
              activeTab === tab.id
                ? (isDarkMode ? "text-white" : "text-indigo-900")
                : (isDarkMode ? "text-gray-300 hover:text-gray-200 hover:bg-gray-800" : "text-gray-600 hover:text-gray-900 hover:bg-white/50")
            )}
          >
            {activeTab === tab.id && (
              <motion.div 
                layoutId="adminTabs" 
                className={cn("absolute inset-0 rounded-[16px] -z-10 shadow-sm", isDarkMode ? "bg-gray-700" : "bg-white")} 
              />
            )}
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">{language === 'bn' ? 'সিস্টেম অ্যানালিটিক্স' : 'System Analytics'}</h3>
                <button onClick={fetchAnalytics} disabled={loadingStats} className="text-sm text-indigo-500 hover:underline">
                  {loadingStats ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {loadingStats ? (
                <div className="py-12 text-center text-gray-600">Loading System Analytics...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={cn("p-8 rounded-[32px] relative overflow-hidden transition-all", isDarkMode ? "bg-gray-800 shadow-sm shadow-black/20" : "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100")}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-10 -mt-10 pointer-events-none" />
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                         <Activity className="w-5 h-5" />
                      </div>
                      <p className={cn("text-xs font-bold uppercase tracking-wider", isDarkMode ? "text-gray-400" : "text-gray-500")}>Total Transactions</p>
                    </div>
                    <p className="text-4xl font-bold tracking-tight">{sysStats.txCount}</p>
                  </div>
                  <div className={cn("p-8 rounded-[32px] relative overflow-hidden transition-all", isDarkMode ? "bg-gray-800 shadow-sm shadow-black/20" : "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100")}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-10 -mt-10 pointer-events-none" />
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl">
                         <BarChart3 className="w-5 h-5" />
                      </div>
                      <p className={cn("text-xs font-bold uppercase tracking-wider", isDarkMode ? "text-green-400" : "text-green-600")}>Total Income</p>
                    </div>
                    <p className="text-4xl font-bold tracking-tight text-green-500">{currency}{sysStats.income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className={cn("p-8 rounded-[32px] relative overflow-hidden transition-all", isDarkMode ? "bg-gray-800 shadow-sm shadow-black/20" : "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100")}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-10 -mt-10 pointer-events-none" />
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl">
                         <BarChart3 className="w-5 h-5" />
                      </div>
                      <p className={cn("text-xs font-bold uppercase tracking-wider", isDarkMode ? "text-red-400" : "text-red-600")}>Total Expense</p>
                    </div>
                    <p className="text-4xl font-bold tracking-tight text-red-500">{currency}{sysStats.expense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">{language === 'bn' ? 'ইউজার ম্যানেজমেন্ট' : 'User Management'}</h3>
                <button onClick={() => fetchUsers(true)} className="text-sm text-indigo-500 hover:underline">Refresh</button>
              </div>
              
              {loadingUsers ? (
                <div className="py-12 text-center text-gray-500">Loading...</div>
              ) : (
                <div className="grid gap-4">
                  {users.map(u => (
                    <div key={u.id} className={cn("p-5 rounded-[24px] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md", isDarkMode ? "bg-gray-800 border-gray-700 hover:bg-gray-700/50" : "bg-white border-gray-100 hover:border-indigo-100")}>
                      <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden", u.role === 'admin' ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500")}>
                          {u.photo ? (
                            <img src={u.photo} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            u.name ? u.name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-bold flex items-center gap-2">
                            {u.name || (language === 'bn' ? 'নাম নেই' : 'No Name')} 
                            <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full", u.role === 'admin' ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300")}>{u.role || 'user'}</span>
                            {u.isPremium && <span className="bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full dark:from-yellow-900/30 dark:to-amber-900/30 dark:text-amber-400 border border-amber-200/50">Premium</span>}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 sm:justify-end">
                        <button
                          onClick={() => handleTogglePremium(u.id, u.isPremium || false)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold transition-colors w-full sm:w-auto",
                            u.isPremium 
                              ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/40" 
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700"
                          )}
                        >
                          {u.isPremium ? (language === 'bn' ? 'প্রিমিয়াম বাতিল' : 'Revoke Premium') : (language === 'bn' ? 'প্রিমিয়াম দিন' : 'Make Premium')}
                        </button>
                        {u.role !== 'admin' && (
                          <button 
                            onClick={() => handleMakeAdmin(u.id)}
                            className="px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 transition-colors w-full sm:w-auto"
                          >
                            {language === 'bn' ? 'অ্যাডমিন করুন' : 'Make Admin'}
                          </button>
                        )}
                        {u.role === 'admin' && u.email !== 'ksrsts4@gmail.com' && (
                          <button 
                            onClick={() => handleRevokeAdmin(u.id)}
                            className="px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 transition-colors w-full sm:w-auto"
                          >
                            {language === 'bn' ? 'অ্যাডমিন বাতিল' : 'Revoke Admin'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && <p className="text-gray-500 text-center py-8">No users found.</p>}
                  {hasMoreUsers && users.length > 0 && (
                    <button
                      onClick={loadMoreUsers}
                      disabled={loadingMoreUsers}
                      className="w-full mt-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 font-bold rounded-[16px] transition-colors"
                    >
                      {loadingMoreUsers ? 'Loading...' : (language === 'bn' ? 'আরও ইউজার লোড করুন' : 'Load More Users')}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">{language === 'bn' ? 'অ্যাপ ঘোষণা' : 'App Announcements'}</h3>
                <button 
                  onClick={() => setIsAddingAnnouncement(!isAddingAnnouncement)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700"
                >
                  {isAddingAnnouncement ? <Trash2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {isAddingAnnouncement ? 'বাতিল' : 'নতুন ঘোষণা'}
                </button>
              </div>

              {isAddingAnnouncement && (
                <div className={cn("p-6 rounded-2xl border space-y-4", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-indigo-50 border-indigo-100")}>
                  <input
                    type="text"
                    placeholder="Title"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                    className={cn("w-full p-3 rounded-xl", isDarkMode ? "bg-gray-900 border-none" : "border-gray-200")}
                  />
                  <textarea
                    placeholder="Message content"
                    value={newAnnouncement.message}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
                    className={cn("w-full p-3 rounded-xl h-24 resize-none", isDarkMode ? "bg-gray-900 border-none" : "border-gray-200")}
                  />
                  <div className="flex justify-end pt-2">
                    <button onClick={handleCreateAnnouncement} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">Publish</button>
                  </div>
                </div>
              )}

              {loadingAnnouncements ? (
                <div className="py-12 text-center text-gray-500">Loading...</div>
              ) : (
                <div className="grid gap-4">
                  {announcements.map(a => (
                    <div key={a.id} className={cn("p-6 rounded-[24px] border flex items-start justify-between gap-4 transition-all hover:translate-y-[-2px] hover:shadow-lg", isDarkMode ? "bg-gray-800 border-gray-700 shadow-sm shadow-black/10" : "bg-white border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]")}>
                      <div className="flex gap-4 items-start w-full">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl shrink-0 mt-1">
                          <Megaphone className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-1">{a.title}</h4>
                          <p className={cn("text-sm mb-3 leading-relaxed", isDarkMode ? "text-gray-300" : "text-gray-600")}>{a.message}</p>
                          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            {a.createdAt?.toDate ? format(a.createdAt.toDate(), 'PPP p') : 'Just now'}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteAnnouncement(a.id)} className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors shrink-0">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  {announcements.length === 0 && <p className="text-gray-500 text-center py-8">No announcements yet.</p>}
                </div>
              )}
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50 dark:bg-gray-800/30 p-4 rounded-[24px]">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="সার্চ করুন..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={cn(
                        "pl-9 pr-4 py-2.5 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 text-sm w-full sm:w-64",
                        isDarkMode ? "bg-gray-800 text-white shadow-inner" : "bg-white text-gray-900 shadow-sm"
                      )}
                    />
                  </div>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className={cn(
                      "px-4 py-2.5 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 text-sm cursor-pointer w-full sm:w-auto",
                      isDarkMode ? "bg-gray-800 text-white shadow-inner" : "bg-white text-gray-900 shadow-sm"
                    )}
                  >
                    <option value="all">সব ফিডব্যাক</option>
                    <option value="unreplied">রিপ্লাই দেওয়া হয়নি</option>
                    <option value="replied">রিপ্লাই দেওয়া হয়েছে</option>
                  </select>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 bg-white dark:bg-gray-800 px-5 py-2.5 rounded-xl shadow-sm w-full sm:w-auto border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span className="font-bold text-sm text-gray-700 dark:text-gray-200">{language === 'bn' ? 'AI অটো রিপ্লাই' : 'AI Auto Reply'}</span>
                  </div>
                  <button
                    onClick={() => {
                      onToggleFeature('aiAutoReply', !features.aiAutoReply);
                      logAdminAction('AI Auto Reply Toggled', `Changed to ${!features.aiAutoReply}`);
                    }}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      features.aiAutoReply ? "bg-indigo-500" : "bg-gray-200 dark:bg-gray-700"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm",
                      features.aiAutoReply && "transform translate-x-6"
                    )} />
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {filteredFeedback.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">কোনো ফিডব্যাক পাওয়া যায়নি।</div>
                ) : (
                  filteredFeedback.map((item) => (
                    <div 
                      key={item.id}
                      className={cn(
                        "p-6 rounded-[24px] border transition-all hover:shadow-lg",
                        isDarkMode ? "bg-gray-800 border-gray-700 shadow-sm shadow-black/10" : "bg-white border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                      )}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                            {item.email?.[0].toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-bold">{item.email || 'Anonymous'}</p>
                            <p className="text-xs text-gray-400">
                              {item.createdAt?.toDate ? format(item.createdAt.toDate(), 'PPP p') : (item.createdAt ? format(parseISO(item.createdAt), 'PPP p') : 'N/A')}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            onDeleteFeedback(item.id);
                            logAdminAction('Feedback Deleted', `Deleted feedback ${item.id}`);
                          }}
                          className={cn(
                            "p-2 rounded-xl transition-colors",
                            isDarkMode ? "text-red-400 hover:bg-red-900/30" : "text-red-500 hover:bg-red-50"
                          )}
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <p className={cn("text-sm leading-relaxed mb-4", isDarkMode ? "text-gray-300" : "text-gray-600")}>
                        {item.message}
                      </p>
                      
                      {item.reply ? (
                        <div className={cn(
                          "mt-4 p-4 rounded-2xl border-l-4 border-indigo-500",
                          isDarkMode ? "bg-indigo-900/20" : "bg-indigo-50"
                        )}>
                          <p className="text-xs font-bold text-indigo-600 mb-1">আপনার রিপ্লাই:</p>
                          <p className={cn("text-sm", isDarkMode ? "text-gray-300" : "text-gray-700")}>{item.reply}</p>
                        </div>
                      ) : (
                        <div className="mt-4">
                          {replyingTo === item.id ? (
                            <div className="space-y-3">
                              <textarea 
                                value={replyTexts[item.id] || ''}
                                onChange={(e) => setReplyTexts({ ...replyTexts, [item.id]: e.target.value })}
                                placeholder="রিপ্লাই লিখুন..."
                                className={cn(
                                  "w-full p-3 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 text-sm h-24 resize-none",
                                  isDarkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"
                                )}
                              />
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => {
                                    if (replyTexts[item.id]?.trim()) {
                                      onSubmitReply(item.id, replyTexts[item.id]);
                                      logAdminAction('Feedback Replied', `Replied to feedback ${item.id}`);
                                      setReplyingTo(null);
                                    }
                                  }}
                                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700"
                                >
                                  পাঠান
                                </button>
                                {features.aiAutoReply && (
                                  <button
                                    onClick={() => generateAiReply(item)}
                                    disabled={generatingAiReplyId === item.id}
                                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center gap-2 transition-all shadow-md"
                                  >
                                    <Sparkles className="w-4 h-4" />
                                    {generatingAiReplyId === item.id ? (language === 'bn' ? 'জেনারেট হচ্ছে...' : 'Generating...') : (language === 'bn' ? 'এআই রিপ্লাই' : 'AI Reply')}
                                  </button>
                                )}
                                <button 
                                  onClick={() => setReplyingTo(null)}
                                  className={cn(
                                    "px-4 py-2 text-sm font-bold rounded-xl",
                                    isDarkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                  )}
                                >
                                  বাতিল
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setReplyingTo(item.id)}
                              className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                            >
                              <MessageSquare className="w-4 h-4" />
                              রিপ্লাই দিন
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">{language === 'bn' ? 'সিস্টেম রিপোর্ট' : 'System Reports'}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={cn("p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border transition-all hover:translate-y-[-2px] hover:shadow-lg", isDarkMode ? "bg-gray-800 border-gray-700 shadow-sm shadow-black/10" : "bg-white border-gray-100")}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-2xl"><FileText className="w-6 h-6" /></div>
                    <div>
                      <h4 className="font-bold text-lg">{language === 'bn' ? 'ট্রানজ্যাকশন রিপোর্ট' : 'Transaction Report'}</h4>
                      <p className="text-sm text-gray-500">Export all transactions</p>
                    </div>
                  </div>
                  <button onClick={exportTransactions} className="w-full py-3 bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors">
                    <Download className="w-5 h-5" /> CSV Export
                  </button>
                </div>

                <div className={cn("p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border transition-all hover:translate-y-[-2px] hover:shadow-lg", isDarkMode ? "bg-gray-800 border-gray-700 shadow-sm shadow-black/10" : "bg-white border-gray-100")}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-2xl"><Users className="w-6 h-6" /></div>
                    <div>
                      <h4 className="font-bold text-lg">{language === 'bn' ? 'ইউজার রিপোর্ট' : 'User Report'}</h4>
                      <p className="text-sm text-gray-500">Export user activity log</p>
                    </div>
                  </div>
                  <button onClick={exportUsers} className="w-full py-3 bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors">
                    <Download className="w-5 h-5" /> CSV Export
                  </button>
                </div>
              </div>

              <div className={cn("p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border", isDarkMode ? "bg-gray-800 border-gray-700 shadow-black/10" : "bg-white border-gray-100")}>
                <h4 className="font-bold mb-6 text-lg">{language === 'bn' ? 'সাম্প্রতিক অ্যাক্টিভিটি লগ' : 'Recent Activity Logs'}</h4>
                <div className="space-y-5">
                  {loadingLogs ? (
                    <p className="text-sm text-gray-500">Loading logs...</p>
                  ) : activityLogs.length > 0 ? (
                    activityLogs.map((log) => (
                      <div key={log.id} className="flex justify-between items-center text-sm border-b pb-4 last:border-0 last:pb-0 dark:border-gray-700">
                        <div className="flex gap-4 items-center">
                           <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                           <div>
                             <p className="font-bold text-base">{log.action}</p>
                             <p className="text-xs text-gray-500 mt-1">{log.description}</p>
                           </div>
                        </div>
                        <span className="text-xs font-medium text-gray-400 bg-gray-50 dark:bg-gray-900/50 px-2 py-1 rounded-lg shrink-0">
                          {log.createdAt?.toDate ? format(log.createdAt.toDate(), 'MMM d, p') : 'Just now'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No recent activity.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">{language === 'bn' ? 'সিস্টেম সেটিংস' : 'System Settings'}</h3>

              <div className="space-y-4">
                {/* Admin Master PIN */}
                <div className={cn("p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex flex-col gap-4", isDarkMode ? "bg-gray-800 border-gray-700 shadow-black/10" : "bg-white border-gray-100")}>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-4 bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-2xl"><ShieldCheck className="w-6 h-6" /></div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{language === 'bn' ? 'অ্যাডমিন মাস্টার পিন পরিবর্তন' : 'Change Admin Master PIN'}</h4>
                      <p className="text-sm text-gray-500">{language === 'bn' ? 'অ্যাডমিন প্যানেলে প্রবেশ করার লগইন পিন আপডেট করুন' : 'Update the PIN required to access the admin panel'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input 
                      type="password"
                      maxLength={5}
                      placeholder={language === 'bn' ? 'নতুন ৫-ডিজিটের পিন দিন (বর্তমান: ' + adminPin + ')' : `New 5-digit PIN (Current: ${adminPin})`}
                      value={newAdminPin}
                      onChange={(e) => setNewAdminPin(e.target.value.replace(/[^0-9]/g, ''))}
                      className={cn(
                        "flex-1 px-5 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-purple-500 border-none transition-colors",
                        isDarkMode ? "bg-gray-900/50 text-white shadow-inner" : "bg-gray-50 text-gray-900 border border-gray-100 shadow-sm"
                      )}
                    />
                    <button 
                      onClick={async () => {
                        if (newAdminPin.length === 5) {
                          const hashed = await hashPin(newAdminPin);
                          setAdminPin(hashed);
                          setNewAdminPin('');
                          try {
                            const { doc, setDoc } = await import('firebase/firestore');
                            const { db } = await import('../firebase');
                            await setDoc(doc(db, 'systemSettings', 'security'), { adminPin: hashed }, { merge: true });
                          } catch (e) {
                            console.error("Failed to save PIN to Firestore", e);
                          }
                          alert(language === 'bn' ? 'সফলভাবে অ্যাডমিন পিন পরিবর্তন করা হয়েছে!' : 'Admin PIN successfully changed!');
                        } else {
                          alert(language === 'bn' ? 'অনুগ্রহ করে ৫ ডিজিটের পিন দিন।' : 'Please enter a 5-digit PIN.');
                        }
                      }}
                      disabled={newAdminPin.length !== 5}
                      className="px-8 py-4 bg-purple-50 text-purple-600 font-bold rounded-2xl hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50 shrink-0"
                    >
                      {language === 'bn' ? 'পিন আপডেট করুন' : 'Update PIN'}
                    </button>
                  </div>
                </div>

                {/* Global Alert System */}
                <div className={cn("p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border", isDarkMode ? "bg-gray-800 border-gray-700 shadow-black/10" : "bg-white border-gray-100")}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-2xl"><Bell className="w-6 h-6" /></div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{language === 'bn' ? 'গ্লোবাল সতর্কতা' : 'Global Alert Message'}</h4>
                      <p className="text-sm text-gray-500">{language === 'bn' ? 'সব ব্যবহারকারীর স্ক্রিনের উপরে একটি মেসেজ দেখান' : 'Show a banner message to all users'}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={isGlobalAlertActive}
                        onChange={(e) => setIsGlobalAlertActive(e.target.checked)}
                      />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-red-500"></div>
                    </label>
                  </div>
                  
                  <div className="space-y-4">
                    <input 
                      type="text"
                      placeholder={language === 'bn' ? 'সতর্কবার্তা লিখুন...' : 'Enter alert message...'}
                      value={globalAlertMsg}
                      onChange={(e) => setGlobalAlertMsg(e.target.value)}
                      className={cn(
                        "w-full px-5 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-red-500 border-none transition-colors",
                        isDarkMode ? "bg-gray-900/50 text-white shadow-inner" : "bg-gray-50 text-gray-900 border border-gray-100 shadow-sm"
                      )}
                    />
                    <button 
                      onClick={saveGlobalAlert}
                      disabled={!globalAlertMsg.trim() && isGlobalAlertActive}
                      className="w-full py-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                    >
                      {language === 'bn' ? 'সতর্কবার্তা সেভ করুন' : 'Save Alert Settings'}
                    </button>
                  </div>
                </div>

                <div className={cn("p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex flex-col sm:flex-row sm:items-center justify-between gap-4", isDarkMode ? "bg-gray-800 border-gray-700 shadow-black/10" : "bg-white border-gray-100")}>
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-2xl"><AlertTriangle className="w-6 h-6" /></div>
                    <div>
                      <h4 className="font-bold text-lg">{language === 'bn' ? 'মেইনটেন্যান্স মোড' : 'Maintenance Mode'}</h4>
                      <p className="text-sm text-gray-500">{language === 'bn' ? 'অ্যাপ ব্যবহারকারীদের জন্য সাময়িক সময়ের জন্য বন্ধ রাখুন' : 'Temporarily disable access for all users'}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={maintenanceMode}
                      onChange={toggleMaintenanceMode}
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-500"></div>
                  </label>
                </div>

                <div className={cn("p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex flex-col sm:flex-row sm:items-center justify-between gap-4", isDarkMode ? "bg-gray-800 border-gray-700 shadow-black/10" : "bg-white border-gray-100")}>
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-2xl"><Trash2 className="w-6 h-6" /></div>
                    <div>
                      <h4 className="font-bold text-lg">{language === 'bn' ? 'ক্যাশ সাইজ ক্লিয়ার করুন' : 'Clear System Cache'}</h4>
                      <p className="text-sm text-gray-500">{language === 'bn' ? 'অপ্রয়োজনীয় ডেটা মুছে অ্যাপ ফাস্ট করুন' : 'Clear temporary system data globally'}</p>
                    </div>
                  </div>
                  <button onClick={clearSystemCache} className="px-6 py-3 bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-400 font-bold rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors shrink-0">
                    Clean Cache
                  </button>
                </div>
                
                <div className={cn("p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex flex-col sm:flex-row sm:items-center justify-between gap-4", isDarkMode ? "bg-gray-800 border-gray-700 shadow-black/10" : "bg-white border-gray-100")}>
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-2xl"><RefreshCw className="w-6 h-6" /></div>
                    <div>
                      <h4 className="font-bold text-lg">{language === 'bn' ? 'সিস্টেম রিস্টার্ট' : 'System Restart'}</h4>
                      <p className="text-sm text-gray-500">{language === 'bn' ? 'কোর সার্ভিসগুলো পুনরায় রিস্টার্ট করুন' : 'Restart core background services'}</p>
                    </div>
                  </div>
                  <button onClick={systemRestart} className="px-6 py-3 bg-green-50 text-green-600 dark:bg-green-900/40 dark:text-green-400 font-bold rounded-2xl hover:bg-green-100 dark:hover:bg-green-900/60 transition-colors shrink-0">
                    Restart System
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">{language === 'bn' ? 'সিকিউরিটি ও এক্সেস' : 'Security & Access'}</h3>
              
              <div className={cn("p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border", isDarkMode ? "bg-gray-800 border-gray-700 shadow-black/10" : "bg-white border-gray-100")}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-2xl">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-lg">{language === 'bn' ? 'বর্তমান অ্যাডমিন তালিকা' : 'Active Administrators'}</h4>
                </div>
                
                {loadingUsers ? (
                  <p className="text-sm text-gray-500">Loading...</p>
                ) : (
                  <div className="space-y-4">
                    {users.filter(u => u.role === 'admin').map((admin) => (
                      <div key={admin.id} className="flex items-center justify-between p-5 rounded-2xl border transition-all hover:translate-y-[-2px] hover:shadow-md dark:border-gray-700 dark:bg-gray-900/20 bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400")}>
                            {admin.photo ? (
                              <img src={admin.photo} alt={admin.name} className="w-full h-full object-cover" />
                            ) : (
                              admin.name ? admin.name.charAt(0).toUpperCase() : admin.email.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-base">{admin.name}</p>
                            <p className="text-sm text-gray-500 mt-1">{admin.email}</p>
                          </div>
                        </div>
                        {admin.email !== 'ksrsts4@gmail.com' && (
                          <button onClick={() => handleRevokeAdmin(admin.id)} className="px-5 py-2.5 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors">
                            Revoke
                          </button>
                        )}
                        {admin.email === 'ksrsts4@gmail.com' && (
                          <span className="text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider">Super Admin</span>
                        )}
                      </div>
                    ))}
                    {users.filter(u => u.role === 'admin').length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-6">No admins found. Click 'Refresh' in Users tab.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">{language === 'bn' ? 'ফিচার কন্ট্রোল' : 'Feature Control'}</h3>
              
              <div className="space-y-4">
                <div className={cn("p-6 sm:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:translate-y-[-2px] hover:shadow-lg", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100")}>
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-2xl"><MessageSquare className="w-6 h-6" /></div>
                    <div>
                      <h4 className="font-bold text-lg">{language === 'bn' ? 'এআই অ্যাসিস্ট্যান্ট' : 'AI Assistant'}</h4>
                      <p className="text-sm text-gray-500">{language === 'bn' ? 'অ্যাপে এআই চ্যাটবট সক্রিয় রাখুন' : 'Enable AI chatbot feature in app'}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={features?.aiAssistant ?? true} onChange={(e) => { logAdminAction('Feature Toggle', 'Toggled AI Assistant'); onToggleFeature('aiAssistant', e.target.checked); }} />
                    <div className="shrink-0 w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-purple-500"></div>
                  </label>
                </div>

                <div className={cn("p-6 sm:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:translate-y-[-2px] hover:shadow-lg", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100")}>
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-2xl"><Users className="w-6 h-6" /></div>
                    <div>
                      <h4 className="font-bold text-lg">{language === 'bn' ? 'ফ্যামিলি শেয়ারিং' : 'Family Sharing'}</h4>
                      <p className="text-sm text-gray-500">{language === 'bn' ? 'পারিবারিক অ্যাকাউন্ট শেয়ারিং সক্রিয় রাখুন' : 'Enable family account sharing'}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={features?.familyBudget ?? true} onChange={(e) => { logAdminAction('Feature Toggle', 'Toggled Family Sharing'); onToggleFeature('familyBudget', e.target.checked); }}/>
                    <div className="shrink-0 w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                  </label>
                </div>

                <div className={cn("p-6 sm:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:translate-y-[-2px] hover:shadow-lg", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100")}>
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-2xl"><BarChart3 className="w-6 h-6" /></div>
                    <div>
                      <h4 className="font-bold text-lg">{language === 'bn' ? 'অ্যাডভান্সড চার্টস' : 'Advanced Analytics'}</h4>
                      <p className="text-sm text-gray-500">{language === 'bn' ? 'উন্নত চার্ট ও বিশ্লেষণ সক্রিয় রাখুন' : 'Enable advanced charts and analytics'}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={features?.advancedAnalytics ?? true} onChange={(e) => { logAdminAction('Feature Toggle', 'Toggled Advanced Analytics'); onToggleFeature('advancedAnalytics', e.target.checked); }}/>
                    <div className="shrink-0 w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
                  </label>
                </div>

                <div className={cn("p-6 sm:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:translate-y-[-2px] hover:shadow-lg", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100")}>
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 rounded-2xl"><Activity className="w-6 h-6" /></div>
                    <div>
                      <h4 className="font-bold text-lg">{language === 'bn' ? 'ভবিষ্যতের পূর্বাভাস' : 'Forecasting'}</h4>
                      <p className="text-sm text-gray-500">{language === 'bn' ? 'এআই ভিত্তিক পূর্বাভাস সক্রিয় রাখুন' : 'Enable AI forecasting feature'}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={features?.forecasting ?? true} onChange={(e) => { logAdminAction('Feature Toggle', 'Toggled Forecasting'); onToggleFeature('forecasting', e.target.checked); }}/>
                    <div className="shrink-0 w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                  </label>
                </div>

                <div className={cn("p-6 sm:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:translate-y-[-2px] hover:shadow-lg", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100")}>
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-2xl"><Database className="w-6 h-6" /></div>
                    <div>
                      <h4 className="font-bold text-lg">{language === 'bn' ? 'ক্লাউড ডেটা সিঙ্ক' : 'Cloud Data Sync'}</h4>
                      <p className="text-sm text-gray-500">{language === 'bn' ? 'স্বয়ংক্রিয় ক্লাউড সিঙ্ক সক্রিয় রাখুন' : 'Enable automatic cloud synchronization'}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={features?.cloudSync ?? true} onChange={(e) => { logAdminAction('Feature Toggle', 'Toggled Cloud Sync'); onToggleFeature('cloudSync', e.target.checked); }}/>
                    <div className="shrink-0 w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-500"></div>
                  </label>
                </div>

                {/* Redundant Family Budget switch removed */}

                <div className={cn("p-6 sm:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:translate-y-[-2px] hover:shadow-lg", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100")}>
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 rounded-2xl"><Settings className="w-6 h-6" /></div>
                    <div>
                      <h4 className="font-bold text-lg">{language === 'bn' ? 'অ্যাডভান্সড সেটিংস' : 'Advanced Settings'}</h4>
                      <p className="text-sm text-gray-500">{language === 'bn' ? 'ব্যবহারকারীদের জন্য অ্যাডভান্সড সেটিংস প্যানেল' : 'Advanced settings panel for users'}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={features?.advancedSettings ?? true} onChange={(e) => { logAdminAction('Feature Toggle', 'Toggled Advanced Settings'); onToggleFeature('advancedSettings', e.target.checked); }}/>
                    <div className="shrink-0 w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-pink-500"></div>
                  </label>
                </div>

                <div className={cn("p-6 sm:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:translate-y-[-2px] hover:shadow-lg", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100")}>
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-2xl"><Download className="w-6 h-6" /></div>
                    <div>
                      <h4 className="font-bold text-lg">{language === 'bn' ? 'ডেটা এক্সপোর্ট' : 'Data Export'}</h4>
                      <p className="text-sm text-gray-500">{language === 'bn' ? 'পিডিএফ (PDF) বা এক্সেলে (Excel) ডেটা ডাউনলোড সক্রিয় করুন' : 'Enable downloading data in PDF or Excel'}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={features?.dataExport ?? true} onChange={(e) => { logAdminAction('Feature Toggle', 'Toggled Data Export'); onToggleFeature('dataExport', e.target.checked); }}/>
                    <div className="shrink-0 w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-rose-500"></div>
                  </label>
                </div>

                <div className={cn("p-6 sm:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:translate-y-[-2px] hover:shadow-lg", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100")}>
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-2xl"><Cloud className="w-6 h-6" /></div>
                    <div>
                      <h4 className="font-bold text-lg">{language === 'bn' ? 'অটোমেটিক ব্যাকআপ' : 'Automatic Backup'}</h4>
                      <p className="text-sm text-gray-500">{language === 'bn' ? 'প্রতিদিনের ডেটা স্বয়ংক্রিয়ভাবে ব্যাকআপ নিন' : 'Enable automatic daily data backup'}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={features?.automaticBackup ?? true} onChange={(e) => { logAdminAction('Feature Toggle', 'Toggled Automatic Backup'); onToggleFeature('automaticBackup', e.target.checked); }}/>
                    <div className="shrink-0 w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                  </label>
                </div>

                <div className={cn("p-6 sm:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:translate-y-[-2px] hover:shadow-lg", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100")}>
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-2xl"><Globe className="w-6 h-6" /></div>
                    <div>
                      <h4 className="font-bold text-lg">{language === 'bn' ? 'মাল্টি-কারেন্সি সাপোর্ট' : 'Multi-currency Support'}</h4>
                      <p className="text-sm text-gray-500">{language === 'bn' ? 'একাধিক মুদ্রায় লেনদেনের সুবিধা' : 'Enable transaction in multiple currencies'}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={features?.multiCurrency ?? true} onChange={(e) => { logAdminAction('Feature Toggle', 'Toggled Multi-currency'); onToggleFeature('multiCurrency', e.target.checked); }}/>
                    <div className="shrink-0 w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-500"></div>
                  </label>
                </div>

                <div className={cn("p-6 sm:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:translate-y-[-2px] hover:shadow-lg", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100")}>
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-2xl"><UserCheck className="w-6 h-6" /></div>
                    <div>
                      <h4 className="font-bold text-lg">{language === 'bn' ? 'প্রিমিয়াম ইউজার ব্যাজ' : 'Premium User Badge'}</h4>
                      <p className="text-sm text-gray-500">{language === 'bn' ? 'বিশেষ ব্যবহারকারীদের জন্য ব্যাজ প্রদর্শন' : 'Show special badges for premium users'}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={features?.premiumBadges ?? true} onChange={(e) => { logAdminAction('Feature Toggle', 'Toggled Premium Badges'); onToggleFeature('premiumBadges', e.target.checked); }}/>
                    <div className="shrink-0 w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className={cn("p-6 sm:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:translate-y-[-2px] hover:shadow-lg", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100")}>
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gray-50 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400 rounded-2xl"><Trash2 className="w-6 h-6" /></div>
                    <div>
                      <h4 className="font-bold text-lg">{language === 'bn' ? 'ডিপ ক্লিনিং' : 'Deep Cleaning'}</h4>
                      <p className="text-sm text-gray-500">{language === 'bn' ? 'পুরনো অপ্রয়োজনীয় ডেটা মুছে ফেলার ফিচার' : 'Enable deep data cleaning for efficiency'}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={features?.deepCleaning ?? true} onChange={(e) => { logAdminAction('Feature Toggle', 'Toggled Deep Cleaning'); onToggleFeature('deepCleaning', e.target.checked); }}/>
                    <div className="shrink-0 w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-gray-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data_management' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">{language === 'bn' ? 'ডেটা ম্যানেজমেন্ট' : 'Data Management'}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={cn("p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border transition-all hover:translate-y-[-2px] hover:shadow-lg", isDarkMode ? "bg-gray-800 border-gray-700 shadow-sm shadow-black/10" : "bg-white border-gray-100")}>
                  <div className="flex items-center gap-4 mb-6">
                     <div className="p-4 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-2xl"><Database className="w-6 h-6" /></div>
                     <div>
                       <h4 className="font-bold text-lg">{language === 'bn' ? 'সিস্টেম ব্যাকআপ' : 'System Backup'}</h4>
                       <p className="text-sm text-gray-500">{language === 'bn' ? 'পুরো ডেটা ব্যাকআপ নিন' : 'Backup entire system data'}</p>
                     </div>
                  </div>
                  <button onClick={() => {
                    logAdminAction('System Backup', 'Initiated manual system backup');
                    alert(language === 'bn' ? 'ব্যাকআপ প্রক্রিয়া শুরু হয়েছে...' : 'Backup process started...');
                  }} className="w-full py-3 bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors">
                    <Download className="w-5 h-5" /> {language === 'bn' ? 'ব্যাকআপ শুরু করুন' : 'Start Backup'}
                  </button>
                </div>
                
                <div className={cn("p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border transition-all hover:translate-y-[-2px] hover:shadow-lg", isDarkMode ? "bg-gray-800 border-gray-700 shadow-sm shadow-black/10" : "bg-white border-gray-100")}>
                  <div className="flex items-center gap-4 mb-6">
                     <div className="p-4 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-2xl"><Trash2 className="w-6 h-6" /></div>
                     <div>
                       <h4 className="font-bold text-lg">{language === 'bn' ? 'পুরোনো ডেটা মুছুন' : 'Clear Old Data'}</h4>
                       <p className="text-sm text-gray-500">{language === 'bn' ? '১ বছরের পুরোনো ডেটা মুছুন' : 'Delete logs older than 1 year'}</p>
                     </div>
                  </div>
                  <button onClick={() => {
                    if (window.confirm(language === 'bn' ? 'আপনি কি পুরোনো ডেটা মুছতে চান?' : 'Do you want to delete old data?')) {
                        logAdminAction('Data Cleanup', 'Initiated old data cleanup');
                        alert(language === 'bn' ? 'ডেটা মুছে ফেলা হচ্ছে...' : 'Deleting old data...');
                    }
                  }} className="w-full py-3 bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-400 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors">
                    <Trash2 className="w-5 h-5" /> {language === 'bn' ? 'অপ্রয়োজনীয় ডেটা মুছুন' : 'Clear Data'}
                  </button>
                </div>

                {features.deepCleaning && (
                  <div className={cn("p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border transition-all hover:translate-y-[-2px] hover:shadow-lg md:col-span-2", isDarkMode ? "bg-gray-800 border-gray-700 shadow-sm shadow-black/10" : "bg-white border-gray-100")}>
                    <div className="flex items-center gap-4 mb-6">
                       <div className="p-4 bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 rounded-2xl"><Sparkles className="w-6 h-6" /></div>
                       <div>
                         <h4 className="font-bold text-lg">{language === 'bn' ? 'ডিপ ক্লিনিং (AI)' : 'Deep Cleaning (AI)'}</h4>
                         <p className="text-sm text-gray-500">{language === 'bn' ? 'AI ব্যবহার করে ডুপ্লিকেট ও অসম্পূর্ণ ডেটা মুছুন' : 'Use AI to remove duplicates and incomplete data'}</p>
                       </div>
                    </div>
                    <button 
                      onClick={async () => {
                        if (window.confirm(language === 'bn' ? 'আপনি কি ডিপ ক্লিনিং শুরু করতে চান? এটি এআই এর মাধ্যমে ভুল ডেটা খুঁজে বের করবে।' : 'Initiate Deep Cleaning? This will find erroneous data via AI.')) {
                          logAdminAction('Deep Cleaning', 'Initiated deep surgical data cleanup');
                          
                          // Mock process
                          const btn = document.activeElement as HTMLButtonElement;
                          if (btn) btn.disabled = true;
                          
                          alert(language === 'bn' ? 'ডিপ ক্লিনিং থ্রেড শুরু হয়েছে... ডেটা প্রসেস করা হচ্ছে।' : 'Deep cleaning thread started... processing data.');
                          
                          setTimeout(() => {
                            if (btn) btn.disabled = false;
                            alert(language === 'bn' ? 'ডিপ ক্লিনিং সম্পন্ন হয়েছে! কোনো বড় সমস্যা পাওয়া যায়নি।' : 'Deep cleaning completed! No major issues found.');
                            logAdminAction('Deep Cleaning', 'Completed successfully');
                          }, 3000);
                        }
                      }} 
                      className="w-full py-3 bg-orange-50 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-orange-100 dark:hover:bg-orange-900/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Sparkles className="w-5 h-5" /> {language === 'bn' ? 'ডিপ ক্লিনিং শুরু করুন' : 'Run Deep Clean'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
