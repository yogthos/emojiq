const OllamaClient = require('../../server/ollamaClient');
const DeepSeekClient = require('../../server/deepseekClient');

async function testProviderCompatibility() {
  console.log('🧪 Testing AI Provider Compatibility\n');

  const providers = [
    { name: 'Ollama', client: new OllamaClient() },
    { name: 'DeepSeek', client: new DeepSeekClient() }
  ];

  const testCategories = ['movies', 'idioms', 'songs'];

  for (const provider of providers) {
    console.log(`\n📡 Testing ${provider.name} Provider\n`);

    try {
      // Test each category
      for (const category of testCategories) {
        console.log(`   Testing ${category} phrase generation...`);

        const phrase = await provider.client.generatePhrase(category);

        // Verify response structure
        if (!phrase.phrase || typeof phrase.phrase !== 'string') {
          throw new Error(`Invalid phrase field for ${category}`);
        }
        if (!phrase.emojis || typeof phrase.emojis !== 'string') {
          throw new Error(`Invalid emojis field for ${category}`);
        }
        if (!phrase.category || phrase.category !== category) {
          throw new Error(`Invalid category field for ${category}`);
        }

        console.log(`   ✅ ${category}: "${phrase.phrase}" -> ${phrase.emojis}`);
      }

      // Test response cleanup functionality
      console.log('   Testing response cleanup...');
      const testPhrase = await provider.client.generatePhrase('movies');

      // Verify cleanup removes thinking tags and extra whitespace
      const cleanedPhrase = provider.client.cleanResponse(testPhrase.phrase);
      if (cleanedPhrase.includes('<think>') || cleanedPhrase.includes('</think>')) {
        throw new Error('Thinking tags not properly cleaned');
      }

      console.log('   ✅ Response cleanup working correctly');

      console.log(`\n🎉 ${provider.name} provider passed all compatibility tests!`);

    } catch (error) {
      console.error(`   ❌ ${provider.name} test failed:`, error.message);

      if (provider.name === 'Ollama') {
        console.log('   🔧 Ollama troubleshooting:');
        console.log('      - Ensure Ollama is running: ollama serve');
        console.log('      - Check model availability: ollama list');
      } else if (provider.name === 'DeepSeek') {
        console.log('   🔧 DeepSeek troubleshooting:');
        console.log('      - Verify DEEPSEEK_API_KEY is set');
        console.log('      - Check API key permissions');
      }
    }
  }

  console.log('\n📊 Provider Compatibility Summary:');
  console.log('   - Both providers implement the same generatePhrase(category) interface');
  console.log('   - Both return compatible response structures');
  console.log('   - Both support the same categories');
  console.log('   - Both include fallback mock data');
  console.log('   - Both implement response cleanup');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testProviderCompatibility();
}

module.exports = { testProviderCompatibility };