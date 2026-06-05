import crypto from 'crypto';
const hash = crypto.createHash('sha256').update('83592').digest('hex');
console.log(hash);
