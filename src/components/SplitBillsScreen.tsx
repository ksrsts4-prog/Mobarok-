import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, X, Receipt, ArrowRight, User, Check, Calculator, Percent } from 'lucide-react';
import { cn } from '../lib/utils';
import { FamilyMember } from '../types';
import { useAppStore } from '../store/useAppStore';

type SplitMode = 'equal' | 'exact';

export function SplitBillsScreen({
  familyMembers,
  currency,
  isDarkMode,
  language,
  onAddDebt,
  isFetchingTx
}: {
  familyMembers: FamilyMember[],
  currency: string,
  isDarkMode: boolean,
  language: 'bn' | 'en',
  onAddDebt?: (debt: any) => void,
  isFetchingTx?: boolean
}) {
  const [billName, setBillName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [payerId, setPayerId] = useState<string>('me');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(['me']);
  const [splitMode, setSplitMode] = useState<SplitMode>('equal');
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  
  const [splits, setSplits] = useState<{from: string, to: string, amount: number, id: string}[]>([]);
  const [savedSplits, setSavedSplits] = useState<Record<string, boolean>>({});

  const participants = useMemo(() => {
    const list = [{ id: 'me', name: language === 'bn' ? 'আমি' : 'Me', isMe: true }];
    familyMembers.forEach(m => list.push({ id: m.id, name: m.name, isMe: false }));
    return list;
  }, [familyMembers, language]);

  const toggleParticipant = (id: string) => {
    setSelectedParticipants(prev => {
      const isSelected = prev.includes(id);
      if (isSelected && prev.length === 1) return prev; // Keep at least one
      return isSelected ? prev.filter(p => p !== id) : [...prev, id];
    });
  };

  const handleCalculate = () => {
    const amt = parseFloat(totalAmount);
    if (!amt || isNaN(amt) || selectedParticipants.length === 0) return;

    const newSplits: any[] = [];
    setSavedSplits({});

    if (splitMode === 'equal') {
      const perPerson = amt / selectedParticipants.length;
      for (const p of selectedParticipants) {
        if (p !== payerId) {
          newSplits.push({ id: `${p}-${payerId}-${Date.now()}`, from: p, to: payerId, amount: perPerson });
        }
      }
    } else if (splitMode === 'exact') {
      for (const p of selectedParticipants) {
        if (p !== payerId) {
          const personAmt = parseFloat(exactAmounts[p] || '0');
          if (personAmt > 0) {
            newSplits.push({ id: `${p}-${payerId}-${Date.now()}`, from: p, to: payerId, amount: personAmt });
          }
        }
      }
    }

    setSplits(newSplits);
  };

  const getParticipantName = (id: string) => participants.find(p => p.id === id)?.name || id;

  const saveAsDebt = (split: {from: string, to: string, amount: number, id: string}) => {
    if (!onAddDebt || savedSplits[split.id]) return;

    if (split.from !== 'me' && split.to !== 'me') {
      alert(language === 'bn' ? 'শুধুমাত্র আপনার সাথে সম্পর্কিত হিসাবগুলি ধার হিসেবে যুক্ত করা যাবে।' : 'Only settlements involving you can be saved as debts.');
      return;
    }

    const type = split.from === 'me' ? 'borrowed' : 'lent';
    const personName = split.from === 'me' ? getParticipantName(split.to) : getParticipantName(split.from);

    onAddDebt({
      type,
      person: personName,
      amount: split.amount,
      remaining: split.amount,
      createdAt: new Date().toISOString(),
      note: billName ? `${billName} (Split)` : (language === 'bn' ? 'স্প্লিট বিল থেকে' : 'From Split Bill')
    });
    setSavedSplits(prev => ({ ...prev, [split.id]: true }));
  };

  const remainingToAssign = useMemo(() => {
    if (splitMode !== 'exact') return 0;
    const total = parseFloat(totalAmount || '0');
    let assigned = 0;
    selectedParticipants.forEach(p => {
      assigned += parseFloat(exactAmounts[p] || '0');
    });
    return total - assigned;
  }, [exactAmounts, totalAmount, selectedParticipants, splitMode]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-24 lg:pb-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">{language === 'bn' ? 'স্প্লিট বিল' : 'Split Bills'}</h2>
          <p className="text-gray-600">{language === 'bn' ? 'সহজেই সকলের মধ্যে বিল ভাগ করুন' : 'Easily split bills among everyone'}</p>
        </div>
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
          <Receipt className="w-6 h-6" />
        </div>
      </div>

      {isFetchingTx && familyMembers.length === 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
          <div className="p-6 md:p-8 rounded-[40px] shadow-sm border bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-800">
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"/><div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl"/></div>
                <div className="flex-1 space-y-2"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"/><div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl"/></div>
              </div>
              <div className="space-y-2"><div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"/><div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl"/></div>
              <div className="space-y-3"><div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"/><div className="flex gap-2"><div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-xl"/><div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-xl"/></div></div>
            </div>
          </div>
          <div className="p-6 md:p-8 rounded-[40px] shadow-sm border bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-800 h-64">
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Input */}
        <div className={cn(
          "p-6 md:p-8 rounded-[40px] shadow-sm border",
          isDarkMode ? "bg-[#1B2559] border-gray-800" : "bg-white border-gray-100"
        )}>
          <div className="space-y-8">
            {/* Amount & Name */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-500 mb-2">{language === 'bn' ? 'বিলের নাম' : 'Bill Name'}</label>
                <input 
                  type="text" 
                  value={billName}
                  onChange={(e) => setBillName(e.target.value)}
                  placeholder={language === 'bn' ? "যেমন: ডিনার" : "e.g. Dinner"}
                  className="w-full p-4 bg-gray-50 dark:bg-gray-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-500 mb-2">{language === 'bn' ? 'মোট পরিমাণ' : 'Total Amount'}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">{currency}</span>
                  <input 
                    type="number" 
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-4 pl-12 bg-gray-50 dark:bg-gray-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold text-lg"
                  />
                </div>
              </div>
            </div>

            {/* Split Mode */}
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-3">{language === 'bn' ? 'কীভাবে ভাগ করবেন?' : 'How to split?'}</label>
              <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl w-full">
                <button
                  onClick={() => setSplitMode('equal')}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                    splitMode === 'equal' ? "bg-white dark:bg-[#111827] text-blue-600 shadow-sm" : "text-gray-500"
                  )}
                >
                  <Calculator className="w-4 h-4" /> {language === 'bn' ? 'সমানভাবে' : 'Equally'}
                </button>
                <button
                  onClick={() => setSplitMode('exact')}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                    splitMode === 'exact' ? "bg-white dark:bg-[#111827] text-blue-600 shadow-sm" : "text-gray-500"
                  )}
                >
                  <Percent className="w-4 h-4" /> {language === 'bn' ? 'নির্দিষ্ট পরিমাণে' : 'Exact Amount'}
                </button>
              </div>
            </div>

            {/* Participants */}
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-3">{language === 'bn' ? 'কারা অংশীদার?' : 'Who is splitting?'}</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {participants.map(p => {
                  const isSelected = selectedParticipants.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggleParticipant(p.id)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border-2",
                        isSelected 
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" 
                          : "border-transparent bg-gray-100 dark:bg-gray-800 text-gray-500"
                      )}
                    >
                      {isSelected ? <Check className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      {p.name}
                    </button>
                  )
                })}
              </div>

              {/* Exact Mode Inputs */}
              <AnimatePresence>
                {splitMode === 'exact' && selectedParticipants.length > 0 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center text-sm font-bold px-2 mb-2">
                        <span className={cn(remainingToAssign === 0 ? "text-green-500" : remainingToAssign < 0 ? "text-red-500" : "text-orange-500")}>
                          {language === 'bn' ? 'বাকি আছে: ' : 'Remaining: '} {currency} {remainingToAssign.toFixed(2)}
                        </span>
                      </div>
                      {selectedParticipants.map(id => (
                        <div key={id} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800/50">
                          <span className="font-bold flex-1 text-gray-700 dark:text-gray-300">{getParticipantName(id)}</span>
                          <div className="relative w-1/2">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 font-bold">{currency}</span>
                            <input
                              type="number"
                              value={exactAmounts[id] || ''}
                              onChange={(e) => setExactAmounts(prev => ({...prev, [id]: e.target.value}))}
                              placeholder="0.00"
                              className="w-full bg-white dark:bg-[#111827] dark:text-white p-2 pl-10 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Payer */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <label className="block text-sm font-bold text-gray-500 mb-2">{language === 'bn' ? 'কে বিল পরিশোধ করেছে?' : 'Who paid the total bill?'}</label>
              <select 
                value={payerId}
                onChange={(e) => setPayerId(e.target.value)}
                className="w-full p-4 bg-blue-50/50 dark:bg-blue-900/10 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold"
              >
                {participants.map(p => (
                  <option key={p.id} value={p.id}>{p.name} {p.id === payerId ? (language === 'bn' ? '(পরিশোধকারী)' : '(Payer)') : ''}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleCalculate}
              disabled={!totalAmount || selectedParticipants.length === 0 || (splitMode === 'exact' && remainingToAssign !== 0)}
              className="w-full py-4 bg-[#8c52ff] hover:bg-[#7b46e3] text-white rounded-2xl font-bold text-lg shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              {language === 'bn' ? 'হিসাব সম্পূর্ণ করুন' : 'Calculate Split'}
            </button>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className={cn(
          "p-6 md:p-8 rounded-[40px] shadow-sm border h-fit",
          isDarkMode ? "bg-[#1B2559] border-gray-800" : "bg-white border-gray-100"
        )}>
           <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
             <ArrowRight className="w-5 h-5 text-green-500" />
             {language === 'bn' ? 'ফাইনাল হিসাব (কে কাকে কত দিবে)' : 'Final Settlements'}
           </h3>

           {splits.length === 0 ? (
             <div className="text-center py-12 flex flex-col items-center justify-center gap-4 text-gray-400 font-medium">
               <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                 <Calculator className="w-8 h-8 text-gray-300 dark:text-gray-600" />
               </div>
               {language === 'bn' ? 'বিলের তথ্য দিয়ে "হিসাব সম্পূর্ণ করুন" এ ক্লিক করুন' : 'Enter details and click Calculate to see splits'}
             </div>
           ) : (
             <div className="space-y-4">
               {splits.map((split, i) => (
                 <motion.div 
                   key={split.id} 
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-800 dark:text-gray-200">{getParticipantName(split.from)}</span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-gray-800 dark:text-gray-200">{getParticipantName(split.to)}</span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">
                        {language === 'bn' ? 'দিবে' : 'owes'}
                      </p>
                    </div>
                    
                    <div className="text-right">
                       <p className="text-xl font-black text-[#8c52ff]">
                         {currency} {split.amount.toFixed(2)}
                       </p>
                       {(split.from === 'me' || split.to === 'me') && onAddDebt && (
                         <button
                           onClick={() => saveAsDebt(split)}
                           disabled={savedSplits[split.id]}
                           className={cn(
                             "mt-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1",
                             savedSplits[split.id]
                               ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 cursor-not-allowed"
                               : "bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 hover:scale-105"
                           )}
                         >
                           {savedSplits[split.id] && <Check className="w-3 h-3" />}
                           {savedSplits[split.id] 
                             ? (language === 'bn' ? 'সংরক্ষিত' : 'Saved') 
                             : (language === 'bn' ? '+ ধার হিসেবে সেভ' : '+ Save as Debt')}
                         </button>
                       )}
                    </div>
                 </motion.div>
               ))}

               <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                 <p className="text-center text-blue-600 dark:text-blue-400 font-medium text-sm flex items-center justify-center gap-2">
                   <Check className="w-4 h-4" />
                   {language === 'bn' ? 'নিজ ধারগুলো সেভ করে রাখতে পারেন।' : 'You can save your settlements as debts.'}
                 </p>
               </div>
             </div>
           )}
        </div>
      </div>
      )}
    </motion.div>
  );
}

