const Server = require('./server');

async function testMultiSessionUnique() {
  console.log('Testing unique phrases across multiple sessions...\n');

  const server = new Server();
  await server.start();

  // Wait a moment for server to be ready
  await new Promise(resolve => setTimeout(resolve, 1000));

  const baseUrl = 'http://localhost:3001';
  const numSessions = 3;
  const requestsPerSession = 10;
  let allUsedPhrases = new Set();
  let duplicateCount = 0;

  console.log(`Testing ${numSessions} concurrent sessions with ${requestsPerSession} requests each...\n`);

  // Create multiple "sessions" by using different cookie values
  const sessions = [];
  for (let i = 0; i < numSessions; i++) {
    sessions.push({
      id: `session-${i}`,
      cookie: `sessionId=test-session-${i}`,
      usedPhrases: new Set()
    });
  }

  // Make requests from each session
  const sessionPromises = sessions.map(async (session, sessionIndex) => {
    console.log(`Session ${sessionIndex + 1} starting...`);

    for (let i = 0; i < requestsPerSession; i++) {
      try {
        const response = await fetch(`${baseUrl}/api/phrases/random`, {
          headers: {
            'Cookie': session.cookie
          }
        });
        const data = await response.json();

        if (response.ok) {
          const phraseId = data.id;
          console.log(`  Session ${sessionIndex + 1}, Request ${i + 1}: Phrase ID ${phraseId} - "${data.phrase}"`);

          // Check for duplicates within this session
          if (session.usedPhrases.has(phraseId)) {
            duplicateCount++;
            console.log(`    ❌ DUPLICATE within session!`);
          } else {
            session.usedPhrases.add(phraseId);
          }

          // Check for duplicates across all sessions
          if (allUsedPhrases.has(phraseId)) {
            duplicateCount++;
            console.log(`    ❌ DUPLICATE across sessions!`);
          } else {
            allUsedPhrases.add(phraseId);
          }
        } else {
          console.log(`  Session ${sessionIndex + 1}, Request ${i + 1}: Error ${response.status} - ${data.message || data.error}`);
        }
      } catch (error) {
        console.log(`  Session ${sessionIndex + 1}, Request ${i + 1}: Network error - ${error.message}`);
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log(`Session ${sessionIndex + 1} completed. Used phrases: ${session.usedPhrases.size}`);
  });

  // Wait for all sessions to complete
  await Promise.all(sessionPromises);

  console.log(`\n=== Multi-Session Test Results ===`);
  console.log(`Total sessions: ${numSessions}`);
  console.log(`Requests per session: ${requestsPerSession}`);
  console.log(`Total requests: ${numSessions * requestsPerSession}`);
  console.log(`Total unique phrases across all sessions: ${allUsedPhrases.size}`);
  console.log(`Duplicates detected: ${duplicateCount}`);
  console.log(`Success rate: ${((numSessions * requestsPerSession - duplicateCount) / (numSessions * requestsPerSession) * 100).toFixed(1)}%`);

  // Show session breakdown
  console.log(`\nSession breakdown:`);
  sessions.forEach((session, index) => {
    console.log(`  Session ${index + 1}: ${session.usedPhrases.size} unique phrases`);
  });

  if (duplicateCount === 0) {
    console.log('✅ SUCCESS: No duplicate phrases detected across sessions!');
  } else {
    console.log('❌ FAILURE: Duplicate phrases were detected!');
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

testMultiSessionUnique().catch(console.error);
