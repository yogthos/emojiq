const config = require('./config');

class DeepSeekClient {
  constructor() {
    this.baseUrl = config.deepseekBaseUrl;
    this.model = config.deepseekModel;
    this.apiKey = process.env.DEEPSEEK_API_KEY;

    if (!this.apiKey) {
      throw new Error('DEEPSEEK_API_KEY environment variable is required for DeepSeek provider');
    }

    console.log(`DeepSeek configured with model: ${this.model} at ${this.baseUrl}`);
    console.log('Using DEEPSEEK_API_KEY from environment');
  }

  async generatePhrase(category) {
    try {
      // First, generate a phrase
      const phrasePrompt = this.getPhrasePrompt(category);
      const phrase = await this.callDeepSeek(phrasePrompt);

      // Then, convert it to emojis
      const emojiPrompt = this.getEmojiPrompt(phrase);
      const emojis = await this.callDeepSeek(emojiPrompt);

      return {
        phrase: this.cleanResponse(phrase),
        emojis: this.cleanResponse(emojis),
        category
      };
    } catch (error) {
      console.error('Error generating phrase with DeepSeek:', error);
      // Fallback to mock data if DeepSeek is not available
      return this.getMockPhrase(category);
    }
  }

  async callDeepSeek(prompt) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 100,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  getPhrasePrompt(category) {
    return `Generate a short, simple ${category} phrase that can be represented with emojis.
The phrase should be 3-6 words long and easy to understand.
IMPORTANT: Use only text, no emojis in the phrase itself.
Return only the phrase, nothing else. No explanations, no thinking process, no emojis.

Examples:
- For movies: "The lion is king"
- For idioms: "Break a leg"
- For songs: "Baby shark doo"

Generate a ${category} phrase:`;
  }

  getEmojiPrompt(phrase) {
    return `Convert this text phrase to emojis: "${phrase}"

IMPORTANT GUIDELINES:
- Use ONLY emojis, no text at all
- Return ONLY the emojis, nothing else
- No explanations, no thinking process, no additional text
- Keep it simple and direct
- Use common emojis that most people would understand
- Don't add extra emojis beyond what's needed
- If you cannot convert a word to emojis, use a representative emoji

Examples:
- "The lion is king" -> 🦁👑
- "Break a leg" -> 💥🦵
- "Baby shark doo" -> 👶🦈🎵
- "Hit the sack" -> 🛏️
- "Time flies" -> ⏰🦋

Convert "${phrase}" to emojis:`;
  }

  cleanResponse(response) {
    // Remove thinking tags and explanations
    let cleaned = response.replace(/<think>[\s\S]*?<\/think>/g, '')
                         .replace(/\n/g, ' ')
                         .replace(/["']/g, '')
                         .trim();

    // For emoji responses, be more aggressive about removing non-emoji content
    if (cleaned.match(/[a-zA-Z]/)) {
      // If there's any text, try to extract only emojis
      const emojiOnly = cleaned.replace(/[^\p{Emoji}]/gu, '').trim();
      if (emojiOnly.length > 0) {
        cleaned = emojiOnly;
      }
    }

    return cleaned;
  }

  getMockPhrase(category) {
    // Fallback mock data if DeepSeek is not available
    const mockData = {
      movies: [
        { phrase: 'The lion is king', emojis: '🦁👑' },
        { phrase: 'A girl fights competition', emojis: '👧🏼🔥🎯' }
      ],
      idioms: [
        { phrase: 'Break a leg', emojis: '💥🦵' },
        { phrase: 'An apple for teacher', emojis: '🍎👨‍🏫' }
      ],
      songs: [
        { phrase: 'Baby shark doo', emojis: '👶🦈🎵' },
        { phrase: 'Shake it off', emojis: '💃❌' }
      ]
    };

    const phrases = mockData[category] || mockData.movies;
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    return {
      phrase: randomPhrase.phrase,
      emojis: randomPhrase.emojis,
      category
    };
  }
}

module.exports = DeepSeekClient;