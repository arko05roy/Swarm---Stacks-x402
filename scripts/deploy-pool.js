/**
 * Deploy Contracts to Stacks Testnet
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
  const txid = result.txid || result;
  console.log(`📡 TX: ${txid}`);
  return txid;
}

async function waitAndCheck(txid, label) {
  console.log(`⏳ Waiting for ${label}...`);
  await new Promise(r => setTimeout(r, 15000));
  const res = await fetch(`https://api.testnet.hiro.so/extended/v1/tx/${txid}`);
  const data = await res.json();
  const status = data.tx_status;
  const contract = data.smart_contract?.contract_id;
  console.log(`${status === 'success' ? '✅' : '❌'} ${label}: ${status}`);
  if (contract) console.log(`   Contract: ${contract}`);
  if (status === 'success') {
    console.log(`   Explorer: https://explorer.stacks.co/txid/${txid}?chain=testnet`);
  }
  return { status, contract, txid };
}

if (require.main === module) {
  (async () => {
    console.log('🚀 Deploying Swarm Contracts\n');

    const nonce = await getNonce();

    const poolTxid = await deployContract(
      'agent-liquidity-pool',
      path.join(__dirname, '../src/contracts/liquidity-pool.clar'),
      nonce
    );

    const escrowTxid = await deployContract(
      'agent-escrow',
      path.join(__dirname, '../src/contracts/escrow.clar'),
      nonce + 1
    );

    console.log();
    const pool = await waitAndCheck(poolTxid, 'Liquidity Pool');
    const escrow = await waitAndCheck(escrowTxid, 'Escrow');

    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary:');
    console.log(`  Pool: ${pool.status === 'success' ? '✅' : '❌'} ${pool.contract || pool.status}`);
    console.log(`  Escrow: ${escrow.status === 'success' ? '✅' : '❌'} ${escrow.contract || escrow.status}`);
    console.log('='.repeat(50));

    process.exit(pool.status === 'success' && escrow.status === 'success' ? 0 : 1);
  })();
}

module.exports = { deployContract, getNonce, waitAndCheck };
