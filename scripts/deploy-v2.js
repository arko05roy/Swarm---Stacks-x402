/**
 * Deploy Updated Contracts v2 to Stacks Testnet
 * Fixes: escrow authorization, LP claim-earnings, LP default handling
 * IMPORTANT: Must use clarityVersion: 2 for stx-transfer? to work
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const {
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode
} = require('@stacks/transactions');
const { STACKS_TESTNET } = require('@stacks/network');

async function getNonce() {
  const addr = process.env.STACKS_ADDRESS;
  const res = await fetch(`https://api.testnet.hiro.so/extended/v1/address/${addr}/nonces`);
  const data = await res.json();
  return data.possible_next_nonce;
}

async function deployContract(contractName, contractPath, nonce) {
  const contractSource = fs.readFileSync(contractPath, 'utf8');
  console.log(`📦 Deploying ${contractName} (${contractSource.length} bytes, nonce: ${nonce})...`);

  const tx = await makeContractDeploy({
    contractName,
    codeBody: contractSource,
    senderKey: process.env.STACKS_WALLET_SEED,
    network: STACKS_TESTNET,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 100000,
    nonce,
    clarityVersion: 2  // REQUIRED for stx-transfer? patterns
  });

  const result = await broadcastTransaction({ transaction: tx, network: STACKS_TESTNET });

  if (result.error) {
    console.error(`❌ Broadcast error for ${contractName}:`, result.error, result.reason);
    throw new Error(`Broadcast failed: ${result.error} - ${result.reason}`);
  }

  const txid = result.txid || result;
  console.log(`📡 TX: ${txid}`);
  console.log(`🔍 https://explorer.hiro.so/txid/${txid}?chain=testnet`);
  return txid;
}

async function waitAndCheck(txid, label, retries = 4) {
  for (let i = 0; i < retries; i++) {
    const waitTime = i === 0 ? 15000 : 10000;
    console.log(`⏳ Waiting for ${label}... (attempt ${i + 1}/${retries})`);
    await new Promise(r => setTimeout(r, waitTime));

    const res = await fetch(`https://api.testnet.hiro.so/extended/v1/tx/${txid}`);
    const data = await res.json();
    const status = data.tx_status;

    if (status === 'success') {
      const contract = data.smart_contract?.contract_id;
      console.log(`✅ ${label}: ${status}`);
      if (contract) console.log(`   Contract: ${contract}`);
      console.log(`   Explorer: https://explorer.hiro.so/txid/${txid}?chain=testnet`);
      return { status, contract, txid };
    } else if (status === 'abort_by_response' || status === 'abort_by_post_condition') {
      console.error(`❌ ${label}: ${status}`);
      if (data.tx_result) console.error(`   Result: ${JSON.stringify(data.tx_result)}`);
      return { status, txid };
    } else {
      console.log(`   Status: ${status} (still pending...)`);
    }
  }

  console.log(`⚠️ ${label}: Still pending after ${retries} checks`);
  return { status: 'pending', txid };
}

(async () => {
  console.log('🚀 Deploying Swarm Contracts v2 (audit fixes)\n');
  console.log('Deployer:', process.env.STACKS_ADDRESS);
  console.log();

  const nonce = await getNonce();
  console.log('Current nonce:', nonce, '\n');

  // Deploy with v2 names (can't redeploy same name on Stacks)
  const poolTxid = await deployContract(
    'agent-liquidity-pool-v2',
    path.join(__dirname, '../src/contracts/liquidity-pool.clar'),
    nonce
  );

  console.log();

  const escrowTxid = await deployContract(
    'agent-escrow-v2',
    path.join(__dirname, '../src/contracts/escrow.clar'),
    nonce + 1
  );

  console.log('\n--- Waiting for confirmations ---\n');

  const pool = await waitAndCheck(poolTxid, 'Liquidity Pool v2');
  const escrow = await waitAndCheck(escrowTxid, 'Escrow v2');

  console.log('\n' + '='.repeat(60));
  console.log('📊 Deployment Summary:');
  console.log(`  Pool:   ${pool.status === 'success' ? '✅' : pool.status === 'pending' ? '⏳' : '❌'} ${pool.contract || pool.status} (TX: ${pool.txid})`);
  console.log(`  Escrow: ${escrow.status === 'success' ? '✅' : escrow.status === 'pending' ? '⏳' : '❌'} ${escrow.contract || escrow.status} (TX: ${escrow.txid})`);
  console.log('='.repeat(60));

  // Output env updates
  console.log('\n📄 Update your .env with:');
  console.log(`LIQUIDITY_POOL_NAME=agent-liquidity-pool-v2`);
  console.log(`LIQUIDITY_POOL_TXID=${poolTxid}`);
  console.log(`ESCROW_CONTRACT_NAME=agent-escrow-v2`);
  console.log(`ESCROW_DEPLOY_TXID=${escrowTxid}`);

  const exitCode = (pool.status === 'success' || pool.status === 'pending') &&
                   (escrow.status === 'success' || escrow.status === 'pending') ? 0 : 1;
  process.exit(exitCode);
})();
