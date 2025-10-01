const Database = require('./database');

async function checkPhrases() {
  const db = new Database();
  
  try {
    await db.init();
    
    // Get all phrases
    const phrases = await new Promise((resolve, reject) => {
      db.db.all('SELECT * FROM phrases ORDER BY category, id', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log(`Total phrases in database: ${phrases.length}`);
    console.log('\nPhrases by category:');
    
    const byCategory = {};
    phrases.forEach(phrase => {
      if (!byCategory[phrase.category]) {
        byCategory[phrase.category] = [];
      }
      byCategory[phrase.category].push(phrase);
    });
    
    Object.keys(byCategory).forEach(category => {
      console.log(`\n${category}: ${byCategory[category].length} phrases`);
      byCategory[category].forEach(phrase => {
        console.log(`  ID ${phrase.id}: "${phrase.phrase}" -> ${phrase.emojis}`);
      });
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.close();
  }
}

if (require.main === module) {
  checkPhrases();
}