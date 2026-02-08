const BotRegistry = require('./botRegistry');

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
    const { symbol } = taskData; // e.g., "BTC", "ETH"

    // Fetch real price from API (CoinGecko free tier)
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd`
    );
    const data = await response.json();

    const price = data[symbol.toLowerCase()]?.usd;
    if (!price) throw new Error(`Price not found for ${symbol}`);

    return {
      symbol,
      price,
      currency: 'USD',
      timestamp: Date.now()
    };
  }
};

/**
 * Weather Bot - Returns weather data
 */
const WeatherBot = {
  id: 'weather-bot',
  name: '🌤️ Weather Oracle',
  description: 'Current weather conditions',
  capabilities: ['weather'],
  pricePerCall: 0.005,
  walletAddress: process.env.WEATHER_BOT_WALLET,

  handler: async (taskData) => {
    const { city } = taskData;

    // Use free weather API (wttr.in)
    const response = await fetch(`https://wttr.in/${city}?format=j1`);
    const data = await response.json();

    const current = data.current_condition[0];

    return {
      city,
      temperature: current.temp_C,
      condition: current.weatherDesc[0].value,
      humidity: current.humidity,
      timestamp: Date.now()
    };
  }
};

/**
 * Translation Bot - Translates text
 */
const TranslationBot = {
  id: 'translation-bot',
  name: '🌍 Translator',
  description: 'Translate text between languages',
  capabilities: ['translate'],
  pricePerCall: 0.008,
  walletAddress: process.env.TRANSLATION_BOT_WALLET,

  handler: async (taskData) => {
    const { text, from, to } = taskData;

    const sourceLang = from || 'en';
    const targetLang = to || 'es';

    // Use MyMemory free translation API
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
    );

    const data = await response.json();

    if (!data.responseData || !data.responseData.translatedText) {
      throw new Error(`Translation failed for "${text}"`);
    }

    return {
      original: text,
      translated: data.responseData.translatedText,
      from: sourceLang,
      to: targetLang
    };
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
  pricePerCall: 0.001, // Cheapest bot
  walletAddress: process.env.CALC_BOT_WALLET,

  handler: async (taskData) => {
    const { expression } = taskData;

    // Safe eval (only allow math operations)
    const sanitized = expression.replace(/[^0-9+\-*/(). ]/g, '');
    const result = eval(sanitized);

    return {
      expression,
      result,
      timestamp: Date.now()
    };
  }
};

// Register all specialist bots
function initializeSpecialistBots() {
  BotRegistry.registerSpecialistBot(PriceBot);
  BotRegistry.registerSpecialistBot(WeatherBot);
  BotRegistry.registerSpecialistBot(TranslationBot);
  BotRegistry.registerSpecialistBot(CalculatorBot);

  console.log('✅ Registered 4 specialist bots');
}

module.exports = {
  PriceBot,
  WeatherBot,
  TranslationBot,
  CalculatorBot,
  initializeSpecialistBots
};
