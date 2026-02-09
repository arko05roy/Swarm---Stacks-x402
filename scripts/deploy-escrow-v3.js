/**
 * Deploy Escrow v3 - fix missing CONTRACT-OWNER constant
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { makeContractDeploy, broadcastTransaction, AnchorMode, PostConditionMode } = require('@stacks/transactions');
const { STACKS_TESTNET } = require('@stacks/network');

async function getNonce() {
  const addr = process.env.STACKS_ADDRESS;
  const res = await fetch(`https://api.testnet.hiro.so/extended/v1/address/${addr}/nonces`);
  const data = await res.json();
  return data.possible_next_nonce;
}

(async () => {
  const nonce = await getNonce();
  console.log('Nonce:', nonce);

  const contractSource = fs.readFileSync(path.join(__dirname, '../src/contracts/escrow.clar'), 'utf8');
  console.log(`📦 Deploying agent-escrow-v3 (${contractSource.length} bytes)...`);

  const tx = await makeContractDeploy({
    contractName: 'agent-escrow-v3',
    codeBody: contractSource,
    senderKey: process.env.STACKS_WALLET_SEED,
    network: STACKS_TESTNET,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 100000,
    nonce,
    clarityVersion: 2
  });

  const result = await broadcastTransaction({ transaction: tx, network: STACKS_TESTNET });
  if (result.error) {
    console.error('❌ Broadcast error:', result.error, result.reason);
    process.exit(1);
  }

  const txid = result.txid || result;
  console.log(`📡 TX: ${txid}`);
  console.log(`🔍 https://explorer.hiro.so/txid/${txid}?chain=testnet`);

  // Wait for confirmation
  console.log('⏳ Waiting 15s for confirmation...');
  await new Promise(r => setTimeout(r, 15000));

  const res = await fetch(`https://api.testnet.hiro.so/extended/v1/tx/${txid}`);
  const data = await res.json();
  console.log(`${data.tx_status === 'success' ? '✅' : '❌'} Status: ${data.tx_status}`);
  if (data.smart_contract) console.log(`   Contract: ${data.smart_contract.contract_id}`);
  if (data.tx_result) console.log(`   Result: ${JSON.stringify(data.tx_result)}`);

  console.log('\n📄 Update .env:');
  console.log(`ESCROW_CONTRACT_NAME=agent-escrow-v3`);
  console.log(`ESCROW_DEPLOY_TXID=${txid}`);
})();
