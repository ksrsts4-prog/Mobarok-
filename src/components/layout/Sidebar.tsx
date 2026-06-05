import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, ArrowLeftRight, PieChart as PieChartIcon, 
  Tags, Wallet, Plus, Bell, TrendingUp, Calendar, 
  Sparkles, Users, CreditCard, Target, Trophy, Receipt, 
  FileText, Settings, Info, Shield, Download, Activity, Repeat
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { SystemFeatures } from '../../types';

const AppLogo = ({ className = "w-12 h-12" }: { className?: string }) => {
  return (
    <div className={cn("relative flex items-center justify-center shrink-0 rounded-[28%] overflow-hidden shadow-md bg-[#3b82f6]", className)}>
        <svg viewBox="0 0 24 24" className="w-[60%] h-[60%] text-white" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-8 8H5a2 2 0 0 1-2-2V5.3"/>
          <path d="M22 10h-4a2 2 0 0 0 0 4h4V10z" fill="white" stroke="none"/>
        </svg>
    </div>
  );
};

function NavItem({ active, onClick, icon, label, isDarkMode }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, isDarkMode: boolean }) {
  return (
    <motion.button 
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-bold relative group overflow-hidden",
        active 
          ? (isDarkMode ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm shadow-blue-200") 
          : (isDarkMode ? "text-gray-300 hover:bg-gray-800 hover:text-white" : "text-gray-800 hover:bg-blue-50 hover:text-blue-700")
      )}
    >
      <div className={cn(
        "w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-300",
        active ? "bg-white/20 scale-110" : "bg-gray-100 dark:bg-gray-800"
      )}>
        <span className={cn("w-5 h-5", active ? "text-white" : "text-gray-600 group-hover:text-blue-600")}>{icon}</span>
      </div>
      <span className="flex-1 text-left">{label}</span>
      {active && <motion.div layoutId="activeNav" className="absolute right-2 w-1.5 h-6 bg-white rounded-full" />}
    </motion.button>
  );
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isDarkMode: boolean;
  isAdmin: boolean;
  systemFeatures: SystemFeatures;
  language: string;
  handleInstallClick: () => void;
  setIsAddModalOpen: (b: boolean) => void;
  setIsQuickAddOpen: (b: boolean) => void;
}

export function Sidebar({ activeTab, setActiveTab, isDarkMode, isAdmin, systemFeatures, language, handleInstallClick, setIsAddModalOpen, setIsQuickAddOpen }: SidebarProps) {
  return (
    <aside className={cn(
      "hidden lg:flex flex-col w-72 h-screen fixed left-0 top-0 border-r z-50 transition-colors duration-300 overflow-y-auto custom-scrollbar",
      isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-100"
    )}>
      <div className="p-8 pb-4">
        <h1 className={cn("text-2xl font-bold flex items-center gap-3", isDarkMode ? "text-blue-400" : "text-blue-600")}>
          <AppLogo className="w-10 h-10" />
          ব্যয় ট্র্যাকার
        </h1>
        <div className="mt-2 text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded-full inline-block dark:bg-blue-900/30 dark:text-blue-400">
          v3.0.0 (Pro)
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-2 pb-8">
        <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard />} label="ড্যাশবোর্ড" isDarkMode={isDarkMode} />
        <NavItem active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} icon={<ArrowLeftRight />} label="লেনদেন" isDarkMode={isDarkMode} />
        <NavItem active={activeTab === 'recurring'} onClick={() => setActiveTab('recurring')} icon={<Repeat />} label="নিয়মিত লেনদেন" isDarkMode={isDarkMode} />
        <NavItem active={activeTab === 'bills'} onClick={() => setActiveTab('bills')} icon={<Bell />} label="সাবস্ক্রিপশন ও বিল" isDarkMode={isDarkMode} />
        <NavItem active={activeTab === 'investments'} onClick={() => setActiveTab('investments')} icon={<TrendingUp />} label="বিনিয়োগ" isDarkMode={isDarkMode} />
        
        {systemFeatures.advancedAnalytics && (
          <>
            <NavItem active={activeTab === 'advanced_charts'} onClick={() => setActiveTab('advanced_charts')} icon={<Activity />} label="অ্যাডভান্সড চার্টস" isDarkMode={isDarkMode} />
            <NavItem active={activeTab === 'monthly_overview'} onClick={() => setActiveTab('monthly_overview')} icon={<Calendar />} label="মান্থলি ওভারভিউ" isDarkMode={isDarkMode} />
          </>
        )}
        
        {systemFeatures.forecasting && (
          <NavItem active={activeTab === 'forecasting'} onClick={() => setActiveTab('forecasting')} icon={<Sparkles />} label="ভবিষ্যতের পূর্বাভাস" isDarkMode={isDarkMode} />
        )}
        
        <NavItem active={activeTab === 'summary'} onClick={() => setActiveTab('summary')} icon={<PieChartIcon />} label="সারসংক্ষেপ" isDarkMode={isDarkMode} />
        <NavItem active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} icon={<Tags />} label="ক্যাটাগরি ম্যানেজমেন্ট" isDarkMode={isDarkMode} />
        <NavItem active={activeTab === 'budgets'} onClick={() => setActiveTab('budgets')} icon={<Wallet />} label="বাজেট" isDarkMode={isDarkMode} />
        
        {systemFeatures.familyBudget && (
          <NavItem active={activeTab === 'family'} onClick={() => setActiveTab('family')} icon={<Users />} label="ফ্যামিলি বাজেট" isDarkMode={isDarkMode} />
        )}
        
        <NavItem active={activeTab === 'debts'} onClick={() => setActiveTab('debts')} icon={<CreditCard />} label="ধার/লোন" isDarkMode={isDarkMode} />
        <NavItem active={activeTab === 'savings'} onClick={() => setActiveTab('savings')} icon={<Target />} label="সঞ্চয় লক্ষ্য" isDarkMode={isDarkMode} />
        <NavItem active={activeTab === 'gamification'} onClick={() => setActiveTab('gamification')} icon={<Trophy />} label={language === 'bn' ? 'রিওয়ার্ডস ও ব্যাজ' : 'Rewards'} isDarkMode={isDarkMode} />
        <NavItem active={activeTab === 'split_bills'} onClick={() => setActiveTab('split_bills')} icon={<Receipt />} label={language === 'bn' ? 'স্প্লিট বিল' : 'Split Bills'} isDarkMode={isDarkMode} />
        
        <NavItem active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<FileText />} label="রিপোর্ট" isDarkMode={isDarkMode} />
        <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings />} label={language === 'bn' ? 'সেটিংস' : 'Settings'} isDarkMode={isDarkMode} />
        <NavItem active={activeTab === 'about'} onClick={() => setActiveTab('about')} icon={<Info />} label={language === 'bn' ? 'অ্যাপ সম্পর্কে' : 'About App'} isDarkMode={isDarkMode} />
        <NavItem active={false} onClick={handleInstallClick} icon={<Download />} label={language === 'bn' ? 'অ্যাপ ইনস্টল করুন' : 'Install App'} isDarkMode={isDarkMode} />
        {isAdmin && (
          <NavItem active={activeTab === 'feedback_admin'} onClick={() => setActiveTab('feedback_admin')} icon={<Shield />} label="অ্যাডমিন প্যানেল" isDarkMode={isDarkMode} />
        )}
      </nav>
      <div className="p-6">
        <button 
          onClick={() => setIsQuickAddOpen(true)}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl font-bold shadow-sm shadow-blue-200 hover:brightness-110 active:scale-[0.98] transition-all transform-gpu flex items-center justify-center gap-2"
        >
          <Plus className="w-6 h-6" />
          নতুন লেনদেন
        </button>
      </div>
    </aside>
  );
}
