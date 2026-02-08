/**
 * AgentRegistry - Central registry for all agents
 *
 * Handles:
 * - Agent registration and discovery
 * - Agent routing by capability
 * - Version management
 * - Agent metadata storage
 */

class AgentRegistry {
  constructor() {
    this.agents = new Map(); // agentId -> agent instance
    this.capabilityIndex = new Map(); // capability -> Set of agentIds
    this.categoryIndex = new Map(); // category -> Set of agentIds
    this.userAgents = new Map(); // userId -> Set of agentIds
  }

  /**
   * Register an agent
   * @param {Agent} agent - Agent instance to register
   * @param {string} userId - User who owns this agent
   * @returns {boolean} - Success status
   */
  register(agent, userId = 'system') {
    if (!agent || !agent.manifest) {
      throw new Error('Invalid agent: must have manifest');
    }

    const agentId = agent.manifest.id;

    // Check if agent already exists
    if (this.agents.has(agentId)) {
      throw new Error(`Agent ${agentId} is already registered`);
    }

    // Store agent
    this.agents.set(agentId, agent);

    // Index by capabilities
    if (agent.manifest.capabilities) {
      for (const capability of agent.manifest.capabilities) {
        if (!this.capabilityIndex.has(capability)) {
          this.capabilityIndex.set(capability, new Set());
        }
        this.capabilityIndex.get(capability).add(agentId);
      }
    }

    // Index by user
    if (!this.userAgents.has(userId)) {
      this.userAgents.set(userId, new Set());
    }
    this.userAgents.get(userId).add(agentId);

    console.log(`✅ Registered agent: ${agent.manifest.name} (${agentId})`);
    return true;
  }

  /**
   * Unregister an agent
   * @param {string} agentId - Agent ID to unregister
   * @returns {boolean} - Success status
   */
  unregister(agentId) {
    const agent = this.agents.get(agentId);

    if (!agent) {
      return false;
    }

    // Remove from capability index
    if (agent.manifest.capabilities) {
      for (const capability of agent.manifest.capabilities) {
        const agentSet = this.capabilityIndex.get(capability);
        if (agentSet) {
          agentSet.delete(agentId);
          if (agentSet.size === 0) {
            this.capabilityIndex.delete(capability);
          }
        }
      }
    }

    // Remove from user index
    for (const [userId, agentSet] of this.userAgents.entries()) {
      agentSet.delete(agentId);
      if (agentSet.size === 0) {
        this.userAgents.delete(userId);
      }
    }

    // Remove agent
    this.agents.delete(agentId);

    console.log(`❌ Unregistered agent: ${agentId}`);
    return true;
  }

  /**
   * Get agent by ID
   * @param {string} agentId - Agent ID
   * @returns {Agent|null} - Agent instance or null
   */
  get(agentId) {
    return this.agents.get(agentId) || null;
  }

  /**
   * Check if agent exists
   * @param {string} agentId - Agent ID
   * @returns {boolean}
   */
  has(agentId) {
    return this.agents.has(agentId);
  }

  /**
   * List all agents
   * @param {Object} options - Filter options
   * @returns {Array} - Array of agent manifests
   */
  list(options = {}) {
    let agents = Array.from(this.agents.values());

    // Filter by user
    if (options.userId) {
      const userAgentIds = this.userAgents.get(options.userId);
      if (userAgentIds) {
        agents = agents.filter(a => userAgentIds.has(a.manifest.id));
      } else {
        agents = [];
      }
    }

    // Filter by capability
    if (options.capability) {
      const capabilityAgentIds = this.capabilityIndex.get(options.capability);
      if (capabilityAgentIds) {
        agents = agents.filter(a => capabilityAgentIds.has(a.manifest.id));
      } else {
        agents = [];
      }
    }

    // Filter by active status
    if (options.activeOnly) {
      agents = agents.filter(a => a.isActive);
    }

    // Sort by criteria
    if (options.sortBy === 'calls') {
      agents.sort((a, b) => b.manifest.metadata.calls - a.manifest.metadata.calls);
    } else if (options.sortBy === 'earnings') {
      agents.sort((a, b) => b.manifest.metadata.totalEarnings - a.manifest.metadata.totalEarnings);
    } else if (options.sortBy === 'reputation') {
      agents.sort((a, b) => b.manifest.metadata.reputation - a.manifest.metadata.reputation);
    } else if (options.sortBy === 'newest') {
      agents.sort((a, b) => b.manifest.metadata.createdAt - a.manifest.metadata.createdAt);
    }

    // Limit results
    if (options.limit) {
      agents = agents.slice(0, options.limit);
    }

    return agents.map(a => a.getManifest());
  }

  /**
   * Search agents by name or description
   * @param {string} query - Search query
   * @returns {Array} - Array of agent manifests
   */
  search(query) {
    const lowerQuery = query.toLowerCase();
    const agents = Array.from(this.agents.values());

    const results = agents.filter(agent => {
      const name = agent.manifest.name.toLowerCase();
      const desc = agent.manifest.description.toLowerCase();
      const capabilities = agent.manifest.capabilities.join(' ').toLowerCase();

      return name.includes(lowerQuery) ||
             desc.includes(lowerQuery) ||
             capabilities.includes(lowerQuery);
    });

    return results.map(a => a.getManifest());
  }

  /**
   * Find agents by capability
   * @param {string} capability - Capability to search for
   * @returns {Array} - Array of agent manifests
   */
  findByCapability(capability) {
    const agentIds = this.capabilityIndex.get(capability);

    if (!agentIds || agentIds.size === 0) {
      return [];
    }

    const agents = Array.from(agentIds)
      .map(id => this.agents.get(id))
      .filter(a => a && a.isActive);

    return agents.map(a => a.getManifest());
  }

  /**
   * Find best agent for a task (by capability and reputation)
   * @param {string|Array} capabilities - Required capabilities
   * @returns {Agent|null} - Best matching agent
   */
  findBestAgent(capabilities) {
    const capArray = Array.isArray(capabilities) ? capabilities : [capabilities];

    // Find agents that have ALL required capabilities
    let candidateIds = null;

    for (const cap of capArray) {
      const agentIds = this.capabilityIndex.get(cap);

      if (!agentIds || agentIds.size === 0) {
        return null; // No agents have this capability
      }

      if (candidateIds === null) {
        candidateIds = new Set(agentIds);
      } else {
        // Intersection: keep only agents that have this capability too
        candidateIds = new Set([...candidateIds].filter(id => agentIds.has(id)));
      }

      if (candidateIds.size === 0) {
        return null; // No agents have all required capabilities
      }
    }

    // Get agents and filter by active status
    const candidates = Array.from(candidateIds)
      .map(id => this.agents.get(id))
      .filter(a => a && a.isActive);

    if (candidates.length === 0) {
      return null;
    }

    // Sort by reputation and success rate
    candidates.sort((a, b) => {
      const scoreA = a.manifest.metadata.reputation * a.manifest.metadata.successRate;
      const scoreB = b.manifest.metadata.reputation * b.manifest.metadata.successRate;
      return scoreB - scoreA;
    });

    return candidates[0];
  }

  /**
   * Get agent statistics
   * @returns {Object} - Registry statistics
   */
  getStats() {
    const agents = Array.from(this.agents.values());

    return {
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.isActive).length,
      totalCalls: agents.reduce((sum, a) => sum + a.manifest.metadata.calls, 0),
      totalEarnings: agents.reduce((sum, a) => sum + a.manifest.metadata.totalEarnings, 0),
      capabilities: Array.from(this.capabilityIndex.keys()),
      averageReputation: agents.reduce((sum, a) => sum + a.manifest.metadata.reputation, 0) / agents.length || 0
    };
  }

  /**
   * Get trending agents (most calls in recent period)
   * @param {number} limit - Number of agents to return
   * @returns {Array} - Array of agent manifests
   */
  getTrending(limit = 10) {
    return this.list({ sortBy: 'calls', limit, activeOnly: true });
  }

  /**
   * Get top rated agents (by reputation)
   * @param {number} limit - Number of agents to return
   * @returns {Array} - Array of agent manifests
   */
  getTopRated(limit = 10) {
    return this.list({ sortBy: 'reputation', limit, activeOnly: true });
  }

  /**
   * Get top earning agents
   * @param {number} limit - Number of agents to return
   * @returns {Array} - Array of agent manifests
   */
  getTopEarning(limit = 10) {
    return this.list({ sortBy: 'earnings', limit, activeOnly: true });
  }

  /**
   * Get newly created agents
   * @param {number} limit - Number of agents to return
   * @returns {Array} - Array of agent manifests
   */
  getNewest(limit = 10) {
    return this.list({ sortBy: 'newest', limit, activeOnly: true });
  }

  /**
   * Get user's agents
   * @param {string} userId - User ID
   * @returns {Array} - Array of agent manifests
   */
  getUserAgents(userId) {
    return this.list({ userId });
  }

  /**
   * Clear all agents
   */
  clear() {
    this.agents.clear();
    this.capabilityIndex.clear();
    this.categoryIndex.clear();
    this.userAgents.clear();
  }

  /**
   * Export registry state to JSON
   */
  toJSON() {
    return {
      agents: Array.from(this.agents.entries()).map(([id, agent]) => [id, agent.toJSON()]),
      userAgents: Array.from(this.userAgents.entries()).map(([userId, ids]) => [userId, Array.from(ids)])
    };
  }

  /**
   * Import registry state from JSON
   */
  static fromJSON(json, Agent) {
    const registry = new AgentRegistry();

    for (const [id, agentData] of json.agents) {
      const agent = Agent.fromJSON(agentData);
      registry.agents.set(id, agent);

      // Rebuild indexes
      if (agent.manifest.capabilities) {
        for (const capability of agent.manifest.capabilities) {
          if (!registry.capabilityIndex.has(capability)) {
            registry.capabilityIndex.set(capability, new Set());
          }
          registry.capabilityIndex.get(capability).add(id);
        }
      }
    }

    for (const [userId, ids] of json.userAgents) {
      registry.userAgents.set(userId, new Set(ids));
    }

    return registry;
  }
}

// Singleton instance
const registry = new AgentRegistry();

module.exports = { AgentRegistry, registry };
