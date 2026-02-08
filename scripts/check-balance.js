const fetch = require('node-fetch');

async function checkBalance(address) {
  console.log(`💰 Checking balance for ${address}...\n`);

  try {
    const response = await fetch(`https://api.testnet.hiro.so/extended/v1/address/${address}/balances`);
    const data = await response.json();

    if (response.ok) {
      const stxBalance = parseInt(data.stx.balance) / 1_000_000; // Convert from micro-STX to STX
      const locked = parseInt(data.stx.locked) / 1_000_000;

      console.log('✅ Balance:');
      console.log(`   Available: ${stxBalance} STX`);
      console.log(`   Locked: ${locked} STX`);
      console.log(`   Total: ${stxBalance + locked} STX`);

      if (stxBalance > 0) {
        console.log('\n🎉 Wallet is funded and ready!');
        return true;
      } else {
        console.log('\n⏳ Waiting for tokens to arrive... (usually 2-3 minutes)');
        return false;
      }
    } else {
      console.error('❌ Error:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return false;
  }
}

// Check main wallet
const mainAddress = 'ST2Q9TEZVYPTJ1Q2H5H2G9QREV21KS90YQ0SZH113';
checkBalance(mainAddress);
