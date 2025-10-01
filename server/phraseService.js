const Database = require('./database');
const OllamaClient = require('./ollamaClient');

class PhraseService {
  constructor() {
    this.db = new Database();
    this.ollama = new OllamaClient();
    this.isInitialized = false;
  }

  async init() {
    if (!this.isInitialized) {
      await this.db.init();
      this.isInitialized = true;
    }
  }

  async getRandomPhrase(category = null, excludeIds = []) {
    await this.init();

    // First try to get a cached phrase that hasn't been used
    let phrase = await this.db.getRandomPhrase(category, excludeIds);

    // If no unused cached phrase exists, try generating new ones
    if (!phrase) {
      console.log(`No unused cached phrases found for category: ${category || 'all'}, generating new ones...`);

      // Try to generate multiple phrases to increase chances of uniqueness
      const generateAttempts = 5;
      let generatedPhrases = [];

      for (let i = 0; i < generateAttempts; i++) {
        try {
          const newPhrase = await this.ollama.generatePhrase(category || 'movies');
          const insertedPhrase = await this.db.insertPhrase(
            newPhrase.phrase,
            newPhrase.emojis,
            newPhrase.category
          );
          generatedPhrases.push(insertedPhrase);
        } catch (error) {
          if (error.message.includes('UNIQUE constraint failed')) {
            console.log(`Duplicate phrase detected during generation, skipping...`);
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
      console.error('Error getting categories:', error);
      return ['movies', 'idioms', 'songs'];
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
  }

  async close() {
    if (this.isInitialized) {
      await this.db.close();
      this.isInitialized = false;
    }
  }
}

module.exports = PhraseService;