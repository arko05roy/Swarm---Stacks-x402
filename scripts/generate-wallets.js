const bip39 = require('bip39');
const { privateKeyToAddress } = require('@stacks/transactions');
const { STACKS_TESTNET } = require('@stacks/network');

function generateWallets() {
  console.log('🔐 Generating Stacks Wallets...\n');

  const wallets = [];
  const names = ['Main Bot', 'Price Bot', 'Weather Bot', 'Translation Bot', 'Calculator Bot'];
  const network = STACKS_TESTNET;

  for (let i = 0; i < 5; i++) {
    // Generate mnemonic (24 words)
    const mnemonic = bip39.generateMnemonic(256);

    // Generate private key from mnemonic seed
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const privateKeyHex = seed.slice(0, 32).toString('hex');

    // Get testnet address
    const address = privateKeyToAddress(privateKeyHex, network);

    wallets.push({
      name: names[i],
      address,
      mnemonic,
      privateKey: privateKeyHex
    });

    console.log(`✅ ${names[i]}`);
    console.log(`   Address: ${address}`);
    console.log(`   Mnemonic: ${mnemonic}`);
    console.log('');
  }

  return wallets;
}

const wallets = generateWallets();

console.log('\n📋 Summary:');
console.log('====================');
wallets.forEach(w => {
  console.log(`${w.name}: ${w.address}`);
});

console.log('\n⚠️  Save these mnemonics securely!');
console.log('\n📄 Writing to wallets.json...');

const fs = require('fs');
fs.writeFileSync('wallets.json', JSON.stringify(wallets, null, 2));
console.log('✅ Saved to wallets.json');
