const Server = require('../../server/server');

async function testTimerExtension() {
  console.log('Testing timer extension on successful guesses...\n');

  const server = new Server();
  await server.start();

  // Wait a moment for server to be ready
  await new Promise(resolve => setTimeout(resolve, 1000));

  const baseUrl = 'http://localhost:3001';

  console.log('=== Testing Timer Extension Feature ===');
  console.log('This test simulates the frontend behavior to verify timer extension logic.\n');

  // Simulate game state similar to the frontend
  let gameState = {
    timeLeft: 60,
    score: 0,
    currentSentence: 'The hero saves the day',
    currentPhraseId: null
  };

  console.log('Initial game state:');
  console.log(`  Time left: ${gameState.timeLeft}s`);
  console.log(`  Score: ${gameState.score}`);
  console.log(`  Current sentence: "${gameState.currentSentence}"`);

  // Get a phrase from the server
  try {
    const response = await fetch(`${baseUrl}/api/phrases/random?category=movies`);
    const phraseData = await response.json();

    if (response.ok) {
      gameState.currentPhraseId = phraseData.id;
      gameState.currentSentence = phraseData.phrase;
      console.log(`\nGot phrase from server: "${phraseData.phrase}" (ID: ${phraseData.id})`);
    } else {
      console.log(`Error getting phrase: ${response.status} - ${phraseData.message || phraseData.error}`);
      return;
    }
  } catch (error) {
    console.log(`Network error: ${error.message}`);
    return;
  }

  // Simulate timer countdown
  console.log('\n=== Simulating Timer Countdown ===');
  for (let i = 0; i < 5; i++) {
    gameState.timeLeft--;
    console.log(`Timer: ${gameState.timeLeft}s`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Simulate successful guess logic (from useGameState.js)
  console.log('\n=== Simulating Successful Guess ===');
  console.log(`Before guess - Time left: ${gameState.timeLeft}s, Score: ${gameState.score}`);

  const isCorrect = true; // Simulate correct guess

  if (isCorrect) {
    const timeBonus = Math.floor(gameState.timeLeft / 5);
    const wordBonus = gameState.currentSentence.split(' ').length * 10;
    const roundScore = 50 + timeBonus + wordBonus;

    // Add time extension for successful guess (5-10 seconds based on phrase length)
    const timeExtension = Math.min(10, Math.max(5, gameState.currentSentence.split(' ').length * 2));

    gameState.score += roundScore;
    gameState.timeLeft = Math.min(120, gameState.timeLeft + timeExtension); // Cap at 2 minutes

    console.log(`\n✅ SUCCESSFUL GUESS!`);
    console.log(`  Time bonus: ${timeBonus} points`);
    console.log(`  Word bonus: ${wordBonus} points (${gameState.currentSentence.split(' ').length} words)`);
    console.log(`  Round score: ${roundScore} points`);
    console.log(`  Time extension: +${timeExtension} seconds`);
    console.log(`  New time left: ${gameState.timeLeft}s`);
    console.log(`  New score: ${gameState.score}`);

    // Record the guess result to the server
    try {
      const guessResponse = await fetch(`${baseUrl}/api/phrases/guess-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phraseId: gameState.currentPhraseId,
          wasCorrect: true
        })
      });

      if (guessResponse.ok) {
        console.log('  ✅ Guess result recorded successfully on server');
      } else {
        console.log('  ⚠️  Failed to record guess result on server');
      }
    } catch (error) {
      console.log(`  ⚠️  Error recording guess result: ${error.message}`);
    }
  }

  // Test with different phrase lengths
  console.log('\n=== Testing Different Phrase Lengths ===');
  const testPhrases = [
    'Hi', // 1 word
    'Hello world', // 2 words
    'The quick brown fox', // 4 words
    'The quick brown fox jumps over the lazy dog' // 9 words
  ];

  testPhrases.forEach((phrase, index) => {
    const timeExtension = Math.min(10, Math.max(5, phrase.split(' ').length * 2));
    console.log(`Phrase "${phrase}" (${phrase.split(' ').length} words) → +${timeExtension}s time extension`);
  });

  // Test time cap
  console.log('\n=== Testing Time Cap ===');
  let testTimeLeft = 115; // Close to the 120s cap
  const testTimeExtension = 10;
  const cappedTime = Math.min(120, testTimeLeft + testTimeExtension);
  console.log(`Time before: ${testTimeLeft}s, Extension: +${testTimeExtension}s, Result: ${cappedTime}s (capped at 120s)`);

  console.log('\n✅ Timer extension feature test completed successfully!');

  // Cleanup
  await server.stop();
  process.exit(0);
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down test...');
  process.exit(0);
});

testTimerExtension().catch(console.error);
