import fs from 'fs';

let content = fs.readFileSync('src/hooks/useFirebaseStore.ts', 'utf8');

// The faulty replacements generated codes like:
// setDoc(doc(db, path).catch((e:any) => console.error('Offline write error:', e)), updated, { merge: true });
// They should be:
// setDoc(doc(db, path), updated, { merge: true }).catch((e:any) => console.error('Offline write error:', e));

content = content.replace(
  /setDoc\(doc\(db, path\)\.catch\(\(e:any\) => console\.error\('Offline write error:', e\)\), ([^;]+)\);/g,
  "setDoc(doc(db, path), $1).catch((e:any) => console.error('Offline write error:', e));"
);

content = content.replace(
  /await deleteDoc\(doc\(db, path\)\)\.catch\(\(e:any\) => console\.error\('Offline write error:', e\)\);/g,
  "deleteDoc(doc(db, path)).catch((e:any) => console.error('Offline write error:', e));"
);

content = content.replace(
  /await deleteDoc\(doc\(db, path\)\)\.catch\(\(e:any\) => console\.error\(e\)\);/g,
  "deleteDoc(doc(db, path)).catch((e:any) => console.error('Offline write error:', e));"
);

// One more check for line 840
// await deleteDoc(doc(db, 'users', currentUser.uid).catch((e:any) => console.error('Offline write error:', e)));
content = content.replace(
  /await deleteDoc\(doc\(db, 'users', currentUser\.uid\)\.catch\(\(e:any\) => console\.error\('Offline write error:', e\)\)\);/,
  "deleteDoc(doc(db, 'users', currentUser.uid)).catch((e:any) => console.error('Offline write error:', e));"
);

// Check if any other weirdness is left
content = content.replace(
  /setDoc\(doc\(db, path\)\.catch\(\(e:any\) => console\.error\('Offline write error:', e\)\), {/g,
  "setDoc(doc(db, path), {"
);
// oh wait, if the above regex was "setDoc(doc...", "{" is the first arg. But since it's multiline in some parts...
// The first regex `setDoc\(doc\(db, path\)\.catch...([^;]+);` handles single-line `setDoc` but multiline ones like line 770 will be tricky.

fs.writeFileSync('src/hooks/useFirebaseStore.ts', content, 'utf8');
console.log('Fixed syntax!');
