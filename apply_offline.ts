import fs from 'fs';

let content = fs.readFileSync('src/hooks/useFirebaseStore.ts', 'utf8');

// For transaction
content = content.replace(
  /const addTransaction = async\s*\([\s\S]*?try\s*\{[\s\S]*?await setDoc\(([^,]+),\s*newTx\);\s*(store\.setTransactions[^;]+;)\s*\}\s*catch\s*\([^)]+\)\s*\{\s*handleFirestoreError\(([^)]+)\);\s*\}\s*\};/g,
  ["const addTransaction = async (t: Omit<Transaction, 'id'>) => {",
   "    if (!store.user) return;",
   "    const id = Date.now().toString();",
   "    const path = 'users/' + store.user.uid + '/transactions/' + id;",
   "    const newTx = { ...t, id, uid: store.user.uid } as Transaction;",
   "    ",
   "    // --- OFFLINE FIRST OPTIMISTIC UI ---",
   "    $2",
   "    ",
   "    setDoc(doc(db, path), newTx).catch(err => handleFirestoreError(err, OperationType.CREATE, path));",
   "  };"].join('\\n')
);

content = content.replace(
  /const updateTransaction = async\s*\([\s\S]*?try\s*\{[\s\S]*?await setDoc\([^,]+,\s*updated,\s*\{\s*merge:\s*true\s*\}\);\s*(store\.setTransactions[^;]+;)\s*\}\s*catch\s*\([^)]+\)\s*\{\s*handleFirestoreError\(([^)]+)\);\s*\}\s*\};/,
  ["const updateTransaction = async (id: string, updated: Partial<Transaction>) => {",
   "    if (!store.user) return;",
   "    const path = 'users/' + store.user.uid + '/transactions/' + id;",
   "    // --- OFFLINE FIRST OPTIMISTIC UI ---",
   "    $1",
   "    setDoc(doc(db, path), updated, { merge: true }).catch(err => handleFirestoreError(err, OperationType.UPDATE, path));",
   "  };"].join('\\n')
);

content = content.replace(
  /const deleteTransaction = async\s*\([\s\S]*?try\s*\{[\s\S]*?await deleteDoc\([^)]+\);\s*(store\.setTransactions[^;]+;)\s*\}\s*catch\s*\([^)]+\)\s*\{\s*handleFirestoreError\(([^)]+)\);\s*\}\s*\};/,
  ["const deleteTransaction = async (id: string) => {",
   "    if (!store.user) return;",
   "    const path = 'users/' + store.user.uid + '/transactions/' + id;",
   "    // --- OFFLINE FIRST OPTIMISTIC UI ---",
   "    $1",
   "    deleteDoc(doc(db, path)).catch(err => handleFirestoreError(err, OperationType.DELETE, path));",
   "  };"].join('\\n')
);

const crudNames = [
  'Category', 'Budget', 'SavingsGoal', 'RecurringTransaction', 
  'Debt', 'FamilyMember', 'Investment', 'Bill'
];

crudNames.forEach(entity => {
  // ADD
  const addRegex = new RegExp('(const add' + entity + ' = async \\\\([^)]+\\\\) => \\\\{[\\\\s\\\\S]*?)try \\\\{[\\\\s\\\\S]*?await setDoc\\\\(([^,]+), ([^)]+)\\\\);([\\\\s\\\\S]*?)\\\\} catch \\\\(error\\\\) \\\\{[\\\\s\\\\S]*?\\\\}', 'g');
  content = content.replace(addRegex, (match, before, docRef, data, afterParams) => {
      return before + 'setDoc(' + docRef + ', ' + data + ').catch(error => handleFirestoreError(error, OperationType.WRITE, ' + docRef + '.path || ""));\\n' + afterParams;
  });

  // UPDATE
  const updateRegex = new RegExp('(const update' + entity + ' = async \\\\([^)]+\\\\) => \\\\{[\\\\s\\\\S]*?)try \\\\{[\\\\s\\\\S]*?await (setDoc|updateDoc)\\\\(([^,]+), ([^,)]+)(?:, \\\\{ merge: true \\\\})?\\\\);[\\\\s\\\\S]*?\\\\} catch \\\\(error\\\\) \\\\{[\\\\s\\\\S]*?\\\\}', 'g');
  content = content.replace(updateRegex, (match, before, method, docRef, data) => {
      return before + method + '(' + docRef + ', ' + data + (method === 'setDoc' ? ', { merge: true }' : '') + ').catch(error => handleFirestoreError(error, OperationType.WRITE, ' + docRef + '.path || ""));';
  });

  // DELETE
  const deleteRegex = new RegExp('(const delete' + entity + ' = async \\\\([^)]+\\\\) => \\\\{[\\\\s\\\\S]*?)try \\\\{[\\\\s\\\\S]*?await deleteDoc\\\\(([^)]+)\\\\);[\\\\s\\\\S]*?\\\\} catch \\\\(error\\\\) \\\\{[\\\\s\\\\S]*?\\\\}', 'g');
  content = content.replace(deleteRegex, (match, before, docRef) => {
      return before + 'deleteDoc(' + docRef + ').catch(error => handleFirestoreError(error, OperationType.DELETE, ' + docRef + '.path || ""));';
  });
});

fs.writeFileSync('src/hooks/useFirebaseStore.ts', content, 'utf8');
console.log('Firebase store offline operations optimized.');
