const bip39 = require('bip39');
const { privateKeyToAddress } = require('@stacks/transactions');
const { STACKS_TESTNET } = require('@stacks/network');
const Logger = require('../utils/logger');

class WalletService {
  constructor() {
    this.userWallets = new Map(); // telegramUserId -> wallet data
  }

  /**
   * Generate a new Stacks testnet wallet for a user
   * Returns existing wallet if user already has one (idempotent)
   */
  generateWallet(telegramUserId) {
    // Return existing wallet if already generated
    if (this.userWallets.has(telegramUserId)) {
      return this.userWallets.get(telegramUserId);
    }

    // Generate 24-word mnemonic
    const mnemonic = bip39.generateMnemonic(256);

    // Derive private key from seed
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const privateKey = seed.slice(0, 32).toString('hex');

    // Generate Stacks testnet address
    const address = privateKeyToAddress(privateKey, STACKS_TESTNET);

    const wallet = {
      address,
      mnemonic,
      privateKey,
      createdAt: Date.now()
    };

    this.userWallets.set(telegramUserId, wallet);

    Logger.success('Wallet generated', {
      userId: telegramUserId,
      address
    });

    return wallet;
  }

  /**
   * Get user's wallet (null if doesn't exist)
   */
  getWallet(telegramUserId) {
    return this.userWallets.get(telegramUserId) || null;
  }

  /**
   * Check if user has a wallet
   */
  hasWallet(telegramUserId) {
    return this.userWallets.has(telegramUserId);
  }

  /**
   * Get wallet address only
   */
  getAddress(telegramUserId) {
    const wallet = this.userWallets.get(telegramUserId);
    return wallet ? wallet.address : null;
  }

  /**
   * Export mnemonic for user backup
   */
  exportMnemonic(telegramUserId) {
    const wallet = this.userWallets.get(telegramUserId);
    return wallet ? wallet.mnemonic : null;
  }

  /**
   * Get total number of wallets generated
   */
  getTotalWallets() {
    return this.userWallets.size;
  }
}

module.exports = WalletService;
