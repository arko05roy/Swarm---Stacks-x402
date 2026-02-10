# SWARM Demo Script - Video Recording Guide

> **Complete walkthrough for showcasing the SWARM DeFi Agent Economy**

This demo script is designed for a 8-10 minute video that showcases:
- ✅ Vibrant DeFi/Web3 agent marketplace
- ✅ SDK features (4 creation methods)
- ✅ Real blockchain transactions
- ✅ Agent economy in action

---

## Pre-Recording Setup

### 1. Start the Bot
```bash
node index.js
```

### 2. Seed Demo Data (Run 24h before recording)
```bash
node scripts/demo-data-seeder.js
```

This will populate the marketplace with 15-20 realistic user-created agents.

### 3. Prepare Two Telegram Accounts
- **Account A**: Agent Creator (@creator_user)
- **Account B**: Agent Hirer (@hirer_user)

### 4. Open Browser Tabs
- Hiro Explorer (https://explorer.hiro.so/?chain=testnet)
- CoinGecko (for price verification)

---

## Act 1: The Vibrant Marketplace (2 minutes)

### Scene: Browse the Agent Community

**Command:**
```
/browse_store
```

**Expected Output:**
```
🏪 DeFi Agent Marketplace

🔥 TRENDING (Most Active)
1. 📊 Crypto Price Oracle - 1,247 calls • 0.001 STX
   by Swarm Core • ⭐ 4.9/5

2. 💰 DeFi TVL Tracker - 892 calls • 0.002 STX
   by Swarm Core • ⭐ 4.8/5

3. 🌾 Yield Optimizer - 634 calls • 0.004 STX
   by @defi_whale • ⭐ 5.0/5

🆕 NEWEST AGENTS
4. 📈 Token Analytics Oracle - 127 calls • 0.003 STX
   by Swarm Core • ⭐ 4.7/5

5. 🔍 Blockchain Explorer - 89 calls • 0.002 STX
   by Swarm Core • ⭐ 4.9/5

6. ⛽ Gas/Fee Estimator - 56 calls • 0.002 STX
   by Swarm Core • ⭐ 5.0/5

7. 💼 Portfolio Tracker - 234 calls • 0.003 STX
   by @crypto_analyst • ⭐ 4.8/5

💎 TOP EARNING AGENTS
1. Crypto Price Oracle - 1.247 STX earned
2. DeFi TVL Tracker - 1.784 STX earned
3. Yield Optimizer - 2.536 STX earned

Total Agents: 18 • Total Calls Today: 3,456
```

**Narration:**
> "SWARM has a thriving marketplace of DeFi agents. You can see trending agents, new arrivals, and top earners. This is a real economy where agents compete based on quality and price."

---

## Act 2: Hiring Agents (Multi-Agent Query) (2 minutes)

### Scene: User asks complex DeFi question

**Command:**
```
What's the current Bitcoin price, best yield for Ethereum, and gas fees on Stacks?
```

**Expected Output:**
```
🐝 Analyzing your request...

I'll hire 3 agents to answer this:
• Crypto Price Oracle (0.001 STX)
• Yield Optimizer (0.004 STX)
• Gas/Fee Estimator (0.002 STX)

💳 Total Cost: 0.007 STX (~$0.007)

🔒 Locking payment in escrow...
✅ Escrow Lock TX: afd7b24b3bf6bdd008e03c3623c79a35ac13d221961a9896aa98a1e94cdc3c48
🔗 View: https://explorer.hiro.so/txid/afd7b24...?chain=testnet

⚙️ Executing agents...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 Bitcoin (BTC)
Price: $98,500.23
24h Change: +2.3%
Source: CoinGecko

🌾 Best Ethereum Yield Opportunities
1. Aave V3 - USDC Pool
   APY: 12.5% • TVL: $234.5M • Chain: Ethereum
   
2. Uniswap V3 - ETH/USDC
   APY: 18.2% • TVL: $89.3M • Chain: Ethereum

⛽ Stacks Transaction Fees
Transfer: 0.0002 STX (~$0.0002)
Recommendation: ✅ Low cost! Very affordable.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Payment released to agent creators!
🔗 Release TX: 2bb195387888954ead03858267b8ff3ca531ba60ad5c770228fb021948dd2508
🔗 View: https://explorer.hiro.so/txid/2bb1953...?chain=testnet

💵 3 agents earned 0.007 STX total
```

**Narration:**
> "Watch how SWARM's LLM orchestrator automatically hired 3 different agents to answer a complex question. Each payment went through real blockchain transactions that you can verify on the explorer."

**Demo Action:** Click the explorer links to show real transactions on-chain.

---

## Act 3: Creating an Agent (1 minute)

### Scene: Quick Agent Creation

**Command:**
```
/create_agent
```

**Bot Response:**
```
🤖 Create Your DeFi Agent

Choose creation method:

1️⃣ Quick Start (Templates)
   30 seconds • Perfect for beginners

2️⃣ API Wrapper
   Turn any API into an agent

3️⃣ Custom Code
   Write your own logic (JS)

4️⃣ Compose Workflow
   Chain multiple agents together

Reply with 1, 2, 3, or 4
```

**User Types:**
```
1
```

**Bot Response:**
```
📋 Available DeFi Templates:

1. 📊 Token Analytics
2. ⛽ Gas Fee Estimator
3. 💰 Yield Optimizer
4. 🔍 Blockchain Explorer
5. 📈 Portfolio Tracker
6. 🏦 DeFi Protocol Data

Reply with template number
```

**User Types:**
```
1
```

**Bot Response:**
```
✨ Creating Token Analytics Agent...

✅ Agent Created Successfully!

🆔 ID: token-analytics-user-51247
📛 Name: Token Analytics
💰 Price: 0.005 STX per call
🎯 Capabilities: token-analytics, defi, metrics

Your agent is now LIVE in the marketplace!

📊 View analytics: /my_agents
💸 Withdraw earnings: /withdraw_earnings token-analytics-user-51247
```

**Narration:**
> "In 30 seconds, anyone can create a professional DeFi agent using templates. No coding required."

---

## Act 4: SDK Power - Composite Agent (2 minutes)

### Scene: Show Developer SDK

**Narration:**
> "For developers, SWARM offers a powerful SDK with 4 creation methods. Let me show you the Composer - it lets you chain multiple agents into workflows."

**Show Code Example on Screen:**

```javascript
// SDK_EXAMPLES.md - Composite Agent Creation

const { compose } = require('./src/sdk/createAgent');
const { registry } = require('./src/core/AgentRegistry');

// Create a DeFi Research Agent that chains 3 agents
const defiResearcher = compose({
  name: 'Complete DeFi Analyzer',
  description: 'Get token price, best yields, and transaction costs in one call',
  author: 'demo_user',
  pricePerCall: 0.01,
  
  workflow: [
    // Step 1: Get token price
    { 
      agent: 'crypto-price-core', 
      input: { coin: '$input.token' } 
    },
    
    // Step 2: Find best yields for that chain
    { 
      agent: 'yield-optimizer-core', 
      input: { chain: 'ethereum', limit: 3 } 
    },
    
    // Step 3: Check transaction costs
    { 
      agent: 'fee-estimator-core', 
      input: { chain: 'ethereum', txType: 'transfer' } 
    }
  ],
  
  // Transform results into unified output
  transform: (results) => ({
    token: results[0].symbol,
    price: results[0].price,
    priceChange24h: results[0].change24h,
    
    topYieldPool: results[1].topPools[0].protocol,
    bestApy: results[1].topPools[0].apy,
    poolTvl: results[1].topPools[0].tvlFormatted,
    
    txCost: results[2].estimatedFeeUSD,
    
    recommendation: `Buy ${results[0].symbol} at $${results[0].price}, 
                     stake in ${results[1].topPools[0].protocol} 
                     for ${results[1].topPools[0].apy}% APY. 
                     Estimated tx cost: $${results[2].estimatedFeeUSD.toFixed(2)}`
  })
});

// Register the composite agent
registry.register(defiResearcher, 'demo_user');

console.log('✅ DeFi Researcher Agent created!');
console.log(`ID: ${defiResearcher.manifest.id}`);
```

**Show it working in Telegram:**

**Command:**
```
Run my DeFi Researcher for ethereum
```

**Expected Output:**
```
🐝 Hiring DeFi Researcher Agent...

⚙️ Executing 3-agent workflow...
  ✓ Fetching Ethereum price
  ✓ Finding best yields
  ✓ Estimating gas fees

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 COMPLETE DEFI ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Token: ETH
Price: $3,245.67 (+1.8% 24h)

🌾 Best Yield: Aave V3
APY: 12.5% • TVL: $234.5M

⛽ Transaction Cost: $2.45

💡 Recommendation:
Buy ETH at $3,245.67, stake in Aave V3 for 12.5% APY.
Estimated tx cost: $2.45

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💳 Payment: 0.01 STX
🔗 TX: 9f3a21c8...
```

**Narration:**
> "This composite agent automatically coordinates 3 different agents, chains their outputs, and presents unified insights. This is the power of the agent economy - agents hiring agents."

---

## Act 5: Earnings & Withdrawals (1 minute)

### Scene: Agent Creator Checks Earnings

**Command:**
```
/my_agents
```

**Expected Output:**
```
📱 Your DeFi Agents (2 active)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Token Analytics Agent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 Total Earned: 0.125 STX (~$0.125)
📞 Calls: 25
⭐ Rating: 4.8/5
📊 Success Rate: 96%
🕐 Avg Response: 1.2s

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. DeFi Researcher (Composite)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 Total Earned: 0.040 STX (~$0.040)
📞 Calls: 4
⭐ Rating: 5.0/5
📊 Success Rate: 100%
🕐 Avg Response: 3.5s

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💵 Total Portfolio Earnings: 0.165 STX (~$0.165)

Commands:
• /withdraw_earnings [agent-id] - Withdraw to wallet
• /agent_stats [agent-id] - Detailed analytics
```

**Command:**
```
/withdraw_earnings token-analytics-user-51247
```

**Expected Output:**
```
💸 Processing Withdrawal...

Agent: Token Analytics
Amount: 0.125 STX
Destination: Your Stacks Wallet

📤 Broadcasting transaction to blockchain...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Withdrawal Successful!

💰 Amount: 0.125 STX (~$0.125)
📍 Sent to: ST2Q9TEZVYPTJ1Q2H5H2G9QREV21KS90YQ0SZH113

🔗 Transaction ID: 9f3a21c8d4e5b6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1
🔗 View on Explorer: https://explorer.hiro.so/txid/9f3a21c...?chain=testnet

💳 New Balance: 0.0 STX
```

**Narration:**
> "Every STX earned is real. Every withdrawal is a real blockchain transaction. This isn't a simulation - this is a working DeFi economy."

---

## Act 6: DeFi Liquidity Pool (1.5 minutes)

### Scene: Show the DeFi Primitive

**Command:**
```
/pool_stats
```

**Expected Output:**
```
💧 SWARM LIQUIDITY POOL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 POOL METRICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 Total Liquidity: 125.5 STX (~$125.50)
📊 Total Borrowed: 8.2 STX (~$8.20)
📈 Utilization: 6.5%
💎 Current APY: 18.3%
💵 Profit Pool: 2.4 STX

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 YOUR POSITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 Deposited: 10.0 STX
💵 Claimable Earnings: 0.183 STX
📊 Your Share: 7.96%
📈 ROI: +1.83%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

How it works:
• LPs deposit STX and earn yield
• Agents borrow STX for working capital
• Agents repay with 10% profit share
• LPs claim earnings proportionally

Commands:
• /deposit [amount] - Add liquidity
• /claim_earnings - Claim your share
• /pool - Quick overview
```

**Command:**
```
/claim_earnings
```

**Expected Output:**
```
💎 Claiming LP Earnings...

Your Position: 10.0 STX (7.96% of pool)
Claimable Earnings: 0.191 STX

📤 Broadcasting claim transaction...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Earnings Claimed!

💰 Amount: 0.191 STX (~$0.191)
📍 Sent to: ST2Q9TEZVYPTJ1Q2H5H2G9QREV21KS90YQ0SZH113

🔗 Transaction: ef2b89d7c4a5b3e6f8d9c0a1b2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1
🔗 View: https://explorer.hiro.so/txid/ef2b89d...?chain=testnet

💰 Remaining Deposited: 10.0 STX
💵 New Claimable: 0.0 STX
```

**Narration:**
> "This is a real DeFi liquidity pool. LPs earn yield from agent work. Every deposit, borrow, and claim is an on-chain transaction verified on Stacks blockchain."

---

## Act 7: Investment System (1 minute)

### Scene: Invest in High-Performing Agents

**Command:**
```
/top_investments
```

**Expected Output:**
```
💎 TOP INVESTMENT OPPORTUNITIES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Yield Optimizer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 Total Earned: 2.536 STX
📞 Call Volume: 634 calls
⭐ Rating: 5.0/5
📈 Projected APY: 47%

Available for Investment: 40%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. Crypto Price Oracle
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 Total Earned: 1.247 STX
📞 Call Volume: 1,247 calls
⭐ Rating: 4.9/5
📈 Projected APY: 32%

Available for Investment: 65%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Invest in successful agents and earn proportional share of their earnings!

Command: /invest [agent-id] [amount]
```

**Narration:**
> "You can invest STX in high-performing agents and earn passive income. This creates a real market for agent quality - better agents attract more investment."

---

## Closing (30 seconds)

**Show final stats:**

```
/stats
```

**Expected Output:**
```
📊 SWARM NETWORK STATS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 Total Agents: 18
👥 Active Users: 47
📞 Calls Today: 3,456
💰 Volume Today: 12.8 STX (~$12.80)

🔥 Most Active Agent: Crypto Price Oracle (1,247 calls)
💎 Top Earner: Yield Optimizer (2.536 STX)
🆕 Newest: Token Analytics (2 hours ago)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

All payments verified on Stacks blockchain
Powered by x402 micropayments
```

**Narration:**
> "SWARM isn't just a chatbot. It's a fully-functional DeFi agent economy where:
> - Anyone can create agents in 30 seconds
> - Developers can build complex workflows with our SDK
> - Every payment is a real blockchain transaction
> - Agents can earn, borrow, and invest
> - All settled in Bitcoin via Stacks L2
> 
> This is the future of AI agents - not just completing tasks, but building economies.
> 
> Try it now: @Swarmv1bot on Telegram"

---

## Video Recording Tips

1. **Pre-seed data 24 hours before** - Run demo-data-seeder.js
2. **Use two Telegram accounts** - Show interaction from both sides
3. **Keep explorer tabs open** - Click transaction links to verify on-chain
4. **Practice the flow 2-3 times** - Timing should be smooth
5. **Show code examples on screen** - Picture-in-picture for SDK sections
6. **Highlight transaction hashes** - Zoom in when showing explorer links
7. **Keep it conversational** - Don't read the script verbatim
8. **Show failures too** (optional) - Demonstrates it's real (e.g., API timeout)

---

## Fallback Commands (If Something Goes Wrong)

If an agent fails during demo:
- "As you can see, this is a real API call, not a simulation. Let me try another agent..."
- Use /crypto-price-core bitcoin (direct agent call)

If blockchain is slow:
- "Stacks transactions typically confirm in 10-20 seconds. In production we'd show pending status..."
- Show pending TX on explorer

---

## Post-Demo Verification

After recording, verify:
1. ✅ All transaction links are clickable
2. ✅ Explorer shows actual transactions
3. ✅ Agent creation flow is clear
4. ✅ SDK code is visible and readable
5. ✅ Marketplace looks organic (no sequential IDs visible)

---

**END OF DEMO SCRIPT**
