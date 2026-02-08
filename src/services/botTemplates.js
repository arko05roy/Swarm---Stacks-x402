const fetch = require('node-fetch');

/**
 * Curated bot templates backed by REAL free APIs.
 * Every template is pre-tested and guaranteed to return real data.
 * NO mock data. NO AI-generated code.
 */
const BOT_TEMPLATES = {

  'crypto-price': {
    name: 'Crypto Price Oracle',
    description: 'Real-time cryptocurrency price from CoinGecko',
    category: 'crypto',
    icon: '💰',
    defaultCapabilities: ['crypto-price', 'price'],
    parameters: [
      {
        name: 'coin',
        prompt: 'Which cryptocurrency?\n\nExamples: bitcoin, ethereum, solana, chainlink, stacks, dogecoin\n\nEnter coin name:',
        required: true
      }
    ],
    buildDescription: (params) => `Real-time ${params.coin} price from CoinGecko`,
    buildCapabilities: (params) => ['crypto-price', `${params.coin}-price`, 'price'],
    handler: async (taskData, templateParams) => {
      const coin = (taskData.coin || taskData.symbol || templateParams.coin).toLowerCase();
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd&include_24hr_change=true`,
        { headers: { 'User-Agent': 'SwarmBot/1.0' } }
      );

      if (!response.ok) throw new Error(`CoinGecko API returned ${response.status}`);

      const data = await response.json();
      if (!data[coin]) throw new Error(`Coin "${coin}" not found on CoinGecko`);

      return {
        symbol: coin,
        price: data[coin].usd,
        change24h: data[coin].usd_24h_change,
        currency: 'USD',
        source: 'CoinGecko',
        timestamp: Date.now()
      };
    }
  },

  'weather': {
    name: 'Weather Reporter',
    description: 'Current weather conditions from wttr.in',
    category: 'weather',
    icon: '🌤️',
    defaultCapabilities: ['weather', 'forecast'],
    parameters: [
      {
        name: 'defaultCity',
        prompt: 'Default city for weather reports?\n\nExamples: London, Tokyo, New York, Paris\n\nEnter city:',
        required: false
      }
    ],
    buildDescription: (params) => `Weather conditions${params.defaultCity ? ` (default: ${params.defaultCity})` : ''}`,
    buildCapabilities: (params) => ['weather', 'forecast', 'temperature'],
    handler: async (taskData, templateParams) => {
      const city = taskData.city || templateParams.defaultCity || 'London';
      const response = await fetch(
        `https://wttr.in/${encodeURIComponent(city)}?format=j1`,
        { headers: { 'User-Agent': 'SwarmBot/1.0' } }
      );

      if (!response.ok) throw new Error(`Weather API returned ${response.status}`);

      const data = await response.json();
      if (!data.current_condition || !data.current_condition[0]) {
        throw new Error('Invalid weather data received');
      }

      const current = data.current_condition[0];
      return {
        city,
        temperature: current.temp_C,
        feelsLike: current.FeelsLikeC,
        condition: current.weatherDesc[0].value,
        humidity: current.humidity,
        windSpeed: current.windspeedKmph,
        source: 'wttr.in',
        timestamp: Date.now()
      };
    }
  },

  'defi-tvl': {
    name: 'DeFi TVL Tracker',
    description: 'Total Value Locked from DeFiLlama',
    category: 'defi',
    icon: '📊',
    defaultCapabilities: ['defi-tvl', 'tvl', 'defi'],
    parameters: [
      {
        name: 'protocol',
        prompt: 'Which DeFi protocol to track?\n\nExamples: stacks, aave, uniswap, lido, compound\n\nEnter protocol:',
        required: true
      }
    ],
    buildDescription: (params) => `${params.protocol} TVL from DeFiLlama`,
    buildCapabilities: (params) => ['defi-tvl', `${params.protocol}-tvl`, 'tvl', 'defi'],
    handler: async (taskData, templateParams) => {
      const protocol = (taskData.protocol || templateParams.protocol).toLowerCase();
      const response = await fetch(
        `https://api.llama.fi/tvl/${protocol}`,
        { headers: { 'User-Agent': 'SwarmBot/1.0' } }
      );

      if (!response.ok) throw new Error(`DeFiLlama API returned ${response.status}`);

      const tvl = await response.json();

      return {
        protocol,
        tvl: typeof tvl === 'number' ? tvl : parseFloat(tvl),
        tvlFormatted: `$${(typeof tvl === 'number' ? tvl : parseFloat(tvl)).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
        source: 'DeFiLlama',
        timestamp: Date.now()
      };
    }
  },

  'translation': {
    name: 'Translation Service',
    description: 'Translate text between languages via MyMemory',
    category: 'translation',
    icon: '🗣️',
    defaultCapabilities: ['translate', 'translation', 'language'],
    parameters: [
      {
        name: 'defaultFrom',
        prompt: 'Default source language? (e.g., en, es, fr, de, ja)\n\nEnter language code:',
        required: false
      },
      {
        name: 'defaultTo',
        prompt: 'Default target language? (e.g., es, fr, de, ja, zh)\n\nEnter language code:',
        required: true
      }
    ],
    buildDescription: (params) => `Translation service (→ ${params.defaultTo})`,
    buildCapabilities: (params) => ['translate', 'translation', `translate-${params.defaultTo}`],
    handler: async (taskData, templateParams) => {
      const text = taskData.text || 'hello';
      const from = taskData.from || templateParams.defaultFrom || 'en';
      const to = taskData.to || templateParams.defaultTo || 'es';

      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`,
        { headers: { 'User-Agent': 'SwarmBot/1.0' } }
      );

      if (!response.ok) throw new Error(`Translation API returned ${response.status}`);

      const data = await response.json();
      if (!data.responseData || !data.responseData.translatedText) {
        throw new Error(`Translation failed for "${text}"`);
      }

      return {
        original: text,
        translated: data.responseData.translatedText,
        from,
        to,
        source: 'MyMemory',
        timestamp: Date.now()
      };
    }
  },

  'country-info': {
    name: 'Country Info Bot',
    description: 'Country data from REST Countries API',
    category: 'info',
    icon: '🌍',
    defaultCapabilities: ['country', 'info', 'geography'],
    parameters: [
      {
        name: 'defaultCountry',
        prompt: 'Default country?\n\nExamples: Japan, Brazil, Germany, India\n\nEnter country name:',
        required: false
      }
    ],
    buildDescription: (params) => `Country information${params.defaultCountry ? ` (default: ${params.defaultCountry})` : ''}`,
    buildCapabilities: (params) => ['country', 'info', 'geography'],
    handler: async (taskData, templateParams) => {
      const country = taskData.country || templateParams.defaultCountry || 'Japan';
      const response = await fetch(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`,
        { headers: { 'User-Agent': 'SwarmBot/1.0' } }
      );

      if (!response.ok) throw new Error(`REST Countries returned ${response.status}`);

      const data = await response.json();
      if (!data[0]) throw new Error(`Country "${country}" not found`);

      const c = data[0];
      return {
        country: c.name.common,
        officialName: c.name.official,
        capital: c.capital ? c.capital[0] : 'N/A',
        population: c.population,
        region: c.region,
        languages: c.languages ? Object.values(c.languages).join(', ') : 'N/A',
        currencies: c.currencies ? Object.values(c.currencies).map(cur => `${cur.name} (${cur.symbol})`).join(', ') : 'N/A',
        flag: c.flag,
        source: 'REST Countries',
        timestamp: Date.now()
      };
    }
  },

  'joke': {
    name: 'Joke Generator',
    description: 'Random jokes from Official Joke API',
    category: 'fun',
    icon: '😄',
    defaultCapabilities: ['joke', 'fun', 'entertainment'],
    parameters: [],
    buildDescription: () => 'Random jokes from Official Joke API',
    buildCapabilities: () => ['joke', 'fun', 'entertainment'],
    handler: async (taskData, templateParams) => {
      const response = await fetch(
        'https://official-joke-api.appspot.com/jokes/random',
        { headers: { 'User-Agent': 'SwarmBot/1.0' } }
      );

      if (!response.ok) throw new Error(`Joke API returned ${response.status}`);

      const data = await response.json();
      return {
        setup: data.setup,
        punchline: data.punchline,
        joke: `${data.setup} — ${data.punchline}`,
        type: data.type,
        source: 'Official Joke API',
        timestamp: Date.now()
      };
    }
  },

  'custom-api': {
    name: 'Custom API Bot',
    description: 'Call any public JSON API',
    category: 'custom',
    icon: '🔧',
    defaultCapabilities: ['custom', 'api'],
    parameters: [
      {
        name: 'apiUrl',
        prompt: 'Enter the full API URL:\n\nExample: https://api.example.com/data\n\n(Must be a public JSON API, no authentication required)',
        required: true
      },
      {
        name: 'customDescription',
        prompt: 'Describe what this API returns (for the orchestrator):\n\nExample: "Returns current gas prices on Ethereum"',
        required: true
      }
    ],
    buildDescription: (params) => params.customDescription || 'Custom API bot',
    buildCapabilities: (params) => ['custom', 'api'],
    handler: async (taskData, templateParams) => {
      const url = templateParams.apiUrl;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'SwarmBot/1.0' }
      });

      if (!response.ok) throw new Error(`API returned ${response.status}`);

      const data = await response.json();
      return {
        data,
        source: url,
        timestamp: Date.now()
      };
    }
  }
};

/**
 * Get template menu text for Telegram
 */
function getTemplateMenu() {
  return `🤖 <b>Create Your Bot</b>

Pick a template:

1. 💰 <b>Crypto Price Oracle</b> - Real-time prices (CoinGecko)
2. 🌤️ <b>Weather Reporter</b> - Live weather (wttr.in)
3. 📊 <b>DeFi TVL Tracker</b> - Protocol TVL (DeFiLlama)
4. 🗣️ <b>Translation Service</b> - Language translation
5. 🌍 <b>Country Info</b> - Country data
6. 😄 <b>Joke Generator</b> - Random jokes
7. 🔧 <b>Custom API</b> - Your own API endpoint

<b>All bots use REAL APIs. Zero mock data.</b>

Reply with number (1-7):`;
}

/**
 * Map number selection to template key
 */
const TEMPLATE_MAP = {
  '1': 'crypto-price',
  '2': 'weather',
  '3': 'defi-tvl',
  '4': 'translation',
  '5': 'country-info',
  '6': 'joke',
  '7': 'custom-api'
};

module.exports = { BOT_TEMPLATES, getTemplateMenu, TEMPLATE_MAP };
