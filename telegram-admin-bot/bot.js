require('dotenv').config();
const { Telegraf } = require('telegraf');
const admin = require('firebase-admin');

// 1. Environment & Config
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

// Use environment variables for Firebase credentials instead of a JSON file
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY 
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') // Fix newlines in .env
  : undefined;

if (!BOT_TOKEN || !ADMIN_CHAT_ID || !FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  console.error("Missing required environment variables. Please check your .env file.");
  process.exit(1);
}

// 2. Initialize Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY
    })
  });
  console.log("Firebase Admin SDK initialized securely using environment variables.");
} catch (error) {
  console.error("Failed to initialize Firebase Admin:", error);
  process.exit(1);
}

const db = admin.firestore();
const bot = new Telegraf(BOT_TOKEN);

// 3. Security Middleware (Strict Authentication)
// This strictly enforces the 80/20 rule: zero processing for unauthorized users.
bot.use((ctx, next) => {
  if (ctx.from && ctx.from.id.toString() === ADMIN_CHAT_ID) {
    return next();
  }
  return; // Silently drop unauthorized requests
});

// 4. Command: /stats - User & Traffic Analytics
bot.command('stats', async (ctx) => {
  try {
    ctx.reply("📊 Fetching real-time statistics...");
    
    // Fetch total registered users
    const usersSnapshot = await db.collection('users').count().get();
    const totalUsers = usersSnapshot.data().count;

    // Fetch today's transactions count
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfDayStr = startOfDay.toISOString();
    
    // Note: In an actual environment, a composite index might be needed depending on your queries.
    const todayTransactionsRef = await db.collection('transactions')
      .where('date', '>=', startOfDayStr)
      .get();
      
    let dailyVolume = 0;
    todayTransactionsRef.forEach(doc => {
      dailyVolume += Number(doc.data().amount || 0);
    });

    const report = `*📈 Real-Time System Analytics*\n\n`
                 + `👥 *Total Users:* ${totalUsers}\n`
                 + `📝 *Transactions Today:* ${todayTransactionsRef.size}\n`
                 + `💰 *Transaction Volume (Today):* ${dailyVolume.toFixed(2)}`;
                 
    ctx.replyWithMarkdown(report);
  } catch (error) {
    console.error("Error fetching stats:", error);
    ctx.reply("❌ Error fetching statistics.");
  }
});

// 5. Command: /broadcast <message> - Push Notifications
bot.command('broadcast', async (ctx) => {
  const message = ctx.message.text.replace('/broadcast ', '').trim();
  
  if (!message || message === '/broadcast') {
    return ctx.reply("⚠️ Please provide a message. Usage: `/broadcast Hello everyone!`");
  }

  try {
    // In our React App, we listen to systemSettings/general for globalAlerts
    await db.collection('systemSettings').doc('general').set({
      isGlobalAlertActive: true,
      globalAlertMsg: message
    }, { merge: true });

    ctx.reply(`✅ *Broadcast Sent Successfully!* \n\nMessage: "${message}"`, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error("Broadcast failed:", error);
    ctx.reply("❌ Failed to broadcast the message.");
  }
});

// 6. Command: /clear_alert - Disable the broadcast banner
bot.command('clear_alert', async (ctx) => {
  try {
    await db.collection('systemSettings').doc('general').set({
      isGlobalAlertActive: false,
      globalAlertMsg: ''
    }, { merge: true });
    ctx.reply("✅ Global alert cleared from the application.");
  } catch (error) {
    console.error("Failed to clear alert:", error);
    ctx.reply("❌ Failed to clear alert.");
  }
});

// 7. Error Handling & Webhook Simulation Alert
// You can call this function from your main web server's error handler.
async function sendSystemAlert(errorMsg) {
  try {
    await bot.telegram.sendMessage(ADMIN_CHAT_ID, `🚨 *SYSTEM ALERT*\n\nAn error occurred in the application:\n\`${errorMsg}\``, { parse_mode: 'Markdown' });
  } catch (e) {
    console.error("Could not send Telegram alert:", e);
  }
}

// Global process error catching for the bot itself
process.on('uncaughtException', (err) => {
  console.error('Unhandled Exception:', err);
  sendSystemAlert(`Uncaught Exception:\n${err.message}`);
});

bot.launch().then(() => {
  console.log("🚀 Secure Admin Bot is running inline...");
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = {
  sendSystemAlert // Allow other scripts to import and send alerts
};
