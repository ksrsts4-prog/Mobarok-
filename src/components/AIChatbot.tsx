import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, Loader2, Volume2, VolumeX, Trash2, Image as ImageIcon, Mic, MicOff } from 'lucide-react';
import { Type } from '@google/genai';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { cn } from '../lib/utils';
import { Transaction, Budget, Category, SavingsGoal } from '../types';
import { useAppStore } from '../store/useAppStore';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  imageData?: string;
  imageMimeType?: string;
}

interface AIChatbotProps {
  isDarkMode: boolean;
  language: 'bn' | 'en';
  user: any;
  aiInstructions?: string;
  transactions?: Transaction[];
  budgets?: Budget[];
  categories?: Category[];
  savingsGoals?: SavingsGoal[];
  currency?: string;
  onAddTransaction?: (t: Omit<Transaction, 'id'>) => void;
  onAddCategory?: (cat: Omit<Category, 'id'>) => Promise<string | undefined>;
  isPremium?: boolean;
  dailyAssistantCount?: number;
  lastAssistantDate?: string | null;
  onUpdateSettings?: (settings: any) => Promise<void>;
}

export function AIChatbot({ 
  onAddTransaction, onAddCategory, isPremium,
  dailyAssistantCount = 0, lastAssistantDate, onUpdateSettings
}: AIChatbotProps) {
  const { isDarkMode, language, user, aiInstructions, transactions, budgets, categories, savingsGoals, currency } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: language === 'bn' 
        ? 'নমস্কার! আমি আপনার এআই আর্থিক সহকারী। আমি আপনাকে ব্যক্তিগত অর্থ ব্যবস্থাপনা এবং এই অ্যাপটি কীভাবে ব্যবহার করবেন সে সম্পর্কে সাহায্য করতে পারি। আপনার কি কোনো প্রশ্ন আছে?' 
        : 'Hello! I am your AI financial assistant. I can help you with personal finance management and how to use this app. Do you have any questions?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageMimeType, setSelectedImageMimeType] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    setMessages(prev => {
      const newMessages = [...prev];
      if (newMessages.length > 0 && newMessages[0].id === 'welcome') {
        newMessages[0].text = language === 'bn' 
          ? 'নমস্কার! আমি আপনার এআই আর্থিক সহকারী। আমি আপনাকে ব্যক্তিগত অর্থ ব্যবস্থাপনা এবং এই অ্যাপটি কীভাবে ব্যবহার করবেন সে সম্পর্কে সাহায্য করতে পারি। আপনার কি কোনো প্রশ্ন আছে?' 
          : 'Hello! I am your AI financial assistant. I can help you with personal finance management and how to use this app. Do you have any questions?';
      }
      return newMessages;
    });
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, selectedImage]);

  useEffect(() => {
    // Setup Speech Recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          alert(language === 'bn' ? 'মাইক্রোফোন ব্যবহারের অনুমতি দেওয়া হয়নি। দয়া করে ব্রাউজার সেটিংসে গিয়ে মাইক্রোফোন ব্যবহারের অনুমতি দিন।' : 'Microphone access was denied. Please allow microphone access in your browser settings.');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.lang = language === 'bn' ? 'bn-BD' : 'en-US';
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert(language === 'bn' ? 'আপনার ব্রাউজার ভয়েস ইনপুট সাপোর্ট করে না।' : 'Your browser does not support voice input.');
      }
    }
  };

  const speakText = (text: string, id: string) => {
    if ('speechSynthesis' in window) {
      if (speakingId === id) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      if (language === 'bn') {
        utterance.lang = 'bn-BD';
        const voices = window.speechSynthesis.getVoices();
        const bnVoice = voices.find(voice => voice.lang.startsWith('bn'));
        if (bnVoice) {
          utterance.voice = bnVoice;
        }
      } else {
        utterance.lang = 'en-US';
      }

      utterance.onstart = () => setSpeakingId(id);
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);

      window.speechSynthesis.speak(utterance);
    } else {
      alert(language === 'bn' ? 'আপনার ব্রাউজার টেক্সট-টু-স্পিচ সাপোর্ট করে না।' : 'Your browser does not support text-to-speech.');
    }
  };

  useEffect(() => {
    if (!isOpen && speakingId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    let internalMounted = true;
    const loadHistory = async () => {
      if (user) {
        try {
          const docRef = doc(db, `users/${user.uid}/chatHistory/main`);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && internalMounted && isMounted.current) {
            const data = docSnap.data();
            if (data.messages && data.messages.length > 0) {
              const loadedMessages = data.messages.map((m: any) => ({
                ...m,
                timestamp: m.timestamp?.toDate ? m.timestamp.toDate() : new Date(m.timestamp)
              }));
              setMessages(loadedMessages);
            }
          }
        } catch (error) {
          console.error("Error loading chat history:", error);
        }
      }
    };
    loadHistory();
    return () => { internalMounted = false; };
  }, [user]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const saveHistory = async () => {
      if (user && messages.length > 1) {
        try {
          const docRef = doc(db, `users/${user.uid}/chatHistory/main`);
          await setDoc(docRef, { messages });
        } catch (error) {
          console.error("Error saving chat history:", error);
        }
      }
    };
    timeout = setTimeout(saveHistory, 1500); // 1.5s debounce to save Firebase limit
    return () => clearTimeout(timeout);
  }, [messages, user]);

  const clearHistory = async () => {
    if (window.confirm(language === 'bn' ? 'আপনি কি চ্যাট হিস্ট্রি মুছে ফেলতে চান?' : 'Are you sure you want to clear chat history?')) {
      const welcomeMsg: Message = {
        id: 'welcome',
        text: language === 'bn' 
          ? 'নমস্কার! আমি আপনার এআই আর্থিক সহকারী। আমি আপনাকে ব্যক্তিগত অর্থ ব্যবস্থাপনা এবং এই অ্যাপটি কীভাবে ব্যবহার করবেন সে সম্পর্কে সাহায্য করতে পারি। আপনার কি কোনো প্রশ্ন আছে?' 
          : 'Hello! I am your AI financial assistant. I can help you with personal finance management and how to use this app. Do you have any questions?',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages([welcomeMsg]);
      
      if (user) {
        try {
          const docRef = doc(db, `users/${user.uid}/chatHistory/main`);
          await setDoc(docRef, { messages: [welcomeMsg] });
        } catch (error) {
          console.error("Error clearing chat history:", error);
        }
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(language === 'bn' ? 'ছবির সাইজ ৫ এমবি এর কম হতে হবে।' : 'Image size must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setSelectedImageMimeType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput && !selectedImage) {
      alert(language === 'bn' ? 'দয়া করে মেসেজ লিখুন অথবা ছবি আপলোড করুন।' : 'Please enter a message or upload an image.');
      return;
    }
    
    // Check limits
    const today = new Date().toISOString().split('T')[0];
    const remainingFree = isPremium ? 999 : (lastAssistantDate !== today ? 10 : Math.max(0, 10 - dailyAssistantCount));

    if (!isPremium && remainingFree <= 0) {
       const limitMsg: Message = {
        id: Date.now().toString(),
        text: language === 'bn' 
          ? 'দুঃখিত, আপনার আজকের ফ্রি লিমিট (১০টি রিকোয়েস্ট) শেষ। দয়া করে আগামীকাল আবার চেষ্টা করুন অথবা আনলিমিটেড অ্যাক্সেস পেতে প্রিমিয়াম আপগ্রেড করুন।' 
          : 'Sorry, you have reached your daily free limit (10 requests). Please try again tomorrow or upgrade to premium for unlimited access.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, limitMsg]);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input || (selectedImage ? (language === 'bn' ? 'এই ছবিটি বিশ্লেষণ করুন।' : 'Analyze this image.') : ''),
      sender: 'user',
      timestamp: new Date()
    };
    if (selectedImage) userMsg.imageData = selectedImage;
    if (selectedImageMimeType) userMsg.imageMimeType = selectedImageMimeType;

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSelectedImage(null);
    setSelectedImageMimeType(null);
    setIsLoading(true);

    try {
      const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const balance = totalIncome - totalExpense;
      
      // Get recent transactions for context (last 20)
      const recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 20)
        .map(t => {
          const cat = categories.find(c => c.id === t.categoryId);
          return `${t.date}: ${t.type === 'income' ? '+' : '-'}${currency}${t.amount} (${cat?.name || 'Unknown'} - ${t.note || 'No note'})`;
        })
        .join('\n');
        
      const budgetContext = budgets.map(b => {
        const spent = transactions
          .filter(t => t.type === 'expense' && t.categoryId === b.categoryId)
          .reduce((sum, t) => sum + t.amount, 0);
        const cat = categories.find(c => c.id === b.categoryId);
        return `${cat?.name || 'Unknown'}: ${currency}${spent} spent out of ${currency}${b.amount} limit`;
      }).join('\n');

      const contextData = `
User Data Context:
- Currency: ${currency}
- Total Income: ${currency}${totalIncome}
- Total Expense: ${currency}${totalExpense}
- Current Balance: ${currency}${balance}

Recent Transactions (Last 20):
${recentTransactions || 'No recent transactions.'}

Budgets Status:
${budgetContext || 'No budgets set.'}

Savings Goals:
${savingsGoals.map(g => `${g.name}: ${currency}${g.current} saved out of ${currency}${g.target}`).join('\n') || 'No savings goals.'}
`;

      const categoriesContext = categories.map(c => `ID: "${c.id}", Name: "${c.name}", Type: "${c.type}"`).join('\n');
      
      const baseSystemInstruction = language === 'bn'
        ? `আপনি একজন ব্যক্তিগত অর্থ ব্যবস্থাপনা বিশেষজ্ঞ এবং 'ব্যয় ট্র্যাকার' (Expense Tracker) অ্যাপের এআই সহকারী। ব্যবহারকারীদের অর্থ সঞ্চয়, বাজেট তৈরি, বিনিয়োগ এবং অ্যাপের ফিচার সম্পর্কে সাহায্য করুন। ব্যবহারকারী যদি কোনো ছবি দেয় (যেমন রসিদ, বিল, বা আর্থিক কোনো কাগজ), তবে সেটি বিশ্লেষণ করে তথ্য দিন। আপনার কাছে ব্যবহারকারীর সাম্প্রতিক লেনদেন এবং বাজেটের তথ্য দেওয়া আছে, এর ওপর ভিত্তি করে সঠিক পরামর্শ দিন। ব্যবহারকারী কোনো খরচ বা আয় যোগ করতে বললে, আপনার কাছে থাকা "add_transaction" টুলটি ব্যবহার করুন এবং অবশ্যই সঠিক Category ID বেছে নিন। যদি প্রয়োজনীয় ক্যাটাগরি না থাকে, তবে categoryId হিসেবে "new" দিন এবং newCategoryName (ফরম্যাট: "বাংলা নাম (English Name)", যেমন: "জরিমানা (Fine)") ও newCategoryIcon প্রদান করুন। Category List:\n${categoriesContext}\nআপনার উত্তরগুলো সংক্ষিপ্ত, সহায়ক এবং বাংলায় হতে হবে।\n\n${contextData}`
        : `You are a personal finance expert and the AI assistant for the 'Expense Tracker' app. Help users with saving money, budgeting, investing, and the app's features. If the user provides an image (like a receipt, bill, or financial document), analyze it and provide insights. If the user asks to add an expense or income, use the "add_transaction" tool and pass the appropriate Category ID from the list below. If the category does not exist, pass "new" as categoryId and provide newCategoryName (Format: "English Name", or if requested "Bangla Name (English Name)") and newCategoryIcon. Category List:\n${categoriesContext}\nYou have access to the user's recent transactions and budget status, use this to provide accurate advice. Keep your answers concise, helpful, and in English.\n\n${contextData}`;

      const systemInstruction = aiInstructions
        ? `${baseSystemInstruction}\n\nIMPORTANT: The user is the owner of this app and has provided the following custom instructions for you to follow strictly:\n"${aiInstructions}"`
        : baseSystemInstruction;

      const chatHistory = messages.map(m => {
        let msgText = `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`;
        if (m.imageData) {
          msgText += ' [User attached an image]';
        }
        return msgText;
      }).join('\n');
      
      const promptText = `${chatHistory}\nUser: ${userMsg.text}`;

      const contentsParts: any[] = [];
      if (userMsg.imageData && userMsg.imageMimeType) {
        contentsParts.push({
          inlineData: {
            data: userMsg.imageData.split(',')[1],
            mimeType: userMsg.imageMimeType
          }
        });
      }
      contentsParts.push({ text: promptText });
      
      const addTransactionTool = {
        functionDeclarations: [
          {
            name: 'add_transaction',
            description: 'Add a new transaction (expense or income) to the database.',
            parameters: {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  description: 'Type of transaction: "expense" or "income"',
                  enum: ['expense', 'income'],
                },
                amount: {
                  type: Type.NUMBER,
                  description: 'Amount of the transaction.',
                },
                categoryId: {
                  type: Type.STRING,
                  description: 'The ID of the category from the provided list, or "new" if creating a new one.',
                },
                newCategoryName: {
                  type: Type.STRING,
                  description: 'If categoryId is "new", provide the name. Format MUST strictly be "BanglaName (EnglishName)". Example: "জরিমানা (Fine)"',
                },
                newCategoryIcon: {
                  type: Type.STRING,
                  description: 'If categoryId is "new", provide an emoji for the new category (e.g. 🍔, 🚗, 🎮).',
                },
                note: {
                  type: Type.STRING,
                  description: 'Optional note or description.',
                },
              },
              required: ['type', 'amount', 'categoryId'],
            },
          },
        ],
      };

      const reqBody = {
        featureType: 'assistant',
        model: 'gemini-3-flash-preview',
        contents: { parts: contentsParts },
        config: {
          systemInstruction,
          temperature: 0.7,
          tools: onAddTransaction ? [addTransactionTool] : undefined,
        }
      };

      const token = await import('../firebase').then(m => m.auth.currentUser?.getIdToken());
      const aiResponse = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(reqBody)
      });
      
      if (!aiResponse.ok) {
        let errMessage = 'Failed to fetch AI response';
        try {
          const errData = await aiResponse.json();
          errMessage = `${errData.error || errMessage} ${errData.details || ''}`;
        } catch (e) {}
        throw new Error(errMessage);
      }
      
      const response = await aiResponse.json();
      
      let replyText = response.text || '';
      
      if (response.functionCalls && response.functionCalls.length > 0) {
        const call = response.functionCalls[0];
        if (call.name === 'add_transaction' && onAddTransaction) {
          const args = call.args as any;
          let finalCategoryId = args.categoryId;

          if (finalCategoryId === 'new' && args.newCategoryName && onAddCategory) {
            const newCatId = await onAddCategory({
              name: args.newCategoryName,
              icon: args.newCategoryIcon || '📁',
              color: 'bg-indigo-100 text-indigo-600',
              type: args.type as 'income' | 'expense'
            });
            if (newCatId) {
              finalCategoryId = newCatId;
            }
          }

          onAddTransaction({
            type: args.type,
            amount: Number(args.amount),
            categoryId: finalCategoryId,
            note: args.note || '',
            date: new Date().toISOString()
          });
          replyText = language === 'bn' 
            ? `✅ ঠিক আছে, আমি ${args.type === 'income' ? 'আয়' : 'খরচ'} হিসেবে ${currency}${args.amount} যোগ করেছি।` 
            : `✅ Successfully added ${currency}${args.amount} as ${args.type}.`;
        }
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: replyText || (language === 'bn' ? 'দুঃখিত, আমি বুঝতে পারিনি।' : 'Sorry, I did not understand.'),
        sender: 'ai',
        timestamp: new Date()
      };

      if (isMounted.current) {
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

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        sender: 'ai',
        timestamp: new Date()
      };
      if (isMounted.current) {
        setMessages(prev => [...prev, errorMsg]);
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
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-20 right-6 md:bottom-8 md:right-8 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md transition-all z-40 hover:scale-110",
          isDarkMode ? "bg-blue-500 shadow-blue-900/50" : "bg-blue-600 shadow-blue-200"
        )}
        style={{ backgroundColor: 'var(--color-blue-500, #3b82f6)' }}
      >
        <Bot className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "fixed bottom-20 right-4 md:bottom-24 md:right-8 w-[calc(100vw-2rem)] md:w-96 h-[500px] max-h-[80vh] rounded-3xl shadow-md flex flex-col overflow-hidden z-50",
              isDarkMode ? "bg-[#111827] border border-gray-800" : "bg-white border border-gray-100"
            )}
          >
            {/* Header */}
            <div className={cn(
              "p-4 flex items-center justify-between text-white",
              isDarkMode ? "bg-gray-800" : "bg-blue-600"
            )}
            style={!isDarkMode ? { backgroundColor: 'var(--color-blue-600, #2563eb)' } : {}}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold">{language === 'bn' ? 'এআই সহকারী' : 'AI Assistant'}</h3>
                  <p className="text-xs text-white/80">{language === 'bn' ? 'অনলাইন' : 'Online'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={clearHistory}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  title={language === 'bn' ? 'হিস্ট্রি মুছুন' : 'Clear History'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                      : (isDarkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600")
                  )}
                  style={msg.sender === 'user' && !isDarkMode ? { backgroundColor: 'var(--color-blue-100, #dbeafe)', color: 'var(--color-blue-600, #2563eb)' } : (msg.sender === 'user' && isDarkMode ? { backgroundColor: 'var(--color-blue-600, #2563eb)' } : {})}
                  >
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={cn(
                    "p-3 rounded-2xl text-sm relative group",
                    msg.sender === 'user'
                      ? (isDarkMode ? "bg-blue-600 text-white rounded-tr-sm" : "bg-blue-600 text-white rounded-tr-sm")
                      : (isDarkMode ? "bg-gray-800 text-gray-200 rounded-tl-sm" : "bg-gray-100 text-gray-800 rounded-tl-sm")
                  )}
                  style={msg.sender === 'user' ? { backgroundColor: 'var(--color-blue-600, #2563eb)' } : {}}
                  >
                    {msg.imageData && (
                      <img src={msg.imageData} alt="User upload" className="max-w-full h-auto max-h-48 rounded-lg mb-2 object-contain" />
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <div className={cn(
                      "flex items-center mt-1",
                      msg.sender === 'user' ? "justify-end" : "justify-between"
                    )}>
                      {msg.sender === 'ai' && (
                        <button
                          onClick={() => speakText(msg.text, msg.id)}
                          className={cn(
                            "p-1 rounded-full transition-colors",
                            speakingId === msg.id 
                              ? "text-blue-500 bg-blue-50 dark:bg-blue-900/30" 
                              : "text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                          )}
                          title={language === 'bn' ? 'পড়ে শোনান' : 'Read aloud'}
                        >
                          {speakingId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      <p className={cn(
                        "text-[10px]",
                        msg.sender === 'user' ? "text-blue-200" : "text-gray-400"
                      )}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
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
                    isDarkMode ? "bg-gray-800" : "bg-gray-100"
                  )}>
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {language === 'bn' ? 'টাইপ করছে...' : 'Typing...'}
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={cn(
              "p-4 border-t",
              isDarkMode ? "border-gray-800 bg-[#111827]" : "border-gray-100 bg-white"
            )}>
              {selectedImage && (
                <div className="mb-3 relative inline-block">
                  <img src={selectedImage} alt="Selected" className="h-20 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setSelectedImageMimeType(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "p-2.5 sm:p-3 rounded-xl transition-all shrink-0",
                    isDarkMode ? "bg-gray-800 text-gray-400 hover:text-white" : "bg-gray-100 text-gray-500 hover:text-gray-900"
                  )}
                  title={language === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Image'}
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleListening}
                  className={cn(
                    "p-2.5 sm:p-3 rounded-xl transition-all shrink-0",
                    isListening 
                      ? "bg-red-100 text-red-600 animate-pulse" 
                      : (isDarkMode ? "bg-gray-800 text-gray-400 hover:text-white" : "bg-gray-100 text-gray-500 hover:text-gray-900")
                  )}
                  title={language === 'bn' ? 'ভয়েস ইনপুট' : 'Voice Input'}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={language === 'bn' ? (isListening ? 'শুনছি...' : 'আপনার প্রশ্ন লিখুন...') : (isListening ? 'Listening...' : 'Type your question...')}
                  className={cn(
                    "flex-1 min-w-0 p-2.5 sm:p-3 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-sm",
                    isDarkMode ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-900"
                  )}
                />
                <button
                  onClick={handleSend}
                  disabled={(!input.trim() && !selectedImage) || isLoading}
                  className={cn(
                    "p-2.5 sm:p-3 rounded-xl text-white transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed",
                    isDarkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"
                  )}
                  style={{ backgroundColor: 'var(--color-blue-600, #2563eb)' }}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
