/**
 * Crypto Price Oracle Agent
 * Real-time cryptocurrency prices from CoinGecko
 */

const Agent = require('../../core/Agent');
const fetch = require('node-fetch');

class CryptoPriceAgent extends Agent {
  constructor(config = {}) {
    super({
      id: config.id || 'crypto-price-agent',
      name: config.name || 'Crypto Price Oracle',
      version: '1.0.0',
      description: config.description || 'Real-time cryptocurrency price from CoinGecko',
      author: 'Swarm Core',
      capabilities: config.capabilities || ['crypto-price', 'price', 'market-data'],
      pricing: {
        basePrice: 0,
        pricePerCall: config.pricePerCall || 0.001,
        currency: 'STX'
      },
      schema: {
        input: {
          type: 'object',
          properties: {
            coin: { type: 'string', required: true },
            currency: { type: 'string', required: false }
          }
        },
        output: {
          type: 'object',
          properties: {
            symbol: { type: 'string' },
            price: { type: 'number' },
            change24h: { type: 'number' },
            currency: { type: 'string' },
            source: { type: 'string' },
            timestamp: { type: 'number' }
          }
        }
      },
      execute: this.fetchPrice.bind(this)
    });

    this.defaultCoin = config.defaultCoin || 'bitcoin';
  }

  async fetchPrice(input, context) {
    const coin = (input.coin || input.symbol || this.defaultCoin).toLowerCase();
    const currency = (input.currency || 'usd').toLowerCase();

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=${currency}&include_24hr_change=true`,
      {
        headers: { 'User-Agent': 'SwarmBot/1.0' },
        timeout: 5000
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data[coin]) {
      throw new Error(`Coin "${coin}" not found on CoinGecko`);
    }

    return {
      symbol: coin,
      price: data[coin][currency],
      change24h: data[coin][`${currency}_24h_change`] || 0,
      currency: currency.toUpperCase(),
      source: 'CoinGecko',
      timestamp: Date.now()
    };
  }
}

// Factory function for creating instances
function createCryptoPriceAgent(config = {}) {
  return new CryptoPriceAgent(config);
}

module.exports = { CryptoPriceAgent, createCryptoPriceAgent };
