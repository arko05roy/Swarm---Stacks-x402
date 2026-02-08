/**
 * Generic API Wrapper Agent
 * Turn any REST API into an agent
 */

const Agent = require('../../core/Agent');
const fetch = require('node-fetch');

class APIWrapperAgent extends Agent {
  constructor(config = {}) {
    if (!config.apiUrl) {
      throw new Error('apiUrl is required for APIWrapperAgent');
    }

    super({
      id: config.id || `api-wrapper-${Date.now()}`,
      name: config.name || 'Custom API Bot',
      version: '1.0.0',
      description: config.description || 'Call any public JSON API',
      author: config.author || 'User',
      capabilities: config.capabilities || ['custom', 'api'],
      pricing: {
        basePrice: 0,
        pricePerCall: config.pricePerCall || 0.002,
        currency: 'STX'
      },
      schema: {
        input: config.schema?.input || {
          type: 'object',
          properties: {}
        },
        output: config.schema?.output || {
          type: 'object',
          properties: {
            data: { type: 'object' },
            source: { type: 'string' },
            timestamp: { type: 'number' }
          }
        }
      },
      execute: this.callAPI.bind(this)
    });

    this.apiUrl = config.apiUrl;
    this.method = config.method || 'GET';
    this.headers = config.headers || {};
    this.transformFunction = config.transform || this.defaultTransform.bind(this);
  }

  async callAPI(input, context) {
    // Replace placeholders in URL with input values
    let url = this.apiUrl;
    for (const [key, value] of Object.entries(input)) {
      url = url.replace(`{${key}}`, encodeURIComponent(value));
    }

    const requestOptions = {
      method: this.method,
      headers: {
        'User-Agent': 'SwarmBot/1.0',
        ...this.headers
      },
      timeout: 10000
    };

    if (this.method === 'POST' && Object.keys(input).length > 0) {
      requestOptions.headers['Content-Type'] = 'application/json';
      requestOptions.body = JSON.stringify(input);
    }

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('API did not return JSON');
    }

    const data = await response.json();

    // Apply transformation if provided
    const transformedData = await this.transformFunction(data, input);

    return {
      data: transformedData,
      source: url,
      timestamp: Date.now()
    };
  }

  defaultTransform(data, input) {
    return data;
  }
}

function createAPIWrapperAgent(config = {}) {
  return new APIWrapperAgent(config);
}

module.exports = { APIWrapperAgent, createAPIWrapperAgent };
