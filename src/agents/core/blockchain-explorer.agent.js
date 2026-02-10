/**
 * Blockchain Explorer Agent
 * Query Stacks blockchain for addresses, transactions, and blocks
 */

const Agent = require('../../core/Agent');
const fetch = require('node-fetch');
const { STACKS_TESTNET } = require('@stacks/network');

class BlockchainExplorerAgent extends Agent {
  constructor(config = {}) {
    const agentConfig = {
      id: config.id || 'blockchain-explorer-agent',
      name: config.name || 'Blockchain Explorer',
      version: '1.0.0',
      description: config.description || 'Query Stacks blockchain for address balances, transaction status, and block information',
      author: 'Swarm Core',
      capabilities: config.capabilities || ['blockchain', 'explorer', 'transaction', 'address', 'stacks'],
      pricing: {
        basePrice: 0,
        pricePerCall: config.pricePerCall || 0.002,
        currency: 'STX'
      },
      schema: {
        input: {
          type: 'object',
          properties: {
            query: { type: 'string', required: true },
            type: { type: 'string', required: false } // 'address', 'transaction', 'block'
          }
        },
        output: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            data: { type: 'object' },
            explorerUrl: { type: 'string' },
            timestamp: { type: 'number' }
          }
        }
      }
    };

    super(agentConfig);
    this.executeFunction = this.queryBlockchain.bind(this);
    this.network = STACKS_TESTNET;
    this.apiUrl = this.network.coreApiUrl;
  }

  async queryBlockchain(input, context) {
    const { query, type } = input;

    // Auto-detect query type if not specified
    const queryType = type || this.detectQueryType(query);

    switch (queryType) {
      case 'address':
        return await this.queryAddress(query);
      case 'transaction':
      case 'tx':
        return await this.queryTransaction(query);
      case 'block':
        return await this.queryBlock(query);
      default:
        throw new Error(`Unknown query type: ${queryType}. Use 'address', 'transaction', or 'block'`);
    }
  }

  detectQueryType(query) {
    // Stacks addresses start with 'ST' or 'SP'
    if (query.startsWith('ST') || query.startsWith('SP')) {
      return 'address';
    }
    // Transaction IDs start with '0x' and are 64 chars (hex)
    if (query.startsWith('0x') && query.length === 66) {
      return 'transaction';
    }
    // If numeric, assume block height
    if (/^\d+$/.test(query)) {
      return 'block';
    }
    // Default to transaction for other hex strings
    return 'transaction';
  }

  async queryAddress(address) {
    // Fetch account balance
    const balanceResponse = await fetch(
      `${this.apiUrl}/extended/v1/address/${address}/balances`,
      {
        headers: { 'User-Agent': 'SwarmBot/1.0' },
        timeout: 8000
      }
    );

    if (!balanceResponse.ok) {
      throw new Error(`Failed to fetch address data: ${balanceResponse.status}`);
    }

    const balanceData = await balanceResponse.json();

    // Fetch transaction count
    const txResponse = await fetch(
      `${this.apiUrl}/extended/v1/address/${address}/transactions?limit=1`,
      {
        headers: { 'User-Agent': 'SwarmBot/1.0' },
        timeout: 8000
      }
    );

    const txData = await txResponse.json();
    const txCount = txData.total || 0;

    return {
      type: 'address',
      data: {
        address,
        balance: parseInt(balanceData.stx.balance) / 1000000, // Convert microSTX to STX
        locked: parseInt(balanceData.stx.locked) / 1000000,
        totalSent: parseInt(balanceData.stx.total_sent) / 1000000,
        totalReceived: parseInt(balanceData.stx.total_received) / 1000000,
        totalFeesSent: parseInt(balanceData.stx.total_fees_sent) / 1000000,
        nonce: balanceData.nonce || 0,
        transactionCount: txCount,
        fungibleTokens: Object.keys(balanceData.fungible_tokens || {}).length,
        nonFungibleTokens: Object.keys(balanceData.non_fungible_tokens || {}).length
      },
      explorerUrl: `https://explorer.hiro.so/address/${address}?chain=testnet`,
      network: 'testnet',
      timestamp: Date.now()
    };
  }

  async queryTransaction(txId) {
    // Clean up txId (remove 0x prefix if present for the API call)
    const cleanTxId = txId.startsWith('0x') ? txId.substring(2) : txId;
    
    const response = await fetch(
      `${this.apiUrl}/extended/v1/tx/0x${cleanTxId}`,
      {
        headers: { 'User-Agent': 'SwarmBot/1.0' },
        timeout: 8000
      }
    );

    if (!response.ok) {
      throw new Error(`Transaction not found: ${response.status}`);
    }

    const txData = await response.json();

    return {
      type: 'transaction',
      data: {
        txId: txData.tx_id,
        status: txData.tx_status,
        txType: txData.tx_type,
        blockHeight: txData.block_height || 'pending',
        blockHash: txData.block_hash || null,
        burnBlockTime: txData.burn_block_time || null,
        fee: parseInt(txData.fee_rate || 0) / 1000000,
        sender: txData.sender_address,
        sponsored: txData.sponsored || false,
        nonce: txData.nonce,
        // Additional details based on tx type
        ...(txData.tx_type === 'token_transfer' && {
          amount: parseInt(txData.token_transfer?.amount || 0) / 1000000,
          recipient: txData.token_transfer?.recipient_address,
          memo: txData.token_transfer?.memo || null
        }),
        ...(txData.tx_type === 'contract_call' && {
          contractId: txData.contract_call?.contract_id,
          functionName: txData.contract_call?.function_name
        })
      },
      explorerUrl: `https://explorer.hiro.so/txid/0x${cleanTxId}?chain=testnet`,
      network: 'testnet',
      timestamp: Date.now()
    };
  }

  async queryBlock(blockHeight) {
    const height = parseInt(blockHeight);
    
    const response = await fetch(
      `${this.apiUrl}/extended/v1/block/by_height/${height}`,
      {
        headers: { 'User-Agent': 'SwarmBot/1.0' },
        timeout: 8000
      }
    );

    if (!response.ok) {
      throw new Error(`Block not found: ${response.status}`);
    }

    const blockData = await response.json();

    return {
      type: 'block',
      data: {
        height: blockData.height,
        hash: blockData.hash,
        parentBlockHash: blockData.parent_block_hash,
        burnBlockTime: blockData.burn_block_time,
        burnBlockHash: blockData.burn_block_hash,
        txCount: blockData.txs?.length || 0,
        minerTxId: blockData.miner_txid
      },
      explorerUrl: `https://explorer.hiro.so/block/${blockData.hash}?chain=testnet`,
      network: 'testnet',
      timestamp: Date.now()
    };
  }
}

// Factory function for creating instances
function createBlockchainExplorerAgent(config = {}) {
  return new BlockchainExplorerAgent(config);
}

module.exports = { BlockchainExplorerAgent, createBlockchainExplorerAgent };
