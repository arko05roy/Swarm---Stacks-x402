# 🚨 SETUP REQUIRED - User Actions Needed

The core code is complete! Now you need to provide credentials and deploy the smart contract.

## Step 1: Create Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot`
3. Choose a name: `Swarm Main Bot` (or any name you like)
4. Choose a username: `swarm_main_bot_yourname` (must end in `_bot` and be unique)
5. BotFather will give you an API token that looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
6. **Save this token** - you'll need it for the .env file

## Step 2: Create Main Stacks Wallet (Testnet)

1. Go to: https://explorer.hiro.so/sandbox/faucet?chain=testnet
2. Click **"Generate wallet"**
3. **CRITICAL: Write down your 24-word seed phrase** (store it securely!)
4. Copy your testnet address (starts with `ST...`)
5. Click **"Request STX"** to get testnet tokens (~500 STX)
6. Wait 2-3 minutes for tokens to arrive
7. Verify balance shows STX on the explorer

**Save these values:**
- Seed phrase (24 words)
- Wallet address (ST...)

## Step 3: Deploy Escrow Smart Contract

The contract is already written at `src/contracts/escrow.clar`

**Option A: Deploy via Hiro Platform (Easiest)**

1. Go to: https://platform.hiro.so/
2. Sign in with your wallet (use the seed phrase from Step 2)
3. Create new project: "Swarm"
4. Click **"Deploy Contract"**
5. Contract name: `swarm-escrow`
6. Copy and paste the entire contents of `src/contracts/escrow.clar`
7. Select network: **Testnet**
8. Click **"Deploy"**
9. Wait for confirmation (~1-2 minutes)
10. **Copy the full contract address** (format: `ST...contract-deployer.swarm-escrow`)

**Option B: Deploy via CLI**

```bash
npm install -g @stacks/cli

stx deploy_contract swarm-escrow src/contracts/escrow.clar \
  --testnet \
  -k YOUR_PRIVATE_KEY
```

## Step 4: Create Specialist Bot Wallets

You need 4 separate wallets (one for each specialist bot to receive payments).

**For each bot, repeat:**
1. Go to: https://explorer.hiro.so/sandbox/faucet?chain=testnet
2. Click **"Generate wallet"**
3. Copy the address (ST...)
4. Request STX from faucet (not critical, but helpful for testing)

**You need addresses for:**
- Price Bot
- Weather Bot
- Translation Bot
- Calculator Bot

## Step 5: Create .env File

Create a file named `.env` in the project root with:

```bash
# Telegram
TELEGRAM_BOT_TOKEN=<your_token_from_step_1>

# Stacks Main Wallet
STACKS_WALLET_SEED=<your 24 word seed phrase from step 2>
STACKS_ADDRESS=<your ST... address from step 2>
STACKS_NETWORK=testnet

# Escrow Contract
ESCROW_CONTRACT_ADDRESS=<contract address from step 3>

# Specialist Bot Wallets
PRICE_BOT_WALLET=<address 1>
WEATHER_BOT_WALLET=<address 2>
TRANSLATION_BOT_WALLET=<address 3>
CALC_BOT_WALLET=<address 4>
```

## Step 6: Test the Bot

Once your .env file is ready:

```bash
npm start
```

Expected output:
```
[INFO] ... Initializing specialist bots...
✅ Registered 4 specialist bots
[INFO] ... Starting main orchestrator bot...
[INFO] ... Main bot started
🐝 Swarm Main Bot is running...
[SUCCESS] ... 🐝 Swarm is fully operational!
```

Then:
1. Open Telegram
2. Find your bot (search for the username you created)
3. Send: `/start`
4. You should get a welcome message!

## What I've Built So Far

✅ Complete project structure
✅ All core bot logic (main bot + 4 specialist bots)
✅ Stacks blockchain integration
✅ Escrow payment system
✅ Bot registry and marketplace
✅ Leaderboard tracking
✅ Database (in-memory)
✅ Telegram bot commands and message handling
✅ Query parsing and task routing
✅ Error handling
✅ Logging utilities

## Ready When You Are!

Once you complete Steps 1-5 above and provide your .env file, we can:
1. Test the full system
2. Debug any issues
3. Enhance features if needed
4. Prepare the demo video
5. Submit to the hackathon

**Take your time with the setup - let me know when you're ready or if you need help with any step!**
