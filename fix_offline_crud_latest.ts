import fs from 'fs';

let content = fs.readFileSync('src/hooks/useFirebaseStore.ts', 'utf8');

// We want to turn:
// await setDoc(...);
// into:
// setDoc(...).catch(err => { ... handled by surrounding try/catch or just locally ... });
// Better yet, just remove `await` from write operations because the `try/catch` won't catch asynchronous errors if there's no await.
// But we DO want to catch them.

// Let's refactor crud operations systematically!
const operations = ['Transaction', 'Category', 'Budget', 'SavingsGoal', 'RecurringTransaction', 'Debt', 'FamilyMember', 'Investment', 'Bill'];

operations.forEach(op => {
  // Add
  content = content.replace(
    new RegExp(\`(const add\${op} = async \\\([^)]+\\\) => \\\{[\\\\s\\\\S]*?)try \\\{([\\\\s\\\\S]*?)\\\} catch \\\([^)]+\\\) \\\{[\\\\s\\\\S]*?\\\}(\\\\s*\\\})\`),
    (match, funcStart, tryBody, funcEnd) => {
      // Find the await setDoc
      let newTryBody = tryBody.replace(/await\s+(setDoc|addDoc)\(/g, '$1(');
      // For addTransaction specifically, we might need to adjust it to keep store update
      if (op === 'Transaction') {
          // addTransaction has an explicit store update we MUST keep. Since we removed await, it will run immediately.
          // The error catching is tricky if we remove await. Let's add explicit `.catch`
      }
      return match;
    }
  );
});
