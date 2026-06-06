import React, { useEffect } from 'react';
import { format, parseISO } from 'date-fns';

export interface PdfTemplateProps {
  transactions: any[];
  categories: any[];
  language: 'bn' | 'en';
  currency: string;
  startDate?: string;
  endDate?: string;
  typeFilter?: string;
  onReady: () => void;
}

export const PdfTemplate: React.FC<PdfTemplateProps> = ({
  transactions,
  categories,
  language,
  currency,
  startDate,
  endDate,
  typeFilter,
  onReady
}) => {
  // Wait a small amount of time for fonts to render, then fire onReady
  useEffect(() => {
    const timer = setTimeout(() => {
      onReady();
    }, 1500); // 1.5 seconds to ensure web fonts render
    return () => clearTimeout(timer);
  }, [onReady]);

  const isBn = language === 'bn';
  const formatAmt = (amt: number) => `\${currency} \${amt.toLocaleString('en-US')}`;

  const income = transactions.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const net = income - expense;

  // Group transactions for pagination
  const ROWS_PAGE_1 = 15;
  const ROWS_PAGE_N = 35;

  const pages: any[][] = [];
  let currentTxIndex = 0;

  if (transactions.length > 0) {
    pages.push(transactions.slice(0, ROWS_PAGE_1));
    currentTxIndex = ROWS_PAGE_1;
    while (currentTxIndex < transactions.length) {
      pages.push(transactions.slice(currentTxIndex, currentTxIndex + ROWS_PAGE_N));
      currentTxIndex += ROWS_PAGE_N;
    }
  } else {
    pages.push([]); // At least one page
  }

  // Aggregate category analytics
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
  
  const sortedCategories = Object.entries(expensesByCategory)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5) // top 5
    .map(([id, amount]) => {
      const cat = categories.find(c => c.id === id);
      return { name: cat ? cat.name : 'Unknown', amount: amount as number };
    });

  return (
    <div className="font-sans text-gray-800" style={{ fontFamily: "'Noto Sans Bengali', 'Hind Siliguri', sans-serif" }}>
      {/* Include the font via Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600&family=Noto+Sans+Bengali:wght@400;600&display=swap');
        .pdf-page {
          width: 794px;
          height: 1123px;
          padding: 60px;
          background: white;
          position: relative;
          box-sizing: border-box;
          overflow: hidden;
        }
        .pdf-title { font-size: 28px; font-weight: bold; color: #1e3a8a; }
        .pdf-summary-card { padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; background: #f9fafb; flex: 1; }
        .pdf-table { width: 100%; border-collapse: collapse; margin-top: 20px; table-layout: fixed; }
        .pdf-table th { background-color: #f3f4f6; color: #374151; font-weight: 600; text-align: left; padding: 12px 8px; font-size: 14px; border-bottom: 2px solid #d1d5db; }
        .pdf-table td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #4b5563; word-wrap: break-word; }
        .pdf-footer { position: absolute; bottom: 40px; left: 60px; right: 60px; display: flex; justify-content: space-between; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 16px; }
      `}</style>

      {pages.map((pageTransactions, pageIndex) => (
        <div key={pageIndex} className="pdf-page bg-white">
          {pageIndex === 0 && (
            <>
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="pdf-title mb-1">{isBn ? 'আর্থিক রিপোর্ট' : 'Financial Report'}</h1>
                  <p className="text-gray-500 text-sm">
                    {startDate && endDate 
                      ? (isBn ? `সময়কাল: \${startDate} থেকে \${endDate}` : `Period: \${startDate} to \${endDate}`) 
                      : (isBn ? 'সব সময়ের রিপোর্ট' : 'All-time Report')}
                  </p>
                  {typeFilter && typeFilter !== 'all' && (
                    <p className="text-gray-500 text-sm capitalize">
                      {isBn ? `ধরন: \${typeFilter === 'income' ? 'আয়' : 'ব্যয়'}` : `Type: \${typeFilter}`}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700">Expense Tracker</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {isBn ? 'তৈরি করা হয়েছে:' : 'Generated on:'} <br/> 
                    {format(new Date(), 'yyyy-MM-dd HH:mm')}
                  </p>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="flex gap-4 mb-8">
                <div className="pdf-summary-card">
                  <p className="text-sm text-gray-500 mb-1">{isBn ? 'মোট আয়' : 'Total Income'}</p>
                  <p className="text-xl font-bold text-emerald-600">{formatAmt(income)}</p>
                </div>
                <div className="pdf-summary-card">
                  <p className="text-sm text-gray-500 mb-1">{isBn ? 'মোট ব্যয়' : 'Total Expense'}</p>
                  <p className="text-xl font-bold text-rose-600">{formatAmt(expense)}</p>
                </div>
                <div className="pdf-summary-card">
                  <p className="text-sm text-gray-500 mb-1">{isBn ? 'নেট ব্যালেন্স' : 'Net Balance'}</p>
                  <p className={"text-xl font-bold " + (net >= 0 ? "text-blue-600" : "text-rose-600")}>{formatAmt(net)}</p>
                </div>
                <div className="pdf-summary-card">
                  <p className="text-sm text-gray-500 mb-1">{isBn ? 'লেনদেন সংখ্যা' : 'Transactions'}</p>
                  <p className="text-xl font-bold text-gray-800">{transactions.length}</p>
                </div>
              </div>

              {/* Analytics Section (Top 5 Categories) */}
              {sortedCategories.length > 0 && (
                <div className="mb-8 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                  <h3 className="text-sm font-bold text-blue-900 mb-3 uppercase tracking-wider">
                    {isBn ? 'শীর্ষ ব্যয়ের খাত' : 'Top Expense Categories'}
                  </h3>
                  <div className="flex flex-wrap gap-x-8 gap-y-2">
                    {sortedCategories.map((c, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        <span className="text-sm text-gray-700">{c.name}:</span>
                        <span className="text-sm font-semibold text-gray-900">{formatAmt(c.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Transactions Table header for every page */}
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800 border-b-2 border-gray-800 pb-2 inline-block">
              {isBn ? 'লেনদেনের বিবরণ' : 'Transaction Details'}
              {pages.length > 1 && <span className="text-sm font-normal text-gray-500 ml-2">(Page {pageIndex + 1})</span>}
            </h2>
          </div>

          <table className="pdf-table">
            <thead>
              <tr>
                <th style={{ width: '18%' }}>{isBn ? 'তারিখ ও সময়' : 'Date & Time'}</th>
                <th style={{ width: '22%' }}>{isBn ? 'খাত' : 'Category'}</th>
                <th style={{ width: '30%' }}>{isBn ? 'নোট' : 'Note'}</th>
                <th style={{ width: '20%', textAlign: 'right' }}>{isBn ? 'পরিমাণ' : 'Amount'}</th>
                <th style={{ width: '10%', textAlign: 'center' }}>{isBn ? 'ধরন' : 'Type'}</th>
              </tr>
            </thead>
            <tbody>
              {pageTransactions.length > 0 ? pageTransactions.map((t, idx) => {
                const cat = categories.find((c) => c.id === t.categoryId);
                const catName = cat ? cat.name : '-';
                const isInc = t.type === 'income';
                return (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td>
                      <div className="font-medium">{format(parseISO(t.date), 'dd MMM yyyy')}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{format(parseISO(t.date), 'hh:mm a')}</div>
                    </td>
                    <td className="font-medium text-gray-700">{catName}</td>
                    <td className="text-gray-600 leading-relaxed">{t.note || '-'}</td>
                    <td className={`font-bold text-right \${isInc ? 'text-emerald-600' : 'text-gray-900'}`}>
                      {isInc ? '+' : '-'} {formatAmt(t.amount)}
                    </td>
                    <td className="text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium \${isInc ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'}`}>
                        {isInc ? (isBn ? 'আয়' : 'In') : (isBn ? 'ব্যয়' : 'Out')}
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    {isBn ? 'কোনো লেনদেন পাওয়া যায়নি' : 'No transactions found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Footer */}
          <div className="pdf-footer">
            <span>{isBn ? 'আর্থিক রিপোর্ট - Expense Tracker' : 'Financial Report - Expense Tracker'}</span>
            <span>Page {pageIndex + 1} of {pages.length}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
