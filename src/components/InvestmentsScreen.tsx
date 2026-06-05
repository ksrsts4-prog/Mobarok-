import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, TrendingUp, DollarSign, Calendar, Target, Briefcase, Activity } from 'lucide-react';
import { Investment } from '../types';
import { cn } from '../lib/utils';
import { format, parseISO } from 'date-fns';
import { useAppStore } from '../store/useAppStore';

interface Props {
  investments: Investment[];
  onAdd: (inv: Omit<Investment, 'id'>) => void;
  onUpdate: (id: string, inv: Partial<Investment>) => void;
  onDelete: (id: string) => void;
  isDarkMode: boolean;
  language: 'bn' | 'en';
  currency: string;
}

export function InvestmentsScreen({ investments, onAdd, onUpdate, onDelete, isDarkMode, language, currency }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [newInvestment, setNewInvestment] = useState<Partial<Investment>>({
    name: '',
    type: 'dps',
    amountInvested: 0,
    currentValue: 0,
    startDate: new Date().toISOString().split('T')[0],
    interestRate: 0,
    note: ''
  });

  const handleSave = () => {
    if (!newInvestment.name || !newInvestment.amountInvested || !newInvestment.startDate) return;
    onAdd(newInvestment as Omit<Investment, 'id'>);
    setIsAdding(false);
    setNewInvestment({
      name: '',
      type: 'dps',
      amountInvested: 0,
      currentValue: 0,
      startDate: new Date().toISOString().split('T')[0],
      interestRate: 0,
      note: ''
    });
  };

  const totalInvested = investments.reduce((acc, curr) => acc + curr.amountInvested, 0);
  const totalCurrentValue = investments.reduce((acc, curr) => acc + (curr.currentValue || curr.amountInvested), 0);
  const totalProfit = totalCurrentValue - totalInvested;
  const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-8 pb-12"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
            isDarkMode ? "bg-indigo-500 shadow-indigo-900/50" : "bg-indigo-600 shadow-indigo-200"
          )}>
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{language === 'bn' ? 'বিনিয়োগ ট্র্যাকিং' : 'Investment Tracking'}</h2>
            <p className={cn("text-sm", isDarkMode ? "text-gray-300" : "text-gray-600")}>
              {language === 'bn' ? 'আপনার ডিপিএস, এফডিআর এবং অন্যান্য বিনিয়োগ ট্র্যাক করুন' : 'Track your DPS, FDR, and other investments'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-sm active:scale-95",
            isAdding 
              ? (isDarkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200")
              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none"
          )}
        >
          {isAdding ? <Trash2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          <span className="hidden sm:inline">{isAdding ? (language === 'bn' ? 'বাতিল' : 'Cancel') : (language === 'bn' ? 'নতুন বিনিয়োগ' : 'New Investment')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={cn(
          "p-6 rounded-[24px] shadow-sm relative overflow-hidden",
          isDarkMode ? "bg-gray-800" : "bg-white border border-gray-100"
        )}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Briefcase className="w-16 h-16" />
          </div>
          <div className="relative z-10">
            <div className={cn("text-sm font-bold mb-2 flex items-center gap-2", isDarkMode ? "text-gray-400" : "text-gray-500")}>
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              {language === 'bn' ? 'মোট বিনিয়োগ' : 'Total Invested'}
            </div>
            <p className="text-3xl font-bold">{currency}{totalInvested.toLocaleString()}</p>
          </div>
        </div>
        
        <div className={cn(
          "p-6 rounded-[24px] shadow-sm relative overflow-hidden",
          isDarkMode ? "bg-indigo-900/40 border border-indigo-800/50" : "bg-indigo-50 border border-indigo-100"
        )}>
          <div className="absolute top-0 right-0 p-4 opacity-10 text-indigo-500">
            <Target className="w-16 h-16" />
          </div>
          <div className="relative z-10">
            <div className={cn("text-sm font-bold mb-2 flex items-center gap-2", isDarkMode ? "text-indigo-300" : "text-indigo-600")}>
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              {language === 'bn' ? 'বর্তমান মূল্য' : 'Current Value'}
            </div>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{currency}{totalCurrentValue.toLocaleString()}</p>
          </div>
        </div>

        <div className={cn(
          "p-6 rounded-[24px] shadow-sm relative overflow-hidden",
          totalProfit >= 0 
            ? (isDarkMode ? "bg-green-900/20 border border-green-800/50" : "bg-green-50 border border-green-100")
            : (isDarkMode ? "bg-red-900/20 border border-red-800/50" : "bg-red-50 border border-red-100")
        )}>
          <div className={cn("absolute top-0 right-0 p-4 opacity-10", totalProfit >= 0 ? "text-green-500" : "text-red-500")}>
            <Activity className="w-16 h-16" />
          </div>
          <div className="relative z-10">
            <div className={cn("text-sm font-bold mb-2 flex items-center gap-2", totalProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
              <div className={cn("w-2 h-2 rounded-full", totalProfit >= 0 ? "bg-green-500" : "bg-red-500")}></div>
              {language === 'bn' ? 'মোট লাভ/ক্ষতি' : 'Total Profit/Loss'}
            </div>
            <div className="flex items-end gap-2">
              <p className={cn("text-3xl font-bold", totalProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                {totalProfit >= 0 ? '+' : ''}{currency}{totalProfit.toLocaleString()}
              </p>
              <span className={cn("text-sm font-bold mb-1 px-2 py-0.5 rounded-md", totalProfit >= 0 ? "bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-300" : "bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300")}>
                {profitPercentage > 0 ? '+' : ''}{profitPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className={cn(
              "p-8 rounded-[32px] shadow-sm border space-y-6 overflow-hidden relative",
              isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-100"
            )}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-blue-500"></div>
            <h3 className="font-bold text-xl">{language === 'bn' ? 'নতুন বিনিয়োগ যোগ করুন' : 'Add New Investment'}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {language === 'bn' ? 'বিনিয়োগের নাম' : 'Investment Name'}
                </label>
                <input
                  type="text"
                  value={newInvestment.name}
                  onChange={e => setNewInvestment({ ...newInvestment, name: e.target.value })}
                  className={cn(
                    "w-full p-4 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all",
                    isDarkMode ? "bg-gray-800 text-white" : "bg-gray-50"
                  )}
                  placeholder={language === 'bn' ? 'যেমন: ইসলামী ব্যাংক ডিপিএস' : 'e.g., Bank DPS'}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  {language === 'bn' ? 'ধরন' : 'Type'}
                </label>
                <select
                  value={newInvestment.type}
                  onChange={e => setNewInvestment({ ...newInvestment, type: e.target.value as any })}
                  className={cn(
                    "w-full p-4 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all",
                    isDarkMode ? "bg-gray-800 text-white" : "bg-gray-50"
                  )}
                >
                  <option value="dps">{language === 'bn' ? 'ডিপিএস (DPS)' : 'DPS'}</option>
                  <option value="fdr">{language === 'bn' ? 'এফডিআর (FDR)' : 'FDR'}</option>
                  <option value="stocks">{language === 'bn' ? 'শেয়ার বাজার' : 'Stocks'}</option>
                  <option value="mutual_fund">{language === 'bn' ? 'মিউচুয়াল ফান্ড' : 'Mutual Fund'}</option>
                  <option value="bonds">{language === 'bn' ? 'সঞ্চয়পত্র/বন্ড' : 'Bonds'}</option>
                  <option value="other">{language === 'bn' ? 'অন্যান্য' : 'Other'}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 flex items-center gap-2">
                  <span className="font-serif font-bold text-base">{currency}</span>
                  {language === 'bn' ? 'বিনিয়োগের পরিমাণ' : 'Amount Invested'}
                </label>
                <input
                  type="number"
                  value={newInvestment.amountInvested || ''}
                  onChange={e => setNewInvestment({ ...newInvestment, amountInvested: Number(e.target.value) })}
                  className={cn(
                    "w-full p-4 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all",
                    isDarkMode ? "bg-gray-800 text-white" : "bg-gray-50"
                  )}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  {language === 'bn' ? 'বর্তমান মূল্য' : 'Current Value'}
                </label>
                <input
                  type="number"
                  value={newInvestment.currentValue || ''}
                  onChange={e => setNewInvestment({ ...newInvestment, currentValue: Number(e.target.value) })}
                  className={cn(
                    "w-full p-4 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all",
                    isDarkMode ? "bg-gray-800 text-white" : "bg-gray-50"
                  )}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {language === 'bn' ? 'শুরুর তারিখ' : 'Start Date'}
                </label>
                <input
                  type="date"
                  value={newInvestment.startDate}
                  onChange={e => setNewInvestment({ ...newInvestment, startDate: e.target.value })}
                  className={cn(
                    "w-full p-4 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all",
                    isDarkMode ? "bg-gray-800 text-white" : "bg-gray-50"
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {language === 'bn' ? 'মুনাফার হার (%)' : 'Interest Rate (%)'}
                </label>
                <input
                  type="number"
                  value={newInvestment.interestRate || ''}
                  onChange={e => setNewInvestment({ ...newInvestment, interestRate: Number(e.target.value) })}
                  className={cn(
                    "w-full p-4 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all",
                    isDarkMode ? "bg-gray-800 text-white" : "bg-gray-50"
                  )}
                  placeholder="0.0"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!newInvestment.name || !newInvestment.amountInvested}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {language === 'bn' ? 'সেভ করুন' : 'Save Investment'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {investments.map(inv => {
          const profit = (inv.currentValue || inv.amountInvested) - inv.amountInvested;
          const invProfitPercentage = inv.amountInvested > 0 ? (profit / inv.amountInvested) * 100 : 0;
          
          return (
            <motion.div
              key={inv.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "p-6 rounded-[24px] shadow-sm border flex flex-col gap-5 relative overflow-hidden transition-all hover:shadow-md",
                isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-100"
              )}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                  )}>
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{inv.name}</h3>
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded-md uppercase",
                      isDarkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"
                    )}>
                      {inv.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(inv.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className={cn("p-3 rounded-xl", isDarkMode ? "bg-gray-800/50" : "bg-gray-50")}>
                  <p className={cn("text-xs font-bold mb-1", isDarkMode ? "text-gray-400" : "text-gray-500")}>{language === 'bn' ? 'বিনিয়োগ' : 'Invested'}</p>
                  <p className="font-bold text-lg">{currency}{inv.amountInvested.toLocaleString()}</p>
                </div>
                <div className={cn("p-3 rounded-xl", isDarkMode ? "bg-indigo-900/20" : "bg-indigo-50")}>
                  <p className={cn("text-xs font-bold mb-1", isDarkMode ? "text-indigo-400" : "text-indigo-600")}>{language === 'bn' ? 'বর্তমান মূল্য' : 'Current Value'}</p>
                  <p className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{currency}{(inv.currentValue || inv.amountInvested).toLocaleString()}</p>
                </div>
                <div className={cn("p-3 rounded-xl", profit >= 0 ? (isDarkMode ? "bg-green-900/10" : "bg-green-50/50") : (isDarkMode ? "bg-red-900/10" : "bg-red-50/50"))}>
                  <p className={cn("text-xs font-bold mb-1", isDarkMode ? "text-gray-400" : "text-gray-500")}>{language === 'bn' ? 'লাভ/ক্ষতি' : 'Profit/Loss'}</p>
                  <p className={cn("font-bold flex items-center gap-1", profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                    {profit >= 0 ? '+' : ''}{currency}{profit.toLocaleString()}
                    <span className="text-xs opacity-80">({invProfitPercentage.toFixed(1)}%)</span>
                  </p>
                </div>
                <div className={cn("p-3 rounded-xl", isDarkMode ? "bg-gray-800/50" : "bg-gray-50")}>
                  <p className={cn("text-xs font-bold mb-1", isDarkMode ? "text-gray-400" : "text-gray-500")}>{language === 'bn' ? 'শুরুর তারিখ' : 'Start Date'}</p>
                  <p className="font-bold text-sm flex items-center gap-1.5 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {format(parseISO(inv.startDate), 'dd MMM yyyy')}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
        {investments.length === 0 && !isAdding && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center mb-6",
              isDarkMode ? "bg-gray-800" : "bg-gray-50"
            )}>
              <TrendingUp className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">{language === 'bn' ? 'কোনো বিনিয়োগ নেই' : 'No Investments Yet'}</h3>
            <p className={cn("max-w-sm", isDarkMode ? "text-gray-400" : "text-gray-500")}>
              {language === 'bn' ? 'আপনার ডিপিএস, এফডিআর বা অন্যান্য বিনিয়োগ যোগ করে আপনার আর্থিক বৃদ্ধি ট্র্যাক করুন।' : 'Add your DPS, FDR, or other investments to track your financial growth.'}
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              {language === 'bn' ? 'প্রথম বিনিয়োগ যোগ করুন' : 'Add First Investment'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
