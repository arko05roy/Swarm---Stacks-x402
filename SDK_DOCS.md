# 🧪 Swarm SDK Documentation

**Build autonomous AI agents with 4 simple methods**

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Agent Creation Methods](#agent-creation-methods)
3. [Agent Standard Interface](#agent-standard-interface)
4. [Core Classes](#core-classes)
5. [Schema Validation](#schema-validation)
6. [Agent Composition](#agent-composition)
7. [Liquidity Pool Integration](#liquidity-pool-integration)
8. [Advanced Features](#advanced-features)
9. [Examples](#examples)
10. [Best Practices](#best-practices)

---

## Quick Start

### Installation

```bash
npm install @swarm/sdk
# or
const createAgent = require('./src/sdk/createAgent');
```

### Create Your First Agent (30 seconds)

```javascript
const agent = await createAgent.fromTemplate('crypto-price', {
  name: 'Bitcoin Price Oracle',
  defaultCoin: 'bitcoin',
  pricing: { perCall: 0.01 }
});

// Use it
const result = await agent.execute({ coin: 'ethereum' });
console.log(result); // { price: 4200.50, symbol: 'ETH', ... }
```

---

## Agent Creation Methods

### Method 1: `fromTemplate()` - Quick Start

Perfect for: Beginners, rapid prototyping, common use cases

**Available Templates:**
- `crypto-price` - Cryptocurrency price oracle
- `weather` - Weather information
- `defi-tvl` - DeFi protocol TVL data
- `translation` - Text translation
- `country-info` - Country statistics
- `joke` - Random jokes
- `api-wrapper` - Generic API wrapper

**Example:**

```javascript
const priceAgent = await createAgent.fromTemplate('crypto-price', {
  name: 'My Price Bot',
  defaultCoin: 'bitcoin',
  pricing: {
    basePrice: 0.01,
    perCall: 0.001
  },
  metadata: {
    description: 'Real-time crypto prices',
    tags: ['crypto', 'price', 'defi']
  }
});
```

**Configuration Options:**
```javascript
{
  name: string,              // Agent display name
  pricing: {
    basePrice: number,       // One-time registration cost (STX)
    perCall: number          // Cost per execution (STX)
  },
  metadata: {
    description: string,
    tags: string[],
    author: string
  },
  // Template-specific options
  defaultCoin: string,       // For crypto-price
  defaultCity: string,       // For weather
  targetLanguage: string     // For translation
}
```

---

### Method 2: `apiWrapper()` - API Integration

Perfect for: Wrapping any REST API, power users

**Features:**
- Automatic URL parameter substitution
- Response transformation
- Error handling
- Rate limiting
- Caching support

**Example:**

```javascript
const githubAgent = await createAgent.apiWrapper({
  name: 'GitHub Stars Tracker',
  endpoint: 'https://api.github.com/repos/{owner}/{repo}',
  method: 'GET',
  headers: {
    'Accept': 'application/vnd.github.v3+json'
  },
  transform: (data) => ({
    stars: data.stargazers_count,
    forks: data.forks_count,
    watchers: data.watchers_count,
    openIssues: data.open_issues_count
  }),
  pricing: { perCall: 0.005 },
  capabilities: ['github', 'repo-stats'],
  schema: {
    input: {
      type: 'object',
      properties: {
        owner: { type: 'string', required: true },
        repo: { type: 'string', required: true }
      }
    },
    output: {
      type: 'object',
      properties: {
        stars: { type: 'number' },
        forks: { type: 'number' }
      }
    }
  }
});

// Use it
const result = await githubAgent.execute({
  owner: 'bitcoin',
  repo: 'bitcoin'
});
console.log(result.stars); // 72450
```

**Advanced Options:**

```javascript
{
  name: string,
  endpoint: string,              // URL with {params}
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  headers: object,
  transform: (data) => object,   // Transform response
  validate: (input) => boolean,  // Input validation
  retry: {
    attempts: 3,
    backoff: 'exponential'
  },
  cache: {
    ttl: 60000,                  // Cache for 60s
    key: (input) => string       // Custom cache key
  },
  rateLimit: {
    maxRequests: 10,
    perWindow: 60000             // 10 requests per minute
  }
}
```

---

### Method 3: `custom()` - Full Control

Perfect for: Advanced users, custom logic, ML models

**Features:**
- Full JavaScript/Node.js environment
- Access to npm packages
- Complex business logic
- ML model integration
- Database queries

**Example 1: Sentiment Analysis**

```javascript
const sentimentAgent = await createAgent.custom({
  name: 'Sentiment Analyzer',
  capabilities: ['sentiment', 'nlp', 'text-analysis'],
  execute: async (input, context) => {
    // Your custom logic
    const { Sentiment } = require('sentiment');
    const sentiment = new Sentiment();
    const result = sentiment.analyze(input.text);

    return {
      score: result.score,
      comparative: result.comparative,
      positive: result.positive,
      negative: result.negative,
      label: result.score > 0 ? 'positive' :
             result.score < 0 ? 'negative' : 'neutral'
    };
  },
  pricing: { perCall: 0.01 },
  schema: {
    input: {
      type: 'object',
      properties: {
        text: { type: 'string', required: true, minLength: 1 }
      }
    },
    output: {
      type: 'object',
      properties: {
        score: { type: 'number' },
        label: { type: 'string', enum: ['positive', 'negative', 'neutral'] }
      }
    }
  },
  metadata: {
    description: 'Analyzes sentiment of text using NLP',
    tags: ['nlp', 'sentiment', 'ai']
  }
});
```

**Example 2: Database Query Agent**

```javascript
const dbAgent = await createAgent.custom({
  name: 'User Stats Lookup',
  capabilities: ['database', 'analytics'],
  execute: async (input, context) => {
    const db = require('./database');
    const stats = await db.query(`
      SELECT
        COUNT(*) as total_users,
        AVG(age) as avg_age,
        MAX(created_at) as last_signup
      FROM users
      WHERE country = ?
    `, [input.country]);

    return stats[0];
  },
  estimateCost: (input) => {
    // Dynamic pricing based on complexity
    return input.includeDetails ? 0.02 : 0.01;
  },
  pricing: { perCall: 0.01 }
});
```

**Example 3: ML Model Integration**

```javascript
const imageAgent = await createAgent.custom({
  name: 'Image Classifier',
  capabilities: ['computer-vision', 'ml', 'classification'],
  execute: async (input, context) => {
    const tf = require('@tensorflow/tfjs-node');
    const model = await tf.loadLayersModel('file://./model.json');

    // Preprocess image
    const imageTensor = await preprocessImage(input.imageUrl);

    // Run inference
    const predictions = await model.predict(imageTensor);
    const topClasses = await getTopK(predictions, 5);

    return {
      classes: topClasses,
      confidence: topClasses[0].probability
    };
  },
  pricing: { perCall: 0.05 }, // Higher cost for ML
  timeout: 60000 // 60 second timeout
});
```

---

### Method 4: `compose()` - Chain Agents

Perfect for: Complex workflows, multi-step processes

**Features:**
- Sequential execution
- Variable passing with `$prev`
- Error handling
- Automatic cost calculation
- Parallel execution (coming soon)

**Example 1: Simple Chain**

```javascript
const newsDigest = await createAgent.compose({
  name: 'Crypto News Digest',
  capabilities: ['news', 'crypto', 'summary'],
  workflow: [
    {
      agent: 'news-fetcher',
      input: { topic: 'bitcoin', limit: 10 }
    },
    {
      agent: 'sentiment-analyzer',
      input: { texts: '$prev.articles' } // Use previous output
    },
    {
      agent: 'summarizer',
      input: {
        text: '$prev',                   // Entire previous output
        format: 'bullets',
        maxLength: 500
      }
    }
  ],
  pricing: { perCall: 0.025 },
  metadata: {
    description: 'Fetches crypto news, analyzes sentiment, and creates summary'
  }
});

// Execute workflow
const result = await newsDigest.execute({});
console.log(result.final); // Final summary with sentiment
```

**Example 2: Complex Multi-Agent Workflow**

```javascript
const marketAnalysis = await createAgent.compose({
  name: 'Market Analysis Pro',
  workflow: [
    // Step 1: Get prices for multiple coins
    {
      agent: 'crypto-price',
      input: { coins: ['bitcoin', 'ethereum', 'solana'] }
    },

    // Step 2: Get DeFi TVL data
    {
      agent: 'defi-tvl',
      input: { protocols: ['uniswap', 'aave', 'curve'] }
    },

    // Step 3: Combine and analyze
    {
      agent: 'data-analyzer',
      input: {
        prices: '$step1',              // Reference step 1
        tvl: '$prev',                  // Reference previous (step 2)
        includeCorrelation: true
      }
    },

    // Step 4: Generate report
    {
      agent: 'report-generator',
      input: {
        data: '$prev',
        format: 'pdf',
        sections: ['summary', 'charts', 'recommendations']
      }
    },

    // Step 5: Translate to Spanish (optional)
    {
      agent: 'translation',
      input: {
        text: '$prev.summary',
        targetLanguage: 'es'
      },
      continueOnError: true            // Optional step
    }
  ],
  pricing: { perCall: 0.1 },
  timeout: 120000 // 2 minute timeout
});
```

**Variable Passing Syntax:**

```javascript
// Access entire previous output
input: { data: '$prev' }

// Access specific field
input: { text: '$prev.summary' }

// Access nested field
input: { value: '$prev.data.result.price' }

// Access specific step (by index, 0-based)
input: { prices: '$step0', tvl: '$step1' }

// Access array element
input: { firstArticle: '$prev.articles[0]' }

// Multiple references
input: {
  prices: '$step0.prices',
  sentiment: '$step2.score',
  context: '$prev'
}
```

---

## Agent Standard Interface

Every agent, regardless of creation method, implements this interface:

### Manifest

```javascript
{
  id: string,                    // Unique identifier (auto-generated)
  name: string,                  // Display name
  version: string,               // Semantic version (1.0.0)
  capabilities: string[],        // Tags for discovery
  pricing: {
    basePrice: number,           // Registration cost (STX)
    pricePerCall: number,        // Execution cost (STX)
    currency: 'STX'
  },
  schema: {
    input: JSONSchema,           // Input validation
    output: JSONSchema           // Output validation
  },
  metadata: {
    description: string,
    author: string,
    tags: string[],
    createdAt: number,
    updatedAt: number
  },
  metrics: {
    totalCalls: number,
    successfulCalls: number,
    failedCalls: number,
    totalEarnings: number,
    avgResponseTime: number,
    reputation: number           // 0-100
  }
}
```

### Methods

```javascript
class Agent {
  // Execute agent logic
  async execute(input: object, context: object): Promise<object>

  // Validate input against schema
  validateInput(input: object): void

  // Validate output against schema
  validateOutput(output: object): void

  // Health check
  async ping(): Promise<{ status: string, latency: number }>

  // Estimate execution cost
  estimateCost(input: object): number

  // Get agent info
  getManifest(): object

  // Update metrics
  updateMetrics(duration: number, success: boolean): void
}
```

---

## Core Classes

### AgentRegistry

Central registry for agent discovery and routing.

```javascript
const { agentRegistry } = require('./src/core/AgentRegistry');

// Register agent
agentRegistry.register(agent);

// Get agent by ID
const agent = agentRegistry.get('crypto-price-v1');

// List all agents
const allAgents = agentRegistry.list();

// Search by name/capability
const results = agentRegistry.search('crypto');

// Find by capability
const cryptoAgents = agentRegistry.findByCapability('crypto-price');

// Find best agent for task
const best = agentRegistry.findBestAgent('crypto-price', {
  maxCost: 0.02,
  minReputation: 80
});

// Get trending agents
const trending = agentRegistry.getTrending(10);

// Get top rated
const topRated = agentRegistry.getTopRated(10);
```

---

### ExecutionEngine

Sandboxed agent execution with timeouts and limits.

```javascript
const { executionEngine } = require('./src/core/ExecutionEngine');

// Execute agent
const result = await executionEngine.execute(agent, input, {
  timeout: 30000,              // 30 second timeout
  userId: 'user123',
  trackMetrics: true
});

// Get execution history
const history = executionEngine.getHistory('user123');

// Clear history
executionEngine.clearHistory('user123');
```

---

### Composer

Workflow execution engine.

```javascript
const { Composer } = require('./src/sdk/Composer');

const composer = new Composer({
  name: 'My Workflow',
  workflow: [...],
  timeout: 60000
});

// Execute workflow
const result = await composer.execute(input, context);

// Get workflow info
const info = composer.getWorkflowInfo();
```

---

## Schema Validation

### Input Schema

```javascript
{
  type: 'object',
  properties: {
    symbol: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 10,
      pattern: '^[A-Z]+$'
    },
    limit: {
      type: 'number',
      required: false,
      minimum: 1,
      maximum: 100,
      default: 10
    }
  }
}
```

### Output Schema

```javascript
{
  type: 'object',
  properties: {
    price: {
      type: 'number',
      required: true,
      minimum: 0
    },
    timestamp: {
      type: 'number',
      required: true
    }
  }
}
```

### Validation

```javascript
const { AgentSchema } = require('./src/sdk/AgentSchema');

// Validate input
AgentSchema.validate(input, schema.input);

// Validate output
AgentSchema.validate(output, schema.output);
```

---

## Liquidity Pool Integration

### Borrowing for Composite Agents

```javascript
const { liquidityPool } = require('./src/platform/LiquidityPool');

// Check if can borrow
const canBorrow = await liquidityPool.canBorrow('agent-id', 0.05);

// Borrow
const loan = await liquidityPool.borrow(
  'agent-id',    // Agent ID
  0.05,          // Amount (STX)
  95,            // Reputation score
  'Execute composite workflow'
);
console.log(loan.loanId);

// Complete work...

// Repay with profit share
const repayment = await liquidityPool.repay(
  'agent-id',
  loan.loanId,
  0.05,          // Original amount
  0.01           // Profit earned (10% goes to pool)
);
```

### Pool Statistics

```javascript
// Get pool stats
const stats = await liquidityPool.getPoolStats();
console.log(stats);
/*
{
  totalLiquidity: 245.5,
  totalBorrowed: 191.5,
  utilization: 78,
  activeLoanCount: 47,
  apy: 18.5,
  avgLoanSize: 0.04
}
*/

// Get agent reputation
const rep = await liquidityPool.getAgentReputation('agent-id');
console.log(rep.score); // 95
```

---

## Advanced Features

### Custom Pricing Logic

```javascript
const agent = await createAgent.custom({
  name: 'Dynamic Pricer',
  execute: async (input) => { /* ... */ },
  estimateCost: (input) => {
    // Dynamic pricing based on input
    let cost = 0.01; // Base
    if (input.detailed) cost += 0.01;
    if (input.format === 'pdf') cost += 0.02;
    return cost;
  }
});
```

### Error Handling

```javascript
const workflow = await createAgent.compose({
  name: 'Resilient Workflow',
  workflow: [
    { agent: 'step1', input: {} },
    {
      agent: 'step2',
      input: { data: '$prev' },
      continueOnError: true,  // Don't fail workflow if this fails
      fallback: { data: null } // Use fallback on error
    },
    { agent: 'step3', input: {} }
  ]
});
```

### Timeouts

```javascript
// Per-agent timeout
const agent = await createAgent.custom({
  name: 'Slow Agent',
  execute: async (input) => { /* ... */ },
  timeout: 60000 // 60 seconds
});

// Workflow timeout
const workflow = await createAgent.compose({
  name: 'Long Workflow',
  workflow: [...],
  timeout: 120000 // 2 minutes for entire workflow
});
```

---

## Examples

### Example 1: Weather + Translation

```javascript
const weatherTranslator = await createAgent.compose({
  name: 'Weather Translator',
  workflow: [
    {
      agent: 'weather',
      input: { city: 'Paris' }
    },
    {
      agent: 'translation',
      input: {
        text: '$prev.summary',
        targetLanguage: 'es'
      }
    }
  ]
});

const result = await weatherTranslator.execute({});
console.log(result.final); // "Soleado, 18°C en París"
```

### Example 2: Crypto Portfolio Tracker

```javascript
const portfolio = await createAgent.compose({
  name: 'Portfolio Tracker',
  workflow: [
    {
      agent: 'crypto-price',
      input: { coins: ['bitcoin', 'ethereum'] }
    },
    {
      agent: 'calculator',
      input: {
        prices: '$prev',
        holdings: { bitcoin: 0.5, ethereum: 2.0 }
      }
    }
  ]
});

const value = await portfolio.execute({});
console.log(value.final.totalValue); // Portfolio value in USD
```

---

## Best Practices

### 1. Schema Validation
Always define input/output schemas for reliability.

### 2. Error Handling
Use `continueOnError` for optional steps in workflows.

### 3. Timeouts
Set appropriate timeouts based on expected execution time.

### 4. Pricing
Price fairly: simple queries (0.001-0.01 STX), complex ML (0.05-0.1 STX).

### 5. Capabilities
Use descriptive capability tags for better discovery.

### 6. Testing
Test agents before deploying to marketplace.

```javascript
const result = await agent.execute(testInput);
assert(result.success === true);
```

### 7. Reputation
Build reputation by delivering reliably and repaying loans on time.

### 8. Documentation
Add clear descriptions and examples in metadata.

---

## Support

- **Docs**: [SDK_DOCS.md](./SDK_DOCS.md)
- **Examples**: [/examples](./examples)
- **Issues**: [GitHub Issues](https://github.com/yourusername/swarm/issues)

---

**Built with ❤️ for the Swarm ecosystem**
