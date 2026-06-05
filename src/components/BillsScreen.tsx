import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Bell, CheckCircle, Clock, Calendar as CalendarIcon, FileText, IndianRupee } from 'lucide-react';
import { Bill } from '../types';
import { cn } from '../lib/utils';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { useAppStore } from '../store/useAppStore';

interface Props {
  bills: Bill[];
  onAdd: (b: Omit<Bill, 'id'>) => void;
  onUpdate: (id: string, b: Partial<Bill>) => void;
  onDelete: (id: string) => void;
  isDarkMode: boolean;
  language: 'bn' | 'en';
  currency: string;
}

export function BillsScreen({ bills, onAdd, onUpdate, onDelete, isDarkMode, language, currency }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [newBill, setNewBill] = useState<Partial<Bill>>({
    name: '',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    isPaid: false,
    category: 'সাবস্ক্রিপশন',
    note: ''
  });

  const handleSave = () => {
    if (!newBill.name || !newBill.amount || !newBill.dueDate || !newBill.category) return;
    onAdd(newBill as Omit<Bill, 'id'>);
    setIsAdding(false);
    setNewBill({
      name: '',
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      isPaid: false,
      category: 'সাবস্ক্রিপশন',
      note: ''
    });
  };

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
            isDarkMode ? "bg-orange-500 shadow-orange-900/50" : "bg-orange-500 shadow-orange-200"
          )}>
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{language === 'bn' ? 'সাবস্ক্রিপশন ও বিল' : 'Subscriptions & Bills'}</h2>
            <p className={cn("text-sm", isDarkMode ? "text-gray-300" : "text-gray-600")}>
              {language === 'bn' ? 'আপনার মাসিক সাবস্ক্রিপশন এবং বিল ট্র্যাক করুন' : 'Track your monthly subscriptions and bills'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-sm active:scale-95",
            isAdding 
              ? (isDarkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200")
              : "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-200 dark:shadow-none"
          )}
        >
          {isAdding ? <Trash2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          <span className="hidden sm:inline">{isAdding ? (language === 'bn' ? 'বাতিল' : 'Cancel') : (language === 'bn' ? 'নতুন যোগ করুন' : 'Add New')}</span>
        </button>
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
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-500"></div>
            <h3 className="font-bold text-xl">{language === 'bn' ? 'নতুন সাবস্ক্রিপশন বা বিল' : 'New Subscription or Bill'}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {language === 'bn' ? 'নাম' : 'Name'}
                </label>
                <input
                  type="text"
                  value={newBill.name}
                  onChange={e => setNewBill({ ...newBill, name: e.target.value })}
                  className={cn(
                    "w-full p-4 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 font-medium transition-all",
                    isDarkMode ? "bg-gray-800 text-white" : "bg-gray-50"
                  )}
                  placeholder={language === 'bn' ? 'যেমন: Netflix, বিদ্যুৎ বিল' : 'e.g., Netflix, Electricity'}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 flex items-center gap-2">
                  <span className="font-serif font-bold text-base">{currency}</span>
                  {language === 'bn' ? 'পরিমাণ' : 'Amount'}
                </label>
                <input
                  type="number"
                  value={newBill.amount || ''}
                  onChange={e => setNewBill({ ...newBill, amount: Number(e.target.value) })}
                  className={cn(
                    "w-full p-4 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 font-medium transition-all",
                    isDarkMode ? "bg-gray-800 text-white" : "bg-gray-50"
                  )}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  {language === 'bn' ? 'ক্যাটাগরি' : 'Category'}
                </label>
                <select
                  value={newBill.category}
                  onChange={e => setNewBill({ ...newBill, category: e.target.value })}
                  className={cn(
                    "w-full p-4 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 font-medium transition-all",
                    isDarkMode ? "bg-gray-800 text-white" : "bg-gray-50"
                  )}
                >
                  <option value="সাবস্ক্রিপশন">{language === 'bn' ? 'সাবস্ক্রিপশন (Netflix, Spotify)' : 'Subscription (Netflix, Spotify)'}</option>
                  <option value="বিদ্যুৎ">{language === 'bn' ? 'বিদ্যুৎ' : 'Electricity'}</option>
                  <option value="গ্যাস">{language === 'bn' ? 'গ্যাস' : 'Gas'}</option>
                  <option value="পানি">{language === 'bn' ? 'পানি' : 'Water'}</option>
                  <option value="ইন্টারনেট">{language === 'bn' ? 'ইন্টারনেট' : 'Internet'}</option>
                  <option value="লোন">{language === 'bn' ? 'লোন/কিস্তি' : 'Loan/EMI'}</option>
                  <option value="অন্যান্য">{language === 'bn' ? 'অন্যান্য' : 'Other'}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {language === 'bn' ? 'শেষ তারিখ' : 'Due Date'}
                </label>
                <input
                  type="date"
                  value={newBill.dueDate}
                  onChange={e => setNewBill({ ...newBill, dueDate: e.target.value })}
                  className={cn(
                    "w-full p-4 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 font-medium transition-all",
                    isDarkMode ? "bg-gray-800 text-white" : "bg-gray-50"
                  )}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-gray-500 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {language === 'bn' ? 'নোট (ঐচ্ছিক)' : 'Note (Optional)'}
                </label>
                <input
                  type="text"
                  value={newBill.note}
                  onChange={e => setNewBill({ ...newBill, note: e.target.value })}
                  className={cn(
                    "w-full p-4 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 font-medium transition-all",
                    isDarkMode ? "bg-gray-800 text-white" : "bg-gray-50"
                  )}
                  placeholder={language === 'bn' ? 'অতিরিক্ত তথ্য...' : 'Additional info...'}
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!newBill.name || !newBill.amount}
              className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-200 dark:shadow-none hover:bg-orange-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {language === 'bn' ? 'সেভ করুন' : 'Save Bill'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bills.map(bill => {
          const dueDate = parseISO(bill.dueDate);
          const isLate = isPast(dueDate) && !isToday(dueDate) && !bill.isPaid;
          
          return (
            <motion.div
              key={bill.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "p-6 rounded-[24px] shadow-sm border flex flex-col gap-5 relative overflow-hidden transition-all hover:shadow-md",
                isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-100",
                isLate && !bill.isPaid ? "border-red-300 dark:border-red-900/50" : ""
              )}
            >
              {isLate && !bill.isPaid && (
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
              )}
              {bill.isPaid && (
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
              )}

              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    bill.isPaid 
                      ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
                      : isLate 
                        ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" 
                        : "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                  )}>
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{bill.name}</h3>
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded-md",
                      isDarkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"
                    )}>
                      {bill.category}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl">{currency}{bill.amount.toLocaleString()}</p>
                  <div className={cn(
                    "text-xs font-bold flex items-center gap-1.5 justify-end mt-1 px-2 py-1 rounded-lg inline-flex",
                    bill.isPaid 
                      ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" 
                      : isLate 
                        ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" 
                        : "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                  )}>
                    <Clock className="w-3.5 h-3.5" />
                    {format(dueDate, 'dd MMM yyyy')}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => onUpdate(bill.id, { isPaid: !bill.isPaid })}
                  className={cn(
                    "flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-all active:scale-95",
                    bill.isPaid 
                      ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-400" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  )}
                >
                  <CheckCircle className={cn("w-5 h-5", bill.isPaid ? "text-green-600 dark:text-green-400" : "text-gray-400")} />
                  {bill.isPaid ? (language === 'bn' ? 'পরিশোধিত' : 'Paid') : (language === 'bn' ? 'পরিশোধ করুন' : 'Mark as Paid')}
                </button>
                <button
                  onClick={() => onDelete(bill.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          );
        })}
        {bills.length === 0 && !isAdding && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center mb-6",
              isDarkMode ? "bg-gray-800" : "bg-gray-50"
            )}>
              <Bell className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">{language === 'bn' ? 'কোনো বিল নেই' : 'No Bills Yet'}</h3>
            <p className={cn("max-w-sm", isDarkMode ? "text-gray-400" : "text-gray-500")}>
              {language === 'bn' ? 'আপনার মাসিক বিল বা কিস্তি যোগ করুন যাতে কোনো পেমেন্ট মিস না হয়।' : 'Add your monthly bills or installments so you never miss a payment.'}
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200 dark:shadow-none"
            >
              {language === 'bn' ? 'প্রথম বিল যোগ করুন' : 'Add First Bill'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
