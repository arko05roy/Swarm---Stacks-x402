/**
 * LiquidityPool.js - Node.js integration for Clarity liquidity pool contract
 *
 * Provides JavaScript interface for:
 * - Depositing/withdrawing liquidity
 * - Borrowing/repaying loans
 * - Pool analytics
 * - Integration with composite agents
 */

const {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  stringAsciiCV,
  standardPrincipalCV
} = require('@stacks/transactions');
const { STACKS_TESTNET } = require('@stacks/network');

class LiquidityPool {
  constructor(config = {}) {
    this.contractAddress = config.contractAddress || process.env.LIQUIDITY_POOL_CONTRACT || process.env.STACKS_ADDRESS;
    this.contractName = config.contractName || process.env.LIQUIDITY_POOL_NAME || 'agent-liquidity-pool';
    this.network = STACKS_TESTNET;
    this.senderKey = process.env.STACKS_WALLET_SEED;

    // Cache for pool stats
    this.statsCache = {
      data: null,
      timestamp: 0,
      ttl: 5000 // 5 seconds
    };
  }

  /**
   * Deposit STX to liquidity pool
   * @param {string} userId - User ID
   * @param {number} amount - Amount in STX (will be converted to microSTX)
   * @returns {Promise<Object>} - Transaction result
   */
  async deposit(userId, amount) {
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }

    const amountMicroSTX = Math.floor(amount * 1000000);

    try {
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'deposit',
        functionArgs: [uintCV(amountMicroSTX)],
        senderKey: this.senderKey,
        validateWithAbi: false,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow
      };

      const transaction = await makeContractCall(txOptions);
      const result = await broadcastTransaction({ transaction, network: this.network });

      console.log(`💰 Deposited ${amount} STX to pool | TX: ${result.txid}`);

      return {
        success: true,
        txid: result.txid,
        amount,
        userId
      };

    } catch (error) {
      console.error('Deposit error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Withdraw STX from liquidity pool
   * @param {string} userId - User ID
   * @param {number} amount - Amount in STX
   * @returns {Promise<Object>} - Transaction result
   */
  async withdraw(userId, amount) {
    if (amount <= 0) {
      throw new Error('Withdraw amount must be positive');
    }

    const amountMicroSTX = Math.floor(amount * 1000000);

    try {
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'withdraw',
        functionArgs: [uintCV(amountMicroSTX)],
        senderKey: this.senderKey,
        validateWithAbi: false,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow
      };

      const transaction = await makeContractCall(txOptions);
      const result = await broadcastTransaction({ transaction, network: this.network });

      console.log(`💸 Withdrew ${amount} STX from pool | TX: ${result.txid}`);

      return {
        success: true,
        txid: result.txid,
        amount,
        userId
      };

    } catch (error) {
      console.error('Withdraw error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Borrow from pool (for agents)
   * @param {string} agentId - Agent ID
   * @param {number} amount - Amount in STX
   * @param {number} reputation - Agent reputation (0-100)
   * @param {string} purpose - Purpose of loan
   * @returns {Promise<Object>} - Loan result
   */
  async borrow(agentId, amount, reputation, purpose = 'Agent task execution') {
    if (amount <= 0) {
      throw new Error('Borrow amount must be positive');
    }

    if (reputation < 50) {
      throw new Error('Reputation too low to borrow (minimum: 50)');
    }

    const amountMicroSTX = Math.floor(amount * 1000000);

    try {
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'borrow',
        functionArgs: [
          uintCV(amountMicroSTX),
          uintCV(reputation),
          stringAsciiCV(purpose.substring(0, 100))
        ],
        senderKey: this.senderKey,
        validateWithAbi: false,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow
      };

      const transaction = await makeContractCall(txOptions);
      const result = await broadcastTransaction({ transaction, network: this.network });

      console.log(`🏦 Agent borrowed ${amount} STX | TX: ${result.txid}`);

      return {
        success: true,
        txid: result.txid,
        loanId: result.txid, // Use txid as loan ID for now
        amount,
        agentId,
        reputation
      };

    } catch (error) {
      console.error('Borrow error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Repay loan with profit sharing
   * @param {string} agentId - Agent ID
   * @param {string} loanId - Loan ID
   * @param {number} amount - Original loan amount
   * @param {number} profit - Profit earned
   * @returns {Promise<Object>} - Repayment result
   */
  async repay(agentId, loanId, amount, profit) {
    if (amount <= 0 || profit < 0) {
      throw new Error('Invalid repayment amounts');
    }

    const profitMicroSTX = Math.floor(profit * 1000000);

    try {
      const loanIdNum = parseInt(loanId, 10) || 1;

      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'repay',
        functionArgs: [
          uintCV(loanIdNum),
          uintCV(profitMicroSTX)
        ],
        senderKey: this.senderKey,
        validateWithAbi: false,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow
      };

      const transaction = await makeContractCall(txOptions);
      const result = await broadcastTransaction({ transaction, network: this.network });

      const profitShare = profit * 0.1; // 10% profit share
      console.log(`✅ Loan repaid + ${profitShare} STX profit share | TX: ${result.txid}`);

      return {
        success: true,
        txid: result.txid,
        loanId,
        amount,
        profit,
        profitShare
      };

    } catch (error) {
      console.error('Repay error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Claim LP earnings
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Claim result
   */
  async claimEarnings(userId) {
    try {
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'claim-earnings',
        functionArgs: [],
        senderKey: this.senderKey,
        validateWithAbi: false,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow
      };

      const transaction = await makeContractCall(txOptions);
      const result = await broadcastTransaction({ transaction, network: this.network });

      console.log(`💸 LP earnings claimed | TX: ${result.txid}`);

      return {
        success: true,
        txid: result.txid,
        userId,
        amount: 0 // Will be parsed from contract response in production
      };

    } catch (error) {
      console.error('Claim earnings error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get pool statistics
   * @returns {Promise<Object>} - Pool stats
   */
  async getPoolStats() {
    // Return cached data if still valid
    if (this.statsCache.data && Date.now() - this.statsCache.timestamp < this.statsCache.ttl) {
      return this.statsCache.data;
    }

    try {
      // In production, these would be actual contract calls
      // For now, return simulated data based on usage
      const stats = {
        totalLiquidity: 245.5, // STX
        totalBorrowed: 191.5, // STX
        utilization: 78, // percent
        activeLoanCount: 47,
        totalLoans: 1247,
        successfulRepayments: 1189,
        defaults: 12,
        defaultRate: 0.9, // percent
        totalProfitEarned: 12.5, // STX
        apy: 18.5, // percent
        avgLoanSize: 0.04, // STX
        avgRepayTime: 2.3 // minutes
      };

      // Cache the results
      this.statsCache.data = stats;
      this.statsCache.timestamp = Date.now();

      return stats;

    } catch (error) {
      console.error('Error getting pool stats:', error);
      return null;
    }
  }

  /**
   * Get user's LP position
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - LP stats
   */
  async getUserStats(userId) {
    try {
      // In production, this would query the contract
      // For now, return simulated data
      const stats = {
        deposited: 10.0, // STX
        earned: 0.234, // STX
        share: 4.1, // percent of pool
        apy: 18.5, // percent
        daysInPool: 12
      };

      return stats;

    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }

  /**
   * Get agent reputation
   * @param {string} agentId - Agent ID
   * @returns {Promise<Object>} - Reputation data
   */
  async getAgentReputation(agentId) {
    try {
      // In production, this would query the contract
      return {
        score: 98,
        totalLoans: 234,
        successfulRepayments: 229,
        defaults: 0,
        successRate: 97.9
      };

    } catch (error) {
      console.error('Error getting reputation:', error);
      return {
        score: 100,
        totalLoans: 0,
        successfulRepayments: 0,
        defaults: 0,
        successRate: 100
      };
    }
  }

  /**
   * Check if agent can borrow
   * @param {string} agentId - Agent ID
   * @param {number} amount - Amount to borrow
   * @returns {Promise<boolean>}
   */
  async canBorrow(agentId, amount) {
    try {
      const stats = await this.getPoolStats();
      const reputation = await this.getAgentReputation(agentId);

      // Check available liquidity
      const available = stats.totalLiquidity - stats.totalBorrowed;
      if (amount > available) {
        return false;
      }

      // Check reputation
      if (reputation.score < 50) {
        return false;
      }

      return true;

    } catch (error) {
      console.error('Error checking borrow eligibility:', error);
      return false;
    }
  }

  /**
   * Get top borrowers
   * @param {number} limit - Number of borrowers to return
   * @returns {Promise<Array>}
   */
  async getTopBorrowers(limit = 10) {
    // In production, query from contract
    return [
      { name: 'Crypto News Digest', loans: 234, successRate: 99 },
      { name: 'Weather + Translation', loans: 189, successRate: 98 },
      { name: 'Price Analysis Pro', loans: 156, successRate: 97 }
    ].slice(0, limit);
  }

  /**
   * Format pool stats for display
   */
  formatStats(stats) {
    return {
      ...stats,
      totalLiquidityFormatted: `${stats.totalLiquidity.toFixed(2)} STX`,
      totalBorrowedFormatted: `${stats.totalBorrowed.toFixed(2)} STX`,
      utilizationFormatted: `${stats.utilization}%`,
      apyFormatted: `${stats.apy.toFixed(1)}%`,
      totalProfitFormatted: `${stats.totalProfitEarned.toFixed(3)} STX`
    };
  }
}

// Singleton instance
const liquidityPool = new LiquidityPool();

module.exports = { LiquidityPool, liquidityPool };
