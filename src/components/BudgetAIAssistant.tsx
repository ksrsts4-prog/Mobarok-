import { auth } from '../firebase';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, Loader2, Sparkles, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { Budget, Transaction, Category } from '../types';
import { useAppStore } from '../store/useAppStore';

interface BudgetAIAssistantProps {
  isDarkMode: boolean;
  language: 'bn' | 'en';
  budgets: Budget[];
  transactions: Transaction[];
  categories: Category[];
  currency: string;
  aiInstructions?: string;
}

export function BudgetAIAssistant() {
  const { isDarkMode, language, budgets, transactions, categories, currency, aiInstructions } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{id: string, text: string, sender: 'user'|'ai'}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          text: language === 'bn' 
            ? 'নমস্কার! আমি আপনার বাজেট এআই সহকারী। আমি আপনার খরচের অভ্যাস বিশ্লেষণ করে আপনাকে সঠিক বাজেট তৈরি করতে সাহায্য করতে পারি। আপনি কি আপনার বর্তমান বাজেট বিশ্লেষণ করতে চান?'
            : 'Hello! I am your Budget AI Assistant. I can analyze your spending habits and help you create a personalized budget. Would you like me to analyze your current budget?',
          sender: 'ai'
        }
      ]);
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user' as const
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      // Prepare context
      const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
      const expenses = transactions.filter(t => t.type === 'expense');
      const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);
      
      const categorySpending = categories.filter(c => c.type === 'expense').map(cat => {
        const spent = expenses.filter(t => t.categoryId === cat.id).reduce((sum, t) => sum + t.amount, 0);
        const budget = budgets.find(b => b.categoryId === cat.id)?.amount || 0;
        return `${cat.name}: Budgeted ${currency}${budget}, Spent ${currency}${spent}`;
      }).join('\n');

      const baseSystemInstruction = language === 'bn'
        ? `আপনি একজন বিশেষজ্ঞ আর্থিক উপদেষ্টা। ব্যবহারকারীর বর্তমান বাজেট এবং খরচের ডেটা নিচে দেওয়া হলো:\nমোট বাজেট: ${currency}${totalBudget}\nমোট খরচ: ${currency}${totalSpent}\nক্যাটাগরি অনুযায়ী খরচ:\n${categorySpending}\n\nব্যবহারকারীকে তাদের খরচের অভ্যাসের ওপর ভিত্তি করে বাজেট অপ্টিমাইজ করার পরামর্শ দিন। উত্তরগুলো সংক্ষিপ্ত, পয়েন্ট আকারে এবং বাংলায় দিন।`
        : `You are an expert financial advisor. Here is the user's current budget and spending data:\nTotal Budget: ${currency}${totalBudget}\nTotal Spent: ${currency}${totalSpent}\nCategory Spending:\n${categorySpending}\n\nProvide personalized budget allocation suggestions based on their spending habits. Keep answers concise, in bullet points, and in English.`;

      const systemInstruction = aiInstructions 
        ? `${baseSystemInstruction}\n\nIMPORTANT: The user is the owner of this app and has provided the following custom instructions for you to follow strictly:\n"${aiInstructions}"`
        : baseSystemInstruction;

      const chatHistory = messages.map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
      const prompt = `${chatHistory}\nUser: ${userMsg.text}`;

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
        const errorData = await aiResponse.json().catch(() => ({})).catch(() => ({}));
        throw new Error(`Failed to fetch AI response: ${errorData.error || ''} ${errorData.details || ''}`);
      }
      
      const response = await aiResponse.json().catch(() => ({}));

      if (isMounted.current) {
        const aiMsg = {
          id: (Date.now() + 1).toString(),
          text: response.text || (language === 'bn' ? 'দুঃখিত, আমি বুঝতে পারিনি।' : 'Sorry, I did not understand.'),
          sender: 'ai' as const
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (error: any) {
      console.warn('AI response generation failed (handled):', error.message || error);
      let errorText = language === 'bn' ? 'দুঃখিত, একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।' : 'Sorry, an error occurred. Please try again.';
      
      if (error?.message?.includes('429') || error?.status === 429 || error?.message?.includes('quota') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
        errorText = language === 'bn' 
          ? 'দুঃখিত, এআই সার্ভারের কোটা শেষ হয়ে গেছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।' 
          : 'Sorry, the AI server quota has been exceeded. Please try again later.';
      } else if (error?.message?.includes('API key not valid') || error?.message?.includes('API_KEY_INVALID') || error?.message?.includes('API key is not configured')) {
        errorText = language === 'bn'
          ? 'আপনার দেওয়া Gemini API Key সঠিক নয়। অনুগ্রহ করে Settings > Secrets-এ গিয়ে সঠিক API Key প্রদান করুন।'
          : 'Invalid API Key. Please provide a valid Gemini API Key in Settings > Secrets.';
      }

      if (isMounted.current) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: errorText,
          sender: 'ai'
        }]);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className={cn(
          "w-full mt-6 p-4 rounded-3xl flex items-center justify-between group transition-all",
          isDarkMode ? "bg-blue-900/20 hover:bg-blue-900/40 border border-blue-800" : "bg-blue-50 hover:bg-blue-100 border border-blue-100"
        )}
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center",
            isDarkMode ? "bg-blue-600 text-white" : "bg-blue-600 text-white"
          )}>
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h4 className={cn("font-bold", isDarkMode ? "text-white" : "text-gray-900")}>
              {language === 'bn' ? 'এআই বাজেট অ্যানালিস্ট' : 'AI Budget Analyst'}
            </h4>
            <p className={cn("text-sm", isDarkMode ? "text-gray-300" : "text-gray-600")}>
              {language === 'bn' ? 'আপনার খরচের ওপর ভিত্তি করে পরামর্শ পান' : 'Get personalized suggestions based on spending'}
            </p>
          </div>
        </div>
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1",
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-blue-600 shadow-sm"
        )}>
          →
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn(
                "w-full max-w-lg h-[600px] max-h-[85vh] rounded-[32px] shadow-md flex flex-col overflow-hidden",
                isDarkMode ? "bg-[#111827] border border-gray-800" : "bg-white"
              )}
            >
              {/* Header */}
              <div className={cn(
                "p-6 flex items-center justify-between border-b",
                isDarkMode ? "border-gray-800" : "border-gray-100"
              )}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={cn("font-bold", isDarkMode ? "text-white" : "text-gray-900")}>
                      {language === 'bn' ? 'এআই বাজেট অ্যানালিস্ট' : 'AI Budget Analyst'}
                    </h3>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isDarkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"
                  )}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={cn(
                      "flex gap-3 max-w-[85%]",
                      msg.sender === 'user' ? "ml-auto flex-row-reverse" : ""
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      msg.sender === 'user' 
                        ? (isDarkMode ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600")
                        : (isDarkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500")
                    )}>
                      {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={cn(
                      "p-4 rounded-2xl text-sm",
                      msg.sender === 'user'
                        ? "bg-blue-600 text-white rounded-tr-sm"
                        : (isDarkMode ? "bg-gray-800 text-gray-200 rounded-tl-sm" : "bg-gray-50 text-gray-800 rounded-tl-sm")
                    )}>
                      <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 max-w-[85%]">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      isDarkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"
                    )}>
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className={cn(
                      "p-4 rounded-2xl rounded-tl-sm flex items-center gap-2",
                      isDarkMode ? "bg-gray-800" : "bg-gray-50"
                    )}>
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {language === 'bn' ? 'বিশ্লেষণ করছে...' : 'Analyzing...'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              {messages.length === 1 && !isLoading && (
                <div className="px-6 pb-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSend(language === 'bn' ? 'আমার বর্তমান বাজেট বিশ্লেষণ করুন' : 'Analyze my current budget')}
                    className={cn(
                      "px-4 py-2 rounded-full text-xs font-medium transition-colors",
                      isDarkMode ? "bg-gray-800 hover:bg-gray-700 text-blue-400" : "bg-blue-50 hover:bg-blue-100 text-blue-600"
                    )}
                  >
                    {language === 'bn' ? 'বাজেট বিশ্লেষণ করুন' : 'Analyze budget'}
                  </button>
                  <button
                    onClick={() => handleSend(language === 'bn' ? 'আমি কীভাবে আরও সঞ্চয় করতে পারি?' : 'How can I save more?')}
                    className={cn(
                      "px-4 py-2 rounded-full text-xs font-medium transition-colors",
                      isDarkMode ? "bg-gray-800 hover:bg-gray-700 text-blue-400" : "bg-blue-50 hover:bg-blue-100 text-blue-600"
                    )}
                  >
                    {language === 'bn' ? 'সঞ্চয়ের টিপস' : 'Savings tips'}
                  </button>
                </div>
              )}

              {/* Input */}
              <div className={cn(
                "p-4 border-t",
                isDarkMode ? "border-gray-800 bg-[#111827]" : "border-gray-100 bg-white"
              )}>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={language === 'bn' ? 'বাজেট সম্পর্কে প্রশ্ন করুন...' : 'Ask about your budget...'}
                    className={cn(
                      "flex-1 p-4 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 text-sm",
                      isDarkMode ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-900"
                    )}
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="p-4 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
