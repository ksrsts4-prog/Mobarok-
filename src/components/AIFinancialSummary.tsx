import { auth } from '../firebase';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Sparkles, RefreshCw, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Transaction, Budget, Category } from '../types';
import { useAppStore } from '../store/useAppStore';

interface AIFinancialSummaryProps {
  transactions: Transaction[];
  budgets: Budget[];
  categories: Category[];
  currency: string;
  language: 'bn' | 'en';
  isDarkMode: boolean;
  aiInstructions?: string;
}

export function AIFinancialSummary() {
  const { transactions, budgets, categories, currency, language, isDarkMode, aiInstructions } = useAppStore();
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const generateSummary = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Calculate financial data for context
      const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const balance = income - expense;

      // Category spending
      const categorySpending: Record<string, number> = {};
      transactions.filter(t => t.type === 'expense').forEach(t => {
        const cat = categories.find(c => c.id === t.categoryId)?.name || 'Unknown';
        categorySpending[cat] = (categorySpending[cat] || 0) + t.amount;
      });

      const topCategories = Object.entries(categorySpending)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([name, amount]) => `${name}: ${currency}${amount}`)
        .join(', ');

      // Budget adherence
      const budgetStatus = budgets.map(b => {
        const catName = categories.find(c => c.id === b.categoryId)?.name || 'Unknown';
        const spent = transactions.filter(t => t.categoryId === b.categoryId && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        return `${catName} (Budget: ${currency}${b.amount}, Spent: ${currency}${spent})`;
      }).join('; ');

      const baseSystemInstruction = language === 'bn'
        ? `আপনি একজন বিশেষজ্ঞ এআই আর্থিক উপদেষ্টা। ব্যবহারকারীর আর্থিক ডেটা বিশ্লেষণ করে একটি সংক্ষিপ্ত (৩-৪ লাইন) সারাংশ তৈরি করুন। আয়ের তুলনায় ব্যয়, বাজেটের অবস্থা এবং সঞ্চয় বাড়ানোর একটি উপায় উল্লেখ করুন। উত্তরটি বাংলায় এবং পেশাদার হতে হবে।`
        : `You are an expert AI financial advisor. Analyze the user's financial data and provide a short (3-4 sentences) summary. Highlight key trends (income vs expense), budget adherence, and suggest one potential area for savings. Keep it professional and in English.`;

      const systemInstruction = aiInstructions
        ? `${baseSystemInstruction}\n\nIMPORTANT: The user is the owner of this app and has provided the following custom instructions for you to follow strictly:\n"${aiInstructions}"`
        : baseSystemInstruction;

      const prompt = `
Financial Data:
Total Income: ${currency}${income}
Total Expense: ${currency}${expense}
Current Balance: ${currency}${balance}
Top Expenses: ${topCategories || 'None'}
Budgets: ${budgetStatus || 'No budgets set'}
      `;

      const reqBody = {
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      };

      const token = await auth.currentUser?.getIdToken();
      const aiResponse = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(reqBody)
      });
      
      if (!aiResponse.ok) {
        const errData = await aiResponse.json().catch(() => ({})).catch(() => ({}));
        console.error("Backend Error:", errData);
        throw new Error(`${errData.error || 'Failed to fetch AI response'} ${errData.details || ''}`);
      }
      
      const response = await aiResponse.json().catch(() => ({}));

      if (isMounted.current) {
        setSummary(response.text || null);
      }
    } catch (err: any) {
      console.warn('AI summary generation failed (rendered to UI):', err.message || err);
      let errorText = language === 'bn' ? 'সারাংশ তৈরি করতে সমস্যা হয়েছে।' : 'Failed to generate summary.';
      
      if (err?.message?.includes('429') || err?.status === 429 || err?.message?.includes('quota') || err?.message?.includes('RESOURCE_EXHAUSTED')) {
        errorText = language === 'bn' 
          ? 'এআই সার্ভারের কোটা শেষ হয়ে গেছে। দয়া করে আগামীকাল আবার চেষ্টা করুন।' 
          : 'AI server quota exceeded. Please try again tomorrow.';
      } else if (err?.message?.includes('API key not valid') || err?.message?.includes('API_KEY_INVALID') || err?.message?.includes('API key is not configured')) {
        errorText = language === 'bn'
          ? 'আপনার দেওয়া Gemini API Key সঠিক নয়। অনুগ্রহ করে Settings > Secrets-এ গিয়ে সঠিক API Key প্রদান করুন।'
          : 'Invalid API Key. Please provide a valid Gemini API Key in Settings > Secrets.';
      }
      
      if (isMounted.current) {
        setError(errorText);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-6 rounded-[32px] shadow-sm border relative overflow-hidden",
        isDarkMode ? "bg-gradient-to-br from-blue-900/40 to-purple-900/20 border-blue-800/50" : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
      )}
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/10 rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-purple-500/10 rounded-full pointer-events-none" />

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner",
            isDarkMode ? "bg-blue-800/50 text-blue-300" : "bg-white text-blue-600"
          )}>
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className={cn("font-bold text-lg", isDarkMode ? "text-white" : "text-gray-900")}>
              {language === 'bn' ? 'এআই আর্থিক সারাংশ' : 'AI Financial Summary'}
            </h3>
            <p className={cn("text-xs", isDarkMode ? "text-blue-200/70" : "text-blue-600/70")}>
              {language === 'bn' ? 'আপনার বর্তমান আর্থিক অবস্থার বিশ্লেষণ' : 'Analysis of your current financial status'}
            </p>
          </div>
        </div>
        <button
          onClick={generateSummary}
          disabled={isLoading}
          className={cn(
            "p-2 rounded-xl transition-all",
            isDarkMode ? "hover:bg-blue-800/50 text-blue-300" : "hover:bg-white/60 text-blue-600",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
          title={language === 'bn' ? 'রিফ্রেশ করুন' : 'Refresh'}
        >
          <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
        </button>
      </div>

      <div className="relative z-10">
        {isLoading && !summary ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className={cn("text-sm font-medium", isDarkMode ? "text-blue-300" : "text-blue-600")}>
              {language === 'bn' ? 'আপনার ডেটা বিশ্লেষণ করা হচ্ছে...' : 'Analyzing your data...'}
            </p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
          </div>
        ) : summary ? (
          <div className={cn(
            "p-5 rounded-2xl text-sm leading-relaxed",
            isDarkMode ? "bg-gray-900/50 text-gray-200" : "bg-white/60 text-gray-800"
          )}>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {summary}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <button
              onClick={generateSummary}
              className={cn(
                "px-6 py-3 rounded-2xl font-bold shadow-lg transition-all flex items-center gap-2 mx-auto",
                isDarkMode ? "bg-blue-600 text-white shadow-blue-900/20 hover:bg-blue-500" : "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700"
              )}
            >
              <TrendingUp className="w-5 h-5" />
              {language === 'bn' ? 'সারাংশ তৈরি করুন' : 'Generate Summary'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
