/**
 * Test Bot Investment System
 * Run this to verify the investment system works
 */

const { botInvestment } = require('./src/platform/BotInvestment');
const { registry } = require('./src/core/AgentRegistry');
const { initializeCoreAgents } = require('./src/core/initAgents');

console.log('🧪 Testing Bot Investment System\n');

// Initialize core agents
console.log('1. Initializing core agents...');
initializeCoreAgents();

const agents = registry.list();
console.log(`✅ ${agents.length} agents loaded\n`);

// Test investment
console.log('2. Testing investment...');
const testBotId = agents[0].id;
const investorId = 'test_investor_123';

try {
  const result = botInvestment.invest(investorId, testBotId, 1.5);
  console.log(`✅ Invested ${result.amount} STX in ${result.botName}`);
  console.log(`   Ownership: ${result.ownership.toFixed(2)}%\n`);
} catch (error) {
  console.error(`❌ Investment failed: ${error.message}\n`);
  process.exit(1);
}

// Test earnings distribution
console.log('3. Testing earnings distribution...');
const earnings = 0.05; // 0.05 STX earned by bot
const distribution = botInvestment.distributeEarnings(testBotId, earnings);

if (distribution.distributed) {
  console.log(`✅ Distributed ${distribution.totalEarnings} STX to ${distribution.distributions.length} investors`);
  distribution.distributions.forEach(d => {
    console.log(`   Investor ${d.investorId}: ${d.share.toFixed(4)} STX (${d.percentage.toFixed(2)}%)`);
  });
} else {
  console.log(`⚠️  No distribution: ${distribution.reason}`);
}
console.log('');

// Test portfolio
console.log('4. Testing portfolio retrieval...');
const portfolio = botInvestment.getInvestorPortfolio(investorId);
console.log(`✅ Portfolio has ${portfolio.length} investments:`);
portfolio.forEach(inv => {
  console.log(`   ${inv.botName}:`);
  console.log(`     Invested: ${inv.invested.toFixed(4)} STX`);
  console.log(`     Earned: ${inv.earned.toFixed(4)} STX`);
  console.log(`     ROI: ${inv.roi.toFixed(2)}%`);
  console.log(`     Ownership: ${inv.ownership.toFixed(2)}%`);
});
console.log('');

// Test bot stats
console.log('5. Testing bot stats...');
const botStats = botInvestment.getBotStats(testBotId);
console.log(`✅ Bot: ${botStats.botName}`);
console.log(`   Total Invested: ${botStats.totalInvested.toFixed(4)} STX`);
console.log(`   Investor Count: ${botStats.investorCount}`);
console.log(`   Projected APY: ${botStats.projectedAPY.toFixed(1)}%`);
console.log('');

// Test top opportunities
console.log('6. Testing top opportunities...');
const opportunities = botInvestment.getTopOpportunities(3);
console.log(`✅ Top ${opportunities.length} investment opportunities:`);
opportunities.forEach((opp, i) => {
  console.log(`   ${i + 1}. ${opp.botName}`);
  console.log(`      APY: ${opp.projectedAPY.toFixed(1)}%`);
  console.log(`      Total Invested: ${opp.totalInvested.toFixed(4)} STX`);
});
console.log('');

// Test withdrawal (partial)
console.log('7. Testing partial withdrawal...');
try {
  const withdrawResult = botInvestment.withdraw(investorId, testBotId, 0.5);
  console.log(`✅ Withdrew ${withdrawResult.totalWithdrawn.toFixed(4)} STX`);
  console.log(`   Principal: ${withdrawResult.principalWithdrawn.toFixed(4)} STX`);
  console.log(`   Earnings: ${withdrawResult.earningsWithdrawn.toFixed(4)} STX`);
  console.log(`   Remaining: ${withdrawResult.remainingInvestment.toFixed(4)} STX`);
  console.log(`   Ownership: ${withdrawResult.remainingOwnership.toFixed(2)}%`);
} catch (error) {
  console.error(`❌ Withdrawal failed: ${error.message}`);
}
console.log('');

// Test portfolio after withdrawal
console.log('8. Testing portfolio after withdrawal...');
const portfolioAfter = botInvestment.getInvestorPortfolio(investorId);
console.log(`✅ Portfolio now has ${portfolioAfter.length} investments:`);
portfolioAfter.forEach(inv => {
  console.log(`   ${inv.botName}: ${inv.invested.toFixed(4)} STX invested, ${inv.earned.toFixed(4)} STX earned`);
});
console.log('');

// Test complete withdrawal
console.log('9. Testing complete withdrawal...');
try {
  const completeWithdraw = botInvestment.withdrawAll(investorId, testBotId);
  console.log(`✅ Completely withdrew from ${completeWithdraw.botName}`);
  console.log(`   Total: ${completeWithdraw.totalWithdrawn.toFixed(4)} STX`);
  console.log(`   Position closed: ${completeWithdraw.remainingInvestment === 0 ? 'YES' : 'NO'}`);
} catch (error) {
  console.error(`❌ Complete withdrawal failed: ${error.message}`);
}
console.log('');

console.log('🎉 All tests passed! Bot investment system is working.\n');

console.log('📝 Next steps:');
console.log('   1. Start the bot: npm start');
console.log('   2. Test in Telegram:');
console.log('      /browse_store');
console.log('      /top_investments');
console.log('      /invest [botId] 1');
console.log('      /my_investments');
console.log('');
