import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, ArrowLeftRight, PieChart as PieChartIcon, 
  Tags, Wallet, Plus, Bell, TrendingUp, Calendar, 
  Sparkles, Users, CreditCard, Target, Trophy, Receipt, 
  FileText, Settings, Info, Download, Shield, Menu, Repeat, Activity
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { SystemFeatures } from '../../types';

function MobileNavItem({ active, onClick, icon, isDarkMode }: { active: boolean, onClick: () => void, icon: React.ReactNode, isDarkMode: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-3 rounded-2xl transition-colors relative flex flex-col items-center justify-center min-w-[44px] min-h-[44px]",
        active 
          ? (isDarkMode ? "text-blue-400 bg-blue-900/30" : "text-blue-600 bg-blue-50") 
          : (isDarkMode ? "text-gray-600 active:text-gray-300" : "text-gray-400 active:text-blue-400")
      )}
    >
      <div className="w-5 h-5">
        {icon}
      </div>
    </button>
  );
}

function MobileMenuButton({ icon, label, onClick, isDarkMode, colorClass }: { icon: React.ReactNode, label: string, onClick: () => void, isDarkMode: boolean, colorClass?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center py-3 px-1 rounded-2xl gap-2 transition-colors",
        isDarkMode 
          ? "text-gray-300 active:bg-[#1f2937]" 
          : "text-gray-700 active:bg-gray-100"
      )}
    >
      <div 
        className={cn(
          "w-12 h-12 flex items-center justify-center rounded-2xl",
          colorClass || (isDarkMode ? "bg-gray-800 text-blue-400" : "bg-blue-50 text-blue-600")
        )}
      >
        <div className="w-6 h-6">{icon}</div>
      </div>
      
      <span className="text-[11px] font-medium text-center leading-tight">
        {label}
      </span>
    </button>
  );
}


interface MobileNavProps {
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

export function MobileNav({ activeTab, setActiveTab, isDarkMode, isAdmin, systemFeatures, language, handleInstallClick, setIsAddModalOpen, setIsQuickAddOpen }: MobileNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsRendered(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav className={cn(
        "lg:hidden fixed bottom-0 left-0 right-0 border-t px-4 py-3 flex items-center justify-between z-50 transition-colors duration-300",
        isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-200"
      )}>
        <MobileNavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard />} isDarkMode={isDarkMode} />
        <MobileNavItem active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} icon={<ArrowLeftRight />} isDarkMode={isDarkMode} />
        <button 
          onClick={() => setIsQuickAddOpen(true)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md -mt-10 border-4 transition-transform active:scale-95",
            isDarkMode ? "bg-blue-500 border-[#0B1120]" : "bg-blue-600 border-[#F4F7FE]"
          )}
        >
          <Plus className="w-8 h-8" />
        </button>
        <MobileNavItem active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<FileText />} isDarkMode={isDarkMode} />
        <MobileNavItem active={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(true)} icon={<Menu />} isDarkMode={isDarkMode} />
      </nav>

      {isRendered && (
        <div className="fixed inset-0 z-[60] lg:hidden flex flex-col justify-end">
          <div 
            className={cn(
              "absolute inset-0 bg-black/50 transition-opacity duration-300",
              isMobileMenuOpen ? "opacity-100" : "opacity-0"
            )}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div
            className={cn(
              "relative w-full rounded-t-3xl pt-2 pb-8 px-4 shadow-xl border-t transition-transform duration-300 ease-out transform-gpu",
              isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-200",
              isMobileMenuOpen ? "translate-y-0" : "translate-y-full"
            )}
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>
            <div className="overflow-y-auto max-h-[60vh] pb-8 pr-1 custom-scrollbar">
              <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                <MobileMenuButton icon={<Repeat />} label="নিয়মিত" onClick={() => { setActiveTab('recurring'); setIsMobileMenuOpen(false); }} isDarkMode={isDarkMode} colorClass="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
                <MobileMenuButton icon={<Bell />} label="বিল" onClick={() => { setActiveTab('bills'); setIsMobileMenuOpen(false); }} isDarkMode={isDarkMode} colorClass="bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" />
                <MobileMenuButton icon={<TrendingUp />} label="বিনিয়োগ" onClick={() => { setActiveTab('investments'); setIsMobileMenuOpen(false); }} isDarkMode={isDarkMode} colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" />
                {systemFeatures.advancedAnalytics && (
                  <>
                    <MobileMenuButton icon={<Activity />} label="অ্যাডভান্সড" onClick={() => { setActiveTab('advanced_charts'); setIsMobileMenuOpen(false); }} isDarkMode={isDarkMode} colorClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" />
                    <MobileMenuButton icon={<Calendar />} label="ওভারভিউ" onClick={() => { setActiveTab('monthly_overview'); setIsMobileMenuOpen(false); }} isDarkMode={isDarkMode} colorClass="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" />
                  </>
                )}
                {systemFeatures.forecasting && (
                  <MobileMenuButton icon={<Sparkles />} label="পূর্বাভাস" onClick={() => { setActiveTab('forecasting'); setIsMobileMenuOpen(false); }} isDarkMode={isDarkMode} colorClass="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" />
                )}
                <MobileMenuButton icon={<PieChartIcon />} label="সারসংক্ষেপ" onClick={() => { setActiveTab('summary'); setIsMobileMenuOpen(false); }} isDarkMode={isDarkMode} colorClass="bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400" />
                <MobileMenuButton icon={<Tags />} label="ক্যাটাগরি" onClick={() => { setActiveTab('categories'); setIsMobileMenuOpen(false); }} isDarkMode={isDarkMode} colorClass="bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" />
                <MobileMenuButton icon={<Wallet />} label="বাজেট" onClick={() => { setActiveTab('budgets'); setIsMobileMenuOpen(false); }} isDarkMode={isDarkMode} colorClass="bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400" />
                {systemFeatures.familyBudget && (
                  <MobileMenuButton icon={<Users />} label="ফ্যামিলি" onClick={() => { setActiveTab('family'); setIsMobileMenuOpen(false); }} isDarkMode={isDarkMode} colorClass="bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" />
                )}
                <MobileMenuButton icon={<CreditCard />} label="ধার/লোন" onClick={() => { setActiveTab('debts'); setIsMobileMenuOpen(false); }} isDarkMode={isDarkMode} colorClass="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" />
                <MobileMenuButton icon={<Target />} label="সঞ্চয়" onClick={() => { setActiveTab('savings'); setIsMobileMenuOpen(false); }} isDarkMode={isDarkMode} colorClass="bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" />
                <MobileMenuButton icon={<Trophy />} label={language === 'bn' ? 'রিওয়ার্ডস' : 'Rewards'} onClick={() => { setActiveTab('gamification'); setIsMobileMenuOpen(false); }} isDarkMode={isDarkMode} colorClass="bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" />
                <MobileMenuButton icon={<Receipt />} label={language === 'bn' ? 'স্প্লিট বিল' : 'Split Bills'} onClick={() => { setActiveTab('split_bills'); setIsMobileMenuOpen(false); }} isDarkMode={isDarkMode} colorClass="bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400" />
                <MobileMenuButton icon={<Settings />} label={language === 'bn' ? 'সেটিংস' : 'Settings'} onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} isDarkMode={isDarkMode} colorClass="bg-slate-50 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400" />
                <MobileMenuButton icon={<Info />} label={language === 'bn' ? 'সম্পর্কে' : 'About'} onClick={() => { setActiveTab('about'); setIsMobileMenuOpen(false); }} isDarkMode={isDarkMode} colorClass="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" />
                <MobileMenuButton icon={<Download />} label={language === 'bn' ? 'ইনস্টল' : 'Install'} onClick={() => { handleInstallClick(); setIsMobileMenuOpen(false); }} isDarkMode={isDarkMode} colorClass="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
                {isAdmin && (
                  <MobileMenuButton icon={<Shield />} label="অ্যাডমিন" onClick={() => { setActiveTab('feedback_admin'); setIsMobileMenuOpen(false); }} isDarkMode={isDarkMode} colorClass="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

