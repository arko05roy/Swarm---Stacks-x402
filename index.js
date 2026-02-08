require('dotenv').config();
const MainBot = require('./src/bots/mainBot');
const { initializeSpecialistBots } = require('./src/bots/specialistBots');
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
  console.error('See .env.example for template.');
  process.exit(1);
}

// Initialize specialist bots
Logger.info('Initializing specialist bots...');
initializeSpecialistBots();

// Start main bot
Logger.info('Starting main orchestrator bot...');
const mainBot = new MainBot(process.env.TELEGRAM_BOT_TOKEN);
mainBot.start();

Logger.success('🐝 Swarm is fully operational!');
Logger.info('Commands: /start, /bots, /leaderboard');
