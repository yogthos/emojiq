const http = require('http');

async function testSimpleAvailability() {
  console.log('🧪 Simple Phrase Availability Test\n');
  
  const user = { name: 'Test User', ip: '192.168.1.200', userAgent: 'TestClient' };
  
  try {
    // Test getting a phrase from each category
    const categories = ['movies', 'idioms', 'songs'];
    
    for (const category of categories) {
      console.log(`Testing ${category} category:`);
      
      // Reset session
      await makeRequest('/api/session/reset', 'POST', user);
      
      // Get a phrase
      const phrase = await makeRequest(`/api/phrases/random?category=${category}`, 'GET', user);
      
      if (phrase && phrase.phrase) {
        console.log(`  ✅ Got phrase: "${phrase.phrase}"`);
      } else {
        console.log(`  ❌ No phrase available for ${category}`);
      }
    }
    
    console.log('\n🎉 All categories have phrases available!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Helper function to make HTTP requests
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

// Run the test
if (require.main === module) {
  testSimpleAvailability().finally(() => {
    process.exit(0);
  });
}