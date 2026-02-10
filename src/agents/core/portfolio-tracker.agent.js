/**
 * Wallet Portfolio Tracker Agent
 * Track Stacks wallet holdings and calculate portfolio value
 */

const Agent = require('../../core/Agent');
const fetch = require('node-fetch');
const { STACKS_TESTNET } = require('@stacks/network');

class PortfolioTrackerAgent extends Agent {
  constructor(config = {}) {
    const agentConfig = {
      id: config.id || 'portfolio-tracker-agent',
      name: config.name || 'Wallet Portfolio Tracker',
      version: '1.0.0',
      description: config.description || 'Track Stacks wallet holdings, transaction history, and portfolio value in USD',
      author: 'Swarm Core',
      capabilities: config.capabilities || ['portfolio', 'wallet', 'tracking', 'analytics', 'stacks'],
      pricing: {
        basePrice: 0,
        pricePerCall: config.pricePerCall || 0.003,
        currency: 'STX'
      },
      schema: {
        input: {
          type: 'object',
          properties: {
            address: { type: 'string', required: true }
          }
        },
        output: {
          type: 'object',
          properties: {
            address: { type: 'string' },
            stxBalance: { type: 'number' },
            stxBalanceUSD: { type: 'number' },
            totalValueUSD: { type: 'number' },
            transactionCount: { type: 'number' },
            lastActivity: { type: 'string' },
            timestamp: { type: 'number' }
          }
        }
      }
    };

    super(agentConfig);
    this.executeFunction = this.trackPortfolio.bind(this);
    this.network = STACKS_TESTNET;
    this.apiUrl = this.network.coreApiUrl;
  }

  async trackPortfolio(input, context) {
    const { address } = input;

    // Validate address format
    if (!address.startsWith('ST') && !address.startsWith('SP')) {
      throw new Error('Invalid Stacks address. Must start with ST (testnet) or SP (mainnet)');
    }

    // Fetch balance data
    const balanceData = await this.fetchBalanceData(address);
    
    // Fetch transaction data
    const txData = await this.fetchTransactionData(address);
    
    // Fetch STX price for USD calculations
    const stxPrice = await this.getSTXPrice();

    // Calculate portfolio metrics
    const stxBalance = balanceData.balance;
    const stxLocked = balanceData.locked;
    const totalSTX = stxBalance + stxLocked;
    const stxBalanceUSD = totalSTX * stxPrice;

    // Count fungible and non-fungible tokens
    const ftCount = balanceData.fungibleTokenCount;
    const nftCount = balanceData.nonFungibleTokenCount;

    // Get last transaction timestamp
    const lastActivity = txData.lastTxTime ? 
      new Date(txData.lastTxTime * 1000).toISOString() : 
      'No activity';

    // Calculate P&L metrics
    const totalReceived = balanceData.totalReceived;
    const totalSent = balanceData.totalSent;
    const netFlow = totalReceived - totalSent;
    const netFlowUSD = netFlow * stxPrice;

    return {
      address,
      network: address.startsWith('ST') ? 'testnet' : 'mainnet',
      
      // Balance Info
      stxBalance,
      stxLocked,
      totalSTX,
      stxBalanceUSD: parseFloat(stxBalanceUSD.toFixed(2)),
      
      // Token Holdings
      fungibleTokens: ftCount,
      nonFungibleTokens: nftCount,
      totalValueUSD: parseFloat(stxBalanceUSD.toFixed(2)), // Could be expanded with token prices
      
      // Transaction Activity
      transactionCount: txData.txCount,
      lastActivity,
      
      // Flow Metrics
      totalReceived,
      totalSent,
      totalFeesPaid: balanceData.totalFeesSent,
      netFlow,
      netFlowUSD: parseFloat(netFlowUSD.toFixed(2)),
      
      // Current Prices
      stxPrice,
      
      // Summary
      summary: this.generateSummary(totalSTX, stxBalanceUSD, txData.txCount, netFlow),
      
      explorerUrl: `https://explorer.hiro.so/address/${address}?chain=${address.startsWith('ST') ? 'testnet' : 'mainnet'}`,
      timestamp: Date.now()
    };
  }

  async fetchBalanceData(address) {
    const response = await fetch(
      `${this.apiUrl}/extended/v1/address/${address}/balances`,
      {
        headers: { 'User-Agent': 'SwarmBot/1.0' },
        timeout: 8000
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch balance data: ${response.status}`);
    }

    const data = await response.json();

    return {
      balance: parseInt(data.stx.balance) / 1000000,
      locked: parseInt(data.stx.locked) / 1000000,
      totalReceived: parseInt(data.stx.total_received) / 1000000,
      totalSent: parseInt(data.stx.total_sent) / 1000000,
      totalFeesSent: parseInt(data.stx.total_fees_sent) / 1000000,
      fungibleTokenCount: Object.keys(data.fungible_tokens || {}).length,
      nonFungibleTokenCount: Object.keys(data.non_fungible_tokens || {}).length,
      nonce: data.nonce || 0
    };
  }

  async fetchTransactionData(address) {
    const response = await fetch(
      `${this.apiUrl}/extended/v1/address/${address}/transactions?limit=1`,
      {
        headers: { 'User-Agent': 'SwarmBot/1.0' },
        timeout: 8000
      }
    );

    if (!response.ok) {
      return { txCount: 0, lastTxTime: null };
    }

    const data = await response.json();
    const lastTx = data.results?.[0];

    return {
      txCount: data.total || 0,
      lastTxTime: lastTx?.burn_block_time || null,
      lastTxId: lastTx?.tx_id || null
    };
  }

  async getSTXPrice() {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=blockstack&vs_currencies=usd',
        {
          headers: { 'User-Agent': 'SwarmBot/1.0' },
          timeout: 5000
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.blockstack?.usd || 1.0;
      }
    } catch (error) {
      // Fallback to default price
    }
    return 1.0; // Fallback STX price
  }

  generateSummary(totalSTX, valueUSD, txCount, netFlow) {
    let summary = `Portfolio holds ${totalSTX.toFixed(2)} STX (~$${valueUSD.toFixed(2)}) `;
    summary += `with ${txCount} transactions. `;
    
    if (netFlow > 0) {
      summary += `Net inflow of ${netFlow.toFixed(2)} STX. `;
    } else if (netFlow < 0) {
      summary += `Net outflow of ${Math.abs(netFlow).toFixed(2)} STX. `;
    } else {
      summary += `Net neutral flow. `;
    }

    if (totalSTX < 1) {
      summary += `⚠️ Low balance - consider adding funds.`;
    } else if (totalSTX < 10) {
      summary += `💰 Moderate balance.`;
    } else {
      summary += `✅ Healthy balance.`;
    }

    return summary;
  }
}

// Factory function for creating instances
function createPortfolioTrackerAgent(config = {}) {
  return new PortfolioTrackerAgent(config);
}

module.exports = { PortfolioTrackerAgent, createPortfolioTrackerAgent };
