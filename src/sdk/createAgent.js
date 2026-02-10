/**
 * createAgent SDK - 4 methods for agent creation
 *
 * Methods:
 * 1. fromTemplate() - Quick start with pre-built templates
 * 2. apiWrapper() - Turn any REST API into an agent
 * 3. custom() - Write custom execution code
 * 4. compose() - Chain multiple agents together
 */

const Agent = require('../core/Agent');
const { registry } = require('../core/AgentRegistry');
const AgentSchema = require('./AgentSchema');

// Import core agents for templates
const { createCryptoPriceAgent } = require('../agents/core/crypto-price.agent');
const { createDeFiTVLAgent } = require('../agents/core/defi-tvl.agent');
const { createTokenAnalyticsAgent } = require('../agents/core/token-analytics.agent');
const { createYieldOptimizerAgent } = require('../agents/core/yield-optimizer.agent');
const { createBlockchainExplorerAgent } = require('../agents/core/blockchain-explorer.agent');
const { createFeeEstimatorAgent } = require('../agents/core/fee-estimator.agent');
const { createPortfolioTrackerAgent } = require('../agents/core/portfolio-tracker.agent');
const { createContractDeployerAgent } = require('../agents/core/contract-deployer.agent');
const { createAPIWrapperAgent } = require('../agents/core/api-wrapper.agent');

class AgentSDK {
  /**
   * Method 1: Create agent from template
   *
   * @param {string} templateName - Template name
   * @param {Object} config - Configuration
   * @returns {Agent} - Created agent
   */
  static fromTemplate(templateName, config = {}) {
    const templates = {
      'crypto-price': () => createCryptoPriceAgent({
        ...config,
        name: config.name || 'Crypto Price Oracle',
        pricePerCall: config.pricePerCall || 0.001
      }),
      'defi-tvl': () => createDeFiTVLAgent({
        ...config,
        name: config.name || 'DeFi TVL Tracker',
        pricePerCall: config.pricePerCall || 0.002
      }),
      'token-analytics': () => createTokenAnalyticsAgent({
        ...config,
        name: config.name || 'Token Analytics Oracle',
        pricePerCall: config.pricePerCall || 0.003
      }),
      'yield-optimizer': () => createYieldOptimizerAgent({
        ...config,
        name: config.name || 'DeFi Yield Optimizer',
        pricePerCall: config.pricePerCall || 0.004
      }),
      'blockchain-explorer': () => createBlockchainExplorerAgent({
        ...config,
        name: config.name || 'Blockchain Explorer',
        pricePerCall: config.pricePerCall || 0.002
      }),
      'fee-estimator': () => createFeeEstimatorAgent({
        ...config,
        name: config.name || 'Gas/Fee Estimator',
        pricePerCall: config.pricePerCall || 0.002
      }),
      'portfolio-tracker': () => createPortfolioTrackerAgent({
        ...config,
        name: config.name || 'Wallet Portfolio Tracker',
        pricePerCall: config.pricePerCall || 0.003
      }),
      'contract-deployer': () => createContractDeployerAgent({
        ...config,
        name: config.name || 'Smart Contract Deployer',
        pricePerCall: config.pricePerCall || 0.05
      }),
      'api-wrapper': () => createAPIWrapperAgent({
        ...config,
        name: config.name || 'Custom API Bot',
        pricePerCall: config.pricePerCall || 0.002
      })
    };

    const factory = templates[templateName];

    if (!factory) {
      throw new Error(
        `Template "${templateName}" not found. Available: ${Object.keys(templates).join(', ')}`
      );
    }

    const agent = factory();

    // Register agent if userId provided
    if (config.userId) {
      registry.register(agent, config.userId);
    }

    console.log(`✅ Created agent from template: ${templateName}`);
    return agent;
  }

  /**
   * Method 2: Create API wrapper agent
   *
   * @param {Object} config - Configuration
   * @param {string} config.apiUrl - API endpoint URL
   * @param {string} config.name - Agent name
   * @param {Function} config.transform - Optional data transformation function
   * @param {Object} config.pricing - Pricing config
   * @returns {Agent} - Created agent
   */
  static apiWrapper(config) {
    if (!config.apiUrl) {
      throw new Error('apiUrl is required for API wrapper');
    }

    if (!config.name) {
      throw new Error('name is required for API wrapper');
    }

    const agent = createAPIWrapperAgent({
      id: config.id || `api-wrapper-${Date.now()}`,
      name: config.name,
      description: config.description || `API wrapper for ${config.apiUrl}`,
      apiUrl: config.apiUrl,
      method: config.method || 'GET',
      headers: config.headers || {},
      transform: config.transform,
      pricePerCall: config.pricing?.pricePerCall || 0.002,
      schema: config.schema,
      capabilities: config.capabilities || ['custom', 'api']
    });

    // Register agent if userId provided
    if (config.userId) {
      registry.register(agent, config.userId);
    }

    console.log(`✅ Created API wrapper agent: ${config.name}`);
    return agent;
  }

  /**
   * Method 3: Create custom agent with custom code
   *
   * @param {Object} config - Configuration
   * @param {string} config.name - Agent name
   * @param {Function} config.execute - Execution function
   * @param {Object} config.pricing - Pricing config
   * @param {Object} config.schema - Input/output schema
   * @returns {Agent} - Created agent
   */
  static custom(config) {
    if (!config.name) {
      throw new Error('name is required for custom agent');
    }

    if (!config.execute || typeof config.execute !== 'function') {
      throw new Error('execute function is required for custom agent');
    }

    const agent = new Agent({
      id: config.id || `custom-${Date.now()}`,
      name: config.name,
      version: config.version || '1.0.0',
      description: config.description || 'Custom agent',
      author: config.author || 'user',
      capabilities: config.capabilities || ['custom'],
      pricing: {
        basePrice: config.pricing?.basePrice || 0,
        pricePerCall: config.pricing?.pricePerCall || 0.01,
        currency: 'STX'
      },
      schema: config.schema || {
        input: { type: 'object', properties: {} },
        output: { type: 'object', properties: {} }
      },
      execute: config.execute
    });

    // Register agent if userId provided
    if (config.userId) {
      registry.register(agent, config.userId);
    }

    console.log(`✅ Created custom agent: ${config.name}`);
    return agent;
  }

  /**
   * Method 4: Create composite agent (chain agents)
   *
   * @param {Object} config - Configuration
   * @param {string} config.name - Agent name
   * @param {Array} config.workflow - Workflow steps
   * @param {Object} config.pricing - Pricing config
   * @returns {Agent} - Created composite agent
   */
  static compose(config) {
    if (!config.name) {
      throw new Error('name is required for composite agent');
    }

    if (!config.workflow || !Array.isArray(config.workflow)) {
      throw new Error('workflow array is required for composite agent');
    }

    if (config.workflow.length === 0) {
      throw new Error('workflow must have at least one step');
    }

    // Validate workflow steps
    for (const step of config.workflow) {
      if (!step.agent) {
        throw new Error('Each workflow step must specify an agent');
      }
    }

    // Create composite execution function
    const executeWorkflow = async (input, context) => {
      const results = [];
      let previousResult = null;

      for (let i = 0; i < config.workflow.length; i++) {
        const step = config.workflow[i];

        // Get agent
        const agent = registry.get(step.agent);
        if (!agent) {
          throw new Error(`Agent "${step.agent}" not found in registry`);
        }

        // Prepare input for this step
        let stepInput = { ...step.input };

        // Replace $prev with previous result
        if (previousResult) {
          stepInput = this.replacePrevReferences(stepInput, previousResult);
        }

        // Merge with global input if specified
        if (step.useGlobalInput) {
          stepInput = { ...input, ...stepInput };
        }

        // Execute agent
        console.log(`  Step ${i + 1}/${config.workflow.length}: ${agent.manifest.name}`);
        const result = await agent.execute(stepInput, context);

        if (!result.success) {
          throw new Error(
            `Step ${i + 1} (${agent.manifest.name}) failed: ${result.error}`
          );
        }

        results.push(result.data);
        previousResult = result.data;
      }

      return {
        steps: results,
        final: results[results.length - 1]
      };
    };

    // Calculate total cost
    let totalCost = 0;
    for (const step of config.workflow) {
      const agent = registry.get(step.agent);
      if (agent) {
        totalCost += agent.estimateCost(step.input || {});
      }
    }

    const agent = new Agent({
      id: config.id || `composite-${Date.now()}`,
      name: config.name,
      version: config.version || '1.0.0',
      description: config.description || `Composite agent with ${config.workflow.length} steps`,
      author: config.author || 'user',
      capabilities: config.capabilities || ['composite', 'workflow'],
      pricing: {
        basePrice: config.pricing?.basePrice || 0,
        pricePerCall: config.pricing?.pricePerCall || totalCost * 1.1, // 10% markup
        currency: 'STX'
      },
      schema: config.schema || {
        input: { type: 'object', properties: {} },
        output: { type: 'object', properties: {} }
      },
      execute: executeWorkflow
    });

    // Store workflow metadata
    agent.workflow = config.workflow;
    agent.isComposite = true;

    // Register agent if userId provided
    if (config.userId) {
      registry.register(agent, config.userId);
    }

    console.log(`✅ Created composite agent: ${config.name} (${config.workflow.length} steps)`);
    return agent;
  }

  /**
   * Replace $prev references in input with actual previous result
   */
  static replacePrevReferences(input, prevResult) {
    if (typeof input === 'string') {
      if (input === '$prev') {
        return prevResult;
      }
      // Replace $prev.field references
      const match = input.match(/\$prev\.(\w+)/);
      if (match && prevResult && typeof prevResult === 'object') {
        return prevResult[match[1]];
      }
    }

    if (typeof input === 'object' && input !== null) {
      const result = Array.isArray(input) ? [] : {};
      for (const [key, value] of Object.entries(input)) {
        result[key] = this.replacePrevReferences(value, prevResult);
      }
      return result;
    }

    return input;
  }

  /**
   * List available templates
   */
  static listTemplates() {
    return [
      { id: 'crypto-price', name: 'Crypto Price Oracle', icon: '💰' },
      { id: 'weather', name: 'Weather Reporter', icon: '🌤️' },
      { id: 'defi-tvl', name: 'DeFi TVL Tracker', icon: '📊' },
      { id: 'translation', name: 'Translation Service', icon: '🗣️' },
      { id: 'country-info', name: 'Country Info Bot', icon: '🌍' },
      { id: 'joke', name: 'Joke Generator', icon: '😄' },
      { id: 'api-wrapper', name: 'Custom API Bot', icon: '🔧' }
    ];
  }

  /**
   * Validate agent config
   */
  static validateConfig(config) {
    if (!config.name) {
      throw new Error('Agent name is required');
    }

    if (config.pricing) {
      if (config.pricing.pricePerCall < 0) {
        throw new Error('pricePerCall must be non-negative');
      }
    }

    return true;
  }
}

// Export convenience functions
module.exports = {
  AgentSDK,
  fromTemplate: AgentSDK.fromTemplate.bind(AgentSDK),
  apiWrapper: AgentSDK.apiWrapper.bind(AgentSDK),
  custom: AgentSDK.custom.bind(AgentSDK),
  compose: AgentSDK.compose.bind(AgentSDK),
  listTemplates: AgentSDK.listTemplates.bind(AgentSDK)
};
