// Mock LLM service for sentence generation and emoji conversion
// In a real implementation, this would connect to OpenAI/Anthropic APIs

const categories = {
  movies: [
    { sentence: "The lion is the king of the jungle", emojis: "🦁👑🌴" },
    { sentence: "A girl fights in a deadly competition", emojis: "👧🏼🔥🎯" },
    { sentence: "A boy discovers he is a wizard", emojis: "👦⚡🧙‍♂️" },
    { sentence: "A superhero swings through the city", emojis: "🦸‍♂️🕸️🏙️" }
  ],
  idioms: [
    { sentence: "An apple for the teacher", emojis: "🍎👨‍🏫" },
    { sentence: "Let sleeping dogs lie", emojis: "😴🐕💤" },
    { sentence: "A stitch in time saves nine", emojis: "⏰💸🧵" },
    { sentence: "Break a leg", emojis: "🦵💥" }
  ],
  songs: [
    { sentence: "Baby shark doo doo doo", emojis: "👶🦈🎵" },
    { sentence: "Shake it off", emojis: "💃❌" },
    { sentence: "I will always love you", emojis: "❤️🕰️👩" },
    { sentence: "Sweet dreams are made of this", emojis: "🍬💭✨" }
  ]
};

export class LLMService {
  static async generateSentence(category = 'movies') {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const categoryData = categories[category] || categories.movies;
    const randomIndex = Math.floor(Math.random() * categoryData.length);
    return categoryData[randomIndex];
  }

  static async convertToEmojis(sentence) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Simple emoji mapping for demo purposes
    const emojiMap = {
      lion: '🦁',
      king: '👑',
      jungle: '🌴',
      girl: '👧🏼',
      fights: '🔥',
      deadly: '💀',
      competition: '🎯',
      boy: '👦',
      discovers: '🔍',
      wizard: '🧙‍♂️',
      superhero: '🦸‍♂️',
      swings: '🕸️',
      city: '🏙️',
      apple: '🍎',
      teacher: '👨‍🏫',
      sleeping: '😴',
      dogs: '🐕',
      lie: '💤',
      stitch: '🧵',
      time: '⏰',
      saves: '💸',
      nine: '9️⃣',
      break: '💥',
      leg: '🦵',
      baby: '👶',
      shark: '🦈',
      doo: '🎵',
      shake: '💃',
      off: '❌',
      always: '🕰️',
      love: '❤️',
      you: '👩',
      sweet: '🍬',
      dreams: '💭',
      made: '✨',
      this: '👉'
    };

    const words = sentence.toLowerCase().split(' ');
    return words.map(word => emojiMap[word] || '❓').join('');
  }

  static getAvailableCategories() {
    return Object.keys(categories);
  }
}