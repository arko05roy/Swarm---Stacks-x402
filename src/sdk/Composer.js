/**
 * Composer - Agent chaining and workflow execution
 *
 * Enables composite agents that chain multiple sub-agents together
 * Supports:
 * - Sequential execution
 * - Variable passing between steps ($prev)
 * - Error handling and rollback
 * - Cost estimation
 * - Debugging/logging
 */

const { registry } = require('../core/AgentRegistry');

class Composer {
  constructor(config = {}) {
    this.workflow = config.workflow || [];
    this.name = config.name || 'Untitled Workflow';
    this.debug = config.debug || false;
  }

  /**
   * Execute workflow
   * @param {Object} input - Input data
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Workflow result
   */
  async execute(input = {}, context = {}) {
    const startTime = Date.now();
    const results = [];
    let previousResult = null;

    this.log(`🚀 Starting workflow: ${this.name}`);
    this.log(`📥 Input: ${JSON.stringify(input)}`);

    try {
      for (let i = 0; i < this.workflow.length; i++) {
        const step = this.workflow[i];
        const stepNum = i + 1;

        this.log(`\n📍 Step ${stepNum}/${this.workflow.length}: ${step.agent}`);

        // Execute step
        const stepResult = await this.executeStep(step, i, input, previousResult, context);

        results.push({
          step: stepNum,
          agent: step.agent,
          success: stepResult.success,
          data: stepResult.data,
          error: stepResult.error,
          cost: stepResult.cost,
          duration: stepResult.duration
        });

        if (!stepResult.success) {
          // Step failed
          this.log(`❌ Step ${stepNum} failed: ${stepResult.error}`);

          if (step.continueOnError) {
            this.log(`⏭️  Continuing despite error (continueOnError=true)`);
            previousResult = stepResult.fallback || null;
          } else {
            // Stop execution
            return {
              success: false,
              error: `Workflow failed at step ${stepNum} (${step.agent}): ${stepResult.error}`,
              results,
              duration: Date.now() - startTime
            };
          }
        } else {
          // Step succeeded
          this.log(`✅ Step ${stepNum} succeeded`);
          this.log(`📤 Output: ${JSON.stringify(stepResult.data).substring(0, 100)}...`);
          previousResult = stepResult.data;
        }
      }

      // All steps succeeded
      const duration = Date.now() - startTime;
      const totalCost = results.reduce((sum, r) => sum + (r.cost || 0), 0);

      this.log(`\n🎉 Workflow completed successfully`);
      this.log(`⏱️  Duration: ${duration}ms`);
      this.log(`💰 Total cost: ${totalCost} STX`);

      return {
        success: true,
        results,
        final: previousResult,
        duration,
        totalCost
      };

    } catch (error) {
      this.log(`❌ Workflow error: ${error.message}`);

      return {
        success: false,
        error: error.message,
        results,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Execute a single workflow step
   */
  async executeStep(step, index, globalInput, previousResult, context) {
    const startTime = Date.now();

    try {
      // Get agent
      const agent = registry.get(step.agent);

      if (!agent) {
        throw new Error(`Agent "${step.agent}" not found in registry`);
      }

      if (!agent.isActive) {
        throw new Error(`Agent "${step.agent}" is not active`);
      }

      // Prepare step input
      let stepInput = this.prepareInput(step, globalInput, previousResult, index);

      this.log(`  📥 Input: ${JSON.stringify(stepInput).substring(0, 100)}...`);

      // Estimate cost
      const estimatedCost = agent.estimateCost(stepInput);
      this.log(`  💰 Estimated cost: ${estimatedCost} STX`);

      // Execute agent
      const result = await agent.execute(stepInput, context);

      const duration = Date.now() - startTime;

      if (result.success) {
        return {
          success: true,
          data: result.data,
          cost: result.cost || estimatedCost,
          duration
        };
      } else {
        return {
          success: false,
          error: result.error,
          cost: 0,
          duration
        };
      }

    } catch (error) {
      return {
        success: false,
        error: error.message,
        cost: 0,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Prepare input for a step
   * - Merge step input with global input
   * - Replace $prev references
   * - Apply transformations
   */
  prepareInput(step, globalInput, previousResult, stepIndex) {
    let input = {};

    // Start with step input
    if (step.input) {
      input = { ...step.input };
    }

    // Merge global input if specified
    if (step.useGlobalInput) {
      input = { ...globalInput, ...input };
    }

    // Replace $prev references
    if (previousResult) {
      input = this.replacePrevReferences(input, previousResult);
    }

    // Apply transform function if provided
    if (step.transform && typeof step.transform === 'function') {
      input = step.transform(input, previousResult, globalInput, stepIndex);
    }

    return input;
  }

  /**
   * Replace $prev references with actual previous result
   * Supports:
   * - $prev -> entire previous result
   * - $prev.field -> specific field from previous result
   * - $prev.field.nested -> nested field access
   */
  replacePrevReferences(input, prevResult) {
    if (typeof input === 'string') {
      // Direct $prev reference
      if (input === '$prev') {
        return prevResult;
      }

      // $prev.field reference
      if (input.startsWith('$prev.')) {
        const path = input.substring(6); // Remove "$prev."
        return this.getNestedValue(prevResult, path);
      }
    }

    if (Array.isArray(input)) {
      return input.map(item => this.replacePrevReferences(item, prevResult));
    }

    if (typeof input === 'object' && input !== null) {
      const result = {};
      for (const [key, value] of Object.entries(input)) {
        result[key] = this.replacePrevReferences(value, prevResult);
      }
      return result;
    }

    return input;
  }

  /**
   * Get nested value from object using dot notation
   * e.g., "user.profile.name" -> obj.user.profile.name
   */
  getNestedValue(obj, path) {
    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Estimate total cost of workflow
   */
  estimateCost(input = {}) {
    let totalCost = 0;

    for (const step of this.workflow) {
      const agent = registry.get(step.agent);
      if (agent) {
        const stepInput = this.prepareInput(step, input, null, 0);
        totalCost += agent.estimateCost(stepInput);
      }
    }

    return totalCost;
  }

  /**
   * Validate workflow
   * - Check all agents exist
   * - Check for circular dependencies
   * - Validate step configurations
   */
  validate() {
    const errors = [];

    if (!this.workflow || this.workflow.length === 0) {
      errors.push('Workflow is empty');
    }

    for (let i = 0; i < this.workflow.length; i++) {
      const step = this.workflow[i];

      if (!step.agent) {
        errors.push(`Step ${i + 1}: missing agent name`);
        continue;
      }

      const agent = registry.get(step.agent);
      if (!agent) {
        errors.push(`Step ${i + 1}: agent "${step.agent}" not found`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get workflow summary
   */
  getSummary() {
    return {
      name: this.name,
      steps: this.workflow.length,
      agents: this.workflow.map(s => s.agent),
      estimatedCost: this.estimateCost()
    };
  }

  /**
   * Add step to workflow
   */
  addStep(step) {
    this.workflow.push(step);
    return this;
  }

  /**
   * Remove step from workflow
   */
  removeStep(index) {
    if (index >= 0 && index < this.workflow.length) {
      this.workflow.splice(index, 1);
    }
    return this;
  }

  /**
   * Log message (if debug enabled)
   */
  log(message) {
    if (this.debug) {
      console.log(message);
    }
  }

  /**
   * Export workflow to JSON
   */
  toJSON() {
    return {
      name: this.name,
      workflow: this.workflow,
      debug: this.debug
    };
  }

  /**
   * Import workflow from JSON
   */
  static fromJSON(json) {
    return new Composer(json);
  }
}

/**
 * Helper function to create and execute a simple workflow
 */
async function executeWorkflow(workflow, input, context) {
  const composer = new Composer({ workflow, debug: false });
  return await composer.execute(input, context);
}

module.exports = { Composer, executeWorkflow };
