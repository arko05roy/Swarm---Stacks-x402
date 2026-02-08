/**
 * DeFi TVL Tracker Agent
 * Total Value Locked from DeFiLlama
 */

const Agent = require('../../core/Agent');
const fetch = require('node-fetch');

class DeFiTVLAgent extends Agent {
  constructor(config = {}) {
    super({
      id: config.id || 'defi-tvl-agent',
      name: config.name || 'DeFi TVL Tracker',
      version: '1.0.0',
      description: config.description || 'Total Value Locked from DeFiLlama',
      author: 'Swarm Core',
      capabilities: config.capabilities || ['defi-tvl', 'tvl', 'defi', 'analytics'],
      pricing: {
        basePrice: 0,
        pricePerCall: config.pricePerCall || 0.002,
        currency: 'STX'
      },
      schema: {
        input: {
          type: 'object',
          properties: {
            protocol: { type: 'string', required: true }
          }
        },
        output: {
          type: 'object',
          properties: {
            protocol: { type: 'string' },
            tvl: { type: 'number' },
            tvlFormatted: { type: 'string' },
            source: { type: 'string' },
            timestamp: { type: 'number' }
          }
        }
      },
      execute: this.fetchTVL.bind(this)
    });

    this.defaultProtocol = config.defaultProtocol || 'stacks';
  }

  async fetchTVL(input, context) {
    const protocol = (input.protocol || this.defaultProtocol).toLowerCase();

    const response = await fetch(
      `https://api.llama.fi/tvl/${protocol}`,
      {
        headers: { 'User-Agent': 'SwarmBot/1.0' },
        timeout: 5000
      }
    );

    if (!response.ok) {
      throw new Error(`DeFiLlama API returned ${response.status}`);
    }

    const tvl = await response.json();
    const tvlValue = typeof tvl === 'number' ? tvl : parseFloat(tvl);

    return {
      protocol,
      tvl: tvlValue,
      tvlFormatted: `$${tvlValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      source: 'DeFiLlama',
      timestamp: Date.now()
    };
  }
}

function createDeFiTVLAgent(config = {}) {
  return new DeFiTVLAgent(config);
}

module.exports = { DeFiTVLAgent, createDeFiTVLAgent };
