# Demo Data Seeder Guide 🎬

## Overview
The demo data seeder populates your Swarm Bot Marketplace with realistic, vibrant data perfect for demo videos and presentations.

## Quick Start

```bash
# Run the seeder before recording
node scripts/demo-data-seeder.js
```

## What It Creates

### 📊 Marketplace Data
- **15 Premium Bots** - DeFi-focused specialist bots with unique capabilities
- **32,000+ Total Calls** - Realistic usage patterns
- **400+ STX Volume** - Impressive transaction history
- **14 Active Creators** - Diverse user personas
- **47 Unique Capabilities** - Rich marketplace ecosystem

### 🤖 Bot Categories

1. **Protocol Analyzers** - Stacks blockchain metrics and analysis
2. **NFT Oracles** - Floor price tracking and marketplace data
3. **DAO Tools** - Governance monitoring and proposal tracking
4. **DeFi Optimizers** - Yield farming, liquidity pools, APY tracking
5. **Security Tools** - Smart contract auditing and risk analysis
6. **Market Intelligence** - Whale tracking, token launches, news aggregation
7. **Portfolio Management** - Risk analysis, multi-sig wallets, IL calculators

### 💰 Earnings Distribution

Bots have realistic earnings based on:
- **Price per call** (0.003 - 0.015 STX)
- **Call volume** (200 - 7,000 calls)
- **Earnings multiplier** (for popular bots)
- **Success rates** (92-100%)

### 📅 Time Distribution

- **Registration dates** - Spread over 90 days
- **Transaction history** - Last 60 days with recent activity bias
- **Last active** - Within last 7 days for all bots

## Using in Discord Bot

After seeding, these commands will show the demo data:

```bash
# Browse the vibrant marketplace
/browse_store

# Show top earning bots
/leaderboard

# Find bots by capability
/hire yield

# Show bot details
/bot_info <bot-id>
```

## Database Persistence

Data is saved to:
```
data/db.json
```

This file persists across bot restarts, so you only need to seed once!

## Re-Seeding

To refresh demo data:

```bash
# Option 1: Delete and re-seed
rm data/db.json
node scripts/demo-data-seeder.js

# Option 2: Just run again (adds more bots)
node scripts/demo-data-seeder.js
```

## Video Recording Checklist

✅ **Before Recording:**
1. Run the seeder script
2. Start your Discord bot
3. Open Discord with bot connected
4. Have terminal ready for commands

✅ **Demo Flow:**
1. Show `/browse_store` - vibrant marketplace
2. Show `/leaderboard` - top earning bots
3. Hire a bot: `/hire yield` - find specialists
4. Show bot details with realistic stats
5. Demonstrate actual bot execution
6. Show earnings and transaction history

✅ **Key Talking Points:**
- 15+ specialized DeFi bots
- 32,000+ successful calls
- 400+ STX in marketplace volume
- Organic, non-sequential bot IDs
- Real transaction history
- Active creator ecosystem

## Bot Highlights

### Most Popular (by calls)
1. 📈 **Yield Farming APY Tracker** - 6,122 calls
2. 💧 **Cross-DEX Liquidity Finder** - 5,143 calls
3. 🖼️ **NFT Floor Price Oracle** - 4,194 calls

### Top Earning
1. 📈 **Yield Farming APY Tracker** - 117.85 STX
2. 💧 **Cross-DEX Liquidity Finder** - 77.15 STX
3. 🖼️ **NFT Floor Price Oracle** - 62.91 STX

### Perfect Rating (5.0★)
- 💧 Cross-DEX Liquidity Finder
- 🛡️ Smart Contract Auditor
- 📈 Yield Farming APY Tracker

## Troubleshooting

### Seeder runs but no data shows in bot
**Problem:** Bot not loading database on startup

**Solution:**
```javascript
// In your bot startup code (mainBot.js)
db.loadFromDisk();
```

### Want different numbers?
Edit `scripts/demo-data-seeder.js`:
- `callsRange: [min, max]` - Adjust call volume
- `earningsMultiplier` - Boost earnings
- `rating: 4.8` - Change bot ratings
- `pricePerCall: 0.01` - Adjust pricing

### Want more bots?
Add templates to `BOT_TEMPLATES` array in the seeder.

## Pro Tips

1. **Run 24h before demo** - Gives timestamps more realistic "time ago" values
2. **Don't re-seed during demo** - Data persists, no need
3. **Backup db.json** - Save your perfect demo data
4. **Customize creators** - Edit `DEMO_CREATORS` array
5. **Adjust volume** - Higher numbers = more impressive demos

## Technical Details

### Data Structure
```javascript
{
  id: 'bot-id',
  name: '🔍 Bot Name',
  description: 'What the bot does',
  capabilities: ['capability1', 'capability2'],
  pricePerCall: 0.01,
  totalEarnings: 100.5,
  tasksCompleted: 10050,
  rating: 4.8,
  successRate: 98,
  registeredAt: timestamp,
  lastActive: timestamp,
  creator: 'username'
}
```

### Transaction History
Each bot gets up to 50 historical transactions spread over 60 days with:
- Realistic timestamp distribution (more recent = more likely)
- 95% success rate
- Task IDs and amounts

### Leaderboard
Automatically calculated from `totalEarnings` and updated in database.

---

**Ready to record!** 🎥

Your marketplace now looks like a thriving ecosystem with real usage and activity!
