const { BOT_TEMPLATES, getTemplateMenu, TEMPLATE_MAP } = require('./botTemplates');
const BotRegistry = require('../bots/botRegistry');
const Logger = require('../utils/logger');

class BotCreationService {
  constructor(walletService) {
    this.sessions = new Map(); // userId -> session state
    this.walletService = walletService;
  }

  /**
   * Start bot creation session - show template menu
   */
  startSession(userId) {
    this.sessions.set(userId, {
      step: 'select-template',
      data: {},
      paramIndex: 0
    });

    return getTemplateMenu();
  }

  /**
   * Handle user message in creation flow
   */
  async handleMessage(userId, message) {
    const session = this.sessions.get(userId);
    if (!session) return null;

    try {
      switch (session.step) {
        case 'select-template':
          return this.handleTemplateSelection(userId, session, message.trim());

        case 'collect-param':
          return this.handleParameterInput(userId, session, message.trim());

        case 'name':
          return this.handleName(userId, session, message.trim());

        case 'price':
          return this.handlePrice(userId, session, message.trim());

        default:
          return null;
      }
    } catch (error) {
      Logger.error('Bot creation error', { userId, step: session.step, error: error.message });
      this.sessions.delete(userId);
      return `❌ Error: ${error.message}\n\nTry again with /create_bot`;
    }
  }

  handleTemplateSelection(userId, session, message) {
    const templateKey = TEMPLATE_MAP[message];

    if (!templateKey) {
      return '❌ Invalid selection. Reply with a number (1-7):';
    }

    const template = BOT_TEMPLATES[templateKey];
    session.data.templateKey = templateKey;
    session.data.template = template;
    session.data.params = {};

    Logger.info('Template selected', { userId, template: templateKey });

    // If template has no parameters, go straight to naming
    if (template.parameters.length === 0) {
      session.step = 'name';
      return `${template.icon} <b>${template.name}</b> selected!\n\nWhat should I call your bot?\n\nExample: "${template.name} Pro"`;
    }

    // Start collecting parameters
    session.paramIndex = 0;
    session.step = 'collect-param';

    return `${template.icon} <b>${template.name}</b> selected!\n\n${template.parameters[0].prompt}`;
  }

  handleParameterInput(userId, session, message) {
    const template = session.data.template;
    const currentParam = template.parameters[session.paramIndex];

    // Validate required params
    if (currentParam.required && (!message || message.length < 1)) {
      return `❌ This field is required.\n\n${currentParam.prompt}`;
    }

    // Store parameter value
    session.data.params[currentParam.name] = message;

    Logger.info('Parameter collected', {
      userId,
      param: currentParam.name,
      value: message
    });

    // Check if there are more parameters
    session.paramIndex++;
    if (session.paramIndex < template.parameters.length) {
      const nextParam = template.parameters[session.paramIndex];
      return nextParam.prompt;
    }

    // All parameters collected, move to naming
    session.step = 'name';
    return `Great! What should I call your bot?\n\nExample: "${template.name} Pro"`;
  }

  handleName(userId, session, message) {
    if (message.length < 2 || message.length > 50) {
      return '❌ Bot name must be 2-50 characters. Try again:';
    }

    session.data.name = message;
    session.step = 'price';

    return `<b>${message}</b> - got it!\n\nHow much should it cost per call? (in STX)\n\nExamples:\n• 0.001 (cheap)\n• 0.01 (standard)\n• 0.05 (premium)\n\nEnter price:`;
  }

  handlePrice(userId, session, message) {
    const price = parseFloat(message);

    if (isNaN(price) || price < 0.001 || price > 1) {
      return '❌ Price must be between 0.001 and 1 STX. Try again:';
    }

    session.data.price = price;

    // Auto-assign user's platform wallet
    const wallet = this.walletService.getWallet(userId);
    if (!wallet) {
      this.sessions.delete(userId);
      return '❌ No wallet found. Use /start first to generate your wallet.';
    }

    session.data.wallet = wallet.address;

    // Create the bot
    return this.createBot(userId, session.data);
  }

  /**
   * Create bot from template with user's parameters
   */
  createBot(userId, sessionData) {
    const template = sessionData.template;
    const templateKey = sessionData.templateKey;
    const userParams = sessionData.params;

    // Build handler as closure capturing user's template params
    const templateHandler = template.handler;
    const handler = async (taskData) => {
      return await templateHandler(taskData, userParams);
    };

    // Build bot metadata
    const description = template.buildDescription(userParams);
    const capabilities = template.buildCapabilities(userParams);
    const botId = `user-${userId}-${Date.now()}`;

    // Register bot
    BotRegistry.registerSpecialistBot({
      id: botId,
      name: sessionData.name,
      description: description,
      capabilities: capabilities,
      pricePerCall: sessionData.price,
      walletAddress: sessionData.wallet,
      handler: handler,
      createdBy: userId,
      createdAt: Date.now(),
      template: templateKey,
      templateParams: userParams
    });

    this.sessions.delete(userId);

    Logger.success('Bot created from template', {
      userId,
      botId,
      template: templateKey,
      name: sessionData.name,
      capabilities
    });

    return `✅ <b>${sessionData.name} is LIVE!</b>

🤖 <b>Bot ID:</b> <code>${botId}</code>
💰 <b>Price:</b> ${sessionData.price} STX/call
📊 <b>Type:</b> ${template.icon} ${template.name}
🎯 <b>Capabilities:</b> ${capabilities.join(', ')}
👛 <b>Earnings to:</b> <code>${sessionData.wallet.substring(0, 10)}...</code>
🔗 <b>Real API:</b> ${template.description}

<b>Your bot is in the marketplace!</b>
It will be hired automatically when users ask relevant questions.

<b>Try it:</b> Ask a question your bot can answer!
<b>Check earnings:</b> /my_bots`;
  }

  /**
   * Cancel bot creation session
   */
  cancelSession(userId) {
    this.sessions.delete(userId);
    return '❌ Bot creation cancelled.\n\nUse /create_bot to start again.';
  }

  /**
   * Check if user is in creation session
   */
  isInSession(userId) {
    return this.sessions.has(userId);
  }
}

module.exports = BotCreationService;
