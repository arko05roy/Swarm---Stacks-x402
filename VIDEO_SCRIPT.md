# SWARM — Video Script

## Pre-Recording Setup

### 1. Start the bot
```bash
cd /Users/arkoroy/Desktop/\ stk402
node index.js
```
You should see:
```
🐝 Swarm Main Bot is running...
[SUCCESS] 🐝 Swarm is fully operational!
```

### 2. Telegram accounts needed
- **Account A** — "The Creator" (creates agent, withdraws earnings)
- **Account B** — "The User" (asks questions, triggers payments)
- **Account C** (optional) — "The Investor" (invests in agent, checks portfolio)

If you only have 2 accounts, Account A can also be the investor.

### 3. Pre-run checklist
- [ ] Bot is running (`node index.js` shows no errors)
- [ ] Open Telegram on 2 devices (or use Telegram Desktop + Phone)
- [ ] Search for `@Swarmv1bot` on both accounts
- [ ] Do NOT `/start` yet — you want to show the wallet generation on camera
- [ ] Have Stacks Explorer open in a browser tab: https://explorer.hiro.so/?chain=testnet
- [ ] Screen recorder running (OBS, iPhone built-in, or QuickTime)
- [ ] Do Not Disturb ON on both devices

---

## VIDEO FLOW (Scene by Scene)

---

### SCENE 1: First Touch + Wallet Generation (15 sec)

**On Account A (Creator):**

1. Open Telegram, search `@Swarmv1bot`
2. **Type:** `/start`
3. **Bot will respond with:**
```
🐝 Welcome to Swarm!

Build AI agent economies with Bitcoin micropayments.

👛 Your Wallet: ST2Q9T...  ← HIGHLIGHT THIS

How it works:
1. Create agents with /create_agent (4 methods!)
2. Chain agents together into workflows
3. Earn yield by providing liquidity to agents
...
```

**What to show the viewer:** The wallet address appeared instantly. No MetaMask. No seed phrase. No install. Just `/start` and you have a Stacks wallet.

**Voiceover idea:** "One command. Instant Stacks wallet. No extension, no seed phrase."

---

### SCENE 2: Create an Agent with the SDK (30 sec)

**On Account A (Creator):**

1. **Type:** `/create_agent`
2. **Bot responds:**
```
🤖 Create Your Agent

Choose creation method:

1️⃣ Quick Start (templates)
2️⃣ API Wrapper (any REST API)
3️⃣ Code Your Own (advanced)
4️⃣ Compose Agents (chain existing)

Reply with number (1-4):
```

**PAUSE HERE for 2 seconds — let the viewer see the 4 methods.**

3. **Type:** `1`
4. **Bot responds:**
```
🎨 Quick Start Templates

Available templates:

1. 💰 Crypto Price Oracle
2. 🌤️ Weather Reporter
3. 📊 DeFi TVL Tracker
4. 🗣️ Translation Service
5. 🌍 Country Info
6. 😄 Joke Generator
7. 🔧 Custom API Bot

Reply with number (1-7):
```

**PAUSE HERE — show the 7 templates backed by real APIs.**

5. **Type:** `1` (Crypto Price Oracle)
6. **Bot responds:**
```
💰 Crypto Price Oracle selected!

Which cryptocurrency?
Examples: bitcoin, ethereum, solana, chainlink, stacks, dogecoin

Enter coin name:
```

7. **Type:** `bitcoin`
8. **Bot responds:**
```
Great! What should I call your bot?
Example: "Crypto Price Oracle Pro"
```

9. **Type:** `Bitcoin Price Bot`
10. **Bot responds:**
```
Bitcoin Price Bot - got it!

How much should it cost per call? (in STX)
Examples:
• 0.001 (cheap)
• 0.01 (standard)
• 0.05 (premium)

Enter price:
```

11. **Type:** `0.01`
12. **Bot responds:**
```
✅ Bitcoin Price Bot is LIVE!

🤖 Bot ID: user-12345-1707580000
💰 Price: 0.01 STX/call
📊 Type: 💰 Crypto Price Oracle
🎯 Capabilities: crypto-price, bitcoin-price, price
👛 Earnings to: ST2Q9T...
🔗 Real API: Real-time bitcoin price from CoinGecko

Your bot is in the marketplace!
It will be hired automatically when users ask relevant questions.
```

**What to show:** The full creation flow — 4 methods, 7 templates, real APIs, custom pricing, auto-registered in marketplace. This took ~30 seconds.

**Voiceover idea:** "Four creation methods. Seven templates. Each backed by a real API. My agent is live in the marketplace in 30 seconds."

---

### SCENE 3: Agent Gets Hired + Escrow Payment (20 sec)

**Switch to Account B (User):**

1. **Type:** `/start` (if not already done — to generate wallet)
2. **Type:** `What is the current bitcoin price?`
3. **Bot responds (sequence of messages):**

**Message 1:**
```
🤖 AI Orchestrator analyzing your request...
```

**Message 2 (updates in-place):**
```
🐝 Hiring bots:

1. Bitcoin Price Bot - 0.01 STX

💰 Total: 0.01 STX
```

**Message 3 (updates in-place):**
```
💰 Bitcoin Price Bot delivered! Processing 0.01 STX payment...
```

**Message 4 (final result, updates in-place):**
```
✅ Results:

1. 💰 BTC: $98,500 (+2.3%)

💸 Paid 0.01 STX to 1 bots
```

**Message 5 (separate message — THE BLOCKCHAIN PROOF):**
```
🔗 Payment confirmed on-chain

Bot: Bitcoin Price Bot
Amount: 0.01 STX

Escrow Lock: 2bb195387888...  ← CLICKABLE LINK TO EXPLORER
Escrow Release: afd7b24b3b...  ← CLICKABLE LINK TO EXPLORER
```

**CRITICAL: Click one of those links on camera.** Show the Stacks Explorer page loading with the actual transaction. This is the money shot — real blockchain, real transaction, verifiable.

**Voiceover idea:** "Gemini AI routes the query to my agent. Escrow locks the payment. Agent delivers. Payment releases. Both transactions on-chain. Click the link — it's real."

---

### SCENE 4: Multi-Agent Query (10 sec)

**Still on Account B:**

1. **Type:** `What's the bitcoin price and weather in Tokyo?`
2. **Bot responds:**
```
🐝 Hiring bots:

1. Bitcoin Price Bot - 0.01 STX
2. Weather Reporter - 0.005 STX

💰 Total: 0.015 STX
```

Then:
```
✅ Results:

1. 💰 BTC: $98,500 (+2.3%)
2. 🌤️ Tokyo: 18°C, Partly Cloudy

💸 Paid 0.015 STX to 2 bots
```

Then two separate payment confirmation messages with blockchain links.

**What to show:** The LLM orchestrator decomposed one query into two agent hires. Two escrow transactions. Two payments.

**Voiceover idea:** "One question, two agents hired, two escrow transactions. The AI orchestrator figures out which agents to hire."

---

### SCENE 5: Creator Checks Earnings + Withdraws (15 sec)

**Switch back to Account A (Creator):**

1. **Type:** `/my_bots`
2. **Bot responds:**
```
🤖 Your Bots

1. Bitcoin Price Bot (ID: user-12345-1707580000)
💰 Price: 0.01 STX/call
📊 Earned: 0.0200 STX
✅ Tasks: 2
🎯 Capabilities: crypto-price, bitcoin-price, price
💸 /withdraw_earnings user-12345-1707580000

💰 Total Earnings: 0.0200 STX
```

3. **Type:** `/withdraw_earnings user-12345-1707580000` (copy the bot ID from above)
4. **Bot responds:**
```
💸 Withdrawing 0.0200 STX earnings...
```
Then updates to:
```
✅ Withdrawal successful!

Bot: Bitcoin Price Bot
Amount: 0.0200 STX
Wallet: ST2Q9T...

Transaction: 9f3a21b8c5...  ← CLICKABLE EXPLORER LINK

🎉 Funds sent to your wallet!
```

**Click the transaction link on camera** — show it on Stacks Explorer.

**Voiceover idea:** "Two tasks, 0.02 STX earned. Withdraw to my wallet. Real blockchain transfer. Click to verify."

---

### SCENE 6: Investment System (20 sec)

**On Account A or Account C (Investor):**

1. **Type:** `/browse_store`
2. **Bot responds with marketplace showing trending agents, top rated, top investment opportunities.**

3. **Type:** `/invest user-12345-1707580000 5.0` (use the actual bot ID from Scene 2)
4. **Bot responds:**
```
✅ Investment successful!

Bot: Bitcoin Price Bot
Invested: 5.0000 STX
Total Invested: 5.0000 STX
Your Ownership: 100.00%

💡 You'll earn 100.00% of bot's earnings!

Track performance: /my_investments
```

5. **Type:** `/my_investments`
6. **Bot responds with portfolio view:**
```
💼 Your Investment Portfolio

1. Bitcoin Price Bot
   💰 Invested: 5.0000 STX
   💸 Earned: 0.0000 STX
   💎 Total Value: 5.0000 STX
   📊 ROI: ➡️ 0.00%
   🎯 Ownership: 100.00%
   📞 Bot calls: 2
   /withdraw_all user-12345-1707580000 - Withdraw all

Portfolio Summary:
Total Invested: 5.0000 STX
Total Earned: 0.0000 STX
Total Value: 5.0000 STX
Total ROI: 0.00%
```

7. **Type:** `/top_investments`
8. **Bot shows ranking of all agents by projected APY.**

**Voiceover idea:** "Invest in any agent. Track your portfolio. Ownership percentage. ROI. Projected APY. Withdraw principal plus earnings anytime — real blockchain transfer."

---

### SCENE 7: Liquidity Pool (15 sec)

**On any account:**

1. **Type:** `/pool`
2. **Bot responds:**
```
💰 Liquidity Pool

📊 Pool Overview:
Total Liquidity: 245.50 STX
Total Lent: 191.50 STX
Utilization: 78%
Active Loans: 47

💸 Your Position:
Deposited: 0.0000 STX
Earned: 0.0000 STX
Your Share: 0.00%
Your APY: 18.5%

📈 Performance:
Pool APY: 18.5%
Success Rate: 95.4%
Total Profit: 12.5000 STX
```

3. **Type:** `/deposit 10`
4. **Bot responds:**
```
💰 Depositing 10 STX to pool...
```
Then:
```
✅ Successfully deposited 10 STX!

Transaction: abc123...  ← CLICKABLE EXPLORER LINK

You're now earning yield from agent work! 🚀
```

5. **Type:** `/pool_stats`
6. **Bot shows detailed analytics:**
```
💰 Pool Analytics

📊 Overview:
Total Liquidity: 255.50 STX
Total Lent: 191.50 STX (78%)
Active Loans: 47
Avg Loan Size: 0.0400 STX

📈 Performance:
Total Loans: 1247
Successful: 1189 (95.4%)
Defaults: 12 (0.9%)
Total Profit: 12.5000 STX

💸 APY Breakdown:
Current APY: 18.5%
Avg Repay Time: 2.3 minutes

🏆 Top Borrowers:
1. Crypto News Digest - 234 loans (99% success)
2. Weather + Translation - 189 loans (98% success)
3. Price Analysis Pro - 156 loans (97% success)

⚠️ Risk Metrics:
Default Rate: 0.90%
Utilization: 78%
```

**Voiceover idea:** "Deposit STX. Agents borrow it to work. They repay with 10% profit share. 95% success rate. 18.5% APY. Real yield from real work."

---

### SCENE 8: Show the Smart Contracts (10 sec)

**In browser:**

1. Open: `https://explorer.hiro.so/txid/afd7b24b3bf6bdd008e03c3623c79a35ac13d221961a9896aa98a1e94cdc3c48?chain=testnet`
2. Show the escrow contract deployment transaction
3. Open: `https://explorer.hiro.so/txid/2bb195387888954ead03858267b8ff3ca531ba60ad5c770228fb021948dd2508?chain=testnet`
4. Show the liquidity pool contract deployment transaction

**Voiceover idea:** "Two Clarity v2 smart contracts on Stacks testnet. Escrow for payments. Liquidity pool for agent lending. Both verified on-chain."

---

### SCENE 9: Closing (5 sec)

**Show Telegram with @Swarmv1bot open.**

**Text overlay or voiceover:**
"SWARM. Try it now. @Swarmv1bot. No setup."

---

## TOTAL RUNTIME

| Scene | Duration | What's Shown |
|-------|----------|-------------|
| 1. Wallet generation | 15s | `/start` → instant wallet |
| 2. Agent creation (SDK) | 30s | 4 methods, 7 templates, full creation flow |
| 3. Agent hired + escrow | 20s | Query → orchestrator → escrow lock → result → escrow release → Explorer |
| 4. Multi-agent query | 10s | One query → two agents → two payments |
| 5. Earnings withdrawal | 15s | `/my_bots` → earnings → withdraw → blockchain tx |
| 6. Investment system | 20s | Invest → ownership → portfolio → ROI tracking |
| 7. Liquidity pool | 15s | Pool stats → deposit → detailed analytics |
| 8. Smart contracts | 10s | Explorer showing both deployed contracts |
| 9. Closing | 5s | CTA |
| **TOTAL** | **~2:20** | |

If you need to cut to 90 seconds: Remove scenes 4, 8. Shorten scene 6 to just invest + portfolio (skip `/top_investments`). Shorten scene 7 to just `/pool` (skip `/deposit` and `/pool_stats`).

If you need to cut to 60 seconds: Only scenes 1, 2, 3, 5, 9. This covers wallet → create → hire → earn → withdraw. The core loop.

---

## RECORDING TIPS

- **Speed up typing** in post-production (1.5x) but keep bot responses at normal speed so viewer can read
- **Highlight the blockchain links** — draw an arrow or zoom in when they appear. This is THE proof that it's real
- **Show the Explorer page** at least twice — once for escrow payment, once for earnings withdrawal
- **Don't read out command syntax** — just show it naturally, the viewer can read
- **Record voiceover separately** — much easier to edit, and you can re-record without re-doing the demo
- **Use split screen** when switching accounts — left side is Creator, right side is User

---

## VOICEOVER SCRIPT (Full, Read Separately)

```
One command. Instant Stacks wallet. No extension, no seed phrase.

Four creation methods. Seven templates. Each one backed by a real API — CoinGecko, DeFiLlama, wttr.in. My agent is live in the marketplace in 30 seconds.

Someone asks a question. Gemini AI routes it to my agent. Escrow locks the payment on-chain. Agent delivers the result. Payment releases. Both transactions are on the blockchain — click the link, verify on Explorer.

One question, two agents hired, two escrow transactions. The AI orchestrator decomposes the query automatically.

Two tasks completed, 0.02 STX earned. Withdraw to my wallet. Real blockchain transfer.

Now the interesting part. I invest 5 STX in this agent. I own 100%. Every time it earns, I earn proportionally. Track my portfolio — ROI, ownership, projected APY.

Or deposit STX to the liquidity pool. Agents borrow working capital, complete tasks, repay with 10% profit share. 95% success rate. 18.5% APY. Real yield from real economic activity.

Two Clarity v2 smart contracts. Escrow for payments. Liquidity pool for agent lending. Both deployed on Stacks testnet. Both verified.

SWARM. Try it now. @Swarmv1bot.
```

Word count: ~185 words at ~90 words/min = ~2 minutes.

For 60-second version, cut to:
```
One command. Instant wallet. No setup.

Four creation methods. Seven templates backed by real APIs. My agent is live in 30 seconds.

Someone asks "What's the Bitcoin price?" Gemini routes it to my agent. Escrow locks payment on-chain. Agent delivers. Payment releases. Click the link — it's on the blockchain.

0.02 STX earned. Withdraw to wallet. Real transfer. Verified on Explorer.

Invest in agents. Own 30%. Earn revenue share. Deposit to the pool. Agents borrow, repay with profit share. 18.5% APY.

Two Clarity v2 contracts on Stacks testnet. SWARM. @Swarmv1bot.
```

Word count: ~90 words = ~60 seconds.
