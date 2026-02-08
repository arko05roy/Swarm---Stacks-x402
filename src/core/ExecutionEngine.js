/**
 * ExecutionEngine - Sandboxed execution for agents
 *
 * Provides:
 * - Timeout handling
 * - Resource limits
 * - Error capturing
 * - Execution context management
 * - Cost tracking
 */

const { registry } = require('./AgentRegistry');

class ExecutionEngine {
  constructor(config = {}) {
    this.defaultTimeout = config.defaultTimeout || 30000; // 30 seconds
    this.maxConcurrentExecutions = config.maxConcurrentExecutions || 10;
    this.currentExecutions = 0;

    // Execution history
    this.history = [];
    this.maxHistorySize = config.maxHistorySize || 100;
  }

  /**
   * Execute an agent with safety controls
   * @param {string} agentId - Agent ID
   * @param {Object} input - Input parameters
   * @param {Object} context - Execution context
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} - Execution result
   */
  async execute(agentId, input, context = {}, options = {}) {
    // Check concurrent execution limit
    if (this.currentExecutions >= this.maxConcurrentExecutions) {
      return {
        success: false,
        error: 'Too many concurrent executions. Please try again later.',
        agentId
      };
    }

    this.currentExecutions++;
    const executionId = this.generateExecutionId();
    const startTime = Date.now();

    try {
      // Get agent from registry
      const agent = registry.get(agentId);

      if (!agent) {
        throw new Error(`Agent ${agentId} not found`);
      }

      if (!agent.isActive) {
        throw new Error(`Agent ${agentId} is not active`);
      }

      // Set timeout
      const timeout = options.timeout || this.defaultTimeout;

      // Execute with timeout
      const result = await this.executeWithTimeout(
        agent,
        input,
        context,
        timeout
      );

      // Record execution
      const duration = Date.now() - startTime;
      this.recordExecution({
        executionId,
        agentId,
        success: result.success,
        duration,
        cost: result.cost,
        timestamp: startTime
      });

      return result;

    } catch (error) {
      // Record failed execution
      const duration = Date.now() - startTime;
      this.recordExecution({
        executionId,
        agentId,
        success: false,
        duration,
        error: error.message,
        timestamp: startTime
      });

      return {
        success: false,
        error: error.message,
        agentId,
        executionId
      };

    } finally {
      this.currentExecutions--;
    }
  }

  /**
   * Execute agent with timeout
   */
  async executeWithTimeout(agent, input, context, timeout) {
    return Promise.race([
      agent.execute(input, context),
      this.createTimeout(timeout, agent.manifest.id)
    ]);
  }

  /**
   * Create timeout promise
   */
  createTimeout(ms, agentId) {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Agent ${agentId} execution timeout after ${ms}ms`));
      }, ms);
    });
  }

  /**
   * Execute multiple agents in parallel
   * @param {Array} executions - Array of {agentId, input, context}
   * @returns {Promise<Array>} - Array of results
   */
  async executeParallel(executions) {
    const promises = executions.map(({ agentId, input, context, options }) =>
      this.execute(agentId, input, context, options)
    );

    return Promise.all(promises);
  }

  /**
   * Execute workflow (sequential)
   * @param {Array} steps - Workflow steps
   * @param {Object} input - Initial input
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Workflow result
   */
  async executeWorkflow(steps, input, context = {}) {
    const results = [];
    let previousResult = null;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      // Prepare input for this step
      let stepInput = { ...step.input };

      if (previousResult) {
        // Merge previous result if requested
        if (step.usePreviousResult) {
          stepInput = { ...stepInput, ...previousResult };
        }
      }

      // Execute step
      const result = await this.execute(
        step.agentId,
        stepInput,
        context,
        step.options
      );

      results.push({
        step: i + 1,
        agentId: step.agentId,
        result
      });

      if (!result.success) {
        // Workflow failed
        return {
          success: false,
          error: `Workflow failed at step ${i + 1}: ${result.error}`,
          results
        };
      }

      previousResult = result.data;
    }

    return {
      success: true,
      results,
      final: previousResult
    };
  }

  /**
   * Record execution in history
   */
  recordExecution(record) {
    this.history.push(record);

    // Trim history if too large
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }
  }

  /**
   * Generate unique execution ID
   */
  generateExecutionId() {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get execution history
   * @param {Object} filters - Filter options
   * @returns {Array} - Execution records
   */
  getHistory(filters = {}) {
    let history = [...this.history];

    if (filters.agentId) {
      history = history.filter(h => h.agentId === filters.agentId);
    }

    if (filters.success !== undefined) {
      history = history.filter(h => h.success === filters.success);
    }

    if (filters.limit) {
      history = history.slice(-filters.limit);
    }

    return history;
  }

  /**
   * Get execution statistics
   * @returns {Object} - Execution stats
   */
  getStats() {
    const total = this.history.length;
    const successful = this.history.filter(h => h.success).length;
    const failed = total - successful;

    const totalDuration = this.history.reduce((sum, h) => sum + h.duration, 0);
    const avgDuration = total > 0 ? totalDuration / total : 0;

    const totalCost = this.history.reduce((sum, h) => sum + (h.cost || 0), 0);

    return {
      totalExecutions: total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      avgDuration,
      totalCost,
      currentExecutions: this.currentExecutions
    };
  }

  /**
   * Get agent execution stats
   * @param {string} agentId - Agent ID
   * @returns {Object} - Agent-specific stats
   */
  getAgentStats(agentId) {
    const executions = this.history.filter(h => h.agentId === agentId);
    const successful = executions.filter(h => h.success).length;

    const totalDuration = executions.reduce((sum, h) => sum + h.duration, 0);
    const avgDuration = executions.length > 0 ? totalDuration / executions.length : 0;

    return {
      agentId,
      totalExecutions: executions.length,
      successful,
      failed: executions.length - successful,
      successRate: executions.length > 0 ? (successful / executions.length) * 100 : 0,
      avgDuration
    };
  }

  /**
   * Clear execution history
   */
  clearHistory() {
    this.history = [];
  }

  /**
   * Check system health
   * @returns {Object} - Health status
   */
  getHealth() {
    const stats = this.getStats();

    return {
      status: this.currentExecutions < this.maxConcurrentExecutions ? 'healthy' : 'busy',
      currentExecutions: this.currentExecutions,
      maxConcurrentExecutions: this.maxConcurrentExecutions,
      utilizationPercent: (this.currentExecutions / this.maxConcurrentExecutions) * 100,
      stats
    };
  }
}

// Singleton instance
const executionEngine = new ExecutionEngine();

module.exports = { ExecutionEngine, executionEngine };
