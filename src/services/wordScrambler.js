// Service for scrambling words and adding decoys

export class WordScrambler {
  static scrambleWords(sentence, decoyCount = 3) {
    const words = sentence.toLowerCase().split(' ');
    const decoys = this.generateDecoys(words, decoyCount);
    
    const allWords = [...words, ...decoys];
    return this.shuffleArray(allWords);
  }

  static generateDecoys(originalWords, count) {
    const commonWords = [
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
      'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'cat', 'dog',
      'run', 'big', 'red', 'fun', 'sun', 'hot', 'ice', 'sea', 'sky', 'fly', 'eat', 'sit', 'bed', 'car', 'bus', 'pen', 'cup', 'hat', 'bag', 'key'
    ];

    const decoys = [];
    const usedWords = new Set(originalWords);

    while (decoys.length < count) {
      const randomWord = commonWords[Math.floor(Math.random() * commonWords.length)];
      if (!usedWords.has(randomWord)) {
        decoys.push(randomWord);
        usedWords.add(randomWord);
      }
    }

    return decoys;
  }

  static shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  static validateAnswer(selectedWords, targetSentence) {
    const selectedSentence = selectedWords.join(' ').toLowerCase();
    const target = targetSentence.toLowerCase();
    return selectedSentence === target;
  }
}