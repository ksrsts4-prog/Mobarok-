import React from 'react';
import { motion } from 'motion/react';
import { Search, Bell } from 'lucide-react';
import { cn } from '../../lib/utils';

interface HeaderProps {
  isDarkMode: boolean;
  userPhoto: string | null;
  userName: string;
}

export function Header({ isDarkMode, userPhoto, userName }: HeaderProps) {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-6 flex items-center justify-between sticky top-0 z-40 transition-colors duration-300",
        isDarkMode ? "bg-[#0B1120]/80" : "bg-[#F4F7FE]/80"
      )}
    >
      <div>
        <p className={cn("text-sm font-medium", isDarkMode ? "text-gray-300" : "text-gray-600")}>স্বাগতম!</p>
        <h2 className="text-xl font-bold">আপনার আর্থিক অবস্থা</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="খুঁজুন..." 
            className={cn(
              "pl-10 pr-4 py-2 rounded-xl border-none focus:ring-2 focus:ring-blue-500 w-64 shadow-sm transition-all",
              isDarkMode ? "bg-gray-800 text-white" : "bg-white text-[#1B2559]"
            )}
          />
        </div>
        <button className={cn(
          "p-2 rounded-xl shadow-sm transition-all relative",
          isDarkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-50"
        )}>
          <Bell className={cn("w-5 h-5", isDarkMode ? "text-gray-300" : "text-gray-600")} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className={cn(
          "w-10 h-10 flex items-center justify-center font-bold overflow-hidden",
          userPhoto ? "rounded-full" : "rounded-xl",
          isDarkMode ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-600"
        )}>
          {userPhoto ? (
            <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            userName ? userName.charAt(0).toUpperCase() : 'U'
          )}
        </div>
      </div>
    </motion.header>
  );
}
