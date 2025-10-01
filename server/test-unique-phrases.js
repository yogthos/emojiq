const Server = require('./server');

async function testUniquePhrases() {
  console.log('Testing unique phrase functionality...\n');

  const server = new Server();
  await server.start();

  // Wait a moment for server to be ready
  await new Promise(resolve => setTimeout(resolve, 1000));

  const baseUrl = 'http://localhost:3001';
  let usedPhrases = new Set();
  let duplicateCount = 0;
  const totalRequests = 20;

  console.log(`Making ${totalRequests} requests to /api/phrases/random...`);

  for (let i = 0; i < totalRequests; i++) {
    try {
      const response = await fetch(`${baseUrl}/api/phrases/random`);
      const data = await response.json();

      if (response.ok) {
        const phraseId = data.id;
        console.log(`Request ${i + 1}: Phrase ID ${phraseId} - "${data.phrase}"`);

        if (usedPhrases.has(phraseId)) {
          duplicateCount++;
          console.log(`  ❌ DUPLICATE DETECTED! Phrase ID ${phraseId} was already used`);
        } else {
          usedPhrases.add(phraseId);
          console.log(`  ✅ New phrase`);
        }
      } else {
        console.log(`Request ${i + 1}: Error ${response.status} - ${data.message || data.error}`);
      }
    } catch (error) {
      console.log(`Request ${i + 1}: Network error - ${error.message}`);
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n=== Test Results ===`);
  console.log(`Total requests: ${totalRequests}`);
  console.log(`Unique phrases received: ${usedPhrases.size}`);
  console.log(`Duplicates detected: ${duplicateCount}`);
  console.log(`Success rate: ${((totalRequests - duplicateCount) / totalRequests * 100).toFixed(1)}%`);

  if (duplicateCount === 0) {
    console.log('✅ SUCCESS: No duplicate phrases detected!');
  } else {
    console.log('❌ FAILURE: Duplicate phrases were detected!');
  }

  // Test session reset functionality
  console.log('\n=== Testing Session Reset ===');
  try {
    const resetResponse = await fetch(`${baseUrl}/api/session/reset`, { method: 'POST' });
    const resetData = await resetResponse.json();
    console.log('Session reset response:', resetData);

    // Make a few more requests after reset
    console.log('\nMaking requests after session reset...');
    for (let i = 0; i < 3; i++) {
      const response = await fetch(`${baseUrl}/api/phrases/random`);
      const data = await response.json();
      if (response.ok) {
        console.log(`Post-reset request ${i + 1}: Phrase ID ${data.id} - "${data.phrase}"`);
      }
    }
  } catch (error) {
    console.log('Error testing session reset:', error.message);
  }

  // Cleanup
  await server.stop();
  process.exit(0);
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down test...');
  process.exit(0);
});

testUniquePhrases().catch(console.error);
