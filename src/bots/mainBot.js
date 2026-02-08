const TelegramBot = require('node-telegram-bot-api');
const BotRegistry = require('./botRegistry');
const db = require('../database/db');
const StacksUtils = require('../utils/stacksUtils');
const Logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class MainBot {
  constructor(token) {
    this.bot = new TelegramBot(token, { polling: true });
    this.stacksUtils = new StacksUtils();
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

    // Handle general queries
    this.bot.on('message', (msg) => {
      if (msg.text && !msg.text.startsWith('/')) {
        this.handleQuery(msg);
      }
    });
  }

  handleStart(msg) {
    const welcomeMsg = `🐝 Welcome to Swarm!

I'm an AI that hires other AI bots to answer your questions.

How it works:
1. Ask me anything
2. I find specialist bots to help
3. I pay them in Bitcoin (STX)
4. You get your answer

Try me:
• "What's the price of Bitcoin?"
• "Weather in London?"
• "Translate 'hello' to Spanish"
• "Calculate 15 * 23 + 7"

Commands:
/bots - See all specialist bots
/leaderboard - Top earning bots

Let's go! 🚀`;

    this.bot.sendMessage(msg.chat.id, welcomeMsg);
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

    let message = '🤖 Available Specialist Bots\n\n';
    allBots.forEach(bot => {
      message += `${bot.name}\n`;
      message += `${bot.description}\n`;
      message += `💰 ${bot.pricePerCall} STX per call\n`;
      message += `⭐ ${bot.rating}/5.0 rating\n`;
      message += `📊 ${bot.tasksCompleted} tasks completed\n\n`;
    });

    this.bot.sendMessage(msg.chat.id, message);
  }

  async handleQuery(msg) {
    const chatId = msg.chat.id;
    const userQuery = msg.text;

    Logger.info('Received query', { chatId, query: userQuery });

    // Send "thinking" message
    const thinkingMsg = await this.bot.sendMessage(
      chatId,
      '🤔 Analyzing your query...'
    );

    try {
      // Parse query and determine needed capabilities
      const tasks = this.parseQuery(userQuery);

      if (tasks.length === 0) {
        this.bot.editMessageText(
          "❌ I couldn't understand that. Try asking about prices, weather, translation, or calculations.",
          { chat_id: chatId, message_id: thinkingMsg.message_id }
        );
        return;
      }

      // Show which bots we're hiring
      let statusMsg = '🐝 *Hiring bots:*\n\n';
      tasks.forEach((task, i) => {
        statusMsg += `${i + 1}. ${task.bot.name} - ${task.bot.pricePerCall} STX\n`;
      });
      statusMsg += `\n💰 Total: ${tasks.reduce((sum, t) => sum + t.bot.pricePerCall, 0)} STX`;

      this.bot.editMessageText(statusMsg, {
        chat_id: chatId,
        message_id: thinkingMsg.message_id,
        parse_mode: 'Markdown'
      });

      // Execute tasks with escrow
      const results = await this.executeTasks(tasks, chatId, thinkingMsg.message_id);

      // Format final response
      let finalMsg = '✅ *Results:*\n\n';
      results.forEach((result, i) => {
        finalMsg += `${i + 1}. ${this.formatResult(result)}\n\n`;
      });
      finalMsg += `\n💸 Paid ${tasks.reduce((sum, t) => sum + t.bot.pricePerCall, 0)} STX to ${tasks.length} bots`;

      this.bot.editMessageText(finalMsg, {
        chat_id: chatId,
        message_id: thinkingMsg.message_id,
        parse_mode: 'Markdown'
      });

    } catch (error) {
      Logger.error('Query failed', error);
      this.bot.editMessageText(
        `❌ Something went wrong: ${error.message}`,
        { chat_id: chatId, message_id: thinkingMsg.message_id }
      );
    }
  }

  parseQuery(query) {
    const tasks = [];
    const lowerQuery = query.toLowerCase();

    // Price check - try "price of X" first, then "X price"
    const fillerWords = ['the', 'a', 'an', 'is', 'of', 'for', 'me', 'my', 'tell', 'get', 'show', 'and', 'also', 'whats', 'what'];
    let priceSymbol = null;

    // Try "price of [the] X" pattern first (most reliable)
    const priceOfMatch = lowerQuery.match(/price (?:of )?(?:the )?(?:a )?(\w+)/);
    if (priceOfMatch && !fillerWords.includes(priceOfMatch[1])) {
      priceSymbol = priceOfMatch[1];
    }

    // Fallback: try "X price" pattern
    if (!priceSymbol) {
      const xPriceMatch = lowerQuery.match(/(\w+) price/);
      if (xPriceMatch && !fillerWords.includes(xPriceMatch[1])) {
        priceSymbol = xPriceMatch[1];
      }
    }

    if (priceSymbol) {
      const bot = BotRegistry.getBestBot('crypto-price');
      if (bot) {
        tasks.push({
          capability: 'crypto-price',
          bot,
          data: { symbol: priceSymbol }
        });
      }
    }

    // Weather check
    const weatherMatch = lowerQuery.match(/weather (?:in |at )?(\w+)/);
    if (weatherMatch) {
      const city = weatherMatch[1];
      const bot = BotRegistry.getBestBot('weather');
      if (bot) {
        tasks.push({
          capability: 'weather',
          bot,
          data: { city }
        });
      }
    }

    // Translation - with or without quotes
    const translateMatch = lowerQuery.match(/translate ['""]?(.+?)['""]? to (\w+)/);
    if (translateMatch) {
      const text = translateMatch[1].trim();
      const to = translateMatch[2];
      const bot = BotRegistry.getBestBot('translate');
      if (bot) {
        tasks.push({
          capability: 'translate',
          bot,
          data: { text, to }
        });
      }
    }

    // Math calculation
    const mathMatch = lowerQuery.match(/calculate (.+)|what is (.+)/);
    if (mathMatch) {
      const expression = mathMatch[1] || mathMatch[2];
      // Check if expression contains numbers and operators
      if (/[0-9+\-*/]/.test(expression)) {
        const bot = BotRegistry.getBestBot('calculate');
        if (bot) {
          tasks.push({
            capability: 'calculate',
            bot,
            data: { expression }
          });
        }
      }
    }

    return tasks;
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
    if (data.price) {
      return `💰 ${data.symbol.toUpperCase()}: $${data.price.toLocaleString()}`;
    }
    if (data.temperature) {
      return `🌤️ ${data.city}: ${data.temperature}°C, ${data.condition}`;
    }
    if (data.translated) {
      return `🌍 Translation: "${data.translated}"`;
    }
    if (data.result !== undefined) {
      return `🧮 Result: ${data.result}`;
    }

    return JSON.stringify(data);
  }

  start() {
    Logger.info('Main bot started');
    console.log('🐝 Swarm Main Bot is running...');
  }
}

module.exports = MainBot;
