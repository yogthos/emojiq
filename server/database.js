const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('./config');

class Database {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const dbPath = config.databasePath;
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS phrases (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          phrase TEXT NOT NULL,
          emojis TEXT NOT NULL,
          category TEXT NOT NULL,
          difficulty INTEGER DEFAULT 5,
          correct_guesses INTEGER DEFAULT 0,
          total_attempts INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(phrase, category)
        )
      `;

      this.db.run(createTableSQL, (err) => {
        if (err) {
          console.error('Error creating table:', err);
          reject(err);
        } else {
          console.log('Phrases table ready');
          resolve();
        }
      });
    });
  }

  async getRandomPhrase(category = null, excludeIds = []) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM phrases';
      let params = [];
      let conditions = [];

      if (category) {
        conditions.push('category = ?');
        params.push(category);
      }

      if (excludeIds.length > 0) {
        const placeholders = excludeIds.map(() => '?').join(',');
        conditions.push(`id NOT IN (${placeholders})`);
        params.push(...excludeIds);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY RANDOM() LIMIT 1';

      this.db.get(query, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async insertPhrase(phrase, emojis, category) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO phrases (phrase, emojis, category)
        VALUES (?, ?, ?)
      `;

      this.db.run(query, [phrase, emojis, category], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, phrase, emojis, category });
        }
      });
    });
  }

  async updateGuessStats(phraseId, wasCorrect) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE phrases 
        SET 
          correct_guesses = correct_guesses + ?,
          total_attempts = total_attempts + 1,
          difficulty = CASE 
            WHEN total_attempts + 1 >= 5 THEN 
              CASE 
                WHEN (correct_guesses + ?) / (total_attempts + 1.0) > 0.8 THEN 1
                WHEN (correct_guesses + ?) / (total_attempts + 1.0) > 0.6 THEN 3
                WHEN (correct_guesses + ?) / (total_attempts + 1.0) > 0.4 THEN 5
                WHEN (correct_guesses + ?) / (total_attempts + 1.0) > 0.2 THEN 7
                ELSE 10
              END
            ELSE difficulty
          END
        WHERE id = ?
      `;

      const correctIncrement = wasCorrect ? 1 : 0;
      
      this.db.run(query, [
        correctIncrement, 
        correctIncrement, 
        correctIncrement, 
        correctIncrement, 
        correctIncrement,
        phraseId
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  async getCategories() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT DISTINCT category FROM phrases ORDER BY category';
      
      this.db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const categories = rows.map(row => row.category);
          resolve(categories);
        }
      });
    });
  }

  async close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Database connection closed');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = Database;