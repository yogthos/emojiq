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
    
    // Exact match - always correct
    if (selectedSentence === target) {
      return true;
    }
    
    // Check for permissive match
    return this.validatePermissiveAnswer(selectedWords, targetSentence);
  }

  static validatePermissiveAnswer(selectedWords, targetSentence) {
    const selected = selectedWords.map(word => word.toLowerCase());
    const target = targetSentence.toLowerCase().split(' ');

    // Define filler words to ignore (reduced list for stricter validation)
    const fillerWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'up', 'about'
    ]);

    // Filter out filler words from both arrays
    const selectedContent = selected.filter(word => !fillerWords.has(word));
    const targetContent = target.filter(word => !fillerWords.has(word));

    // If both are empty after filtering, consider it correct
    if (selectedContent.length === 0 && targetContent.length === 0) {
      return true;
    }

    // Calculate match percentage based on content words
    let matchedWords = 0;
    const selectedSet = new Set(selectedContent);

    for (const word of targetContent) {
      if (selectedSet.has(word)) {
        matchedWords++;
      }
    }

    // Calculate match percentage
    const matchPercentage = targetContent.length > 0 ? matchedWords / targetContent.length : 1;

    // Stricter validation rules
    if (targetContent.length >= 4) {
      // For longer phrases (4+ words), require 80% match
      return matchPercentage >= 0.8;
    } else if (targetContent.length === 3) {
      // For 3-word phrases, require all 3 content words
      return matchedWords >= 3;
    } else if (targetContent.length === 2) {
      // For 2-word phrases, require both content words
      return matchedWords >= 2;
    } else {
      // For single-word phrases, require exact match
      return matchPercentage >= 1.0;
    }
  }
}