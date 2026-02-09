/**
 * BotInvestment.js - Bot investment tracking and revenue sharing
 *
 * Users can invest STX in specific bots and earn proportional share of bot earnings
 */

const { registry } = require('../core/AgentRegistry');
const StacksUtils = require('../utils/stacksUtils');
const WalletService = require('../services/walletService');
const Logger = require('../utils/logger');

class BotInvestment {
  constructor() {
    // Track investments: botId -> { investorId -> amount }
    this.investments = new Map();

    // Initialize services
    this.stacksUtils = new StacksUtils();
    this.walletService = new WalletService();

    // Track investor portfolios: investorId -> Set of botIds
    this.investorBots = new Map();

    // Track total invested per bot: botId -> totalAmount
    this.botTotalInvested = new Map();

    // Track earnings history for ROI calculation
    this.earningsHistory = new Map(); // botId -> [{timestamp, amount, investorId}]
  }

  /**
   * Invest in a bot
   * @param {string} investorId - Investor user ID
   * @param {string} botId - Bot ID to invest in
   * @param {number} amount - Amount in STX
   * @returns {Object} - Investment result
   */
  invest(investorId, botId, amount) {
    if (amount <= 0) {
      throw new Error('Investment amount must be positive');
    }

    // Verify bot exists
    const bot = registry.get(botId);
    if (!bot) {
      throw new Error(`Bot ${botId} not found`);
    }

    // Initialize investment map for this bot if needed
    if (!this.investments.has(botId)) {
      this.investments.set(botId, new Map());
    }

    const botInvestors = this.investments.get(botId);

    // Add or update investment
    const currentAmount = botInvestors.get(investorId) || 0;
    botInvestors.set(investorId, currentAmount + amount);

    // Update total invested in bot
    const currentTotal = this.botTotalInvested.get(botId) || 0;
    this.botTotalInvested.set(botId, currentTotal + amount);

    // Track investor's portfolio
    if (!this.investorBots.has(investorId)) {
      this.investorBots.set(investorId, new Set());
    }
    this.investorBots.get(investorId).add(botId);

    console.log(`💰 ${investorId} invested ${amount} STX in ${bot.manifest.name}`);

    return {
      success: true,
      botId,
      botName: bot.manifest.name,
      amount,
      totalInvested: botInvestors.get(investorId),
      ownership: this.calculateOwnership(investorId, botId)
    };
  }

  /**
   * Withdraw investment from a bot
   * @param {string} investorId - Investor user ID
   * @param {string} botId - Bot ID to withdraw from
   * @param {number} amount - Amount in STX to withdraw
   * @returns {Object} - Withdrawal result
   */
  async withdraw(investorId, botId, amount) {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }

    // Verify bot exists
    const bot = registry.get(botId);
    if (!bot) {
      throw new Error(`Bot ${botId} not found`);
    }

    // Check if investor has position
    const botInvestors = this.investments.get(botId);
    if (!botInvestors || !botInvestors.has(investorId)) {
      throw new Error('No investment found in this bot');
    }

    const currentInvestment = botInvestors.get(investorId);
    const earnedAmount = this.calculateInvestorEarnings(investorId, botId);
    const totalValue = currentInvestment + earnedAmount;

    // Check if withdrawal amount is valid
    if (amount > totalValue) {
      throw new Error(
        `Insufficient balance. Available: ${totalValue.toFixed(4)} STX (${currentInvestment.toFixed(4)} invested + ${earnedAmount.toFixed(4)} earned)`
      );
    }

    // Calculate how much to deduct from principal vs earnings
    let remainingWithdrawal = amount;
    let withdrawnEarnings = 0;
    let withdrawnPrincipal = 0;

    // First withdraw from earnings
    if (earnedAmount > 0) {
      withdrawnEarnings = Math.min(remainingWithdrawal, earnedAmount);
      remainingWithdrawal -= withdrawnEarnings;

      // Clear earnings history proportionally
      const earningsHistory = this.earningsHistory.get(botId) || [];
      const proportionKept = (earnedAmount - withdrawnEarnings) / earnedAmount;

      this.earningsHistory.set(
        botId,
        earningsHistory.map(h => {
          if (h.investorId === investorId) {
            return { ...h, amount: h.amount * proportionKept };
          }
          return h;
        }).filter(h => h.amount > 0.0001) // Remove dust
      );
    }

    // Then withdraw from principal if needed
    if (remainingWithdrawal > 0) {
      withdrawnPrincipal = remainingWithdrawal;
    }

    // Update investment records
    const newInvestment = currentInvestment - withdrawnPrincipal;

    if (newInvestment < 0.001) {
      // Complete withdrawal - remove investor
      botInvestors.delete(investorId);

      // Remove from investor's portfolio
      const investorPortfolio = this.investorBots.get(investorId);
      if (investorPortfolio) {
        investorPortfolio.delete(botId);
        if (investorPortfolio.size === 0) {
          this.investorBots.delete(investorId);
        }
      }
    } else {
      // Partial withdrawal
      botInvestors.set(investorId, newInvestment);
    }

    // Update total invested
    const currentTotal = this.botTotalInvested.get(botId) || 0;
    this.botTotalInvested.set(botId, currentTotal - withdrawnPrincipal);

    // Transfer STX to investor's wallet on blockchain
    let txId = null;
    try {
      const investorWallet = this.walletService.getWallet(investorId);
      if (!investorWallet) {
        throw new Error('Investor wallet not found');
      }

      const transferResult = await this.stacksUtils.transferToWallet(
        investorWallet.address,
        amount
      );
      txId = transferResult.txId;

      Logger.success('Investment withdrawal transferred', {
        investorId,
        botId,
        amount,
        txId
      });
    } catch (error) {
      Logger.error('Withdrawal blockchain transfer failed', {
        investorId,
        botId,
        amount,
        error: error.message
      });
      // Rollback in-memory changes
      botInvestors.set(investorId, currentInvestment);
      this.botTotalInvested.set(botId, currentTotal);
      throw new Error(`Blockchain transfer failed: ${error.message}`);
    }

    console.log(`💸 ${investorId} withdrew ${amount} STX from ${bot.manifest.name} (${withdrawnPrincipal.toFixed(4)} principal + ${withdrawnEarnings.toFixed(4)} earnings)`);

    return {
      success: true,
      botId,
      botName: bot.manifest.name,
      totalWithdrawn: amount,
      principalWithdrawn: withdrawnPrincipal,
      earningsWithdrawn: withdrawnEarnings,
      remainingInvestment: newInvestment,
      remainingOwnership: this.calculateOwnership(investorId, botId),
      txId
    };
  }

  /**
   * Withdraw all investment from a bot (principal + earnings)
   * @param {string} investorId - Investor user ID
   * @param {string} botId - Bot ID to withdraw from
   * @returns {Object} - Withdrawal result
   */
  async withdrawAll(investorId, botId) {
    const currentInvestment = this.getInvestment(investorId, botId);
    const earnedAmount = this.calculateInvestorEarnings(investorId, botId);
    const totalAmount = currentInvestment + earnedAmount;

    if (totalAmount === 0) {
      throw new Error('No investment to withdraw');
    }

    return await this.withdraw(investorId, botId, totalAmount);
  }

  /**
   * Calculate investor's ownership percentage in a bot
   * @param {string} investorId - Investor user ID
   * @param {string} botId - Bot ID
   * @returns {number} - Ownership percentage (0-100)
   */
  calculateOwnership(investorId, botId) {
    const botInvestors = this.investments.get(botId);
    if (!botInvestors) return 0;

    const investorAmount = botInvestors.get(investorId) || 0;
    const totalInvested = this.botTotalInvested.get(botId) || 0;

    if (totalInvested === 0) return 0;

    return (investorAmount / totalInvested) * 100;
  }

  /**
   * Distribute bot earnings to investors
   * @param {string} botId - Bot ID
   * @param {number} earnings - Amount earned by bot
   * @returns {Object} - Distribution result
   */
  distributeEarnings(botId, earnings) {
    const botInvestors = this.investments.get(botId);

    // If no investors, earnings go to bot creator (handled elsewhere)
    if (!botInvestors || botInvestors.size === 0) {
      return {
        distributed: false,
        reason: 'No investors'
      };
    }

    const totalInvested = this.botTotalInvested.get(botId) || 0;
    if (totalInvested === 0) {
      return {
        distributed: false,
        reason: 'No total investment'
      };
    }

    const distributions = [];

    // Calculate each investor's share
    for (const [investorId, investedAmount] of botInvestors.entries()) {
      const share = (investedAmount / totalInvested) * earnings;

      distributions.push({
        investorId,
        share,
        percentage: (investedAmount / totalInvested) * 100
      });

      // Record earnings history
      if (!this.earningsHistory.has(botId)) {
        this.earningsHistory.set(botId, []);
      }
      this.earningsHistory.get(botId).push({
        timestamp: Date.now(),
        amount: share,
        investorId
      });
    }

    console.log(`💸 Distributed ${earnings} STX among ${distributions.length} investors`);

    return {
      distributed: true,
      totalEarnings: earnings,
      distributions
    };
  }

  /**
   * Get investor's portfolio
   * @param {string} investorId - Investor user ID
   * @returns {Array} - Array of investments with stats
   */
  getInvestorPortfolio(investorId) {
    const botIds = this.investorBots.get(investorId);

    if (!botIds || botIds.size === 0) {
      return [];
    }

    const portfolio = [];

    for (const botId of botIds) {
      const bot = registry.get(botId);
      if (!bot) continue;

      const invested = this.getInvestment(investorId, botId);
      const earned = this.calculateInvestorEarnings(investorId, botId);
      const ownership = this.calculateOwnership(investorId, botId);
      const roi = invested > 0 ? ((earned / invested) * 100) : 0;

      portfolio.push({
        botId,
        botName: bot.manifest.name,
        invested,
        earned,
        currentValue: invested + earned,
        roi,
        ownership,
        botTotalEarnings: bot.manifest.metadata.totalEarnings,
        botCalls: bot.manifest.metadata.calls,
        avgEarningPerCall: bot.manifest.metadata.calls > 0
          ? bot.manifest.metadata.totalEarnings / bot.manifest.metadata.calls
          : 0
      });
    }

    // Sort by ROI (best performing first)
    portfolio.sort((a, b) => b.roi - a.roi);

    return portfolio;
  }

  /**
   * Get investment amount
   * @param {string} investorId - Investor user ID
   * @param {string} botId - Bot ID
   * @returns {number} - Investment amount
   */
  getInvestment(investorId, botId) {
    const botInvestors = this.investments.get(botId);
    if (!botInvestors) return 0;
    return botInvestors.get(investorId) || 0;
  }

  /**
   * Calculate total earnings for an investor in a bot
   * @param {string} investorId - Investor user ID
   * @param {string} botId - Bot ID
   * @returns {number} - Total earnings
   */
  calculateInvestorEarnings(investorId, botId) {
    const history = this.earningsHistory.get(botId);
    if (!history) return 0;

    return history
      .filter(h => h.investorId === investorId)
      .reduce((sum, h) => sum + h.amount, 0);
  }

  /**
   * Get bot investor stats
   * @param {string} botId - Bot ID
   * @returns {Object} - Bot investment stats
   */
  getBotStats(botId) {
    const bot = registry.get(botId);
    if (!bot) {
      throw new Error(`Bot ${botId} not found`);
    }

    const botInvestors = this.investments.get(botId);
    const investorCount = botInvestors ? botInvestors.size : 0;
    const totalInvested = this.botTotalInvested.get(botId) || 0;
    const totalEarnings = bot.manifest.metadata.totalEarnings;

    // Calculate projected APY based on recent performance
    const recentEarnings = this.getRecentEarnings(botId, 24 * 60 * 60 * 1000); // 24h
    const dailyReturn = totalInvested > 0 ? (recentEarnings / totalInvested) : 0;
    const projectedAPY = dailyReturn * 365 * 100;

    // Get top investors
    const investors = [];
    if (botInvestors) {
      for (const [investorId, amount] of botInvestors.entries()) {
        investors.push({
          investorId,
          invested: amount,
          ownership: this.calculateOwnership(investorId, botId),
          earned: this.calculateInvestorEarnings(investorId, botId)
        });
      }
      investors.sort((a, b) => b.invested - a.invested);
    }

    return {
      botId,
      botName: bot.manifest.name,
      investorCount,
      totalInvested,
      totalEarnings,
      calls: bot.manifest.metadata.calls,
      avgEarningPerCall: bot.manifest.metadata.calls > 0
        ? totalEarnings / bot.manifest.metadata.calls
        : 0,
      projectedAPY,
      topInvestors: investors.slice(0, 5)
    };
  }

  /**
   * Get recent earnings for APY calculation
   * @param {string} botId - Bot ID
   * @param {number} timeWindow - Time window in ms
   * @returns {number} - Recent earnings
   */
  getRecentEarnings(botId, timeWindow) {
    const history = this.earningsHistory.get(botId);
    if (!history) return 0;

    const now = Date.now();
    return history
      .filter(h => now - h.timestamp < timeWindow)
      .reduce((sum, h) => sum + h.amount, 0);
  }

  /**
   * Get top investment opportunities (bots with best projected returns)
   * @param {number} limit - Number of bots to return
   * @returns {Array} - Top investment opportunities
   */
  getTopOpportunities(limit = 10) {
    const allBots = registry.list({ activeOnly: true });

    const opportunities = allBots.map(manifest => {
      const botId = manifest.id;
      const totalInvested = this.botTotalInvested.get(botId) || 0.001; // Prevent division by zero
      const totalEarnings = manifest.metadata.totalEarnings;

      // Calculate metrics
      const roi = totalInvested > 0 ? (totalEarnings / totalInvested) * 100 : 0;
      const recentEarnings = this.getRecentEarnings(botId, 24 * 60 * 60 * 1000);
      const dailyReturn = totalInvested > 0 ? (recentEarnings / totalInvested) : 0;
      const projectedAPY = dailyReturn * 365 * 100;

      return {
        botId,
        botName: manifest.name,
        totalInvested,
        totalEarnings,
        calls: manifest.metadata.calls,
        roi,
        projectedAPY,
        investorCount: this.investments.get(botId)?.size || 0
      };
    });

    // Sort by projected APY
    opportunities.sort((a, b) => b.projectedAPY - a.projectedAPY);

    return opportunities.slice(0, limit);
  }

  /**
   * Format portfolio for Telegram display
   */
  formatPortfolio(portfolio) {
    if (portfolio.length === 0) {
      return `💼 <b>Your Investment Portfolio</b>\n\nYou haven't invested in any bots yet.\n\nUse /bots to see investment opportunities!`;
    }

    let msg = `💼 <b>Your Investment Portfolio</b>\n\n`;

    let totalInvested = 0;
    let totalEarned = 0;

    portfolio.forEach((inv, i) => {
      const roiIcon = inv.roi > 0 ? '📈' : inv.roi < 0 ? '📉' : '➡️';
      const totalValue = inv.invested + inv.earned;

      msg += `<b>${i + 1}. ${inv.botName}</b>\n`;
      msg += `   💰 Invested: ${inv.invested.toFixed(4)} STX\n`;
      msg += `   💸 Earned: ${inv.earned.toFixed(4)} STX\n`;
      msg += `   💎 Total Value: ${totalValue.toFixed(4)} STX\n`;
      msg += `   📊 ROI: ${roiIcon} ${inv.roi.toFixed(2)}%\n`;
      msg += `   🎯 Ownership: ${inv.ownership.toFixed(2)}%\n`;
      msg += `   📞 Bot calls: ${inv.botCalls}\n`;
      msg += `   <code>/withdraw_all ${inv.botId}</code> - Withdraw all\n\n`;

      totalInvested += inv.invested;
      totalEarned += inv.earned;
    });

    const totalROI = totalInvested > 0 ? ((totalEarned / totalInvested) * 100) : 0;
    const totalValue = totalInvested + totalEarned;

    msg += `<b>Portfolio Summary:</b>\n`;
    msg += `Total Invested: ${totalInvested.toFixed(4)} STX\n`;
    msg += `Total Earned: ${totalEarned.toFixed(4)} STX\n`;
    msg += `Total Value: ${totalValue.toFixed(4)} STX\n`;
    msg += `Total ROI: ${totalROI.toFixed(2)}%\n\n`;

    msg += `<b>Withdrawal Commands:</b>\n`;
    msg += `/withdraw_investment [botId] [amount] - Partial withdrawal\n`;
    msg += `/withdraw_all [botId] - Withdraw everything`;

    return msg;
  }

  /**
   * Format bot stats for Telegram display
   */
  formatBotStats(stats) {
    return `📊 <b>${stats.botName} Investment Stats</b>

💰 <b>Investment Metrics:</b>
Total Invested: ${stats.totalInvested.toFixed(4)} STX
Investors: ${stats.investorCount}
Total Earnings: ${stats.totalEarnings.toFixed(4)} STX

📈 <b>Performance:</b>
Calls: ${stats.calls}
Avg per Call: ${stats.avgEarningPerCall.toFixed(4)} STX
Projected APY: ${stats.projectedAPY.toFixed(1)}%

${stats.topInvestors.length > 0 ? `👥 <b>Top Investors:</b>\n${stats.topInvestors.map((inv, i) =>
  `${i + 1}. ${inv.ownership.toFixed(1)}% (${inv.invested.toFixed(4)} STX)`
).join('\n')}` : ''}

<b>Commands:</b>
/invest ${stats.botId} [amount] - Invest in this bot`;
  }
}

// Singleton instance
const botInvestment = new BotInvestment();

module.exports = { BotInvestment, botInvestment };
