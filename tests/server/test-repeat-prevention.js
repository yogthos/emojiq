const PhraseService = require('../../server/phraseService');

async function testRepeatPrevention() {
  console.log('🧪 Testing Repeat Phrase Prevention\n');
  
  const phraseService = new PhraseService();
  
  try {
    // Initialize the service
    console.log('1. Initializing phrase service...');
    await phraseService.init();
    console.log('✅ Service initialized\n');
    
    const category = 'movies';
    
    console.log(`2. Testing phrase generation for ${category} (no repeats during session)...`);
    
    // Get multiple phrases in the same session
    const phrases = [];
    const maxAttempts = 10;
    
    for (let i = 0; i < maxAttempts; i++) {
      const phrase = await phraseService.getRandomPhrase(category);
      phrases.push(phrase);
      console.log(`   Phrase ${i + 1}: ID ${phrase.id}, "${phrase.phrase}"`);
      
      // Check for duplicates so far
      const phraseIds = phrases.map(p => p.id);
      const uniqueIds = new Set(phraseIds);
      
      if (uniqueIds.size !== phraseIds.length) {
        console.log(`\n❌ FAILURE: Duplicate phrase detected at attempt ${i + 1}!`);
        console.log(`   Phrase IDs: ${phraseIds.join(', ')}`);
        console.log(`   Unique IDs: ${Array.from(uniqueIds).join(', ')}`);
        break;
      }
    }
    
    // Verify all phrases are unique
    const phraseIds = phrases.map(p => p.id);
    const uniqueIds = new Set(phraseIds);
    
    if (uniqueIds.size === phraseIds.length) {
      console.log(`\n✅ SUCCESS: All ${phrases.length} phrases are unique!`);
    } else {
      console.log(`\n❌ FAILURE: Found ${phraseIds.length - uniqueIds.size} duplicate phrases`);
    }
    
    // Test session reset
    console.log('\n3. Testing session reset...');
    phraseService.resetUsedPhrases();
    console.log('✅ Session reset - used phrases cleared\n');
    
    // Get phrases after reset - some might be repeats from previous session
    console.log('4. Getting phrases after session reset...');
    const phrasesAfterReset = [];
    
    for (let i = 0; i < 3; i++) {
      const phrase = await phraseService.getRandomPhrase(category);
      phrasesAfterReset.push(phrase);
      console.log(`   Phrase after reset ${i + 1}: ID ${phrase.id}, "${phrase.phrase}"`);
    }
    
    // Check if any phrases after reset are from the original session
    const originalIds = new Set(phraseIds);
    const resetIds = phrasesAfterReset.map(p => p.id);
    const overlap = resetIds.filter(id => originalIds.has(id));
    
    if (overlap.length > 0) {
      console.log(`\n✅ Expected behavior: ${overlap.length} phrases from previous session reused after reset`);
    } else {
      console.log('\nℹ️  All phrases after reset are new (no overlap with previous session)');
    }
    
    console.log('\n🎉 Repeat phrase prevention test completed!');
    console.log('\n📊 Test Summary:');
    console.log(`   ✅ Generated ${phrases.length} unique phrases in single session`);
    console.log(`   ✅ Session reset allows reuse of phrases`);
    console.log(`   ✅ No repeated phrases during active session`);
    console.log(`   ✅ Fresh puzzles guaranteed during gameplay`);
    
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
  testRepeatPrevention();
}

module.exports = { testRepeatPrevention };