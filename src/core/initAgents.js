/**
 * Initialize Core Agents
 *
 * Registers all core DeFi/Web3 agents with the registry on startup
 */

const { registry } = require('./AgentRegistry');
const { createCryptoPriceAgent } = require('../agents/core/crypto-price.agent');
const { createDeFiTVLAgent } = require('../agents/core/defi-tvl.agent');
const { createContractDeployerAgent } = require('../agents/core/contract-deployer.agent');
const { createTokenAnalyticsAgent } = require('../agents/core/token-analytics.agent');
const { createYieldOptimizerAgent } = require('../agents/core/yield-optimizer.agent');
const { createBlockchainExplorerAgent } = require('../agents/core/blockchain-explorer.agent');
const { createFeeEstimatorAgent } = require('../agents/core/fee-estimator.agent');
const { createPortfolioTrackerAgent } = require('../agents/core/portfolio-tracker.agent');

/**
 * Initialize all core DeFi/Web3 agents
 */
function initializeCoreAgents() {
  console.log('🚀 Initializing core DeFi/Web3 agents...');

  try {
    // 1. Crypto Price Oracle
    const cryptoAgent = createCryptoPriceAgent({
      id: 'crypto-price-core',
      name: 'Crypto Price Oracle',
      pricePerCall: 0.001
    });
    registry.register(cryptoAgent, 'system');

    // 2. DeFi TVL Tracker
    const defiAgent = createDeFiTVLAgent({
      id: 'defi-tvl-core',
      name: 'DeFi TVL Tracker',
      pricePerCall: 0.002
    });
    registry.register(defiAgent, 'system');

    // 3. Token Analytics Oracle
    const tokenAnalyticsAgent = createTokenAnalyticsAgent({
      id: 'token-analytics-core',
      name: 'Token Analytics Oracle',
      pricePerCall: 0.003
    });
    registry.register(tokenAnalyticsAgent, 'system');

    // 4. DeFi Yield Optimizer
    const yieldAgent = createYieldOptimizerAgent({
      id: 'yield-optimizer-core',
      name: 'DeFi Yield Optimizer',
      pricePerCall: 0.004
    });
    registry.register(yieldAgent, 'system');

    // 5. Blockchain Explorer
    const explorerAgent = createBlockchainExplorerAgent({
      id: 'blockchain-explorer-core',
      name: 'Blockchain Explorer',
      pricePerCall: 0.002
    });
    registry.register(explorerAgent, 'system');

    // 6. Gas/Fee Estimator
    const feeAgent = createFeeEstimatorAgent({
      id: 'fee-estimator-core',
      name: 'Gas/Fee Estimator',
      pricePerCall: 0.002
    });
    registry.register(feeAgent, 'system');

    // 7. Portfolio Tracker
    const portfolioAgent = createPortfolioTrackerAgent({
      id: 'portfolio-tracker-core',
      name: 'Wallet Portfolio Tracker',
      pricePerCall: 0.003
    });
    registry.register(portfolioAgent, 'system');

    // 8. Smart Contract Deployer
    const deployerAgent = createContractDeployerAgent({
      id: 'contract-deployer-core',
      name: 'Smart Contract Deployer',
      pricePerCall: 0.05
    });
    registry.register(deployerAgent, 'system');

    const stats = registry.getStats();
    console.log(`✅ Initialized ${stats.totalAgents} core DeFi/Web3 agents`);
    console.log(`📊 Total capabilities: ${stats.capabilities.length}`);

    return true;

  } catch (error) {
    console.error('❌ Error initializing core agents:', error);
    return false;
  }
}

/**
 * Test all core agents
 */
async function testCoreAgents() {
  console.log('\n🧪 Testing core DeFi/Web3 agents...\n');

  const tests = [
    { agentId: 'crypto-price-core', input: { coin: 'bitcoin' } },
    { agentId: 'defi-tvl-core', input: { protocol: 'stacks' } },
    { agentId: 'token-analytics-core', input: { token: 'ethereum' } },
    { agentId: 'yield-optimizer-core', input: { chain: 'ethereum', limit: 5 } },
    { agentId: 'blockchain-explorer-core', input: { query: 'ST2Q9TEZVYPTJ1Q2H5H2G9QREV21KS90YQ0SZH113', type: 'address' } },
    { agentId: 'fee-estimator-core', input: { chain: 'stacks', txType: 'transfer' } },
    { agentId: 'portfolio-tracker-core', input: { address: 'ST2Q9TEZVYPTJ1Q2H5H2G9QREV21KS90YQ0SZH113' } },
    { agentId: 'contract-deployer-core', input: { contractName: 'test-contract', sourceCode: '(define-public (hello) (ok "world"))' } }
  ];

  for (const test of tests) {
    try {
      const agent = registry.get(test.agentId);
      if (!agent) {
        console.log(`❌ Agent ${test.agentId} not found`);
        continue;
      }

      console.log(`Testing ${agent.manifest.name}...`);
      const result = await agent.execute(test.input);

      if (result.success) {
        console.log(`✅ ${agent.manifest.name} - OK`);
      } else {
        console.log(`❌ ${agent.manifest.name} - Failed: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ ${test.agentId} - Error: ${error.message}`);
    }
  }

  console.log('\n✅ Agent testing complete\n');
}

module.exports = { initializeCoreAgents, testCoreAgents };
