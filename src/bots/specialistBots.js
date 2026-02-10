const BotRegistry = require('./botRegistry');
const fetch = require('node-fetch');

/**
 * Price Oracle Bot - Returns crypto prices
 */
const PriceBot = {
  id: 'price-oracle-bot',
  name: '💰 Price Oracle',
  description: 'Real-time cryptocurrency prices',
  capabilities: ['crypto-price'],
  pricePerCall: 0.01,
  walletAddress: process.env.PRICE_BOT_WALLET,

  handler: async (taskData) => {
    const { symbol } = taskData;

    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd`,
        {
          headers: {
            'User-Agent': 'SwarmBot/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API returned ${response.status}`);
      }

      const data = await response.json();

      const price = data[symbol.toLowerCase()]?.usd;
      if (!price) {
        throw new Error(`Price not found for ${symbol}. Try: bitcoin, ethereum, solana`);
      }

      return {
        symbol,
        price,
        currency: 'USD',
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`Price fetch failed: ${error.message}`);
    }
  }
};

/**
 * Calculator Bot - Performs calculations
 */
const CalculatorBot = {
  id: 'calculator-bot',
  name: '🧮 Calculator',
  description: 'Perform mathematical calculations',
  capabilities: ['calculate', 'math'],
  pricePerCall: 0.001,
  walletAddress: process.env.CALC_BOT_WALLET,

  handler: async (taskData) => {
    const { expression } = taskData;

    const sanitized = expression.replace(/[^0-9+\-*/(). ]/g, '');
    const result = eval(sanitized);

    return {
      expression,
      result,
      timestamp: Date.now()
    };
  }
};

// Register specialist bots
function initializeSpecialistBots() {
  BotRegistry.registerSpecialistBot(PriceBot);
  BotRegistry.registerSpecialistBot(CalculatorBot);

  console.log('✅ Registered 2 specialist bots');
}

module.exports = {
  PriceBot,
  CalculatorBot,
  initializeSpecialistBots
};
