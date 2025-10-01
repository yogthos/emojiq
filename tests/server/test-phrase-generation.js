const Server = require('../../server/server');
const Database = require('../../server/database');

async function testPhraseGeneration() {
  console.log('Testing phrase generation when cache is exhausted...\n');

  const server = new Server();
  await server.start();

  // Wait a moment for server to be ready
  await new Promise(resolve => setTimeout(resolve, 1000));

  const baseUrl = 'http://localhost:3001';
  const testCategory = 'movies';

  console.log(`Testing phrase generation for category: ${testCategory}`);

  // First, let's see how many phrases exist in the database for this category
  const db = new Database();
  await db.init();

  // Get all phrases for the test category
  const allPhrases = await db.getAllPhrases(testCategory);
  console.log(`Initial phrases in database for category '${testCategory}': ${allPhrases.length}`);

  if (allPhrases.length > 0) {
    console.log('Sample phrases:');
    allPhrases.slice(0, 3).forEach((phrase, index) => {
      console.log(`  ${index + 1}. ID ${phrase.id}: "${phrase.phrase}"`);
    });
  }

  // Now let's make requests to exhaust the cache and force generation
  console.log('\n=== Testing Cache Exhaustion and New Generation ===');

  const usedPhrases = new Set();
  const generatedPhrases = new Set();
  let requestCount = 0;
  const maxRequests = 50; // Make enough requests to potentially exhaust cache

  console.log(`Making ${maxRequests} requests to exhaust cache and generate new phrases...`);

  for (let i = 0; i < maxRequests; i++) {
    try {
      const response = await fetch(`${baseUrl}/api/phrases/random?category=${testCategory}`);
      const data = await response.json();

      requestCount++;

      if (response.ok) {
        const phraseId = data.id;
        const phraseText = data.phrase;

        console.log(`Request ${requestCount}: Phrase ID ${phraseId} - "${phraseText}"`);

        if (usedPhrases.has(phraseId)) {
          console.log(`  ⚠️  Duplicate phrase ID detected (this shouldn't happen with our improvements)`);
        } else {
          usedPhrases.add(phraseId);

          // Check if this is a newly generated phrase (not in initial database)
          const isNewPhrase = !allPhrases.some(p => p.id === phraseId);
          if (isNewPhrase) {
            generatedPhrases.add(phraseId);
            console.log(`  🆕 NEWLY GENERATED PHRASE!`);
          } else {
            console.log(`  📚 Cached phrase`);
          }
        }
      } else {
        console.log(`Request ${requestCount}: Error ${response.status} - ${data.message || data.error}`);
        if (response.status === 503) {
          console.log(`  📭 All phrases exhausted for this category`);
          break;
        }
      }
    } catch (error) {
      console.log(`Request ${requestCount}: Network error - ${error.message}`);
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Check final database state
  const finalPhrases = await db.getAllPhrases(testCategory);
  console.log(`\n=== Test Results ===`);
  console.log(`Total requests made: ${requestCount}`);
  console.log(`Unique phrases received: ${usedPhrases.size}`);
  console.log(`Initial phrases in database: ${allPhrases.length}`);
  console.log(`Final phrases in database: ${finalPhrases.length}`);
  console.log(`New phrases generated: ${generatedPhrases.size}`);
  console.log(`Phrases added to database: ${finalPhrases.length - allPhrases.length}`);

  if (generatedPhrases.size > 0) {
    console.log('\n✅ SUCCESS: New phrases were generated and returned to client!');
    console.log('Generated phrase IDs:', Array.from(generatedPhrases).join(', '));
  } else {
    console.log('\n⚠️  No new phrases were generated during this test');
    console.log('This could mean:');
    console.log('  - The cache was not exhausted');
    console.log('  - Ollama is not running');
    console.log('  - There was an error in phrase generation');
  }

  // Show some of the newly generated phrases
  if (generatedPhrases.size > 0) {
    console.log('\nSample of newly generated phrases:');
    const newPhrases = finalPhrases.filter(p => generatedPhrases.has(p.id));
    newPhrases.slice(0, 5).forEach((phrase, index) => {
      console.log(`  ${index + 1}. ID ${phrase.id}: "${phrase.phrase}" (${phrase.emojis})`);
    });
  }

  // Cleanup
  await db.close();
  await server.stop();
  process.exit(0);
}

// Add getAllPhrases method to Database class for testing
Database.prototype.getAllPhrases = async function(category = null) {
  return new Promise((resolve, reject) => {
    let query = 'SELECT * FROM phrases';
    let params = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY id';

    this.db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down test...');
  process.exit(0);
});

testPhraseGeneration().catch(console.error);
