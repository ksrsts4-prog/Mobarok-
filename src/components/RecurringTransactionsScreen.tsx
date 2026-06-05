import React, { useState } from 'react';
import { RecurringTransaction, Category, TransactionType } from '../types';
import { Plus, Trash2, Edit2, Repeat, Calendar, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/useAppStore';

interface Props {
  recurringTransactions: RecurringTransaction[];
  onAdd: (r: Omit<RecurringTransaction, 'id'>) => void;
  onDelete: (id: string) => void;
  categories: Category[];
  isDarkMode: boolean;
  language: 'bn' | 'en';
  currency: string;
}

export function RecurringTransactionsScreen({ recurringTransactions, onAdd, onDelete, categories, isDarkMode, language, currency }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [categoryId, setCategoryId] = useState(categories.filter(c => c.type === 'expense')[0]?.id || '');
  const [note, setNote] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [nextDate, setNextDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAdd = () => {
    if (!amount || !categoryId || !nextDate) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert(language === 'bn' ? 'দয়া করে সঠিক পরিমাণ লিখুন।' : 'Please enter a valid amount.');
      return;
    }
    onAdd({
      amount: numAmount,
      type,
      categoryId,
      note,
      frequency,
      nextDate: new Date(nextDate).toISOString()
    });
    setIsAdding(false);
    setAmount('');
    setNote('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{language === 'bn' ? 'নিয়মিত লেনদেন' : 'Recurring Transactions'}</h2>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdding(true)} 
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl flex items-center gap-2 font-medium shadow-lg shadow-blue-200 transition-all hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" /> 
          <span className="hidden sm:inline">{language === 'bn' ? 'নতুন যোগ করুন' : 'Add New'}</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[9999] overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 transition-opacity"
                onClick={() => setIsAdding(false)}
              />
              
              {/* This element is to trick the browser into centering the modal contents. */}
              <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={cn(
                  "relative inline-block align-bottom w-full max-w-2xl overflow-hidden rounded-[32px] p-6 sm:p-8 shadow-md sm:align-middle text-left",
                  isDarkMode ? "bg-[#111827] border border-gray-800" : "bg-white"
                )}
              >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", isDarkMode ? "bg-blue-900/30 text-blue-400" : "bg-blue-50 text-blue-600")}>
                    <Repeat className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{language === 'bn' ? 'নিয়মিত লেনদেন যোগ করুন' : 'Add Recurring Transaction'}</h3>
                    <p className={cn("text-sm", isDarkMode ? "text-gray-300" : "text-gray-600")}>
                      {language === 'bn' ? 'যেসব খরচ বা আয় নিয়মিত হয় সেগুলো সেভ করে রাখুন' : 'Save recurring expenses or income'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAdding(false)}
                  className={cn("p-2 rounded-full transition-colors", isDarkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500")}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <div>
                  <label className={cn("block text-sm font-semibold mb-2", isDarkMode ? "text-gray-300" : "text-gray-700")}>{language === 'bn' ? 'পরিমাণ' : 'Amount'}</label>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                    placeholder="0.00"
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none", 
                      isDarkMode ? "bg-gray-800/50 border-gray-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                    )} 
                  />
                </div>
                <div>
                  <label className={cn("block text-sm font-semibold mb-2", isDarkMode ? "text-gray-300" : "text-gray-700")}>{language === 'bn' ? 'ধরন' : 'Type'}</label>
                  <select 
                    value={type} 
                    onChange={e => { setType(e.target.value as TransactionType); setCategoryId(categories.filter(c => c.type === e.target.value)[0]?.id || ''); }} 
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer", 
                      isDarkMode ? "bg-gray-800/50 border-gray-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                    )}
                  >
                    <option value="expense">{language === 'bn' ? 'ব্যয়' : 'Expense'}</option>
                    <option value="income">{language === 'bn' ? 'আয়' : 'Income'}</option>
                  </select>
                </div>
                <div>
                  <label className={cn("block text-sm font-semibold mb-2", isDarkMode ? "text-gray-300" : "text-gray-700")}>{language === 'bn' ? 'ক্যাটাগরি' : 'Category'}</label>
                  <select 
                    value={categoryId} 
                    onChange={e => setCategoryId(e.target.value)} 
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer", 
                      isDarkMode ? "bg-gray-800/50 border-gray-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                    )}
                  >
                    {categories.filter(c => c.type === type).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={cn("block text-sm font-semibold mb-2", isDarkMode ? "text-gray-300" : "text-gray-700")}>{language === 'bn' ? 'ফ্রিকোয়েন্সি' : 'Frequency'}</label>
                  <select 
                    value={frequency} 
                    onChange={e => setFrequency(e.target.value as any)} 
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer", 
                      isDarkMode ? "bg-gray-800/50 border-gray-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                    )}
                  >
                    <option value="daily">{language === 'bn' ? 'দৈনিক' : 'Daily'}</option>
                    <option value="weekly">{language === 'bn' ? 'সাপ্তাহিক' : 'Weekly'}</option>
                    <option value="monthly">{language === 'bn' ? 'মাসিক' : 'Monthly'}</option>
                    <option value="yearly">{language === 'bn' ? 'বার্ষিক' : 'Yearly'}</option>
                  </select>
                </div>
                <div>
                  <label className={cn("block text-sm font-semibold mb-2", isDarkMode ? "text-gray-300" : "text-gray-700")}>{language === 'bn' ? 'পরবর্তী তারিখ' : 'Next Date'}</label>
                  <input 
                    type="date" 
                    value={nextDate} 
                    onChange={e => setNextDate(e.target.value)} 
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer", 
                      isDarkMode ? "bg-gray-800/50 border-gray-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                    )} 
                  />
                </div>
                <div>
                  <label className={cn("block text-sm font-semibold mb-2", isDarkMode ? "text-gray-300" : "text-gray-700")}>{language === 'bn' ? 'নোট (ঐচ্ছিক)' : 'Note (Optional)'}</label>
                  <input 
                    type="text" 
                    value={note} 
                    onChange={e => setNote(e.target.value)} 
                    placeholder={language === 'bn' ? 'কিছু লিখুন...' : 'Write something...'}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none", 
                      isDarkMode ? "bg-gray-800/50 border-gray-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                    )} 
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsAdding(false)} 
                  className={cn(
                    "flex-1 px-4 py-3 rounded-xl font-bold transition-colors", 
                    isDarkMode ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button 
                  onClick={handleAdd} 
                  className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                >
                  {language === 'bn' ? 'সেভ করুন' : 'Save'}
                </button>
              </div>
            </motion.div>
          </div>
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {recurringTransactions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">{language === 'bn' ? 'কোনো নিয়মিত লেনদেন নেই।' : 'No recurring transactions.'}</p>
        ) : (
          recurringTransactions.map(rt => {
            const cat = categories.find(c => c.id === rt.categoryId);
            return (
              <div key={rt.id} className={cn("p-4 rounded-xl flex items-center justify-between", isDarkMode ? "bg-gray-800" : "bg-white shadow-sm")}>
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-xl", isDarkMode ? "bg-gray-700" : "bg-gray-100")}>
                    <Repeat className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-bold">{cat?.name || 'Unknown'}</h4>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(rt.nextDate).toLocaleDateString()} ({rt.frequency})</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn("font-bold", rt.type === 'income' ? "text-green-500" : "text-red-500")}>
                    {rt.type === 'income' ? '+' : '-'}{currency}{rt.amount}
                  </span>
                  <button onClick={() => handleDelete(rt.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
