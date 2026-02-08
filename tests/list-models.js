require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    console.log('Fetching available models...\n');

    // List all available models
    const models = await genAI.listModels();

    console.log('✅ Available models:\n');
    for await (const model of models) {
      console.log(`Model: ${model.name}`);
      console.log(`  Display Name: ${model.displayName}`);
      console.log(`  Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
      console.log('');
    }
  } catch (error) {
    console.error('❌ Error listing models:', error.message);

    console.log('\nTrying to use common model names directly...\n');

    // Try common model names
    const commonModels = [
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-pro',
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash-latest'
    ];

    for (const modelName of commonModels) {
      try {
        console.log(`Testing: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say hello');
        const response = await result.response;
        console.log(`✅ ${modelName} WORKS!`);
        console.log(`   Response: ${response.text()}`);
        return;
      } catch (err) {
        console.log(`❌ ${modelName} failed: ${err.message.split('\n')[0]}`);
      }
    }
  }
}

listModels().catch(console.error);
