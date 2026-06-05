import React from 'react';
import { Skeleton } from './ui/Skeleton';

export function PageSkeleton() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-500">
      {/* Top Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 rounded-3xl bg-white dark:bg-[#1B2559] border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <Skeleton className="h-5 w-24 rounded-lg" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <Skeleton className="h-8 w-32 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#1B2559] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
             <div className="flex justify-between items-center mb-6">
               <Skeleton className="h-6 w-40 rounded-lg" />
               <Skeleton className="h-8 w-24 rounded-lg" />
             </div>
             <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          
          {/* Recent List */}
          <div className="bg-white dark:bg-[#1B2559] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex justify-between items-center mb-6">
               <Skeleton className="h-6 w-32 rounded-lg" />
               <Skeleton className="h-4 w-16 rounded-lg" />
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div>
                      <Skeleton className="h-5 w-32 rounded-md mb-2" />
                      <Skeleton className="h-4 w-20 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-24 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Space */}
        <div className="space-y-6">
           <div className="bg-white dark:bg-[#1B2559] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
             <Skeleton className="h-6 w-32 rounded-lg mb-6" />
             <div className="flex justify-center mb-4">
               <Skeleton className="h-48 w-48 rounded-full" />
             </div>
             <div className="space-y-3">
               <Skeleton className="h-12 w-full rounded-xl" />
               <Skeleton className="h-12 w-full rounded-xl" />
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
