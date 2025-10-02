const Database = require('./database');
const AIProvider = require('./aiProvider');

class PhraseService {
  constructor() {
    this.db = new Database();
    this.aiProvider = AIProvider.create();
    this.isInitialized = false;
    this.backgroundGenerationRunning = false;
    this.minPhraseThreshold = 20; // Minimum phrases per category to maintain
    this.maxBackgroundGeneration = 10; // Max phrases to generate in background
  }

  async init() {
    if (!this.isInitialized) {
      await this.db.init();
      this.isInitialized = true;
    }
  }

  async getRandomPhrase(category = null, excludeIds = []) {
    await this.init();

    // Trigger background generation if we're running low on phrases
    this.ensurePhraseAvailability(category).catch(console.error);

    // First try to get a cached phrase that hasn't been used
    let phrase = await this.db.getRandomPhrase(category, excludeIds);

    // If no unused cached phrase exists, try generating new ones
    if (!phrase) {
      console.log(`No unused cached phrases found for category: ${category || 'all'}, generating new ones...`);

      // Try to generate multiple phrases to increase chances of uniqueness
      const generateAttempts = 5;
      let generatedPhrases = [];
      let duplicateCount = 0;
      const maxDuplicatesBeforeStop = 3;

      for (let i = 0; i < generateAttempts; i++) {
        // Stop if we're getting too many duplicates
        if (duplicateCount >= maxDuplicatesBeforeStop) {
          console.log(`Too many duplicates for category ${category}, stopping generation attempts`);
          break;
        }

        try {
          const newPhrase = await this.aiProvider.generatePhrase(category || 'movies');
          const insertedPhrase = await this.db.insertPhrase(
            newPhrase.phrase,
            newPhrase.emojis,
            newPhrase.category
          );
          generatedPhrases.push(insertedPhrase);
          duplicateCount = 0; // Reset duplicate counter on success
        } catch (error) {
          if (error.message.includes('UNIQUE constraint failed')) {
            console.log(`Duplicate phrase detected during generation, skipping...`);
            duplicateCount++;
            continue;
          } else {
            console.error('Error generating phrase:', error);
            continue;
          }
        }
      }

      // Now try to get a phrase from the newly generated ones that's not in excludeIds
      if (generatedPhrases.length > 0) {
        const availablePhrases = generatedPhrases.filter(p => !excludeIds.includes(p.id));
        if (availablePhrases.length > 0) {
          phrase = availablePhrases[0];
        } else {
          // All generated phrases are excluded, try one more time with a fresh query
          phrase = await this.db.getRandomPhrase(category, excludeIds);
        }
      }
    }

    // If still no phrase found, return null (will be handled by the API endpoint)
    if (!phrase) {
      return null;
    }

    return {
      id: phrase.id,
      phrase: phrase.phrase,
      emojis: phrase.emojis,
      category: phrase.category
    };
  }

  async recordGuessResult(phraseId, wasCorrect) {
    await this.init();

    try {
      await this.db.updateGuessStats(phraseId, wasCorrect);
      return { success: true };
    } catch (error) {
      console.error('Error recording guess result:', error);
      return { success: false, error: error.message };
    }
  }

  async getCategories() {
    await this.init();

    try {
      const categories = await this.db.getCategories();

      // If no categories exist in DB, return default ones
      if (categories.length === 0) {
        return ['movies', 'idioms', 'songs'];
      }

      return categories;
    } catch (error) {
      if (error.message.includes('Database is closed') || error.code === 'SQLITE_MISUSE') {
        console.log('Database closed, returning default categories');
        return ['movies', 'idioms', 'songs'];
      }
      console.error('Error getting categories:', error);
      return ['movies', 'idioms', 'songs'];
    }
  }

  async getPhraseCountsByCategory() {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const query = 'SELECT category, COUNT(*) as count FROM phrases GROUP BY category';
      
      this.db.db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const counts = {};
          rows.forEach(row => {
            counts[row.category] = row.count;
          });
          resolve(counts);
        }
      });
    });
  }

  async needsMorePhrases(category = null) {
    const counts = await this.getPhraseCountsByCategory();
    
    if (category) {
      const categoryCount = counts[category] || 0;
      return categoryCount < this.minPhraseThreshold;
    } else {
      // Check all categories
      const categories = await this.getCategories();
      return categories.some(cat => {
        const categoryCount = counts[cat] || 0;
        return categoryCount < this.minPhraseThreshold;
      });
    }
  }

  async generatePhrasesInBackground(category = null) {
    if (this.backgroundGenerationRunning) {
      return; // Already running
    }

    this.backgroundGenerationRunning = true;
    console.log(`Starting background phrase generation for category: ${category || 'all'}`);

    try {
      // Check if database is still initialized
      if (!this.isInitialized) {
        console.log('Database not initialized, stopping background generation');
        return;
      }
      
      const categories = category ? [category] : await this.getCategories();
      
      for (const cat of categories) {
        // Check if we should stop before each category
        if (!this.backgroundGenerationRunning) {
          console.log('Background generation stopped');
          return;
        }
        
        const counts = await this.getPhraseCountsByCategory();
        const currentCount = counts[cat] || 0;
        
        if (currentCount < this.minPhraseThreshold) {
          const needed = Math.min(
            this.minPhraseThreshold - currentCount,
            this.maxBackgroundGeneration
          );
          
          console.log(`Generating ${needed} phrases for category: ${cat}`);
          
          let successfulGenerations = 0;
          let duplicateCount = 0;
          const maxDuplicatesBeforeStop = 5; // Stop if we get too many duplicates in a row

          for (let i = 0; i < needed && successfulGenerations < needed; i++) {
            // Check if we should stop before each phrase generation
            if (!this.backgroundGenerationRunning) {
              console.log('Background generation stopped');
              return;
            }

            // Stop if we're getting too many duplicates
            if (duplicateCount >= maxDuplicatesBeforeStop) {
              console.log(`Too many duplicates for category ${cat}, stopping generation for this category`);
              break;
            }

            try {
              const newPhrase = await this.aiProvider.generatePhrase(cat);
              await this.db.insertPhrase(
                newPhrase.phrase,
                newPhrase.emojis,
                newPhrase.category
              );
              console.log(`Generated phrase: "${newPhrase.phrase}" for ${cat}`);
              successfulGenerations++;
              duplicateCount = 0; // Reset duplicate counter on success
            } catch (error) {
              if (error.message.includes('UNIQUE constraint failed')) {
                console.log(`Duplicate phrase detected during background generation, skipping...`);
                duplicateCount++;
              } else if (error.message.includes('Database is closed') || error.code === 'SQLITE_MISUSE') {
                console.log('Database closed, stopping background generation');
                return;
              } else {
                console.error('Error generating phrase in background:', error);
              }
            }

            // Small delay to avoid overwhelming the LLM
            await new Promise(resolve => setTimeout(resolve, 500));
          }

          if (successfulGenerations < needed) {
            console.log(`Generated ${successfulGenerations}/${needed} phrases for ${cat} (stopped due to duplicates)`);
          }
        }
      }
    } catch (error) {
      console.error('Error in background phrase generation:', error);
    } finally {
      this.backgroundGenerationRunning = false;
      console.log('Background phrase generation completed');
    }
  }

  async ensurePhraseAvailability(category = null) {
    // Don't start background generation if it's already running
    if (this.backgroundGenerationRunning) {
      return;
    }

    const needsMore = await this.needsMorePhrases(category);
    if (needsMore) {
      // Start background generation but don't wait for it
      this.generatePhrasesInBackground(category).catch(console.error);
    }
  }

  async seedInitialPhrases() {
    await this.init();

    const initialPhrases = [
      { phrase: 'The lion is king', emojis: '🦁👑', category: 'movies' },
      { phrase: 'A girl fights competition', emojis: '👧🏼🔥🎯', category: 'movies' },
      { phrase: 'Break a leg', emojis: '💥🦵', category: 'idioms' },
      { phrase: 'An apple for teacher', emojis: '🍎👨‍🏫', category: 'idioms' },
      { phrase: 'Baby shark doo', emojis: '👶🦈🎵', category: 'songs' },
      { phrase: 'Shake it off', emojis: '💃❌', category: 'songs' }
    ];

    for (const phraseData of initialPhrases) {
      try {
        await this.db.insertPhrase(
          phraseData.phrase,
          phraseData.emojis,
          phraseData.category
        );
      } catch (error) {
        // Ignore duplicates
        if (!error.message.includes('UNIQUE constraint failed')) {
          console.error('Error seeding phrase:', error);
        }
      }
    }

    console.log('Initial phrases seeded');
    
    // Start background generation to ensure we have enough phrases
    this.ensurePhraseAvailability().catch(console.error);
  }

  async close() {
    if (this.isInitialized) {
      // Stop any background generation
      this.backgroundGenerationRunning = false;
      await this.db.close();
      this.isInitialized = false;
    }
  }
}

module.exports = PhraseService;