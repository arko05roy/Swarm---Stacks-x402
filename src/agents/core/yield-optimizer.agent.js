/**
 * DeFi Yield Optimizer Agent
 * Find best yield farming opportunities across DeFi protocols
 */

const Agent = require('../../core/Agent');
const fetch = require('node-fetch');

class YieldOptimizerAgent extends Agent {
  constructor(config = {}) {
    const agentConfig = {
      id: config.id || 'yield-optimizer-agent',
      name: config.name || 'DeFi Yield Optimizer',
      version: '1.0.0',
      description: config.description || 'Discover top yield farming opportunities across DeFi protocols with APY, TVL, and risk analysis',
      author: 'Swarm Core',
      capabilities: config.capabilities || ['yield', 'defi', 'farming', 'optimization', 'apy'],
      pricing: {
        basePrice: 0,
        pricePerCall: config.pricePerCall || 0.004,
        currency: 'STX'
      },
      schema: {
        input: {
          type: 'object',
          properties: {
            chain: { type: 'string', required: false },
            minTvl: { type: 'number', required: false },
            limit: { type: 'number', required: false }
          }
        },
        output: {
          type: 'object',
          properties: {
            topPools: { type: 'array' },
            recommendation: { type: 'string' },
            totalPoolsAnalyzed: { type: 'number' },
            timestamp: { type: 'number' }
          }
        }
      }
    };

    super(agentConfig);
    this.executeFunction = this.findBestYields.bind(this);
  }

  async findBestYields(input, context) {
    const chain = input.chain?.toLowerCase() || null;
    const minTvl = input.minTvl || 100000; // Minimum $100K TVL
    const limit = input.limit || 10;

    // Fetch yield data from DeFiLlama
    const response = await fetch(
      'https://yields.llama.fi/pools',
      {
        headers: { 'User-Agent': 'SwarmBot/1.0' },
        timeout: 10000
      }
    );

    if (!response.ok) {
      throw new Error(`DeFiLlama API returned ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    let pools = result.data || [];

    // Filter by chain if specified
    if (chain) {
      pools = pools.filter(pool => 
        pool.chain?.toLowerCase() === chain ||
        pool.chain?.toLowerCase().includes(chain)
      );
    }

    // Filter by minimum TVL
    pools = pools.filter(pool => (pool.tvlUsd || 0) >= minTvl);

    // Filter out pools with null/zero APY
    pools = pools.filter(pool => pool.apy && pool.apy > 0);

    // Sort by APY (descending) and take top N
    pools.sort((a, b) => (b.apy || 0) - (a.apy || 0));
    const topPools = pools.slice(0, limit);

    // Format the results
    const formattedPools = topPools.map(pool => ({
      protocol: pool.project || 'Unknown',
      pool: pool.symbol || pool.pool || 'N/A',
      apy: parseFloat((pool.apy || 0).toFixed(2)),
      apyBase: parseFloat((pool.apyBase || 0).toFixed(2)),
      apyReward: parseFloat((pool.apyReward || 0).toFixed(2)),
      tvl: pool.tvlUsd || 0,
      tvlFormatted: this.formatCurrency(pool.tvlUsd || 0),
      chain: pool.chain || 'Unknown',
      stablecoin: pool.stablecoin || false,
      ilRisk: pool.ilRisk || 'unknown',
      exposure: pool.exposure || 'single',
      poolId: pool.pool || null
    }));

    // Generate recommendation
    const recommendation = this.generateRecommendation(formattedPools, chain);

    return {
      topPools: formattedPools,
      recommendation,
      filters: {
        chain: chain || 'all chains',
        minTvl: `$${minTvl.toLocaleString()}`
      },
      totalPoolsAnalyzed: pools.length,
      source: 'DeFiLlama',
      timestamp: Date.now()
    };
  }

  generateRecommendation(pools, chain) {
    if (pools.length === 0) {
      return `No pools found matching your criteria${chain ? ` on ${chain}` : ''}. Try lowering the minimum TVL or selecting a different chain.`;
    }

    const topPool = pools[0];
    const stablePools = pools.filter(p => p.stablecoin);
    const safestPool = stablePools.length > 0 ? stablePools[0] : topPool;

    let rec = `🎯 Top Yield: ${topPool.protocol} - ${topPool.pool} offers ${topPool.apy}% APY with ${topPool.tvlFormatted} TVL on ${topPool.chain}.`;
    
    if (topPool.stablecoin) {
      rec += ` This is a stablecoin pool with lower risk.`;
    } else if (stablePools.length > 0) {
      rec += `\n\n💡 For lower risk, consider ${safestPool.protocol} - ${safestPool.pool} (${safestPool.apy}% APY, stablecoin).`;
    }

    // Add warning for very high APY
    if (topPool.apy > 100) {
      rec += `\n\n⚠️ High APY may indicate higher risk or temporary incentives. DYOR before investing.`;
    }

    return rec;
  }

  formatCurrency(value) {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  }
}

// Factory function for creating instances
function createYieldOptimizerAgent(config = {}) {
  return new YieldOptimizerAgent(config);
}

module.exports = { YieldOptimizerAgent, createYieldOptimizerAgent };
