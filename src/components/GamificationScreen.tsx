import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Trophy, Star, Target, Zap, Shield, Crown, Medal } from 'lucide-react';
import { Transaction, Budget, SavingsGoal } from '../types';
import { cn } from '../lib/utils';
import { useAppStore } from '../store/useAppStore';

export function GamificationScreen({
  transactions,
  budgets,
  savingsGoals,
  currency,
  isDarkMode,
  language
}: {
  transactions: Transaction[],
  budgets: Budget[],
  savingsGoals: SavingsGoal[],
  currency: string,
  isDarkMode: boolean,
  language: 'bn' | 'en'
}) {
  const { points, level, progress, badges } = useMemo(() => {
    let computedPoints = 0;
    const computedBadges = [];

    // Points for transactions
    computedPoints += transactions.length * 5;
    if (transactions.length >= 10) computedBadges.push({ id: 't10', name: language === 'bn' ? '১০টি লেনদেন' : '10 Transactions', icon: <Zap className="w-6 h-6 text-yellow-500" /> });
    if (transactions.length >= 50) computedBadges.push({ id: 't50', name: language === 'bn' ? '৫০টি লেনদেন' : '50 Transactions', icon: <Star className="w-6 h-6 text-purple-500" /> });
    if (transactions.length >= 100) computedBadges.push({ id: 't100', name: language === 'bn' ? '১০০টি লেনদেন' : '100 Transactions', icon: <Crown className="w-6 h-6 text-yellow-400" /> });

    // Points for budgets
    computedPoints += budgets.length * 20;
    if (budgets.length >= 3) computedBadges.push({ id: 'b3', name: language === 'bn' ? 'বাজেট প্ল্যানার' : 'Budget Planner', icon: <Shield className="w-6 h-6 text-blue-500" /> });

    // Points for savings
    const achievedGoals = savingsGoals.filter(g => g.current >= g.target);
    computedPoints += savingsGoals.length * 30;
    computedPoints += achievedGoals.length * 100;

    if (savingsGoals.length >= 1) computedBadges.push({ id: 's1', name: language === 'bn' ? 'সঞ্চয় শুরু' : 'Savings Starter', icon: <Target className="w-6 h-6 text-green-500" /> });
    if (achievedGoals.length >= 1) computedBadges.push({ id: 'sa1', name: language === 'bn' ? 'লক্ষ্য অর্জনকারী' : 'Goal Achiever', icon: <Medal className="w-6 h-6 text-pink-500" /> });

    // Level calculation
    let calculatedLevel = language === 'bn' ? 'শিক্ষানবিশ' : 'Beginner';
    let levelProgress = 0;

    if (computedPoints >= 1000) {
      calculatedLevel = language === 'bn' ? 'ফিন্যান্স गुरु' : 'Finance Guru';
      levelProgress = 100;
    } else if (computedPoints >= 500) {
      calculatedLevel = language === 'bn' ? 'এক্সপার্ট' : 'Expert';
      levelProgress = ((computedPoints - 500) / 500) * 100;
    } else if (computedPoints >= 100) {
      calculatedLevel = language === 'bn' ? 'সঞ্চয়ী' : 'Saver';
      levelProgress = ((computedPoints - 100) / 400) * 100;
    } else {
      levelProgress = (computedPoints / 100) * 100;
    }

    return { points: computedPoints, level: calculatedLevel, progress: levelProgress, badges: computedBadges };
  }, [transactions, budgets, savingsGoals, language]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">{language === 'bn' ? 'রিওয়ার্ডস ও ব্যাজ' : 'Rewards & Badges'}</h2>
          <p className="text-gray-600">{language === 'bn' ? 'আপনার আর্থিক অর্জনের তালিকা' : 'List of your financial achievements'}</p>
        </div>
        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center text-yellow-600">
          <Trophy className="w-6 h-6" />
        </div>
      </div>

      <div className={cn(
        "p-8 rounded-[40px] shadow-sm border",
        isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-50"
      )}>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/40 flex items-center justify-center shadow-inner border-4 border-white dark:border-gray-800">
             <Trophy className="w-14 h-14 text-orange-500" />
          </div>
          <div className="flex-1 w-full text-center md:text-left">
            <h3 className="text-4xl font-bold mb-2">{level}</h3>
            <p className="text-xl text-gray-500 mb-6">{points} {language === 'bn' ? 'পয়েন্ট' : 'Points'}</p>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2 overflow-hidden">
              <div className="bg-[#8c52ff] h-4 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-sm font-bold text-gray-300 text-right">{Math.round(progress)}% {language === 'bn' ? 'পরবর্তী লেভেলে পৌঁছাতে' : 'to next level'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <h4 className="text-xl font-bold mt-4">{language === 'bn' ? 'আপনার অর্জিত ব্যাজসমূহ' : 'Your Earned Badges'}</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div key={badge.id} className={cn(
               "p-6 rounded-[32px] border flex flex-col items-center justify-center text-center gap-4 transition-all hover:scale-[1.02]",
               isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-50"
            )}>
              <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center">
                {badge.icon}
              </div>
              <p className="font-bold text-sm">{badge.name}</p>
            </div>
          ))}
          {badges.length === 0 && (
             <div className="col-span-full text-center py-10 text-gray-400 font-bold">
               {language === 'bn' ? 'আপনি এখনো কোনো ব্যাজ অর্জন করেননি। লেনদেন ও সঞ্চয় শুরু করুন!' : 'You haven\'t earned any badges yet. Start transacting & saving!'}
             </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
