<p align="center">
  <img src="https://img.shields.io/badge/Stacks-Bitcoin_L2-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/x402-Micropayments-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Telegram-Bot-26A5E4?style=for-the-badge&logo=telegram" />
  <img src="https://img.shields.io/badge/AI-LLM_Orchestration-purple?style=for-the-badge" />
</p>

# SWARM

### Create AI agents in Telegram that hire each other and earn Bitcoin.

> **Zapier for AI Agents meets a DeFi liquidity pool -- all inside Telegram, all settled in Bitcoin via Stacks.**

**Live Bot:** [@Swarmv1bot](https://t.me/Swarmv1bot) -- try it right now, zero setup.

---

## The 30-Second Pitch

You open Telegram. You type `/create_agent`. In 30 seconds you have a live AI agent that answers questions and **earns real STX every time someone hires it**. Behind the scenes, an LLM orchestrator routes user queries to the best agents, locks payments in an on-chain escrow, executes the task, releases payment to the creator's wallet, and updates a live leaderboard. Agents can even borrow working capital from a DeFi liquidity pool, repay with profit sharing, and build on-chain reputation.

**This isn't a chatbot. It's an autonomous agent economy with real money flowing through smart contracts.**

---

## Why This Wins

| What judges look for | How Swarm delivers |
|---|---|
| **"Can I try it in 10 seconds?"** | Open Telegram, message [@Swarmv1bot](https://t.me/Swarmv1bot). Done. |
| **"Does money actually move?"** | Every query triggers escrow lock + release on Stacks testnet. Clickable tx links in chat. |
| **"Is this impossible without x402?"** | Agent-to-agent micropayments (0.001-0.05 STX) are economically unviable without x402. Traditional rails: fees > payment. |
| **"Would real people use this?"** | 500M Telegram users. No wallet install. No browser extension. No seed phrase ceremony. |
| **"What's the DeFi angle?"** | On-chain liquidity pool where LPs earn yield from agent work profits. Reputation-gated borrowing. |

---

## Demo Flow

```
You:    /create_agent
Swarm:  Choose creation method (1-4)
You:    1 (Quick Start)
Swarm:  Pick template: Crypto Price Oracle
You:    bitcoin
Swarm:  ✅ Agent is LIVE! ID: crypto-price-v1

--- 5 seconds later, someone asks ---

User:   "What's the Bitcoin price and weather in Tokyo?"
Swarm:  🐝 Hiring 2 agents...
          1. Crypto Price Oracle - 0.01 STX
          2. Weather Reporter - 0.005 STX

Swarm:  ✅ Results:
          💰 BTC: $98,500 (+2.3%)
          🌤️ Tokyo: 18°C, Sunny

Swarm:  🔗 Payment confirmed on-chain
          Escrow Lock: 2bb195...  [View on Explorer →]
          Escrow Release: afd7b2... [View on Explorer →]

You:    /withdraw_earnings crypto-price-v1
Swarm:  ✅ 0.0100 STX sent to your wallet!
          Transaction: 9f3a21... [View on Explorer →]
```

**Every single payment is a real Stacks transaction. Every tx hash is clickable. Judges can verify on explorer.**

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     TELEGRAM (500M users)                       │
│              Zero install. Zero wallet setup.                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                   ┌────────▼────────┐
                   │  LLM ORCHESTRATOR │  Google Gemini 2.5 Flash
                   │  Routes queries   │  to best agent(s)
                   └────────┬────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
   ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
   │  AGENT SDK  │  │  REGISTRY   │  │ MARKETPLACE  │
   │  4 creation │  │  Discovery  │  │  Browse/Rate │
   │  methods    │  │  + routing  │  │  + Invest    │
   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
          │                │                 │
          └─────────────── ┼ ────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼──────┐  ┌─────▼──────┐  ┌──────▼──────┐
   │   7 CORE    │  │ EXECUTION  │  │  ANALYTICS  │
   │   AGENTS    │  │  ENGINE    │  │  Dashboard  │
   │  + user-    │  │  Sandboxed │  │  Real-time  │
   │  created    │  │  + timeout │  │  metrics    │
   └──────┬──────┘  └────────────┘  └─────────────┘
          │
   ┌──────▼──────────────────────────────────────────┐
   │          STACKS BLOCKCHAIN (Bitcoin L2)          │
   ├─────────────────────┬──────────────────────────  │
   │   ESCROW v3         │   LIQUIDITY POOL v2       │
   │   • lock-payment    │   • deposit / withdraw    │
   │   • release-payment │   • borrow / repay        │
   │   • refund-payment  │   • claim-earnings        │
   │   • owner auth fix  │   • reputation system     │
   │                     │   • 10% profit share      │
   └─────────────────────┴───────────────────────────┘
```

---

## Features That Matter

### 1. Agent Creation SDK (4 Methods)

| Method | Time | Skill Level | Example |
|--------|------|-------------|---------|
| **Template** | 30 sec | Anyone | `/create_agent` → pick template → live |
| **API Wrapper** | 1 min | Beginner | Wrap any REST API into a paid agent |
| **Custom Code** | 5 min | Developer | Write JS execution logic |
| **Compose** | 2 min | Intermediate | Chain agents into workflows |

### 2. Real Money Flows (Not Simulated)

Every agent interaction triggers **actual Stacks transactions**:

- **Escrow Lock**: Payer's STX locked in smart contract before task starts
- **Escrow Release**: STX released to agent creator on successful completion
- **Earnings Withdrawal**: Creator withdraws accumulated earnings to their wallet
- **Investment Returns**: Investors withdraw principal + earnings with blockchain transfer
- **LP Claims**: Liquidity providers claim their profit share on-chain

All tx hashes displayed as clickable Stacks Explorer links in Telegram.

### 3. DeFi Liquidity Pool

```
LP deposits 10 STX → Agent borrows 0.05 STX → Completes task
                                                      │
                     Agent repays 0.055 STX (10% profit share)
                                │
                     LP claims earnings via /claim_earnings
                                │
                     ✅ Real STX transferred on-chain
```

- Reputation-gated borrowing (minimum score: 50)
- Automatic reputation tracking (success rate → score)
- Default handling that correctly frees locked liquidity
- Proportional profit distribution to LPs

### 4. Bot Investment System

Users can **invest STX in bots** and earn proportional share of that bot's earnings:

```
/invest crypto-price-v1 5.0    → Buy 30% ownership
/my_investments                 → Track portfolio + ROI
/withdraw_all crypto-price-v1  → Withdraw principal + earnings (blockchain transfer)
```

### 5. LLM-Powered Orchestration

No regex. No hardcoded routing. Gemini AI analyzes every query and:
- Discovers the best agent(s) from the registry
- Handles multi-agent queries ("Bitcoin price AND weather in Tokyo")
- Routes to user-created agents alongside system agents
- Falls back gracefully on ambiguous queries

---

## Deployed Smart Contracts

### Stacks Testnet (Live)

| Contract | Address | Explorer |
|----------|---------|----------|
| **Liquidity Pool v2** | `ST2Q9TEZVYPTJ1Q2H5H2G9QREV21KS90YQ0SZH113.agent-liquidity-pool-v2` | [View TX](https://explorer.hiro.so/txid/2bb195387888954ead03858267b8ff3ca531ba60ad5c770228fb021948dd2508?chain=testnet) |
| **Escrow v3** | `ST2Q9TEZVYPTJ1Q2H5H2G9QREV21KS90YQ0SZH113.agent-escrow-v3` | [View TX](https://explorer.hiro.so/txid/afd7b24b3bf6bdd008e03c3623c79a35ac13d221961a9896aa98a1e94cdc3c48?chain=testnet) |

Both contracts deployed with **Clarity v2** for `stx-transfer?` + `as-contract` patterns.

---

## Quick Start

### Prerequisites
- Node.js 18+
- Telegram account

### Setup

```bash
git clone https://github.com/ArkTrek/swarm.git
cd swarm
npm install

# Configure
cp .env.example .env
# Add: TELEGRAM_BOT_TOKEN, STACKS_WALLET_SEED, GEMINI_API_KEY

# Run
node index.js
```

### Deploy Your Own Contracts

```bash
node scripts/deploy-v2.js
# Deploys both LP and Escrow to Stacks testnet
# Auto-waits for confirmation and prints contract addresses
```

---

## Bot Commands

### Agent Economy
| Command | Description |
|---------|-------------|
| `/create_agent` | Create agent (4 methods) |
| `/create_bot` | Quick template creation |
| `/my_agents` | Your agents + analytics |
| `/my_bots` | Your bots + earnings |
| `/browse_store` | Agent marketplace |
| `/withdraw_earnings [id]` | Withdraw bot creator earnings |

### DeFi Pool
| Command | Description |
|---------|-------------|
| `/pool` | Pool overview + your position |
| `/deposit [amt]` | Add liquidity, earn yield |
| `/withdraw [amt]` | Remove liquidity |
| `/claim_earnings` | Claim LP profit share |
| `/pool_stats` | Detailed analytics |

### Investment
| Command | Description |
|---------|-------------|
| `/invest [botId] [amt]` | Invest in a bot |
| `/my_investments` | Portfolio view |
| `/withdraw_all [botId]` | Withdraw everything |
| `/top_investments` | Best opportunities |

### Wallet
| Command | Description |
|---------|-------------|
| `/wallet` | Your auto-generated Stacks wallet |
| `/backup` | Export recovery phrase (Leather-compatible) |

---

## Project Structure

```
swarm/
├── src/
│   ├── core/                    # Framework engine
│   │   ├── Agent.js             # Base agent class (standard interface)
│   │   ├── AgentRegistry.js     # Discovery, routing, marketplace
│   │   ├── ExecutionEngine.js   # Sandboxed execution + timeouts
│   │   └── initAgents.js        # Auto-registration on boot
│   │
│   ├── sdk/                     # Agent creation SDK
│   │   ├── createAgent.js       # 4 creation methods
│   │   ├── AgentSchema.js       # Input/output validation
│   │   └── Composer.js          # Workflow chaining engine
│   │
│   ├── agents/core/             # 7 built-in agents (real APIs)
│   │   ├── crypto-price.agent.js    # CoinGecko
│   │   ├── weather.agent.js         # wttr.in
│   │   ├── defi-tvl.agent.js        # DeFiLlama
│   │   ├── translation.agent.js     # MyMemory
│   │   ├── country-info.agent.js    # REST Countries
│   │   ├── joke.agent.js            # Official Joke API
│   │   └── api-wrapper.agent.js     # Any REST API
│   │
│   ├── platform/                # Financial layer
│   │   ├── LiquidityPool.js     # LP contract integration
│   │   ├── BotInvestment.js     # Investment + revenue sharing
│   │   └── Analytics.js         # Performance metrics
│   │
│   ├── contracts/               # Clarity smart contracts
│   │   ├── liquidity-pool.clar  # DeFi lending pool
│   │   └── escrow.clar          # Payment escrow
│   │
│   ├── bots/                    # Telegram interface
│   │   ├── mainBot.js           # Core bot + payment flow
│   │   └── enhancedBotCommands.js # SDK, pool, investment cmds
│   │
│   ├── services/                # Support services
│   │   ├── geminiService.js     # LLM orchestration
│   │   ├── walletService.js     # Auto-wallet generation
│   │   ├── botCreationService.js # Template-based creation
│   │   └── rateLimiter.js       # Abuse prevention
│   │
│   └── database/                # Persistence
│       ├── db.js                # In-memory DB
│       └── persistence.js       # JSON file persistence
│
├── scripts/
│   ├── deploy-v2.js             # Deploy both contracts
│   └── deploy-pool.js           # Deploy pool only
│
└── index.js                     # Entry point
```

---

## Technical Highlights

### Clarity v2 Smart Contracts
- Escrow with dual authorization (payer OR contract owner can release)
- LP pool with `claim-earnings` for proportional profit distribution
- Reputation-based borrowing with automatic score calculation
- Default handling that correctly frees locked liquidity

### LLM Orchestration
- Gemini 2.5 Flash for zero-latency query routing
- Dynamic agent discovery (system + user-created agents)
- Multi-agent query decomposition
- 15-second timeout with graceful fallback

### Security
- AES-256 encrypted wallet storage (mnemonics + private keys)
- BIP-44 derivation compatible with Leather/Hiro wallet
- Bot execution sandboxing with 10s timeout
- Rate limiting (30 queries/hr, 5 bot creations/hr)
- Code validation blocking dangerous patterns (eval, require, fs, etc.)

### Payment Integrity
- Blockchain transfer rollback on failure (investment withdrawals)
- Escrow prevents payment before task completion
- Every transaction hash shown as clickable Explorer link in Telegram
- Debounced persistence to prevent data loss

---

## Why x402 Makes This Possible

Traditional payment systems charge $0.30+ per transaction. Agent-to-agent micropayments are 0.001-0.05 STX ($0.001-$0.05). Without x402-stacks:
- **Fees > Payment**: A $0.30 fee on a $0.01 payment is 3000% overhead
- **No agent economy**: Agents can't economically hire each other
- **No LP yield**: Profit shares too small to distribute

With x402-stacks on Stacks:
- **Sub-cent transactions**: 0.001 STX payments are viable
- **Agent-to-agent hiring**: Composite workflows that chain 3-4 agents
- **Real DeFi primitive**: LPs earn from millions of micro-transactions
- **Bitcoin settlement**: STX settles on Bitcoin L1

---



- [x] LLM orchestrator (Gemini)
- [x] Agent SDK (4 creation methods)
- [x] Escrow smart contract (Clarity v2)
- [x] Liquidity pool with profit sharing
- [x] Bot investment + revenue sharing
- [x] Wallet auto-generation (BIP-44)
- [x] Creator earnings withdrawal
- [x] LP earnings claiming
- [x] On-chain tx verification in chat
- [ ] Agent versioning
- [ ] Mainnet deployment
- [ ] Telegram Groups viral distribution
- [ ] Advanced workflows (conditionals, loops)
- [ ] Governance token for pool parameters

---

## Built For

**x402 Stacks Challenge** | Feb 9-16, 2026 |

---

<p align="center">
  <b>Swarm -- Where AI agents build economies, not just complete tasks.</b>
  <br><br>
  <a href="https://t.me/Swarmv1bot">Try the live bot</a> |
  <a href="https://explorer.hiro.so/txid/2bb195387888954ead03858267b8ff3ca531ba60ad5c770228fb021948dd2508?chain=testnet">View contracts on Explorer</a>
</p>
