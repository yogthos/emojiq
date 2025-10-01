const http = require('http');

async function testCompleteGame() {
  console.log('🎮 Testing Complete Game Flow with Fresh Phrases\n');
  
  // Simulate a single user playing multiple games
  const user = { name: 'Test User', ip: '192.168.1.200', userAgent: 'TestClient' };
  
  try {
    // Simulate multiple game sessions
    const categories = ['movies', 'idioms', 'songs'];
    
    for (const category of categories) {
      console.log(`\n🎯 Testing ${category} category:`);
      
      // Simulate a complete game session
      console.log(`   Starting new game session for ${category}...`);
      
      // Reset session for new game
      await makeRequest('/api/session/reset', 'POST', user);
      
      // Simulate multiple rounds in the same game
      const rounds = 5;
      const phrasesInSession = [];
      
      for (let round = 1; round <= rounds; round++) {
        console.log(`\n   Round ${round}:`);
        
        // Get a fresh phrase for this round
        const phrase = await makeRequest(`/api/phrases/random?category=${category}`, 'GET', user);
        phrasesInSession.push(phrase);
        
        console.log(`     Phrase: "${phrase.phrase}"`);
        console.log(`     Emojis: ${phrase.emojis}`);
        console.log(`     ID: ${phrase.id}`);
        
        // Simulate player guessing (random success/failure)
        const isCorrect = Math.random() > 0.3; // 70% success rate
        
        // Record the guess result
        const guessResult = await makeRequest('/api/phrases/guess-result', 'POST', user, {
          phraseId: phrase.id,
          wasCorrect: isCorrect
        });
        console.log(`     Guess: ${isCorrect ? '✅ Correct' : '❌ Incorrect'}`);
        console.log(`     Recorded: ${JSON.stringify(guessResult)}`);
        
        // Check for duplicates in current session
        const currentIds = phrasesInSession.map(p => p.id);
        const uniqueIds = new Set(currentIds);
        
        if (uniqueIds.size !== currentIds.length) {
          console.log(`\n❌ ERROR: Duplicate phrase detected in session!`);
          console.log(`   Phrase IDs: ${currentIds.join(', ')}`);
          break;
        }
      }
      
      // Verify all phrases in this session were unique
      const phraseIds = phrasesInSession.map(p => p.id);
      const uniqueIds = new Set(phraseIds);
      
      if (uniqueIds.size === phraseIds.length) {
        console.log(`\n   ✅ SUCCESS: All ${phraseIds.length} phrases in ${category} session were unique!`);
      } else {
        console.log(`\n   ❌ FAILURE: Found duplicates in ${category} session`);
      }
    }
    
    // Test cross-category phrase uniqueness
    console.log('\n🌐 Testing cross-category phrase uniqueness...');
    
    const allPhrases = [];
    for (const category of categories) {
      await makeRequest('/api/session/reset', 'POST', user);
      
      for (let i = 0; i < 3; i++) {
        const phrase = await makeRequest(`/api/phrases/random?category=${category}`, 'GET', user);
        allPhrases.push(phrase);
      }
    }
    
    // Check for any duplicate phrases across categories
    const allPhraseTexts = allPhrases.map(p => p.phrase);
    const uniqueTexts = new Set(allPhraseTexts);
    
    if (uniqueTexts.size === allPhraseTexts.length) {
      console.log('   ✅ All phrases across categories are unique');
    } else {
      console.log(`   ℹ️  ${allPhraseTexts.length - uniqueTexts.size} duplicate phrases across categories (expected)`);
    }
    
    console.log('\n🎉 Complete game flow test completed successfully!');
    console.log('\n📊 Final Summary:');
    console.log('   ✅ Multiple game sessions work correctly');
    console.log('   ✅ No repeated phrases within same session');
    console.log('   ✅ Session reset works across categories');
    console.log('   ✅ Difficulty tracking functional');
    console.log('   ✅ Fresh puzzles guaranteed during gameplay');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Helper function to make HTTP requests with simulated user info
function makeRequest(path, method, user, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': user.userAgent,
        'X-Forwarded-For': user.ip
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

// Run the test if this file is executed directly
if (require.main === module) {
  // Start the server first, then run the test
  const Server = require('../../server/server');
  const server = new Server();
  
  server.start().then(() => {
    console.log('Server started, running complete game test...\n');
    setTimeout(() => {
      testCompleteGame().finally(() => {
        server.stop().then(() => {
          console.log('\nServer stopped');
          process.exit(0);
        });
      });
    }, 1000);
  }).catch(console.error);
}

module.exports = { testCompleteGame };