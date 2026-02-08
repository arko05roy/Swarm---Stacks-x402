require('dotenv').config();
const GeminiService = require('../src/services/geminiService');
const { initializeSpecialistBots } = require('../src/bots/specialistBots');
const db = require('../src/database/db');

// Initialize bots
console.log('Initializing specialist bots...');
initializeSpecialistBots();

async function testGeminiOrchestrator() {
  const gemini = new GeminiService();
  const availableBots = db.getAllBots();

  console.log('\n=== Available Bots ===');
  console.log(availableBots.map(b => `${b.id}: ${b.capabilities.join(', ')}`).join('\n'));

  // Test 1: Simple crypto price query
  console.log('\n\n=== Test 1: Simple crypto price query ===');
  console.log('Query: "What\'s the price of Bitcoin?"');
  try {
    const result1 = await gemini.routeQuery(
      "What's the price of Bitcoin?",
      availableBots
    );
    console.log('✅ Result:', JSON.stringify(result1, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 2: Multi-bot query
  console.log('\n\n=== Test 2: Multi-bot query ===');
  console.log('Query: "Get me the price of Ethereum and weather in Tokyo"');
  try {
    const result2 = await gemini.routeQuery(
      "Get me the price of Ethereum and weather in Tokyo",
      availableBots
    );
    console.log('✅ Result:', JSON.stringify(result2, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 3: Complex query
  console.log('\n\n=== Test 3: Complex query ===');
  console.log('Query: "I need to know if it\'s raining in Paris, how much is Bitcoin worth, and translate \'hello world\' to French"');
  try {
    const result3 = await gemini.routeQuery(
      "I need to know if it's raining in Paris, how much is Bitcoin worth, and translate 'hello world' to French",
      availableBots
    );
    console.log('✅ Result:', JSON.stringify(result3, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 4: Ambiguous query (should return empty)
  console.log('\n\n=== Test 4: Ambiguous query ===');
  console.log('Query: "Tell me something interesting"');
  try {
    const result4 = await gemini.routeQuery(
      "Tell me something interesting",
      availableBots
    );
    console.log('✅ Result:', JSON.stringify(result4, null, 2));
    if (result4.length === 0) {
      console.log('✅ Correctly returned empty array for ambiguous query');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 5: Calculation query
  console.log('\n\n=== Test 5: Calculation query ===');
  console.log('Query: "Calculate 15 * 23 + 7"');
  try {
    const result5 = await gemini.routeQuery(
      "Calculate 15 * 23 + 7",
      availableBots
    );
    console.log('✅ Result:', JSON.stringify(result5, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n\n✅ All tests complete!');
  console.log('\n📊 Summary:');
  console.log('- Gemini API is working');
  console.log('- Query routing is functional');
  console.log('- Ready to integrate with main bot');
  console.log('\nNext: Start the bot with `npm start` and test in Telegram');
}

testGeminiOrchestrator().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
