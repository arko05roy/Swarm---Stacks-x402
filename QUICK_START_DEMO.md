# Quick Start - Demo Preparation

## 🎬 For Video Recording (Do This 24 Hours Before)

### Step 1: Seed the Marketplace
```bash
node scripts/demo-data-seeder.js
```

**Expected Output:**
```
✅ Initialized 8 core DeFi/Web3 agents
✅ Created 10 user-generated agents
📊 Total agents: 18
🔥 Top agents by earnings displayed
```

### Step 2: Start the Bot
```bash
node index.js
```

### Step 3: Open Browser Tabs
- Hiro Explorer: https://explorer.hiro.so/?chain=testnet
- CoinGecko: https://www.coingecko.com (for price verification)

### Step 4: Follow Demo Script
Open **DEMO.md** and execute each act sequentially.

---

## 🚀 Quick Test (Verify Everything Works)

```bash
# Test 1: Verify agents initialize
node -e "require('./src/core/initAgents').initializeCoreAgents()"

# Test 2: Run demo seeder
node scripts/demo-data-seeder.js

# Test 3: Check agent count
node -e "
  require('./src/core/initAgents').initializeCoreAgents();
  require('./scripts/demo-data-seeder').seedDemoData().then(() => {
    const stats = require('./src/core/AgentRegistry').registry.getStats();
    console.log('Total Agents:', stats.totalAgents);
  });
"
```

---

## 📋 Demo Checklist

Before recording:
- [ ] Run `demo-data-seeder.js` (creates 18 agents)
- [ ] Start bot with `node index.js`
- [ ] Have 2 Telegram accounts ready
- [ ] Open Hiro Explorer tab
- [ ] Print DEMO.md or have it on second screen
- [ ] Test `/browse_store` command works
- [ ] Verify agents appear in marketplace

During recording:
- [ ] Show marketplace first (vibrant!)
- [ ] Execute multi-agent query
- [ ] Click explorer transaction links
- [ ] Show SDK code example (screen share)
- [ ] Demonstrate earnings withdrawal
- [ ] Keep flow natural, not scripted

---

## 🎯 The 8 DeFi Agents

1. **Crypto Price Oracle** - Real-time prices (CoinGecko)
2. **DeFi TVL Tracker** - Protocol TVL data (DeFiLlama)
3. **Token Analytics Oracle** - Comprehensive token metrics
4. **DeFi Yield Optimizer** - Best yield opportunities
5. **Blockchain Explorer** - Query Stacks blockchain
6. **Gas/Fee Estimator** - Transaction cost estimates
7. **Wallet Portfolio Tracker** - Portfolio analytics
8. **Smart Contract Deployer** - Deploy Clarity contracts

All use **FREE APIs** - no keys required!

---

## 💡 Key Demo Talking Points

1. **"18 agents in our marketplace"** - Show after seeding
2. **"Every payment is a real blockchain transaction"** - Click explorer links
3. **"Create an agent in 30 seconds"** - Use template method
4. **"Agents can hire other agents"** - Show composite workflow
5. **"All earnings are real STX"** - Demonstrate withdrawal
6. **"Built for x402 micropayments"** - Sub-cent transactions

---

## 🔗 Important Links

- **Live Bot**: @Swarmv1bot (if deployed)
- **Hiro Explorer**: https://explorer.hiro.so/?chain=testnet
- **GitHub Repo**: https://github.com/arko05roy/Swarm---Stacks-x402

---

## 📞 Telegram Commands to Show

```
/browse_store         - Show vibrant marketplace
/create_agent        - Create agent (show templates)
/my_agents           - Show creator earnings
/pool_stats          - Show DeFi liquidity pool
/wallet              - Show auto-generated wallet
```

---

## ⚠️ Common Issues & Fixes

**Issue**: Agents not showing in marketplace  
**Fix**: Run `node scripts/demo-data-seeder.js` first

**Issue**: Transaction links don't work  
**Fix**: Make sure you're on Stacks testnet

**Issue**: API rate limit hit  
**Fix**: Wait 1 minute, CoinGecko limits at 30/min

---

## 🎥 Recording Settings

- **Resolution**: 1080p minimum
- **Frame Rate**: 30fps or higher
- **Screen**: Show Telegram + browser (explorer)
- **Audio**: Clear microphone, no background noise
- **Length**: Target 8-10 minutes
- **Editing**: Add chapter markers for each "Act"

---

**Ready to record! 🚀**

Good luck with the x402 Stacks Challenge demo!
