const fetch = require('node-fetch');

async function requestTestnetSTX(address) {
  console.log(`🪙 Requesting testnet STX for ${address}...\n`);

  try {
    const url = `https://api.testnet.hiro.so/extended/v1/faucets/stx?address=${address}&stacking=false`;
    const response = await fetch(url, {
      method: 'POST'
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Success!');
      console.log('   Transaction ID:', data.txId);
      console.log('   Tokens should arrive in ~2-3 minutes');
      console.log('\n🔍 Check balance at:');
      console.log(`   https://explorer.hiro.so/address/${address}?chain=testnet`);
      return data;
    } else {
      console.error('❌ Error:', data);
      if (data.error && data.error.includes('too many requests')) {
        console.log('\n⚠️  Rate limit hit. You can:');
        console.log('   1. Wait a few minutes and try again');
        console.log('   2. Use the web faucet: https://explorer.hiro.so/sandbox/faucet?chain=testnet');
      }
      return null;
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return null;
  }
}

// Request for main wallet
const mainAddress = 'ST2Q9TEZVYPTJ1Q2H5H2G9QREV21KS90YQ0SZH113';
requestTestnetSTX(mainAddress);
