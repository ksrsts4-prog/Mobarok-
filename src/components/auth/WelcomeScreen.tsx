import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Zap, LineChart, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Wallet } from 'lucide-react';

const AppLogo = ({ className = "w-12 h-12" }: { className?: string }) => {
  return (
    <div className={cn("relative flex items-center justify-center shrink-0 rounded-[28%] overflow-hidden shadow-md bg-[#3b82f6]", className)}>
        <svg viewBox="0 0 24 24" className="w-[60%] h-[60%] text-white" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-8 8H5a2 2 0 0 1-2-2V5.3"/>
          <path d="M22 10h-4a2 2 0 0 0 0 4h4V10z" fill="white" stroke="none"/>
        </svg>
    </div>
  );
};

export function WelcomeScreen({ handleLogin, isLoggingIn, loginError }: { handleLogin: () => void, isLoggingIn: boolean, loginError: string | null }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F4F7FE] to-[#E2E8F0] p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-400/20 rounded-full"></div>

      <div className="max-w-6xl w-full flex flex-col md:flex-row gap-8 items-center justify-center relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="hidden md:flex flex-col flex-1 items-start justify-center pr-10 border-r border-gray-200"
        >
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm shadow-blue-200">
             <AppLogo className="w-12 h-12 text-white shadow-none" />
          </div>
          <h1 className="text-5xl font-extrabold text-[#1B2559] leading-tight mb-6">
            আপনার আর্থিক অবস্থা <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              মুঠোফোনে নিয়ন্ত্রণ করুন
            </span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-md">
            আায় এবং ব্যয়ের পুঙ্খানুপুঙ্খ হিসাব রাখুন। রিয়েল-টাইম ড্যাশবোর্ড, সুন্দর চার্ট, এবং স্মার্ট ফিল্টারিং দিয়ে নিজের সঞ্চয় বাড়ান।
          </p>
          
          <div className="flex flex-col gap-4 w-full">
            {[
              { icon: ShieldCheck, title: '১০০% নিরাপদ', desc: 'আপনার ডেটা ফায়ারবেস ক্লাউডে সুরক্ষিত থাকে' },
              { icon: Zap, title: 'দ্রুত এবং সহজ', desc: 'কয়েক সেকেন্ডে আয় বা ব্যয় যোগ করুন' },
              { icon: LineChart, title: 'বিশ্লেষণ', desc: 'প্রতি মাসের আর্থিক চিত্র দেখুন এডভান্সড চার্ট এর মাধ্যমে' }
            ].map((feature, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (i * 0.1) }}
                key={i} className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl"
              >
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1B2559]">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md bg-white/80 p-10 rounded-[40px] shadow-md border border-white/50 text-center space-y-8 flex-shrink-0"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="md:hidden flex justify-center mb-0"
          >
            <AppLogo className="w-24 h-24 shadow-md" />
          </motion.div>
          
          <div className="space-y-3">
            <h2 className="text-4xl font-extrabold text-[#1B2559] tracking-tight md:text-3xl">স্বাগতম</h2>
            <p className="text-gray-500 font-medium text-lg md:text-base">একাউন্টে লগইন করতে Google নির্বাচন করুন</p>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleLogin}
              disabled={isLoggingIn}
              className={cn(
                "w-full py-4 bg-white border-2 border-gray-100 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-blue-100 hover:shadow-md transition-all duration-300 active:scale-[0.98]",
                isLoggingIn && "opacity-70 cursor-not-allowed"
              )}
            >
              {isLoggingIn ? (
                <div className="flex items-center gap-3 text-blue-600">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"
                  />
                  <span>লগইন হচ্ছে...</span>
                </div>
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-gray-700">Google দিয়ে লগইন করুন</span>
                </>
              )}
            </button>
            <p className="text-xs text-orange-600 font-medium mt-2 leading-relaxed">
              লগইন এ স্ক্রিন সাদা হয়ে থাকলে, দয়া করে অ্যাপটি <br className="md:hidden" /><b>New Tab (↗)</b>-এ ওপেন করে লগইন করুন।
            </p>
          </div>

          {loginError && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-left leading-tight">{loginError}</span>
            </motion.div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-300 font-medium">লগইন করার মাধ্যমে আপনি আমাদের শর্তাবলী মেনে নিচ্ছেন।</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
