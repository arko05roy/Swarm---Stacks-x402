const TelegramBot = require('node-telegram-bot-api');
const BotRegistry = require('./botRegistry');
const db = require('../database/db');
const StacksUtils = require('../utils/stacksUtils');
const Logger = require('../utils/logger');
const GeminiService = require('../services/geminiService');
const WalletService = require('../services/walletService');
const BotCreationService = require('../services/botCreationService');
const RateLimiter = require('../services/rateLimiter');
const { v4: uuidv4 } = require('uuid');

class MainBot {
  constructor(token) {
    this.bot = new TelegramBot(token, { polling: true });
    this.stacksUtils = new StacksUtils();
    this.gemini = new GeminiService();
    this.walletService = new WalletService();
    this.botCreation = new BotCreationService(this.walletService);
    this.rateLimiter = new RateLimiter();
    this.setupCommands();
  }

  setupCommands() {
    // Welcome message
    this.bot.onText(/\/start/, (msg) => {
      this.handleStart(msg);
    });

    // Show leaderboard
    this.bot.onText(/\/leaderboard/, (msg) => {
      this.handleLeaderboard(msg);
    });

    // Show available bots
    this.bot.onText(/\/bots/, (msg) => {
      this.handleBotList(msg);
    });

    // Create bot command (rate limited: 5/hour)
    this.bot.onText(/\/create_bot/, (msg) => {
      if (!this.rateLimiter.checkLimit(msg.from.id, 'create_bot', 5)) {
        const mins = this.rateLimiter.getRemainingTime(msg.from.id, 'create_bot');
        this.bot.sendMessage(msg.chat.id, `⏱️ Bot creation limit reached (5/hour). Try again in ${mins} min.`);
        return;
      }
      const response = this.botCreation.startSession(msg.from.id);
      this.bot.sendMessage(msg.chat.id, response, { parse_mode: 'HTML' });
    });

    // My bots command
    this.bot.onText(/\/my_bots/, (msg) => {
      this.handleMyBots(msg);
    });

    // Cancel bot creation
    this.bot.onText(/\/cancel/, (msg) => {
      const response = this.botCreation.cancelSession(msg.from.id);
      this.bot.sendMessage(msg.chat.id, response);
    });

    // Help command
    this.bot.onText(/\/help/, (msg) => {
      this.handleHelp(msg);
    });

    // Wallet commands (multiple aliases)
    this.bot.onText(/\/(?:my_?wallet|wallet)/, (msg) => {
      this.handleMyWallet(msg);
    });

    this.bot.onText(/\/(?:export_?wallet|backup)/, (msg) => {
      this.handleExportWallet(msg);
    });

    // Handle general messages (bot creation OR queries)
    this.bot.on('message', async (msg) => {
      // Skip if command
      if (msg.text && msg.text.startsWith('/')) return;

      // Check if user is in bot creation session
      if (this.botCreation.isInSession(msg.from.id)) {
        const creationResponse = await this.botCreation.handleMessage(
          msg.from.id,
          msg.text
        );

        if (creationResponse) {
          this.bot.sendMessage(msg.chat.id, creationResponse, { parse_mode: 'HTML' });
        }
      } else {
        // Regular query handling
        this.handleQuery(msg);
      }
    });
  }

  async handleStart(msg) {
    const userId = msg.from.id;

    // Auto-generate wallet if user doesn't have one
    const wallet = await this.walletService.generateWallet(userId);

    const welcomeMsg = `🐝 <b>Welcome to Swarm!</b>

<b>Create AI agents in Telegram that earn Bitcoin.</b>

👛 <b>Your Wallet:</b> <code>${wallet.address}</code>
(auto-generated for you!)

<b>How it works:</b>
1. Create your own bot with /create_bot
2. Your bot earns STX when users hire it
3. Earnings go directly to your wallet!

<b>Try asking:</b>
• "What's the price of Bitcoin?"
• "Weather in Paris?"
• "Translate hello to Spanish"

<b>Commands:</b>
/create_bot - Create your AI agent 🤖
/my_bots - See your bots &amp; earnings 💰
/wallet - View your wallet 👛
/bots - Browse marketplace 🏪
/leaderboard - Top earning bots 🏆
/help - Show all commands`;

    this.bot.sendMessage(msg.chat.id, welcomeMsg, { parse_mode: 'HTML' });
  }

  handleLeaderboard(msg) {
    const leaderboard = db.getLeaderboard(10);

    if (leaderboard.length === 0) {
      this.bot.sendMessage(msg.chat.id, '📊 No bots have earned yet. Be the first to ask a question!');
      return;
    }

    let message = '🏆 Top Earning Bots\n\n';
    leaderboard.forEach((entry, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      message += `${medal} ${entry.bot.name}\n`;
      message += `   💰 ${entry.earnings.toFixed(4)} STX\n`;
      message += `   ✅ ${entry.bot.tasksCompleted} tasks\n`;
      message += `   ⭐ ${entry.bot.rating.toFixed(1)}/5.0\n\n`;
    });

    this.bot.sendMessage(msg.chat.id, message);
  }

  handleBotList(msg) {
    const allBots = db.getAllBots();

    if (allBots.length === 0) {
      this.bot.sendMessage(msg.chat.id, '🤖 No bots available yet. Create one with /create_bot');
      return;
    }

    let message = '🤖 <b>Marketplace - All Bots</b>\n\n';

    const systemBots = allBots.filter(b => !b.createdBy);
    const userBots = allBots.filter(b => b.createdBy);

    if (systemBots.length > 0) {
      message += '<b>System Bots:</b>\n';
      systemBots.forEach(bot => {
        message += `\n🤖 ${bot.name}\n`;
        message += `${bot.description}\n`;
        message += `💰 ${bot.pricePerCall} STX per call\n`;
        message += `📊 ${bot.tasksCompleted || 0} tasks completed\n`;
      });
    }

    if (userBots.length > 0) {
      message += '\n\n<b>User-Created Bots:</b>\n';
      userBots.forEach(bot => {
        message += `\n👤 ${bot.name}\n`;
        message += `${bot.description}\n`;
        message += `💰 ${bot.pricePerCall} STX per call\n`;
        message += `📊 ${bot.tasksCompleted || 0} tasks completed\n`;
      });
    }

    message += `\n\n📊 <b>Total:</b> ${allBots.length} bots (${systemBots.length} system, ${userBots.length} user-created)`;

    this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' });
  }

  handleMyBots(msg) {
    const userId = msg.from.id;
    const userBots = db.getAllBots().filter(b => b.createdBy === userId);

    if (userBots.length === 0) {
      this.bot.sendMessage(
        msg.chat.id,
        "🤖 You haven't created any bots yet.\n\n<b>Create your first bot with /create_bot and start earning!</b> 💰",
        { parse_mode: 'HTML' }
      );
      return;
    }

    let message = '🤖 <b>Your Bots</b>\n\n';

    userBots.forEach((bot, index) => {
      message += `<b>${index + 1}. ${bot.name}</b>\n`;
      message += `💰 Price: ${bot.pricePerCall} STX/call\n`;
      message += `📊 Earned: ${(bot.totalEarnings || 0).toFixed(4)} STX\n`;
      message += `✅ Tasks: ${bot.tasksCompleted || 0}\n`;
      message += `🎯 Capabilities: ${bot.capabilities.join(', ')}\n\n`;
    });

    const totalEarnings = userBots.reduce((sum, bot) => sum + (bot.totalEarnings || 0), 0);
    message += `💰 <b>Total Earnings:</b> ${totalEarnings.toFixed(4)} STX`;

    this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' });
  }

  handleHelp(msg) {
    const helpMsg = `🐝 <b>Swarm Commands</b>

<b>Create &amp; Earn:</b>
/create_bot - Create your AI agent (earns STX) 🤖
/my_bots - Your bots and earnings 💰

<b>Wallet:</b>
/wallet - View your wallet 👛
/backup - Backup recovery phrase 🔐

<b>Marketplace:</b>
/bots - All available bots 🏪
/leaderboard - Top earning bots 🏆

<b>Other:</b>
/help - Show this message
/cancel - Cancel bot creation

<b>Just ask questions!</b>
• "What's the Bitcoin price?"
• "Weather in Tokyo?"
• "Calculate 15 * 23"

Your bot will be hired automatically! 🚀`;

    this.bot.sendMessage(msg.chat.id, helpMsg, { parse_mode: 'HTML' });
  }

  async handleMyWallet(msg) {
    const userId = msg.from.id;
    let wallet = this.walletService.getWallet(userId);

    if (!wallet) {
      wallet = await this.walletService.generateWallet(userId);
    }

    const message = `👛 <b>Your Wallet</b>

<b>Address:</b> <code>${wallet.address}</code>
<b>Created:</b> ${new Date(wallet.createdAt).toLocaleDateString()}

<b>How to add testnet funds:</b>
1. Go to Stacks testnet faucet
2. Paste your address
3. Get free testnet STX!

<b>Backup:</b> Use /backup to save your recovery phrase`;

    this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' });
  }

  handleExportWallet(msg) {
    const userId = msg.from.id;
    const mnemonic = this.walletService.exportMnemonic(userId);

    if (!mnemonic) {
      this.bot.sendMessage(msg.chat.id, '❌ No wallet found. Use /start to generate one.');
      return;
    }

    const message = `🔐 <b>Recovery Phrase (24 words)</b>

<code>${mnemonic}</code>

⚠️ <b>SAVE THIS SECURELY:</b>
• This is your ONLY way to recover your wallet
• Never share with anyone
• Write it down on paper

<b>Delete this message after saving!</b>`;

    this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' });
  }

  async handleQuery(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userQuery = msg.text;

    // Rate limit: 30 queries per hour
    if (!this.rateLimiter.checkLimit(userId, 'query', 30)) {
      const mins = this.rateLimiter.getRemainingTime(userId, 'query');
      this.bot.sendMessage(chatId, `⏱️ Query limit reached (30/hour). Try again in ${mins} min.`);
      return;
    }

    Logger.info('Received query', { chatId, query: userQuery });

    const thinkingMsg = await this.bot.sendMessage(
      chatId,
      '🤖 AI Orchestrator analyzing your request...'
    );

    try {
      const availableBots = db.getAllBots();

      if (availableBots.length === 0) {
        this.bot.editMessageText(
          "❌ No bots available yet. System initializing...",
          { chat_id: chatId, message_id: thinkingMsg.message_id }
        );
        return;
      }

      Logger.info('Orchestrator routing via Gemini AI...', { query: userQuery, botCount: availableBots.length });

      // Route with 15s timeout
      const routingPlan = await Promise.race([
        this.gemini.routeQuery(userQuery, availableBots),
        new Promise((_, reject) => setTimeout(() => reject(new Error('LLM timeout - try again')), 15000))
      ]);
      Logger.info('Orchestrator decision', { plan: routingPlan });

      // If orchestrator can't understand or no suitable bots
      if (!routingPlan || routingPlan.length === 0) {
        this.bot.editMessageText(
          "🤔 I analyzed your request but couldn't determine which specialist bots to hire.\n\nTry asking:\n• \"What's the Bitcoin price?\"\n• \"Weather in Paris?\"\n• \"Translate hello to Spanish\"\n• \"Calculate 15 * 23\"\n\nOr use /bots to see all available specialists.",
          { chat_id: chatId, message_id: thinkingMsg.message_id }
        );
        return;
      }

      // Convert orchestrator's routing plan to executable tasks
      const tasks = routingPlan.map(plan => {
        const bot = availableBots.find(b => b.id === plan.botId);
        if (!bot) {
          Logger.error('Orchestrator selected unknown bot', { botId: plan.botId });
          return null;
        }
        return {
          capability: bot.capabilities[0],
          bot: bot,
          data: plan.params,
          reasoning: plan.reasoning
        };
      }).filter(t => t !== null);

      if (tasks.length === 0) {
        this.bot.editMessageText(
          "❌ Orchestrator couldn't match your request to available bots.\n\nUse /bots to see what I can help with.",
          { chat_id: chatId, message_id: thinkingMsg.message_id }
        );
        return;
      }

      // Execute orchestrator's plan
      Logger.info('Executing orchestrator plan', { taskCount: tasks.length });
      await this.executeTasksAndRespond(tasks, chatId, thinkingMsg.message_id);

    } catch (error) {
      Logger.error('Orchestrator failed', error);
      this.bot.editMessageText(
        `❌ AI Orchestrator error: ${error.message}\n\nPlease try again or use /bots to see available specialists.`,
        { chat_id: chatId, message_id: thinkingMsg.message_id }
      );
    }
  }

  /**
   * Execute tasks and format response (extracted for reuse)
   */
  async executeTasksAndRespond(tasks, chatId, messageId) {
    // Show which bots we're hiring
    let statusMsg = '🐝 <b>Hiring bots:</b>\n\n';
    tasks.forEach((task, i) => {
      statusMsg += `${i + 1}. ${task.bot.name} - ${task.bot.pricePerCall} STX\n`;
    });
    statusMsg += `\n💰 Total: ${tasks.reduce((sum, t) => sum + t.bot.pricePerCall, 0)} STX`;

    this.bot.editMessageText(statusMsg, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'HTML'
    });

    // Execute tasks with escrow
    const results = await this.executeTasks(tasks, chatId, messageId);

    // Format final response
    let finalMsg = '✅ <b>Results:</b>\n\n';
    results.forEach((result, i) => {
      finalMsg += `${i + 1}. ${this.formatResult(result)}\n\n`;
    });
    finalMsg += `\n💸 Paid ${tasks.reduce((sum, t) => sum + t.bot.pricePerCall, 0)} STX to ${tasks.length} bots`;

    this.bot.editMessageText(finalMsg, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'HTML'
    });
  }

  async executeTasks(tasks, chatId, messageId) {
    const results = [];

    for (const task of tasks) {
      const taskId = uuidv4();

      try {
        // Step 1: Execute the task (API call - fast)
        await this.bot.editMessageText(
          `⚙️ ${task.bot.name} is working...`,
          { chat_id: chatId, message_id: messageId }
        ).catch(() => {});

        Logger.info('Executing task', { botId: task.bot.id, taskId, data: task.data });
        const result = await BotRegistry.executeTask(task.bot.id, task.data);
        Logger.info('Task result', { botId: task.bot.id, success: result.success, error: result.error });

        if (result.success) {
          // Step 2: Process payment on blockchain (async, don't block response)
          await this.bot.editMessageText(
            `💰 ${task.bot.name} delivered! Processing ${task.bot.pricePerCall} STX payment...`,
            { chat_id: chatId, message_id: messageId }
          ).catch(() => {});

          // Lock and immediately release escrow in background
          this.processPayment(taskId, task).catch(err => {
            Logger.error('Background payment failed', { taskId, error: err.message });
          });

          // Update leaderboard immediately (in-memory)
          db.addEarnings(task.bot.id, task.bot.pricePerCall);

          results.push({
            botName: task.bot.name,
            result: result.result,
            paid: task.bot.pricePerCall
          });
        } else {
          Logger.error('Task failed', { taskId, error: result.error });
          results.push({
            botName: task.bot.name,
            error: result.error,
            refunded: true
          });
        }

      } catch (error) {
        Logger.error('Task execution failed', { error: error.message, stack: error.stack });
        results.push({
          botName: task.bot.name,
          error: error.message,
          refunded: true
        });
      }
    }

    return results;
  }

  /**
   * Process blockchain payment in background (don't block user response)
   */
  async processPayment(taskId, task) {
    try {
      // Lock payment in escrow
      const escrowTx = await this.stacksUtils.sendToEscrow(
        task.bot.pricePerCall,
        taskId,
        task.bot.walletAddress
      );
      Logger.success('Escrow locked', { taskId, txId: escrowTx.txId });

      db.createEscrow(taskId, {
        botId: task.bot.id,
        amount: task.bot.pricePerCall,
        txId: escrowTx.txId
      });

      // Release escrow to specialist bot
      const releaseTx = await this.stacksUtils.releaseEscrow(taskId);
      Logger.success('Escrow released', { taskId, txId: releaseTx });
      db.releaseEscrow(taskId);
    } catch (error) {
      Logger.error('Payment processing error', { taskId, error: error.message });
    }
  }

  formatResult(result) {
    if (result.error) {
      return `❌ ${result.botName}: Failed (${result.refunded ? 'refunded' : 'error'})`;
    }

    const data = result.result;

    // Format based on result type
    if (data.price !== undefined) {
      const change = data.change24h ? ` (${data.change24h > 0 ? '+' : ''}${data.change24h.toFixed(2)}%)` : '';
      return `💰 ${(data.symbol || '').toUpperCase()}: $${data.price.toLocaleString()}${change}`;
    }
    if (data.temperature !== undefined) {
      return `🌤️ ${data.city}: ${data.temperature}°C, ${data.condition}`;
    }
    if (data.translated) {
      return `🌍 "${data.original}" → "${data.translated}" (${data.from}→${data.to})`;
    }
    if (data.result !== undefined) {
      return `🧮 Result: ${data.result}`;
    }
    if (data.tvl !== undefined) {
      return `📊 ${data.protocol}: TVL ${data.tvlFormatted || '$' + data.tvl.toLocaleString()}`;
    }
    if (data.joke) {
      return `😄 ${data.joke}`;
    }
    if (data.capital) {
      return `🌍 ${data.country}: Capital ${data.capital}, Pop. ${data.population?.toLocaleString()}, ${data.region}`;
    }

    // Generic JSON fallback
    const keys = Object.keys(data).filter(k => k !== 'timestamp' && k !== 'source');
    if (keys.length <= 4) {
      return keys.map(k => `${k}: ${JSON.stringify(data[k])}`).join(', ');
    }
    return JSON.stringify(data, null, 1);
  }

  start() {
    Logger.info('Main bot started');
    console.log('🐝 Swarm Main Bot is running...');
  }
}

module.exports = MainBot;
