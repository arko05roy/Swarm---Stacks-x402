/**
 * Initialize Core Agents
 *
 * Registers all core agents with the registry on startup
 */

const { registry } = require('./AgentRegistry');
const { createCryptoPriceAgent } = require('../agents/core/crypto-price.agent');
const { createWeatherAgent } = require('../agents/core/weather.agent');
const { createDeFiTVLAgent } = require('../agents/core/defi-tvl.agent');
const { createTranslationAgent } = require('../agents/core/translation.agent');
const { createCountryInfoAgent } = require('../agents/core/country-info.agent');
const { createJokeAgent } = require('../agents/core/joke.agent');

/**
 * Initialize all core agents
 */
function initializeCoreAgents() {
  console.log('🚀 Initializing core agents...');

  try {
    // 1. Crypto Price Agent
    const cryptoAgent = createCryptoPriceAgent({
      id: 'crypto-price-core',
      name: 'Crypto Price Oracle',
      pricePerCall: 0.001
    });
    registry.register(cryptoAgent, 'system');

    // 2. Weather Agent
    const weatherAgent = createWeatherAgent({
      id: 'weather-core',
      name: 'Weather Reporter',
      pricePerCall: 0.001
    });
    registry.register(weatherAgent, 'system');

    // 3. DeFi TVL Agent
    const defiAgent = createDeFiTVLAgent({
      id: 'defi-tvl-core',
      name: 'DeFi TVL Tracker',
      pricePerCall: 0.002
    });
    registry.register(defiAgent, 'system');

    // 4. Translation Agent
    const translationAgent = createTranslationAgent({
      id: 'translation-core',
      name: 'Translation Service',
      pricePerCall: 0.001
    });
    registry.register(translationAgent, 'system');

    // 5. Country Info Agent
    const countryAgent = createCountryInfoAgent({
      id: 'country-info-core',
      name: 'Country Info Bot',
      pricePerCall: 0.001
    });
    registry.register(countryAgent, 'system');

    // 6. Joke Agent
    const jokeAgent = createJokeAgent({
      id: 'joke-core',
      name: 'Joke Generator',
      pricePerCall: 0.001
    });
    registry.register(jokeAgent, 'system');

    const stats = registry.getStats();
    console.log(`✅ Initialized ${stats.totalAgents} core agents`);
    console.log(`📊 Total capabilities: ${stats.capabilities.length}`);

    return true;

  } catch (error) {
    console.error('❌ Error initializing core agents:', error);
    return false;
  }
}

/**
 * Test all core agents
 */
async function testCoreAgents() {
  console.log('\n🧪 Testing core agents...\n');

  const tests = [
    { agentId: 'crypto-price-core', input: { coin: 'bitcoin' } },
    { agentId: 'weather-core', input: { city: 'London' } },
    { agentId: 'defi-tvl-core', input: { protocol: 'stacks' } },
    { agentId: 'translation-core', input: { text: 'hello', to: 'es' } },
    { agentId: 'country-info-core', input: { country: 'Japan' } },
    { agentId: 'joke-core', input: {} }
  ];

  for (const test of tests) {
    try {
      const agent = registry.get(test.agentId);
      if (!agent) {
        console.log(`❌ Agent ${test.agentId} not found`);
        continue;
      }

      console.log(`Testing ${agent.manifest.name}...`);
      const result = await agent.execute(test.input);

      if (result.success) {
        console.log(`✅ ${agent.manifest.name} - OK`);
      } else {
        console.log(`❌ ${agent.manifest.name} - Failed: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ ${test.agentId} - Error: ${error.message}`);
    }
  }

  console.log('\n✅ Agent testing complete\n');
}

module.exports = { initializeCoreAgents, testCoreAgents };
