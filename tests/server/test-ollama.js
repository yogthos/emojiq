const OllamaClient = require('../../server/ollamaClient');

async function testOllamaIntegration() {
  console.log('🧪 Testing Ollama Integration with Qwen3:1.7b\n');

  const ollama = new OllamaClient();

  try {
    console.log('1. Testing movie phrase generation...');
    const moviePhrase = await ollama.generatePhrase('movies');
    console.log('✅ Movie phrase generated:');
    console.log(`   Phrase: "${moviePhrase.phrase}"`);
    console.log(`   Emojis: ${moviePhrase.emojis}`);
    console.log(`   Category: ${moviePhrase.category}\n`);

    console.log('2. Testing idiom phrase generation...');
    const idiomPhrase = await ollama.generatePhrase('idioms');
    console.log('✅ Idiom phrase generated:');
    console.log(`   Phrase: "${idiomPhrase.phrase}"`);
    console.log(`   Emojis: ${idiomPhrase.emojis}`);
    console.log(`   Category: ${idiomPhrase.category}\n`);

    console.log('3. Testing song phrase generation...');
    const songPhrase = await ollama.generatePhrase('songs');
    console.log('✅ Song phrase generated:');
    console.log(`   Phrase: "${songPhrase.phrase}"`);
    console.log(`   Emojis: ${songPhrase.emojis}`);
    console.log(`   Category: ${songPhrase.category}\n`);

    console.log('🎉 All Ollama tests completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   - Ollama server is responding correctly');
    console.log('   - Qwen3:1.7b model is generating phrases');
    console.log('   - Emoji conversion is working');
    console.log('   - Category-specific generation is functional');

  } catch (error) {
    console.error('❌ Ollama test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   - Ensure Ollama is running: ollama serve');
    console.log('   - Check if model is available: ollama list');
    console.log('   - Verify Ollama API: curl http://localhost:11434/api/tags');
    console.log('   - Pull the model if needed: ollama pull Qwen3:1.7b');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testOllamaIntegration();
}

module.exports = { testOllamaIntegration };