/**
 * Demo Data Seeder v3.0
 *
 * Creates realistic bot marketplace data for compelling demo videos.
 * Populates the bot database with diverse agents, transaction history,
 * earnings leaderboard, and active ecosystem metrics.
 *
 * Run before recording: node scripts/demo-data-seeder.js
 */

const db = require('../src/database/db');
const BotRegistry = require('../src/bots/botRegistry');

/**
 * Generate a demo Stacks address (for demo purposes only)
 */
function generateDemoStacksAddress(seed) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let address = 'ST';
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  for (let i = 0; i < 38; i++) {
    const index = (hash + i * 7) % chars.length;
    address += chars[index];
  }

  return address;
}

// Realistic creator personas (crypto/DeFi themed)
const DEMO_CREATORS = [
  'defi_whale',
  'crypto_analyst',
  'yield_farmer',
  'blockchain_dev',
  'stacks_builder',
  'web3_enthusiast',
  'btc_maxi',
  'defi_researcher',
  'nft_collector',
  'dao_contributor',
  'protocol_dev',
  'security_auditor',
  'data_scientist',
  'quant_trader',
  'ecosystem_builder'
];

// Core system bots (seeded directly — no dependency on specialistBots.js)
const CORE_SYSTEM_BOTS = [
  {
    id: 'price-oracle-bot',
    name: '💰 Price Oracle',
    description: 'Real-time cryptocurrency prices from CoinGecko',
    capabilities: ['crypto-price'],
    pricePerCall: 0.01,
    callsRange: [10000, 15000],
    rating: 5.0,
    handler: async () => ({ status: 'demo' })
  },
  {
    id: 'defi-tvl-bot',
    name: '📊 DeFi TVL Tracker',
    description: 'Track total value locked across DeFi protocols',
    capabilities: ['defi', 'tvl'],
    pricePerCall: 0.008,
    callsRange: [5000, 9000],
    rating: 4.9,
    handler: async () => ({ status: 'demo' })
  },
  {
    id: 'blockchain-explorer-bot',
    name: '🔍 Blockchain Explorer',
    description: 'Look up transactions, addresses, and blocks on Stacks',
    capabilities: ['explorer', 'blockchain'],
    pricePerCall: 0.005,
    callsRange: [8000, 12000],
    rating: 4.8,
    handler: async () => ({ status: 'demo' })
  },
  {
    id: 'fee-estimator-bot',
    name: '⛽ Gas Fee Estimator',
    description: 'Estimate transaction fees across chains',
    capabilities: ['gas', 'fees'],
    pricePerCall: 0.003,
    callsRange: [6000, 10000],
    rating: 4.9,
    handler: async () => ({ status: 'demo' })
  }
];

// Premium user-created bot templates for vibrant marketplace
const BOT_TEMPLATES = [
  {
    name: '🔍 Stacks Protocol Analyzer',
    description: 'Deep analysis of Stacks blockchain protocols, metrics, and activity',
    capabilities: ['stacks', 'protocol', 'analysis', 'metrics'],
    pricePerCall: 0.0075,
    creator: 'blockchain_dev',
    callsRange: [500, 2000],
    rating: 4.8,
    earningsMultiplier: 1.2
  },
  {
    name: '🖼️ NFT Floor Price Oracle',
    description: 'Track NFT collection floor prices, volume, and market trends',
    capabilities: ['nft', 'floor-price', 'collections', 'marketplace'],
    pricePerCall: 0.006,
    creator: 'nft_collector',
    callsRange: [1200, 4500],
    rating: 4.9,
    earningsMultiplier: 2.5
  },
  {
    name: '🗳️ DAO Governance Monitor',
    description: 'Monitor and summarize DAO governance proposals across chains',
    capabilities: ['dao', 'governance', 'proposals', 'voting'],
    pricePerCall: 0.008,
    creator: 'dao_contributor',
    callsRange: [300, 1500],
    rating: 4.7,
    earningsMultiplier: 1.0
  },
  {
    name: '💧 Cross-DEX Liquidity Finder',
    description: 'Find optimal liquidity pools across multiple DEXs',
    capabilities: ['dex', 'liquidity', 'pools', 'yield'],
    pricePerCall: 0.005,
    creator: 'yield_farmer',
    callsRange: [2000, 6000],
    rating: 5.0,
    earningsMultiplier: 3.0
  },
  {
    name: '🚀 Token Launch Detector',
    description: 'Detect new token launches, rug pull risks, and contract analysis',
    capabilities: ['token', 'launch', 'security', 'analysis'],
    pricePerCall: 0.009,
    creator: 'crypto_analyst',
    callsRange: [800, 2500],
    rating: 4.8,
    earningsMultiplier: 1.8
  },
  {
    name: '🐋 Whale Wallet Tracker',
    description: 'Track large wallet movements and on-chain whale activity',
    capabilities: ['whale', 'wallet', 'tracking', 'alerts'],
    pricePerCall: 0.007,
    creator: 'defi_whale',
    callsRange: [1500, 4000],
    rating: 4.9,
    earningsMultiplier: 2.2
  },
  {
    name: '🛡️ Smart Contract Auditor',
    description: 'Automated security checks for Clarity smart contracts',
    capabilities: ['security', 'audit', 'clarity', 'contracts'],
    pricePerCall: 0.015,
    creator: 'security_auditor',
    callsRange: [200, 800],
    rating: 5.0,
    earningsMultiplier: 1.5
  },
  {
    name: '📰 DeFi News Aggregator',
    description: 'Real-time DeFi news from Twitter, Discord, and news sources',
    capabilities: ['news', 'defi', 'aggregator', 'alerts'],
    pricePerCall: 0.003,
    creator: 'defi_researcher',
    callsRange: [3000, 8000],
    rating: 4.6,
    earningsMultiplier: 2.0
  },
  {
    name: '📊 Impermanent Loss Calculator',
    description: 'Calculate IL risk for LP positions with historical simulations',
    capabilities: ['calculator', 'il', 'lp', 'risk'],
    pricePerCall: 0.004,
    creator: 'quant_trader',
    callsRange: [1000, 3500],
    rating: 4.8,
    earningsMultiplier: 1.3
  },
  {
    name: '₿ Bitcoin Correlation Tracker',
    description: 'Track altcoin correlation with Bitcoin price movements',
    capabilities: ['bitcoin', 'correlation', 'analysis', 'trading'],
    pricePerCall: 0.006,
    creator: 'btc_maxi',
    callsRange: [600, 2000],
    rating: 4.7,
    earningsMultiplier: 1.1
  },
  {
    name: '⚡ Gas Optimization Analyzer',
    description: 'Analyze and suggest gas optimizations for smart contracts',
    capabilities: ['gas', 'optimization', 'efficiency', 'analysis'],
    pricePerCall: 0.012,
    creator: 'protocol_dev',
    callsRange: [150, 600],
    rating: 4.9,
    earningsMultiplier: 1.4
  },
  {
    name: '🌐 Multi-Chain Bridge Monitor',
    description: 'Monitor bridge activity, fees, and security across chains',
    capabilities: ['bridge', 'cross-chain', 'monitoring', 'security'],
    pricePerCall: 0.008,
    creator: 'ecosystem_builder',
    callsRange: [400, 1800],
    rating: 4.8,
    earningsMultiplier: 1.2
  },
  {
    name: '📈 Yield Farming APY Tracker',
    description: 'Track real-time APY across DeFi protocols with risk scores',
    capabilities: ['yield', 'farming', 'apy', 'tracking'],
    pricePerCall: 0.0055,
    creator: 'yield_farmer',
    callsRange: [2500, 7000],
    rating: 5.0,
    earningsMultiplier: 3.5
  },
  {
    name: '🔐 Multi-Sig Wallet Manager',
    description: 'Manage and monitor multi-signature wallet operations',
    capabilities: ['multisig', 'wallet', 'security', 'management'],
    pricePerCall: 0.01,
    creator: 'stacks_builder',
    callsRange: [250, 1000],
    rating: 4.9,
    earningsMultiplier: 1.0
  },
  {
    name: '📉 Portfolio Risk Analyzer',
    description: 'Analyze portfolio risk with VaR, volatility, and correlation metrics',
    capabilities: ['portfolio', 'risk', 'analysis', 'metrics'],
    pricePerCall: 0.011,
    creator: 'data_scientist',
    callsRange: [350, 1400],
    rating: 4.8,
    earningsMultiplier: 1.3
  }
];

/**
 * Generate random number in range
 */
function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random timestamp within last N days
 */
function randomTimestampLastNDays(days) {
  const now = Date.now();
  const daysInMs = days * 24 * 60 * 60 * 1000;
  return now - Math.floor(Math.random() * daysInMs);
}

/**
 * Generate realistic transaction history for a bot
 */
function generateTransactionHistory(botId, totalCalls, pricePerCall) {
  const transactions = [];
  const now = Date.now();

  for (let i = 0; i < Math.min(totalCalls, 50); i++) {
    const daysAgo = Math.floor(Math.pow(Math.random(), 2) * 60);
    const timestamp = now - (daysAgo * 24 * 60 * 60 * 1000);

    transactions.push({
      taskId: `task-${Date.now()}-${randomInRange(1000, 9999)}`,
      botId,
      amount: pricePerCall,
      status: Math.random() > 0.05 ? 'completed' : 'failed',
      timestamp
    });
  }

  return transactions;
}

/**
 * Create a user bot with realistic metadata
 */
function createUserBot(template) {
  const botId = `${template.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${randomInRange(1000, 9999)}`;
  const calls = randomInRange(template.callsRange[0], template.callsRange[1]);
  const totalEarnings = calls * template.pricePerCall * template.earningsMultiplier;
  const successRate = randomInRange(92, 100);

  const bot = {
    id: botId,
    name: template.name,
    description: template.description,
    capabilities: template.capabilities,
    pricePerCall: template.pricePerCall,
    walletAddress: generateDemoStacksAddress(template.creator),
    creator: template.creator,

    totalEarnings: parseFloat(totalEarnings.toFixed(4)),
    tasksCompleted: calls,
    rating: template.rating,
    successRate,
    registeredAt: randomTimestampLastNDays(90),
    lastActive: randomTimestampLastNDays(7),

    handler: async (taskData) => {
      return { status: 'demo', data: taskData };
    }
  };

  return bot;
}

/**
 * Main seeder function
 */
async function seedDemoData() {
  console.log('🌱 Seeding Swarm Bot Marketplace with demo data...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Step 1: Seed core system bots with realistic activity
  console.log('📦 Seeding core system bots...\n');

  for (const coreBot of CORE_SYSTEM_BOTS) {
    const calls = randomInRange(coreBot.callsRange[0], coreBot.callsRange[1]);
    const totalEarnings = parseFloat((calls * coreBot.pricePerCall).toFixed(4));

    db.registerBot(coreBot.id, {
      ...coreBot,
      totalEarnings,
      tasksCompleted: calls,
      successRate: randomInRange(94, 100),
      registeredAt: randomTimestampLastNDays(120),
      lastActive: randomTimestampLastNDays(2)
    });

    db.leaderboard.set(coreBot.id, totalEarnings);

    const transactions = generateTransactionHistory(coreBot.id, calls, coreBot.pricePerCall);
    transactions.forEach(tx => db.taskHistory.set(tx.taskId, tx));

    console.log(`  ✓ ${coreBot.name}: ${calls.toLocaleString()} calls, ${totalEarnings.toFixed(3)} STX earned, ${coreBot.rating}★`);
  }

  console.log(`\n✅ Seeded ${CORE_SYSTEM_BOTS.length} core bots\n`);

  // Step 2: Create vibrant user-generated bots
  console.log('👥 Creating user-generated specialist bots...\n');

  const createdBots = [];

  for (const template of BOT_TEMPLATES) {
    try {
      await new Promise(resolve => setTimeout(resolve, 5));

      const bot = createUserBot(template);

      db.registerBot(bot.id, bot);
      db.leaderboard.set(bot.id, bot.totalEarnings);

      const transactions = generateTransactionHistory(
        bot.id,
        bot.tasksCompleted,
        bot.pricePerCall
      );

      transactions.forEach(tx => {
        db.taskHistory.set(tx.taskId, tx);
      });

      createdBots.push(bot);

      const earningsFormatted = bot.totalEarnings.toFixed(3);
      const callsFormatted = bot.tasksCompleted.toLocaleString();

      console.log(`  ✓ ${bot.name}`);
      console.log(`    by @${bot.creator}`);
      console.log(`    ${callsFormatted} calls • ${earningsFormatted} STX earned • ${bot.rating}★`);
      console.log(`    Price: ${bot.pricePerCall} STX/call • Success: ${bot.successRate}%\n`);

    } catch (error) {
      console.log(`  ✗ Failed to create ${template.name}: ${error.message}\n`);
    }
  }

  // Step 3: Save everything to disk
  console.log('💾 Persisting data to disk...');
  db.saveNow();
  console.log('✅ Data saved to data/db.json\n');

  // Step 4: Generate impressive statistics
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 MARKETPLACE STATISTICS\n');

  const allBots = db.getAllBots();
  const totalBots = allBots.length;
  const totalCalls = allBots.reduce((sum, bot) => sum + (bot.tasksCompleted || 0), 0);
  const totalVolume = allBots.reduce((sum, bot) => sum + (bot.totalEarnings || 0), 0);
  const avgRating = allBots.reduce((sum, bot) => sum + (bot.rating || 0), 0) / totalBots;
  const uniqueCapabilities = new Set(allBots.flatMap(bot => bot.capabilities || []));

  console.log(`  🤖 Total Bots: ${totalBots}`);
  console.log(`  📞 Total Calls: ${totalCalls.toLocaleString()}`);
  console.log(`  💰 Total Volume: ${totalVolume.toFixed(2)} STX`);
  console.log(`  ⭐ Average Rating: ${avgRating.toFixed(2)}/5.0`);
  console.log(`  🎯 Unique Capabilities: ${uniqueCapabilities.size}`);
  console.log(`  👥 Active Creators: ${new Set(allBots.map(b => b.creator).filter(Boolean)).size}`);

  // Step 5: Show leaderboard
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🏆 TOP 10 EARNING BOTS\n');

  const leaderboard = db.getLeaderboard(10);
  leaderboard.forEach((entry, i) => {
    const bot = entry.bot;
    const rank = ['🥇', '🥈', '🥉'][i] || `${i + 1}.`;
    console.log(`  ${rank} ${bot.name}`);
    console.log(`     ${entry.earnings.toFixed(3)} STX • ${bot.tasksCompleted?.toLocaleString() || 0} calls • ${bot.rating}★\n`);
  });

  // Step 6: Show newest bots
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🆕 NEWEST BOTS (Last 5)\n');

  const newest = allBots
    .sort((a, b) => (b.registeredAt || 0) - (a.registeredAt || 0))
    .slice(0, 5);

  newest.forEach((bot, i) => {
    const daysAgo = Math.floor((Date.now() - (bot.registeredAt || Date.now())) / (1000 * 60 * 60 * 24));
    console.log(`  ${i + 1}. ${bot.name}`);
    console.log(`     Registered ${daysAgo} days ago by @${bot.creator || 'system'}\n`);
  });

  // Step 7: Show demo tips
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🎬 DEMO RECORDING TIPS\n');
  console.log('  1. Run /start to see the welcome screen');
  console.log('  2. Run /browse_store to show vibrant marketplace');
  console.log('  3. Run /leaderboard to show top earning bots');
  console.log('  4. Run /create_agent to build a new agent');
  console.log('  5. Ask "What\'s the price of Bitcoin?" to demo queries');
  console.log('  6. Run /pool to show liquidity pool');
  console.log('  7. Run /my_agents to show agent analytics');
  console.log('\n🎥 Ready for video recording! Good luck!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run seeder
if (require.main === module) {
  seedDemoData()
    .then(() => {
      console.log('✅ Demo data seeding completed successfully!\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error seeding demo data:', error);
      console.error(error.stack);
      process.exit(1);
    });
}

module.exports = { seedDemoData };
