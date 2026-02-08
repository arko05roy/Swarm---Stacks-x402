const { saveDatabase, loadDatabase } = require('./persistence');

class Database {
  constructor() {
    this.botRegistry = new Map(); // botId -> bot config
    this.taskHistory = new Map(); // taskId -> task data
    this.leaderboard = new Map(); // botId -> earnings
    this.escrowTasks = new Map(); // taskId -> escrow status
    this._saveTimer = null;
  }

  /**
   * Schedule a debounced save (prevents writing on every single change)
   */
  _scheduleSave() {
    if (this._saveTimer) clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => {
      saveDatabase(this);
    }, 2000); // Save 2s after last change
  }

  // Bot Registry
  registerBot(botId, config) {
    this.botRegistry.set(botId, {
      ...config,
      registeredAt: Date.now(),
      totalEarnings: config.totalEarnings || 0,
      tasksCompleted: config.tasksCompleted || 0,
      rating: config.rating || 5.0
    });
    this._scheduleSave();
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
    this._scheduleSave();
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

  /**
   * Load persisted state (call after system bots are registered)
   */
  loadFromDisk() {
    return loadDatabase(this);
  }

  /**
   * Force save now
   */
  saveNow() {
    if (this._saveTimer) clearTimeout(this._saveTimer);
    saveDatabase(this);
  }
}

// Singleton instance
const db = new Database();
module.exports = db;
