/**
 * Demo Data Seeder
 * 
 * Creates realistic-looking user agents and transaction history
 * for demo/video purposes. Makes the marketplace look vibrant and active.
 * 
 * Run 24 hours before demo recording: node scripts/demo-data-seeder.js
 */

const { registry } = require('../src/core/AgentRegistry');
const createAgent = require('../src/sdk/createAgent');
const { initializeCoreAgents } = require('../src/core/initAgents');

// Realistic usernames (crypto/DeFi themed)
const DEMO_USERS = [
  'defi_whale',
  'crypto_analyst',
  'yield_farmer',
  'blockchain_dev',
  'stacks_builder',
  'web3_enthusiast',
  'btc_maxi',
  'defi_researcher',
  'nft_collector',
  'dao_contributor'
];

// User agent templates with realistic configurations
const USER_AGENT_TEMPLATES = [
  {
    name: 'Stacks Protocol Analyzer',
    description: 'Deep analysis of Stacks blockchain protocols and metrics',
    capabilities: ['stacks', 'protocol', 'analysis'],
    pricePerCall: 0.0075,
    creator: 'blockchain_dev',
    callsRange: [50, 200],
    rating: 4.7
  },
  {
    name: 'NFT Floor Tracker',
    description: 'Track NFT collection floor prices and volume',
    capabilities: ['nft', 'floor-price', 'collections'],
    pricePerCall: 0.006,
    creator: 'nft_collector',
    callsRange: [120, 450],
    rating: 4.9
  },
  {
    name: 'DAO Proposal Monitor',
    description: 'Monitor and summarize DAO governance proposals',
    capabilities: ['dao', 'governance', 'proposals'],
    pricePerCall: 0.008,
    creator: 'dao_contributor',
    callsRange: [30, 150],
    rating: 4.6
  },
  {
    name: 'Liquidity Pool Finder',
    description: 'Find best liquidity pools across DEXs',
    capabilities: ['dex', 'liquidity', 'pools'],
    pricePerCall: 0.005,
    creator: 'yield_farmer',
    callsRange: [200, 600],
    rating: 5.0
  },
  {
    name: 'Token Launch Detector',
    description: 'Detect new token launches and rug pull risks',
    capabilities: ['token', 'launch', 'security'],
    pricePerCall: 0.009,
    creator: 'crypto_analyst',
    callsRange: [80, 250],
    rating: 4.8
  },
  {
    name: 'Whale Wallet Tracker',
    description: 'Track large wallet movements and transactions',
    capabilities: ['whale', 'wallet', 'tracking'],
    pricePerCall: 0.007,
    creator: 'defi_whale',
    callsRange: [150, 400],
    rating: 4.9
  },
  {
    name: 'Smart Contract Auditor',
    description: 'Basic security checks for Clarity smart contracts',
    capabilities: ['security', 'audit', 'clarity'],
    pricePerCall: 0.015,
    creator: 'stacks_builder',
    callsRange: [20, 80],
    rating: 5.0
  },
  {
    name: 'DeFi News Aggregator',
    description: 'Aggregate DeFi news from multiple sources',
    capabilities: ['news', 'defi', 'aggregator'],
    pricePerCall: 0.003,
    creator: 'defi_researcher',
    callsRange: [300, 800],
    rating: 4.5
  },
  {
    name: 'Impermanent Loss Calculator',
    description: 'Calculate impermanent loss for LP positions',
    capabilities: ['calculator', 'il', 'lp'],
    pricePerCall: 0.004,
    creator: 'yield_farmer',
    callsRange: [100, 350],
    rating: 4.7
  },
  {
    name: 'Bitcoin Correlation Tracker',
    description: 'Track altcoin correlation with Bitcoin',
    capabilities: ['bitcoin', 'correlation', 'analysis'],
    pricePerCall: 0.006,
    creator: 'btc_maxi',
    callsRange: [60, 200],
    rating: 4.8
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
 * Create a user-created agent with realistic metadata
 */
function createUserAgent(template) {
  const calls = randomInRange(template.callsRange[0], template.callsRange[1]);
  const successRate = randomInRange(92, 100);
  const avgLatency = randomInRange(800, 3000);
  
  const agent = createAgent.custom({
    name: template.name,
    description: template.description,
    author: template.creator,
    capabilities: template.capabilities,
    pricePerCall: template.pricePerCall,
    
    execute: async (input) => {
      // Dummy function - won't be called in demo
      return { status: 'demo agent', input };
    }
  });

  // Simulate usage history
  agent.manifest.metadata.calls = calls;
  agent.manifest.metadata.totalEarnings = calls * template.pricePerCall;
  agent.manifest.metadata.successRate = successRate;
  agent.manifest.metadata.avgLatency = avgLatency;
  agent.manifest.metadata.reputation = Math.min(100, template.rating * 20);
  agent.manifest.metadata.createdAt = randomTimestampLastNDays(30);
  agent.manifest.metadata.updatedAt = randomTimestampLastNDays(7);

  return agent;
}

/**
 * Seed demo data
 */
async function seedDemoData() {
  console.log('🌱 Seeding demo data for marketplace...\n');

  // Initialize core agents first
  console.log('📦 Loading core DeFi agents...');
  initializeCoreAgents();

  // Add realistic usage to core agents
  const coreAgents = [
    { id: 'crypto-price-core', calls: randomInRange(1000, 1500), rating: 4.9 },
    { id: 'defi-tvl-core', calls: randomInRange(700, 1100), rating: 4.8 },
    { id: 'token-analytics-core', calls: randomInRange(100, 300), rating: 4.7 },
    { id: 'yield-optimizer-core', calls: randomInRange(500, 900), rating: 5.0 },
    { id: 'blockchain-explorer-core', calls: randomInRange(60, 150), rating: 4.9 },
    { id: 'fee-estimator-core', calls: randomInRange(40, 120), rating: 5.0 },
    { id: 'portfolio-tracker-core', calls: randomInRange(180, 400), rating: 4.8 },
    { id: 'contract-deployer-core', calls: randomInRange(15, 50), rating: 4.6 }
  ];

  for (const coreAgent of coreAgents) {
    const agent = registry.get(coreAgent.id);
    if (agent) {
      agent.manifest.metadata.calls = coreAgent.calls;
      agent.manifest.metadata.totalEarnings = coreAgent.calls * agent.manifest.pricing.pricePerCall;
      agent.manifest.metadata.successRate = randomInRange(94, 100);
      agent.manifest.metadata.avgLatency = randomInRange(600, 2000);
      agent.manifest.metadata.reputation = Math.min(100, coreAgent.rating * 20);
      agent.manifest.metadata.createdAt = randomTimestampLastNDays(60);
      agent.manifest.metadata.updatedAt = randomTimestampLastNDays(3);
      
      console.log(`  ✓ ${agent.manifest.name}: ${coreAgent.calls} calls, ${coreAgent.rating}★`);
    }
  }

  console.log('\n👥 Creating user-generated agents...');

  // Create user agents
  let createdCount = 0;
  for (const template of USER_AGENT_TEMPLATES) {
    try {
      // Add tiny delay to ensure unique timestamps for agent IDs
      await new Promise(resolve => setTimeout(resolve, 2));
      
      const agent = createUserAgent(template);
      registry.register(agent, template.creator);
      
      const calls = agent.manifest.metadata.calls;
      const earnings = agent.manifest.metadata.totalEarnings.toFixed(3);
      const rating = (agent.manifest.metadata.reputation / 20).toFixed(1);
      
      console.log(`  ✓ ${agent.manifest.name}`);
      console.log(`    by @${template.creator} • ${calls} calls • ${earnings} STX earned • ${rating}★`);
      
      createdCount++;
    } catch (error) {
      console.log(`  ✗ Failed to create ${template.name}: ${error.message}`);
    }
  }

  console.log('\n📊 Demo data summary:');
  const stats = registry.getStats();
  console.log(`  • Total agents: ${stats.totalAgents}`);
  console.log(`  • Core agents: 8`);
  console.log(`  • User agents: ${createdCount}`);
  console.log(`  • Total capabilities: ${stats.capabilities.length}`);

  // Calculate total volume
  const allAgents = registry.list();
  const totalCalls = allAgents.reduce((sum, agent) => sum + (agent.manifest?.metadata?.calls || 0), 0);
  const totalVolume = allAgents.reduce((sum, agent) => sum + (agent.manifest?.metadata?.totalEarnings || 0), 0);

  console.log(`  • Total calls (simulated): ${totalCalls.toLocaleString()}`);
  console.log(`  • Total volume: ${totalVolume.toFixed(2)} STX`);

  console.log('\n✅ Demo data seeded successfully!');
  console.log('\n💡 Tips for demo:');
  console.log('   1. Use /browse_store to show vibrant marketplace');
  console.log('   2. Agent IDs look organic (not sequential)');
  console.log('   3. Call counts and ratings are realistic');
  console.log('   4. Created timestamps spread over 30 days');
  console.log('   5. Ready for video recording!\n');

  // Show top agents
  console.log('🔥 Top agents by earnings:');
  const topEarning = registry.getTopEarning(5);
  topEarning.forEach((agent, i) => {
    const earnings = agent.metadata?.totalEarnings || 0;
    console.log(`   ${i + 1}. ${agent.name} - ${earnings.toFixed(3)} STX`);
  });

  console.log('\n🆕 Newest agents:');
  const newest = registry.getNewest(5);
  newest.forEach((agent, i) => {
    const createdAt = agent.metadata?.createdAt || Date.now();
    const daysAgo = Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24));
    console.log(`   ${i + 1}. ${agent.name} - ${daysAgo} days ago`);
  });
}

// Run seeder
if (require.main === module) {
  seedDemoData().catch(error => {
    console.error('❌ Error seeding demo data:', error);
    process.exit(1);
  });
}

module.exports = { seedDemoData };
