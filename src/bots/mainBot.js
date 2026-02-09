const TelegramBot = require('node-telegram-bot-api');
const BotRegistry = require('./botRegistry');
const db = require('../database/db');
const StacksUtils = require('../utils/stacksUtils');
const Logger = require('../utils/logger');
const GeminiService = require('../services/geminiService');
const WalletService = require('../services/walletService');
const BotCreationService = require('../services/botCreationService');
const RateLimiter = require('../services/rateLimiter');
const EnhancedBotCommands = require('./enhancedBotCommands');
const { initializeCoreAgents } = require('../core/initAgents');
const { v4: uuidv4 } = require('uuid');

class MainBot {
  constructor(token) {
    this.bot = new TelegramBot(token, { polling: true });
    this.stacksUtils = new StacksUtils();
    this.gemini = new GeminiService();
    this.walletService = new WalletService();
    this.botCreation = new BotCreationService(this.walletService);
    this.rateLimiter = new RateLimiter();

    // Initialize modular agent framework (Strategic Pivot #2)
    initializeCoreAgents();
    this.enhanced = new EnhancedBotCommands(this.bot, this.walletService);

    this.setupCommands();
  }

  setupCommands() {
    // Setup enhanced commands (SDK, marketplace, pool)
    this.enhanced.setupCommands();

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

    // Withdraw bot earnings command
    this.bot.onText(/\/withdraw_earnings ([^\s]+)/, (msg, match) => {
      this.handleWithdrawEarnings(msg, match[1]);
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

    // Handle general messages (bot creation, enhanced sessions, OR queries)
    this.bot.on('message', async (msg) => {
      // Skip if command
      if (msg.text && msg.text.startsWith('/')) return;

      // Check if user is in enhanced SDK session
      if (this.enhanced.isInSession(msg.from.id)) {
        const handled = await this.enhanced.handleSessionMessage(
          msg.from.id,
          msg.text,
          msg.chat.id
        );
        if (handled) return;
      }

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

<b>Build AI agent economies with Bitcoin micropayments.</b>

👛 <b>Your Wallet:</b> <code>${wallet.address}</code>

<b>How it works:</b>
1. Create agents with /create_agent (4 methods!)
2. Chain agents together into workflows
3. Earn yield by providing liquidity to agents

<b>Try asking:</b>
• "What's the price of Bitcoin?"
• "Weather in Paris?"
• "Translate hello to Spanish"

<b>Agent Commands:</b>
/create_agent - Create with SDK (4 methods) 🤖
/create_bot - Quick template creation 🎨
/my_agents - Your agents + analytics 📊
/browse_store - Agent marketplace 🏪

<b>Bot Investment:</b>
/top_investments - Best opportunities 📈
/invest [botId] [amt] - Invest in bot 💰
/my_investments - Your portfolio 💼
/withdraw_all [botId] - Withdraw everything 💸
/bot_stats [botId] - Bot performance 📊
/withdraw_earnings [botId] - Withdraw bot creator earnings 💰

<b>DeFi Pool:</b>
/pool - Liquidity pool overview 💰
/deposit [amt] - Earn yield from agent work 📈
/pool_stats - Pool analytics 📊

<b>More:</b>
/wallet - Your wallet 👛
/leaderboard - Top earners 🏆
/help - All commands`;

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
      const earnings = db.leaderboard.get(bot.id) || 0;
      message += `<b>${index + 1}. ${bot.name}</b> (ID: ${bot.id})\n`;
      message += `💰 Price: ${bot.pricePerCall} STX/call\n`;
      message += `📊 Earned: ${earnings.toFixed(4)} STX\n`;
      message += `✅ Tasks: ${bot.tasksCompleted || 0}\n`;
      message += `🎯 Capabilities: ${bot.capabilities.join(', ')}\n`;
      if (earnings > 0) {
        message += `💸 <code>/withdraw_earnings ${bot.id}</code>\n`;
      }
      message += `\n`;
    });

    const totalEarnings = userBots.reduce((sum, bot) => sum + (db.leaderboard.get(bot.id) || 0), 0);
    message += `💰 <b>Total Earnings:</b> ${totalEarnings.toFixed(4)} STX\n\n`;
    message += `<b>To withdraw:</b> /withdraw_earnings [botId]`;

    this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' });
  }

  async handleWithdrawEarnings(msg, botId) {
    const userId = msg.from.id;

    // Verify bot exists and belongs to user
    const bot = db.getBot(botId);
    if (!bot) {
      this.bot.sendMessage(msg.chat.id, '❌ Bot not found. Use /my_bots to see your bots.');
      return;
    }

    if (bot.createdBy !== userId) {
      this.bot.sendMessage(msg.chat.id, '❌ You can only withdraw earnings from your own bots.');
      return;
    }

    // Get earnings from leaderboard
    const earnings = db.leaderboard.get(botId) || 0;
    if (earnings === 0) {
      this.bot.sendMessage(msg.chat.id, `💰 No earnings to withdraw for ${bot.name}.\n\nYour bot hasn't earned anything yet.`);
      return;
    }

    const thinkingMsg = await this.bot.sendMessage(
      msg.chat.id,
      `💸 Withdrawing ${earnings.toFixed(4)} STX earnings...`
    );

    try {
      // Get creator's wallet address
      const creatorWallet = this.walletService.getWallet(userId);
      if (!creatorWallet) {
        await this.bot.editMessageText(
          '❌ No wallet found. Use /start to create a wallet first.',
          { chat_id: msg.chat.id, message_id: thinkingMsg.message_id }
        );
        return;
      }

      // Transfer STX to creator's wallet
      const txOptions = {
        recipient: creatorWallet.address,
        amount: this.stacksUtils.stxToMicroStx(earnings),
        senderKey: this.stacksUtils.senderKey,
        network: this.stacksUtils.network,
        anchorMode: require('@stacks/transactions').AnchorMode.Any
      };

      const { makeSTXTokenTransfer, broadcastTransaction } = require('@stacks/transactions');
      const transaction = await makeSTXTokenTransfer(txOptions);
      const broadcastResponse = await broadcastTransaction({
        transaction,
        network: this.stacksUtils.network
      });

      // Reset leaderboard after successful transfer
      db.leaderboard.set(botId, 0);
      db.saveNow();

      Logger.success('Bot earnings withdrawn', {
        botId,
        userId,
        amount: earnings,
        txId: broadcastResponse.txid
      });

      const explorerLink = `https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=testnet`;
      await this.bot.editMessageText(
        `✅ Withdrawal successful!\n\n` +
        `Bot: <b>${bot.name}</b>\n` +
        `Amount: ${earnings.toFixed(4)} STX\n` +
        `Wallet: <code>${creatorWallet.address}</code>\n\n` +
        `Transaction: <a href="${explorerLink}">${broadcastResponse.txid.slice(0, 16)}...</a>\n\n` +
        `🎉 Funds sent to your wallet!`,
        {
          chat_id: msg.chat.id,
          message_id: thinkingMsg.message_id,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        }
      );

    } catch (error) {
      Logger.error('Withdrawal failed', { error: error.message });
      await this.bot.editMessageText(
        `❌ Withdrawal failed: ${error.message}\n\nPlease try again later.`,
        { chat_id: msg.chat.id, message_id: thinkingMsg.message_id }
      );
    }
  }

  handleHelp(msg) {
    const helpMsg = `🐝 <b>Swarm - AI Agent Economy</b>

<b>Create Agents:</b>
/create_agent - SDK creation (4 methods) 🤖
/create_bot - Quick template creation 🎨
/my_agents - Your agents + analytics 📊

<b>Agent Marketplace:</b>
/browse_store - Discover agents 🏪
/search [query] - Search agents 🔍
/bots - All available bots 🤖
/leaderboard - Top earners 🏆

<b>Bot Investment (NEW!):</b>
/top_investments - Best investment opportunities 📈
/invest [botId] [amount] - Invest in bot 💰
/my_investments - Your portfolio 💼
/withdraw_investment [botId] [amt] - Partial withdrawal 💸
/withdraw_all [botId] - Withdraw everything 💰
/bot_stats [botId] - Bot performance stats 📊

<b>Liquidity Pool (DeFi):</b>
/pool - Pool overview + your position 💰
/deposit [amount] - Add liquidity (earn yield) 📈
/withdraw [amount] - Remove liquidity 💸
/pool_stats - Detailed pool analytics 📊

<b>Wallet:</b>
/wallet - View your wallet 👛
/backup - Recovery phrase 🔐

<b>Other:</b>
/help - This message
/cancel - Cancel creation

<b>Just ask questions!</b>
Agents are hired automatically via AI orchestrator.

<b>Built on x402-stacks micropayments 🚀</b>`;

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

          // Lock and immediately release escrow in background, then notify with tx hash
          this.processPayment(taskId, task, chatId).catch(err => {
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
  async processPayment(taskId, task, chatId) {
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

      // Notify user with tx hashes
      if (chatId) {
        const explorerBase = 'https://explorer.hiro.so/txid';
        this.bot.sendMessage(chatId,
          `🔗 <b>Payment confirmed on-chain</b>\n\n` +
          `Bot: ${task.bot.name}\n` +
          `Amount: ${task.bot.pricePerCall} STX\n\n` +
          `Escrow Lock: <a href="${explorerBase}/${escrowTx.txId}?chain=testnet">${escrowTx.txId.slice(0, 12)}...</a>\n` +
          `Escrow Release: <a href="${explorerBase}/${releaseTx}?chain=testnet">${releaseTx.slice(0, 12)}...</a>`,
          { parse_mode: 'HTML', disable_web_page_preview: true }
        ).catch(() => {});
      }
    } catch (error) {
      Logger.error('Payment processing error', { taskId, error: error.message });
      if (chatId) {
        this.bot.sendMessage(chatId,
          `⚠️ Payment processing failed for ${task.bot.name}: ${error.message}`,
        ).catch(() => {});
      }
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
