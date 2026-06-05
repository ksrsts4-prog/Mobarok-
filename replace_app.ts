import fs from 'fs';

const appPath = './src/App.tsx';
let content = fs.readFileSync(appPath, 'utf8');

const regex = /function App\(\) \{([\s\S]*?)return \(/;

const newBody = `
  const store = useAppStore();
  const { 
    user, isAdmin, transactions, categories, budgets, savingsGoals, 
    recurringTransactions, debts, familyMembers, investments, bills,
    currency, language, isDarkMode, accentColor, showDecimals, aiInstructions, 
    systemFeatures, defaultTransactionType, weekStartDay 
  } = store;

  const fbStore = useFirebaseStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'summary' | 'categories' | 'budgets' | 'settings' | 'savings' | 'reports' | 'feedback_admin' | 'recurring' | 'debts' | 'family' | 'investments' | 'bills' | 'forecasting' | 'about' | 'advanced_charts' | 'monthly_overview' | 'gamification' | 'split_bills'>('dashboard');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [showForgotPinConfirm, setShowForgotPinConfirm] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0
    });
  };

  const totalBalance = useMemo(() => {
    return transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
  }, [transactions]);

  const incomeThisMonth = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return transactions
      .filter(t => t.type === 'income' && isWithinInterval(parseISO(t.date), { start, end }))
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const expenseThisMonth = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return transactions
      .filter(t => t.type === 'expense' && isWithinInterval(parseISO(t.date), { start, end }))
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  if (!fbStore.isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center justify-center gap-6 relative z-10"
        >
          <AppLogo className="w-24 h-24 shadow-2xl rounded-3xl" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full shadow-lg"
          />
        </motion.div>
      </div>
    );
  }

  if (fbStore.isSystemMaintenance && !isAdmin) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center p-6", isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900")}>
        <div className="max-w-md w-full bg-yellow-100 p-8 rounded-[32px] text-center space-y-4">
          <div className="w-16 h-16 bg-yellow-200 text-yellow-700 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-yellow-800">{language === 'bn' ? 'মেইনটেন্যান্স চলছে' : 'System Maintenance'}</h2>
          <p className="text-yellow-700">{language === 'bn' ? 'অ্যাপটি সাময়িক সময়ের জন্য বন্ধ রাখা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।' : 'The application is temporarily down for maintenance. Please try again later.'}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F4F7FE] to-[#E2E8F0] p-6 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>

        <div className="max-w-6xl w-full flex flex-col md:flex-row gap-8 items-center justify-center relative z-10">
          
          {/* Left Side: Welcoming Text / Features (Hidden on mobile) */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="hidden md:flex flex-col flex-1 items-start justify-center pr-10 border-r border-gray-200"
          >
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-200">
               <AppLogo className="w-12 h-12 text-white shadow-none" />
            </div>
            <h1 className="text-5xl font-extrabold text-[#1B2559] leading-tight mb-6">
              আপনার আর্থিক অবস্থা <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                মুঠোফোনে নিয়ন্ত্রণ করুন
              </span>
            </h1>
            <p className="text-lg text-gray-500 mb-8 max-w-md">
              আায় এবং ব্যয়ের পুঙ্খানুপুঙ্খ হিসাব রাখুন। রিয়েল-টাইম ড্যাশবোর্ড, সুন্দর চার্ট, এবং স্মার্ট ফিল্টারিং দিয়ে নিজের সঞ্চয় বাড়ান।
            </p>
            
            <div className="flex flex-col gap-4 w-full">
              {[
                { icon: 'ShieldCheck', title: '১০০% নিরাপদ', desc: 'আপনার ডেটা ফায়ারবেস ক্লাউডে সুরক্ষিত থাকে' },
                { icon: 'Zap', title: 'দ্রুত এবং সহজ', desc: 'কয়েক সেকেন্ডে আয় বা ব্যয় যোগ করুন' },
                { icon: 'LineChart', title: 'বিশ্লেষণ', desc: 'প্রতি মাসের আর্থিক চিত্র দেখুন এডভান্সড চার্ট এর মাধ্যমে' }
              ].map((feature, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  key={i} className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl"
                >
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <IconComponent name={feature.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1B2559]">{feature.title}</h3>
                    <p className="text-sm text-gray-500">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side: Login Box */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-md bg-white/80 backdrop-blur-xl p-10 rounded-[40px] shadow-2xl border border-white/50 text-center space-y-8 flex-shrink-0"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="md:hidden flex justify-center mb-0"
            >
              <AppLogo className="w-24 h-24 shadow-2xl" />
            </motion.div>
            
            <div className="space-y-3">
              <h2 className="text-4xl font-extrabold text-[#1B2559] tracking-tight md:text-3xl">স্বাগতম</h2>
              <p className="text-gray-500 font-medium text-lg md:text-base">একাউন্টে লগইন করতে Google নির্বাচন করুন</p>
            </div>

            <div className="pt-4">
              <button 
                onClick={fbStore.handleLogin}
                disabled={fbStore.isLoggingIn}
                className={cn(
                  "w-full py-4 bg-white border-2 border-gray-100 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-blue-100 hover:shadow-md transition-all duration-300 active:scale-[0.98]",
                  fbStore.isLoggingIn && "opacity-70 cursor-not-allowed"
                )}
              >
                {fbStore.isLoggingIn ? (
                  <div className="flex items-center gap-3 text-blue-600">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"
                    />
                    <span>লগইন হচ্ছে...</span>
                  </div>
                ) : (
                  <>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" alt="Google" className="w-6 h-6" />
                    <span className="text-gray-700">Google দিয়ে লগইন করুন</span>
                  </>
                )}
              </button>
            </div>

            {fbStore.loginError && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-left leading-tight">{fbStore.loginError}</span>
              </motion.div>
            )}

            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 font-medium">লগইন করার মাধ্যমে আপনি আমাদের শর্তাবলী মেনে নিচ্ছেন।</p>
            </div>
          </motion.div>

        </div>
      </div>
    );
  }

  if (fbStore.isAppLocked && fbStore.pinCode) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center p-6", isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900")}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn("w-full max-w-md p-10 rounded-[40px] text-center shadow-2xl relative overflow-hidden", isDarkMode ? "bg-gray-800" : "bg-white")}
        >
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-500/10 to-transparent"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
              <Lock className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold mb-3">{language === 'bn' ? 'অ্যাপ আনলক করুন' : 'Unlock App'}</h2>
            <p className={cn("mb-10", isDarkMode ? "text-gray-400" : "text-gray-500")}>
              {language === 'bn' ? 'আপনার ৪ ডিজিটের পিন কোড দিন' : 'Enter your 4 digit PIN code'}
            </p>
            
            <div className="flex justify-center gap-4 mb-8">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={cn("w-4 h-4 rounded-full transition-all duration-300", enteredPin.length > i ? "bg-blue-600 scale-110" : (isDarkMode ? "bg-gray-700" : "bg-gray-200") )} />
              ))}
            </div>
            
            <input 
              type="password"
              maxLength={4}
              value={enteredPin}
              className={cn(
                "w-full text-center text-3xl tracking-[1em] font-bold p-6 rounded-3xl transition-all border-2",
                isDarkMode ? "bg-gray-900 border-gray-700 text-white focus:border-blue-500" : "bg-gray-50 border-gray-100 text-[#1B2559] focus:border-blue-500",
                enteredPin.length === 4 && enteredPin !== fbStore.pinCode ? "border-red-500 text-red-500 animate-pulse" : ""
              )}
              autoFocus
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setEnteredPin(val);
                if (val === fbStore.pinCode) {
                  fbStore.setIsAppLocked(false);
                  setEnteredPin('');
                }
              }}
            />
            {enteredPin.length === 4 && enteredPin !== fbStore.pinCode && (
              <p className="text-red-500 mt-4 font-bold animate-bounce">
                {language === 'bn' ? 'ভুল পিন কোড!' : 'Incorrect PIN code!'}
              </p>
            )}

            <div className="flex flex-col items-center gap-4 mt-8">
              {fbStore.isBiometricEnabled && (
                <button
                  onClick={fbStore.handleBiometricAuth}
                  className={cn(
                    "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all",
                    isDarkMode ? "bg-blue-900/30 text-blue-400 hover:bg-blue-900/50" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                  )}
                >
                  <Fingerprint className="w-6 h-6" />
                  {language === 'bn' ? 'বায়োমেট্রিক দিয়ে আনলক' : 'Unlock with Biometrics'}
                </button>
              )}

              <button
                onClick={() => setShowForgotPinConfirm(true)}
                className="text-sm text-blue-500 font-bold hover:underline"
              >
                {language === 'bn' ? 'পিন ভুলে গেছেন?' : 'Forgot PIN?'}
              </button>
            </div>
          </div>
        </motion.div>

        {showForgotPinConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "w-full max-w-sm p-6 rounded-3xl text-center shadow-2xl",
                isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
              )}
            >
              <h3 className="text-xl font-bold mb-3">{language === 'bn' ? 'পিন রিসেট করবেন?' : 'Reset PIN?'}</h3>
              <p className={cn("text-sm mb-6", isDarkMode ? "text-gray-400" : "text-gray-500")}>
                {language === 'bn' ? 'পিন রিসেট করতে আপনাকে আবার লগইন করতে হবে। আপনি কি চালিয়ে যেতে চান?' : 'To reset your PIN, you need to log in again. Do you want to continue?'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowForgotPinConfirm(false)}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold transition-colors",
                    isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
                  )}
                >
                  {language === 'bn' ? 'না' : 'No'}
                </button>
                <button
                  onClick={async () => {
                    try {
                      const provider = new GoogleAuthProvider();
                      provider.setCustomParameters({ prompt: 'select_account' });
                      const result = await signInWithPopup(auth, provider);
                      if (result.user.uid === user?.uid) {
                        fbStore.setPinCode(null);
                        fbStore.setIsAppLocked(false);
                        fbStore.updateSettings({ pinCode: null });
                        alert(language === 'bn' ? 'আপনার পিন সফলভাবে মুছে ফেলা হয়েছে।' : 'Your PIN has been successfully removed.');
                      } else {
                        alert(language === 'bn' ? 'আপনি অন্য অ্যাকাউন্ট দিয়ে লগইন করেছেন। সঠিক অ্যাকাউন্ট ব্যবহার করুন।' : 'You logged in with a different account. Please use the correct account.');
                      }
                      setShowForgotPinConfirm(false);
                    } catch (err: any) {
                      setShowForgotPinConfirm(false);
                      if (err.code !== 'auth/popup-closed-by-user') {
                        alert('Error: ' + err.message);
                      }
                    }
                  }}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                  {language === 'bn' ? 'হ্যাঁ, লগইন করুন' : 'Yes, Login'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  return (
`;

content = content.replace(regex, "function App() {" + newBody);
content = `import { useFirebaseStore } from './hooks/useFirebaseStore';\n` + content;
fs.writeFileSync(appPath, content, 'utf8');

console.log('App.tsx updated partially. Need to replace props passed to children now.');
