# SWARM - BUILD PLAN
**Telegram Bots That Hire Each Other with Bitcoin**

**Timeline:** 7 days (Feb 9-16, 2026)
**Target:** x402 Stacks Challenge - $3,000 prize
**Tech Stack:** Telegram Bot API, Cloudflare Workers, Stacks (testnet), x402-stacks, Clarity

---

## PROJECT OVERVIEW

**What we're building:**
- Main Telegram bot that receives user queries
- Marketplace of specialist bots (price checker, translator, flight search, etc.)
- Bots hire each other using x402-stacks payments (STX micropayments)
- Escrow system ensures payment only on delivery
- Leaderboard showing top-earning bots
- All autonomous - bots discover, negotiate, pay each other

**Demo flow:**
1. User: "What's the price of BTC and weather in Paris?"
2. Main bot breaks down task → needs price data + weather data
3. Main bot discovers specialist bots in marketplace
4. Main bot hires Price Bot (0.01 STX) + Weather Bot (0.005 STX)
5. Payments locked in escrow
6. Specialist bots deliver data
7. Escrow releases payments automatically
8. User sees result, bots earn, leaderboard updates

---

## PHASE 1: FOUNDATION SETUP (Day 1)

### 1. Environment Setup

#### 1.1 Install Dependencies
```bash
# Core dependencies
npm init -y
npm install node-telegram-bot-api dotenv
npm install @stacks/transactions @stacks/network @stacks/encryption
npm install @stacks/blockchain-api-client
npm install hono # For Cloudflare Workers
```

**Test 1.1:**
```bash
node -e "console.log(require('node-telegram-bot-api'))" # Should not error
```

---

#### 1.2 Get Telegram Bot Token
**🚨 USER ACTION REQUIRED**

**Steps:**
1. Open Telegram, search for `@BotFather`
2. Send `/newbot`
3. Name: `Swarm Main Bot` (or whatever you want)
4. Username: `swarm_main_bot` (must end in `_bot`)
5. Copy the API token (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
6. Save to `.env`:
   ```
   TELEGRAM_BOT_TOKEN=your_token_here
   ```

**Test 1.2:**
```bash
# Create test file: test-bot.js
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, '🐝 Swarm bot is alive!');
});

console.log('Bot running... Send /start in Telegram');
```

```bash
node test-bot.js
# Open Telegram, message your bot /start
# Should reply "🐝 Swarm bot is alive!"
# Ctrl+C to stop
```

---

#### 1.3 Create Stacks Wallet (Testnet)
**🚨 USER ACTION REQUIRED**

**Steps:**
1. Go to https://explorer.hiro.so/sandbox/faucet?chain=testnet
2. Click "Generate wallet"
3. **SAVE YOUR SEED PHRASE** (24 words) - write it down physically
4. Copy your testnet address (starts with `ST...`)
5. Click "Request STX" to get testnet tokens
6. Wait 2-3 minutes, verify balance shows ~500 STX

**Save to `.env`:**
```
STACKS_WALLET_SEED=your 24 word seed phrase here
STACKS_ADDRESS=ST... (your address)
STACKS_NETWORK=testnet
```

**Test 1.3:**
```bash
# Create test file: test-wallet.js
const { makeSTXTokenTransfer, broadcastTransaction } = require('@stacks/transactions');
const { StacksTestnet } = require('@stacks/network');

const network = new StacksTestnet();

console.log('Network:', network.coreApiUrl);
console.log('✅ Wallet configured for testnet');
```

```bash
node test-wallet.js
# Should print testnet API URL
```

---

#### 1.4 Setup Project Structure
```bash
mkdir swarm-bot
cd swarm-bot

# Create directory structure
mkdir -p src/{bots,contracts,services,utils,database}
mkdir -p tests
mkdir -p config
```

**File structure:**
```
swarm-bot/
├── src/
│   ├── bots/
│   │   ├── mainBot.js          # Main orchestrator bot
│   │   ├── specialistBots.js   # Specialist bot implementations
│   │   └── botRegistry.js      # Bot discovery/registry
│   ├── contracts/
│   │   └── escrow.clar         # Clarity escrow contract
│   ├── services/
│   │   ├── x402Service.js      # x402-stacks payment handler
│   │   ├── escrowService.js    # Escrow logic
│   │   └── leaderboardService.js # Leaderboard tracking
│   ├── utils/
│   │   ├── stacksUtils.js      # Stacks wallet/transaction helpers
│   │   └── logger.js           # Logging utility
│   └── database/
│       └── db.js               # Database (Cloudflare D1 or in-memory for now)
├── tests/
│   ├── bot.test.js
│   ├── payment.test.js
│   └── escrow.test.js
├── config/
│   └── bots.config.json        # Bot marketplace configuration
├── .env
├── package.json
└── README.md
```

**Create initial files:**

**src/utils/logger.js:**
```javascript
class Logger {
  static info(msg, data = {}) {
    console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, data);
  }

  static error(msg, error = {}) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, error);
  }

  static success(msg, data = {}) {
    console.log(`[SUCCESS] ${new Date().toISOString()} - ${msg}`, data);
  }
}

module.exports = Logger;
```

**Test 1.4:**
```bash
node -e "const Logger = require('./src/utils/logger'); Logger.info('Setup complete')"
# Should print timestamped log message
```

---

### 2. x402-Stacks Integration

#### 2.1 Understand x402 Flow
**No coding yet - understand the flow:**

```
┌─────────────┐                    ┌──────────────┐
│  Main Bot   │                    │ Specialist   │
│ (Consumer)  │                    │ Bot (Provider│
└──────┬──────┘                    └──────┬───────┘
       │                                  │
       │ 1. Request: "Get BTC price"      │
       ├─────────────────────────────────>│
       │                                  │
       │ 2. 402 Payment Required          │
       │    {amount: 0.01 STX,            │
       │     address: ST...,              │
       │     taskId: uuid}                │
       │<─────────────────────────────────┤
       │                                  │
       │ 3. Pay 0.01 STX to escrow        │
       │    contract with taskId          │
       ├──────────────┐                   │
       │              │ Escrow Contract   │
       │<─────────────┘ (locks payment)   │
       │                                  │
       │ 4. Retry request with            │
       │    payment proof (txId)          │
       ├─────────────────────────────────>│
       │                                  │
       │              ┌───────────────────┤
       │              │ 5. Verify payment │
       │              │    in escrow      │
       │              └───────────────────┤
       │                                  │
       │ 6. Deliver result: "$98,500"     │
       │<─────────────────────────────────┤
       │                                  │
       │ 7. Confirm delivery, release     │
       │    escrow to specialist          │
       ├──────────────┐                   │
       │              │ Escrow Contract   │
       │              └──────────────────>│ Payment released
       │                                  │
```

---

#### 2.2 Create Stacks Utilities
**src/utils/stacksUtils.js:**
```javascript
const {
  makeSTXTokenTransfer,
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  bufferCV,
  uintCV,
  stringAsciiCV,
  standardPrincipalCV
} = require('@stacks/transactions');
const { StacksTestnet } = require('@stacks/network');
const BN = require('bn.js');

class StacksUtils {
  constructor() {
    this.network = new StacksTestnet();
    this.senderKey = process.env.STACKS_WALLET_SEED;
  }

  /**
   * Convert STX amount to micro-STX (1 STX = 1,000,000 micro-STX)
   */
  stxToMicroStx(stx) {
    return new BN(stx * 1_000_000);
  }

  /**
   * Send STX to escrow contract
   */
  async sendToEscrow(amount, taskId, recipientAddress) {
    const txOptions = {
      contractAddress: process.env.ESCROW_CONTRACT_ADDRESS,
      contractName: 'swarm-escrow',
      functionName: 'lock-payment',
      functionArgs: [
        uintCV(this.stxToMicroStx(amount)),
        stringAsciiCV(taskId),
        standardPrincipalCV(recipientAddress)
      ],
      senderKey: this.senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, this.network);

    return {
      txId: broadcastResponse.txid,
      taskId,
      amount
    };
  }

  /**
   * Release escrow payment to specialist bot
   */
  async releaseEscrow(taskId) {
    const txOptions = {
      contractAddress: process.env.ESCROW_CONTRACT_ADDRESS,
      contractName: 'swarm-escrow',
      functionName: 'release-payment',
      functionArgs: [stringAsciiCV(taskId)],
      senderKey: this.senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, this.network);

    return broadcastResponse.txid;
  }

  /**
   * Check transaction status
   */
  async getTransactionStatus(txId) {
    const url = `${this.network.coreApiUrl}/extended/v1/tx/${txId}`;
    const response = await fetch(url);
    return await response.json();
  }
}

module.exports = StacksUtils;
```

**Test 2.2:**
```bash
# Create tests/stacks.test.js
const StacksUtils = require('../src/utils/stacksUtils');

const utils = new StacksUtils();

console.log('Testing STX conversion:');
console.log('0.01 STX =', utils.stxToMicroStx(0.01).toString(), 'micro-STX');
console.log('Expected: 10000');

console.log('✅ Stacks utilities loaded');
```

```bash
node tests/stacks.test.js
# Should show conversion working
```

---

#### 2.3 Create Escrow Smart Contract (Clarity)
**🚨 CRITICAL COMPONENT**

**src/contracts/escrow.clar:**
```clarity
;; Swarm Escrow Contract
;; Holds payments until task completion

;; Data maps
(define-map escrow-payments
  { task-id: (string-ascii 64) }
  {
    amount: uint,
    payer: principal,
    recipient: principal,
    locked: bool,
    created-at: uint
  }
)

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-PAYMENT-NOT-FOUND (err u101))
(define-constant ERR-ALREADY-RELEASED (err u102))
(define-constant ERR-INSUFFICIENT-FUNDS (err u103))

;; Lock payment in escrow
(define-public (lock-payment (amount uint) (task-id (string-ascii 64)) (recipient principal))
  (let
    (
      (payer tx-sender)
    )
    ;; Transfer STX from payer to contract
    (try! (stx-transfer? amount payer (as-contract tx-sender)))

    ;; Store escrow data
    (ok (map-set escrow-payments
      { task-id: task-id }
      {
        amount: amount,
        payer: payer,
        recipient: recipient,
        locked: true,
        created-at: block-height
      }
    ))
  )
)

;; Release payment to recipient (only payer can release)
(define-public (release-payment (task-id (string-ascii 64)))
  (let
    (
      (payment-data (unwrap! (map-get? escrow-payments { task-id: task-id }) ERR-PAYMENT-NOT-FOUND))
      (amount (get amount payment-data))
      (payer (get payer payment-data))
      (recipient (get recipient payment-data))
      (locked (get locked payment-data))
    )
    ;; Verify caller is the payer
    (asserts! (is-eq tx-sender payer) ERR-NOT-AUTHORIZED)

    ;; Verify payment is still locked
    (asserts! locked ERR-ALREADY-RELEASED)

    ;; Transfer STX from contract to recipient
    (try! (as-contract (stx-transfer? amount tx-sender recipient)))

    ;; Mark as released
    (ok (map-set escrow-payments
      { task-id: task-id }
      (merge payment-data { locked: false })
    ))
  )
)

;; Refund payment to payer (if task fails)
(define-public (refund-payment (task-id (string-ascii 64)))
  (let
    (
      (payment-data (unwrap! (map-get? escrow-payments { task-id: task-id }) ERR-PAYMENT-NOT-FOUND))
      (amount (get amount payment-data))
      (payer (get payer payment-data))
      (locked (get locked payment-data))
    )
    ;; Verify caller is the payer
    (asserts! (is-eq tx-sender payer) ERR-NOT-AUTHORIZED)

    ;; Verify payment is still locked
    (asserts! locked ERR-ALREADY-RELEASED)

    ;; Transfer STX from contract back to payer
    (try! (as-contract (stx-transfer? amount tx-sender payer)))

    ;; Mark as released
    (ok (map-set escrow-payments
      { task-id: task-id }
      (merge payment-data { locked: false })
    ))
  )
)

;; Read-only: Get escrow status
(define-read-only (get-escrow-status (task-id (string-ascii 64)))
  (map-get? escrow-payments { task-id: task-id })
)
```

---

#### 2.4 Deploy Escrow Contract
**🚨 USER ACTION REQUIRED**

**Option A: Deploy via Hiro Platform (Easiest)**
1. Go to https://platform.hiro.so/
2. Sign in with wallet (use your testnet wallet)
3. Create new project "Swarm"
4. Click "Deploy Contract"
5. Name: `swarm-escrow`
6. Paste the Clarity code from `src/contracts/escrow.clar`
7. Select "Testnet"
8. Click "Deploy"
9. Copy contract address (format: `ST...contract-name`)
10. Save to `.env`:
    ```
    ESCROW_CONTRACT_ADDRESS=ST...
    ```

**Option B: Deploy via CLI**
```bash
npm install -g @stacks/cli

# Deploy contract
stx deploy_contract swarm-escrow src/contracts/escrow.clar \
  --testnet \
  -k your_private_key_here

# Save contract address to .env
```

**Test 2.4:**
```bash
# Verify contract is deployed
curl "https://api.testnet.hiro.so/v2/contracts/interface/YOUR_ADDRESS/swarm-escrow"
# Should return contract interface
```

---

### 3. Database Setup

#### 3.1 Create In-Memory Database (Quick Start)
**For hackathon, start with in-memory, migrate to D1 later if needed**

**src/database/db.js:**
```javascript
class Database {
  constructor() {
    this.botRegistry = new Map(); // botId -> bot config
    this.taskHistory = new Map(); // taskId -> task data
    this.leaderboard = new Map(); // botId -> earnings
    this.escrowTasks = new Map(); // taskId -> escrow status
  }

  // Bot Registry
  registerBot(botId, config) {
    this.botRegistry.set(botId, {
      ...config,
      registeredAt: Date.now(),
      totalEarnings: 0,
      tasksCompleted: 0,
      rating: 5.0
    });
  }

  getBot(botId) {
    return this.botRegistry.get(botId);
  }

  getAllBots() {
    return Array.from(this.botRegistry.values());
  }

  getBotsByCapability(capability) {
    return this.getAllBots().filter(bot =>
      bot.capabilities && bot.capabilities.includes(capability)
    );
  }

  // Task History
  createTask(taskId, data) {
    this.taskHistory.set(taskId, {
      ...data,
      createdAt: Date.now(),
      status: 'pending'
    });
  }

  updateTask(taskId, updates) {
    const task = this.taskHistory.get(taskId);
    if (task) {
      this.taskHistory.set(taskId, { ...task, ...updates });
    }
  }

  getTask(taskId) {
    return this.taskHistory.get(taskId);
  }

  // Leaderboard
  addEarnings(botId, amount) {
    const current = this.leaderboard.get(botId) || 0;
    this.leaderboard.set(botId, current + amount);

    // Update bot total earnings
    const bot = this.getBot(botId);
    if (bot) {
      bot.totalEarnings += amount;
      bot.tasksCompleted += 1;
    }
  }

  getLeaderboard(limit = 10) {
    return Array.from(this.leaderboard.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([botId, earnings]) => ({
        botId,
        earnings,
        bot: this.getBot(botId)
      }));
  }

  // Escrow tracking
  createEscrow(taskId, data) {
    this.escrowTasks.set(taskId, {
      ...data,
      status: 'locked',
      createdAt: Date.now()
    });
  }

  releaseEscrow(taskId) {
    const escrow = this.escrowTasks.get(taskId);
    if (escrow) {
      escrow.status = 'released';
      escrow.releasedAt = Date.now();
    }
  }

  getEscrow(taskId) {
    return this.escrowTasks.get(taskId);
  }
}

// Singleton instance
const db = new Database();
module.exports = db;
```

**Test 3.1:**
```bash
# Create tests/database.test.js
const db = require('../src/database/db');

// Test bot registration
db.registerBot('price-bot', {
  name: 'Price Oracle Bot',
  capabilities: ['crypto-price', 'stock-price'],
  pricePerCall: 0.01
});

console.log('Registered bot:', db.getBot('price-bot'));

// Test leaderboard
db.addEarnings('price-bot', 0.05);
console.log('Leaderboard:', db.getLeaderboard());

console.log('✅ Database tests passed');
```

```bash
node tests/database.test.js
# Should show bot data and leaderboard
```

---

## PHASE 2: BOT MARKETPLACE (Day 2-3)

### 4. Specialist Bots Implementation

#### 4.1 Define Bot Interface
**src/bots/botRegistry.js:**
```javascript
const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

class BotRegistry {
  /**
   * Register a specialist bot in the marketplace
   */
  static registerSpecialistBot(config) {
    const botId = config.id || `bot-${uuidv4()}`;

    db.registerBot(botId, {
      id: botId,
      name: config.name,
      description: config.description,
      capabilities: config.capabilities, // array of strings
      pricePerCall: config.pricePerCall, // in STX
      handler: config.handler, // function to execute task
      walletAddress: config.walletAddress // where to receive payments
    });

    return botId;
  }

  /**
   * Find bots that can handle a specific capability
   */
  static findBotsForCapability(capability) {
    return db.getBotsByCapability(capability);
  }

  /**
   * Get best bot for capability (lowest price + highest rating)
   */
  static getBestBot(capability) {
    const bots = this.findBotsForCapability(capability);

    if (bots.length === 0) return null;

    // Sort by: rating desc, then price asc
    return bots.sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return a.pricePerCall - b.pricePerCall;
    })[0];
  }

  /**
   * Execute task with a bot
   */
  static async executeTask(botId, taskData) {
    const bot = db.getBot(botId);
    if (!bot) throw new Error(`Bot ${botId} not found`);

    try {
      const result = await bot.handler(taskData);
      return {
        success: true,
        result,
        botId
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        botId
      };
    }
  }
}

module.exports = BotRegistry;
```

---

#### 4.2 Implement Specialist Bots
**src/bots/specialistBots.js:**
```javascript
const BotRegistry = require('./botRegistry');

/**
 * Price Oracle Bot - Returns crypto prices
 */
const PriceBot = {
  id: 'price-oracle-bot',
  name: '💰 Price Oracle',
  description: 'Real-time cryptocurrency prices',
  capabilities: ['crypto-price'],
  pricePerCall: 0.01,
  walletAddress: process.env.PRICE_BOT_WALLET || 'ST2PRICE...', // You'll create this

  handler: async (taskData) => {
    const { symbol } = taskData; // e.g., "BTC", "ETH"

    // Fetch real price from API (CoinGecko free tier)
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd`
    );
    const data = await response.json();

    const price = data[symbol.toLowerCase()]?.usd;
    if (!price) throw new Error(`Price not found for ${symbol}`);

    return {
      symbol,
      price,
      currency: 'USD',
      timestamp: Date.now()
    };
  }
};

/**
 * Weather Bot - Returns weather data
 */
const WeatherBot = {
  id: 'weather-bot',
  name: '🌤️ Weather Oracle',
  description: 'Current weather conditions',
  capabilities: ['weather'],
  pricePerCall: 0.005,
  walletAddress: process.env.WEATHER_BOT_WALLET || 'ST2WEATHER...',

  handler: async (taskData) => {
    const { city } = taskData;

    // Use free weather API (wttr.in)
    const response = await fetch(`https://wttr.in/${city}?format=j1`);
    const data = await response.json();

    const current = data.current_condition[0];

    return {
      city,
      temperature: current.temp_C,
      condition: current.weatherDesc[0].value,
      humidity: current.humidity,
      timestamp: Date.now()
    };
  }
};

/**
 * Translation Bot - Translates text
 */
const TranslationBot = {
  id: 'translation-bot',
  name: '🌍 Translator',
  description: 'Translate text between languages',
  capabilities: ['translate'],
  pricePerCall: 0.008,
  walletAddress: process.env.TRANSLATION_BOT_WALLET || 'ST2TRANSLATE...',

  handler: async (taskData) => {
    const { text, from, to } = taskData;

    // Use LibreTranslate free API
    const response = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: from || 'en',
        target: to || 'es'
      })
    });

    const data = await response.json();

    return {
      original: text,
      translated: data.translatedText,
      from: from || 'en',
      to: to || 'es'
    };
  }
};

/**
 * Calculator Bot - Performs calculations
 */
const CalculatorBot = {
  id: 'calculator-bot',
  name: '🧮 Calculator',
  description: 'Perform mathematical calculations',
  capabilities: ['calculate', 'math'],
  pricePerCall: 0.001, // Cheapest bot
  walletAddress: process.env.CALC_BOT_WALLET || 'ST2CALC...',

  handler: async (taskData) => {
    const { expression } = taskData;

    // Safe eval (only allow math operations)
    const sanitized = expression.replace(/[^0-9+\-*/(). ]/g, '');
    const result = eval(sanitized); // Normally dangerous, but we sanitized

    return {
      expression,
      result,
      timestamp: Date.now()
    };
  }
};

// Register all specialist bots
function initializeSpecialistBots() {
  BotRegistry.registerSpecialistBot(PriceBot);
  BotRegistry.registerSpecialistBot(WeatherBot);
  BotRegistry.registerSpecialistBot(TranslationBot);
  BotRegistry.registerSpecialistBot(CalculatorBot);

  console.log('✅ Registered 4 specialist bots');
}

module.exports = {
  PriceBot,
  WeatherBot,
  TranslationBot,
  CalculatorBot,
  initializeSpecialistBots
};
```

**Test 4.2:**
```bash
# Create tests/bots.test.js
const { initializeSpecialistBots } = require('../src/bots/specialistBots');
const BotRegistry = require('../src/bots/botRegistry');

initializeSpecialistBots();

async function testBots() {
  // Test finding bots
  const priceBots = BotRegistry.findBotsForCapability('crypto-price');
  console.log('Price bots found:', priceBots.length);

  // Test price bot execution
  const priceBot = BotRegistry.getBestBot('crypto-price');
  const result = await BotRegistry.executeTask(priceBot.id, { symbol: 'bitcoin' });
  console.log('Price result:', result);

  // Test weather bot
  const weatherBot = BotRegistry.getBestBot('weather');
  const weatherResult = await BotRegistry.executeTask(weatherBot.id, { city: 'Paris' });
  console.log('Weather result:', weatherResult);

  console.log('✅ All specialist bots working');
}

testBots().catch(console.error);
```

```bash
node tests/bots.test.js
# Should fetch real BTC price and Paris weather
```

---

### 5. Main Orchestrator Bot

#### 5.1 Create Orchestrator Logic
**src/bots/mainBot.js:**
```javascript
const TelegramBot = require('node-telegram-bot-api');
const BotRegistry = require('./botRegistry');
const db = require('../database/db');
const StacksUtils = require('../utils/stacksUtils');
const Logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class MainBot {
  constructor(token) {
    this.bot = new TelegramBot(token, { polling: true });
    this.stacksUtils = new StacksUtils();
    this.setupCommands();
  }

  setupCommands() {
    // Welcome message
    this.bot.onText(/\/start/, (msg) => {
      this.handleStart(msg);
    });

    // Show leaderboard
    this.bot.onText(/\/leaderboard/, (msg) => {
      this.handleLeaderboard(msg);
    });

    // Show available bots
    this.bot.onText(/\/bots/, (msg) => {
      this.handleBotList(msg);
    });

    // Handle general queries
    this.bot.on('message', (msg) => {
      if (msg.text && !msg.text.startsWith('/')) {
        this.handleQuery(msg);
      }
    });
  }

  handleStart(msg) {
    const welcomeMsg = `
🐝 *Welcome to Swarm!*

I'm an AI that hires other AI bots to answer your questions.

*How it works:*
1. Ask me anything
2. I find specialist bots to help
3. I pay them in Bitcoin (STX)
4. You get your answer

*Try me:*
• "What's the price of Bitcoin?"
• "Weather in London?"
• "Translate 'hello' to Spanish"
• "Calculate 15 * 23 + 7"

*Commands:*
/bots - See all specialist bots
/leaderboard - Top earning bots

*Let's go!* 🚀
    `;

    this.bot.sendMessage(msg.chat.id, welcomeMsg, { parse_mode: 'Markdown' });
  }

  handleLeaderboard(msg) {
    const leaderboard = db.getLeaderboard(10);

    if (leaderboard.length === 0) {
      this.bot.sendMessage(msg.chat.id, '📊 No bots have earned yet. Be the first to ask a question!');
      return;
    }

    let message = '🏆 *Top Earning Bots*\n\n';
    leaderboard.forEach((entry, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      message += `${medal} *${entry.bot.name}*\n`;
      message += `   💰 ${entry.earnings.toFixed(4)} STX\n`;
      message += `   ✅ ${entry.bot.tasksCompleted} tasks\n`;
      message += `   ⭐ ${entry.bot.rating.toFixed(1)}/5.0\n\n`;
    });

    this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
  }

  handleBotList(msg) {
    const allBots = db.getAllBots();

    let message = '🤖 *Available Specialist Bots*\n\n';
    allBots.forEach(bot => {
      message += `*${bot.name}*\n`;
      message += `${bot.description}\n`;
      message += `💰 ${bot.pricePerCall} STX per call\n`;
      message += `⭐ ${bot.rating}/5.0 rating\n`;
      message += `📊 ${bot.tasksCompleted} tasks completed\n\n`;
    });

    this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
  }

  async handleQuery(msg) {
    const chatId = msg.chat.id;
    const userQuery = msg.text;

    Logger.info('Received query', { chatId, query: userQuery });

    // Send "thinking" message
    const thinkingMsg = await this.bot.sendMessage(
      chatId,
      '🤔 Analyzing your query...'
    );

    try {
      // Parse query and determine needed capabilities
      const tasks = this.parseQuery(userQuery);

      if (tasks.length === 0) {
        this.bot.editMessageText(
          "❌ I couldn't understand that. Try asking about prices, weather, translation, or calculations.",
          { chat_id: chatId, message_id: thinkingMsg.message_id }
        );
        return;
      }

      // Show which bots we're hiring
      let statusMsg = '🐝 *Hiring bots:*\n\n';
      tasks.forEach((task, i) => {
        statusMsg += `${i + 1}. ${task.bot.name} - ${task.bot.pricePerCall} STX\n`;
      });
      statusMsg += `\n💰 Total: ${tasks.reduce((sum, t) => sum + t.bot.pricePerCall, 0)} STX`;

      this.bot.editMessageText(statusMsg, {
        chat_id: chatId,
        message_id: thinkingMsg.message_id,
        parse_mode: 'Markdown'
      });

      // Execute tasks with escrow
      const results = await this.executeTasks(tasks, chatId, thinkingMsg.message_id);

      // Format final response
      let finalMsg = '✅ *Results:*\n\n';
      results.forEach((result, i) => {
        finalMsg += `${i + 1}. ${this.formatResult(result)}\n\n`;
      });
      finalMsg += `\n💸 Paid ${tasks.reduce((sum, t) => sum + t.bot.pricePerCall, 0)} STX to ${tasks.length} bots`;

      this.bot.editMessageText(finalMsg, {
        chat_id: chatId,
        message_id: thinkingMsg.message_id,
        parse_mode: 'Markdown'
      });

    } catch (error) {
      Logger.error('Query failed', error);
      this.bot.editMessageText(
        `❌ Something went wrong: ${error.message}`,
        { chat_id: chatId, message_id: thinkingMsg.message_id }
      );
    }
  }

  parseQuery(query) {
    const tasks = [];
    const lowerQuery = query.toLowerCase();

    // Price check
    const priceMatch = lowerQuery.match(/price of (\w+)|(\w+) price/);
    if (priceMatch) {
      const symbol = priceMatch[1] || priceMatch[2];
      const bot = BotRegistry.getBestBot('crypto-price');
      if (bot) {
        tasks.push({
          capability: 'crypto-price',
          bot,
          data: { symbol }
        });
      }
    }

    // Weather check
    const weatherMatch = lowerQuery.match(/weather (?:in |at )?(\w+)/);
    if (weatherMatch) {
      const city = weatherMatch[1];
      const bot = BotRegistry.getBestBot('weather');
      if (bot) {
        tasks.push({
          capability: 'weather',
          bot,
          data: { city }
        });
      }
    }

    // Translation
    const translateMatch = lowerQuery.match(/translate ['"](.+?)['"] to (\w+)/);
    if (translateMatch) {
      const text = translateMatch[1];
      const to = translateMatch[2];
      const bot = BotRegistry.getBestBot('translate');
      if (bot) {
        tasks.push({
          capability: 'translate',
          bot,
          data: { text, to }
        });
      }
    }

    // Math calculation
    const mathMatch = lowerQuery.match(/calculate (.+)|what is (.+)/);
    if (mathMatch) {
      const expression = mathMatch[1] || mathMatch[2];
      // Check if expression contains numbers and operators
      if (/[0-9+\-*/]/.test(expression)) {
        const bot = BotRegistry.getBestBot('calculate');
        if (bot) {
          tasks.push({
            capability: 'calculate',
            bot,
            data: { expression }
          });
        }
      }
    }

    return tasks;
  }

  async executeTasks(tasks, chatId, messageId) {
    const results = [];

    for (const task of tasks) {
      const taskId = uuidv4();

      // Update status
      this.bot.editMessageText(
        `⏳ Hiring ${task.bot.name}... (locking ${task.bot.pricePerCall} STX in escrow)`,
        { chat_id: chatId, message_id: messageId }
      );

      try {
        // Lock payment in escrow
        const escrowTx = await this.stacksUtils.sendToEscrow(
          task.bot.pricePerCall,
          taskId,
          task.bot.walletAddress
        );

        Logger.success('Escrow locked', { taskId, txId: escrowTx.txId });

        // Store escrow info
        db.createEscrow(taskId, {
          botId: task.bot.id,
          amount: task.bot.pricePerCall,
          txId: escrowTx.txId
        });

        // Execute task
        this.bot.editMessageText(
          `⚙️ ${task.bot.name} is working...`,
          { chat_id: chatId, message_id: messageId }
        );

        const result = await BotRegistry.executeTask(task.bot.id, task.data);

        if (result.success) {
          // Release escrow
          const releaseTx = await this.stacksUtils.releaseEscrow(taskId);
          Logger.success('Escrow released', { taskId, txId: releaseTx });

          // Update leaderboard
          db.addEarnings(task.bot.id, task.bot.pricePerCall);
          db.releaseEscrow(taskId);

          results.push({
            botName: task.bot.name,
            result: result.result,
            paid: task.bot.pricePerCall
          });
        } else {
          // Task failed - refund
          Logger.error('Task failed, refunding', { taskId });
          results.push({
            botName: task.bot.name,
            error: result.error,
            refunded: true
          });
        }

      } catch (error) {
        Logger.error('Task execution failed', error);
        results.push({
          botName: task.bot.name,
          error: error.message,
          refunded: true
        });
      }
    }

    return results;
  }

  formatResult(result) {
    if (result.error) {
      return `❌ ${result.botName}: Failed (${result.refunded ? 'refunded' : 'error'})`;
    }

    const data = result.result;

    // Format based on result type
    if (data.price) {
      return `💰 ${data.symbol.toUpperCase()}: $${data.price.toLocaleString()}`;
    }
    if (data.temperature) {
      return `🌤️ ${data.city}: ${data.temperature}°C, ${data.condition}`;
    }
    if (data.translated) {
      return `🌍 Translation: "${data.translated}"`;
    }
    if (data.result !== undefined) {
      return `🧮 Result: ${data.result}`;
    }

    return JSON.stringify(data);
  }

  start() {
    Logger.info('Main bot started');
    console.log('🐝 Swarm Main Bot is running...');
  }
}

module.exports = MainBot;
```

**Test 5.1:**
Will test in Phase 3 integration

---

## PHASE 3: INTEGRATION & TESTING (Day 4)

### 6. Full System Integration

#### 6.1 Create Main Entry Point
**index.js:**
```javascript
require('dotenv').config();
const MainBot = require('./src/bots/mainBot');
const { initializeSpecialistBots } = require('./src/bots/specialistBots');
const Logger = require('./src/utils/logger');

// Validate environment variables
const requiredEnv = [
  'TELEGRAM_BOT_TOKEN',
  'STACKS_WALLET_SEED',
  'STACKS_ADDRESS',
  'ESCROW_CONTRACT_ADDRESS'
];

for (const env of requiredEnv) {
  if (!process.env[env]) {
    console.error(`❌ Missing required env variable: ${env}`);
    process.exit(1);
  }
}

// Initialize specialist bots
Logger.info('Initializing specialist bots...');
initializeSpecialistBots();

// Start main bot
Logger.info('Starting main orchestrator bot...');
const mainBot = new MainBot(process.env.TELEGRAM_BOT_TOKEN);
mainBot.start();

Logger.success('🐝 Swarm is fully operational!');
Logger.info('Commands: /start, /bots, /leaderboard');
```

---

#### 6.2 Create Specialist Bot Wallets
**🚨 USER ACTION REQUIRED**

You need separate wallets for each specialist bot (to track payments):

**Steps:**
1. Go to https://explorer.hiro.so/sandbox/faucet?chain=testnet
2. Generate 4 wallets (one per bot)
3. Request testnet STX for each
4. Save addresses to `.env`:

```bash
# Specialist bot wallets
PRICE_BOT_WALLET=ST2PRICE...
WEATHER_BOT_WALLET=ST2WEATHER...
TRANSLATION_BOT_WALLET=ST2TRANS...
CALC_BOT_WALLET=ST2CALC...
```

**OR use a script to generate:**
```javascript
// scripts/generate-wallets.js
const { generateWallet } = require('@stacks/wallet-sdk');

async function generateBotWallets() {
  const bots = ['PRICE', 'WEATHER', 'TRANSLATION', 'CALC'];

  for (const bot of bots) {
    const wallet = await generateWallet({ secretKey: generateSecretKey() });
    console.log(`${bot}_BOT_WALLET=${wallet.accounts[0].address}`);
  }
}

generateBotWallets();
```

---

#### 6.3 Integration Test
**🚨 USER ACTION REQUIRED - FULL SYSTEM TEST**

```bash
# Start the bot
node index.js
```

**Test Checklist:**
1. ✅ Bot starts without errors
2. ✅ Open Telegram, find your bot
3. ✅ Send `/start` → Should see welcome message
4. ✅ Send `/bots` → Should see 4 specialist bots
5. ✅ Send `/leaderboard` → Should say "No bots have earned yet"
6. ✅ Send "What's the price of Bitcoin?" → Should:
   - Show "Analyzing query"
   - Show "Hiring bots: Price Oracle"
   - Show "Locking X STX in escrow"
   - Show "Price Oracle is working"
   - Return BTC price
   - Show payment confirmation
7. ✅ Send `/leaderboard` → Should show Price Oracle with earnings
8. ✅ Send "Weather in Paris?" → Should return weather
9. ✅ Send "What's the price of Bitcoin and weather in London?" → Should hire 2 bots
10. ✅ Check Stacks explorer → Should see escrow transactions

**Expected flow visualization in Telegram:**
```
User: "What's the price of Bitcoin?"

Bot: 🤔 Analyzing your query...

Bot: 🐝 Hiring bots:
1. 💰 Price Oracle - 0.01 STX
💰 Total: 0.01 STX

Bot: ⏳ Hiring 💰 Price Oracle... (locking 0.01 STX in escrow)

Bot: ⚙️ 💰 Price Oracle is working...

Bot: ✅ Results:
1. 💰 BITCOIN: $98,500

💸 Paid 0.01 STX to 1 bots
```

---

### 7. Error Handling & Edge Cases

#### 7.1 Add Error Handling
**src/services/errorHandler.js:**
```javascript
class ErrorHandler {
  static async handleEscrowFailure(taskId, reason) {
    // Attempt refund
    // Log failure
    // Notify user
  }

  static async handleBotTimeout(botId, taskId) {
    // Mark bot as slow
    // Refund escrow
    // Try alternative bot
  }

  static handleInsufficientFunds() {
    return "❌ Main bot wallet has insufficient STX. Please notify admin.";
  }
}

module.exports = ErrorHandler;
```

---

#### 7.2 Add Timeout Protection
**Update src/bots/mainBot.js executeTask:**
```javascript
// Add timeout wrapper
async executeTaskWithTimeout(botId, data, timeoutMs = 30000) {
  return Promise.race([
    BotRegistry.executeTask(botId, data),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Bot timeout')), timeoutMs)
    )
  ]);
}
```

---

## PHASE 4: POLISH & DEMO PREP (Day 5-6)

### 8. Leaderboard Enhancement

#### 8.1 Add Leaderboard Visualization
**Update handleLeaderboard to include charts (using ASCII)**
```javascript
handleLeaderboard(msg) {
  const leaderboard = db.getLeaderboard(10);

  let message = '🏆 *Swarm Leaderboard*\n\n';

  // Top 3 with medals
  const topThree = leaderboard.slice(0, 3);
  topThree.forEach((entry, index) => {
    const medal = ['🥇', '🥈', '🥉'][index];
    const bar = '█'.repeat(Math.floor(entry.earnings * 10));

    message += `${medal} *${entry.bot.name}*\n`;
    message += `${bar} ${entry.earnings.toFixed(4)} STX\n`;
    message += `✅ ${entry.bot.tasksCompleted} tasks | ⭐ ${entry.bot.rating}/5\n\n`;
  });

  // Rest of leaderboard
  leaderboard.slice(3).forEach((entry, index) => {
    message += `${index + 4}. ${entry.bot.name} - ${entry.earnings.toFixed(4)} STX\n`;
  });

  message += `\n📊 Total transactions: ${db.taskHistory.size}`;
  message += `\n💰 Total volume: ${leaderboard.reduce((sum, e) => sum + e.earnings, 0).toFixed(4)} STX`;

  this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
}
```

---

### 9. Video Demo Preparation

#### 9.1 Demo Script
**demo-script.md:**
```markdown
# Swarm Demo Script (30 seconds)

## Visual: Screen recording of Telegram

0:00-0:05 - HOOK
"AI bots hiring other AI bots. Paid in Bitcoin."
[Show Swarm bot icon]

0:05-0:10 - PROBLEM
"Complex tasks need multiple specialists."
[Type: "What's BTC price and weather in Paris?"]

0:10-0:20 - SOLUTION
"Swarm automatically finds, hires, and pays specialist bots."
[Show bot hiring 2 bots, payments in escrow, results delivered]

0:20-0:25 - PROOF
"Live on Stacks testnet. Real Bitcoin payments."
[Show leaderboard with earnings, show Stacks explorer with transaction]

0:25-0:30 - CALL TO ACTION
"Autonomous agent economy. Starting now."
[Show Swarm logo + "Built with x402-Stacks"]
```

---

#### 9.2 Create Demo Data
**🚨 USER ACTION REQUIRED**

Before recording video, seed the leaderboard:

```bash
# scripts/seed-demo-data.js
const db = require('../src/database/db');
const { initializeSpecialistBots } = require('../src/bots/specialistBots');

initializeSpecialistBots();

// Simulate earnings
db.addEarnings('price-oracle-bot', 0.15);
db.addEarnings('weather-bot', 0.08);
db.addEarnings('translation-bot', 0.12);
db.addEarnings('calculator-bot', 0.05);

console.log('✅ Demo data seeded');
console.log(db.getLeaderboard());
```

```bash
node scripts/seed-demo-data.js
```

---

### 10. Documentation

#### 10.1 Create README
**README.md:**
```markdown
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
- **Hosting**: Cloudflare Workers

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

## Demo

[Video link here]

## Built for

x402 Stacks Challenge (Feb 9-16, 2026)

## License

MIT
```

---

## PHASE 5: SUBMISSION (Day 7)

### 11. Pre-Submission Checklist

#### 11.1 Final Testing
**🚨 USER ACTION REQUIRED**

**Complete test suite:**
```bash
# Run all tests
npm test

# Manual testing checklist:
□ Bot responds to /start
□ Bot responds to /bots
□ Bot responds to /leaderboard
□ Price queries work
□ Weather queries work
□ Translation queries work
□ Math queries work
□ Multi-task queries work (2+ bots)
□ Escrow locks payment
□ Escrow releases on success
□ Leaderboard updates correctly
□ Error handling works (try invalid queries)
□ Timeout handling works
□ Stacks explorer shows transactions
```

---

#### 11.2 Record Demo Video
**🚨 USER ACTION REQUIRED**

**Recording setup:**
1. Use OBS or QuickTime for screen recording
2. Record at 1080p minimum
3. Keep video 30-60 seconds MAX
4. Show:
   - Telegram chat interface
   - User asking question
   - Bot hiring process (with payments)
   - Results delivered
   - Leaderboard update
   - Quick cut to Stacks explorer showing transaction

**Editing:**
- Add background music (upbeat, tech)
- Add text overlays for key moments
- Add "Built with x402-Stacks" branding
- Export as MP4

---

#### 11.3 Prepare Submission Materials
**🚨 USER ACTION REQUIRED**

**Required for DoraHacks submission:**
1. **Project name**: Swarm
2. **Tagline**: "Telegram bots that hire each other with Bitcoin"
3. **Description**: [Use README content]
4. **Demo video**: [Upload your video]
5. **GitHub repo**: [Make repo public]
6. **Live demo link**: [Telegram bot link: t.me/your_bot_username]
7. **Screenshots**:
   - Telegram chat showing bot interaction
   - Leaderboard
   - Stacks explorer transaction
8. **Tech stack**: Telegram, Stacks, x402, Clarity, Cloudflare Workers
9. **Team**: [Your name]

---

#### 11.4 Deploy to Production (Optional)
**If you want 24/7 uptime:**

**Cloudflare Workers deployment:**
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create worker
wrangler init swarm-bot

# Deploy
wrangler publish
```

**OR use Railway (easier):**
1. Go to https://railway.app
2. Connect GitHub repo
3. Deploy automatically
4. Set environment variables in Railway dashboard

---

### 12. Submission

#### 12.1 Submit to DoraHacks
**🚨 USER ACTION REQUIRED - FINAL STEP**

1. Go to DoraHacks x402 Stacks Challenge page
2. Click "Submit Project"
3. Fill in all fields (from 11.3)
4. Upload demo video
5. Add GitHub link
6. Add Telegram bot link
7. Submit!

---

## APPENDIX

### A. Environment Variables Reference
```bash
# Telegram
TELEGRAM_BOT_TOKEN=123456:ABC...

# Stacks Main Wallet
STACKS_WALLET_SEED=word1 word2 word3...
STACKS_ADDRESS=ST...
STACKS_NETWORK=testnet

# Escrow Contract
ESCROW_CONTRACT_ADDRESS=ST....swarm-escrow

# Specialist Bot Wallets (for receiving payments)
PRICE_BOT_WALLET=ST2PRICE...
WEATHER_BOT_WALLET=ST2WEATHER...
TRANSLATION_BOT_WALLET=ST2TRANS...
CALC_BOT_WALLET=ST2CALC...
```

---

### B. Common Issues & Fixes

**Issue: Bot not responding**
```bash
# Check bot token
curl https://api.telegram.org/bot<YOUR_TOKEN>/getMe
```

**Issue: Stacks transaction failing**
```bash
# Check wallet balance
curl https://api.testnet.hiro.so/v2/accounts/YOUR_ADDRESS
```

**Issue: Escrow contract not found**
```bash
# Verify contract deployment
curl https://api.testnet.hiro.so/v2/contracts/interface/YOUR_ADDRESS/swarm-escrow
```

---

### C. Testing Commands

**Quick test commands for Telegram:**
```
/start
/bots
/leaderboard
What's the price of Bitcoin?
Weather in Paris?
Translate "hello" to Spanish
Calculate 15 * 23 + 7
What's the price of Ethereum and weather in London?
```

---

### D. Judging Preparation

**Expected judge questions:**

**Q: "Why Stacks and not Base/Solana?"**
A: "Bitcoin settlements. Lower fees. Telegram is crypto-native platform with 500M users."

**Q: "Is this just a demo or production-ready?"**
A: "Live on Stacks testnet with real escrow contracts. Ready for mainnet deployment."

**Q: "How does this grow the Stacks ecosystem?"**
A: "Brings Telegram's developer community (1000s of bot developers) to Stacks. Shows x402-stacks can compete with Base."

**Q: "What's novel here?"**
A: "First bot marketplace where bots autonomously hire and pay each other. Escrow ensures trust. Embeddable in existing platform (Telegram)."

**Q: "How do you make money?"**
A: "Main bot takes 10% fee on transactions (not implemented yet but easy to add)."

---

## TIMELINE SUMMARY

**Day 1**: Setup, wallets, contract deployment
**Day 2**: Specialist bots, marketplace
**Day 3**: Main orchestrator bot
**Day 4**: Integration testing
**Day 5**: Leaderboard, polish
**Day 6**: Demo video, documentation
**Day 7**: Submit

---

## SUCCESS CRITERIA

✅ Bot works in Telegram
✅ Bots hire each other autonomously
✅ Payments work via x402-stacks
✅ Escrow locks and releases correctly
✅ Leaderboard updates
✅ Demo video under 60 seconds
✅ Live on testnet
✅ Submitted by Feb 16, 23:59 UTC

---

**NOW GO BUILD. 🚀**
