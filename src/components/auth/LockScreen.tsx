import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Fingerprint } from 'lucide-react';
import { cn, hashPin } from '../../lib/utils';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';

interface LockScreenProps {
  pinCode: string;
  isDarkMode: boolean;
  language: string;
  isBiometricEnabled: boolean;
  user: any;
  setIsAppLocked: (b: boolean) => void;
  setPinCode: (p: string | null) => void;
  updateSettings: (s: any) => void;
  handleBiometricAuth: () => void;
}

export function LockScreen({ pinCode, isDarkMode, language, isBiometricEnabled, user, setIsAppLocked, setPinCode, updateSettings, handleBiometricAuth }: LockScreenProps) {
  const [enteredPin, setEnteredPin] = useState('');
  const [showForgotPinConfirm, setShowForgotPinConfirm] = useState(false);
  const [isError, setIsError] = useState(false);

  return (
    <div className={cn("min-h-screen flex items-center justify-center p-6", isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900")}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("w-full max-w-md p-10 rounded-[40px] text-center shadow-md relative overflow-hidden", isDarkMode ? "bg-gray-800" : "bg-white")}
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-500/10 to-transparent"></div>
        <div className="relative z-10">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-3">{language === 'bn' ? 'অ্যাপ আনলক করুন' : 'Unlock App'}</h2>
          <p className={cn("mb-10", isDarkMode ? "text-gray-300" : "text-gray-600")}>
            {language === 'bn' ? 'আপনার ৪ ডিজিটের পিন কোড দিন' : 'Enter your 4 digit PIN code'}
          </p>
          
          <div className="flex justify-center gap-4 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={cn("w-4 h-4 rounded-full transition-all duration-300", enteredPin.length > i ? "bg-blue-600 scale-110" : (isDarkMode ? "bg-gray-700" : "bg-gray-200") )} />
            ))}
          </div>
          
          <input 
            type="password"
            maxLength={4}
            value={enteredPin}
            className={cn(
              "w-full text-center text-3xl tracking-[1em] font-bold p-6 rounded-3xl transition-all border-2",
              isDarkMode ? "bg-gray-900 border-gray-700 text-white focus:border-blue-500" : "bg-gray-50 border-gray-100 text-[#1B2559] focus:border-blue-500",
              isError ? "border-red-500 text-red-500 animate-pulse" : ""
            )}
            autoFocus
            onChange={async (e) => {
              const val = e.target.value.replace(/[^0-9]/g, '');
              setEnteredPin(val);
              setIsError(false);
              
              if (val.length === 4) {
                // If it's pure 4-digit numeric, maybe it's the old plaintext pin, keep backwards compatibility if it directly matches? 
                // Or simply enforce hash (if old clients have unhashed pin... we might lock them out if they update. Better back compat hash check:
                if (val === pinCode) {
                  setIsAppLocked(false);
                  setEnteredPin('');
                  return;
                }
                
                const hashed = await hashPin(val);
                if (hashed === pinCode) {
                  setIsAppLocked(false);
                  setEnteredPin('');
                } else {
                  setIsError(true);
                }
              }
            }}
          />
          {isError && (
            <p className="text-red-500 mt-4 font-bold animate-bounce">
              {language === 'bn' ? 'ভুল পিন কোড!' : 'Incorrect PIN code!'}
            </p>
          )}

          <div className="flex flex-col items-center gap-4 mt-8">
            {isBiometricEnabled && (
              <button
                onClick={handleBiometricAuth}
                className={cn(
                  "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all",
                  isDarkMode ? "bg-blue-900/30 text-blue-400 hover:bg-blue-900/50" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                )}
              >
                <Fingerprint className="w-6 h-6" />
                {language === 'bn' ? 'বায়োমেট্রিক দিয়ে আনলক' : 'Unlock with Biometrics'}
              </button>
            )}

            <button
              onClick={() => setShowForgotPinConfirm(true)}
              className="text-sm text-blue-500 font-bold hover:underline"
            >
              {language === 'bn' ? 'পিন ভুলে গেছেন?' : 'Forgot PIN?'}
            </button>
          </div>
        </div>
      </motion.div>

      {showForgotPinConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "w-full max-w-sm p-6 rounded-3xl text-center shadow-md",
              isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            )}
          >
            <h3 className="text-xl font-bold mb-3">{language === 'bn' ? 'পিন রিসেট করবেন?' : 'Reset PIN?'}</h3>
            <p className={cn("text-sm mb-6", isDarkMode ? "text-gray-400" : "text-gray-500")}>
              {language === 'bn' ? 'পিন রিসেট করতে আপনাকে আবার লগইন করতে হবে। আপনি কি চালিয়ে যেতে চান?' : 'To reset your PIN, you need to log in again. Do you want to continue?'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowForgotPinConfirm(false)}
                className={cn(
                  "flex-1 py-3 rounded-xl font-bold transition-colors",
                  isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
                )}
              >
                {language === 'bn' ? 'না' : 'No'}
              </button>
              <button
                onClick={async () => {
                  try {
                    const provider = new GoogleAuthProvider();
                    provider.setCustomParameters({ prompt: 'select_account' });
                    const result = await signInWithPopup(auth, provider);
                    if (result.user.uid === user?.uid) {
                      setPinCode(null);
                      setIsAppLocked(false);
                      updateSettings({ pinCode: null });
                      alert(language === 'bn' ? 'আপনার পিন সফলভাবে মুছে ফেলা হয়েছে।' : 'Your PIN has been successfully removed.');
                    } else {
                      alert(language === 'bn' ? 'আপনি অন্য অ্যাকাউন্ট দিয়ে লগইন করেছেন। সঠিক অ্যাকাউন্ট ব্যবহার করুন।' : 'You logged in with a different account. Please use the correct account.');
                    }
                    setShowForgotPinConfirm(false);
                  } catch (err: any) {
                    setShowForgotPinConfirm(false);
                    if (err.code !== 'auth/popup-closed-by-user') {
                      alert('Error: ' + err.message);
                    }
                  }
                }}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                {language === 'bn' ? 'হ্যাঁ, লগইন করুন' : 'Yes, Login'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
