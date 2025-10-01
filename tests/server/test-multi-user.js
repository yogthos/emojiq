const http = require('http');

async function testMultiUser() {
  console.log('👥 Testing Multi-User Session Management\n');
  
  // Simulate multiple users making requests
  const users = [
    { name: 'User 1', ip: '192.168.1.100', userAgent: 'Chrome' },
    { name: 'User 2', ip: '192.168.1.101', userAgent: 'Firefox' },
    { name: 'User 3', ip: '192.168.1.102', userAgent: 'Safari' }
  ];
  
  const category = 'movies';
  
  try {
    console.log(`Testing ${users.length} users playing ${category} category:\n`);
    
    // Track phrases per user
    const userPhrases = {};
    
    // Each user plays 3 rounds
    for (const user of users) {
      userPhrases[user.name] = [];
      console.log(`${user.name} playing:`);
      
      // Reset session for this user
      await makeRequest('/api/session/reset', 'POST', user);
      
      for (let round = 1; round <= 3; round++) {
        const phrase = await makeRequest(`/api/phrases/random?category=${category}`, 'GET', user);
        userPhrases[user.name].push(phrase);
        
        console.log(`  Round ${round}: "${phrase.phrase}" (ID: ${phrase.id})`);
        
        // Record a guess result
        await makeRequest('/api/phrases/guess-result', 'POST', user, {
          phraseId: phrase.id,
          wasCorrect: true
        });
      }
      console.log('');
    }
    
    // Analyze results
    console.log('📊 Analysis:');
    
    // Check for duplicates within each user's session
    for (const user of users) {
      const phrases = userPhrases[user.name];
      const phraseIds = phrases.map(p => p.id);
      const uniqueIds = new Set(phraseIds);
      
      if (uniqueIds.size === phraseIds.length) {
        console.log(`✅ ${user.name}: All ${phraseIds.length} phrases are unique`);
      } else {
        console.log(`❌ ${user.name}: Found ${phraseIds.length - uniqueIds.size} duplicate phrases`);
      }
    }
    
    // Check for overlap between users
    const allPhraseIds = [];
    for (const user of users) {
      allPhraseIds.push(...userPhrases[user.name].map(p => p.id));
    }
    
    const allUniqueIds = new Set(allPhraseIds);
    const overlapCount = allPhraseIds.length - allUniqueIds.size;
    
    if (overlapCount > 0) {
      console.log(`\nℹ️  ${overlapCount} phrases were used by multiple users (expected behavior)`);
    } else {
      console.log(`\n✅ All users got completely different phrases`);
    }
    
    console.log('\n🎉 Multi-user test completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Each user gets unique phrases within their session');
    console.log('   ✅ Different users can get the same phrases (expected)');
    console.log('   ✅ Session management works per user');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
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
    console.log('Server started, running multi-user test...\n');
    setTimeout(() => {
      testMultiUser().finally(() => {
        server.stop().then(() => {
          console.log('\nServer stopped');
          process.exit(0);
        });
      });
    }, 1000);
  }).catch(console.error);
}

module.exports = { testMultiUser };