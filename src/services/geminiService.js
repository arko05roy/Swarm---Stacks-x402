const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash" // Latest model with better free tier (2.5)
    });
  }

  /**
   * Route user query to appropriate specialist bots using LLM
   * @param {string} userQuery - The user's question
   * @param {Array} availableBots - List of available specialist bots
   * @returns {Array} Array of routing decisions with botId, reasoning, and params
   */
  async routeQuery(userQuery, availableBots) {
    const prompt = `You are a task routing AI. Given a user query, determine which specialist bots are needed.

Available bots (JSON):
${JSON.stringify(availableBots.map(b => ({
  id: b.id,
  name: b.name,
  capabilities: b.capabilities,
  description: b.description
})), null, 2)}

User query: "${userQuery}"

IMPORTANT: Return ONLY valid JSON array (no markdown, no explanation, no code blocks).
Format:
[
  {
    "botId": "bot-id",
    "reasoning": "why this bot is needed",
    "params": { "param1": "value1" }
  }
]

Rules:
1. For crypto prices, use params like { "coin": "bitcoin", "symbol": "bitcoin" } or { "coin": "ethereum", "symbol": "ethereum" }
2. For weather, use params like { "city": "London" } or { "city": "Paris" }
3. For translation, use params like { "text": "hello", "to": "spanish" }
4. For calculations, use params like { "expression": "15 * 23 + 7" }
5. For DeFi/TVL queries, use params like { "protocol": "stacks" } or { "protocol": "aave" }
6. For country info, use params like { "country": "Japan" }
7. Return empty array [] if query is unclear or not actionable
8. You can select multiple bots if the query needs multiple services
9. Prefer user-created bots over system bots if they match better (check capabilities)

Return ONLY the JSON array, nothing else:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean response (remove markdown code blocks if present)
      const cleaned = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      try {
        const parsed = JSON.parse(cleaned);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Gemini JSON parse error:', text);
        return []; // Fallback to empty array
      }
    } catch (error) {
      console.error('Gemini API error:', error.message);
      throw error;
    }
  }

  // NOTE: generateBotCode() and extractCapabilities() REMOVED
  // Bot creation now uses pre-built templates (botTemplates.js)
  // Gemini only handles query ROUTING, not code generation
}

module.exports = GeminiService;
