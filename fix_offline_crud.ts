import fs from 'fs';

let content = fs.readFileSync('src/hooks/useFirebaseStore.ts', 'utf8');

// The pattern to match:
// const funcName = async (args) => {
//   if (!store.user) return;
//   const path = ...
//   try {
//     await firebaseCall;
//     storeUpdate;
//   } catch (err) {
//     handleFirestoreError
//   }
// }

// To be safe and precise, we can use a custom script to refactor this logic.
const fixCRUD = (funcName, stateUpdateLines) => {
  const regex = new RegExp(
    \`const \${funcName} = async \\\(([^)]*)\\\) => \\\{[\\\\s\\\\S]*?try \\\{[\\\\s\\\\S]*?await ([^;]+);\\\\s*([\\\\s\\\\S]*?)\\\} catch \\\(([^)]*)\\\) \\\{([\\\\s\\\\S]*?)\\\}\\\\s*\\\}\`,
    'g'
  );
  
  content = content.replace(regex, (match, args, firebaseCall, storeUpdate, catchArg, catchBody) => {
    // Extract the setup lines (everything between the arrow and the try {)
    let setupLinesMatch = match.match(new RegExp(\`const \${funcName} = async \\\(\\\\\\s*\${args?.replace(/[.*+?^$\\\(\\\){}|\\[\\]\\\\]/g, '\\\\$&')}\\\\\\s*\\\) => \\\{([\\\\s\\\\S]*?)try \\\{\`));
    let setupLines = setupLinesMatch ? setupLinesMatch[1] : '';
    
    // Some functions might have custom id generation in setup lines, e.g. addTransaction
    return \`const \${funcName} = async (\${args}) => {
\${setupLines}
    // Optimistic UI update for Offline-First capability
\${storeUpdate}
    // Background sync
    \${firebaseCall}.catch((\${catchArg}) => {
\${catchBody}
    });
  }\`;
  });
};

// However, my regex might fail. So let's build the exact text replacements.

// Add Transaction
content = content.replace(
  /const addTransaction = async\s*\([^)]*\)\s*=>\s*\{[\s\S]*?try\s*\{[\s\S]*?await setDoc\(([^,]+),\s*newTx\);\s*store\.setTransactions\(([\s\S]*?)\);\s*\}\s*catch\s*\(err\)\s*\{\s*handleFirestoreError\(([^)]+)\);\s*\}\s*\};/,
  \`const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    if (!store.user) return;
    const id = Date.now().toString();
    const path = \\\`users/\\\${store.user.uid}/transactions/\\\${id}\\\`;
    const newTx = { ...t, id, uid: store.user.uid } as Transaction;
    
    // --- OFFLINE FIRST OPTIMISTIC UPDATE ---
    store.setTransactions(prev => [newTx, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    setDoc(doc(db, path), newTx).catch(err => {
      handleFirestoreError(err, OperationType.CREATE, path);
    });
  };\`);

  // Update Transaction
content = content.replace(
  /const updateTransaction = async\s*\([^)]*\)\s*=>\s*\{[\s\S]*?try\s*\{[\s\S]*?await setDoc\([^;]+\);[\s\S]*?store\.setTransactions\([^;]+\);[\s\S]*?\}\s*catch\s*\([^)]+\)\s*\{[\s\S]*?\}\s*\};/,
  \`const updateTransaction = async (id: string, updated: Partial<Transaction>) => {
    if (!store.user) return;
    const path = \\\`users/\\\${store.user.uid}/transactions/\\\${id}\\\`;
    
    // --- OFFLINE FIRST OPTIMISTIC UPDATE ---
    store.setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...updated } as Transaction : tx).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    setDoc(doc(db, path), updated, { merge: true }).catch(err => {
      handleFirestoreError(err, OperationType.UPDATE, path);
    });
  };\`
);

  // Delete Transaction
content = content.replace(
  /const deleteTransaction = async\s*\([^)]*\)\s*=>\s*\{[\s\S]*?try\s*\{[\s\S]*?await deleteDoc\([^;]+\);[\s\S]*?store\.setTransactions\([^;]+\);[\s\S]*?\}\s*catch\s*\([^)]+\)\s*\{[\s\S]*?\}\s*\};/,
  \`const deleteTransaction = async (id: string) => {
    if (!store.user) return;
    const path = \\\`users/\\\${store.user.uid}/transactions/\\\${id}\\\`;
    
    // --- OFFLINE FIRST OPTIMISTIC UPDATE ---
    store.setTransactions(prev => prev.filter(tx => tx.id !== id));
    
    deleteDoc(doc(db, path)).catch(err => {
      handleFirestoreError(err, OperationType.DELETE, path);
    });
  };\`
);

  // Add Category
content = content.replace(
  /const addCategory = async\s*\([^)]*\)\s*=>\s*\{[\s\S]*?try\s*\{[\s\S]*?await setDoc\([^;]+\);[\s\S]*?store\.setCategories\([^;]+\);[\s\S]*?\}\s*catch\s*\([^)]+\)\s*\{[\s\S]*?\}\s*\};/,
  \`const addCategory = async (cat: Omit<Category, 'id'>) => {
    if (!store.user) return;
    const id = Date.now().toString();
    const path = \\\`users/\\\${store.user.uid}/categories/\\\${id}\\\`;
    const newCat = { ...cat, id } as Category;
    
    // --- OFFLINE FIRST OPTIMISTIC UPDATE ---
    store.setCategories(prev => [...prev, newCat]);
    
    setDoc(doc(db, path), newCat).catch(err => {
        handleFirestoreError(err, OperationType.CREATE, path);
    });
  };\`
);


// Let's do the rest recursively using a more robust Regex or manual replacement
fs.writeFileSync('src/hooks/useFirebaseStore.ts', content, 'utf8');
console.log('useFirebaseStore.ts partially optimized for offline');

