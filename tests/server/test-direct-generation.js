const PhraseService = require('./phraseService');
const Database = require('./database');

async function testDirectGeneration() {
  console.log('Testing phrase generation directly...\n');

  const phraseService = new PhraseService();
  await phraseService.init();

  const testCategory = 'test-direct';

  // First, let's clear any existing phrases for this test category
  const db = new Database();
  await db.init();
  await db.deletePhrasesByCategory(testCategory);

  // Verify the category is empty
  const initialPhrases = await db.getAllPhrases(testCategory);
  console.log(`Initial phrases in database for category '${testCategory}': ${initialPhrases.length}`);

  if (initialPhrases.length > 0) {
    console.log('❌ ERROR: Category should be empty but contains phrases!');
    await db.close();
    return;
  }

  await db.close();

  console.log('\n=== Testing Direct Phrase Generation ===');
  console.log('Calling getRandomPhrase with empty cache...');

  const generatedPhrases = new Set();
  const requestCount = 3; // Make a few requests to test generation

  for (let i = 0; i < requestCount; i++) {
    try {
      console.log(`\nRequest ${i + 1}:`);
      console.log('  Calling phraseService.getRandomPhrase...');

      const phrase = await phraseService.getRandomPhrase(testCategory, []);

      if (phrase) {
        const phraseId = phrase.id;
        const phraseText = phrase.phrase;
        const emojis = phrase.emojis;

        console.log(`  ✅ SUCCESS: Phrase ID ${phraseId} - "${phraseText}" (${emojis})`);

        if (generatedPhrases.has(phraseId)) {
          console.log(`  ⚠️  Duplicate phrase ID detected`);
        } else {
          generatedPhrases.add(phraseId);
          console.log(`  🆕 NEWLY GENERATED PHRASE!`);
        }
      } else {
        console.log(`  ❌ FAILURE: No phrase returned`);
      }
    } catch (error) {
      console.log(`  ❌ ERROR: ${error.message}`);
      console.log(`  Stack: ${error.stack}`);
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
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
    console.log('\n✅ SUCCESS: Phrases were generated from empty cache!');
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
  await phraseService.close();
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

testDirectGeneration().catch(console.error);
