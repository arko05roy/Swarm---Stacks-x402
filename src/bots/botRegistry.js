const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

class BotRegistry {
  /**
   * Register a specialist bot in the marketplace
   */
  static registerSpecialistBot(config) {
    const botId = config.id || `bot-${uuidv4()}`;

    db.registerBot(botId, {
      ...config,
      id: botId
    });

    return botId;
  }

  /**
   * Find bots that can handle a specific capability
   */
  static findBotsForCapability(capability) {
    return db.getBotsByCapability(capability);
  }

  /**
   * Get best bot for capability (lowest price + highest rating)
   */
  static getBestBot(capability) {
    const bots = this.findBotsForCapability(capability);

    if (bots.length === 0) return null;

    // Sort by: rating desc, then price asc
    return bots.sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return a.pricePerCall - b.pricePerCall;
    })[0];
  }

  /**
   * Execute task with a bot
   */
  static async executeTask(botId, taskData) {
    const bot = db.getBot(botId);
    if (!bot) throw new Error(`Bot ${botId} not found`);

    try {
      // 10 second timeout for bot execution
      const result = await Promise.race([
        bot.handler(taskData),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Bot execution timeout (10s)')), 10000))
      ]);
      return {
        success: true,
        result,
        botId
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        botId
      };
    }
  }
}

module.exports = BotRegistry;
