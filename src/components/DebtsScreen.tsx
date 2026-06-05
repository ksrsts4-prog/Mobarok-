import React, { useState } from 'react';
import { Debt } from '../types';
import { Plus, Trash2, CreditCard, CheckCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/useAppStore';

interface Props {
  debts: Debt[];
  onAdd: (d: Omit<Debt, 'id'>) => void;
  onUpdate: (id: string, d: Partial<Debt>) => void;
  onDelete: (id: string) => void;
  isDarkMode: boolean;
  language: 'bn' | 'en';
  currency: string;
}

export function DebtsScreen({ debts, onAdd, onUpdate, onDelete, isDarkMode, language, currency }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'borrowed' | 'lent'>('borrowed');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');

  const handleAdd = () => {
    if (!person || !amount) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert(language === 'bn' ? 'দয়া করে সঠিক পরিমাণ লিখুন।' : 'Please enter a valid amount.');
      return;
    }
    const newDebt: any = {
      type,
      person,
      amount: numAmount,
      remaining: numAmount,
      note,
      createdAt: new Date().toISOString()
    };
    if (dueDate) newDebt.dueDate = new Date(dueDate).toISOString();

    onAdd(newDebt as Omit<Debt, 'id'>);
    setIsAdding(false);
    setPerson('');
    setAmount('');
    setNote('');
    setDueDate('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) {
      onDelete(id);
    }
  };

  const handlePay = (id: string) => {
    const payAmountStr = window.prompt(language === 'bn' ? 'কত টাকা পরিশোধ করা হলো?' : 'How much was paid?');
    if (!payAmountStr) return;
    const payAmount = parseFloat(payAmountStr);
    if (isNaN(payAmount) || payAmount <= 0) return;

    const debt = debts.find(d => d.id === id);
    if (debt) {
      const newRemaining = Math.max(0, debt.remaining - payAmount);
      onUpdate(id, { remaining: newRemaining });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{language === 'bn' ? 'ধার বা লোন' : 'Debts & Loans'}</h2>
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
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", isDarkMode ? "bg-red-900/30 text-red-400" : "bg-red-50 text-red-600")}>
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{language === 'bn' ? 'নতুন লোন বা ধার' : 'New Web/Loan'}</h3>
                    <p className={cn("text-sm", isDarkMode ? "text-gray-300" : "text-gray-600")}>
                      {language === 'bn' ? 'কারও থেকে ধার নিলে বা দিলে তা এখানে লিখুন' : 'Keep track of money borrowed or lent'}
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
                  <label className={cn("block text-sm font-semibold mb-2", isDarkMode ? "text-gray-300" : "text-gray-700")}>{language === 'bn' ? 'ব্যক্তির নাম' : 'Person Name'}</label>
                  <input 
                    type="text" 
                    value={person} 
                    onChange={e => setPerson(e.target.value)} 
                    placeholder={language === 'bn' ? 'কার থেকে / কাকে?' : 'Who?'}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none", 
                      isDarkMode ? "bg-gray-800/50 border-gray-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                    )} 
                  />
                </div>
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
                    onChange={e => setType(e.target.value as any)} 
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer", 
                      isDarkMode ? "bg-gray-800/50 border-gray-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                    )}
                  >
                    <option value="borrowed">{language === 'bn' ? 'আমি ধার নিয়েছি (Borrowed)' : 'I Borrowed'}</option>
                    <option value="lent">{language === 'bn' ? 'আমি ধার দিয়েছি (Lent)' : 'I Lent'}</option>
                  </select>
                </div>
                <div>
                  <label className={cn("block text-sm font-semibold mb-2", isDarkMode ? "text-gray-300" : "text-gray-700")}>{language === 'bn' ? 'পরিশোধের তারিখ (ঐচ্ছিক)' : 'Due Date (Optional)'}</label>
                  <input 
                    type="date" 
                    value={dueDate} 
                    onChange={e => setDueDate(e.target.value)} 
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer", 
                      isDarkMode ? "bg-gray-800/50 border-gray-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                    )} 
                  />
                </div>
                <div className="md:col-span-2">
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
                  className={cn(
                    "flex-1 px-4 py-3 rounded-xl font-bold shadow-lg transition-all text-white",
                    type === 'borrowed' ? "bg-red-600 hover:bg-red-700 shadow-red-200" : "bg-green-600 hover:bg-green-700 shadow-green-200"
                  )}
                >
                  {language === 'bn' ? 'সেভ করুন' : 'Save'}
                </button>
              </div>
            </motion.div>
          </div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {debts.map(d => (
          <div key={d.id} className={cn("p-5 rounded-2xl border-l-4", isDarkMode ? "bg-gray-800" : "bg-white shadow-sm", d.type === 'borrowed' ? "border-red-500" : "border-green-500")}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-lg">{d.person}</h3>
                <p className="text-xs text-gray-500">{d.type === 'borrowed' ? (language === 'bn' ? 'আমি ধার নিয়েছি' : 'I borrowed') : (language === 'bn' ? 'আমি ধার দিয়েছি' : 'I lent')}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl">{currency}{d.remaining}</p>
                <p className="text-xs text-gray-500">{language === 'bn' ? 'মোট:' : 'Total:'} {currency}{d.amount}</p>
              </div>
            </div>
            {d.dueDate && <p className="text-sm mt-2 text-orange-500">{language === 'bn' ? 'পরিশোধের তারিখ:' : 'Due:'} {new Date(d.dueDate).toLocaleDateString()}</p>}
            {d.note && <p className="text-sm mt-1 text-gray-500">{d.note}</p>}
            
            <div className="mt-4 flex justify-end gap-2">
              {d.remaining > 0 && (
                <button onClick={() => handlePay(d.id)} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> {language === 'bn' ? 'পরিশোধ' : 'Pay'}
                </button>
              )}
              <button onClick={() => handleDelete(d.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm flex items-center gap-1">
                <Trash2 className="w-4 h-4" /> {language === 'bn' ? 'মুছুন' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
        {debts.length === 0 && (
          <p className="text-gray-500 col-span-2 text-center py-8">{language === 'bn' ? 'কোনো ধার বা লোন নেই।' : 'No debts or loans.'}</p>
        )}
      </div>
    </div>
  );
}
