require('dotenv').config();
const fs = require('fs');
const { makeContractDeploy, broadcastTransaction, AnchorMode } = require('@stacks/transactions');
const { STACKS_TESTNET } = require('@stacks/network');

async function deployContract() {
  console.log('📝 Deploying Escrow Contract to Stacks Testnet...\n');

  // Read contract source
  const contractSource = fs.readFileSync('src/contracts/escrow.clar', 'utf8');
  const contractName = 'swarm-escrow';
  const senderKey = process.env.STACKS_WALLET_SEED;
  const network = STACKS_TESTNET;

  console.log('Contract Name:', contractName);
  console.log('Network:', network.coreApiUrl);
  console.log('Deployer:', process.env.STACKS_ADDRESS);
  console.log('\n🔨 Building transaction...');

  try {
    const txOptions = {
      contractName,
      codeBody: contractSource,
      senderKey,
      network,
      anchorMode: AnchorMode.Any,
      fee: 10000 // 0.01 STX fee
    };

    const transaction = await makeContractDeploy(txOptions);

    console.log('📡 Broadcasting transaction...');
    const broadcastResponse = await broadcastTransaction({ transaction, network });

    if (broadcastResponse.error) {
      console.error('❌ Deployment failed:', broadcastResponse);
      process.exit(1);
    }

    const txId = broadcastResponse.txid || broadcastResponse;
    const contractAddress = `${process.env.STACKS_ADDRESS}.${contractName}`;

    console.log('\n✅ Contract deployed successfully!');
    console.log('   Transaction ID:', txId);
    console.log('   Contract Address:', contractAddress);
    console.log('\n🔍 View on explorer:');
    console.log(`   https://explorer.hiro.so/txid/${txId}?chain=testnet`);
    console.log('\n⏳ Contract will be available in ~30 seconds after confirmation');

    // Save contract address to .env
    console.log('\n📄 Updating .env file...');
    const envContent = fs.readFileSync('.env', 'utf8');
    const updatedEnv = envContent.replace(
      /ESCROW_CONTRACT_ADDRESS=.*/,
      `ESCROW_CONTRACT_ADDRESS=${process.env.STACKS_ADDRESS}`
    );
    fs.writeFileSync('.env', updatedEnv);
    console.log('✅ .env updated with contract address');

    return { txId, contractAddress };
  } catch (error) {
    console.error('❌ Error deploying contract:', error);
    if (error.message) {
      console.error('   Message:', error.message);
    }
    process.exit(1);
  }
}

deployContract();
