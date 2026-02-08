require('dotenv').config();
const { initializeSpecialistBots } = require('../src/bots/specialistBots');
const BotRegistry = require('../src/bots/botRegistry');

// Initialize bots
initializeSpecialistBots();

async function testWeatherBot() {
  console.log('🧪 Testing Weather Bot...\n');

  const testCases = [
    { city: 'Tokyo' },
    { city: 'London' },
    { city: 'Paris' }
  ];

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.city}`);

    try {
      const result = await BotRegistry.executeTask('weather-bot', testCase);

      if (result.success) {
        console.log('✅ SUCCESS:', result.result);
      } else {
        console.log('❌ FAILED:', result.error);
      }
    } catch (error) {
      console.log('❌ ERROR:', error.message);
    }

    console.log('');
  }
}

testWeatherBot().catch(console.error);
