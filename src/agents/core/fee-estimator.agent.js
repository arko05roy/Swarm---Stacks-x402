/**
 * Gas/Fee Estimator Agent
 * Estimate transaction costs for Stacks and Ethereum
 */

const Agent = require('../../core/Agent');
const fetch = require('node-fetch');
const { STACKS_TESTNET } = require('@stacks/network');

class FeeEstimatorAgent extends Agent {
  constructor(config = {}) {
    const agentConfig = {
      id: config.id || 'fee-estimator-agent',
      name: config.name || 'Gas/Fee Estimator',
      version: '1.0.0',
      description: config.description || 'Estimate transaction costs for Stacks and Ethereum with USD conversion',
      author: 'Swarm Core',
      capabilities: config.capabilities || ['gas', 'fees', 'transaction-cost', 'estimation'],
      pricing: {
        basePrice: 0,
        pricePerCall: config.pricePerCall || 0.002,
        currency: 'STX'
      },
      schema: {
        input: {
          type: 'object',
          properties: {
            chain: { type: 'string', required: false }, // 'stacks' or 'ethereum'
            txType: { type: 'string', required: false } // 'transfer', 'contract-call', 'contract-deploy'
          }
        },
        output: {
          type: 'object',
          properties: {
            chain: { type: 'string' },
            estimatedFee: { type: 'number' },
            estimatedFeeUSD: { type: 'number' },
            recommendation: { type: 'string' },
            timestamp: { type: 'number' }
          }
        }
      }
    };

    super(agentConfig);
    this.executeFunction = this.estimateFee.bind(this);
    this.network = STACKS_TESTNET;
  }

  async estimateFee(input, context) {
    const chain = (input.chain || 'stacks').toLowerCase();
    const txType = (input.txType || 'transfer').toLowerCase();

    switch (chain) {
      case 'stacks':
      case 'stx':
        return await this.estimateStacksFee(txType);
      case 'ethereum':
      case 'eth':
        return await this.estimateEthereumFee(txType);
      default:
        throw new Error(`Unsupported chain: ${chain}. Use 'stacks' or 'ethereum'`);
    }
  }

  async estimateStacksFee(txType) {
    // Fetch current STX price
    const stxPrice = await this.getSTXPrice();

    // Stacks transaction fees (approximate)
    const feeMap = {
      'transfer': 0.0002, // STX transfer
      'contract-call': 0.001, // Contract function call
      'contract-deploy': 0.1, // Contract deployment
      'token-transfer': 0.0002
    };

    const estimatedFee = feeMap[txType] || feeMap['transfer'];
    const estimatedFeeUSD = estimatedFee * stxPrice;

    // Generate recommendation
    const recommendation = this.generateStacksRecommendation(txType, estimatedFee);

    return {
      chain: 'Stacks',
      txType,
      estimatedFee,
      estimatedFeeUSD: parseFloat(estimatedFeeUSD.toFixed(4)),
      unit: 'STX',
      stxPrice,
      network: 'testnet',
      recommendation,
      breakdown: {
        baseFee: estimatedFee,
        priority: 0, // Stacks doesn't have priority fees like Ethereum
        total: estimatedFee
      },
      timestamp: Date.now()
    };
  }

  async estimateEthereumFee(txType) {
    try {
      // Fetch gas prices from Etherscan (free tier)
      const response = await fetch(
        'https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=YourApiKeyToken',
        {
          headers: { 'User-Agent': 'SwarmBot/1.0' },
          timeout: 8000
        }
      );

      if (!response.ok) {
        // Fallback to estimated values if API fails
        return this.getEthereumFallbackEstimate(txType);
      }

      const data = await response.json();
      
      // Use safe gas price (in Gwei)
      const gasPriceGwei = parseFloat(data.result?.SafeGasPrice || 20);
      
      // Fetch ETH price
      const ethPrice = await this.getETHPrice();

      // Gas limits by transaction type
      const gasLimitMap = {
        'transfer': 21000, // Simple ETH transfer
        'contract-call': 100000, // Average contract interaction
        'contract-deploy': 500000, // Contract deployment
        'erc20-transfer': 65000, // ERC20 token transfer
        'swap': 150000 // DEX swap
      };

      const gasLimit = gasLimitMap[txType] || gasLimitMap['transfer'];
      const estimatedFeeETH = (gasPriceGwei * gasLimit) / 1e9;
      const estimatedFeeUSD = estimatedFeeETH * ethPrice;

      const recommendation = this.generateEthereumRecommendation(gasPriceGwei, estimatedFeeUSD);

      return {
        chain: 'Ethereum',
        txType,
        estimatedFee: parseFloat(estimatedFeeETH.toFixed(6)),
        estimatedFeeUSD: parseFloat(estimatedFeeUSD.toFixed(2)),
        unit: 'ETH',
        ethPrice,
        gasPriceGwei: parseFloat(gasPriceGwei.toFixed(2)),
        gasLimit,
        network: 'mainnet',
        recommendation,
        breakdown: {
          gasPrice: `${gasPriceGwei} Gwei`,
          gasLimit,
          total: `${estimatedFeeETH.toFixed(6)} ETH`
        },
        timestamp: Date.now()
      };
    } catch (error) {
      return this.getEthereumFallbackEstimate(txType);
    }
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
      // Fallback price
    }
    return 1.0; // Fallback STX price
  }

  async getETHPrice() {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
        {
          headers: { 'User-Agent': 'SwarmBot/1.0' },
          timeout: 5000
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.ethereum?.usd || 3000;
      }
    } catch (error) {
      // Fallback price
    }
    return 3000; // Fallback ETH price
  }

  getEthereumFallbackEstimate(txType) {
    const gasLimitMap = {
      'transfer': 21000,
      'contract-call': 100000,
      'contract-deploy': 500000,
      'erc20-transfer': 65000,
      'swap': 150000
    };

    const gasLimit = gasLimitMap[txType] || 21000;
    const gasPriceGwei = 20; // Fallback gas price
    const ethPrice = 3000; // Fallback ETH price
    const estimatedFeeETH = (gasPriceGwei * gasLimit) / 1e9;
    const estimatedFeeUSD = estimatedFeeETH * ethPrice;

    return {
      chain: 'Ethereum',
      txType,
      estimatedFee: parseFloat(estimatedFeeETH.toFixed(6)),
      estimatedFeeUSD: parseFloat(estimatedFeeUSD.toFixed(2)),
      unit: 'ETH',
      ethPrice,
      gasPriceGwei,
      gasLimit,
      network: 'mainnet',
      recommendation: 'Using fallback estimates. Gas prices are approximate.',
      note: 'API unavailable, using fallback values',
      timestamp: Date.now()
    };
  }

  generateStacksRecommendation(txType, fee) {
    if (fee < 0.001) {
      return `✅ Low cost! ${txType} on Stacks is very affordable at ${fee} STX. Stacks transaction fees are fixed and predictable.`;
    } else if (fee < 0.01) {
      return `💰 Moderate cost for ${txType}. Stacks offers predictable fees with Bitcoin-level security via L2.`;
    } else {
      return `⚠️ ${txType} requires higher fee (${fee} STX). Consider batching operations if possible.`;
    }
  }

  generateEthereumRecommendation(gasPriceGwei, feeUSD) {
    if (gasPriceGwei < 20) {
      return `✅ Great time to transact! Gas prices are low at ${gasPriceGwei} Gwei.`;
    } else if (gasPriceGwei < 50) {
      return `💰 Moderate gas prices (${gasPriceGwei} Gwei, ~$${feeUSD.toFixed(2)}). Acceptable for time-sensitive transactions.`;
    } else if (gasPriceGwei < 100) {
      return `⚠️ High gas prices (${gasPriceGwei} Gwei, ~$${feeUSD.toFixed(2)}). Consider waiting for lower fees unless urgent.`;
    } else {
      return `🔥 Very high gas prices (${gasPriceGwei} Gwei, ~$${feeUSD.toFixed(2)}). Only proceed if absolutely necessary.`;
    }
  }
}

// Factory function for creating instances
function createFeeEstimatorAgent(config = {}) {
  return new FeeEstimatorAgent(config);
}

module.exports = { FeeEstimatorAgent, createFeeEstimatorAgent };
