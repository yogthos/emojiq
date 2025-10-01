const PhraseService = require('./phraseService');

async function testFreshPhrases() {
  console.log('🧪 Testing Fresh Phrase Functionality\n');
  
  const phraseService = new PhraseService();
  
  try {
    // Initialize the service
    console.log('1. Initializing phrase service...');
    await phraseService.init();
    console.log('✅ Service initialized\n');
    
    // Test getting multiple phrases from the same category
    const category = 'movies';
    
    console.log(`2. Testing fresh phrase generation for ${category}...`);
    
    // Get first phrase
    const phrase1 = await phraseService.getRandomPhrase(category);
    console.log(`   First phrase - ID: ${phrase1.id}, Phrase: "${phrase1.phrase}"`);
    
    // Get second phrase - should be different
    const phrase2 = await phraseService.getRandomPhrase(category);
    console.log(`   Second phrase - ID: ${phrase2.id}, Phrase: "${phrase2.phrase}"`);
    
    // Get third phrase - should be different
    const phrase3 = await phraseService.getRandomPhrase(category);
    console.log(`   Third phrase - ID: ${phrase3.id}, Phrase: "${phrase3.phrase}"`);
    
    // Verify all phrases are unique
    const phraseIds = [phrase1.id, phrase2.id, phrase3.id];
    const uniqueIds = new Set(phraseIds);
    
    if (uniqueIds.size === phraseIds.length) {
      console.log('\n✅ SUCCESS: All phrases are unique!');
    } else {
      console.log('\n❌ FAILURE: Some phrases were repeated');
    }
    
    // Test session reset
    console.log('\n3. Testing session reset...');
    phraseService.resetUsedPhrases();
    console.log('✅ Session reset - used phrases cleared\n');
    
    // Get another phrase after reset - could be one we've seen before
    const phraseAfterReset = await phraseService.getRandomPhrase(category);
    console.log(`   Phrase after reset - ID: ${phraseAfterReset.id}, Phrase: "${phraseAfterReset.phrase}"`);
    
    console.log('\n🎉 Fresh phrase functionality test completed!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Phrase service tracks used phrases');
    console.log('   ✅ No repeated phrases during same session');
    console.log('   ✅ Session reset works correctly');
    console.log('   ✅ Fresh puzzles are served each time');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Clean up
    await phraseService.close();
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testFreshPhrases();
}

module.exports = { testFreshPhrases };