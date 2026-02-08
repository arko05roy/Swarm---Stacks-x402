require('dotenv').config();
const BotCreationService = require('../src/services/botCreationService');
const { initializeSpecialistBots } = require('../src/bots/specialistBots');
const db = require('../src/database/db');

// Initialize system bots
initializeSpecialistBots();

async function testBotCreation() {
  console.log('🧪 Testing Bot Creation Service\n');

  const botCreation = new BotCreationService();
  const testUserId = 999999;

  // Step 1: Start session
  console.log('=== Step 1: Start Session ===');
  const startResponse = botCreation.startSession(testUserId);
  console.log(startResponse);
  console.log('\n');

  // Step 2: Provide description
  console.log('=== Step 2: Provide Description ===');
  const description = 'Get current time in any timezone';
  console.log(`User input: "${description}"`);
  const descResponse = await botCreation.handleMessage(testUserId, description);
  console.log(descResponse);
  console.log('\n');

  // Step 3: Provide name
  console.log('=== Step 3: Provide Name ===');
  const name = 'Timezone Oracle';
  console.log(`User input: "${name}"`);
  const nameResponse = await botCreation.handleMessage(testUserId, name);
  console.log(nameResponse);
  console.log('\n');

  // Step 4: Provide price
  console.log('=== Step 4: Provide Price ===');
  const price = '0.005';
  console.log(`User input: "${price}"`);
  const priceResponse = await botCreation.handleMessage(testUserId, price);
  console.log(priceResponse);
  console.log('\n');

  // Step 5: Provide wallet
  console.log('=== Step 5: Provide Wallet ===');
  const wallet = 'ST2Q9TEZVYPTJ1Q2H5H2G9QREV21KS90YQ0SZH113'; // Valid testnet wallet
  console.log(`User input: "${wallet}"`);
  const walletResponse = await botCreation.handleMessage(testUserId, wallet);
  console.log(walletResponse);
  console.log('\n');

  // Step 6: Check if bot was registered
  console.log('=== Step 6: Verify Bot Registration ===');
  const BotRegistry = require('../src/bots/botRegistry');
  const allBots = db.getAllBots();
  const userBot = allBots.find(b => b.createdBy === testUserId);

  if (userBot) {
    console.log('✅ Bot successfully registered!');
    console.log(`   ID: ${userBot.id}`);
    console.log(`   Name: ${userBot.name}`);
    console.log(`   Capabilities: ${userBot.capabilities.join(', ')}`);
    console.log(`   Price: ${userBot.pricePerCall} STX`);
    console.log(`   Wallet: ${userBot.walletAddress}`);
    console.log('\n');

    // Test the bot
    console.log('=== Step 7: Test Bot Execution ===');
    const testResult = await BotRegistry.executeTask(userBot.id, { timezone: 'America/New_York' });

    if (testResult.success) {
      console.log('✅ Bot execution successful!');
      console.log('   Result:', testResult.result);
    } else {
      console.log('❌ Bot execution failed:', testResult.error);
    }
  } else {
    console.log('❌ Bot was not registered');
  }

  console.log('\n✅ Bot creation test complete!');
}

testBotCreation().catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
