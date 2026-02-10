# SWARM Agent SDK - Developer Guide

> **4 ways to create DeFi agents on SWARM - from zero-code templates to advanced workflows**

---

## Quick Start

```javascript
const { createAgent } = require('./src/sdk/createAgent');
const { registry } = require('./src/core/AgentRegistry');
```

---

## Method 1: Template-Based Creation (Zero Code)

Perfect for: **Non-developers, quick prototypes**

### Example 1: Create Crypto Price Agent

```javascript
const priceAgent = createAgent.fromTemplate('crypto-price', {
  name: 'My Bitcoin Tracker',
  pricePerCall: 0.002,
  defaultCoin: 'bitcoin'
});

registry.register(priceAgent, 'your_telegram_user_id');
```

### Example 2: Create DeFi TVL Tracker

```javascript
const tvlAgent = createAgent.fromTemplate('defi-tvl', {
  name: 'Protocol TVL Monitor',
  pricePerCall: 0.003
});

registry.register(tvlAgent, 'your_telegram_user_id');
```

### Available Templates:
- `crypto-price` - Real-time crypto prices
- `defi-tvl` - DeFi protocol TVL data
- `token-analytics` - Comprehensive token metrics
- `yield-optimizer` - Best yield farming opportunities
- `blockchain-explorer` - Query blockchain data
- `fee-estimator` - Gas/transaction fee estimates
- `portfolio-tracker` - Wallet portfolio analytics

---

## Method 2: API Wrapper (Turn Any API into an Agent)

Perfect for: **Integrating external data sources**

### Example 1: DeFiLlama Protocol Data

```javascript
const defiLlamaAgent = createAgent.apiWrapper({
  name: 'DeFi Protocol Info',
  description: 'Get detailed info about any DeFi protocol',
  author: 'your_username',
  pricePerCall: 0.004,
  
  // API configuration
  apiUrl: 'https://api.llama.fi/protocol/{protocol}',
  method: 'GET',
  
  // Input schema
  schema: {
    input: {
      type: 'object',
      properties: {
        protocol: { type: 'string', required: true }
      }
    }
  },
  
  // Transform API response
  transform: (data) => ({
    name: data.name,
    symbol: data.symbol,
    tvl: data.tvl,
    tvlFormatted: `$${(data.tvl / 1e9).toFixed(2)}B`,
    chain: data.chain,
    category: data.category,
    description: data.description,
    website: data.url
  })
});

registry.register(defiLlamaAgent, 'your_user_id');

// Usage
const result = await defiLlamaAgent.execute({ protocol: 'aave' });
```

### Example 2: Stacks Block Data

```javascript
const stacksBlockAgent = createAgent.apiWrapper({
  name: 'Stacks Block Info',
  description: 'Get block information from Stacks blockchain',
  author: 'blockchain_dev',
  pricePerCall: 0.002,
  
  apiUrl: 'https://api.testnet.hiro.so/extended/v1/block/by_height/{height}',
  method: 'GET',
  
  schema: {
    input: {
      type: 'object',
      properties: {
        height: { type: 'number', required: true }
      }
    }
  },
  
  transform: (data) => ({
    height: data.height,
    hash: data.hash,
    timestamp: new Date(data.burn_block_time * 1000).toISOString(),
    txCount: data.txs.length,
    minerTxId: data.miner_txid
  })
});

registry.register(stacksBlockAgent, 'your_user_id');
```

### Example 3: CoinGecko Trending Coins

```javascript
const trendingAgent = createAgent.apiWrapper({
  name: 'Crypto Trending Tracker',
  description: 'Get trending cryptocurrencies on CoinGecko',
  author: 'crypto_analyst',
  pricePerCall: 0.003,
  
  apiUrl: 'https://api.coingecko.com/api/v3/search/trending',
  method: 'GET',
  headers: {
    'User-Agent': 'SwarmBot/1.0'
  },
  
  transform: (data) => ({
    trending: data.coins.slice(0, 10).map(item => ({
      name: item.item.name,
      symbol: item.item.symbol,
      rank: item.item.market_cap_rank,
      score: item.item.score
    })),
    timestamp: Date.now()
  })
});

registry.register(trendingAgent, 'your_user_id');
```

---

## Method 3: Custom Code (Full Control)

Perfect for: **Complex logic, custom calculations, multi-step operations**

### Example 1: Impermanent Loss Calculator

```javascript
const ilCalculator = createAgent.custom({
  name: 'IL Calculator',
  description: 'Calculate impermanent loss for LP positions',
  author: 'defi_researcher',
  capabilities: ['calculator', 'defi', 'lp', 'il'],
  pricePerCall: 0.005,
  
  schema: {
    input: {
      type: 'object',
      properties: {
        initialPriceA: { type: 'number', required: true },
        initialPriceB: { type: 'number', required: true },
        currentPriceA: { type: 'number', required: true },
        currentPriceB: { type: 'number', required: true },
        liquidityAmount: { type: 'number', required: false }
      }
    }
  },
  
  execute: async (input) => {
    const { initialPriceA, initialPriceB, currentPriceA, currentPriceB, liquidityAmount = 1000 } = input;
    
    // Calculate price ratio change
    const initialRatio = initialPriceA / initialPriceB;
    const currentRatio = currentPriceA / currentPriceB;
    const priceRatioChange = currentRatio / initialRatio;
    
    // Calculate impermanent loss percentage
    const il = (2 * Math.sqrt(priceRatioChange)) / (1 + priceRatioChange) - 1;
    const ilPercentage = il * 100;
    
    // Calculate value comparison
    const lpValue = liquidityAmount * (1 + il);
    const hodlValue = liquidityAmount;
    const difference = lpValue - hodlValue;
    
    return {
      impermanentLoss: Math.abs(ilPercentage).toFixed(2) + '%',
      isLoss: il < 0,
      lpValue: lpValue.toFixed(2),
      hodlValue: hodlValue.toFixed(2),
      difference: difference.toFixed(2),
      priceRatioChange: ((priceRatioChange - 1) * 100).toFixed(2) + '%',
      recommendation: ilPercentage < -5 
        ? '⚠️ Significant IL - consider exiting position' 
        : '✅ IL is within acceptable range'
    };
  }
});

registry.register(ilCalculator, 'your_user_id');
```

### Example 2: Whale Alert Monitor

```javascript
const fetch = require('node-fetch');

const whaleMonitor = createAgent.custom({
  name: 'Whale Movement Tracker',
  description: 'Track large wallet transactions on Stacks',
  author: 'defi_whale',
  capabilities: ['whale', 'tracking', 'stacks'],
  pricePerCall: 0.008,
  
  schema: {
    input: {
      type: 'object',
      properties: {
        minAmount: { type: 'number', required: false },
        limit: { type: 'number', required: false }
      }
    }
  },
  
  execute: async (input) => {
    const minAmount = input.minAmount || 10000; // 10k STX minimum
    const limit = input.limit || 10;
    
    // Fetch recent transactions from Stacks API
    const response = await fetch(
      'https://api.testnet.hiro.so/extended/v1/tx?limit=50&type=token_transfer'
    );
    
    const data = await response.json();
    
    // Filter for large transfers
    const whaleMovements = data.results
      .filter(tx => {
        const amount = parseInt(tx.token_transfer?.amount || 0) / 1e6;
        return amount >= minAmount && tx.tx_status === 'success';
      })
      .slice(0, limit)
      .map(tx => ({
        txId: tx.tx_id,
        from: tx.sender_address,
        to: tx.token_transfer.recipient_address,
        amount: (parseInt(tx.token_transfer.amount) / 1e6).toFixed(2) + ' STX',
        timestamp: new Date(tx.burn_block_time * 1000).toISOString(),
        explorerUrl: `https://explorer.hiro.so/txid/${tx.tx_id}?chain=testnet`
      }));
    
    return {
      whaleMovements,
      count: whaleMovements.length,
      minAmount: minAmount + ' STX',
      summary: whaleMovements.length > 0
        ? `Found ${whaleMovements.length} large transfers (>${minAmount} STX)`
        : `No whale movements above ${minAmount} STX in recent blocks`
    };
  }
});

registry.register(whaleMonitor, 'your_user_id');
```

### Example 3: Portfolio Risk Analyzer

```javascript
const riskAnalyzer = createAgent.custom({
  name: 'Portfolio Risk Scorer',
  description: 'Analyze portfolio risk based on holdings diversity',
  author: 'crypto_analyst',
  capabilities: ['risk', 'portfolio', 'analysis'],
  pricePerCall: 0.01,
  
  execute: async (input) => {
    const { holdings } = input; // Array of { symbol, amount, value }
    
    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
    
    // Calculate concentration
    const concentrations = holdings.map(h => ({
      symbol: h.symbol,
      percentage: (h.value / totalValue * 100).toFixed(2)
    }));
    
    // Calculate Herfindahl-Hirschman Index (HHI)
    const hhi = holdings.reduce((sum, h) => {
      const share = h.value / totalValue;
      return sum + (share * share * 10000);
    }, 0);
    
    // Risk scoring
    let riskLevel, riskScore, recommendation;
    
    if (hhi > 5000) {
      riskLevel = 'HIGH';
      riskScore = 8;
      recommendation = 'Portfolio is highly concentrated. Diversify across more assets.';
    } else if (hhi > 2500) {
      riskLevel = 'MEDIUM';
      riskScore = 5;
      recommendation = 'Moderate concentration. Consider adding more positions.';
    } else {
      riskLevel = 'LOW';
      riskScore = 3;
      recommendation = 'Well diversified portfolio.';
    }
    
    return {
      totalValue: totalValue.toFixed(2),
      assetCount: holdings.length,
      concentrations,
      hhi: hhi.toFixed(0),
      riskLevel,
      riskScore: riskScore + '/10',
      recommendation,
      topHoldings: concentrations.slice(0, 3)
    };
  }
});

registry.register(riskAnalyzer, 'your_user_id');
```

---

## Method 4: Compose (Chain Multiple Agents)

Perfect for: **Complex workflows, multi-step analysis, agent-to-agent coordination**

### Example 1: Complete DeFi Research Agent

```javascript
const defiResearcher = createAgent.compose({
  name: 'Complete DeFi Analyzer',
  description: 'Comprehensive DeFi analysis: price + yields + fees',
  author: 'defi_researcher',
  pricePerCall: 0.015,
  
  workflow: [
    // Step 1: Get token price and analytics
    {
      agent: 'token-analytics-core',
      input: { token: '$input.token' }
    },
    
    // Step 2: Find best yield opportunities
    {
      agent: 'yield-optimizer-core',
      input: { 
        chain: 'ethereum', 
        limit: 5 
      }
    },
    
    // Step 3: Estimate transaction costs
    {
      agent: 'fee-estimator-core',
      input: { 
        chain: 'ethereum', 
        txType: 'transfer' 
      }
    }
  ],
  
  // Transform combined results
  transform: (results) => {
    const tokenData = results[0];
    const yieldData = results[1];
    const feeData = results[2];
    
    return {
      // Token Info
      token: tokenData.symbol,
      name: tokenData.name,
      price: tokenData.price,
      priceChange24h: tokenData.priceChange24h,
      marketCap: tokenData.marketCapFormatted,
      
      // Best Yield
      bestYield: {
        protocol: yieldData.topPools[0].protocol,
        pool: yieldData.topPools[0].pool,
        apy: yieldData.topPools[0].apy,
        tvl: yieldData.topPools[0].tvlFormatted
      },
      
      // Transaction Costs
      txCost: feeData.estimatedFeeUSD,
      gasPriceGwei: feeData.gasPriceGwei,
      
      // Combined Recommendation
      recommendation: `
📊 ${tokenData.symbol} Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 Price: $${tokenData.price.toFixed(2)} (${tokenData.priceChange24h > 0 ? '+' : ''}${tokenData.priceChange24h.toFixed(2)}%)
📈 Market Cap: ${tokenData.marketCapFormatted}

🌾 Best Yield Opportunity:
${yieldData.topPools[0].protocol} - ${yieldData.topPools[0].pool}
APY: ${yieldData.topPools[0].apy}% • TVL: ${yieldData.topPools[0].tvlFormatted}

⛽ Current Gas: ${feeData.gasPriceGwei} Gwei (~$${feeData.estimatedFeeUSD.toFixed(2)})

${tokenData.priceChange24h > 0 && yieldData.topPools[0].apy > 10
  ? '✅ Good entry point with strong yield opportunities'
  : '⚠️ Monitor price action before entering positions'
}
      `.trim()
    };
  }
});

registry.register(defiResearcher, 'your_user_id');
```

### Example 2: Portfolio Optimizer Workflow

```javascript
const portfolioOptimizer = createAgent.compose({
  name: 'Portfolio Optimizer Pro',
  description: 'Analyze wallet, find yields, estimate rebalancing costs',
  author: 'yield_farmer',
  pricePerCall: 0.02,
  
  workflow: [
    // Step 1: Get current portfolio state
    {
      agent: 'portfolio-tracker-core',
      input: { address: '$input.address' }
    },
    
    // Step 2: Find yield opportunities
    {
      agent: 'yield-optimizer-core',
      input: { 
        chain: 'stacks',
        minTvl: 50000,
        limit: 10
      }
    },
    
    // Step 3: Estimate rebalancing fees
    {
      agent: 'fee-estimator-core',
      input: { 
        chain: 'stacks',
        txType: 'transfer'
      }
    }
  ],
  
  transform: (results) => {
    const portfolio = results[0];
    const yields = results[1];
    const fees = results[2];
    
    const currentValue = portfolio.stxBalanceUSD;
    const topYield = yields.topPools[0];
    
    // Calculate potential returns
    const projectedAnnualReturn = currentValue * (topYield.apy / 100);
    const monthlyReturn = projectedAnnualReturn / 12;
    
    // Account for fees
    const rebalancingCost = fees.estimatedFee * 2; // Buy + sell
    const breakevenMonths = (rebalancingCost / monthlyReturn).toFixed(1);
    
    return {
      currentPortfolio: {
        balance: portfolio.totalSTX + ' STX',
        valueUSD: currentValue.toFixed(2),
        netFlow: portfolio.netFlow
      },
      
      optimization: {
        recommendedPool: topYield.protocol + ' - ' + topYield.pool,
        apy: topYield.apy,
        projectedMonthlyReturn: monthlyReturn.toFixed(2),
        projectedAnnualReturn: projectedAnnualReturn.toFixed(2)
      },
      
      costs: {
        rebalancingFee: rebalancingCost + ' STX',
        breakevenPeriod: breakevenMonths + ' months'
      },
      
      recommendation: parseFloat(breakevenMonths) < 3
        ? `✅ OPTIMIZE: You'll break even in ${breakevenMonths} months. Expected monthly return: $${monthlyReturn.toFixed(2)}`
        : `⚠️ HOLD: Breakeven takes ${breakevenMonths} months. Consider waiting for better yields or lower fees.`
    };
  }
});

registry.register(portfolioOptimizer, 'your_user_id');
```

### Example 3: Multi-Chain Arbitrage Scanner

```javascript
const arbitrageScanner = createAgent.compose({
  name: 'Cross-Chain Arb Scanner',
  description: 'Find arbitrage opportunities across chains',
  author: 'defi_whale',
  pricePerCall: 0.025,
  
  workflow: [
    // Get BTC price on different chains/platforms
    {
      agent: 'crypto-price-core',
      input: { coin: 'bitcoin', currency: 'usd' }
    },
    
    // Check Stacks fees
    {
      agent: 'fee-estimator-core',
      input: { chain: 'stacks', txType: 'transfer' }
    },
    
    // Check Ethereum fees
    {
      agent: 'fee-estimator-core',
      input: { chain: 'ethereum', txType: 'transfer' }
    }
  ],
  
  transform: (results) => {
    const btcPrice = results[0].price;
    const stacksFee = results[1].estimatedFeeUSD;
    const ethFee = results[2].estimatedFeeUSD;
    
    // Simulate price differences (in real implementation, fetch from multiple DEXs)
    const stacksPrice = btcPrice * (1 + (Math.random() * 0.02 - 0.01)); // ±1% variance
    const ethPrice = btcPrice * (1 + (Math.random() * 0.02 - 0.01));
    
    const priceDiff = Math.abs(stacksPrice - ethPrice);
    const totalFees = stacksFee + ethFee;
    const netProfit = priceDiff - totalFees;
    const profitPercent = (netProfit / btcPrice) * 100;
    
    return {
      opportunities: [
        {
          asset: 'BTC',
          buyOn: stacksPrice < ethPrice ? 'Stacks' : 'Ethereum',
          sellOn: stacksPrice < ethPrice ? 'Ethereum' : 'Stacks',
          buyPrice: Math.min(stacksPrice, ethPrice).toFixed(2),
          sellPrice: Math.max(stacksPrice, ethPrice).toFixed(2),
          priceDiff: priceDiff.toFixed(2),
          fees: totalFees.toFixed(2),
          netProfit: netProfit.toFixed(2),
          profitPercent: profitPercent.toFixed(3) + '%',
          viable: netProfit > 0
        }
      ],
      
      recommendation: netProfit > 0
        ? `✅ Arbitrage opportunity: ${profitPercent.toFixed(2)}% profit after fees`
        : `❌ No profitable arbitrage: Fees (${totalFees.toFixed(2)}) exceed price difference (${priceDiff.toFixed(2)})`
    };
  }
});

registry.register(arbitrageScanner, 'your_user_id');
```

---

## Advanced Patterns

### Error Handling in Custom Agents

```javascript
const robustAgent = createAgent.custom({
  name: 'Error-Safe Agent',
  description: 'Handles API failures gracefully',
  pricePerCall: 0.003,
  
  execute: async (input) => {
    try {
      const response = await fetch('https://api.example.com/data');
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      return { data, success: true };
      
    } catch (error) {
      // Return fallback data or cached results
      return {
        error: error.message,
        success: false,
        fallbackData: 'Using cached data from 5 minutes ago',
        timestamp: Date.now()
      };
    }
  }
});
```

### Conditional Workflows in Compose

```javascript
const conditionalWorkflow = createAgent.compose({
  name: 'Smart DeFi Strategy',
  pricePerCall: 0.02,
  
  workflow: [
    // Always check price first
    {
      agent: 'crypto-price-core',
      input: { coin: 'ethereum' }
    },
    
    // Conditionally execute based on price
    {
      agent: 'yield-optimizer-core',
      input: { chain: 'ethereum' },
      condition: (prevResults) => prevResults[0].price > 3000 // Only if ETH > $3000
    }
  ],
  
  transform: (results) => {
    if (results.length === 1) {
      return {
        message: 'ETH below $3000. Not analyzing yields.',
        currentPrice: results[0].price
      };
    }
    
    return {
      ethPrice: results[0].price,
      bestYield: results[1].topPools[0]
    };
  }
});
```

### Rate Limiting & Caching

```javascript
const cachedAgent = createAgent.custom({
  name: 'Cached Data Agent',
  pricePerCall: 0.001,
  
  execute: async (input) => {
    const cacheKey = `cache_${JSON.stringify(input)}`;
    const cacheDuration = 5 * 60 * 1000; // 5 minutes
    
    // Check cache
    if (this.cache && this.cache[cacheKey]) {
      const cached = this.cache[cacheKey];
      if (Date.now() - cached.timestamp < cacheDuration) {
        return { ...cached.data, fromCache: true };
      }
    }
    
    // Fetch fresh data
    const freshData = await fetchDataFromAPI(input);
    
    // Store in cache
    this.cache = this.cache || {};
    this.cache[cacheKey] = {
      data: freshData,
      timestamp: Date.now()
    };
    
    return { ...freshData, fromCache: false };
  }
});
```

---

## Testing Your Agents

```javascript
// Test individual agent
const testAgent = async () => {
  const myAgent = registry.get('my-agent-id');
  
  const result = await myAgent.execute({
    token: 'bitcoin'
  });
  
  console.log('Result:', result);
  console.log('Success:', result.success);
  console.log('Data:', result.data);
};

// Test composite workflow
const testWorkflow = async () => {
  const workflow = registry.get('defi-analyzer');
  
  const result = await workflow.execute({
    token: 'ethereum'
  });
  
  console.log('Workflow output:', result.data);
};
```

---

## Best Practices

1. **Input Validation**: Always define schema for inputs
2. **Error Handling**: Use try-catch and return meaningful errors
3. **Pricing**: Price based on API costs + compute time
4. **Timeouts**: Set reasonable timeouts (5-10s for API calls)
5. **Caching**: Cache expensive API calls when possible
6. **Documentation**: Clear descriptions help users find your agent
7. **Testing**: Test with edge cases before deploying

---

## Publishing to Marketplace

```javascript
// After creating your agent
registry.register(myAgent, 'your_telegram_user_id');

// Users can now find it via:
// - /browse_store
// - /search [query]
// - LLM orchestrator (automatic discovery)
```

---

## Support

For more help:
- Check `/help` in Telegram bot
- Review core agent implementations in `/src/agents/core/`
- Ask in the SWARM community

---

**Happy Building!** 🚀
