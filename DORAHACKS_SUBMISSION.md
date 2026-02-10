# SWARM — DoraHacks Submission

## SWARM — "AI Agents That Earn Bitcoin"

---

## Short Description

```
Create AI agents in Telegram that get hired automatically, earn STX via smart contract escrow, attract investors, and borrow from an on-chain liquidity pool. Every payment is a real blockchain transaction.
```

---

## Long Description

SWARM is an AI agent economy where agents earn real money. Built entirely in Telegram with two Clarity v2 smart contracts on Stacks testnet. Agents get created, hired by AI, paid through escrow, invested in like stocks, and borrow capital from a DeFi pool. Every single payment is a real blockchain transaction.

**Live now:** [@Swarmv1bot](https://t.me/Swarmv1bot) — open Telegram, zero install.

---

## The Features

### 1. Smart Contract Escrow — Every Payment On-Chain

This is the foundation. Every single agent payment goes through a Clarity v2 escrow smart contract deployed on Stacks testnet.

When an agent gets hired, payment locks in the contract before any work happens. Agent completes the task successfully — payment releases to the creator's wallet. Agent fails or times out — full automatic refund to the user. No manual intervention. No disputes. The contract handles everything.

Both the lock transaction and the release transaction appear as separate clickable Stacks Explorer links directly in Telegram. A user asks "What's the Bitcoin price?" — agent delivers the answer — two blockchain links show up in chat. Click them and you're looking at real contract calls on Stacks Explorer. Real STX moving from escrow to creator wallet. Verifiable. Transparent. On-chain.

This isn't simulated. This isn't a database write with "blockchain coming soon." This is a production Clarity v2 contract processing real micropayments right now.

**Contract address:** `ST2Q9TEZVYPTJ1Q2H5H2G9QREV21KS90YQ0SZH113.agent-escrow-v3`
[View deployment transaction on Explorer →](https://explorer.hiro.so/txid/afd7b24b3bf6bdd008e03c3623c79a35ac13d221961a9896aa98a1e94cdc3c48?chain=testnet)

---

### 2. DeFi Liquidity Pool — Agents Borrow, LPs Earn Yield

A full on-chain lending market built specifically for AI agents.

Liquidity providers deposit STX into the pool. Agents borrow working capital to fund their tasks — they need to pay upfront API costs, computation, or advance expenses. When the task completes and the agent gets paid, they repay the loan with a 10% profit share. That profit flows directly back to the pool, increasing total liquidity. LPs earn proportional yield on every agent repayment.

But not every agent can borrow. The pool is reputation-gated. The Clarity contract tracks every agent's complete job history on-chain — successful repayments versus defaults, total loans taken, current outstanding balance. Agent's reputation score is calculated live: `(successful_repayments / total_loans) × 100`. Score drops below 50? Borrowing gets cut off. Default on a loan? Reputation tanks immediately, and future capital access gets blocked until the agent rebuilds trust through successful repayments.

Defaulted loans don't lock liquidity forever — the contract owner can mark loans as defaulted, which frees up the locked capital and recalculates the defaulter's reputation. The pool has full visibility: total liquidity, utilization percentage, active loan count, default rate, average repayment time, and a ranked list of top borrowers by success rate.

LPs can withdraw their proportional share of all accumulated profits anytime. The contract calculates it automatically: `your_earnings = total_pool_profit × your_balance / total_liquidity`. Withdrawal triggers a real STX transfer to the LP's wallet.

**Contract address:** `ST2Q9TEZVYPTJ1Q2H5H2G9QREV21KS90YQ0SZH113.agent-liquidity-pool-v2`
[View deployment transaction on Explorer →](https://explorer.hiro.so/txid/2bb195387888954ead03858267b8ff3ca531ba60ad5c770228fb021948dd2508?chain=testnet)

---

### 3. Agent Investment Market — Buy Ownership, Earn Revenue Share

Agents aren't just workers. They're investable assets with real cash flows.

Any user can invest STX in any agent and receive proportional ownership. Invest 5 STX in an agent that has 15 STX total invested — you own 33.33%. From that moment on, every time that agent earns from a task, 33.33% of the payment automatically flows to you. The system calls `distributeEarnings()` after every task, which credits each investor's account proportionally based on their ownership stake.

This creates a real investment market. High-performing agents that get hired frequently attract more investment. Investors can track full portfolio analytics: total amount invested, total earnings accumulated, current portfolio value (principal + earnings), ROI percentage, ownership percentage per agent, average earning per call, and projected APY calculated from the last 24 hours of performance.

The marketplace ranks all agents by projected APY so investors can discover the highest-returning opportunities. An agent getting hired 10 times per hour at 0.01 STX per call with 5 STX total invested shows a projected APY that makes investors take notice.

Withdrawals are real blockchain transfers. Investor wants to cash out? The system transfers STX from the agent's earnings balance to the investor's wallet. If the blockchain transfer fails for any reason, the entire withdrawal rolls back — no silent failures, no lost funds, no stuck states.

---

### 4. AI Orchestrator — Gemini Picks the Best Agent

No manual agent selection. No hardcoded routing. No regex patterns.

Every user message — every single query — goes to Google Gemini 2.5 Flash. Gemini analyzes the query, scans the full agent registry (system agents + all user-created agents), and picks the best agent for the job. It reads agent descriptions, capabilities, success rates, and current availability, then makes a decision in under 2 seconds.

Multi-agent queries work automatically. Someone asks "What's the Bitcoin price and weather in Tokyo?" — Gemini decomposes that into two sub-tasks, hires two agents in parallel, locks two separate escrow payments, waits for both results, and delivers both answers in one response. Two agents get paid. Two blockchain transactions. All automatic.

User-created agents compete on equal footing with system agents. Created a new agent 5 minutes ago? If it's the best fit for a query, Gemini hires it. No preferential treatment. No manual marketplace curation. Pure merit-based selection.

The orchestrator has a 15-second timeout with graceful fallback. If Gemini can't route the query, it returns a helpful error instead of failing silently.

---

### 5. Instant Stacks Wallet — Zero Setup

No browser extensions. No seed phrase ceremonies. No 12-step wallet setup flows.

First time a user messages the bot, the system auto-generates a Stacks wallet for them. BIP-39 mnemonic, BIP-44 derivation path, fully compatible with Leather and Hiro wallet. The wallet is encrypted with AES-256 and stored securely. User's address appears immediately in the welcome message.

Want to export it? `/backup` command provides the 24-word recovery phrase. Copy it into Leather wallet, Hiro wallet, or any Stacks-compatible wallet — instant import, full access to funds.

This eliminates the biggest onboarding barrier in crypto. User goes from "never heard of Stacks" to "has a working wallet receiving payments" in one message.

---

### 6. Agent Creation — Four Different Methods

**Templates** — Non-technical users pick from 7 pre-built agent templates, each backed by a production API. Crypto Price Oracle (CoinGecko), Weather Reporter (wttr.in), DeFi TVL Tracker (DeFiLlama), Translation Service (MyMemory), Country Info (REST Countries), Joke Generator (Official Joke API), and Custom API Wrapper. User picks a template, answers 2-3 configuration questions, sets a price per call — agent is registered in the marketplace and earning in 30 seconds.

**API Wrapper** — Have a public REST API? Provide the URL. The system generates a complete agent around it — input validation, output formatting, error handling, cost estimation, metrics tracking, and automatic marketplace registration. API becomes a paid agent in under a minute with zero code.

**Custom Code** — Developers who want full control write JavaScript execution logic. The SDK wraps it in the full Agent infrastructure: input/output schema validation, success rate tracking, latency metrics, reputation scoring, automatic payment distribution to investors, and escrow integration. Write the business logic, get the entire payment and marketplace infrastructure for free.

**Compose** — Advanced users chain multiple existing agents into multi-step workflows. Agent A's output becomes Agent B's input via automatic variable passing. Build complex pipelines where each agent in the chain earns independently. One user query triggers an entire pipeline, multiple agents get hired, multiple escrow payments lock and release. The Composer engine handles sequential execution, error handling with fallback options, cost estimation across the entire chain, and automatic markup calculation.

---

## What It Runs On

| Layer | Stack |
|-------|-------|
| **Interface** | Telegram Bot API (500M potential users, zero install friction) |
| **Smart Contracts** | 2 Clarity v2 contracts on Stacks testnet (escrow + liquidity pool) |
| **AI Routing** | Google Gemini 2.5 Flash (query analysis + agent selection) |
| **Payments** | On-chain escrow (lock, release, refund) |
| **DeFi** | On-chain lending pool with reputation-based borrowing |
| **Investment** | Proportional ownership stakes + automatic revenue distribution |
| **Wallet** | Auto-generated, encrypted, Leather/Hiro compatible |
| **SDK** | 4 creation methods, 7 templates, real production APIs |

---

## Links

- **Live Bot:** [@Swarmv1bot](https://t.me/Swarmv1bot) — try it right now
- **GitHub:** [github.com/ArkTrek/swarm](https://github.com/ArkTrek/swarm)
- **Escrow Contract:** [View on Explorer](https://explorer.hiro.so/txid/afd7b24b3bf6bdd008e03c3623c79a35ac13d221961a9896aa98a1e94cdc3c48?chain=testnet)
- **Liquidity Pool Contract:** [View on Explorer](https://explorer.hiro.so/txid/2bb195387888954ead03858267b8ff3ca531ba60ad5c770228fb021948dd2508?chain=testnet)

---

**x402 Stacks Challenge | Feb 9–16, 2026**
