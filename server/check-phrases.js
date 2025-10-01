const Database = require('./database');

async function checkPhrases() {
  const db = new Database();
  
  try {
    await db.init();
    
    // Get category counts first to avoid loading all data at once
    const categoryCounts = await new Promise((resolve, reject) => {
      db.db.all('SELECT category, COUNT(*) as count FROM phrases GROUP BY category ORDER BY category', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('Phrases by category:');
    
    // Process each category separately to avoid memory issues
    for (const categoryRow of categoryCounts) {
      const category = categoryRow.category;
      const count = categoryRow.count;
      
      console.log(`\n${category}: ${count} phrases`);
      
      // Use pagination for large categories
      const pageSize = 50;
      let offset = 0;
      let hasMore = true;
      
      while (hasMore) {
        const phrases = await new Promise((resolve, reject) => {
          const query = 'SELECT id, phrase, emojis FROM phrases WHERE category = ? ORDER BY id LIMIT ? OFFSET ?';
          db.db.all(query, [category, pageSize, offset], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });
        
        if (phrases.length === 0) {
          hasMore = false;
          break;
        }
        
        // Display phrases for this page
        for (const phrase of phrases) {
          console.log(`  ID ${phrase.id}: "${phrase.phrase}" -> ${phrase.emojis}`);
        }
        
        offset += pageSize;
        
        // Stop if we've processed all phrases for this category
        if (phrases.length < pageSize) {
          hasMore = false;
        }
      }
    }
    
    // Show summary
    const totalPhrases = categoryCounts.reduce((sum, row) => sum + row.count, 0);
    console.log(`\nTotal phrases in database: ${totalPhrases}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.close();
  }
}

if (require.main === module) {
  checkPhrases();
}