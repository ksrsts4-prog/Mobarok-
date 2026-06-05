import { Telegraf } from 'telegraf';
import admin from 'firebase-admin';

export function startTelegramBot(db: any, appUrl: string | undefined, expressApp: any) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

  if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
    console.error("Missing TELEGRAM_BOT_TOKEN or ADMIN_CHAT_ID environment variables. Bot disabled.");
    return null;
  }

  // Initialize bot
  const bot = new Telegraf(BOT_TOKEN);

  if (!db) {
    console.error("Missing db instance. Bot disabled.");
    return null;
  }

  // 3. Security Middleware (Strict Authentication)
  bot.use((ctx, next) => {
    if (ctx.from && ctx.from.id.toString() === ADMIN_CHAT_ID) {
      return next();
    }
    return; // Silently drop unauthorized requests
  });

  // 4. Command: /stats - User & Traffic Analytics
  bot.command('start', (ctx) => {
    ctx.reply("🤖 Admin Bot is online and connected via Webhook!");
  });

  bot.command('stats', async (ctx) => {
    try {
      ctx.reply("📊 Fetching real-time statistics...");
      
      const usersSnapshot = await db.collection('users').count().get();
      const totalUsers = usersSnapshot.data().count;

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const startOfDayStr = startOfDay.toISOString();
      
      const todayTransactionsRef = await db.collection('transactions')
        .where('date', '>=', startOfDayStr)
        .get();
        
      let dailyVolume = 0;
      todayTransactionsRef.forEach((doc: any) => {
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
    const message = (ctx.message as any).text.replace('/broadcast ', '').trim();
    
    if (!message || message === '/broadcast') {
      return ctx.reply("⚠️ Please provide a message. Usage: `/broadcast Hello everyone!`");
    }

    try {
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

  // Always use long polling in AI Studio because incoming webhooks might be blocked
  // by development proxy authentication. We must delete any existing webhook first.
  bot.telegram.deleteWebhook({ drop_pending_updates: true })
    .then(() => {
      bot.launch().then(() => {
        console.log("🚀 Secure Admin Bot is running via long-polling...");
      }).catch(e => {
        // Ignore 409 Conflict if it is already running
        if (e.description?.includes('terminated by other getUpdates request') || e.code === 409) {
          console.warn("⚠️ Bot instance already running or conflicting polling detected. Continuing...");
        } else {
          console.error("Failed to launch bot:", e);
        }
      });
    })
    .catch(console.error);

  const stopBot = () => {
    try {
      bot.stop('SIGINT');
    } catch (e) {}
  };
  process.once('SIGINT', stopBot);
  process.once('SIGTERM', stopBot);
  process.once('SIGUSR2', stopBot);

  return bot;
}

export async function sendSystemAlert(bot: Telegraf | null, errorMsg: string) {
  const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
  if (!bot || !ADMIN_CHAT_ID) return;
  try {
    await bot.telegram.sendMessage(ADMIN_CHAT_ID, `🚨 *SYSTEM ALERT*\n\nAn error occurred in the application:\n\`${errorMsg}\``, { parse_mode: 'Markdown' });
  } catch (e) {
    console.error("Could not send Telegram alert:", e);
  }
}
