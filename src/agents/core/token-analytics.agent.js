/**
 * Token Analytics Agent
 * Comprehensive token metrics from CoinGecko
 */

const Agent = require('../../core/Agent');
const fetch = require('node-fetch');

class TokenAnalyticsAgent extends Agent {
  constructor(config = {}) {
    const agentConfig = {
      id: config.id || 'token-analytics-agent',
      name: config.name || 'Token Analytics Oracle',
      version: '1.0.0',
      description: config.description || 'Comprehensive cryptocurrency analytics including market cap, volume, supply, and historical performance',
      author: 'Swarm Core',
      capabilities: config.capabilities || ['token-analytics', 'defi', 'metrics', 'market-data'],
      pricing: {
        basePrice: 0,
        pricePerCall: config.pricePerCall || 0.003,
        currency: 'STX'
      },
      schema: {
        input: {
          type: 'object',
          properties: {
            token: { type: 'string', required: true },
            currency: { type: 'string', required: false }
          }
        },
        output: {
          type: 'object',
          properties: {
            symbol: { type: 'string' },
            name: { type: 'string' },
            price: { type: 'number' },
            marketCap: { type: 'number' },
            volume24h: { type: 'number' },
            circulatingSupply: { type: 'number' },
            totalSupply: { type: 'number' },
            priceChange24h: { type: 'number' },
            priceChange7d: { type: 'number' },
            priceChange30d: { type: 'number' },
            ath: { type: 'number' },
            atl: { type: 'number' },
            marketCapRank: { type: 'number' },
            source: { type: 'string' },
            timestamp: { type: 'number' }
          }
        }
      }
    };

    super(agentConfig);
    this.executeFunction = this.fetchTokenAnalytics.bind(this);
  }

  async fetchTokenAnalytics(input, context) {
    const token = (input.token || 'bitcoin').toLowerCase();
    const currency = (input.currency || 'usd').toLowerCase();

    // Fetch comprehensive token data from CoinGecko
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${token}?localization=false&tickers=false&community_data=false&developer_data=false`,
      {
        headers: { 'User-Agent': 'SwarmBot/1.0' },
        timeout: 8000
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.id) {
      throw new Error(`Token "${token}" not found on CoinGecko`);
    }

    const marketData = data.market_data;
    const currencyUpper = currency.toUpperCase();

    return {
      symbol: data.symbol?.toUpperCase() || 'N/A',
      name: data.name || token,
      price: marketData.current_price?.[currency] || 0,
      marketCap: marketData.market_cap?.[currency] || 0,
      marketCapFormatted: this.formatCurrency(marketData.market_cap?.[currency] || 0, currencyUpper),
      volume24h: marketData.total_volume?.[currency] || 0,
      volume24hFormatted: this.formatCurrency(marketData.total_volume?.[currency] || 0, currencyUpper),
      circulatingSupply: marketData.circulating_supply || 0,
      totalSupply: marketData.total_supply || 0,
      maxSupply: marketData.max_supply || null,
      priceChange24h: marketData.price_change_percentage_24h || 0,
      priceChange7d: marketData.price_change_percentage_7d || 0,
      priceChange30d: marketData.price_change_percentage_30d || 0,
      priceChange1y: marketData.price_change_percentage_1y || 0,
      ath: marketData.ath?.[currency] || 0,
      athDate: marketData.ath_date?.[currency] || null,
      atl: marketData.atl?.[currency] || 0,
      atlDate: marketData.atl_date?.[currency] || null,
      marketCapRank: data.market_cap_rank || null,
      fullyDilutedValuation: marketData.fully_diluted_valuation?.[currency] || 0,
      currency: currencyUpper,
      source: 'CoinGecko',
      timestamp: Date.now()
    };
  }

  // Helper to format large numbers
  formatCurrency(value, currency) {
    if (value >= 1e12) return `${currency} ${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${currency} ${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${currency} ${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${currency} ${(value / 1e3).toFixed(2)}K`;
    return `${currency} ${value.toFixed(2)}`;
  }
}

// Factory function for creating instances
function createTokenAnalyticsAgent(config = {}) {
  return new TokenAnalyticsAgent(config);
}

module.exports = { TokenAnalyticsAgent, createTokenAnalyticsAgent };
