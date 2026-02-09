const {
  makeSTXTokenTransfer,
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  bufferCV,
  uintCV,
  stringAsciiCV,
  standardPrincipalCV
} = require('@stacks/transactions');
const { STACKS_TESTNET } = require('@stacks/network');
const BN = require('bn.js');

class StacksUtils {
  constructor() {
    this.network = STACKS_TESTNET;
    this.senderKey = process.env.STACKS_WALLET_SEED;
  }

  /**
   * Convert STX amount to micro-STX (1 STX = 1,000,000 micro-STX)
   */
  stxToMicroStx(stx) {
    return Math.floor(stx * 1_000_000);
  }

  /**
   * Send STX to escrow contract
   */
  async sendToEscrow(amount, taskId, recipientAddress) {
    const txOptions = {
      contractAddress: process.env.ESCROW_CONTRACT_ADDRESS,
      contractName: process.env.ESCROW_CONTRACT_NAME || 'agent-escrow',
      functionName: 'lock-payment',
      functionArgs: [
        uintCV(this.stxToMicroStx(amount)),
        stringAsciiCV(taskId),
        standardPrincipalCV(recipientAddress)
      ],
      senderKey: this.senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction({ transaction, network: this.network });

    return {
      txId: broadcastResponse.txid,
      taskId,
      amount
    };
  }

  /**
   * Release escrow payment to specialist bot
   */
  async releaseEscrow(taskId) {
    const txOptions = {
      contractAddress: process.env.ESCROW_CONTRACT_ADDRESS,
      contractName: process.env.ESCROW_CONTRACT_NAME || 'agent-escrow',
      functionName: 'release-payment',
      functionArgs: [stringAsciiCV(taskId)],
      senderKey: this.senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction({ transaction, network: this.network });

    return broadcastResponse.txid;
  }

  /**
   * Transfer STX to a wallet address
   */
  async transferToWallet(recipientAddress, amount) {
    const txOptions = {
      recipient: recipientAddress,
      amount: this.stxToMicroStx(amount),
      senderKey: this.senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any
    };

    const transaction = await makeSTXTokenTransfer(txOptions);
    const broadcastResponse = await broadcastTransaction({
      transaction,
      network: this.network
    });

    return {
      txId: broadcastResponse.txid,
      amount,
      recipient: recipientAddress
    };
  }

  /**
   * Check transaction status
   */
  async getTransactionStatus(txId) {
    const url = `${this.network.coreApiUrl}/extended/v1/tx/${txId}`;
    const response = await fetch(url);
    return await response.json();
  }
}

module.exports = StacksUtils;
