/**
 * Agent.js - Base class for all agents in the Swarm framework
 *
 * Provides standard interface that all agents must implement:
 * - manifest: Agent metadata and capabilities
 * - execute(): Main execution logic
 * - ping(): Health check
 * - estimateCost(): Cost estimation
 * - validateInput(): Input validation
 */

class Agent {
  constructor(config) {
    this.manifest = {
      id: config.id || this.generateId(),
      name: config.name || 'Unnamed Agent',
      version: config.version || '1.0.0',
      description: config.description || '',
      author: config.author || 'unknown',
      capabilities: config.capabilities || [],
      pricing: {
        basePrice: config.pricing?.basePrice || 0,
        pricePerCall: config.pricing?.pricePerCall || 0.001,
        currency: config.pricing?.currency || 'STX'
      },
      schema: {
        input: config.schema?.input || {
          type: 'object',
          properties: {}
        },
        output: config.schema?.output || {
          type: 'object',
          properties: {}
        }
      },
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        calls: 0,
        totalEarnings: 0,
        successRate: 100,
        avgLatency: 0,
        reputation: 100
      }
    };

    // Custom execution function (overridable)
    this.executeFunction = config.execute || this.defaultExecute.bind(this);

    // Agent state
    this.isActive = true;
    this.errors = [];
  }

  /**
   * Generate unique agent ID
   */
  generateId() {
    return `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Main execution method - must be implemented by subclasses or provided in config
   * @param {Object} input - Input parameters
   * @param {Object} context - Execution context (user, wallet, etc.)
   * @returns {Promise<Object>} - Execution result
   */
  async execute(input, context = {}) {
    const startTime = Date.now();

    try {
      // Validate input against schema
      this.validateInput(input);

      // Check if agent is active
      if (!this.isActive) {
        throw new Error(`Agent ${this.manifest.id} is not active`);
      }

      // Execute the agent logic
      const result = await this.executeFunction(input, context);

      // Validate output
      this.validateOutput(result);

      // Update metrics
      this.updateMetrics(startTime, true);

      return {
        success: true,
        data: result,
        agentId: this.manifest.id,
        timestamp: Date.now(),
        cost: this.estimateCost(input)
      };

    } catch (error) {
      // Update metrics for failure
      this.updateMetrics(startTime, false);
      this.logError(error);

      return {
        success: false,
        error: error.message,
        agentId: this.manifest.id,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Default execution (placeholder)
   */
  async defaultExecute(input, context) {
    throw new Error('Agent execute function not implemented');
  }

  /**
   * Validate input against schema
   * @param {Object} input - Input to validate
   * @throws {Error} If validation fails
   */
  validateInput(input) {
    const schema = this.manifest.schema.input;

    if (schema.type === 'object' && schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (propSchema.required && !(key in input)) {
          throw new Error(`Missing required field: ${key}`);
        }

        if (key in input) {
          const value = input[key];
          const expectedType = propSchema.type;

          if (expectedType === 'string' && typeof value !== 'string') {
            throw new Error(`Field ${key} must be a string`);
          }
          if (expectedType === 'number' && typeof value !== 'number') {
            throw new Error(`Field ${key} must be a number`);
          }
          if (expectedType === 'boolean' && typeof value !== 'boolean') {
            throw new Error(`Field ${key} must be a boolean`);
          }
          if (expectedType === 'array' && !Array.isArray(value)) {
            throw new Error(`Field ${key} must be an array`);
          }
          if (expectedType === 'object' && typeof value !== 'object') {
            throw new Error(`Field ${key} must be an object`);
          }
        }
      }
    }

    return true;
  }

  /**
   * Validate output against schema
   * @param {Object} output - Output to validate
   * @throws {Error} If validation fails
   */
  validateOutput(output) {
    const schema = this.manifest.schema.output;

    if (schema.type === 'object' && schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (propSchema.required && !(key in output)) {
          throw new Error(`Output missing required field: ${key}`);
        }
      }
    }

    return true;
  }

  /**
   * Health check
   * @returns {Promise<Object>} - Health status
   */
  async ping() {
    return {
      status: this.isActive ? 'healthy' : 'inactive',
      agentId: this.manifest.id,
      name: this.manifest.name,
      uptime: Date.now() - this.manifest.metadata.createdAt,
      metrics: {
        calls: this.manifest.metadata.calls,
        successRate: this.manifest.metadata.successRate,
        avgLatency: this.manifest.metadata.avgLatency,
        reputation: this.manifest.metadata.reputation
      }
    };
  }

  /**
   * Estimate execution cost
   * @param {Object} input - Input parameters
   * @returns {number} - Estimated cost in STX
   */
  estimateCost(input) {
    return this.manifest.pricing.basePrice + this.manifest.pricing.pricePerCall;
  }

  /**
   * Update agent metrics
   */
  updateMetrics(startTime, success) {
    const latency = Date.now() - startTime;

    this.manifest.metadata.calls++;
    this.manifest.metadata.updatedAt = Date.now();

    // Update average latency
    const prevAvg = this.manifest.metadata.avgLatency;
    const totalCalls = this.manifest.metadata.calls;
    this.manifest.metadata.avgLatency =
      (prevAvg * (totalCalls - 1) + latency) / totalCalls;

    // Update success rate
    const prevSuccessRate = this.manifest.metadata.successRate;
    const successCount = Math.floor((prevSuccessRate / 100) * (totalCalls - 1));
    const newSuccessCount = successCount + (success ? 1 : 0);
    this.manifest.metadata.successRate = (newSuccessCount / totalCalls) * 100;

    // Update reputation based on success rate
    this.manifest.metadata.reputation = Math.min(100,
      Math.max(0, this.manifest.metadata.successRate));
  }

  /**
   * Log error
   */
  logError(error) {
    this.errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: Date.now()
    });

    // Keep only last 10 errors
    if (this.errors.length > 10) {
      this.errors = this.errors.slice(-10);
    }
  }

  /**
   * Get agent manifest
   */
  getManifest() {
    return { ...this.manifest };
  }

  /**
   * Pause agent
   */
  pause() {
    this.isActive = false;
  }

  /**
   * Resume agent
   */
  resume() {
    this.isActive = true;
  }

  /**
   * Get recent errors
   */
  getErrors() {
    return [...this.errors];
  }

  /**
   * Update earnings and distribute to investors
   */
  addEarnings(amount) {
    this.manifest.metadata.totalEarnings += amount;

    // Distribute to investors if any exist
    try {
      const { botInvestment } = require('../platform/BotInvestment');
      botInvestment.distributeEarnings(this.manifest.id, amount);
    } catch (error) {
      // Silently fail if investment system not loaded
      console.error('Investment distribution error:', error.message);
    }
  }

  /**
   * Serialize agent to JSON
   */
  toJSON() {
    return {
      manifest: this.manifest,
      isActive: this.isActive,
      errors: this.errors
    };
  }

  /**
   * Deserialize agent from JSON
   */
  static fromJSON(json) {
    const agent = new Agent({
      ...json.manifest,
      id: json.manifest.id,
      name: json.manifest.name
    });
    agent.isActive = json.isActive;
    agent.errors = json.errors || [];
    return agent;
  }
}

module.exports = Agent;
