/**
 * Joke Generator Agent
 * Random jokes from Official Joke API
 */

const Agent = require('../../core/Agent');
const fetch = require('node-fetch');

class JokeAgent extends Agent {
  constructor(config = {}) {
    const agentConfig = {
      id: config.id || 'joke-agent',
      name: config.name || 'Joke Generator',
      version: '1.0.0',
      description: config.description || 'Random jokes from Official Joke API',
      author: 'Swarm Core',
      capabilities: config.capabilities || ['joke', 'fun', 'entertainment'],
      pricing: {
        basePrice: 0,
        pricePerCall: config.pricePerCall || 0.001,
        currency: 'STX'
      },
      schema: {
        input: {
          type: 'object',
          properties: {
            type: { type: 'string', required: false }
          }
        },
        output: {
          type: 'object',
          properties: {
            setup: { type: 'string' },
            punchline: { type: 'string' },
            joke: { type: 'string' },
            type: { type: 'string' },
            source: { type: 'string' },
            timestamp: { type: 'number' }
          }
        }
      }
    };

    super(agentConfig);
    this.executeFunction = this.fetchJoke.bind(this);
  }

  async fetchJoke(input, context) {
    const jokeType = input.type || 'random';

    const endpoint = jokeType === 'random'
      ? 'https://official-joke-api.appspot.com/jokes/random'
      : `https://official-joke-api.appspot.com/jokes/${jokeType}/random`;

    const response = await fetch(endpoint, {
      headers: { 'User-Agent': 'SwarmBot/1.0' },
      timeout: 5000
    });

    if (!response.ok) {
      throw new Error(`Joke API returned ${response.status}`);
    }

    const data = await response.json();
    const joke = Array.isArray(data) ? data[0] : data;

    return {
      setup: joke.setup,
      punchline: joke.punchline,
      joke: `${joke.setup} — ${joke.punchline}`,
      type: joke.type,
      source: 'Official Joke API',
      timestamp: Date.now()
    };
  }
}

function createJokeAgent(config = {}) {
  return new JokeAgent(config);
}

module.exports = { JokeAgent, createJokeAgent };
