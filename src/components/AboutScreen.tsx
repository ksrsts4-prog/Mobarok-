import React, { useState } from 'react';
import { Info, Code, ShieldCheck, Heart, Github, Globe, BookOpen, Rocket, Lock, HelpCircle, Share2, Sparkles, ExternalLink, Mail, Star, FileText, ChevronRight, ChevronDown, Coffee, Wallet, X, RefreshCw, Bug, History, Download, Smartphone, Trash2, MessageCircle, Copy, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import pjson from '../../package.json';
import { useAppStore } from '../store/useAppStore';

interface AboutScreenProps {
  language: 'en' | 'bn';
  isDarkMode: boolean;
  deferredPrompt?: any;
  handleInstallClick?: () => void;
}

export default function AboutScreen({ deferredPrompt, handleInstallClick }: AboutScreenProps) {
  const { language, isDarkMode } = useAppStore();
  const isBn = language === 'bn';
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | 'releaseNotes' | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText("01309573466");
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cacheConfirm, setCacheConfirm] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyDeviceInfo = () => {
    const info = `App: Expense Tracker Pro v${pjson.version || '3.0.0'}\nOS: ${navigator.userAgent}\nScreen: ${window.innerWidth}x${window.innerHeight}\nTheme: ${isDarkMode ? 'Dark' : 'Light'}\nLang: ${language}`;
    navigator.clipboard.writeText(info).then(() => {
      showToast(isBn ? 'ডিভাইসের তথ্য কপি করা হয়েছে! বাগ রিপোর্ট করার সময় এটি যুক্ত করুন।' : 'Device info copied! Include this when reporting bugs.');
    }).catch(() => {
      showToast(isBn ? 'তথ্য কপি করতে ব্যর্থ হয়েছে' : 'Failed to copy device info');
    });
  };

  const handleClearCache = async () => {
    if (!cacheConfirm) {
      setCacheConfirm(true);
      showToast(isBn ? 'নিশ্চিত করতে আবার বাটনে ক্লিক করুন' : 'Click the button again to confirm');
      setTimeout(() => setCacheConfirm(false), 3000);
      return;
    }
    
    if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
            await caches.delete(name);
        }
    }
    showToast(isBn ? 'ক্যাশ সফলভাবে ক্লিয়ার হয়েছে। অ্যাপ রিস্টার্ট হচ্ছে...' : 'Cache cleared successfully. Restarting app...');
    setTimeout(() => {
        window.location.reload();
    }, 1500);
  };

  const faqs = [
    {
      q: isBn ? 'অফলাইনে কি কাজ করবে?' : 'Does it work offline?',
      a: isBn ? 'হ্যাঁ, আপনি অফলাইনে লেনদেন যোগ করতে পারবেন। পরে অনলাইনে আসলে ডেটা ক্লাউডে সিঙ্ক হয়ে যাবে।' : 'Yes, you can add transactions offline. They will sync to the cloud when you go online.'
    },
    {
      q: isBn ? 'আমার ডেটা কি সুরক্ষিত?' : 'Is my data secure?',
      a: isBn ? '১০০% সুরক্ষিত। আপনার ডেটা শুধুমাত্র আপনার গুগল অ্যাকাউন্টের সাথে লিংকড। আমরা ডেটা পড়া বা শেয়ার করি না।' : '100% secure. Data is only linked to your Google account. We do not read or share your data.'
    },
    {
      q: isBn ? 'অ্যাপ কি ফ্রি?' : 'Is the app free?',
      a: isBn ? 'হ্যাঁ, পার্সোনাল ব্যবহারকারীদের জন্য সম্পূর্ণ ফ্রি। তবে প্রিমিয়াম সাবস্ক্রিপশনে অতিরিক্ত কিছু সুবিধা পাবেন।' : 'Yes, completely free for personal use. Premium subscription offers additional perks.'
    }
  ];

  return (
    <div className={cn(
      "w-full h-full max-w-4xl mx-auto space-y-6 pb-32 md:pb-8 relative",
      isDarkMode ? "text-white" : "text-gray-900"
    )}>
      {/* Header Profile Section */}
      <div className={cn(
        "rounded-[32px] p-8 border relative overflow-hidden",
        isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-100 shadow-sm shadow-gray-200/40"
      )}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mt-20 -mr-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full -mb-20 -ml-20"></div>
        
        <div className="relative flex flex-col sm:flex-row items-center gap-8 relative z-10">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-sm shadow-blue-500/20 flex items-center justify-center shrink-0">
            <Wallet className="w-14 h-14 text-white" />
          </div>
          
          <div className="text-center sm:text-left space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Expense Tracker Pro
            </h1>
            <p className={cn("text-lg", isDarkMode ? "text-gray-300" : "text-gray-600")}>
              {isBn 
                ? 'আপনার আর্থিক জীবনকে আরও সহজ, সংগঠিত এবং সুরক্ষিত করার স্মার্ট সমাধান।' 
                : 'Smart solution to make your financial life easier, organized, and secure.'}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold font-mono",
                isDarkMode ? "bg-gray-900 text-gray-300 border border-gray-700" : "bg-gray-100 text-gray-600 border border-gray-200"
              )}>
                v{pjson.version || '3.0.0'}
              </span>
              <span className="px-3 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-xs font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                {isBn ? 'স্ট্যাবল রিলিজ' : 'Stable Release'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Features Card Let side */}
        <div className="space-y-6">
          <div className={cn(
            "p-8 rounded-[32px] border relative overflow-hidden",
            isDarkMode ? "bg-gray-800/60 border-gray-700" : "bg-white border-gray-100 shadow-sm shadow-gray-200/40"
          )}>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-500/10 rounded-full"></div>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 relative z-10">
              <div className="p-2.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-xl">
                <Sparkles className="w-6 h-6" />
              </div>
              {isBn ? 'মূল বৈশিষ্ট্যসমূহ' : 'Key Features'}
            </h3>
            
            <ul className="space-y-6 relative z-10">
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-bold text-sm">{isBn ? 'নিরাপদ ক্লাউড ব্যাকআপ' : 'Secure Cloud Backup'}</p>
                  <p className={cn("text-xs leading-relaxed mt-1", isDarkMode ? "text-gray-300" : "text-gray-600")}>
                    {isBn ? 'স্বয়ংক্রিয় ব্যাকআপ এবং সিঙ্ক সুবিধা।' : 'Automatic backup and sync features.'}
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-bold text-sm">{isBn ? 'মাল্টি-কারেন্সি' : 'Multi-currency'}</p>
                  <p className={cn("text-xs leading-relaxed mt-1", isDarkMode ? "text-gray-400" : "text-gray-500")}>
                    {isBn ? 'বিশ্বের যেকোনো দেশের মুদ্রা সিলেক্ট ব্যবহার।' : 'Support for all global currencies.'}
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-bold text-sm">{isBn ? 'সুন্দর ইউজার ইন্টারফেস' : 'Beautiful UI'}</p>
                  <p className={cn("text-xs leading-relaxed mt-1", isDarkMode ? "text-gray-400" : "text-gray-500")}>
                    {isBn ? 'রেসপন্সিভ এবং ব্যবহারবান্ধব ডিজাইন।' : 'Responsive and user-friendly design.'}
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Social Links / Support */}
          <div className={cn(
            "p-3 rounded-[24px] border",
            isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-100 shadow-sm shadow-gray-200/40"
          )}>
             <div className="space-y-1.5">
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Expense Tracker Pro',
                      text: isBn ? 'আমার এই চমৎকার বাজেট প্ল্যানার অ্যাপটি ব্যবহার করে দেখুন!' : 'Try out this awesome personal budget planner app!',
                      url: window.location.href
                    }).catch((error) => {
                      if (error.name !== 'AbortError' && !error.message?.includes('Share canceled')) {
                        console.error('Error sharing:', error);
                      }
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert(isBn ? 'লিংক কপি করা হয়েছে!' : 'Link copied to clipboard!');
                  }
                }}
                className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50"
              )}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Share2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-bold text-sm">{isBn ? 'বন্ধুদের সাথে শেয়ার করুন' : 'Share with friends'}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <a 
                href="https://play.google.com/store/apps/"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50"
              )}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                    <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <span className="font-bold text-sm">{isBn ? 'অ্যাপকে রেটিং দিন' : 'Rate our App'}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </a>

              <a 
                href="mailto:ksrsts4@gmail.com"
                className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50"
              )}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                    <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="font-bold text-sm">{isBn ? 'যোগাযোগ করুন' : 'Contact Support'}</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>

              <a 
                href="https://github.com/kawsar-dev"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50"
              )}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-200 dark:bg-gray-800 rounded-xl">
                    <Github className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </div>
                  <span className="font-bold text-sm">{isBn ? 'গিটহাবে যুক্ত হোন' : 'Follow on Github'}</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>

              <a 
                href="https://t.me/kawsar_dev"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50"
              )}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-xl">
                    <MessageCircle className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  </div>
                  <span className="font-bold text-sm">{isBn ? 'টেলিগ্রাম কমিউনিটি' : 'Telegram Community'}</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Right side stuff */}
        <div className="space-y-6">
          
          {/* App Tools / Update */}
          <div className={cn(
            "p-3 rounded-[24px] border",
            isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-100 shadow-sm shadow-gray-200/40"
          )}>
            <div className="space-y-1.5">
              {handleInstallClick && (
                <button 
                  onClick={() => {
                    handleInstallClick();
                    showToast(isBn ? 'ইন্সটল প্রক্রিয়া শুরু হচ্ছে...' : 'Starting install process...');
                  }}
                  className={cn(
                  "w-full flex items-center justify-between p-4 rounded-2xl transition-all",
                  deferredPrompt 
                    ? (isDarkMode ? "bg-blue-900/30 hover:bg-blue-900/50" : "bg-blue-50/50 hover:bg-blue-50")
                    : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-xl",
                      deferredPrompt 
                        ? "bg-blue-500 text-white shadow-md shadow-blue-500/20" 
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                    )}>
                      <Download className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold text-sm block">{isBn ? 'অ্যাপ ইনস্টল করুন' : 'Install App'}</span>
                      {deferredPrompt && (
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{isBn ? 'হোম স্ক্রিনে যোগ করুন' : 'Add to home screen'}</span>
                      )}
                    </div>
                  </div>
                  {deferredPrompt ? (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">
                      {isBn ? 'নতুন' : 'New'}
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              )}
              <button 
                onClick={() => {
                  setIsCheckingUpdate(true);
                  setTimeout(() => {
                    setIsCheckingUpdate(false);
                    alert(isBn ? 'আপনার অ্যাপ সবশেষ ভার্সনে আপডেটেড আছে।' : 'Your app is up to date.');
                  }, 1500);
                }}
                disabled={isCheckingUpdate}
                className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-70 disabled:cursor-wait"
              )}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <RefreshCw className={cn("w-5 h-5 text-blue-600 dark:text-blue-400", isCheckingUpdate && "animate-spin")} />
                  </div>
                  <span className="font-bold text-sm">{isBn ? (isCheckingUpdate ? 'চেক করা হচ্ছে...' : 'আপডেট চেক করুন') : (isCheckingUpdate ? 'Checking...' : 'Check for Updates')}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              
              <button 
                onClick={() => setActiveModal('releaseNotes')}
                className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50"
              )}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <History className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="font-bold text-sm">{isBn ? 'নতুন ভার্সনে কি আছে?' : 'What\'s New?'}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button 
                onClick={() => window.location.href = 'mailto:ksrsts4@gmail.com?subject=Bug Report'}
                className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50"
              )}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                    <Bug className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="font-bold text-sm">{isBn ? 'সমস্যা রিপোর্ট করুন' : 'Report a Bug'}</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </button>

              <button 
                onClick={handleCopyDeviceInfo}
                className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50"
              )}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                    <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="font-bold text-sm">{isBn ? 'ডিভাইস ইনফো কপি করুন' : 'Copy Device Info'}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button 
                onClick={handleClearCache}
                className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl transition-all",
                cacheConfirm ? "bg-red-50 dark:bg-red-900/30" : "hover:bg-red-50 dark:hover:bg-red-900/20"
              )}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                    <Trash2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="font-bold text-sm text-red-600 dark:text-red-400">{cacheConfirm ? (isBn ? 'নিশ্চিত করতে আবার চাপুন' : 'Tap again to confirm') : (isBn ? 'অ্যাপ ক্যাশ ক্লিয়ার করুন' : 'Clear App Cache')}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className={cn(
            "p-8 rounded-[32px] border",
            isDarkMode ? "bg-gray-800/60 border-gray-700" : "bg-white border-gray-100 shadow-sm shadow-gray-200/40"
          )}>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                <HelpCircle className="w-6 h-6" />
              </div>
              {isBn ? 'সাধারণ প্রশ্নাবলী (FAQ)' : 'FAQ'}
            </h3>
            
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "border rounded-[16px] transition-all duration-300 overflow-hidden",
                    isDarkMode ? "border-gray-700 hover:border-gray-600 bg-gray-800/40" : "border-gray-100 hover:border-gray-200 bg-gray-50/50"
                  )}
                >
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full text-left p-4 flex justify-between items-center group"
                  >
                    <span className={cn(
                      "font-bold text-[15px] pr-4 transition-colors",
                      openFaq === idx ? (isDarkMode ? "text-blue-400" : "text-blue-600") : "group-hover:text-blue-500"
                    )}>
                      {faq.q}
                    </span>
                    <div className={cn(
                      "p-1.5 rounded-full transition-all duration-300",
                      openFaq === idx 
                        ? (isDarkMode ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-600")
                        : (isDarkMode ? "bg-gray-800 text-gray-500 group-hover:text-gray-300" : "bg-white text-gray-400 group-hover:text-gray-600")
                    )}>
                      <ChevronDown className={cn("w-4 h-4 shrink-0 transition-transform duration-300", openFaq === idx && "rotate-180")} />
                    </div>
                  </button>
                  <div className={cn(
                    "px-4 overflow-hidden transition-all duration-300 ease-in-out",
                    openFaq === idx ? "max-h-40 pb-4 opacity-100" : "max-h-0 opacity-0"
                  )}>
                    <p className={cn("text-[13px] leading-relaxed", isDarkMode ? "text-gray-300" : "text-gray-600")}>
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legal / Policy */}
          <div className={cn(
            "p-3 rounded-[24px] border",
            isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-100 shadow-sm shadow-gray-200/40"
          )}>
            <div className="space-y-1.5">
              <button 
                onClick={() => setActiveModal('terms')}
                className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50"
              )}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                    <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="font-bold text-sm">{isBn ? 'ব্যবহারের শর্তাবলী' : 'Terms of Service'}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              
              <button 
                onClick={() => setActiveModal('privacy')}
                className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50"
              )}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
                    <Lock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <span className="font-bold text-sm">{isBn ? 'প্রাইভেসি পলিসি' : 'Privacy Policy'}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Developer Note */}
          <div className={cn(
            "p-8 rounded-[32px] border relative overflow-hidden text-white",
            isDarkMode ? "bg-gradient-to-br from-indigo-900/80 to-purple-900/80 border-indigo-500/20" : "bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 border-transparent shadow-sm shadow-blue-500/30"
          )}>
            <div className="absolute top-0 right-0 p-8 opacity-20 transform rotate-12 scale-150">
              <Coffee className="w-24 h-24 text-white" />
            </div>
            <div className="relative z-10 flex flex-col items-start">
              <div className="bg-white/20 p-3 rounded-2xl mb-4">
                <Heart className="w-6 h-6 text-white fill-current" />
              </div>
              <h3 className="text-xl font-bold mb-2">{isBn ? 'ডেভেলপারকে সাপোর্ট করুন' : 'Support the Developer'}</h3>
              <p className="text-sm text-blue-50 leading-relaxed mb-6 opacity-90">
                {isBn ? 'আমি Kawsar, এই অ্যাপটির ডেভেলপার। এটি সম্পূর্ণ ফ্রি, তবে এর রক্ষণাবেক্ষণ ও নতুন ফিচারে অনেক সময় ও খরচ হয়। অ্যাপটি আপনার উপকারে আসলে আমাকে একটি কফি স্পন্সর করে সাহায্য করতে পারেন।' : 'I am Kawsar, the developer behind this app. It is completely free, but maintenance and new features take time and resources. If this app helps you, consider sponsoring me a coffee!'}
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <a 
                  href="https://buymeacoffee.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-white block text-blue-600 hover:bg-gray-50 rounded-xl font-bold shadow-lg hover:shadow-sm hover:-translate-y-0.5 transition-all w-full sm:w-auto text-center"
                >
                  {isBn ? 'Kawsar-কে কফি স্পন্সর করুন' : 'Sponsor Kawsar a coffee'}
                </a>
                <button
                  onClick={handleCopyNumber}
                  className="px-6 py-3 bg-blue-700/50 hover:bg-blue-700 block text-white border border-blue-400/30 rounded-xl font-bold shadow-lg transition-all w-full sm:w-auto text-center flex items-center justify-center gap-2"
                >
                  <span>{isBn ? 'বিকাশ / নগদ / রকেট: 01309573466' : 'bKash / Nagad / Rocket: 01309573466'}</span>
                  {copiedNumber ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer message */}
      <div className="text-center pt-8 pb-4">
        <p className={cn(
          "flex items-center justify-center gap-2 text-sm",
          isDarkMode ? "text-gray-400" : "text-gray-500"
        )}>
          {isBn ? 'তৈরি করা হয়েছে ' : 'Made with '} 
          <Heart className="w-4 h-4 text-red-500 fill-current" /> 
          {isBn ? ' ভালোবাসা দিয়ে • Kawsar' : 'love by Kawsar'}
        </p>
      </div>

      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm shadow-sm font-medium shadow-gray-900/20 whitespace-nowrap">
            {toastMessage}
          </div>
        </div>
      )}

      {/* Modals for Terms & Privacy */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
          <div className={cn(
            "w-full max-w-lg p-8 rounded-[40px] max-h-[85vh] overflow-y-auto space-y-6 shadow-md relative border font-sans",
            isDarkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900",
            "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          )}>
            <button 
              onClick={() => setActiveModal(null)}
              className={cn(
                "absolute top-6 right-6 p-2 rounded-full transition-colors",
                isDarkMode ? "bg-gray-800 hover:bg-gray-700 text-gray-400" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              )}
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-4 border-b pb-6 border-opacity-10 dark:border-opacity-10">
              <div className={cn(
                "p-3 rounded-2xl flex-shrink-0",
                activeModal === 'terms' ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" :
                activeModal === 'privacy' ? "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400" :
                "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
              )}>
                {activeModal === 'terms' ? <FileText className="w-8 h-8" /> : 
                 activeModal === 'privacy' ? <Lock className="w-8 h-8" /> : 
                 <History className="w-8 h-8" />}
              </div>
              <h2 className="text-2xl font-bold pr-8 leading-tight">
                {activeModal === 'terms' 
                  ? (isBn ? 'ব্যবহারের শর্তাবলী' : 'Terms of Service')
                  : activeModal === 'privacy' 
                    ? (isBn ? 'প্রাইভেসি পলিসি' : 'Privacy Policy')
                    : (isBn ? 'রিলিজ নোটস' : 'Release Notes')}
              </h2>
            </div>
            <div className={cn(
              "text-sm space-y-4 pb-4",
              isDarkMode ? "text-gray-400" : "text-gray-600"
            )}>
              {activeModal === 'terms' ? (
                <div className="space-y-6 pt-2">
                  <div className="space-y-2">
                    <h4 className="font-bold text-base bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 w-fit px-3 py-1 rounded-lg">
                      {isBn ? '১. শর্তাবলী গ্রহণ' : '1. Acceptance of Terms'}
                    </h4>
                    <p className="leading-relaxed opacity-90 pl-1">{isBn ? 'এক্সপেন্স ট্র্যাকার প্রো অ্যাক্সেস এবং ব্যবহার করার মাধ্যমে, আপনি এই শর্তাবলীতে আবদ্ধ হতে সম্মত হচ্ছেন।' : 'By accessing and using Expense Tracker Pro, you agree to be bound by these terms.'}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-base bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 w-fit px-3 py-1 rounded-lg">
                      {isBn ? '২. ব্যবহারকারীর ডেটা' : '2. User Data'}
                    </h4>
                    <p className="leading-relaxed opacity-90 pl-1">{isBn ? 'অ্যাপে আপনার ইনপুট করা সমস্ত ডেটার মালিকানা আপনার। আমরা আপনার আর্থিক রেকর্ডের কোনো অধিকার দাবি করি না।' : 'You maintain ownership of all data you input into the app. We do not claim any rights to your financial records.'}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-base bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 w-fit px-3 py-1 rounded-lg">
                      {isBn ? '৩. অ্যাপ ব্যবহার' : '3. App Usage'}
                    </h4>
                    <p className="leading-relaxed opacity-90 pl-1">{isBn ? 'আপনি অ্যাপ্লিকেশনটির অপব্যবহার না করতে বা অননুমোদিত পদ্ধতি ব্যবহার করে আমাদের সিস্টেমে প্রবেশ করার চেষ্টা না করতে সম্মত হচ্ছেন।' : 'You agree not to misuse the application or attempt to access our systems using unauthorized methods.'}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-base bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 w-fit px-3 py-1 rounded-lg">
                      {isBn ? '৪. লোকাল স্টোরেজ ও সিঙ্ক' : '4. Local Storage & Sync'}
                    </h4>
                    <p className="leading-relaxed opacity-90 pl-1">{isBn ? 'অ্যাপটি মূলত অফলাইনে কাজ করে, ইন্টারনেট সংযোগ ফিরে পাওয়ার পর সুরক্ষিতভাবে আপনার অ্যাকাউন্টে সিঙ্ক করার আগে ডেটা স্থানীয়ভাবে সংরক্ষণ করে।' : 'The app primarily works offline, storing data locally before syncing it securely to your account upon regaining internet connection.'}</p>
                  </div>
                </div>
              ) : activeModal === 'privacy' ? (
                <div className="space-y-6 pt-2">
                  <div className="space-y-2">
                    <h4 className="font-bold text-base bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 w-fit px-3 py-1 rounded-lg">
                      {isBn ? '১. ডেটা সংগ্রহ' : '1. Data Collection'}
                    </h4>
                    <p className="leading-relaxed opacity-90 pl-1">{isBn ? 'ট্র্যাকিং, সিঙ্কিং এবং বাজেটিং ফিচার প্রদান করার জন্য প্রয়োজনীয় তথ্যই আমরা সংগ্রহ করি।' : 'We only collect information necessary to provide you with tracking, syncing and budgeting features.'}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-base bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 w-fit px-3 py-1 rounded-lg">
                      {isBn ? '২. তথ্য নিরাপত্তা' : '2. Information Security'}
                    </h4>
                    <p className="leading-relaxed opacity-90 pl-1">{isBn ? 'আমরা আপনার ব্যক্তিগত তথ্য অননুমোদিত অ্যাক্সেস, পরিবর্তন, প্রকাশ, বা ধ্বংস থেকে রক্ষা করার জন্য সুরক্ষা ব্যবস্থা প্রয়োগ করি।' : 'We implement security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.'}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-base bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 w-fit px-3 py-1 rounded-lg">
                      {isBn ? '৩. থার্ড-পার্টি শেয়ারিং' : '3. Third-party Sharing'}
                    </h4>
                    <p className="leading-relaxed opacity-90 pl-1">{isBn ? 'আমরা অন্যদের কাছে ব্যবহারকারীদের ব্যক্তিগত তথ্য বিক্রি, ট্রেড, বা ভাড়া দিই না।' : 'We do not sell, trade, or rent users\' personal identification information to others.'}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-base bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 w-fit px-3 py-1 rounded-lg">
                      {isBn ? '৪. আপনার অধিকার' : '4. Your Rights'}
                    </h4>
                    <p className="leading-relaxed opacity-90 pl-1">{isBn ? 'অ্যাপ সেটিংস থেকে যেকোনো সময় আপনার অ্যাকাউন্ট এবং সমস্ত সংশ্লিষ্ট ডেটা মুছে ফেলার অধিকার আপনার আছে।' : 'You have the right to delete your account and all associated data at any time from the app settings.'}</p>
                  </div>
                </div>
              ) : activeModal === 'releaseNotes' ? (
                <div className="space-y-4 pt-2">
                  <div className="flex bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl gap-3">
                    <Rocket className="w-6 h-6 text-blue-500 shrink-0" />
                    <div>
                      <h4 className="font-bold">{isBn ? 'ভার্সন' : 'Version'} 3.0.0 <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full ml-2">Latest</span></h4>
                      <ul className="list-disc pl-4 mt-2 space-y-1 text-sm">
                        <li>{isBn ? 'প্রিমিয়াম সাবস্ক্রিপশন প্ল্যান যুক্ত করা হয়েছে' : 'Added Premium Subscription plan'}</li>
                        <li>{isBn ? 'এআই চ্যাটবট ইন্টিগ্রেশন এবং ফিনান্সিয়াল অ্যাডভাইস' : 'AI chatbot integration and financial advice'}</li>
                        <li>{isBn ? 'নতুন থিম ইঞ্জিন এবং স্মার্ট ডার্ক মোড' : 'New theme engine and smart dark mode'}</li>
                        <li>{isBn ? 'কিছু বাগ ফিক্স এবং পারফরমেন্স উইম্প্রুভমেন্ট' : 'Bug fixes and performance improvements'}</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl gap-3">
                    <History className="w-6 h-6 text-gray-500 shrink-0" />
                    <div>
                      <h4 className="font-bold">{isBn ? 'ভার্সন' : 'Version'} 2.1.0</h4>
                      <ul className="list-disc pl-4 mt-2 space-y-1 text-sm">
                        <li>{isBn ? 'পারিবারিক বাজেট শেয়ারিং ফিচার' : 'Family budget sharing feature'}</li>
                        <li>{isBn ? 'নতুন কাস্টম ক্যাটাগরি তৈরি করার অপশন' : 'Option to create custom categories'}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            <button 
              onClick={() => setActiveModal(null)}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors"
            >
              {isBn ? 'ঠিক আছে' : 'OK, I understand'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}