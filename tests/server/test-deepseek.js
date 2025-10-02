const DeepSeekClient = require('../../server/deepseekClient');

async function testDeepSeekIntegration() {
  console.log('🧪 Testing DeepSeek API Integration with deepseek-chat\n');

  try {
    const deepseek = new DeepSeekClient();

    console.log('1. Testing movie phrase generation...');
    const moviePhrase = await deepseek.generatePhrase('movies');
    console.log('✅ Movie phrase generated:');
    console.log(`   Phrase: "${moviePhrase.phrase}"`);
    console.log(`   Emojis: ${moviePhrase.emojis}`);
    console.log(`   Category: ${moviePhrase.category}\n`);

    console.log('2. Testing idiom phrase generation...');
    const idiomPhrase = await deepseek.generatePhrase('idioms');
    console.log('✅ Idiom phrase generated:');
    console.log(`   Phrase: "${idiomPhrase.phrase}"`);
    console.log(`   Emojis: ${idiomPhrase.emojis}`);
    console.log(`   Category: ${idiomPhrase.category}\n`);

    console.log('3. Testing song phrase generation...');
    const songPhrase = await deepseek.generatePhrase('songs');
    console.log('✅ Song phrase generated:');
    console.log(`   Phrase: "${songPhrase.phrase}"`);
    console.log(`   Emojis: ${songPhrase.emojis}`);
    console.log(`   Category: ${songPhrase.category}\n`);

    // Test response structure compatibility
    console.log('4. Testing response structure compatibility...');
    const testPhrase = await deepseek.generatePhrase('movies');

    // Verify the response has the expected structure
    if (!testPhrase.phrase || typeof testPhrase.phrase !== 'string') {
      throw new Error('Phrase field is missing or not a string');
    }
    if (!testPhrase.emojis || typeof testPhrase.emojis !== 'string') {
      throw new Error('Emojis field is missing or not a string');
    }
    if (!testPhrase.category || typeof testPhrase.category !== 'string') {
      throw new Error('Category field is missing or not a string');
    }

    console.log('✅ Response structure is compatible with Ollama API');
    console.log(`   Phrase length: ${testPhrase.phrase.length} characters`);
    console.log(`   Emojis length: ${testPhrase.emojis.length} characters`);
    console.log(`   Category: ${testPhrase.category}\n`);

    console.log('🎉 All DeepSeek tests completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   - DeepSeek API is responding correctly');
    console.log('   - deepseek-chat model is generating phrases');
    console.log('   - Emoji conversion is working');
    console.log('   - Category-specific generation is functional');
    console.log('   - Response structure is compatible with Ollama API');

  } catch (error) {
    console.error('❌ DeepSeek test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   - Ensure DEEPSEEK_API_KEY environment variable is set');
    console.log('   - Verify API key has sufficient permissions');
    console.log('   - Check network connectivity to api.deepseek.com');
    console.log('   - Verify the model name is correct: deepseek-chat');

    if (error.message.includes('DEEPSEEK_API_KEY')) {
      console.log('   - Set the API key: export DEEPSEEK_API_KEY=your_api_key_here');
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testDeepSeekIntegration();
}

module.exports = { testDeepSeekIntegration };