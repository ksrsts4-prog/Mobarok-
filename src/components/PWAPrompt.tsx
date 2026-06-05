import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export default function PWAPrompt() {
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPromptEvent(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!installPromptEvent) {
    return null;
  }

  const handleInstallClick = async () => {
    if (installPromptEvent) {
      installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;
      if (outcome === 'accepted') {
        setInstallPromptEvent(null);
      }
    }
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 md:bottom-4 md:left-auto md:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">ইনস্টল অ্যাপ (Install App)</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">অফলাইনে ব্যবহার করতে এবং ভালো অভিজ্ঞতার জন্য অ্যাপটি ইনস্টল করুন।</p>
        </div>
        <button 
          onClick={() => setInstallPromptEvent(null)}
          className="text-gray-400 hover:text-gray-500"
        >
          ✕
        </button>
      </div>
      <button 
        onClick={handleInstallClick}
        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 flex items-center justify-center font-medium"
      >
        <Download className="w-4 h-4 mr-2" />
        ইনস্টল করুন
      </button>
    </div>
  );
}
