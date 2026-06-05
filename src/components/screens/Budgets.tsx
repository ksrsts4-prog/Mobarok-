import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Budget, Transaction, Category } from '../../types';
import { IconComponent } from '../../utils/iconMap';
import { ErrorBoundary as ComponentErrorBoundary } from '../ui/ErrorBoundary';
import { BudgetAIAssistant } from '../BudgetAIAssistant';

export default function Budgets({ 
  budgets, 
  onAdd,
  onUpdate,
  onDelete,
  transactions, 
  categories, 
  currency, 
  isDarkMode,
  language,
  aiInstructions,
  formatAmount
}: { 
  budgets: Budget[], 
  onAdd: (b: Omit<Budget, 'id'>) => void,
  onUpdate: (b: Budget) => void,
  onDelete: (id: string) => void,
  transactions: Transaction[], 
  categories: Category[],
  currency: string,
  isDarkMode: boolean,
  language: 'bn' | 'en',
  aiInstructions: string,
  formatAmount: (amount: number) => string
}) {
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const handleSave = (budget: Omit<Budget, 'id'>) => {
    if (editingBudget) {
      onUpdate({ ...editingBudget, ...budget });
    } else {
      onAdd(budget);
    }
    setIsAddBudgetOpen(false);
    setEditingBudget(null);
  };

  const totalBudget = budgets.reduce((acc, b) => acc + b.amount, 0);
  const totalSpent = transactions
    .filter(t => t.type === 'expense' && budgets.some(b => b.categoryId === t.categoryId))
    .reduce((acc, t) => acc + t.amount, 0);
  
  const overallPercent = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">বাজেট প্ল্যানিং</h3>
        <button 
          onClick={() => setIsAddBudgetOpen(true)}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          বাজেট সেট করুন
        </button>
      </div>

      <ComponentErrorBoundary name="BudgetAIAssistant">
        <BudgetAIAssistant />
      </ComponentErrorBoundary>

      <div className="bg-blue-600 p-8 rounded-[40px] text-white shadow-sm shadow-blue-200 flex flex-col md:flex-row items-center gap-8">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle className="text-blue-500 stroke-current" strokeWidth="8" fill="transparent" r="40" cx="50" cy="50" />
            <circle 
              className="text-white stroke-current transition-all duration-1000" 
              strokeWidth="8" 
              strokeDasharray="251.2" 
              strokeDashoffset={251.2 - (251.2 * overallPercent) / 100}
              strokeLinecap="round" 
              fill="transparent" 
              r="40" cx="50" cy="50" 
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-2xl font-bold">{overallPercent}%</p>
            <p className="text-[10px] text-blue-100 uppercase tracking-wider">ব্যবহৃত</p>
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-xl font-bold mb-2">মোট বাজেট স্ট্যাটাস</h4>
          <p className="text-blue-100 mb-6">আপনি এই মাসে আপনার মোট বাজেটের {overallPercent}% খরচ করেছেন।</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-4 rounded-2xl">
              <p className="text-xs text-blue-100 mb-1">মোট বাজেট</p>
              <p className="text-xl font-bold">{currency} {formatAmount(totalBudget)}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl">
              <p className="text-xs text-blue-100 mb-1">অবশিষ্ট</p>
              <p className="text-xl font-bold">{currency} {formatAmount(totalBudget - totalSpent)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {budgets.map(budget => {
            const category = categories.find(c => c.id === budget.categoryId);
            const spent = transactions
              .filter(t => t.categoryId === budget.categoryId && t.type === 'expense')
              .reduce((acc, t) => acc + t.amount, 0);
            const percent = Math.min(Math.round((spent / budget.amount) * 100), 100);
            const isNearLimit = percent >= 80;

            return (
              <motion.div 
                key={budget.id} 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  "p-6 rounded-[32px] shadow-sm border group relative transition-all",
                  isNearLimit ? (isDarkMode ? "bg-red-900/20 border-red-900/50" : "bg-red-50 border-red-100") : (isDarkMode ? "bg-[#111827] border-gray-800 hover:bg-gray-800" : "bg-white border-gray-50 hover:shadow-md")
                )}
              >
                {isNearLimit && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 text-red-500 bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {language === 'bn' ? 'সতর্কতা: প্রায় শেষ!' : 'Near Limit!'}
                  </div>
                )}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${category?.color}15`, color: category?.color }}>
                      <IconComponent name={category?.icon || ''} className="w-6 h-6" />
                    </div>
                    <div>
                      <h5 className={cn("font-bold text-lg", isDarkMode ? "text-white" : "text-[#1B2559]")}>{category?.name}</h5>
                      <p className="text-xs text-gray-600">মাসিক বাজেট</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { setEditingBudget(budget); setIsAddBudgetOpen(true); }}
                      className={cn(
                        "p-2 rounded-xl transition-all",
                        isDarkMode ? "hover:bg-gray-800 text-blue-400" : "hover:bg-blue-50 text-blue-600"
                      )}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(budget.id)}
                      className={cn(
                        "p-2 rounded-xl transition-all",
                        isDarkMode ? "hover:bg-red-900/30 text-red-400" : "hover:bg-red-50 text-red-500"
                      )}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">খরচ: {currency} {formatAmount(spent)}</span>
                    <span className={cn("font-bold", isNearLimit ? "text-red-500" : "")} style={{ color: !isNearLimit ? category?.color : undefined }}>{percent}%</span>
                  </div>
                  <div className={cn("w-full h-3 rounded-full overflow-hidden", isDarkMode ? "bg-gray-800" : "bg-gray-100")}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      className={cn("h-full", isNearLimit ? "bg-red-500 shadow-lg shadow-red-200 dark:shadow-red-900" : "")} 
                      style={{ backgroundColor: !isNearLimit ? category?.color : undefined }}
                    />
                  </div>
                  <p className="text-xs text-right text-gray-300">অবশিষ্ট: {currency} {formatAmount(budget.amount - spent)}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {budgets.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-400">
            কোনো বাজেট সেট করা নেই। নতুন বাজেট যোগ করতে উপরের বাটনে ক্লিক করুন।
          </div>
        )}
      </div>

      {/* Add Budget Modal (Simplified for demo) */}
      <AnimatePresence>
        {isAddBudgetOpen && (
          <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/50">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-md my-8"
              >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">{editingBudget ? 'বাজেট এডিট করুন' : 'বাজেট যোগ করুন'}</h3>
                <button onClick={() => { setIsAddBudgetOpen(false); setEditingBudget(null); }} className="p-2 hover:bg-gray-100 rounded-xl">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSave({
                  categoryId: formData.get('category') as string,
                  amount: Number(formData.get('amount')) || 0,
                  period: 'monthly'
                });
              }} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2">ক্যাটাগরি</label>
                  <select name="category" defaultValue={editingBudget?.categoryId} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-medium">
                    {categories.filter(c => c.type === 'expense').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">পরিমাণ ({currency})</label>
                  <input name="amount" type="number" step="any" min="0" defaultValue={editingBudget?.amount} required className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold text-xl" placeholder="0.00" />
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