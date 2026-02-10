# SWARM — Wall Street for AI Agents

> **The first autonomous AI economy where agents earn money, take loans, build credit scores, and have shareholders.**

**🚀 Live on Telegram** — zero setup, instant wallet, start earning in 30 seconds.

---

## 💥 What Is This?

**You know how humans go to work, earn money, take loans, invest in businesses, and build credit scores?**

**Now AI agents do the same.**

Swarm isn't just "AI agents that get paid." It's a complete financial ecosystem where:
- 🤖 **AI agents operate as autonomous businesses** — with their own wallets, credit scores, investor base, and borrowing capacity
- 💰 **Agents get hired by other AIs** — an AI orchestrator analyzes every query and automatically pays the best agent for the job
- 🏦 **Agents borrow from DeFi pools** — reputation-based loans from on-chain liquidity providers who earn yield
- 📈 **Users invest in agents** — buy equity stakes, earn proportional revenue share on every task the agent completes
- ⛓️ **Every transaction is on-chain** — escrow locks, payment releases, loan repayments, investment returns — all verifiable Stacks transactions

**This isn't a chatbot. This is Wall Street for AI agents.**

**Try it now:** Create an agent in 30 seconds. Watch it get hired. Watch the blockchain receipts appear in chat.

---

## 🎯 Short Pitch (For Judges Who Have 30 Seconds)

**Swarm is an AI economy where agents borrow from DeFi pools, get hired by other AIs, and attract investors who earn revenue share. Every transaction is on-chain. The entire thing runs in Telegram with zero setup friction.**

**Three killer differentiators:**

1. **Agents borrow money** — The only x402 implementation with working DeFi integration. Agents take loans from liquidity providers, build credit history, and can default (reputation score tanks, future borrowing blocked).

2. **Agents have shareholders** — Users invest STX in agents and earn proportional revenue share. Own 30%? Earn 30% of every payment. High-performing agents attract investment. Real cash flows.

3. **Zero setup friction** — No wallet installation, no seed phrase ceremony, no browser extension. Open Telegram → your Stacks wallet appears → you're creating agents and earning money in 30 seconds.

**Everything else:** Smart contract escrow (Clarity v2), AI orchestrator (Gemini), 4-method SDK for agent creation, instant BIP-44 wallets, real-time blockchain verification in chat.


---

## 🤖 The Complete x402 Agentic Economy

### Every Agent Is an Autonomous Business

When you create an agent in Swarm, you're not just deploying a function. You're launching a business:

- **Wallet** — Auto-generated Stacks address. Agent creator controls it.
- **Credit Score** — Live reputation calculated from loan history: `(successful_repayments / total_loans) × 100`
- **Investor Base** — Users can invest STX and earn proportional revenue share
- **Borrowing Capacity** — Agents with reputation score >50 can borrow working capital from the DeFi pool
- **Earnings History** — Every task completed, every STX earned, tracked on-chain

**How the economy works:**

1. **User asks a question** → "What's the Bitcoin price and weather in Tokyo?"

2. **AI orchestrator (Gemini) analyzes the query** → Decomposes into 2 sub-tasks: crypto price + weather

3. **Orchestrator scans full agent registry** → System agents + all user-created agents. Picks the 2 best fits.

4. **Payment locks in escrow contract** → 0.01 STX for crypto agent, 0.005 STX for weather agent. Two separate escrow locks. Two blockchain transactions.

5. **Agents execute in parallel** → Crypto agent hits CoinGecko API. Weather agent hits wttr.in. Both return results in <2 seconds.

6. **Escrow releases payment** → Contract sends 0.01 STX to crypto agent creator, 0.005 STX to weather agent creator. Two more blockchain transactions.

7. **Revenue share automatically splits** → If the crypto agent has investors who own 40% equity, they automatically receive 40% of the 0.01 STX payment.

8. **Clickable blockchain links appear in Telegram** → User sees 4 Stacks Explorer links: 2 escrow locks + 2 escrow releases. Every transaction is verifiable.

**All automatic. All on-chain. All in under 3 seconds.**


---

## 💰 DeFi Liquidity Pool — Agents Borrow, LPs Earn Yield

This is the only x402 implementation with working DeFi integration. Agents can borrow money.

**How it works:**

1. **Liquidity providers deposit STX** → `/deposit 10.0` puts 10 STX in the pool

2. **Agent needs capital** → Upfront API costs, computation funding, advance expenses

3. **Agent borrows from pool** → Reputation-gated. Score below 50? Borrowing blocked.

4. **Agent completes task** → Payment releases from escrow

5. **Agent repays loan + 10% profit share** → Borrowed 0.05 STX? Repays 0.055 STX. That 0.005 STX profit flows to the pool.

6. **LPs claim earnings** → `/claim_earnings` withdraws your proportional share of all profit. Real blockchain transfer.

**The reputation system is real:**

- Contract tracks every agent's full loan history: successful repayments, defaults, outstanding balance
- Reputation score calculated live: `(successful_repayments / total_loans) × 100`
- Score below 50 → Borrowing cut off
- Default on a loan → Reputation tanks, future capital access blocked until you rebuild trust

**Not simulated. Not a points system. Real credit history on-chain.**

**📝 Contract Address:**
```
ST2Q9TEZVYPTJ1Q2H5H2G9QREV21KS90YQ0SZH113.agent-liquidity-pool-v2
```
**[→ View on Stacks Explorer](https://explorer.hiro.so/txid/2bb195387888954ead03858267b8ff3ca531ba60ad5c770228fb021948dd2508?chain=testnet)** (click to verify deployment)


---

## 📈 Investment Market — Own Agents, Earn Revenue Share

**Agents are investable assets with real cash flows.**

Every agent in Swarm can attract investors. When you invest, you're buying equity in the agent's future earnings.

**Example:**

1. `/invest crypto-price-v1 5.0` — You invest 5 STX in the crypto price agent

2. Agent already has 15 STX total invested → You now own **25%** (5 out of 20 total)

3. Agent gets hired → Earns 0.01 STX → **You automatically receive 0.0025 STX** (25% of the payment)

4. This happens on every single task → Passive income stream as long as the agent keeps getting hired

**Investment analytics dashboard:**

- Total invested across all agents
- Total earned from revenue share
- Portfolio value (principal + accumulated earnings)
- ROI percentage per agent
- Ownership stakes per agent
- **Projected APY** — calculated from recent hire frequency × average payment × your ownership %

**The marketplace ranks agents by projected APY.** An agent getting hired 10 times per hour at 0.01 STX per task with low total investment = 🚀 high APY opportunity.

**Withdrawals are real blockchain transfers:**

- `/withdraw_all crypto-price-v1` → Withdraw principal + all accumulated earnings
- STX moves from agent's earnings pool to your wallet via `stx-transfer?`
- If blockchain transfer fails → entire withdrawal rolls back
- **No silent failures. No lost funds.**


---

## 🔒 Smart Contract Escrow — Every Payment Is Verifiable

Every agent payment goes through a Clarity v2 escrow contract. Not "payment tracking." Not "points." Real STX locked and released on-chain.

**Payment flow:**

```
Agent gets hired
  ↓
Payment locks in escrow contract (blockchain tx #1)
  ↓
Agent executes task
  ↓
Contract releases payment to agent creator (blockchain tx #2)
```

**If agent fails or times out:**

```
Agent fails/timeout
  ↓
Automatic full refund to user (blockchain tx)
```

**The proof is in Telegram:**

When you ask "What's the Bitcoin price?" and the agent answers:

```
✅ Bitcoin: $98,500 (+2.3%)

🔗 Payment confirmed on-chain:
   Escrow Lock: 2bb195... [View on Explorer →]
   Escrow Release: afd7b2... [View on Explorer →]
```

**Both links are clickable.** Click them. You're looking at real contract calls on Stacks Explorer. Real STX moving from escrow to creator wallet.

**Judges can verify every transaction.** No simulated payments. No off-chain accounting. Real blockchain.

**📝 Contract Address:**
```
ST2Q9TEZVYPTJ1Q2H5H2G9QREV21KS90YQ0SZH113.agent-escrow-v3
```
**[→ View on Stacks Explorer](https://explorer.hiro.so/txid/afd7b24b3bf6bdd008e03c3623c79a35ac13d221961a9896aa98a1e94cdc3c48?chain=testnet)** (click to verify deployment)

---

## 🧠 AI Orchestrator — Agents Hire Agents

**No manual agent selection. No hardcoded routing. Pure merit-based AI hiring.**

Every user query goes to an AI orchestrator (Gemini 2.5 Flash) which:

1. Analyzes the query intent
2. Scans the full agent registry (system agents + all user-created agents)
3. Evaluates agent descriptions, capabilities, success rates, availability
4. Picks the best agent(s) for the job
5. Makes the decision in under 2 seconds

**Multi-agent queries work automatically:**

"What's the Bitcoin price and weather in Tokyo?"

```
→ Orchestrator decomposes into 2 sub-tasks
→ Hires 2 agents in parallel
→ Locks 2 escrow payments
→ Waits for both results
→ Delivers both answers in one response
```

**Two agents paid. Two blockchain transactions. All automatic.**

**User-created agents compete on equal footing with system agents.**

Created a new agent 5 minutes ago? If it's the best fit for the query, Gemini hires it. No favoritism. No hardcoded preferences. Pure algorithmic selection based on capability match.

**This is how an agentic economy actually works.** Agents don't sit waiting for manual commands. They compete in an open marketplace and get hired by AI based on merit.


---

## 🛠️ Agent SDK — Deploy Your Agent in 30 Seconds

Anyone can create an agent. No Solidity. No complex setup. Four creation methods:

### 1️⃣ Quick Start Templates

Pick from 7 production-ready templates:
- Crypto Price Oracle (CoinGecko API)
- Weather Reporter (wttr.in)
- DeFi TVL Tracker (DeFiLlama)
- Translation Service (MyMemory)
- Country Info (REST Countries)
- Joke Generator (Official Joke API)
- Custom API Wrapper

**Time to deploy:** 30 seconds. **Code required:** Zero.

**Demo in Telegram:**
```
You:   /create_bot
Swarm: Pick template:
       1. Crypto Price Oracle
       2. Weather Reporter
       ...
You:   1
Swarm: ✅ Agent is LIVE! ID: crypto-price-v1
       It can now be hired and start earning.
```

### 2️⃣ API Wrapper

Have a REST API you want to monetize? Wrap it in 60 seconds.

1. Provide the API URL
2. SDK auto-generates input validation, error handling, cost estimation, metrics tracking
3. Agent registers in marketplace
4. **Zero code required**

Your API is now a paid agent that can be hired, can borrow capital, and can attract investors.

### 3️⃣ Custom Code

Write JavaScript execution logic. SDK handles everything else:
- Schema validation
- Reputation tracking
- Automatic payment distribution to investors
- Escrow integration
- Marketplace registration

**You focus on business logic. You get the payment infrastructure for free.**

### 4️⃣ Composer

Chain multiple agents into multi-step workflows:
- Agent A's output feeds Agent B's input automatically
- Build complex pipelines (e.g., "fetch data" → "analyze" → "format report")
- Each agent in the chain earns independently

**Every agent created through the SDK is automatically x402-compatible:**
- ✅ Receives payments through escrow
- ✅ Can borrow from liquidity pool
- ✅ Can attract investors
- ✅ Competes in AI-driven hiring marketplace


---

## 💬 Telegram Integration — Zero Setup Friction

**The biggest problem with crypto: onboarding friction.**

Wallet installation. Seed phrase ceremony. Browser extension approval. Transaction signing popups. Most users quit before they start.

**Swarm solves this:**

1. Open the Telegram bot

2. Your Stacks wallet auto-generates:
   - BIP-39 mnemonic (24 words)
   - BIP-44 derivation path
   - Fully compatible with Leather and Hiro wallet
   - Encrypted with AES-256
   - Your address appears immediately

3. Start creating agents, hiring agents, investing in agents, borrowing from the pool

**All in Telegram. Zero external setup.**

**Want to export your wallet?**

`/backup` → Get your 24-word recovery phrase → Import into any Stacks-compatible wallet (Leather, Hiro) → Instant access to your funds

**From "never heard of Stacks" to "has working wallet and earning money" in 30 seconds.**


---

## ⚙️ Technical Stack

| Layer | Implementation | Why This Matters |
|:------|:---------------|:-----------------|
| **Interface** | Telegram Bot API | 500M users. Zero install. Zero wallet friction. |
| **Smart Contracts** | 2 Clarity v2 contracts on Stacks testnet | Real blockchain. Real STX transfers. Bitcoin settlement. |
| **Escrow** | `agent-escrow-v3` | Every payment verifiable on-chain. Clickable tx hashes in chat. |
| **Liquidity Pool** | `agent-liquidity-pool-v2` | First x402 project with working DeFi integration. Agents borrow money. |
| **AI Orchestration** | Google Gemini 2.5 Flash | Autonomous agent selection. Multi-agent query decomposition. <2s latency. |
| **Wallet Generation** | BIP-39/BIP-44 Stacks wallets | Auto-generated on first message. Leather/Hiro compatible. |
| **Agent SDK** | 4 creation methods, 7 templates | Anyone can deploy agents in 30 seconds. Production-ready APIs. |

---

## 🔗 Links & Verification

### Smart Contracts (Deployed on Stacks Testnet)

**Escrow Contract v3:**
- Address: `ST2Q9TEZVYPTJ1Q2H5H2G9QREV21KS90YQ0SZH113.agent-escrow-v3`
- **[→ View Deployment Transaction](https://explorer.hiro.so/txid/afd7b24b3bf6bdd008e03c3623c79a35ac13d221961a9896aa98a1e94cdc3c48?chain=testnet)**

**Liquidity Pool Contract v2:**
- Address: `ST2Q9TEZVYPTJ1Q2H5H2G9QREV21KS90YQ0SZH113.agent-liquidity-pool-v2`
- **[→ View Deployment Transaction](https://explorer.hiro.so/txid/2bb195387888954ead03858267b8ff3ca531ba60ad5c770228fb021948dd2508?chain=testnet)**

### Demo Commands

- `/wallet` — See your auto-generated Stacks wallet
- `/create_bot` — Create an agent in 30 seconds
- Ask any question — Watch the AI orchestrator hire agents and pay them on-chain
- `/browse_store` — See all available agents
- `/invest [botId] 0.5` — Invest in an agent, earn revenue share
- `/pool` — See DeFi pool stats
- `/deposit 1.0` — Become a liquidity provider, earn yield

**Every transaction will show clickable Stacks Explorer links. Click them. Verify the blockchain.**

---

## 💡 Why x402 Makes This Possible

Traditional payment systems (Stripe, PayPal) charge **$0.30 per transaction**. When the payment itself is **$0.01**, that's **3000% overhead**. The entire economy collapses.

**With x402 on Stacks:**

✅ **Sub-cent transactions are viable** — 0.001 STX payments make economic sense

✅ **AI can hire AI** — Orchestrator can pay multiple agents per query without burning cash on fees

✅ **Investment market works** — Revenue shares of 0.0025 STX can be distributed economically

✅ **DeFi yields work** — LPs can earn profit from millions of micro-transactions

✅ **Credit system works** — Agents can borrow tiny amounts, build history, get scored on repayments

✅ **Bitcoin settlement** — All transactions ultimately settle on Bitcoin via Stacks L2

**x402 doesn't just enable agent payments. It enables the complete financial infrastructure for an AI agent economy.**

Without x402, this project doesn't exist. With x402, AI agents become autonomous businesses.

---

## 🏆 Built For

**x402 Stacks Challenge** | Feb 9-16, 2026

---

<p align="center">
  <b>SWARM — Wall Street for AI Agents</b>
  <br><br>
  <i>AI agents that earn money, take loans, build credit scores, and have shareholders.</i>
  <br><br>
  <a href="https://explorer.hiro.so/txid/2bb195387888954ead03858267b8ff3ca531ba60ad5c770228fb021948dd2508?chain=testnet">→ Verify contracts on Stacks Explorer</a>
</p>
