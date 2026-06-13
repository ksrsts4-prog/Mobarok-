import fs from 'fs';

let content = fs.readFileSync('src/hooks/useFirebaseStore.ts', 'utf8');

const regex = /const (updateCategory|deleteCategory|addBudget|updateBudget|deleteBudget|addSavingsGoal|updateSavingsGoal|deleteSavingsGoal|addRecurringTransaction|updateRecurringTransaction|deleteRecurringTransaction|addDebt|updateDebt|deleteDebt|addFamilyMember|updateFamilyMember|deleteFamilyMember|addInvestment|updateInvestment|deleteInvestment|addBill|updateBill|deleteBill) = async \(([^)]+)\) => \{[\s\S]*?try \{([\s\S]*?)(await (setDoc|deleteDoc)\([^;]+\);)([\s\S]*?)\} catch \(([^)]+)\) \{([\s\S]*?)\}\s*\};/g;

content = content.replace(regex, (match, funcName, args, beforeAwait, awaitCall, afterAwait, catchVar, catchBody) => {
  return \`const \${funcName} = async (\${args}) => {
    if (!store.user) return;
\${beforeAwait}
    // --- OFFLINE FIRST OPTIMISTIC UPDATE ---
\${afterAwait}
    \${awaitCall.replace('await ', '')}.catch((\${catchVar}) => {
\${catchBody}
    });
  };\`;
});

// For updateSettings
content = content.replace(
  /const updateSettings = async \(([^)]+)\) => \{[\s\S]*?try \{([\s\S]*?)await updateDoc\([^;]+\);([\s\S]*?)\} catch \([^)]+\) \{[\s\S]*?\}\s*\};/,
  \`const updateSettings = async ($1) => {
    if (!store.user) return;
    $2
    // Optimistic UI directly applied by caller usually
    updateDoc(doc(db, \`users/\${store.user.uid}\`), updates).catch(err => {
      handleFirestoreError(err, OperationType.UPDATE, \`users/\${store.user.uid}\`);
    });
  };\`
);

fs.writeFileSync('src/hooks/useFirebaseStore.ts', content, 'utf8');
console.log('useFirebaseStore.ts fully optimized for offline');
