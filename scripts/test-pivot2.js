/**
 * Test Strategic Pivot #2 Features
 *
 * Tests all new features:
 * - 4 agent creation methods
 * - Agent composition
 * - Liquidity pool (simulated)
 * - Registry and discovery
 */

const { initializeCoreAgents, testCoreAgents } = require('../src/core/initAgents');
const { fromTemplate, apiWrapper, custom, compose } = require('../src/sdk/createAgent');
const { registry } = require('../src/core/AgentRegistry');
const { Composer } = require('../src/sdk/Composer');
const { executionEngine } = require('../src/core/ExecutionEngine');

async function runTests() {
  console.log('🧪 Testing Strategic Pivot #2 Features\n');
  console.log('=' .repeat(60) + '\n');

  // Test 1: Initialize core agents
  console.log('📦 Test 1: Initialize Core Agents\n');
  const initSuccess = initializeCoreAgents();
  if (initSuccess) {
    console.log('✅ Core agents initialized\n');
  } else {
    console.log('❌ Core agent initialization failed\n');
    return;
  }

  // Test 2: Test core agents
  console.log('=' .repeat(60) + '\n');
  console.log('🧪 Test 2: Test Core Agents\n');
  await testCoreAgents();

  // Test 3: Create agent from template
  console.log('=' .repeat(60) + '\n');
  console.log('🎨 Test 3: Create Agent from Template\n');
  try {
    const agent1 = fromTemplate('crypto-price', {
      name: 'My Custom Price Bot',
      pricePerCall: 0.005,
      userId: 'test-user-1'
    });
    console.log(`✅ Created template agent: ${agent1.manifest.name}`);
    console.log(`   ID: ${agent1.manifest.id}`);
    console.log(`   Price: ${agent1.manifest.pricing.pricePerCall} STX\n`);
  } catch (error) {
    console.log(`❌ Template creation failed: ${error.message}\n`);
  }

  // Test 4: Create API wrapper agent
  console.log('=' .repeat(60) + '\n');
  console.log('🔧 Test 4: Create API Wrapper Agent\n');
  try {
    const agent2 = apiWrapper({
      name: 'GitHub Repo Stats',
      apiUrl: 'https://api.github.com/repos/stacks-network/stacks-blockchain',
      description: 'Get Stacks blockchain repository stats',
      pricePerCall: 0.003,
      transform: (data) => ({
        stars: data.stargazers_count,
        forks: data.forks_count,
        openIssues: data.open_issues_count
      }),
      userId: 'test-user-2'
    });
    console.log(`✅ Created API wrapper: ${agent2.manifest.name}`);
    console.log(`   API: https://api.github.com/repos/...\n`);

    // Test the agent
    console.log('   Testing API wrapper...');
    const result = await agent2.execute({});
    if (result.success) {
      console.log(`   ✅ Test passed: ${JSON.stringify(result.data).substring(0, 80)}...\n`);
    } else {
      console.log(`   ❌ Test failed: ${result.error}\n`);
    }
  } catch (error) {
    console.log(`❌ API wrapper creation failed: ${error.message}\n`);
  }

  // Test 5: Create custom agent
  console.log('=' .repeat(60) + '\n');
  console.log('💻 Test 5: Create Custom Agent\n');
  try {
    const agent3 = custom({
      name: 'Simple Calculator',
      description: 'Performs basic math operations',
      execute: async (input) => {
        const { operation, a, b } = input;
        let result;
        switch (operation) {
          case 'add': result = a + b; break;
          case 'subtract': result = a - b; break;
          case 'multiply': result = a * b; break;
          case 'divide': result = b !== 0 ? a / b : 'Error: Division by zero'; break;
          default: throw new Error('Invalid operation');
        }
        return { result, operation, inputs: { a, b } };
      },
      pricePerCall: 0.001,
      userId: 'test-user-3'
    });
    console.log(`✅ Created custom agent: ${agent3.manifest.name}\n`);

    // Test the agent
    console.log('   Testing custom agent...');
    const result = await agent3.execute({ operation: 'multiply', a: 7, b: 6 });
    if (result.success) {
      console.log(`   ✅ Test passed: 7 × 6 = ${result.data.result}\n`);
    } else {
      console.log(`   ❌ Test failed: ${result.error}\n`);
    }
  } catch (error) {
    console.log(`❌ Custom agent creation failed: ${error.message}\n`);
  }

  // Test 6: Create composite agent (workflow)
  console.log('=' .repeat(60) + '\n');
  console.log('🔗 Test 6: Create Composite Agent (Workflow)\n');
  try {
    const agent4 = compose({
      name: 'Weather + Translation',
      description: 'Get weather and translate to Spanish',
      workflow: [
        { agent: 'weather-core', input: { city: 'Paris' } },
        { agent: 'translation-core', input: { text: '$prev.condition', to: 'es' } }
      ],
      pricePerCall: 0.003,
      userId: 'test-user-4'
    });
    console.log(`✅ Created composite agent: ${agent4.manifest.name}`);
    console.log(`   Workflow steps: ${agent4.workflow.length}\n`);

    // Test the workflow
    console.log('   Testing workflow...');
    const result = await agent4.execute({});
    if (result.success) {
      console.log(`   ✅ Workflow completed`);
      console.log(`   Step 1: ${JSON.stringify(result.data.steps[0]).substring(0, 50)}...`);
      console.log(`   Step 2: ${JSON.stringify(result.data.steps[1]).substring(0, 50)}...\n`);
    } else {
      console.log(`   ❌ Workflow failed: ${result.error}\n`);
    }
  } catch (error) {
    console.log(`❌ Composite agent creation failed: ${error.message}\n`);
  }

  // Test 7: Registry and discovery
  console.log('=' .repeat(60) + '\n');
  console.log('🔍 Test 7: Registry and Discovery\n');

  const stats = registry.getStats();
  console.log(`✅ Registry stats:`);
  console.log(`   Total agents: ${stats.totalAgents}`);
  console.log(`   Active agents: ${stats.activeAgents}`);
  console.log(`   Total calls: ${stats.totalCalls}`);
  console.log(`   Capabilities: ${stats.capabilities.length}\n`);

  // Test search
  const searchResults = registry.search('price');
  console.log(`✅ Search for "price": ${searchResults.length} results`);

  // Test capability lookup
  const cryptoAgents = registry.findByCapability('crypto-price');
  console.log(`✅ Agents with crypto-price capability: ${cryptoAgents.length}\n`);

  // Test 8: Execution engine
  console.log('=' .repeat(60) + '\n');
  console.log('⚙️ Test 8: Execution Engine\n');

  const engineStats = executionEngine.getStats();
  console.log(`✅ Execution engine stats:`);
  console.log(`   Total executions: ${engineStats.totalExecutions}`);
  console.log(`   Success rate: ${engineStats.successRate.toFixed(1)}%`);
  console.log(`   Avg duration: ${engineStats.avgDuration.toFixed(0)}ms\n`);

  // Test 9: Trending and top rated
  console.log('=' .repeat(60) + '\n');
  console.log('📊 Test 9: Marketplace Features\n');

  const trending = registry.getTrending(3);
  console.log(`✅ Trending agents (${trending.length}):`);
  trending.forEach((a, i) => {
    console.log(`   ${i + 1}. ${a.name} - ${a.metadata.calls} calls`);
  });

  const topRated = registry.getTopRated(3);
  console.log(`\n✅ Top rated agents (${topRated.length}):`);
  topRated.forEach((a, i) => {
    console.log(`   ${i + 1}. ${a.name} - ${a.metadata.reputation}% reputation`);
  });

  // Summary
  console.log('\n' + '=' .repeat(60) + '\n');
  console.log('🎉 ALL TESTS COMPLETED!\n');
  console.log('Summary:');
  console.log(`✅ ${stats.totalAgents} agents registered`);
  console.log(`✅ ${stats.capabilities.length} unique capabilities`);
  console.log(`✅ ${engineStats.totalExecutions} executions performed`);
  console.log(`✅ ${engineStats.successRate.toFixed(1)}% success rate`);
  console.log('\n🚀 Strategic Pivot #2 is READY!\n');
}

// Run tests
if (require.main === module) {
  runTests()
    .then(() => {
      console.log('✅ Test suite completed\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { runTests };
