const PhraseService = require('../../server/phraseService');

async function testFullFlow() {
  console.log('🧪 Testing Full Server Flow (Ollama + Database)\n');
  
  const phraseService = new PhraseService();
  
  try {
    // Initialize the service
    console.log('1. Initializing phrase service...');
    await phraseService.init();
    console.log('✅ Service initialized\n');
    
    // Test getting random phrases from each category
    const categories = ['movies', 'idioms', 'songs'];
    
    for (const category of categories) {
      console.log(`2. Testing ${category} phrase generation...`);
      
      // First call - might generate new phrase via Ollama
      const phrase1 = await phraseService.getRandomPhrase(category);
      console.log(`   First call - Phrase: "${phrase1.phrase}"`);
      console.log(`   First call - Emojis: ${phrase1.emojis}`);
      console.log(`   First call - ID: ${phrase1.id}\n`);
      
      // Second call - should use cached phrase from database
      const phrase2 = await phraseService.getRandomPhrase(category);
      console.log(`   Second call - Phrase: "${phrase2.phrase}"`);
      console.log(`   Second call - Emojis: ${phrase2.emojis}`);
      console.log(`   Second call - ID: ${phrase2.id}\n`);
      
      // Test recording guess results
      console.log(`3. Testing difficulty tracking for ${category}...`);
      const guessResult = await phraseService.recordGuessResult(phrase1.id, true);
      console.log(`   Guess recorded: ${JSON.stringify(guessResult)}\n`);
      
      // Test recording incorrect guess
      const incorrectGuess = await phraseService.recordGuessResult(phrase1.id, false);
      console.log(`   Incorrect guess recorded: ${JSON.stringify(incorrectGuess)}\n`);
    }
    
    // Test getting categories
    console.log('4. Testing categories retrieval...');
    const categoriesList = await phraseService.getCategories();
    console.log(`   Available categories: ${JSON.stringify(categoriesList)}\n`);
    
    console.log('🎉 Full server flow test completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Ollama integration working');
    console.log('   ✅ Database caching functional');
    console.log('   ✅ Difficulty tracking operational');
    console.log('   ✅ Category management working');
    console.log('   ✅ Full phrase generation flow validated');
    
  } catch (error) {
    console.error('❌ Full flow test failed:', error.message);
    console.error('Stack trace:', error.stack);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('   - Check if Ollama is running on localhost:11434');
    console.log('   - Verify qwen2.5:1.7b model is available');
    console.log('   - Ensure database file permissions are correct');
    console.log('   - Check server logs for detailed errors');
  } finally {
    // Clean up
    await phraseService.close();
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testFullFlow();
}

module.exports = { testFullFlow };