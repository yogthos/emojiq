const Database = require('./database');

async function cleanupDatabase() {
  const db = new Database();
  
  try {
    await db.init();
    
    console.log('Cleaning up duplicate phrases...');
    
    // Remove duplicates, keeping the first occurrence
    const cleanupSQL = `
      DELETE FROM phrases 
      WHERE id NOT IN (
        SELECT MIN(id) 
        FROM phrases 
        GROUP BY phrase, category
      )
    `;
    
    await new Promise((resolve, reject) => {
      db.db.run(cleanupSQL, function(err) {
        if (err) reject(err);
        else {
          console.log(`Removed ${this.changes} duplicate phrases`);
          resolve();
        }
      });
    });
    
    // Count remaining phrases
    const count = await new Promise((resolve, reject) => {
      db.db.get('SELECT COUNT(*) as count FROM phrases', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    
    console.log(`Remaining unique phrases: ${count}`);
    
  } catch (error) {
    console.error('Error cleaning up database:', error);
  } finally {
    await db.close();
  }
}

if (require.main === module) {
  cleanupDatabase();
}