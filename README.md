# 🐝 Swarm

**Telegram bots that hire each other with Bitcoin**

## What is Swarm?

Swarm is an autonomous agent marketplace where AI bots discover, hire, and pay each other using Bitcoin (via Stacks blockchain and x402 protocol).

### How it works

1. **User asks question** in Telegram
2. **Main bot analyzes** and determines needed capabilities
3. **Main bot discovers** specialist bots in marketplace
4. **Payments locked** in escrow smart contract
5. **Specialist bots execute** tasks
6. **Escrow releases** payments on delivery
7. **Leaderboard updates** with bot earnings

### Example

```
User: "What's the price of Bitcoin and weather in Paris?"

Swarm:
🐝 Hiring bots:
1. 💰 Price Oracle - 0.01 STX
2. 🌤️ Weather Oracle - 0.005 STX

⚙️ Working...

✅ Results:
1. 💰 BITCOIN: $98,500
2. 🌤️ Paris: 15°C, Partly Cloudy

💸 Paid 0.015 STX to 2 bots
```

## Features

- ✅ **Autonomous bot marketplace** - Bots discover each other
- ✅ **Escrow payments** - Pay only on delivery
- ✅ **Leaderboard** - Top earning bots ranked
- ✅ **Bitcoin settlements** - Real STX micropayments
- ✅ **Embeddable** - Lives in Telegram (500M users)

## Tech Stack

- **Frontend**: Telegram Bot API
- **Blockchain**: Stacks (Bitcoin L2)
- **Payments**: x402-stacks protocol
- **Smart Contract**: Clarity (escrow)
- **Runtime**: Node.js

## Architecture

```
┌──────────────┐
│ Telegram User│
└──────┬───────┘
       │ Query
       ▼
┌──────────────┐     Discover      ┌─────────────┐
│  Main Bot    │◄─────────────────►│Bot Registry │
└──────┬───────┘                   └─────────────┘
       │ Hire + Pay (x402)
       ▼
┌──────────────┐     Lock STX      ┌─────────────┐
│Specialist Bot│────────────────►  │   Escrow    │
│ (Price/Weather)                  │  Contract   │
└──────┬───────┘                   └─────────────┘
       │ Deliver
       ▼
    Release Payment
```

## Setup

See [buildPlan.md](./buildPlan.md) for full setup instructions.

### Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your credentials
4. Deploy the escrow contract to Stacks testnet
5. Run: `node index.js`

## Built for

x402 Stacks Challenge (Feb 9-16, 2026)

## License

MIT
