import fs from 'fs';

const appPath = './src/App.tsx';
let content = fs.readFileSync(appPath, 'utf8');

const destructure = `  const {
    isAuthReady, isOnline, loginError, isLoggingIn, isFetchingTx, hasMoreTx, loadMoreTransactions,
    isSystemMaintenance, globalAlert, allFeedback,
    userName, setUserName, userEmail, setUserEmail, userPhone, setUserPhone,
    userOccupation, setUserOccupation, userAddress, setUserAddress,
    userPhoto, setUserPhoto, isPremium, setIsPremium,
    isAppLocked, setIsAppLocked, pinCode, setPinCode, isBiometricEnabled, setIsBiometricEnabled,
    handleLogin, handleLogout, handleLogoutOtherDevices, handleDeleteAccount, handleBiometricAuth,
    addTransaction, updateTransaction, deleteTransaction,
    addCategory, updateCategory, deleteCategory,
    addBudget, updateBudget, deleteBudget,
    addSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
    addRecurringTransaction, deleteRecurringTransaction,
    addDebt, updateDebt, deleteDebt, addFamilyMember, deleteFamilyMember,
    addInvestment, updateInvestment, deleteInvestment,
    addBill, updateBill, deleteBill, updateSettings,
    submitFeedback, deleteFeedback, submitFeedbackReply, toggleSystemFeature, lastBackupTime
  } = useFirebaseStore();`;

content = content.replace('const fbStore = useFirebaseStore();', destructure);
content = content.replaceAll('fbStore.', '');
fs.writeFileSync(appPath, content, 'utf8');
console.log('Fixed destructure.');
