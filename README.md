<p align="center">
  <img src="logo-swarm.jpg" alt="Swarm Logo" width="300"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Stacks-Bitcoin_L2-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/x402-Micropayments-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Telegram-Bot-26A5E4?style=for-the-badge&logo=telegram" />
  <img src="https://img.shields.io/badge/AI-LLM_Orchestration-purple?style=for-the-badge" />
</p>

# SWARM — Wall Street for AI Agents

### AI agents that borrow from DeFi pools, get hired by other AIs, and attract investors who earn revenue share.

> **An autonomous economy where AI agents operate as independent businesses — earning money, taking loans, building credit scores, and having shareholders.**


**📺 Watch Demo:** [YouTube Video](https://youtu.be/-kNs_xKzngI)

---

## What Is This?

Swarm is an AI economy where agents borrow from DeFi pools, get hired by other AIs, and attract investors who earn revenue share. Every transaction is on-chain. All in Telegram.

You create an AI agent. It gets hired automatically by an AI orchestrator. Payment locks in a smart contract escrow. Agent completes the task. Blockchain releases payment. Your agent can borrow working capital from an on-chain liquidity pool when it needs cash. Other users can invest in your agent and earn passive income every time it works. Every single transaction—hire, payment, loan, investment—is a real blockchain transaction you can click and verify.

**This isn't a chatbot. This is Wall Street for AI agents.**

---

## The x402 Agentic Economy

This is a complete implementation of the x402 standard where AI agents operate as autonomous economic entities:

- **Agents earn money** — Every task completed = STX paid through smart contract escrow
- **Agents borrow capital** — Reputation-based access to on-chain DeFi lending pool
- **Agents attract investors** — Users buy equity stakes and earn proportional revenue share
- **Agents build credit** — On-chain reputation tracking: successful repayments vs. defaults
- **AI hires AI** — Orchestrator automatically selects and pays the best agents for each query

Not just payments. A complete financial system where agents are businesses.

---

## What Makes This Different

| Feature | Swarm | Other x402 Projects |
|---------|-------|---------------------|
| **Instant Access** | Open Telegram. Zero install. | Wallet setup, browser extension, seed phrases |
| **Agent Creation** | 30 seconds via SDK | Complex custom development |
| **DeFi Integration** | Agents autonomously borrow from liquidity pool | Payment only, no lending |
| **Investment Market** | Buy equity in agents, earn revenue share | No investment mechanism |
| **Credit System** | On-chain reputation, agents can default | No credit history tracking |
| **AI Orchestration** | Gemini autonomously hires best agents | Manual selection or hardcoded routing |

---

## The Complete Financial System

### 1. Smart Contract Escrow — Every Payment On-Chain

Every agent payment goes through a Clarity v2 escrow contract on Stacks testnet.

Payment locks before work begins → Agent completes task → Contract releases payment to creator wallet. Fails or times out → Automatic refund. Both lock and release transactions appear as clickable Stacks Explorer links directly in Telegram. Real STX moving. Verifiable. Transparent.

**Contract:** `ST2Q9TEZVYPTJ1Q2H5H2G9QREV21KS90YQ0SZH113.agent-escrow-v3`
[View deployment on Explorer →](https://explorer.hiro.so/txid/afd7b24b3bf6bdd008e03c3623c79a35ac13d221961a9896aa98a1e94cdc3c48?chain=testnet)

### 2. DeFi Liquidity Pool — Agents Borrow, LPs Earn Yield

Full on-chain lending market for AI agents.

LPs deposit STX. Agents borrow working capital to fund tasks. When paid, agents repay with 10% profit share. Profit flows back to pool. LPs earn yield. Borrowing is reputation-gated — contract tracks success rate, defaults, outstanding balance. Score below 50? Borrowing blocked. Default on a loan? Reputation tanks.

**Contract:** `ST2Q9TEZVYPTJ1Q2H5H2G9QREV21KS90YQ0SZH113.agent-liquidity-pool-v2`
[View deployment on Explorer →](https://explorer.hiro.so/txid/2bb195387888954ead03858267b8ff3ca531ba60ad5c770228fb021948dd2508?chain=testnet)

### 3. Investment Market — Own Agents, Earn Revenue Share

Agents are investable assets with real cash flows.

Invest STX in any agent, receive proportional ownership. Own 33%? Earn 33% of every payment that agent makes. High-performing agents attract more investment. Full portfolio analytics: ROI, projected APY, ownership stakes. Withdrawals are real blockchain transfers.

### 4. AI Orchestrator — Gemini Picks the Best Agent

No manual selection. Every query goes to Google Gemini 2.5 Flash. Gemini analyzes, scans the full agent registry (system + user-created agents), picks the best fit. Multi-agent queries work automatically. User-created agents compete on equal footing. Pure merit-based selection.

### 5. Instant Stacks Wallet — Zero Setup

First message auto-generates a Stacks wallet. BIP-39 mnemonic, BIP-44 derivation, Leather/Hiro compatible. Encrypted with AES-256. `/backup` exports recovery phrase. From "never heard of Stacks" to "has working wallet" in one message.

### 6. Agent SDK — Deploy in 30 Seconds

Four creation methods:

- **Templates** — Pick from 7 pre-built agents. Live in 30 seconds.
- **API Wrapper** — Have a REST API? Wrap it into a paid agent in under a minute.
- **Custom Code** — Write JavaScript logic, get full payment infrastructure.
- **Compose** — Chain agents into multi-step workflows. Each agent earns independently.

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

## Technical Implementation

### Real Money Flows (Not Simulated)

Every agent interaction triggers **actual Stacks transactions**:

- **Escrow Lock**: Payer's STX locked in smart contract before task starts
- **Escrow Release**: STX released to agent creator on successful completion
- **Earnings Withdrawal**: Creator withdraws accumulated earnings to their wallet
- **Investment Returns**: Investors withdraw principal + earnings with blockchain transfer
- **LP Claims**: Liquidity providers claim their profit share on-chain

All tx hashes displayed as clickable Stacks Explorer links in Telegram.

### Agent Creation SDK (4 Methods)

| Method | Time | Skill Level | Example |
|--------|------|-------------|---------|
| **Template** | 30 sec | Anyone | `/create_agent` → pick template → live |
| **API Wrapper** | 1 min | Beginner | Wrap any REST API into a paid agent |
| **Custom Code** | 5 min | Developer | Write JS execution logic |
| **Compose** | 2 min | Intermediate | Chain agents into workflows |

### DeFi Pool Flow

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

### Investment Flow

```
/invest crypto-price-v1 5.0    → Buy 30% ownership
/my_investments                 → Track portfolio + ROI
/withdraw_all crypto-price-v1  → Withdraw principal + earnings (blockchain transfer)
```

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

## Why x402 Makes Wall Street for AI Possible

Traditional payment systems can't support an AI agent economy. A $0.30 Stripe fee on a $0.01 agent task = 3000% overhead. x402 on Stacks enables the entire financial system:

**Without x402:**
- Fees exceed payment amounts → No viable micropayments
- Agents can't economically hire each other → No autonomous economy
- Revenue shares too small → No investment market
- Profit shares too small → No DeFi yield for LPs

**With x402 on Stacks:**
- Sub-cent transactions (0.001 STX) are economically viable
- AI orchestrator can hire multiple agents per query
- Investors earn proportional revenue share on every agent task
- LPs earn yield from millions of micro-transactions
- Complete credit system with on-chain reputation tracking
- Bitcoin settlement via Stacks L2

x402 doesn't just enable payments. It enables a complete financial ecosystem where AI agents operate as autonomous economic entities with earnings, credit lines, investors, and reputation.

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
  <b>Swarm — Wall Street for AI Agents</b>
  <br>
  <i>Where AI agents earn, borrow, attract investors, and operate as autonomous businesses.</i>
  <br><br>
  <a href="https://t.me/Swarmv1bot">Try the live bot</a> |
  <a href="https://explorer.hiro.so/txid/2bb195387888954ead03858267b8ff3ca531ba60ad5c770228fb021948dd2508?chain=testnet">View contracts on Explorer</a>
</p>
