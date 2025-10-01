const Server = require('../../server/server');
const Database = require('../../server/database');

async function testEmptyCacheGeneration() {
  console.log('Testing phrase generation with empty cache...\n');

  // First, let's create a clean database with no phrases for our test category
  const db = new Database();
  await db.init();

  const testCategory = 'test-category';
  console.log(`Testing with category: ${testCategory}`);

  // Remove any existing phrases for this test category
  await db.deletePhrasesByCategory(testCategory);
  console.log(`Cleared existing phrases for category '${testCategory}'`);

  // Verify the category is empty
  const initialPhrases = await db.getAllPhrases(testCategory);
  console.log(`Initial phrases in database for category '${testCategory}': ${initialPhrases.length}`);

  if (initialPhrases.length > 0) {
    console.log('❌ ERROR: Category should be empty but contains phrases!');
    await db.close();
    return;
  }

  await db.close();

  // Now start the server and test
  const server = new Server();
  await server.start();

  // Wait a moment for server to be ready
  await new Promise(resolve => setTimeout(resolve, 1000));

  const baseUrl = 'http://localhost:3001';

  console.log('\n=== Testing Generation from Empty Cache ===');
  console.log('Making requests to generate phrases from scratch...');

  const generatedPhrases = new Set();
  const requestCount = 5; // Make a few requests to test generation

  for (let i = 0; i < requestCount; i++) {
    try {
      const response = await fetch(`${baseUrl}/api/phrases/random?category=${testCategory}`);
      const data = await response.json();

      if (response.ok) {
        const phraseId = data.id;
        const phraseText = data.phrase;
        const emojis = data.emojis;

        console.log(`Request ${i + 1}: Phrase ID ${phraseId} - "${phraseText}" (${emojis})`);

        if (generatedPhrases.has(phraseId)) {
          console.log(`  ⚠️  Duplicate phrase ID detected`);
        } else {
          generatedPhrases.add(phraseId);
          console.log(`  🆕 NEWLY GENERATED PHRASE!`);
        }
      } else {
        console.log(`Request ${i + 1}: Error ${response.status} - ${data.message || data.error}`);
        if (response.status === 503) {
          console.log(`  📭 No phrases available (this shouldn't happen with generation)`);
        }
      }
    } catch (error) {
      console.log(`Request ${i + 1}: Network error - ${error.message}`);
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Check final database state
  const finalDb = new Database();
  await finalDb.init();
  const finalPhrases = await finalDb.getAllPhrases(testCategory);

  console.log(`\n=== Test Results ===`);
  console.log(`Total requests made: ${requestCount}`);
  console.log(`Unique phrases received: ${generatedPhrases.size}`);
  console.log(`Final phrases in database: ${finalPhrases.length}`);
  console.log(`Phrases added to database: ${finalPhrases.length}`);

  if (generatedPhrases.size > 0 && finalPhrases.length > 0) {
    console.log('\n✅ SUCCESS: Phrases were generated from empty cache and returned to client!');
    console.log('Generated phrase IDs:', Array.from(generatedPhrases).join(', '));

    console.log('\nAll generated phrases:');
    finalPhrases.forEach((phrase, index) => {
      console.log(`  ${index + 1}. ID ${phrase.id}: "${phrase.phrase}" (${phrase.emojis})`);
    });
  } else {
    console.log('\n❌ FAILURE: No phrases were generated from empty cache!');
    console.log('This could mean:');
    console.log('  - Ollama is not running');
    console.log('  - There was an error in phrase generation');
    console.log('  - The generation logic has a bug');
  }

  // Cleanup
  await finalDb.close();
  await server.stop();
  process.exit(0);
}

// Add helper methods to Database class for testing
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

Database.prototype.deletePhrasesByCategory = async function(category) {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM phrases WHERE category = ?';

    this.db.run(query, [category], function(err) {
      if (err) {
        reject(err);
      } else {
        console.log(`Deleted ${this.changes} phrases for category '${category}'`);
        resolve({ changes: this.changes });
      }
    });
  });
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down test...');
  process.exit(0);
});

testEmptyCacheGeneration().catch(console.error);
