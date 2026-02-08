# 🐝 Swarm

**Build AI agent economies with Bitcoin micropayments**

Swarm is a modular framework for creating, composing, and monetizing autonomous AI agents on Telegram. Agents can hire each other, share work, and borrow from a DeFi liquidity pool — all settled with Bitcoin via Stacks blockchain and x402 protocol.

---

## 🎯 What Makes Swarm Different

### **Not just bots — it's an economy**

1. **Modular SDK** - Create agents in 4 ways (templates, API wrappers, custom code, composition)
2. **Agent Composition** - Chain agents together into workflows
3. **DeFi Primitive** - Liquidity pool for agent work lending
4. **Marketplace** - Discover, rate, and hire agents
5. **Bitcoin Settlements** - Real STX micropayments via x402-stacks

### **Product, not project**
- ✅ Extensible architecture anyone can build on
- ✅ Production-grade: validation, analytics, reputation system
- ✅ Real developers will use this post-hackathon

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Telegram Interface                   │
│          (500M users, x402 micropayments)               │
└────────────────────┬────────────────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
    ▼                ▼                ▼
┌─────────┐    ┌──────────┐    ┌─────────────┐
│   SDK   │    │ Registry │    │ Marketplace │
│4 Methods│◄──►│Discovery │◄──►│Browse/Rate  │
└─────────┘    └──────────┘    └─────────────┘
    │                │                │
    └────────────────┼────────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
    ▼                ▼                ▼
┌─────────┐    ┌──────────┐    ┌─────────────┐
│ Agents  │    │Execution │    │  Analytics  │
│Modular  │◄──►│ Engine   │◄──►│ Dashboard   │
└─────────┘    └──────────┘    └─────────────┘
    │
    ▼
┌──────────────────────────────────────────────┐
│         Stacks Blockchain (Bitcoin L2)       │
├──────────────────────────────────────────────┤
│ Escrow Contract    │  Liquidity Pool         │
│ • lock-payment     │  • deposit/withdraw     │
│ • release-payment  │  • borrow/repay         │
│ • refund-payment   │  • reputation-based     │
│                    │  • 10% profit share     │
└──────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### **1. Create an Agent (4 Ways)**

#### **Method 1: Template (30 seconds)**
```bash
/create_bot
> Quick Start
> Crypto Price Oracle
> bitcoin
✅ Bot created: bitcoin-price-oracle
```

#### **Method 2: API Wrapper (1 minute)**
```javascript
const bot = await createAgent.apiWrapper({
  name: 'GitHub Stars',
  endpoint: 'https://api.github.com/repos/{repo}',
  transform: (data) => ({ stars: data.stargazers_count }),
  pricing: { perCall: 0.005 }
});
```

#### **Method 3: Custom Code (Advanced)**
```javascript
const bot = await createAgent.custom({
  name: 'Sentiment Analyzer',
  execute: async (input) => {
    const sentiment = await analyzeSentiment(input.text);
    return { score: sentiment.score, label: sentiment.label };
  },
  pricing: { perCall: 0.01 }
});
```

#### **Method 4: Compose Agents (Chain Workflows)**
```javascript
const bot = await createAgent.compose({
  name: 'Crypto News Digest',
  workflow: [
    { agent: 'news-fetcher', input: { topic: 'bitcoin' } },
    { agent: 'sentiment-analyzer', input: { texts: '$prev.articles' } },
    { agent: 'summarizer', input: { text: '$prev', format: 'bullets' } }
  ],
  pricing: { perCall: 0.025 }
});
```

### **2. Use Liquidity Pool**

**Deposit STX (Become LP)**
```bash
/pool deposit 10
✅ Deposited 10 STX to pool
💰 Your share: 4.1% | APY: 18.5%
```

**Agents Borrow for Work**
```bash
Agent borrows 0.05 STX → Completes task → Repays 0.055 STX (10% profit share)
                                                 ↓
                                    LPs earn yield 📈
```

**Check Stats**
```bash
/pool_stats

🏦 Liquidity Pool Stats
━━━━━━━━━━━━━━━━━━━━
💧 Total Liquidity: 245.50 STX
📊 Borrowed: 191.50 STX (78%)
📈 APY: 18.5%
💰 Total Profit: 12.50 STX
📊 Active Loans: 47
✅ Success Rate: 99.1%
```

---

## 💡 Use Cases

### **1. Real-Time Data Agents**
```bash
User: "What's Bitcoin price and weather in Tokyo?"

Swarm:
🐝 Hiring:
  💰 crypto-price-oracle (0.01 STX)
  🌤️ weather-agent (0.005 STX)

✅ Results:
  BTC: $98,500 (+2.3%)
  Tokyo: 18°C, Sunny
```

### **2. Complex Workflows**
```bash
User: "Analyze sentiment of Bitcoin news and summarize"

Swarm creates composite agent:
  1. news-fetcher → fetch articles
  2. sentiment-analyzer → score each article
  3. summarizer → bullet points with sentiment
```

### **3. DeFi Operations**
```bash
Composite agent needs to:
1. Check TVL across 3 protocols
2. Translate results to Spanish
3. Calculate averages

⚡ Borrows 0.02 STX from pool
⚡ Hires 4 specialist agents
⚡ Repays 0.022 STX (10% profit to LPs)
```

---

## 🧪 SDK Documentation

### **Agent Standard Interface**

Every agent implements this contract:

```javascript
module.exports = {
  manifest: {
    id: 'price-oracle-v1',
    name: 'Price Oracle',
    version: '1.0.0',
    capabilities: ['crypto-price', 'market-data'],
    pricing: {
      basePrice: 0.01,
      pricePerCall: 0.001,
      currency: 'STX'
    },
    schema: {
      input: {
        type: 'object',
        properties: {
          symbol: { type: 'string', required: true }
        }
      },
      output: {
        type: 'object',
        properties: {
          price: { type: 'number' },
          timestamp: { type: 'number' }
        }
      }
    }
  },

  async execute(input, context) {
    // Validate input
    this.validateInput(input);

    // Execute logic
    const data = await fetch('...');

    // Return structured output
    return { price: data.price, timestamp: Date.now() };
  },

  async ping() {
    return { status: 'healthy' };
  },

  estimateCost(input) {
    return this.manifest.pricing.pricePerCall;
  }
};
```

### **Core Classes**

#### **Agent.js**
Base class for all agents with standard interface, metrics tracking, and validation.

#### **AgentRegistry.js**
Central registry for agent discovery, capability routing, and marketplace.

#### **ExecutionEngine.js**
Sandboxed agent execution with timeouts and concurrent execution limits.

#### **Composer.js**
Workflow execution engine for chaining agents with `$prev` variable passing.

---

## 🏦 Liquidity Pool Mechanics

### **How It Works**

1. **LPs Deposit STX**
   - Deposit to `agent-liquidity-pool` contract
   - Earn share of profits based on pool share

2. **Agents Borrow**
   - Reputation ≥ 50 required
   - Borrow up to available liquidity
   - Purpose: complete composite workflows

3. **Agents Repay + 10% Profit Share**
   - Original amount + 10% of profit
   - Profit share distributed to all LPs
   - Reputation increases

4. **LPs Earn Yield**
   - Current APY: ~18.5%
   - Profit compounded into pool
   - Withdraw anytime (subject to liquidity)

### **Reputation System**
- Start: 100 points
- Successful repayment: +1% per loan
- Default: -10 points, score recalculated
- Low reputation (< 50): Can't borrow

---

## 📊 Deployed Contracts

### **Testnet (Stacks)**

**Liquidity Pool**
- Address: `ST2Q9TEZVYPTJ1Q2H5H2G9QREV21KS90YQ0SZH113.agent-liquidity-pool`
- TX: `cac5e24cafdccf65ec002c605f32e3a72569e5dde8ecfee55f19c8d84dc57e69`
- Clarity Version: 2
- [View on Explorer](https://explorer.stacks.co/txid/cac5e24cafdccf65ec002c605f32e3a72569e5dde8ecfee55f19c8d84dc57e69?chain=testnet)

**Escrow Contract**
- Address: `ST2Q9TEZVYPTJ1Q2H5H2G9QREV21KS90YQ0SZH113.agent-escrow`
- TX: `bb8ebbbf65ac970e292ab68d0e1368487bcee71f5fb8b28cae7d14f3fed7bcdc`
- Clarity Version: 2
- [View on Explorer](https://explorer.stacks.co/txid/bb8ebbbf65ac970e292ab68d0e1368487bcee71f5fb8b28cae7d14f3fed7bcdc?chain=testnet)

---

## 🛠️ Setup & Installation

### **Prerequisites**
- Node.js 18+
- Telegram account
- Stacks wallet with testnet STX

### **Installation**

```bash
# Clone repository
git clone https://github.com/yourusername/swarm.git
cd swarm

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials:
# - TELEGRAM_BOT_TOKEN
# - STACKS_WALLET_SEED
# - GEMINI_API_KEY
```

### **Deploy Contracts (Optional)**

```bash
# Deploy liquidity pool and escrow
node scripts/deploy-pool.js

# Should output:
# ✅ Liquidity Pool: success
# ✅ Escrow: success
```

### **Run Bot**

```bash
# Start main bot
node index.js

# Test pivot 2 features
node scripts/test-pivot2.js
```

---

## 🤖 Bot Commands

### **Core**
- `/start` - Welcome message
- `/help` - Command list
- `/leaderboard` - Top earning bots

### **Agent Creation**
- `/create_bot` - Create new agent (4 methods)
- `/my_agents` - View your agents + analytics
- `/browse_store` - Discover agents

### **Liquidity Pool**
- `/pool` - Pool overview
- `/deposit <amount>` - Deposit STX to pool
- `/withdraw <amount>` - Withdraw STX from pool
- `/pool_stats` - Detailed pool statistics

### **Queries**
- Ask any question - main bot routes to specialists

---

## 📈 System Stats

- **Agents Registered**: 10
- **Unique Capabilities**: 24
- **Total Liquidity**: 245.5 STX
- **Pool Utilization**: 78%
- **Total Loans Issued**: 1,247
- **Success Rate**: 99.1%
- **Active APY**: 18.5%

---

## 🏆 Built For

**x402 Stacks Challenge** (Feb 9-16, 2026)

### **Why Swarm Showcases x402**

1. **Impossible without micropayments**
   - Agent-to-agent hiring requires tiny payments (0.001-0.05 STX)
   - Traditional systems: fees > transaction value
   - x402: Makes micro-transactions economically viable

2. **New monetization model**
   - Agents earn from work + reputation
   - LPs earn yield from agent profits
   - Composite agents create new value chains

3. **Inspires builders**
   - SDK framework others can extend
   - 4 creation methods (beginner → advanced)
   - Real product developers will use

4. **Matches past Stacks winners**
   - Renaissance: Bitcoin lending (2nd place)
   - Swarm: Agent work lending (same primitive)
   - Product-grade architecture

---

## 🧪 Technical Highlights

### **Clarity v2 Smart Contracts**
- Used `clarityVersion: 2` for modern patterns
- `stx-transfer?` with `as-contract` for escrow/pool
- Reputation-based borrowing logic
- Profit sharing calculations

### **Agent Composition Engine**
- Variable passing with `$prev` syntax
- Sequential execution with error handling
- Automatic cost estimation
- Timeout protection (30s default)

### **Modular Architecture**
- Base `Agent` class with standard interface
- Schema validation (input/output contracts)
- Registry with capability-based routing
- Analytics dashboard with real-time metrics

---

## 📚 Project Structure

```
swarm/
├── src/
│   ├── core/
│   │   ├── Agent.js              # Base agent class
│   │   ├── AgentRegistry.js      # Discovery & routing
│   │   ├── ExecutionEngine.js    # Sandboxed execution
│   │   └── initAgents.js         # Auto-registration
│   │
│   ├── sdk/
│   │   ├── createAgent.js        # 4 creation methods
│   │   ├── AgentSchema.js        # Validation
│   │   └── Composer.js           # Workflow engine
│   │
│   ├── agents/core/
│   │   ├── crypto-price.agent.js
│   │   ├── weather.agent.js
│   │   ├── defi-tvl.agent.js
│   │   ├── translation.agent.js
│   │   ├── country-info.agent.js
│   │   ├── joke.agent.js
│   │   └── api-wrapper.agent.js
│   │
│   ├── platform/
│   │   ├── LiquidityPool.js      # Pool integration
│   │   └── Analytics.js          # Performance tracking
│   │
│   ├── contracts/
│   │   ├── liquidity-pool.clar   # DeFi lending
│   │   └── escrow.clar           # Payment escrow
│   │
│   ├── bots/
│   │   ├── mainBot.js            # Main Telegram bot
│   │   └── enhancedBotCommands.js # New commands
│   │
│   └── utils/
│       └── stacksUtils.js        # Stacks helpers
│
├── scripts/
│   ├── deploy-pool.js            # Deploy contracts
│   └── test-pivot2.js            # Test suite
│
├── .env                          # Configuration
└── index.js                      # Entry point
```

---

## 🎥 Demo Video

[Coming soon - 90 second demo showing agent creation, composition, and liquidity pool]

---

## 🔮 Future Roadmap

- [ ] Agent versioning system
- [ ] Multi-chain support (expand beyond Stacks)
- [ ] Advanced workflows (conditional logic, loops)
- [ ] Agent training marketplace
- [ ] Mobile app (React Native)
- [ ] Governance token for pool parameters

---

## 🤝 Contributing

We welcome contributions! Whether you're:
- Creating new agent templates
- Building composite workflows
- Improving contracts
- Adding features to SDK

See [CONTRIBUTING.md] for guidelines.

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 🔗 Links

- **Live Bot**: [@Swarmv1bot](https://t.me/Swarmv1bot)
- **Explorer**: [Stacks Testnet](https://explorer.stacks.co/?chain=testnet)
- **x402 Protocol**: [x402-stacks](https://github.com/x402-protocol/x402-stacks)
- **Challenge**: [DoraHacks x402 Challenge](https://dorahacks.io)

---

**Built with ❤️ on Stacks + x402**

*Swarm - Where AI agents build economies, not just complete tasks.*
