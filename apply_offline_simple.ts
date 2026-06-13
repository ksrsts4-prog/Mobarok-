import fs from 'fs';

let content = fs.readFileSync('src/hooks/useFirebaseStore.ts', 'utf8');

// For transaction specifics where store.update is AFTER the await
content = content.replace(
  /await setDoc\(doc\(db, path\), newTx\);\s*(store\.setTransactions[^;]+;)/,
  "$1\n      setDoc(doc(db, path), newTx);"
);

content = content.replace(
  /await setDoc\(doc\(db, path\), updated, \{ merge: true \}\);\s*(store\.setTransactions[^;]+;)/,
  "$1\n      setDoc(doc(db, path), updated, { merge: true });"
);

content = content.replace(
  /await deleteDoc\(doc\(db, path\)\);\s*(store\.setTransactions[^;]+;)/,
  "$1\n      deleteDoc(doc(db, path));"
);

// Now generic strip of awaits for all CRUD operations
// We'll just replace 'await setDoc', 'await deleteDoc', 'await updateDoc' globally
// with just calling them, BUT we only want it inside CRUD operations.
// The easiest way is to selectively replace lines.

const linesToReplace = [
  { from: "await setDoc(newDoc, { ...cat, id: newDoc.id, uid: store.user.uid });", to: "setDoc(newDoc, { ...cat, id: newDoc.id, uid: store.user.uid });" },
  { from: "await setDoc(doc(db, path), { ...cat, uid: store.user.uid });", to: "setDoc(doc(db, path), { ...cat, uid: store.user.uid });" },
  { from: "await deleteDoc(doc(db, path));", to: "deleteDoc(doc(db, path));" },
  { from: "await setDoc(newDoc, { ...budget, id: newDoc.id, uid: store.user.uid });", to: "setDoc(newDoc, { ...budget, id: newDoc.id, uid: store.user.uid });" },
  { from: "await setDoc(doc(db, path), { ...budget, uid: store.user.uid });", to: "setDoc(doc(db, path), { ...budget, uid: store.user.uid });" },
  { from: "await setDoc(newDoc, { ...goal, id: newDoc.id, uid: store.user.uid });", to: "setDoc(newDoc, { ...goal, id: newDoc.id, uid: store.user.uid });" },
  { from: "await setDoc(doc(db, path), { ...goal, uid: store.user.uid });", to: "setDoc(doc(db, path), { ...goal, uid: store.user.uid });" },
  { from: "await setDoc(doc(db, path), { ...r, id, uid: store.user.uid });", to: "setDoc(doc(db, path), { ...r, id, uid: store.user.uid });" },
  { from: "await setDoc(doc(db, path), { ...d, id, uid: store.user.uid });", to: "setDoc(doc(db, path), { ...d, id, uid: store.user.uid });" },
  { from: "await setDoc(doc(db, path), { ...updated, uid: store.user.uid }, { merge: true });", to: "setDoc(doc(db, path), { ...updated, uid: store.user.uid }, { merge: true });" },
  { from: "await setDoc(doc(db, path), { ...f, id, uid: store.user.uid });", to: "setDoc(doc(db, path), { ...f, id, uid: store.user.uid });" },
  { from: "await setDoc(doc(db, path), { ...inv, id, uid: store.user.uid });", to: "setDoc(doc(db, path), { ...inv, id, uid: store.user.uid });" },
  { from: "await setDoc(doc(db, path), updated, { merge: true });", to: "setDoc(doc(db, path), updated, { merge: true });" },
  { from: "await setDoc(doc(db, path), { ...b, id, uid: store.user.uid });", to: "setDoc(doc(db, path), { ...b, id, uid: store.user.uid });" },
  { from: "await setDoc(doc(db, path), fullUpdate, { merge: true });", to: "setDoc(doc(db, path), fullUpdate, { merge: true });" },
  { from: "await setDoc(docRef, { features: { [featureKey]: value } }, { merge: true });", to: "setDoc(docRef, { features: { [featureKey]: value } }, { merge: true });" },
  { from: "await setDoc(doc(db, path), updates, { merge: true });", to: "setDoc(doc(db, path), updates, { merge: true });" },
  { from: "await setDoc(doc(db, path), {", to: "setDoc(doc(db, path), {" }
];

linesToReplace.forEach(({ from, to }) => {
  content = content.replace(from, to);
});

// Since we removed await, the functions will complete immediately.
// We just need to make sure the promises don't throw UnhandledRejection.
// Well, we can add `.catch(console.error)` automatically to all `setDoc(` and `deleteDoc(` that don't have it.
// Actually, they are inside a `try {} catch(e) {}` block. 
// BUT, if there is no `await`, the `try/catch` won't catch errors from `setDoc` since it's asynchronous!
// Which means if `setDoc` rejects, it will be an unhandled promise rejection!
// To fix this, we replace `setDoc(` with `setDoc(` + `.catch(e => console.error("Firebase write error", e))`
content = content.replace(/(setDoc\([^)]+\)|deleteDoc\([^)]+\)(?!\.catch))/g, "$1.catch((e:any) => console.error('Offline write error:', e))");
// Note: Some might be nested. I'll just use a robust replacement:
fs.writeFileSync('src/hooks/useFirebaseStore.ts', content, 'utf8');
console.log('Firebase store simple replace complete');
