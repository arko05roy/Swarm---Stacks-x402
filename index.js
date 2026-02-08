require('dotenv').config();
const MainBot = require('./src/bots/mainBot');
const { initializeSpecialistBots } = require('./src/bots/specialistBots');
const BotRegistry = require('./src/bots/botRegistry');
const db = require('./src/database/db');
const { BOT_TEMPLATES } = require('./src/services/botTemplates');
const Logger = require('./src/utils/logger');

// Validate environment variables
const requiredEnv = [
  'TELEGRAM_BOT_TOKEN',
  'STACKS_WALLET_SEED',
  'STACKS_ADDRESS',
  'ESCROW_CONTRACT_ADDRESS',
  'PRICE_BOT_WALLET',
  'WEATHER_BOT_WALLET',
  'TRANSLATION_BOT_WALLET',
  'CALC_BOT_WALLET'
];

const missingEnv = requiredEnv.filter(env => !process.env[env]);

if (missingEnv.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnv.forEach(env => console.error(`   - ${env}`));
  console.error('\nPlease create a .env file with all required variables.');
  process.exit(1);
}

// Initialize specialist bots (system bots)
Logger.info('Initializing specialist bots...');
initializeSpecialistBots();

// Load persisted data (earnings, leaderboard, user-created bots)
const savedData = db.loadFromDisk();

if (savedData && savedData.bots) {
  let restoredCount = 0;

  for (const [botId, botData] of savedData.bots) {
    // Skip system bots (already registered above)
    if (!botData.createdBy) continue;

    // Re-create handler from template
    const template = BOT_TEMPLATES[botData.template];
    if (!template) {
      Logger.error('Unknown template for saved bot', { botId, template: botData.template });
      continue;
    }

    const userParams = botData.templateParams || {};
    const handler = async (taskData) => {
      return await template.handler(taskData, userParams);
    };

    // Re-register with handler
    BotRegistry.registerSpecialistBot({
      ...botData,
      handler
    });

    restoredCount++;
  }

  if (restoredCount > 0) {
    Logger.success(`Restored ${restoredCount} user-created bots from disk`);
  }
}

// Start main bot
Logger.info('Starting main orchestrator bot...');
const mainBot = new MainBot(process.env.TELEGRAM_BOT_TOKEN);
mainBot.start();

Logger.success('🐝 Swarm is fully operational!');
Logger.info('Commands: /start, /bots, /leaderboard');

// Graceful shutdown - save data
process.on('SIGINT', () => {
  Logger.info('Shutting down, saving data...');
  db.saveNow();
  process.exit(0);
});

process.on('SIGTERM', () => {
  Logger.info('Shutting down, saving data...');
  db.saveNow();
  process.exit(0);
});
