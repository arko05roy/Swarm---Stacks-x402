/**
 * Weather Reporter Agent
 * Current weather conditions from wttr.in
 */

const Agent = require('../../core/Agent');
const fetch = require('node-fetch');

class WeatherAgent extends Agent {
  constructor(config = {}) {
    super({
      id: config.id || 'weather-agent',
      name: config.name || 'Weather Reporter',
      version: '1.0.0',
      description: config.description || 'Current weather conditions from wttr.in',
      author: 'Swarm Core',
      capabilities: config.capabilities || ['weather', 'forecast', 'temperature'],
      pricing: {
        basePrice: 0,
        pricePerCall: config.pricePerCall || 0.001,
        currency: 'STX'
      },
      schema: {
        input: {
          type: 'object',
          properties: {
            city: { type: 'string', required: true }
          }
        },
        output: {
          type: 'object',
          properties: {
            city: { type: 'string' },
            temperature: { type: 'string' },
            feelsLike: { type: 'string' },
            condition: { type: 'string' },
            humidity: { type: 'string' },
            windSpeed: { type: 'string' },
            source: { type: 'string' },
            timestamp: { type: 'number' }
          }
        }
      },
      execute: this.fetchWeather.bind(this)
    });

    this.defaultCity = config.defaultCity || 'London';
  }

  async fetchWeather(input, context) {
    const city = input.city || this.defaultCity;

    const response = await fetch(
      `https://wttr.in/${encodeURIComponent(city)}?format=j1`,
      {
        headers: { 'User-Agent': 'SwarmBot/1.0' },
        timeout: 5000
      }
    );

    if (!response.ok) {
      throw new Error(`Weather API returned ${response.status}`);
    }

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
}

function createWeatherAgent(config = {}) {
  return new WeatherAgent(config);
}

module.exports = { WeatherAgent, createWeatherAgent };
