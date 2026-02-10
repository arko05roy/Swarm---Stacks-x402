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
  transform: (data) => {
    // Your data transformation goes here
    // (parse the API response, format numbers, etc.)
    return {}; // return the good stuff
  }
});

registry.register(defiLlamaAgent, 'your_user_id');

// Usage
const result = await defiLlamaAgent.execute({ protocol: 'aave' }); // magic happens
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
  
  transform: (data) => {
    // Your blockchain data parsing goes here
    return {}; // blocks and hashes and stuff
  }
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
  
  transform: (data) => {
    // Your trending coin logic goes here
    // (map, filter, sort - you know the drill)
    return {}; // the hot coins of the day
  }
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

    // Your complex IL calculation goes here
    // (spoiler: should've just HODL'd)

    return {
      impermanentLoss: '3.50%',
      isLoss: true, // narrator: it was always a loss
      lpValue: '996.50',
      hodlValue: '1000.00',
      difference: '-3.50',
      priceRatioChange: '5.00%',
      recommendation: '⚠️ Your IL formula output goes here'
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
    const minAmount = input.minAmount || 10000;
    const limit = input.limit || 10;

    // Your whale tracking logic goes here
    // 1. Fetch transactions from blockchain API
    // 2. Filter for big spenders (whales 🐋)
    // 3. Map to clean format
    // 4. Return with dramatic flair

    return {
      whaleMovements: [], // the big fish
      count: 0,
      minAmount: minAmount + ' STX',
      summary: 'No whales detected (yet)'
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

    // Your risk analysis algorithm goes here
    // 1. Calculate portfolio concentration (HHI index or whatever)
    // 2. Do some fancy math that impresses people at parties
    // 3. Assign risk scores with authority
    // 4. Give unsolicited financial advice

    return {
      totalValue: '0.00',
      assetCount: holdings?.length || 0,
      concentrations: [],
      hhi: '0',
      riskLevel: 'MEDIUM',
      riskScore: '5/10',
      recommendation: 'Your risk assessment goes here',
      topHoldings: []
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
    // Your multi-agent result aggregation goes here
    // 1. Extract data from each agent result
    // 2. Combine them into something useful
    // 3. Add some emoji for credibility
    // 4. Format a nice recommendation

    return {
      token: 'TOKEN',
      name: 'Token Name',
      price: 0,
      priceChange24h: 0,
      marketCap: '$0',
      bestYield: {},
      txCost: 0,
      gasPriceGwei: 0,
      recommendation: `
📊 Your combined analysis goes here
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
(merge all the agent outputs into one coherent story)
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
    // Your portfolio optimization logic goes here
    // 1. Get current portfolio state from results[0]
    // 2. Get yield opportunities from results[1]
    // 3. Get fees from results[2]
    // 4. Do ROI calculations
    // 5. Determine if rebalancing is worth the gas fees

    return {
      currentPortfolio: {
        balance: '0 STX',
        valueUSD: '0.00',
        netFlow: 0
      },
      optimization: {
        recommendedPool: 'Best Pool Name',
        apy: 0,
        projectedMonthlyReturn: '0.00',
        projectedAnnualReturn: '0.00'
      },
      costs: {
        rebalancingFee: '0 STX',
        breakevenPeriod: '0 months'
      },
      recommendation: 'Your optimization advice goes here'
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
    // Your cross-chain arbitrage algorithm goes here
    // 1. Get prices from different chains/DEXs
    // 2. Calculate price differences
    // 3. Factor in all the fees (because there are ALWAYS more fees)
    // 4. Determine if you can actually make money
    // (Spoiler: by the time you execute, the opportunity is gone)

    return {
      opportunities: [
        {
          asset: 'BTC',
          buyOn: 'Chain A',
          sellOn: 'Chain B',
          buyPrice: '0.00',
          sellPrice: '0.00',
          priceDiff: '0.00',
          fees: '0.00',
          netProfit: '0.00',
          profitPercent: '0.000%',
          viable: false // spoiler: it never is
        }
      ],
      recommendation: 'Your arbitrage verdict goes here'
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
      // Your API call goes here
      // (it will probably fail)

      return { data: {}, success: true };

    } catch (error) {
      // Your error handling goes here
      // (return cached data, blame the API, etc.)
      return {
        error: error.message,
        success: false,
        fallbackData: 'Your fallback strategy goes here',
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
    // Your conditional logic goes here
    // (check if certain conditions were met in the workflow)

    if (results.length === 1) {
      return {
        message: 'Condition not met, skipped some steps',
        currentPrice: 0
      };
    }

    return {
      // Your full workflow results go here
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

    // Your caching logic goes here
    // 1. Check if data exists in cache
    // 2. Check if cache is still fresh
    // 3. Return cached data if valid
    // 4. Otherwise fetch fresh data and cache it

    return { fromCache: false }; // your data here
  }
});
```

---

## Testing Your Agents

```javascript
// Test individual agent
const testAgent = async () => {
  const myAgent = registry.get('my-agent-id');

  // Your test execution goes here
  const result = await myAgent.execute({ token: 'bitcoin' });

  console.log('Result:', result); // pray it works
};

// Test composite workflow
const testWorkflow = async () => {
  const workflow = registry.get('defi-analyzer');

  // Your workflow test goes here
  const result = await workflow.execute({ token: 'ethereum' });

  console.log('Workflow output:', result.data); // spoiler: it's beautiful
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
