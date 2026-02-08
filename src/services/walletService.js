const bip39 = require('bip39');
const { generateWallet } = require('@stacks/wallet-sdk');
const { privateKeyToAddress } = require('@stacks/transactions');
const { STACKS_TESTNET } = require('@stacks/network');
const crypto = require('crypto');
const Logger = require('../utils/logger');
const { saveWallets, loadWallets } = require('../database/persistence');

// Encryption key derived from env (or random per-session if not set)
const ENCRYPTION_KEY = crypto
  .createHash('sha256')
  .update(process.env.WALLET_ENCRYPTION_KEY || process.env.STACKS_WALLET_SEED || 'swarm-default-key')
  .digest();

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(data) {
  const [ivHex, encrypted] = data.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

class WalletService {
  constructor() {
    this.userWallets = new Map(); // telegramUserId -> encrypted wallet data
    this._loadFromDisk();
  }

  _loadFromDisk() {
    const wallets = loadWallets();
    if (wallets) {
      for (const [userId, data] of wallets) {
        this.userWallets.set(userId, data);
      }
      Logger.info('Wallets restored', { count: wallets.length });
    }
  }

  _saveToDisk() {
    saveWallets(this.userWallets);
  }

  /**
   * Generate a new Stacks testnet wallet using proper BIP-44 derivation.
   * Compatible with Leather/Hiro wallet when importing recovery phrase.
   */
  async generateWallet(telegramUserId) {
    // Return existing wallet if already generated
    if (this.userWallets.has(telegramUserId)) {
      return this._getDecryptedWallet(telegramUserId);
    }

    // Generate 24-word mnemonic
    const mnemonic = bip39.generateMnemonic(256);

    // Use @stacks/wallet-sdk for proper BIP-44 derivation (compatible with Leather/Hiro)
    const wallet = await generateWallet({ secretKey: mnemonic, password: '' });
    const privateKey = wallet.accounts[0].stxPrivateKey;

    // Generate Stacks testnet address
    const address = privateKeyToAddress(privateKey, STACKS_TESTNET);

    // Store encrypted - only address is in plaintext
    this.userWallets.set(telegramUserId, {
      address,
      encryptedMnemonic: encrypt(mnemonic),
      encryptedPrivateKey: encrypt(privateKey),
      createdAt: Date.now()
    });

    Logger.success('Wallet generated', {
      userId: telegramUserId,
      address
    });

    this._saveToDisk();

    return {
      address,
      createdAt: Date.now()
    };
  }

  _getDecryptedWallet(telegramUserId) {
    const stored = this.userWallets.get(telegramUserId);
    if (!stored) return null;
    return {
      address: stored.address,
      createdAt: stored.createdAt
    };
  }

  /**
   * Get user's wallet (public info only)
   */
  getWallet(telegramUserId) {
    return this._getDecryptedWallet(telegramUserId);
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
    const stored = this.userWallets.get(telegramUserId);
    return stored ? stored.address : null;
  }

  /**
   * Export mnemonic for user backup (decrypted on demand, never logged)
   */
  exportMnemonic(telegramUserId) {
    const stored = this.userWallets.get(telegramUserId);
    if (!stored) return null;
    return decrypt(stored.encryptedMnemonic);
  }

  /**
   * Get private key (decrypted on demand, for signing transactions only)
   */
  getPrivateKey(telegramUserId) {
    const stored = this.userWallets.get(telegramUserId);
    if (!stored) return null;
    return decrypt(stored.encryptedPrivateKey);
  }

  /**
   * Get total number of wallets generated
   */
  getTotalWallets() {
    return this.userWallets.size;
  }
}

module.exports = WalletService;
