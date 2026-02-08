/**
 * Enhanced Bot Commands - SDK Integration for Telegram
 *
 * Adds new commands for Strategic Pivot #2:
 * - 4 agent creation methods
 * - Marketplace browsing
 * - Liquidity pool management
 * - Agent analytics
 */

const { fromTemplate, apiWrapper, custom, compose, listTemplates } = require('../sdk/createAgent');
const { registry } = require('../core/AgentRegistry');
const { liquidityPool } = require('../platform/LiquidityPool');
const { executionEngine } = require('../core/ExecutionEngine');

class EnhancedBotCommands {
  constructor(bot, walletService) {
    this.bot = bot;
    this.walletService = walletService;

    // Session management for multi-step flows
    this.sessions = new Map(); // userId -> session data
  }

  /**
   * Setup enhanced commands
   */
  setupCommands() {
    // Agent creation with 4 methods
    this.bot.onText(/\/create_agent/, (msg) => this.handleCreateAgent(msg));

    // Marketplace commands
    this.bot.onText(/\/browse_store/, (msg) => this.handleBrowseStore(msg));
    this.bot.onText(/\/my_agents/, (msg) => this.handleMyAgents(msg));
    this.bot.onText(/\/search (.+)/, (msg, match) => this.handleSearch(msg, match[1]));

    // Liquidity pool commands
    this.bot.onText(/\/pool/, (msg) => this.handlePool(msg));
    this.bot.onText(/\/deposit (.+)/, (msg, match) => this.handleDeposit(msg, parseFloat(match[1])));
    this.bot.onText(/\/withdraw (.+)/, (msg, match) => this.handleWithdraw(msg, parseFloat(match[1])));
    this.bot.onText(/\/pool_stats/, (msg) => this.handlePoolStats(msg));
  }

  /**
   * Handle /create_agent - Show creation method options
   */
  async handleCreateAgent(msg) {
    const message = `🤖 <b>Create Your Agent</b>

Choose creation method:

1️⃣ <b>Quick Start</b> (templates)
   Fast setup with pre-built agents

2️⃣ <b>API Wrapper</b> (any REST API)
   Turn any public API into an agent

3️⃣ <b>Code Your Own</b> (advanced)
   Write custom execution logic

4️⃣ <b>Compose Agents</b> (chain existing)
   Create workflows by chaining agents

Reply with number (1-4):`;

    await this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' });

    // Start session
    this.sessions.set(msg.from.id, {
      step: 'select_method',
      chatId: msg.chat.id
    });
  }

  /**
   * Handle method selection
   */
  async handleMethodSelection(userId, method, chatId) {
    const session = this.sessions.get(userId) || {};

    switch(method) {
      case '1':
        return this.startTemplateFlow(userId, chatId);
      case '2':
        return this.startAPIWrapperFlow(userId, chatId);
      case '3':
        return this.startCustomFlow(userId, chatId);
      case '4':
        return this.startComposeFlow(userId, chatId);
      default:
        return this.bot.sendMessage(chatId, '❌ Invalid choice. Reply with 1-4.');
    }
  }

  /**
   * Method 1: Template Flow
   */
  async startTemplateFlow(userId, chatId) {
    const templates = listTemplates();

    let message = `🎨 <b>Quick Start Templates</b>\n\nAvailable templates:\n\n`;

    templates.forEach((t, i) => {
      message += `${i + 1}. ${t.icon} <b>${t.name}</b>\n`;
    });

    message += `\nReply with number (1-${templates.length}):`;

    await this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });

    this.sessions.set(userId, {
      step: 'template_select',
      method: 'template',
      chatId
    });
  }

  /**
   * Method 2: API Wrapper Flow
   */
  async startAPIWrapperFlow(userId, chatId) {
    const message = `🔧 <b>API Wrapper</b>

Turn any public REST API into a paid agent.

<b>Step 1:</b> Enter the API endpoint URL

Example: https://api.github.com/repos/{owner}/{repo}

<b>Note:</b> Use {placeholders} for dynamic values
Your endpoint:`;

    await this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });

    this.sessions.set(userId, {
      step: 'api_url',
      method: 'api_wrapper',
      chatId,
      data: {}
    });
  }

  /**
   * Method 3: Custom Code Flow
   */
  async startCustomFlow(userId, chatId) {
    const message = `💻 <b>Code Your Own Agent</b>

For advanced users who want full control.

This requires JavaScript knowledge. You'll define:
• Agent name
• Execution function
• Pricing

Coming soon in full implementation!

For now, use templates (method 1) or API wrapper (method 2).`;

    await this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    this.sessions.delete(userId);
  }

  /**
   * Method 4: Compose Flow
   */
  async startComposeFlow(userId, chatId) {
    const agents = registry.list({ activeOnly: true });

    if (agents.length < 2) {
      return this.bot.sendMessage(
        chatId,
        '❌ Need at least 2 agents to create a workflow. Create more agents first!'
      );
    }

    let message = `🔗 <b>Compose Agents</b>

Build workflows by chaining existing agents.

<b>Available agents:</b>\n\n`;

    agents.forEach((a, i) => {
      message += `${i + 1}. ${a.name} - ${a.description}\n`;
    });

    message += `\nReply with agent numbers to chain (e.g., "1,3,5"):`;

    await this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });

    this.sessions.set(userId, {
      step: 'compose_select',
      method: 'compose',
      chatId,
      agents
    });
  }

  /**
   * Handle /browse_store - Browse marketplace
   */
  async handleBrowseStore(msg) {
    const trending = registry.getTrending(5);
    const topRated = registry.getTopRated(5);
    const newest = registry.getNewest(5);

    let message = `🏪 <b>Agent Marketplace</b>\n\n`;

    if (trending.length > 0) {
      message += `🔥 <b>Trending (24h)</b>\n`;
      trending.forEach((a, i) => {
        message += `${i + 1}. ${a.name} - ${a.metadata.calls} calls\n`;
        message += `   💰 ${a.pricing.pricePerCall} STX/call\n`;
      });
      message += `\n`;
    }

    if (topRated.length > 0) {
      message += `⭐ <b>Top Rated</b>\n`;
      topRated.forEach((a, i) => {
        message += `${i + 1}. ${a.name} - ${a.metadata.reputation}% success\n`;
      });
      message += `\n`;
    }

    if (newest.length > 0) {
      message += `🆕 <b>Recently Added</b>\n`;
      newest.forEach((a, i) => {
        message += `${i + 1}. ${a.name}\n`;
      });
    }

    message += `\n📊 <b>Total agents:</b> ${registry.list().length}`;
    message += `\n\nUse /search [query] to find specific agents`;

    await this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' });
  }

  /**
   * Handle /my_agents - Show user's agents with analytics
   */
  async handleMyAgents(msg) {
    const userId = msg.from.id.toString();
    const userAgents = registry.getUserAgents(userId);

    if (userAgents.length === 0) {
      return this.bot.sendMessage(
        msg.chat.id,
        `🤖 You haven't created any agents yet.\n\nUse /create_agent to get started! 💰`,
        { parse_mode: 'HTML' }
      );
    }

    let message = `📊 <b>Your Agents (${userAgents.length})</b>\n\n`;

    userAgents.forEach((agent, i) => {
      const stats = executionEngine.getAgentStats(agent.id);

      message += `<b>${i + 1}. ${agent.name}</b>\n`;
      message += `   Status: ${agent.metadata.calls > 0 ? '✅ Live' : '🟡 Idle'}\n`;
      message += `   Calls: ${agent.metadata.calls} (↑ ${stats.successRate.toFixed(1)}% success)\n`;
      message += `   Earned: ${agent.metadata.totalEarnings.toFixed(4)} STX\n`;
      message += `   Avg latency: ${agent.metadata.avgLatency.toFixed(0)}ms\n\n`;
    });

    const totalEarnings = userAgents.reduce((sum, a) => sum + a.metadata.totalEarnings, 0);
    const totalCalls = userAgents.reduce((sum, a) => sum + a.metadata.calls, 0);

    message += `💰 <b>Total earnings:</b> ${totalEarnings.toFixed(4)} STX\n`;
    message += `📞 <b>Total calls:</b> ${totalCalls}`;

    await this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' });
  }

  /**
   * Handle /search - Search agents
   */
  async handleSearch(msg, query) {
    const results = registry.search(query);

    if (results.length === 0) {
      return this.bot.sendMessage(
        msg.chat.id,
        `❌ No agents found for "${query}"\n\nTry /browse_store to see all agents`
      );
    }

    let message = `🔍 <b>Search results for "${query}"</b>\n\n`;

    results.slice(0, 10).forEach((a, i) => {
      message += `${i + 1}. <b>${a.name}</b>\n`;
      message += `   ${a.description}\n`;
      message += `   💰 ${a.pricing.pricePerCall} STX | 📊 ${a.metadata.calls} calls\n\n`;
    });

    if (results.length > 10) {
      message += `\n...and ${results.length - 10} more`;
    }

    await this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' });
  }

  /**
   * Handle /pool - Show pool overview
   */
  async handlePool(msg) {
    const userId = msg.from.id.toString();
    const poolStats = await liquidityPool.getPoolStats();
    const userStats = await liquidityPool.getUserStats(userId);

    const message = `💰 <b>Liquidity Pool</b>

📊 <b>Pool Overview:</b>
Total Liquidity: ${poolStats.totalLiquidity.toFixed(2)} STX
Total Lent: ${poolStats.totalBorrowed.toFixed(2)} STX
Utilization: ${poolStats.utilization}%
Active Loans: ${poolStats.activeLoanCount}

💸 <b>Your Position:</b>
Deposited: ${userStats.deposited.toFixed(4)} STX
Earned: ${userStats.earned.toFixed(4)} STX
Your Share: ${userStats.share.toFixed(2)}%
Your APY: ${userStats.apy.toFixed(1)}%

📈 <b>Performance:</b>
Pool APY: ${poolStats.apy.toFixed(1)}%
Success Rate: ${((poolStats.successfulRepayments / poolStats.totalLoans) * 100).toFixed(1)}%
Total Profit: ${poolStats.totalProfitEarned.toFixed(4)} STX

<b>Commands:</b>
/deposit [amount] - Add liquidity
/withdraw [amount] - Remove liquidity
/pool_stats - Detailed analytics`;

    await this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' });
  }

  /**
   * Handle /deposit - Deposit to pool
   */
  async handleDeposit(msg, amount) {
    if (!amount || amount <= 0) {
      return this.bot.sendMessage(
        msg.chat.id,
        '❌ Invalid amount. Usage: /deposit [amount]\n\nExample: /deposit 10'
      );
    }

    const userId = msg.from.id.toString();
    const thinkingMsg = await this.bot.sendMessage(
      msg.chat.id,
      `💰 Depositing ${amount} STX to pool...`
    );

    try {
      const result = await liquidityPool.deposit(userId, amount);

      if (result.success) {
        await this.bot.editMessageText(
          `✅ Successfully deposited ${amount} STX!\n\n` +
          `Transaction: <code>${result.txid}</code>\n\n` +
          `You're now earning yield from agent work! 🚀`,
          {
            chat_id: msg.chat.id,
            message_id: thinkingMsg.message_id,
            parse_mode: 'HTML'
          }
        );
      } else {
        await this.bot.editMessageText(
          `❌ Deposit failed: ${result.error}`,
          { chat_id: msg.chat.id, message_id: thinkingMsg.message_id }
        );
      }
    } catch (error) {
      await this.bot.editMessageText(
        `❌ Error: ${error.message}`,
        { chat_id: msg.chat.id, message_id: thinkingMsg.message_id }
      );
    }
  }

  /**
   * Handle /withdraw - Withdraw from pool
   */
  async handleWithdraw(msg, amount) {
    if (!amount || amount <= 0) {
      return this.bot.sendMessage(
        msg.chat.id,
        '❌ Invalid amount. Usage: /withdraw [amount]\n\nExample: /withdraw 5'
      );
    }

    const userId = msg.from.id.toString();
    const thinkingMsg = await this.bot.sendMessage(
      msg.chat.id,
      `💸 Withdrawing ${amount} STX from pool...`
    );

    try {
      const result = await liquidityPool.withdraw(userId, amount);

      if (result.success) {
        await this.bot.editMessageText(
          `✅ Successfully withdrew ${amount} STX!\n\n` +
          `Transaction: <code>${result.txid}</code>`,
          {
            chat_id: msg.chat.id,
            message_id: thinkingMsg.message_id,
            parse_mode: 'HTML'
          }
        );
      } else {
        await this.bot.editMessageText(
          `❌ Withdrawal failed: ${result.error}`,
          { chat_id: msg.chat.id, message_id: thinkingMsg.message_id }
        );
      }
    } catch (error) {
      await this.bot.editMessageText(
        `❌ Error: ${error.message}`,
        { chat_id: msg.chat.id, message_id: thinkingMsg.message_id }
      );
    }
  }

  /**
   * Handle /pool_stats - Detailed pool analytics
   */
  async handlePoolStats(msg) {
    const stats = await liquidityPool.getPoolStats();
    const topBorrowers = await liquidityPool.getTopBorrowers(5);

    const message = `💰 <b>Pool Analytics</b>

📊 <b>Overview:</b>
Total Liquidity: ${stats.totalLiquidity.toFixed(2)} STX
Total Lent: ${stats.totalBorrowed.toFixed(2)} STX (${stats.utilization}%)
Active Loans: ${stats.activeLoanCount}
Avg Loan Size: ${stats.avgLoanSize.toFixed(4)} STX

📈 <b>Performance:</b>
Total Loans: ${stats.totalLoans}
Successful: ${stats.successfulRepayments} (${((stats.successfulRepayments / stats.totalLoans) * 100).toFixed(1)}%)
Defaults: ${stats.defaults} (${stats.defaultRate.toFixed(1)}%)
Total Profit: ${stats.totalProfitEarned.toFixed(4)} STX

💸 <b>APY Breakdown:</b>
Current APY: ${stats.apy.toFixed(1)}%
Avg Repay Time: ${stats.avgRepayTime.toFixed(1)} minutes

🏆 <b>Top Borrowers:</b>
${topBorrowers.map((b, i) => `${i + 1}. ${b.name} - ${b.loans} loans (${b.successRate}% success)`).join('\n')}

⚠️ <b>Risk Metrics:</b>
Default Rate: ${stats.defaultRate.toFixed(2)}%
Utilization: ${stats.utilization}%`;

    await this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' });
  }

  /**
   * Handle general messages in session
   */
  async handleSessionMessage(userId, text, chatId) {
    const session = this.sessions.get(userId);

    if (!session) return false; // Not in session

    // Handle based on current step
    switch (session.step) {
      case 'select_method':
        await this.handleMethodSelection(userId, text, chatId);
        return true;

      // Add more step handlers as needed

      default:
        return false;
    }
  }

  /**
   * Check if user is in session
   */
  isInSession(userId) {
    return this.sessions.has(userId);
  }

  /**
   * Cancel session
   */
  cancelSession(userId) {
    this.sessions.delete(userId);
  }
}

module.exports = EnhancedBotCommands;
