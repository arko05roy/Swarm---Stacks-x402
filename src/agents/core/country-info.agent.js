/**
 * Country Info Agent
 * Country data from REST Countries API
 */

const Agent = require('../../core/Agent');
const fetch = require('node-fetch');

class CountryInfoAgent extends Agent {
  constructor(config = {}) {
    super({
      id: config.id || 'country-info-agent',
      name: config.name || 'Country Info Bot',
      version: '1.0.0',
      description: config.description || 'Country data from REST Countries API',
      author: 'Swarm Core',
      capabilities: config.capabilities || ['country', 'info', 'geography', 'data'],
      pricing: {
        basePrice: 0,
        pricePerCall: config.pricePerCall || 0.001,
        currency: 'STX'
      },
      schema: {
        input: {
          type: 'object',
          properties: {
            country: { type: 'string', required: true }
          }
        },
        output: {
          type: 'object',
          properties: {
            country: { type: 'string' },
            officialName: { type: 'string' },
            capital: { type: 'string' },
            population: { type: 'number' },
            region: { type: 'string' },
            languages: { type: 'string' },
            currencies: { type: 'string' },
            flag: { type: 'string' },
            source: { type: 'string' },
            timestamp: { type: 'number' }
          }
        }
      },
      execute: this.fetchCountryInfo.bind(this)
    });

    this.defaultCountry = config.defaultCountry || 'Japan';
  }

  async fetchCountryInfo(input, context) {
    const country = input.country || this.defaultCountry;

    const response = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`,
      {
        headers: { 'User-Agent': 'SwarmBot/1.0' },
        timeout: 5000
      }
    );

    if (!response.ok) {
      throw new Error(`REST Countries returned ${response.status}`);
    }

    const data = await response.json();

    if (!data[0]) {
      throw new Error(`Country "${country}" not found`);
    }

    const c = data[0];

    return {
      country: c.name.common,
      officialName: c.name.official,
      capital: c.capital ? c.capital[0] : 'N/A',
      population: c.population,
      region: c.region,
      languages: c.languages ? Object.values(c.languages).join(', ') : 'N/A',
      currencies: c.currencies
        ? Object.values(c.currencies).map(cur => `${cur.name} (${cur.symbol})`).join(', ')
        : 'N/A',
      flag: c.flag,
      source: 'REST Countries',
      timestamp: Date.now()
    };
  }
}

function createCountryInfoAgent(config = {}) {
  return new CountryInfoAgent(config);
}

module.exports = { CountryInfoAgent, createCountryInfoAgent };
