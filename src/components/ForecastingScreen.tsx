import { auth } from '../firebase';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Sparkles, TrendingUp, AlertCircle, Loader2, BrainCircuit, ArrowRight, Crown, Lock } from 'lucide-react';
import { Transaction, Category } from '../types';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';
import { useAppStore } from '../store/useAppStore';

interface Props {
  transactions: Transaction[];
  categories: Category[];
  isDarkMode: boolean;
  language: 'bn' | 'en';
  currency: string;
  isPremium?: boolean;
  dailyForecastCount?: number;
  lastForecastDate?: string | null;
  onUpdateSettings?: (settings: any) => Promise<void>;
}

export function ForecastingScreen({ 
  transactions, categories, isDarkMode, language, currency, isPremium,
  dailyForecastCount = 0, lastForecastDate, onUpdateSettings
}: Props) {
  const [forecast, setForecast] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const remainingFree = isPremium ? 999 : (lastForecastDate !== today ? 1 : Math.max(0, 1 - dailyForecastCount));

  const generateForecast = async () => {
    if (!isPremium && remainingFree <= 0) {
      setError(language === 'bn' ? "আপনার আজকের ফ্রি লিমিট (১টি) শেষ। কাল আবার চেষ্টা করুন অথবা প্রিমিয়াম আপগ্রেড করুন।" : "Your daily free limit (1) is over. Try again tomorrow or upgrade to premium.");
      return;
    }

    if (transactions.length < 5) {
      setError(language === 'bn' ? "পূর্বাভাস দেওয়ার জন্য পর্যাপ্ত লেনদেনের তথ্য নেই। আরও কিছু লেনদেন যোগ করুন।" : "Not enough transaction data to generate a forecast. Add more transactions.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Prepare data for AI
      const recentTransactions = transactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 50)
        .map(t => {
          const cat = categories.find(c => c.id === t.categoryId);
          return `${t.date}: ${t.type === 'income' ? '+' : '-'}${t.amount} ${currency} (${cat?.name || 'Unknown'})`;
        })
        .join('\n');

      const prompt = `
        You are an expert financial advisor. Analyze the following recent transactions and provide a financial forecast and advice for the upcoming month.
        The user's preferred language is ${language === 'bn' ? 'Bengali' : 'English'}.
        
        Recent Transactions:
        ${recentTransactions}
        
        Please provide:
        1. Estimated expenses for next month based on current spending habits.
        2. Top 2 categories where the user is spending the most.
        3. 2-3 actionable tips on how to save money next month.
        
        Format the response using Markdown. Keep it concise, encouraging, and easy to read. Use clear headings and bullet points.
      `;

      const reqBody = {
        featureType: 'forecast',
        model: 'gemini-3-flash-preview',
        contents: prompt
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
        const errorData = await aiResponse.json().catch(() => ({})).catch(() => ({}));
        throw new Error(`Failed to fetch AI forecast: ${errorData.error || ''} ${errorData.details || ''}`);
      }
      
      const response = await aiResponse.json().catch(() => ({}));

      if (isMounted.current) {
        setForecast(response.text || (language === 'bn' ? "দুঃখিত, কোনো পূর্বাভাস তৈরি করা সম্ভব হয়নি।" : "Sorry, could not generate a forecast."));
      }
    } catch (err: any) {
      console.error("Forecast error:", err);
      let errorMsg = language === 'bn' ? "এআই পূর্বাভাস তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।" : "Error generating AI forecast. Please try again.";
      if (err?.message?.includes('API key not valid') || err?.message?.includes('API_KEY_INVALID') || err?.message?.includes('API key is not configured')) {
        errorMsg = language === 'bn'
          ? 'আপনার দেওয়া Gemini API Key সঠিক নয়। অনুগ্রহ করে Settings > Secrets-এ গিয়ে সঠিক API Key প্রদান করুন।'
          : 'Invalid API Key. Please provide a valid Gemini API Key in Settings > Secrets.';
      } else if (err?.message?.includes('quota') || err?.message?.includes('429')) {
        errorMsg = language === 'bn' 
          ? 'এআই সার্ভারের কোটা শেষ হয়ে গেছে। দয়া করে আগামীকাল আবার চেষ্টা করুন।' 
          : 'AI server quota exceeded. Please try again tomorrow.';
      }
      
      if (isMounted.current) {
        setError(errorMsg);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    // Disabled automatic generation to prevent limit exhaustion
    if (transactions.length < 5) {
      setError(language === 'bn' ? "পূর্বাভাস দেওয়ার জন্য পর্যাপ্ত লেনদেনের তথ্য নেই। কমপক্ষে ৫টি লেনদেন যোগ করুন।" : "Not enough transaction data. Add at least 5 transactions.");
    }
  }, [transactions.length, language]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-8 pb-12"
    >
      {!isPremium && remainingFree <= 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-900/50 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-200 to-yellow-400 p-1 flex-shrink-0">
            <div className="w-full h-full bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-500 mb-2">
              {language === 'bn' ? 'আজকের লিমিট শেষ!' : 'Daily Limit Reached!'}
            </h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-200/80">
              {language === 'bn' 
                ? 'আপনি ফ্রি প্ল্যানে দিনে ১ বার এআই পূর্বাভাস ব্যবহার করতে পারবেন। লিমিট ছাড়া আরও অনেক ফিচার উপভোগ করতে প্রিমিয়াম আপগ্রেড করুন মাত্র ৪৯ টাকায় (আজীবন) অথবা ১৯ টাকা/মাস।' 
                : 'You have reached your daily limit of 1 forecast on the free plan. Upgrade to Premium for unlimited access and more features for 49 BDT (Lifetime) or 19 BDT/mo.'}
            </p>
          </div>
          <button className="whitespace-nowrap px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-transform flex-shrink-0">
            {language === 'bn' ? 'আপগ্রেড করুন' : 'Upgrade Now'}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
            isDarkMode ? "bg-purple-500 shadow-purple-900/50" : "bg-purple-600 shadow-purple-200"
          )}>
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {language === 'bn' ? 'ভবিষ্যতের পূর্বাভাস' : 'AI Forecasting'}
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-600 text-xs font-bold dark:bg-purple-900/30 dark:text-purple-400 uppercase">AI</span>
            </h2>
            <p className={cn("text-sm", isDarkMode ? "text-gray-300" : "text-gray-600")}>
              {language === 'bn' ? 'আপনার খরচের ধরন বিশ্লেষণ করে আগামী মাসের পূর্বাভাস' : 'Predict next month\'s expenses based on your spending habits'}
            </p>
          </div>
        </div>
        <button
          onClick={generateForecast}
          disabled={isLoading || transactions.length < 5 || (!isPremium && remainingFree <= 0)}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-sm active:scale-95",
            isLoading || transactions.length < 5 || (!isPremium && remainingFree <= 0)
              ? (isDarkMode ? "bg-gray-800 text-gray-500" : "bg-gray-100 text-gray-400 cursor-not-allowed")
              : "bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200 dark:shadow-none"
          )}
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          <span className="hidden sm:inline">{language === 'bn' ? 'নতুন পূর্বাভাস' : 'Generate New'}</span>
        </button>
      </div>

      {error && transactions.length < 5 ? (
        <div className={cn(
          "p-8 rounded-[32px] border flex flex-col items-center justify-center text-center space-y-4",
          isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-100"
        )}>
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mb-2",
            isDarkMode ? "bg-gray-800" : "bg-gray-50"
          )}>
            <TrendingUp className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold">{language === 'bn' ? 'আরও ডেটা প্রয়োজন' : 'More Data Needed'}</h3>
          <p className={cn("max-w-md", isDarkMode ? "text-gray-400" : "text-gray-500")}>
            {error}
          </p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 flex items-center gap-3 border border-red-100 dark:border-red-900/30">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      ) : isLoading ? (
        <div className={cn(
          "p-12 rounded-[32px] border flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden",
          isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-100"
        )}>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 animate-pulse"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 opacity-20 rounded-full"></div>
              <Loader2 className="w-16 h-16 animate-spin text-purple-500 relative z-10" />
            </div>
            <h3 className="text-xl font-bold mt-6 mb-2">
              {language === 'bn' ? 'আপনার লেনদেন বিশ্লেষণ করা হচ্ছে...' : 'Analyzing your transactions...'}
            </h3>
            <p className={cn("text-sm max-w-sm", isDarkMode ? "text-gray-400" : "text-gray-500")}>
              {language === 'bn' ? 'আমাদের এআই আপনার খরচের ধরন বুঝতে কাজ করছে। এটি কয়েক সেকেন্ড সময় নিতে পারে।' : 'Our AI is working to understand your spending patterns. This might take a few seconds.'}
            </p>
          </div>
        </div>
      ) : forecast ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "p-8 md:p-10 rounded-[32px] border relative overflow-hidden shadow-sm",
            isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-100"
          )}
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500"></div>
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <BrainCircuit className="w-32 h-32" />
          </div>
          
          <div className="relative z-10 prose prose-lg max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-li:text-gray-600 dark:prose-li:text-gray-300 prose-strong:text-purple-600 dark:prose-strong:text-purple-400 prose-a:text-blue-500">
            <div className="markdown-body custom-markdown">
              <Markdown>{forecast}</Markdown>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <p className={cn("text-xs font-medium flex items-center gap-1", isDarkMode ? "text-gray-500" : "text-gray-400")}>
              <Sparkles className="w-3 h-3" />
              {language === 'bn' ? 'এআই জেনারেটেড রিপোর্ট' : 'AI Generated Report'}
            </p>
            <p className={cn("text-xs", isDarkMode ? "text-gray-500" : "text-gray-400")}>
              {new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </motion.div>
      ) : null}
    </motion.div>
  );
}
