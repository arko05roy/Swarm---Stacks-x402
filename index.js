require('dotenv').config();
const MainBot = require('./src/bots/mainBot');
const { initializeSpecialistBots } = require('./src/bots/specialistBots');
const db = require('./src/database/db');
const Logger = require('./src/utils/logger');
const { seedDemoData } = require('./scripts/demo-data-seeder');

// Validate environment variables
const requiredEnv = [
  'TELEGRAM_BOT_TOKEN',
  'STACKS_WALLET_SEED',
  'STACKS_ADDRESS',
  'ESCROW_CONTRACT_ADDRESS'
];

const missingEnv = requiredEnv.filter(env => !process.env[env]);

if (missingEnv.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnv.forEach(env => console.error(`   - ${env}`));
  console.error('\nPlease create a .env file with all required variables.');
  process.exit(1);
}

async function start() {
  // Initialize specialist bots (system bots with live handlers)
  Logger.info('Initializing specialist bots...');
  initializeSpecialistBots();

  // Load persisted data (earnings, leaderboard, user-created bots)
  // persistence.js restores all bots from disk automatically
  db.loadFromDisk();

  // Seed demo data if marketplace is empty (only system bots present)
  const allBots = db.getAllBots();
  if (allBots.length <= 5) {
    Logger.info('Marketplace empty, seeding demo data...');
    await seedDemoData();
  }

  // Start main bot
  Logger.info('Starting main orchestrator bot...');
  const mainBot = new MainBot(process.env.TELEGRAM_BOT_TOKEN);
  mainBot.start();

  Logger.success('🐝 Swarm is fully operational!');
  Logger.info('Commands: /start, /bots, /leaderboard, /create_agent');
}

start().catch(err => {
  console.error('❌ Failed to start:', err);
  process.exit(1);
});

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
