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

  async getRandomPhrase(category = null) {
    await this.init();

    // First try to get a cached phrase
    let phrase = await this.db.getRandomPhrase(category);
    
    // If no cached phrase exists, generate a new one
    if (!phrase) {
      console.log('No cached phrases found, generating new one...');
      const newPhrase = await this.ollama.generatePhrase(category || 'movies');
      phrase = await this.db.insertPhrase(
        newPhrase.phrase,
        newPhrase.emojis,
        newPhrase.category
      );
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