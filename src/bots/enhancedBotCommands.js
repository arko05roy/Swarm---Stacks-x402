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
const { botInvestment } = require('../platform/BotInvestment');
const { executionEngine } = require('../core/ExecutionEngine');
const db = require('../database/db');

const EXPLORER_BASE = 'https://explorer.hiro.so/txid';

class EnhancedBotCommands {
  constructor(bot, walletService) {
    this.bot = bot;
    this.walletService = walletService;

    // Session management for multi-step flows
    this.sessions = new Map(); // userId -> session data
  }

  /** Format a tx hash as a clickable explorer link */
  txLink(txid) {
    return `<a href="${EXPLORER_BASE}/${txid}?chain=testnet">${txid.slice(0, 16)}...</a>`;
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
    this.bot.onText(/\/claim_earnings/, (msg) => this.handleClaimEarnings(msg));
    this.bot.onText(/\/pool_stats/, (msg) => this.handlePoolStats(msg));

    // Bot investment commands
    this.bot.onText(/\/invest ([^\s]+)\s+(.+)/, (msg, match) => this.handleInvest(msg, match[1], parseFloat(match[2])));
    this.bot.onText(/\/withdraw_investment ([^\s]+)\s+(.+)/, (msg, match) => this.handleWithdrawInvestment(msg, match[1], parseFloat(match[2])));
    this.bot.onText(/\/withdraw_all ([^\s]+)/, (msg, match) => this.handleWithdrawAll(msg, match[1]));
    this.bot.onText(/\/my_investments/, (msg) => this.handleMyInvestments(msg));
    this.bot.onText(/\/bot_stats ([^\s]+)/, (msg, match) => this.handleBotStats(msg, match[1]));
    this.bot.onText(/\/top_investments/, (msg) => this.handleTopInvestments(msg));
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
   * Handle /browse_store - Browse marketplace with investment data
   */
  async handleBrowseStore(msg) {
    // Combine both data stores for full marketplace view
    const allDbBots = db.getAllBots();
    const sdkAgents = registry.list({ activeOnly: true });

    let message = `🏪 <b>Agent Marketplace</b>\n\n`;

    // Trending: top bots by calls from db
    const trending = [...allDbBots]
      .sort((a, b) => (b.tasksCompleted || 0) - (a.tasksCompleted || 0))
      .slice(0, 5);

    if (trending.length > 0) {
      message += `🔥 <b>Trending</b>\n`;
      trending.forEach((b, i) => {
        message += `${i + 1}. ${b.name} — ${(b.tasksCompleted || 0).toLocaleString()} calls\n`;
        message += `   💰 ${b.pricePerCall} STX/call | ⭐ ${(b.rating || 5).toFixed(1)}\n`;
      });
      message += `\n`;
    }

    // Top earners
    const topEarners = [...allDbBots]
      .sort((a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0))
      .slice(0, 5);

    if (topEarners.length > 0) {
      message += `💰 <b>Top Earners</b>\n`;
      topEarners.forEach((b, i) => {
        message += `${i + 1}. ${b.name} — ${(b.totalEarnings || 0).toFixed(2)} STX\n`;
      });
      message += `\n`;
    }

    // Investment opportunities
    try {
      const topInvestments = botInvestment.getTopOpportunities(5);
      if (topInvestments.length > 0) {
        message += `📈 <b>Top Investment Opportunities</b>\n`;
        topInvestments.forEach((opp, i) => {
          const apyIcon = opp.projectedAPY > 100 ? '🚀' : opp.projectedAPY > 50 ? '📈' : '📊';
          message += `${i + 1}. ${opp.botName}\n`;
          message += `   ${apyIcon} ${opp.projectedAPY.toFixed(1)}% APY | 💰 ${opp.totalInvested.toFixed(2)} STX invested\n`;
        });
        message += `\n`;
      }
    } catch (_) {}

    // SDK agents (live callable agents)
    if (sdkAgents.length > 0) {
      message += `🤖 <b>Live SDK Agents</b>\n`;
      sdkAgents.slice(0, 5).forEach((a, i) => {
        message += `${i + 1}. ${a.name} — ${a.pricing.pricePerCall} STX/call\n`;
      });
      message += `\n`;
    }

    const totalCount = allDbBots.length + sdkAgents.length;
    message += `📊 <b>Total:</b> ${totalCount} agents in marketplace`;
    message += `\n\n<b>Commands:</b>`;
    message += `\n/search [query] - Find agents`;
    message += `\n/top_investments - Best investment opportunities`;
    message += `\n/invest [botId] [amount] - Invest in a bot`;

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
    const lowerQuery = query.toLowerCase();

    // Search SDK agents
    const sdkResults = registry.search(query);

    // Search db bots
    const dbBots = db.getAllBots().filter(b => {
      const name = (b.name || '').toLowerCase();
      const desc = (b.description || '').toLowerCase();
      const caps = (b.capabilities || []).join(' ').toLowerCase();
      return name.includes(lowerQuery) || desc.includes(lowerQuery) || caps.includes(lowerQuery);
    });

    const totalResults = sdkResults.length + dbBots.length;

    if (totalResults === 0) {
      return this.bot.sendMessage(
        msg.chat.id,
        `❌ No agents found for "${query}"\n\nTry /browse_store to see all agents`
      );
    }

    let message = `🔍 <b>Search results for "${query}"</b> (${totalResults})\n\n`;

    let count = 0;

    // Show db bots first (seeded marketplace data)
    dbBots.slice(0, 8).forEach((b) => {
      count++;
      message += `${count}. <b>${b.name}</b>\n`;
      message += `   ${b.description}\n`;
      message += `   💰 ${b.pricePerCall} STX | 📊 ${(b.tasksCompleted || 0).toLocaleString()} calls\n\n`;
    });

    // Then SDK agents
    sdkResults.slice(0, 10 - count).forEach((a) => {
      count++;
      message += `${count}. <b>${a.name}</b>\n`;
      message += `   ${a.description}\n`;
      message += `   💰 ${a.pricing.pricePerCall} STX | 📊 ${a.metadata.calls} calls\n\n`;
    });

    if (totalResults > 10) {
      message += `\n...and ${totalResults - 10} more`;
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
/withdraw [amount] - Remove liquidity (principal only)
/claim_earnings - Claim your profit share
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
          `Transaction: ${this.txLink(result.txid)}\n\n` +
          `You're now earning yield from agent work! 🚀`,
          {
            chat_id: msg.chat.id,
            message_id: thinkingMsg.message_id,
            parse_mode: 'HTML',
            disable_web_page_preview: true
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
          `Transaction: ${this.txLink(result.txid)}`,
          {
            chat_id: msg.chat.id,
            message_id: thinkingMsg.message_id,
            parse_mode: 'HTML',
            disable_web_page_preview: true
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
   * Handle /claim_earnings - Claim LP earnings
   */
  async handleClaimEarnings(msg) {
    const userId = msg.from.id.toString();
    const thinkingMsg = await this.bot.sendMessage(
      msg.chat.id,
      `💸 Claiming your LP earnings...`
    );

    try {
      const result = await liquidityPool.claimEarnings(userId);

      if (result.success) {
        await this.bot.editMessageText(
          `✅ Successfully claimed earnings!\n\n` +
          `Amount: ${result.amount.toFixed(4)} STX\n` +
          `Transaction: ${this.txLink(result.txid)}\n\n` +
          `🎉 Earnings sent to your wallet!`,
          {
            chat_id: msg.chat.id,
            message_id: thinkingMsg.message_id,
            parse_mode: 'HTML',
            disable_web_page_preview: true
          }
        );
      } else {
        await this.bot.editMessageText(
          `❌ Claim failed: ${result.error}`,
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
  /**
   * Handle template number selection
   */
  async handleTemplateSelect(userId, text, chatId) {
    const templates = listTemplates();
    const index = parseInt(text) - 1;

    if (isNaN(index) || index < 0 || index >= templates.length) {
      return this.bot.sendMessage(chatId, `❌ Invalid selection. Reply with a number (1-${templates.length}):`);
    }

    const template = templates[index];
    this.sessions.set(userId, {
      ...this.sessions.get(userId),
      step: 'template_name',
      data: { templateId: template.id, templateName: template.name }
    });

    await this.bot.sendMessage(chatId, `You selected: <b>${template.icon} ${template.name}</b>\n\nNow give your agent a custom name:`, { parse_mode: 'HTML' });
  }

  /**
   * Handle template agent naming
   */
  async handleTemplateName(userId, text, chatId) {
    const name = text.trim();
    if (name.length < 2 || name.length > 50) {
      return this.bot.sendMessage(chatId, '❌ Name must be 2-50 characters. Try again:');
    }

    const session = this.sessions.get(userId);
    session.data.name = name;
    session.step = 'template_price';
    this.sessions.set(userId, session);

    await this.bot.sendMessage(chatId, `Great name! <b>${name}</b>\n\nSet a price per call in STX (e.g., 0.001 - 1):`, { parse_mode: 'HTML' });
  }

  /**
   * Handle template agent pricing and create agent
   */
  async handleTemplatePrice(userId, text, chatId) {
    const price = parseFloat(text);
    if (isNaN(price) || price < 0.001 || price > 1) {
      return this.bot.sendMessage(chatId, '❌ Price must be between 0.001 and 1 STX. Try again:');
    }

    const session = this.sessions.get(userId);
    const { templateId, name } = session.data;

    try {
      const agent = fromTemplate(templateId, {
        name,
        pricePerCall: price,
        userId: userId.toString()
      });

      this.sessions.delete(userId);

      await this.bot.sendMessage(chatId,
        `✅ <b>Agent Created!</b>\n\n` +
        `Name: <b>${name}</b>\n` +
        `Template: ${templateId}\n` +
        `Price: ${price} STX/call\n` +
        `ID: <code>${agent.id}</code>\n\n` +
        `Your agent is now live in the marketplace!`,
        { parse_mode: 'HTML' }
      );
    } catch (err) {
      this.sessions.delete(userId);
      await this.bot.sendMessage(chatId, `❌ Failed to create agent: ${err.message}`);
    }
  }

  /**
   * Handle API wrapper URL input
   */
  async handleAPIUrl(userId, text, chatId) {
    const url = text.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return this.bot.sendMessage(chatId, '❌ Please enter a valid URL starting with http:// or https://');
    }

    const session = this.sessions.get(userId);
    session.data = { ...session.data, apiUrl: url };
    session.step = 'api_desc';
    this.sessions.set(userId, session);

    await this.bot.sendMessage(chatId, 'What does this API do? Enter a short description:');
  }

  /**
   * Handle API wrapper description
   */
  async handleAPIDesc(userId, text, chatId) {
    const session = this.sessions.get(userId);
    session.data.description = text.trim();
    session.step = 'api_name';
    this.sessions.set(userId, session);

    await this.bot.sendMessage(chatId, 'Give your API agent a name:');
  }

  /**
   * Handle API wrapper naming and create agent
   */
  async handleAPIName(userId, text, chatId) {
    const name = text.trim();
    if (name.length < 2 || name.length > 50) {
      return this.bot.sendMessage(chatId, '❌ Name must be 2-50 characters. Try again:');
    }

    const session = this.sessions.get(userId);
    try {
      const agent = apiWrapper({
        name,
        apiUrl: session.data.apiUrl,
        description: session.data.description,
        userId: userId.toString()
      });

      this.sessions.delete(userId);

      await this.bot.sendMessage(chatId,
        `✅ <b>API Agent Created!</b>\n\n` +
        `Name: <b>${name}</b>\n` +
        `API: ${session.data.apiUrl}\n` +
        `Price: 0.002 STX/call\n` +
        `ID: <code>${agent.id}</code>\n\n` +
        `Your agent is now live!`,
        { parse_mode: 'HTML' }
      );
    } catch (err) {
      this.sessions.delete(userId);
      await this.bot.sendMessage(chatId, `❌ Failed to create agent: ${err.message}`);
    }
  }

  /**
   * Handle compose agent selection
   */
  async handleComposeSelect(userId, text, chatId) {
    const session = this.sessions.get(userId);
    const agents = session.agents;
    const indices = text.split(',').map(s => parseInt(s.trim()) - 1);

    const invalid = indices.some(i => isNaN(i) || i < 0 || i >= agents.length);
    if (invalid || indices.length < 2) {
      return this.bot.sendMessage(chatId, '❌ Select at least 2 valid agent numbers separated by commas (e.g., "1,3,5"):');
    }

    const selectedAgents = indices.map(i => agents[i]);
    const workflow = selectedAgents.map(a => ({ agent: a.id }));

    try {
      const agent = compose({
        name: `Workflow: ${selectedAgents.map(a => a.name).join(' → ')}`,
        workflow,
        userId: userId.toString()
      });

      this.sessions.delete(userId);

      await this.bot.sendMessage(chatId,
        `✅ <b>Composite Agent Created!</b>\n\n` +
        `Workflow: ${selectedAgents.map(a => a.name).join(' → ')}\n` +
        `Steps: ${workflow.length}\n` +
        `ID: <code>${agent.id}</code>\n\n` +
        `Your workflow agent is now live!`,
        { parse_mode: 'HTML' }
      );
    } catch (err) {
      this.sessions.delete(userId);
      await this.bot.sendMessage(chatId, `❌ Failed to create workflow: ${err.message}`);
    }
  }

  async handleSessionMessage(userId, text, chatId) {
    const session = this.sessions.get(userId);

    if (!session) return false; // Not in session

    // Handle based on current step
    switch (session.step) {
      case 'select_method':
        await this.handleMethodSelection(userId, text, chatId);
        return true;

      case 'template_select':
        await this.handleTemplateSelect(userId, text, chatId);
        return true;

      case 'template_name':
        await this.handleTemplateName(userId, text, chatId);
        return true;

      case 'template_price':
        await this.handleTemplatePrice(userId, text, chatId);
        return true;

      case 'api_url':
        await this.handleAPIUrl(userId, text, chatId);
        return true;

      case 'api_desc':
        await this.handleAPIDesc(userId, text, chatId);
        return true;

      case 'api_name':
        await this.handleAPIName(userId, text, chatId);
        return true;

      case 'compose_select':
        await this.handleComposeSelect(userId, text, chatId);
        return true;

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

  /**
   * Handle /invest - Invest in a bot
   */
  async handleInvest(msg, botId, amount) {
    const userId = msg.from.id.toString();

    if (!amount || amount <= 0) {
      return this.bot.sendMessage(
        msg.chat.id,
        '❌ Invalid amount. Usage: /invest [botId] [amount]\n\nExample: /invest agent_123 1.5'
      );
    }

    const thinkingMsg = await this.bot.sendMessage(
      msg.chat.id,
      `💰 Investing ${amount} STX in bot...`
    );

    try {
      const result = botInvestment.invest(userId, botId, amount);

      await this.bot.editMessageText(
        `✅ Investment successful!\n\n` +
        `Bot: <b>${result.botName}</b>\n` +
        `Invested: ${result.amount.toFixed(4)} STX\n` +
        `Total Invested: ${result.totalInvested.toFixed(4)} STX\n` +
        `Your Ownership: ${result.ownership.toFixed(2)}%\n\n` +
        `💡 You'll earn ${result.ownership.toFixed(2)}% of bot's earnings!\n\n` +
        `Track performance: /my_investments`,
        {
          chat_id: msg.chat.id,
          message_id: thinkingMsg.message_id,
          parse_mode: 'HTML'
        }
      );

    } catch (error) {
      await this.bot.editMessageText(
        `❌ Investment failed: ${error.message}\n\n` +
        `Try /browse_store to see available bots`,
        {
          chat_id: msg.chat.id,
          message_id: thinkingMsg.message_id
        }
      );
    }
  }

  /**
   * Handle /withdraw_investment - Withdraw from specific bot
   */
  async handleWithdrawInvestment(msg, botId, amount) {
    const userId = msg.from.id.toString();

    if (!amount || amount <= 0) {
      return this.bot.sendMessage(
        msg.chat.id,
        '❌ Invalid amount. Usage: /withdraw_investment [botId] [amount]\n\nExample: /withdraw_investment agent_123 0.5'
      );
    }

    const thinkingMsg = await this.bot.sendMessage(
      msg.chat.id,
      `💸 Withdrawing ${amount} STX...`
    );

    try {
      const result = await botInvestment.withdraw(userId, botId, amount);

      await this.bot.editMessageText(
        `✅ Withdrawal successful!\n\n` +
        `Bot: <b>${result.botName}</b>\n` +
        `Withdrawn: ${result.totalWithdrawn.toFixed(4)} STX\n` +
        `  Principal: ${result.principalWithdrawn.toFixed(4)} STX\n` +
        `  Earnings: ${result.earningsWithdrawn.toFixed(4)} STX\n\n` +
        `Remaining Investment: ${result.remainingInvestment.toFixed(4)} STX\n` +
        `Remaining Ownership: ${result.remainingOwnership.toFixed(2)}%\n\n` +
        `Transaction: ${this.txLink(result.txId)}\n\n` +
        `💡 Funds sent to your wallet!`,
        {
          chat_id: msg.chat.id,
          message_id: thinkingMsg.message_id,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        }
      );

    } catch (error) {
      await this.bot.editMessageText(
        `❌ Withdrawal failed: ${error.message}`,
        {
          chat_id: msg.chat.id,
          message_id: thinkingMsg.message_id
        }
      );
    }
  }

  /**
   * Handle /withdraw_all - Withdraw entire position from bot
   */
  async handleWithdrawAll(msg, botId) {
    const userId = msg.from.id.toString();

    const thinkingMsg = await this.bot.sendMessage(
      msg.chat.id,
      `💸 Withdrawing all funds from bot...`
    );

    try {
      const result = await botInvestment.withdrawAll(userId, botId);

      await this.bot.editMessageText(
        `✅ Complete withdrawal successful!\n\n` +
        `Bot: <b>${result.botName}</b>\n` +
        `Total Withdrawn: ${result.totalWithdrawn.toFixed(4)} STX\n` +
        `  Principal: ${result.principalWithdrawn.toFixed(4)} STX\n` +
        `  Earnings: ${result.earningsWithdrawn.toFixed(4)} STX\n\n` +
        `Transaction: ${this.txLink(result.txId)}\n\n` +
        `🎉 Position closed. Funds sent to your wallet!`,
        {
          chat_id: msg.chat.id,
          message_id: thinkingMsg.message_id,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        }
      );

    } catch (error) {
      await this.bot.editMessageText(
        `❌ Withdrawal failed: ${error.message}`,
        {
          chat_id: msg.chat.id,
          message_id: thinkingMsg.message_id
        }
      );
    }
  }

  /**
   * Handle /my_investments - Show investor's portfolio
   */
  async handleMyInvestments(msg) {
    const userId = msg.from.id.toString();

    try {
      const portfolio = botInvestment.getInvestorPortfolio(userId);
      const message = botInvestment.formatPortfolio(portfolio);

      await this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' });

    } catch (error) {
      await this.bot.sendMessage(
        msg.chat.id,
        `❌ Error loading portfolio: ${error.message}`
      );
    }
  }

  /**
   * Handle /bot_stats - Show bot investment stats
   */
  async handleBotStats(msg, botId) {
    try {
      const stats = botInvestment.getBotStats(botId);
      const message = botInvestment.formatBotStats(stats);

      await this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' });

    } catch (error) {
      await this.bot.sendMessage(
        msg.chat.id,
        `❌ Bot not found: ${error.message}\n\nUse /browse_store to see available bots`
      );
    }
  }

  /**
   * Handle /top_investments - Show best investment opportunities
   */
  async handleTopInvestments(msg) {
    try {
      const opportunities = botInvestment.getTopOpportunities(10);

      if (opportunities.length === 0) {
        return this.bot.sendMessage(
          msg.chat.id,
          '📊 No investment opportunities available yet.\n\nCreate some bots first with /create_agent!'
        );
      }

      let message = `🔥 <b>Top Investment Opportunities</b>\n\n`;

      opportunities.forEach((opp, i) => {
        const apyIcon = opp.projectedAPY > 100 ? '🚀' : opp.projectedAPY > 50 ? '📈' : '📊';

        message += `<b>${i + 1}. ${opp.botName}</b>\n`;
        message += `   ${apyIcon} Projected APY: ${opp.projectedAPY.toFixed(1)}%\n`;
        message += `   💰 Total Invested: ${opp.totalInvested.toFixed(4)} STX\n`;
        message += `   📞 Calls: ${opp.calls}\n`;
        message += `   👥 Investors: ${opp.investorCount}\n`;
        message += `   💸 Total Earnings: ${opp.totalEarnings.toFixed(4)} STX\n`;
        message += `   📊 ROI: ${opp.roi.toFixed(2)}%\n\n`;
      });

      message += `<b>Commands:</b>\n`;
      message += `/invest [botId] [amount] - Invest in a bot\n`;
      message += `/bot_stats [botId] - See detailed stats\n`;
      message += `/my_investments - Your portfolio`;

      await this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' });

    } catch (error) {
      await this.bot.sendMessage(
        msg.chat.id,
        `❌ Error loading opportunities: ${error.message}`
      );
    }
  }
}

module.exports = EnhancedBotCommands;
