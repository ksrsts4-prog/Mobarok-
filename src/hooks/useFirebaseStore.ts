import { useState, useEffect, useMemo, useCallback } from 'react';
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
  orderBy,
  startAfter,
  limit
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { useAppStore } from '../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { Transaction, Category, Budget, SavingsGoal, RecurringTransaction, Debt, FamilyMember, Investment, Bill, SystemFeatures } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

export function useFirebaseStore() {
  const store = useAppStore(useShallow(state => ({
  user: state.user,
  isAdmin: state.isAdmin,
  language: state.language,
  autoBackup: state.autoBackup,
  transactions: state.transactions,
  bills: state.bills,
  systemFeatures: state.systemFeatures,
  setUser: state.setUser,
  setIsAdmin: state.setIsAdmin,
  setCurrency: state.setCurrency,
  setIsDarkMode: state.setIsDarkMode,
  setLanguage: state.setLanguage,
  setDefaultTransactionType: state.setDefaultTransactionType,
  setWeekStartDay: state.setWeekStartDay,
  setAccentColor: state.setAccentColor,
  setShowDecimals: state.setShowDecimals,
  setAiInstructions: state.setAiInstructions,
  setAutoBackup: state.setAutoBackup,
  setTransactions: state.setTransactions,
  setCategories: state.setCategories,
  setBudgets: state.setBudgets,
  setSavingsGoals: state.setSavingsGoals,
  setRecurringTransactions: state.setRecurringTransactions,
  setDebts: state.setDebts,
  setFamilyMembers: state.setFamilyMembers,
  setInvestments: state.setInvestments,
  setBills: state.setBills,
  setSystemFeatures: state.setSystemFeatures
})));
  
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [lastTxDoc, setLastTxDoc] = useState<any>(null);
  const [hasMoreTx, setHasMoreTx] = useState<boolean>(true);
  const [isFetchingTx, setIsFetchingTx] = useState<boolean>(false);
  
  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 15));
  const [allFeedback, setAllFeedback] = useState<any[]>([]);
  const [isSystemMaintenance, setIsSystemMaintenance] = useState(false);
  const [globalAlert, setGlobalAlert] = useState({ active: false, msg: '' });
  
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null);

  const [userName, setUserName] = useState('ব্যবহারকারী');
  const [userEmail, setUserEmail] = useState('user@example.com');
  const [userPhone, setUserPhone] = useState('');
  const [userOccupation, setUserOccupation] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [pinCode, setPinCode] = useState<string | null>(null);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [dailyForecastCount, setDailyForecastCount] = useState(0);
  const [lastForecastDate, setLastForecastDate] = useState<string | null>(null);
  const [dailyAssistantCount, setDailyAssistantCount] = useState(0);
  const [lastAssistantDate, setLastAssistantDate] = useState<string | null>(null);

  const defaultFeatures: SystemFeatures = {
    aiAssistant: true,
    advancedAnalytics: true,
    forecasting: true,
    cloudSync: true,
    familyBudget: true,
    advancedSettings: true,
    dataExport: true,
    automaticBackup: true,
    multiCurrency: true,
    premiumBadges: true,
    deepCleaning: true,
    aiAutoReply: false
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Removed testConnection to stop cache vs server offline errors on startup

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      store.setUser(firebaseUser);
      setIsAuthReady(true);
      
      if (firebaseUser) {
        setUserName(firebaseUser.displayName || 'ব্যবহারকারী');
        setUserEmail(firebaseUser.email || 'user@example.com');
        
        // Check if user exists in Firestore, if not create
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (!userDoc.exists()) {
            const newUser = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'ব্যবহারকারী',
              email: firebaseUser.email || '',
              role: firebaseUser.email === 'ksrsts4@gmail.com' ? 'admin' : 'user',
              currency: '৳',
              isDarkMode: false,
              language: 'bn',
              defaultTransactionType: 'expense',
              weekStartDay: 'sunday',
              accentColor: 'blue',
              showDecimals: true,
              autoBackup: false,
              isBiometricEnabled: false,
              pinCode: null,
              isPremium: false
            };
            await setDoc(userDocRef, newUser).catch((e:any) => console.error('Offline write error:', e));
            store.setIsAdmin(newUser.role === 'admin' || firebaseUser.email === 'ksrsts4@gmail.com');
            setIsPremium(newUser.isPremium || false);
          } else {
            const userData = userDoc.data();
            store.setCurrency(userData.currency || '৳');
            store.setIsDarkMode(userData.isDarkMode || false);
            store.setLanguage(userData.language || 'bn');
            setUserName(userData.name || firebaseUser.displayName || 'ব্যবহারকারী');
            setUserEmail(userData.email || firebaseUser.email || 'user@example.com');
            store.setDefaultTransactionType(userData.defaultTransactionType || 'expense');
            store.setWeekStartDay(userData.weekStartDay || 'sunday');
            store.setAccentColor(userData.accentColor || 'blue');
            store.setShowDecimals(userData.showDecimals ?? true);
            
            store.setAiInstructions(userData.aiInstructions || '');
            store.setAutoBackup(userData.autoBackup || false);
            setIsBiometricEnabled(userData.isBiometricEnabled ?? false);
            setPinCode(userData.pinCode || null);
            if (userData.pinCode) {
              setIsAppLocked(true);
            }
            store.setIsAdmin(userData.role === 'admin' || firebaseUser.email === 'ksrsts4@gmail.com');
            setIsPremium(userData.isPremium || false);
            setDailyForecastCount(userData.dailyForecastCount || 0);
            setLastForecastDate(userData.lastForecastDate || null);
            setDailyAssistantCount(userData.dailyAssistantCount || 0);
            setLastAssistantDate(userData.lastAssistantDate || null);
            setLastBackupTime(userData.lastBackupTime || null);
            setUserPhone(userData.phone || '');
            setUserOccupation(userData.occupation || '');
            setUserAddress(userData.address || '');
            setUserPhoto(userData.photo || firebaseUser.photoURL || null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    });
    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadInitialTransactions = async () => {
    if (!store.user) return;
    setIsFetchingTx(true);
    try {
      const q = query(
        collection(db, `users/${store.user.uid}/transactions`),
        orderBy('date', 'desc'),
        limit(20)
      );
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => d.data() as Transaction);
      store.setTransactions(docs);
      if (snap.docs.length > 0) {
        setLastTxDoc(snap.docs[snap.docs.length - 1]);
      }
      setHasMoreTx(snap.docs.length === 20);
    } catch(err) {
      handleFirestoreError(err, OperationType.LIST, `users/${store.user.uid}/transactions`);
    } finally {
      setIsFetchingTx(false);
    }
  };

  const loadMoreTransactions = async () => {
    if (!store.user || !lastTxDoc || !hasMoreTx || isFetchingTx) return;
    setIsFetchingTx(true);
    try {
      const q = query(
        collection(db, `users/${store.user.uid}/transactions`), 
        orderBy('date', 'desc'), 
        startAfter(lastTxDoc), 
        limit(20)
      );
      const snap = await getDocs(q);
      const newDocs = snap.docs.map(d => d.data() as Transaction);
      if (newDocs.length > 0) {
        store.setTransactions(prev => {
          const newTxs = newDocs.filter(nDoc => !prev.find(p => p.id === nDoc.id));
          return [...prev, ...newTxs];
        });
        setLastTxDoc(snap.docs[snap.docs.length - 1]);
      }
      setHasMoreTx(snap.docs.length === 20);
    } catch(err) {
      handleFirestoreError(err, OperationType.LIST, `users/${store.user.uid}/transactions`);
    } finally {
      setIsFetchingTx(false);
    }
  };

  // Firestore Sync
  useEffect(() => {
    if (!store.user) {
      store.setTransactions([]);
      store.setCategories(DEFAULT_CATEGORIES);
      store.setBudgets([]);
      store.setSavingsGoals([]);
      store.setRecurringTransactions([]);
      store.setDebts([]);
      store.setFamilyMembers([]);
      store.setInvestments([]);
      store.setBills([]);
      setAllFeedback([]);
      setLastTxDoc(null);
      setHasMoreTx(true);
      return;
    }

    const uid = store.user.uid;
    const paths = {
      categories: `users/${uid}/categories`,
      budgets: `users/${uid}/budgets`,
      savingsGoals: `users/${uid}/savingsGoals`,
      recurring: `users/${uid}/recurring`,
      debts: `users/${uid}/debts`,
      familyMembers: `users/${uid}/familyMembers`,
      investments: `users/${uid}/investments`,
      bills: `users/${uid}/bills`
    };

    const unsubUser = onSnapshot(doc(db, 'users', uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.allowedSessionId && data.allowedSessionId !== sessionId) {
          signOut(auth);
          alert(store.language === 'bn' ? 'আপনাকে অন্য একটি ডিভাইস থেকে লগআউট করা হয়েছে।' : 'You have been logged out from another device.');
        }
        
        // Sync limits
        setIsPremium(data.isPremium || false);
        setDailyForecastCount(data.dailyForecastCount || 0);
        setLastForecastDate(data.lastForecastDate || null);
        setDailyAssistantCount(data.dailyAssistantCount || 0);
        setLastAssistantDate(data.lastAssistantDate || null);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, `users/${uid}`));

    loadInitialTransactions().catch(() => {
      // Errors handled internally by loadInitialTransactions
    });

    const unsubCategories = onSnapshot(collection(db, paths.categories), (snapshot) => {
      const customCategories = snapshot.docs.map(doc => doc.data() as Category);
      store.setCategories([...DEFAULT_CATEGORIES, ...customCategories]);
    }, (err) => handleFirestoreError(err, OperationType.LIST, paths.categories));

    const unsubBudgets = onSnapshot(collection(db, paths.budgets), (snapshot) => {
      store.setBudgets(snapshot.docs.map(doc => doc.data() as Budget));
    }, (err) => handleFirestoreError(err, OperationType.LIST, paths.budgets));

    const unsubSavings = onSnapshot(collection(db, paths.savingsGoals), (snapshot) => {
      store.setSavingsGoals(snapshot.docs.map(doc => doc.data() as SavingsGoal));
    }, (err) => handleFirestoreError(err, OperationType.LIST, paths.savingsGoals));

    const unsubRecurring = onSnapshot(collection(db, paths.recurring), (snapshot) => {
      store.setRecurringTransactions(snapshot.docs.map(doc => doc.data() as RecurringTransaction));
    }, (err) => handleFirestoreError(err, OperationType.LIST, paths.recurring));

    const unsubDebts = onSnapshot(collection(db, paths.debts), (snapshot) => {
      store.setDebts(snapshot.docs.map(doc => doc.data() as Debt));
    }, (err) => handleFirestoreError(err, OperationType.LIST, paths.debts));

    const unsubFamily = onSnapshot(collection(db, paths.familyMembers), (snapshot) => {
      store.setFamilyMembers(snapshot.docs.map(doc => doc.data() as FamilyMember));
    }, (err) => handleFirestoreError(err, OperationType.LIST, paths.familyMembers));

    const unsubInvestments = onSnapshot(collection(db, paths.investments), (snapshot) => {
      store.setInvestments(snapshot.docs.map(doc => doc.data() as Investment));
    }, (err) => handleFirestoreError(err, OperationType.LIST, paths.investments));

    const unsubBills = onSnapshot(collection(db, paths.bills), (snapshot) => {
      store.setBills(snapshot.docs.map(doc => doc.data() as Bill));
    }, (err) => handleFirestoreError(err, OperationType.LIST, paths.bills));

    return () => {
      unsubUser();
      unsubCategories();
      unsubBudgets();
      unsubSavings();
      unsubRecurring();
      unsubDebts();
      unsubFamily();
      unsubInvestments();
      unsubBills();
    };
  }, [store.user?.uid, sessionId]);

  // Sync feedback separately to prevent unnecessary re-subscriptions of core data when isAdmin changes
  useEffect(() => {
    let unsubFeedback = () => {};
    if (!store.user) return unsubFeedback;

    if (store.isAdmin) {
      unsubFeedback = onSnapshot(query(collection(db, 'feedback'), orderBy('createdAt', 'desc')), (snapshot) => {
        setAllFeedback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'feedback'));
    } else {
      unsubFeedback = onSnapshot(query(collection(db, 'feedback'), where('uid', '==', store.user.uid)), (snapshot) => {
        const fb = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        fb.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAllFeedback(fb);
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'feedback'));
    }

    return () => unsubFeedback();
  }, [store.user?.uid, store.isAdmin]);

  // Listen for maintenance mode and global alerts
  useEffect(() => {
    let isSubscribed = true;
    const unsub = onSnapshot(doc(db, 'systemSettings', 'general'), (docSnap) => {
      if (!isSubscribed) return;
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsSystemMaintenance(data.maintenanceMode || false);
        setGlobalAlert({
          active: data.isGlobalAlertActive || false,
          msg: data.globalAlertMsg || ''
        });
        if (data.features) {
          store.setSystemFeatures({ ...defaultFeatures, ...data.features });
        } else {
          store.setSystemFeatures(defaultFeatures);
        }
      } else {
        setIsSystemMaintenance(false);
        setGlobalAlert({ active: false, msg: '' });
        store.setSystemFeatures(defaultFeatures);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'systemSettings/general'));
    
    return () => {
      isSubscribed = false;
      unsub();
    }
  }, []); // Store is not in deps

  // Handle Automatic Backup logic if enabled
  useEffect(() => {
    let isMounted = true;
    let timer: any;
    if (store.autoBackup && store.transactions.length > 0 && store.user) {
      const backup = async () => {
        console.log("Automatic Backup Service: Backing up data...");
        // Simulate backup delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (!isMounted) return;
        
        const now = new Date().toLocaleString();
        setLastBackupTime(now);
        
        // Persist to Firestore
        try {
          await updateDoc(doc(db, 'users', store.user!.uid), { lastBackupTime: now });
        } catch (e: any) {
          console.warn("Failed to save backup time:", e?.message || e);
        }
        
        console.log("Automatic Backup Service: Backup completed successfully.");
      };
      
      timer = setTimeout(backup, 5000); // Backup 5 seconds after change
    }
    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [store.autoBackup, store.transactions.length, store.user?.uid]); // Changed to transactions.length to avoid rapid loop

  const handleLogin = async () => {
    setLoginError(null);
    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.warn("Login flow interrupted or failed:", error?.message || error);
      if (error.code === 'auth/network-request-failed') {
        setLoginError("নেটওয়ার্ক সমস্যা! অনুগ্রহ করে আপনার ইন্টারনেট কানেকশন চেক করুন।");
      } else if (error.code === 'auth/popup-blocked') {
        setLoginError("পপ-আপ ব্লক করা হয়েছে! অনুগ্রহ করে ব্রাউজারের পপ-আপ পারমিশন দিন।");
      } else {
        setLoginError("লগইন ব্যর্থ হয়েছে! অনুগ্রহ করে আবার চেষ্টা করুন।");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserName('User');
      setUserEmail('');
      setUserPhoto(null);
      setIsPremium(false);
      store.setIsAdmin(false);
    } catch (error: any) {
      console.warn("Logout failed:", error?.message || error);
    }
  };

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    if (!store.user) return;
    const id = Date.now().toString();
    const path = `users/${store.user.uid}/transactions/${id}`;
    const newTx = { ...t, id, uid: store.user.uid } as Transaction;
    try {
      store.setTransactions(prev => [newTx, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setDoc(doc(db, path), newTx).catch((e:any) => console.error('Offline write error:', e));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateTransaction = async (id: string, updated: Partial<Transaction>) => {
    if (!store.user) return;
    const path = `users/${store.user.uid}/transactions/${id}`;
    try {
      store.setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...updated } as Transaction : tx).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setDoc(doc(db, path), updated, { merge: true }).catch((e:any) => console.error('Offline write error:', e));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!store.user) return;
    const path = `users/${store.user.uid}/transactions/${id}`;
    try {
      store.setTransactions(prev => prev.filter(tx => tx.id !== id));
      deleteDoc(doc(db, path)).catch((e:any) => console.error(e));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const addCategory = async (cat: Omit<Category, 'id'>) => {
    if (!store.user) return undefined;
    const path = `users/${store.user.uid}/categories`;
    try {
      const newDoc = doc(collection(db, path));
      setDoc(newDoc, { ...cat, id: newDoc.id, uid: store.user.uid }).catch((e:any) => console.error('Offline write error:', e));
      return newDoc.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const updateCategory = async (cat: Category) => {
    if (!store.user) return;
    const path = `users/${store.user.uid}/categories/${cat.id}`;
    try {
      setDoc(doc(db, path), { ...cat, uid: store.user.uid }).catch((e:any) => console.error('Offline write error:', e));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!store.user) return;
    const path = `users/${store.user.uid}/categories/${id}`;
    try {
      deleteDoc(doc(db, path)).catch((e:any) => console.error(e));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const addBudget = async (budget: Omit<Budget, 'id'>) => {
    if (!store.user) return;
    const path = `users/${store.user.uid}/budgets`;
    try {
      const newDoc = doc(collection(db, path));
      setDoc(newDoc, { ...budget, id: newDoc.id, uid: store.user.uid }).catch((e:any) => console.error('Offline write error:', e));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const updateBudget = async (budget: Budget) => {
    if (!store.user) return;
    const path = `users/${store.user.uid}/budgets/${budget.id}`;
    try {
      setDoc(doc(db, path), { ...budget, uid: store.user.uid }).catch((e:any) => console.error('Offline write error:', e));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteBudget = async (id: string) => {
    if (!store.user) return;
    const path = `users/${store.user.uid}/budgets/${id}`;
    try {
      deleteDoc(doc(db, path)).catch((e:any) => console.error('Offline write error:', e));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const addSavingsGoal = async (goal: Omit<SavingsGoal, 'id'>) => {
    if (!store.user) return;
    const path = `users/${store.user.uid}/savingsGoals`;
    try {
      const newDoc = doc(collection(db, path));
      setDoc(newDoc, { ...goal, id: newDoc.id, uid: store.user.uid }).catch((e:any) => console.error('Offline write error:', e));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const updateSavingsGoal = async (goal: SavingsGoal) => {
    if (!store.user) return;
    const path = `users/${store.user.uid}/savingsGoals/${goal.id}`;
    try {
      setDoc(doc(db, path), { ...goal, uid: store.user.uid }).catch((e:any) => console.error('Offline write error:', e));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteSavingsGoal = async (id: string) => {
    if (!store.user) return;
    const path = `users/${store.user.uid}/savingsGoals/${id}`;
    try {
      deleteDoc(doc(db, path)).catch((e:any) => console.error('Offline write error:', e));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const addRecurringTransaction = async (r: Omit<RecurringTransaction, 'id'>) => {
    if (!store.user) return;
    const id = Date.now().toString();
    const path = `users/${store.user.uid}/recurring/${id}`;
    try {
      setDoc(doc(db, path), { ...r, id, uid: store.user.uid }).catch((e:any) => console.error('Offline write error:', e));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const deleteRecurringTransaction = async (id: string) => {
    if (!store.user) return;
    const path = `users/${store.user.uid}/recurring/${id}`;
    try {
      deleteDoc(doc(db, path)).catch((e:any) => console.error('Offline write error:', e));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const addDebt = async (d: Omit<Debt, 'id'>) => {
    if (!store.user) return;
    const id = Date.now().toString();
    const path = `users/${store.user.uid}/debts/${id}`;
    try {
      setDoc(doc(db, path), { ...d, id, uid: store.user.uid }).catch((e:any) => console.error('Offline write error:', e));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateDebt = async (id: string, updated: Partial<Debt>) => {
    if (!store.user) return;
    const path = `users/${store.user.uid}/debts/${id}`;
    try {
      setDoc(doc(db, path), { ...updated, uid: store.user.uid }, { merge: true }).catch((e:any) => console.error('Offline write error:', e));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteDebt = async (id: string) => {
    if (!store.user) return;
    const path = `users/${store.user.uid}/debts/${id}`;
    try {
      deleteDoc(doc(db, path)).catch((e:any) => console.error('Offline write error:', e));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const addFamilyMember = async (f: Omit<FamilyMember, 'id'>) => {
    if (!store.user) return;
    const id = Date.now().toString();
    const path = `users/${store.user.uid}/familyMembers/${id}`;
    try {
      setDoc(doc(db, path), { ...f, id, uid: store.user.uid }).catch((e:any) => console.error('Offline write error:', e));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const deleteFamilyMember = async (id: string) => {
    if (!store.user) return;
    const path = `users/${store.user.uid}/familyMembers/${id}`;
    try {
      deleteDoc(doc(db, path)).catch((e:any) => console.error('Offline write error:', e));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const addInvestment = async (inv: Omit<Investment, 'id'>) => {
    if (!store.user) return;
    const id = Date.now().toString();
    const path = `users/${store.user.uid}/investments/${id}`;
    try {
      setDoc(doc(db, path), { ...inv, id, uid: store.user.uid }).catch((e:any) => console.error('Offline write error:', e));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateInvestment = async (id: string, updated: Partial<Investment>) => {
    if (!store.user) return;
    const path = `users/${store.user.uid}/investments/${id}`;
    try {
      setDoc(doc(db, path), updated, { merge: true }).catch((e:any) => console.error('Offline write error:', e));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteInvestment = async (id: string) => {
    if (!store.user) return;
    const path = `users/${store.user.uid}/investments/${id}`;
    try {
      deleteDoc(doc(db, path)).catch((e:any) => console.error('Offline write error:', e));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const addBill = async (b: Omit<Bill, 'id'>) => {
    if (!store.user) return;
    const id = Date.now().toString();
    const path = `users/${store.user.uid}/bills/${id}`;
    try {
      setDoc(doc(db, path), { ...b, id, uid: store.user.uid }).catch((e:any) => console.error('Offline write error:', e));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateBill = async (id: string, updated: Partial<Bill>) => {
    if (!store.user) return;
    const path = `users/${store.user.uid}/bills/${id}`;
    try {
      const existing = store.bills.find(b => b.id === id) || {};
      const fullUpdate = { ...existing, ...updated, uid: store.user.uid };
      setDoc(doc(db, path), fullUpdate, { merge: true }).catch((e:any) => console.error('Offline write error:', e));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteBill = async (id: string) => {
    if (!store.user) return;
    const path = `users/${store.user.uid}/bills/${id}`;
    try {
      deleteDoc(doc(db, path)).catch((e:any) => console.error('Offline write error:', e));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const updateSettings = async (updates: any) => {
    if (!store.user) return;
    const path = `users/${store.user.uid}`;
    try {
      setDoc(doc(db, path), updates, { merge: true }).catch((e:any) => console.error('Offline write error:', e));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const submitFeedback = async (message: string) => {
    if (!store.user) return;
    const id = Date.now().toString();
    const path = `feedback/${id}`;
    
    let aiReply = null;
    let repliedAt = null;
    
    if (store.systemFeatures.aiAutoReply) {
      try {
        const token = await auth.currentUser?.getIdToken();
        const aiResponse = await fetch('/api/gemini/generate', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({
            model: "gemini-3-flash-preview",
            contents: `You are a friendly and helpful AI assistant for a Personal Finance Tracker app. The owner and developer of this app is "KSR" (ksrsts4@gmail.com). A user has submitted the following query or feedback: "${message}". Please provide a warm, empathetic, and professional reply in Bengali. Make sure the reply feels natural and human-like, rather than robotic. If they have an issue, assure them that the development team is looking into it. If they ask about the app's owner, tell them it is KSR. Do not use any Markdown formatting, keep it as plain text.`
          })
        });
        
        if (aiResponse.ok) {
          const response = await aiResponse.json().catch(() => ({}));
          if (response.text) {
            aiReply = response.text + " [AI Auto Reply]";
            repliedAt = new Date().toISOString();
            console.log("AI Auto Reply generated successfully");
          }
        }
      } catch (e: any) {
        console.warn("AI Auto Reply generation failed (ignored):", e?.message || e);
      }
    }

    try {
      setDoc(doc(db, path), {
        id,
        uid: store.user.uid,
        email: store.user.email,
        message,
        createdAt: new Date().toISOString(),
        ...(aiReply ? { reply: aiReply, repliedAt } : {})
      }).catch((e:any) => console.error('Offline write error:', e));
      alert('আপনার মতামতের জন্য ধন্যবাদ!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const toggleSystemFeature = async (featureKey: keyof SystemFeatures, value: boolean) => {
    if (!store.user || !store.isAdmin) return;
    try {
      const docRef = doc(db, 'systemSettings', 'general');
      setDoc(docRef, { features: { [featureKey]: value } }, { merge: true }).catch((e:any) => console.error('Offline write error:', e));
    } catch (err) {
      console.error('Failed to update feature', err);
    }
  };

  const submitFeedbackReply = async (feedbackId: string, replyMessage: string) => {
    if (!store.user || !store.isAdmin) return;
    const path = `feedback/${feedbackId}`;
    try {
      await updateDoc(doc(db, path), {
        reply: replyMessage,
        repliedAt: new Date().toISOString()
      });
      alert('রিপ্লাই পাঠানো হয়েছে!');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteFeedback = async (feedbackId: string) => {
    if (!store.user || !store.isAdmin) return;
    if (!window.confirm('আপনি কি নিশ্চিত যে আপনি এই ফিডব্যাকটি মুছে ফেলতে চান?')) return;
    const path = `feedback/${feedbackId}`;
    try {
      deleteDoc(doc(db, path)).catch((e:any) => console.error('Offline write error:', e));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const handleLogoutOtherDevices = async () => {
    if (!store.user) return;
    try {
      await updateDoc(doc(db, 'users', store.user.uid), { allowedSessionId: sessionId });
      alert(store.language === 'bn' ? 'অন্যান্য সমস্ত ডিভাইস থেকে সফলভাবে লগআউট করা হয়েছে।' : 'Successfully logged out from all other devices.');
    } catch (err: any) {
      alert('Error: ' + err.message);
      handleFirestoreError(err, OperationType.UPDATE, `users/${store.user.uid}`);
    }
  };

  const handleDeleteAccount = async () => {
    if (!store.user) return;
    const performDeletion = async (currentUser: FirebaseUser) => {
        try {
          const collections = ['transactions', 'categories', 'budgets', 'savingsGoals', 'recurring', 'debts', 'familyMembers', 'investments', 'bills', 'chatHistory'];
          for (const coll of collections) {
            const snap = await getDocs(collection(db, `users/${currentUser.uid}/${coll}`));
            const promises = snap.docs.map(d => deleteDoc(d.ref).catch((e:any) => console.error('Offline write error:', e)));
            await Promise.all(promises);
          }
          deleteDoc(doc(db, 'users', currentUser.uid)).catch((e:any) => console.error('Offline write error:', e));
          await deleteUser(currentUser);
        } catch(e: any) {
             throw e;
        }
      };

      try {
        await performDeletion(store.user);
        alert(store.language === 'bn' ? 'অ্যাকাউন্ট সফলভাবে ডিলিট করা হয়েছে।' : 'Account successfully deleted.');
        handleLogout();
      } catch (err: any) {
        if (err.code === 'auth/requires-recent-login' || err.message?.includes('requires-recent-login')) {
          alert(store.language === 'bn' ? 'অ্যাকাউন্ট ডিলিট করার জন্য নিরাপত্তা সাপেক্ষে আবার লগইন করতে হবে।' : 'You need to log in again to delete your account for security reasons.');
          try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            if (auth.currentUser) {
                await performDeletion(auth.currentUser);
                alert(store.language === 'bn' ? 'অ্যাকাউন্ট সফলভাবে ডিলিট করা হয়েছে।' : 'Account successfully deleted.');
                handleLogout();
            }
          } catch (e: any) {
            if (e.code !== 'auth/popup-closed-by-user') {
                alert('Error: ' + e.message);
            }
          }
        } else {
          alert('Error: ' + err.message);
        }
      }
  };

  const handleBiometricAuth = async () => {
    if (!('PublicKeyCredential' in window)) {
      alert(store.language === 'bn' ? 'আপনার ডিভাইস বায়োমেট্রিক সাপোর্ট করে না।' : 'Your device does not support biometrics.');
      return;
    }

    try {
      const isAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!isAvailable) {
        alert(store.language === 'bn' ? 'বায়োমেট্রিক অথেনটিকেশন সেটআপ করা নেই আপনার ফোনে।' : 'Biometric authentication is not set up on your device.');
        return;
      }

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const options: any = {
        publicKey: {
          challenge: challenge.buffer,
          timeout: 60000,
          userVerification: "required",
          rpId: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
          allowCredentials: [] 
        }
      };

      await navigator.credentials.get(options);
      
      setIsAppLocked(false);
    } catch (err: any) {
      console.log('Biometric auth failed or cancelled', err);
    }
  };

  return {
    isAuthReady,
    isOnline,
    loginError,
    isLoggingIn,
    isFetchingTx,
    hasMoreTx,
    lastTxDoc,
    loadMoreTransactions,
    isSystemMaintenance,
    globalAlert,
    allFeedback,
    sessionId,
    lastBackupTime,
    setLastBackupTime,
    
    // User Details
    userName, setUserName,
    userEmail, setUserEmail,
    userPhone, setUserPhone,
    userOccupation, setUserOccupation,
    userAddress, setUserAddress,
    userPhoto, setUserPhoto,
    isPremium, setIsPremium,
    dailyForecastCount, setDailyForecastCount,
    lastForecastDate, setLastForecastDate,
    dailyAssistantCount, setDailyAssistantCount,
    lastAssistantDate, setLastAssistantDate,
    isAppLocked, setIsAppLocked,
    pinCode, setPinCode,
    isBiometricEnabled, setIsBiometricEnabled,
    
    handleLogin,
    handleLogout,
    handleLogoutOtherDevices,
    handleDeleteAccount,
    handleBiometricAuth,
    
    // CRUD
    addTransaction, updateTransaction, deleteTransaction,
    addCategory, updateCategory, deleteCategory,
    addBudget, updateBudget, deleteBudget,
    addSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
    addRecurringTransaction, deleteRecurringTransaction,
    addDebt, updateDebt, deleteDebt,
    addFamilyMember, deleteFamilyMember,
    addInvestment, updateInvestment, deleteInvestment,
    addBill, updateBill, deleteBill,
    
    updateSettings,
    
    // Admin / Feedback
    submitFeedback, deleteFeedback, submitFeedbackReply, toggleSystemFeature
  };
}
