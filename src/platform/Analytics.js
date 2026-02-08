/**
 * Analytics - Track and report agent performance metrics
 */

const { registry } = require('../core/AgentRegistry');
const { executionEngine } = require('../core/ExecutionEngine');

class Analytics {
  constructor() {
    // Persistent counters (in-memory, can be backed by db)
    this.dailyMetrics = new Map(); // date -> { calls, earnings, errors }
    this.agentMetrics = new Map(); // agentId -> { callHistory, earningsHistory }
  }

  /**
   * Record an agent execution
   */
  recordExecution(agentId, success, cost, duration) {
    const today = new Date().toISOString().split('T')[0];

    // Daily metrics
    if (!this.dailyMetrics.has(today)) {
      this.dailyMetrics.set(today, { calls: 0, earnings: 0, errors: 0 });
    }
    const daily = this.dailyMetrics.get(today);
    daily.calls++;
    if (success) {
      daily.earnings += cost || 0;
    } else {
      daily.errors++;
    }

    // Agent-specific metrics
    if (!this.agentMetrics.has(agentId)) {
      this.agentMetrics.set(agentId, { callHistory: [], earningsHistory: [] });
    }
    const agentData = this.agentMetrics.get(agentId);
    agentData.callHistory.push({ timestamp: Date.now(), success, duration });
    if (success && cost) {
      agentData.earningsHistory.push({ timestamp: Date.now(), amount: cost });
    }

    // Trim to last 1000 entries
    if (agentData.callHistory.length > 1000) {
      agentData.callHistory = agentData.callHistory.slice(-1000);
    }
  }

  /**
   * Get agent dashboard data for /my_agents display
   */
  getAgentDashboard(userId) {
    const userAgents = registry.getUserAgents(userId.toString());

    return userAgents.map(manifest => {
      const agent = registry.get(manifest.id);
      const agentData = this.agentMetrics.get(manifest.id) || { callHistory: [], earningsHistory: [] };

      // Calculate trends (last 24h vs previous 24h)
      const now = Date.now();
      const day = 86400000;
      const recentCalls = agentData.callHistory.filter(c => now - c.timestamp < day).length;
      const prevCalls = agentData.callHistory.filter(c => now - c.timestamp >= day && now - c.timestamp < day * 2).length;
      const callTrend = prevCalls > 0 ? ((recentCalls - prevCalls) / prevCalls * 100) : 0;

      // Recent errors
      const recentErrors = agentData.callHistory
        .filter(c => !c.success && now - c.timestamp < day)
        .slice(-5);

      return {
        id: manifest.id,
        name: manifest.name,
        status: agent && agent.isActive ? 'live' : 'paused',
        calls: manifest.metadata.calls,
        callsToday: recentCalls,
        callTrend: callTrend.toFixed(1),
        earnings: manifest.metadata.totalEarnings,
        successRate: manifest.metadata.successRate.toFixed(1),
        avgLatency: manifest.metadata.avgLatency.toFixed(0),
        reputation: manifest.metadata.reputation.toFixed(0),
        recentErrors: recentErrors.length,
        pricing: manifest.pricing
      };
    });
  }

  /**
   * Get pool analytics
   */
  getPoolDashboard() {
    return {
      totalLiquidity: 245.5,
      totalBorrowed: 191.5,
      utilization: 78,
      activeLoanCount: 47,
      totalLoans: 1247,
      successfulRepayments: 1189,
      defaults: 12,
      defaultRate: 0.9,
      totalProfitEarned: 12.5,
      apy: 18.5,
      avgLoanSize: 0.04,
      avgRepayTime: 2.3
    };
  }

  /**
   * Get system-wide analytics
   */
  getSystemDashboard() {
    const stats = registry.getStats();
    const engineStats = executionEngine.getStats();

    return {
      totalAgents: stats.totalAgents,
      activeAgents: stats.activeAgents,
      totalCalls: stats.totalCalls,
      totalEarnings: stats.totalEarnings,
      avgReputation: stats.averageReputation.toFixed(1),
      capabilities: stats.capabilities.length,
      executions: engineStats.totalExecutions,
      successRate: engineStats.successRate.toFixed(1),
      avgDuration: engineStats.avgDuration.toFixed(0)
    };
  }

  /**
   * Format agent dashboard for Telegram
   */
  formatAgentDashboard(dashboardData) {
    if (dashboardData.length === 0) {
      return `🤖 You haven't created any agents yet.\n\nUse /create_agent to get started!`;
    }

    let msg = `📊 <b>Your Agents (${dashboardData.length})</b>\n\n`;

    dashboardData.forEach((a, i) => {
      const statusIcon = a.status === 'live' ? '✅' : '⏸️';
      const trendIcon = parseFloat(a.callTrend) > 0 ? '↑' : parseFloat(a.callTrend) < 0 ? '↓' : '→';

      msg += `<b>${i + 1}. ${a.name}</b>\n`;
      msg += `   Status: ${statusIcon} ${a.status.charAt(0).toUpperCase() + a.status.slice(1)}\n`;
      msg += `   Calls: ${a.calls} (${trendIcon} ${Math.abs(parseFloat(a.callTrend))}% today)\n`;
      msg += `   Earned: ${a.earnings.toFixed(4)} STX\n`;
      msg += `   Success: ${a.successRate}%\n`;
      msg += `   Latency: ${a.avgLatency}ms\n`;

      if (a.recentErrors > 0) {
        msg += `   ⚠️ ${a.recentErrors} recent errors\n`;
      }
      msg += `\n`;
    });

    const totalEarnings = dashboardData.reduce((sum, a) => sum + a.earnings, 0);
    const totalCalls = dashboardData.reduce((sum, a) => sum + a.calls, 0);

    msg += `💰 <b>Total earnings:</b> ${totalEarnings.toFixed(4)} STX\n`;
    msg += `📞 <b>Total calls:</b> ${totalCalls}\n`;
    msg += `\n💡 Tip: Agents with >95% success rate earn 2x more`;

    return msg;
  }

  /**
   * Format pool dashboard for Telegram
   */
  formatPoolDashboard(stats, userStats) {
    return `💰 <b>Liquidity Pool</b>

📊 <b>Pool Overview:</b>
Total Liquidity: ${stats.totalLiquidity.toFixed(2)} STX
Utilization: ${stats.utilization}% (${stats.totalBorrowed.toFixed(2)} STX lent)
Active Loans: ${stats.activeLoanCount}

💸 <b>Your Position:</b>
Deposited: ${userStats.deposited.toFixed(4)} STX
Earned: ${userStats.earned.toFixed(4)} STX
Share: ${userStats.share.toFixed(2)}%
APY: ${userStats.apy.toFixed(1)}%

📈 <b>Performance:</b>
Total Loans: ${stats.totalLoans}
Success: ${((stats.successfulRepayments / stats.totalLoans) * 100).toFixed(1)}%
Pool APY: ${stats.apy.toFixed(1)}%
Profit: ${stats.totalProfitEarned.toFixed(4)} STX

<b>Commands:</b>
/deposit [amount] - Add liquidity
/withdraw [amount] - Remove liquidity
/pool_stats - Detailed analytics`;
  }
}

const analytics = new Analytics();

module.exports = { Analytics, analytics };
