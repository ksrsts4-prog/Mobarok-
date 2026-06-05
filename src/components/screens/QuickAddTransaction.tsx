import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Delete, Tag } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Category, Transaction } from '../../types';
import { format } from 'date-fns';

export function QuickAddTransaction({ 
  onClose, 
  onSave, 
  onOpenDetailed,
  categories, 
  currency, 
  isDarkMode, 
  language 
}: {
  onClose: () => void;
  onSave: (t: Omit<Transaction, 'id'>) => void;
  onOpenDetailed: () => void;
  categories: Category[];
  currency: string;
  isDarkMode: boolean;
  language: 'en' | 'bn';
}) {
  const [amountStr, setAmountStr] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [categoryId, setCategoryId] = useState<string>('');

  const typeCategories = categories.filter(c => c.type === type);

  useEffect(() => {
    if (!categoryId || !typeCategories.find(c => c.id === categoryId)) {
      if (typeCategories.length > 0) {
        setCategoryId(typeCategories[0].id);
      }
    }
  }, [type, typeCategories, categoryId]);

  const handleNumpad = (val: string) => {
    if (val === 'back') {
      setAmountStr(prev => prev.slice(0, -1));
    } else if (val === '.') {
      if (!amountStr.includes('.')) setAmountStr(prev => prev + '.');
    } else {
      if (amountStr === '0' && val !== '.') {
         setAmountStr(val);
      } else {
         if (amountStr.length < 10) setAmountStr(prev => prev + val);
      }
    }
  };

  const selectedCategory = categories.find(c => c.id === categoryId);

  const handleSave = () => {
    const amt = parseFloat(amountStr);
    if (isNaN(amt) || amt <= 0) {
      alert(language === 'bn' ? 'অনুগ্রহ করে সঠিক বা ধনাত্মক পরিমাণ লিখুন।' : 'Please enter a valid positive amount.');
      return;
    }
    if (!categoryId) {
      alert(language === 'bn' ? 'অনুগ্রহ করে ক্যাটাগরি নির্বাচন করুন।' : 'Please select a category.');
      return;
    }
    
    onSave({
      amount: amt,
      type,
      categoryId,
      date: new Date().toISOString(),
      note: language === 'bn' ? 'কুইক অ্যাড' : 'Quick Add'
    });
  };

  const numpadKeys = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '.', '0', 'back'
  ];

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ willChange: 'opacity' }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        style={{ willChange: 'transform' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[70] rounded-t-[32px] p-4 pb-6 md:p-6 md:pb-8 shadow-2xl border-t",
          "max-h-[90vh] overflow-y-auto scrollbar-hide flex flex-col",
          isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"
        )}
      >
        <div className="w-16 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4 opacity-50 shrink-0" />
        
        {/* Type Toggle */}
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4 shrink-0">
          <button
            onClick={() => setType('expense')}
            className={cn(
              "flex-1 py-2 md:py-3 text-sm font-bold rounded-xl transition-all",
              type === 'expense' 
                ? "bg-white dark:bg-gray-700 text-red-500 shadow-sm" 
                : "text-gray-600 hover:text-gray-700 dark:text-gray-300"
            )}
          >
            {language === 'bn' ? 'ব্যয়' : 'Expense'}
          </button>
          <button
            onClick={() => setType('income')}
            className={cn(
              "flex-1 py-2 md:py-3 text-sm font-bold rounded-xl transition-all",
              type === 'income' 
                ? "bg-white dark:bg-gray-700 text-green-500 shadow-sm" 
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            )}
          >
            {language === 'bn' ? 'আয়' : 'Income'}
          </button>
        </div>

        {/* Amount Display */}
        <div className="flex items-center justify-center mb-4 shrink-0">
          <span className="text-xl md:text-2xl font-bold text-gray-400 mr-2">{currency}</span>
          <span className={cn("text-5xl md:text-6xl font-black tracking-tight", isDarkMode ? "text-white" : "text-gray-900", !amountStr && "opacity-30")}>
            {amountStr || '0'}
          </span>
        </div>

        {/* Quick Category Selector */}
        <div className="flex overflow-x-auto gap-2 pb-2 mb-4 scrollbar-hide shrink-0">
          {typeCategories.slice(0, 10).map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryId(cat.id)}
              className={cn(
                "flex-shrink-0 flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 rounded-2xl border-2 transition-all font-bold text-xs md:text-sm",
                categoryId === cat.id
                  ? (type === 'expense' ? "border-red-500 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" : "border-green-500 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400")
                  : "border-transparent bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              )}
            >
              <div 
                className="w-3 h-3 md:w-4 md:h-4 rounded-full" 
                style={{ backgroundColor: cat.color }}
              />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 shrink-0">
          {numpadKeys.map(key => (
            <button
              key={key}
              onClick={() => handleNumpad(key)}
              className={cn(
                "h-12 md:h-16 flex items-center justify-center text-2xl md:text-3xl font-medium rounded-2xl transition-colors active:scale-95 transform-gpu",
                isDarkMode 
                  ? "bg-gray-800 text-white hover:bg-gray-700 active:bg-gray-600" 
                  : "bg-gray-50 text-gray-900 hover:bg-gray-100 active:bg-gray-200"
              )}
            >
              {key === 'back' ? <Delete className="w-6 h-6 md:w-8 md:h-8 opacity-70" /> : key}
            </button>
          ))}
        </div>

        {/* Advanced details link */}
        <div className="flex justify-center mb-3 shrink-0">
          <button
            onClick={() => {
              onClose();
              onOpenDetailed();
            }}
            className={cn(
              "text-xs md:text-sm font-semibold flex items-center gap-1 hover:underline transition-colors",
              isDarkMode ? "text-blue-400" : "text-blue-600"
            )}
          >
            {language === 'bn' ? 'বিস্তারিত তথ্য যোগ করুন (Advanced)' : 'Add More Details (Advanced)'}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 md:gap-4 mt-auto shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 md:py-4 bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 rounded-2xl font-bold text-base md:text-lg"
          >
            {language === 'bn' ? 'বাতিল' : 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            disabled={!parseFloat(amountStr)}
            className="flex-[2] py-3 md:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform-gpu active:scale-95 transition-all shadow-lg shadow-blue-500/30"
          >
            <Check className="w-5 h-5 md:w-6 md:h-6" />
            {language === 'bn' ? 'সেভ করুন' : 'Save'}
          </button>
        </div>
      </motion.div>
    </>
  );
}
