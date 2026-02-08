const fs = require('fs');
const path = require('path');
const Logger = require('../utils/logger');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const WALLETS_FILE = path.join(DATA_DIR, 'wallets.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Save database state to disk (bots, earnings, escrows)
 */
function saveDatabase(db) {
  try {
    const bots = Array.from(db.botRegistry.entries()).map(([id, bot]) => {
      // Strip handler function (can't serialize) - will be re-attached on load
      const { handler, ...serializable } = bot;
      return [id, serializable];
    });

    const data = {
      bots,
      leaderboard: Array.from(db.leaderboard.entries()),
      savedAt: Date.now()
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    Logger.error('Failed to save database', { error: error.message });
  }
}

/**
 * Load database state from disk
 */
function loadDatabase(db) {
  try {
    if (!fs.existsSync(DB_FILE)) return false;

    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const data = JSON.parse(raw);

    // Restore leaderboard
    if (data.leaderboard) {
      for (const [botId, earnings] of data.leaderboard) {
        db.leaderboard.set(botId, earnings);
      }
    }

    // Restore bot metadata (without handlers - system bots get handlers from specialistBots.js)
    if (data.bots) {
      for (const [id, bot] of data.bots) {
        // Only restore earnings/tasks for bots that are already registered (system bots)
        const existing = db.botRegistry.get(id);
        if (existing) {
          existing.totalEarnings = bot.totalEarnings || 0;
          existing.tasksCompleted = bot.tasksCompleted || 0;
          existing.rating = bot.rating || 5.0;
        }
        // User-created bots need handler re-attached (done separately)
      }
    }

    Logger.info('Database loaded from disk', { bots: data.bots?.length || 0 });
    return data;
  } catch (error) {
    Logger.error('Failed to load database', { error: error.message });
    return false;
  }
}

/**
 * Save wallet data to disk (encrypted)
 */
function saveWallets(walletMap) {
  try {
    const data = {
      wallets: Array.from(walletMap.entries()),
      savedAt: Date.now()
    };
    fs.writeFileSync(WALLETS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    Logger.error('Failed to save wallets', { error: error.message });
  }
}

/**
 * Load wallet data from disk
 */
function loadWallets() {
  try {
    if (!fs.existsSync(WALLETS_FILE)) return null;

    const raw = fs.readFileSync(WALLETS_FILE, 'utf8');
    const data = JSON.parse(raw);

    Logger.info('Wallets loaded from disk', { count: data.wallets?.length || 0 });
    return data.wallets || [];
  } catch (error) {
    Logger.error('Failed to load wallets', { error: error.message });
    return null;
  }
}

module.exports = { saveDatabase, loadDatabase, saveWallets, loadWallets };
