import React, { useState, useEffect } from 'react';
import { FamilyMember, Transaction, Category } from '../types';
import { Plus, Trash2, Users, X, Crown, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  familyMembers: FamilyMember[];
  onAdd: (f: Omit<FamilyMember, 'id'>) => void;
  onDelete: (id: string) => void;
  transactions: Transaction[];
  categories: Category[];
  isDarkMode: boolean;
  language: 'bn' | 'en';
  currency: string;
  isPremium?: boolean;
}

export function FamilyBudgetScreen({ familyMembers, onAdd, onDelete, transactions, categories, isDarkMode, language, currency, isPremium }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [color, setColor] = useState('#3B82F6');

  if (!isPremium) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
        <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-tr from-amber-200 to-yellow-400 p-1 shadow-xl">
          <div className="w-full h-full bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
            <Crown className="w-12 h-12 text-yellow-500" />
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
          {language === 'bn' ? 'ফ্যামিলি সিংক (প্রিমিয়াম)' : 'Family Sync (Premium)'}
          <Lock className="w-6 h-6 text-yellow-500" />
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 text-lg">
          {language === 'bn' 
            ? 'স্বামী-স্ত্রী বা বিজনেস পার্টনাররা মিলে একটি গ্রুপ তৈরি করুন এবং সবার খরচগুলো রিয়েল-টাইমে একটি ড্যাশবোর্ডে সিঙ্ক করুন। এই ফিচারটি আনলক করতে প্রিমিয়াম আপগ্রেড করুন।' 
            : 'Create a group with your spouse or business partners and seamlessly sync all expenses in real-time. Upgrade to Premium to unlock this feature.'}
        </p>
        <button className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold rounded-2xl shadow-lg shadow-yellow-500/30 hover:scale-105 transition-transform active:scale-95 text-lg">
          {language === 'bn' ? 'প্রিমিয়াম আপগ্রেড করুন' : 'Upgrade to Premium'}
        </button>
      </div>
    );
  }

  const handleAdd = () => {
    if (!name) return;
    onAdd({
      name,
      relation,
      color
    });
    setIsAdding(false);
    setName('');
    setRelation('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) {
      onDelete(id);
    }
  };

  const getMemberSpending = (memberId: string) => {
    return transactions
      .filter(t => t.familyMemberId === memberId && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{language === 'bn' ? 'ফ্যামিলি বাজেট' : 'Family Budget'}</h2>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdding(true)} 
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl flex items-center gap-2 font-medium shadow-lg shadow-blue-200 transition-all hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" /> 
          <span className="hidden sm:inline">{language === 'bn' ? 'সদস্য যোগ করুন' : 'Add Member'}</span>
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
                  "relative inline-block align-bottom w-full max-w-lg overflow-hidden rounded-[32px] p-6 sm:p-8 shadow-md sm:align-middle text-left",
                  isDarkMode ? "bg-[#111827] border border-gray-800" : "bg-white"
                )}
              >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", isDarkMode ? "bg-blue-900/30 text-blue-400" : "bg-blue-50 text-blue-600")}>
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{language === 'bn' ? 'সদস্য যোগ করুন' : 'Add Member'}</h3>
                    <p className={cn("text-sm", isDarkMode ? "text-gray-300" : "text-gray-600")}>{language === 'bn' ? 'ফ্যামিলি বাজেটের জন্য নতুন সদস্য যোগ করুন' : 'Add a new member for the family budget'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAdding(false)}
                  className={cn("p-2 rounded-full transition-colors", isDarkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500")}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5 mb-8">
                <div>
                  <label className={cn("block text-sm font-semibold mb-2", isDarkMode ? "text-gray-300" : "text-gray-700")}>{language === 'bn' ? 'নাম' : 'Name'}</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder={language === 'bn' ? 'সদস্যের নাম লিখুন...' : 'Enter member name...'}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none", 
                      isDarkMode ? "bg-gray-800/50 border-gray-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                    )} 
                  />
                </div>
                <div>
                  <label className={cn("block text-sm font-semibold mb-2", isDarkMode ? "text-gray-300" : "text-gray-700")}>{language === 'bn' ? 'সম্পর্ক' : 'Relation'}</label>
                  <input 
                    type="text" 
                    value={relation} 
                    onChange={e => setRelation(e.target.value)} 
                    placeholder={language === 'bn' ? 'যেমন: স্ত্রী, ছেলে' : 'e.g. Wife, Son'} 
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none", 
                      isDarkMode ? "bg-gray-800/50 border-gray-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                    )} 
                  />
                </div>
                <div>
                  <label className={cn("block text-sm font-semibold mb-2", isDarkMode ? "text-gray-300" : "text-gray-700")}>{language === 'bn' ? 'রঙ (Color)' : 'Color'}</label>
                  <div className={cn("flex items-center gap-4 p-2 rounded-xl border border-dashed", isDarkMode ? "border-gray-700" : "border-gray-200")}>
                    <input 
                      type="color" 
                      value={color} 
                      onChange={e => setColor(e.target.value)} 
                      className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-none appearance-none" 
                    />
                    <span className={cn("text-sm font-mono uppercase", isDarkMode ? "text-gray-400" : "text-gray-500")}>{color}</span>
                  </div>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {familyMembers.map(member => {
          const spending = getMemberSpending(member.id);
          return (
            <div key={member.id} className={cn("p-5 rounded-2xl border-t-4", isDarkMode ? "bg-gray-800" : "bg-white shadow-sm")} style={{ borderColor: member.color }}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: member.color }}>
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{member.name}</h3>
                    <p className="text-xs text-gray-500">{member.relation}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(member.id)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">{language === 'bn' ? 'মোট খরচ' : 'Total Spent'}</p>
                <p className="text-2xl font-bold">{currency}{spending}</p>
              </div>
            </div>
          );
        })}
        {familyMembers.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-8">{language === 'bn' ? 'কোনো ফ্যামিলি মেম্বার যোগ করা হয়নি।' : 'No family members added.'}</p>
        )}
      </div>
    </div>
  );
}
