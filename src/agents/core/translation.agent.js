/**
 * Translation Service Agent
 * Translate text between languages via MyMemory
 */

const Agent = require('../../core/Agent');
const fetch = require('node-fetch');

class TranslationAgent extends Agent {
  constructor(config = {}) {
    const agentConfig = {
      id: config.id || 'translation-agent',
      name: config.name || 'Translation Service',
      version: '1.0.0',
      description: config.description || 'Translate text between languages via MyMemory',
      author: 'Swarm Core',
      capabilities: config.capabilities || ['translate', 'translation', 'language'],
      pricing: {
        basePrice: 0,
        pricePerCall: config.pricePerCall || 0.001,
        currency: 'STX'
      },
      schema: {
        input: {
          type: 'object',
          properties: {
            text: { type: 'string', required: true },
            from: { type: 'string', required: false },
            to: { type: 'string', required: true }
          }
        },
        output: {
          type: 'object',
          properties: {
            original: { type: 'string' },
            translated: { type: 'string' },
            from: { type: 'string' },
            to: { type: 'string' },
            source: { type: 'string' },
            timestamp: { type: 'number' }
          }
        }
      }
    };

    super(agentConfig);
    this.executeFunction = this.translate.bind(this);
    this.defaultFrom = config.defaultFrom || 'en';
    this.defaultTo = config.defaultTo || 'es';
  }

  async translate(input, context) {
    const text = input.text || 'hello';
    const from = input.from || this.defaultFrom;
    const to = input.to || this.defaultTo;

    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`,
      {
        headers: { 'User-Agent': 'SwarmBot/1.0' },
        timeout: 5000
      }
    );

    if (!response.ok) {
      throw new Error(`Translation API returned ${response.status}`);
    }

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
}

function createTranslationAgent(config = {}) {
  return new TranslationAgent(config);
}

module.exports = { TranslationAgent, createTranslationAgent };
