import { useState, useEffect, useCallback } from 'preact/hooks';
import { LLMService } from '../services/llmService';
import { WordScrambler } from '../services/wordScrambler';

export const useGameState = () => {
  const [gameState, setGameState] = useState({
    currentSentence: '',
    currentEmojis: '',
    availableWords: [],
    selectedWords: [],
    score: 0,
    timeLeft: 60,
    isPlaying: false,
    isGameOver: false,
    currentCategory: 'movies',
    message: ''
  });

  const startNewRound = useCallback(async () => {
    try {
      const { sentence, emojis } = await LLMService.generateSentence(gameState.currentCategory);
      const scrambledWords = WordScrambler.scrambleWords(sentence);
      
      setGameState(prev => ({
        ...prev,
        currentSentence: sentence,
        currentEmojis: emojis,
        availableWords: scrambledWords,
        selectedWords: [],
        message: ''
      }));
    } catch (error) {
      console.error('Error starting new round:', error);
    }
  }, [gameState.currentCategory]);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isGameOver: false,
      score: 0,
      timeLeft: 60
    }));
    startNewRound();
  }, [startNewRound]);

  const selectWord = useCallback((word) => {
    if (!gameState.isPlaying || gameState.isGameOver) return;

    setGameState(prev => ({
      ...prev,
      selectedWords: [...prev.selectedWords, word],
      availableWords: prev.availableWords.filter(w => w !== word)
    }));
  }, [gameState.isPlaying, gameState.isGameOver]);

  const deselectWord = useCallback((word) => {
    if (!gameState.isPlaying || gameState.isGameOver) return;

    setGameState(prev => ({
      ...prev,
      selectedWords: prev.selectedWords.filter(w => w !== word),
      availableWords: [...prev.availableWords, word]
    }));
  }, [gameState.isPlaying, gameState.isGameOver]);

  const submitAnswer = useCallback(() => {
    if (!gameState.isPlaying || gameState.isGameOver) return;

    const isCorrect = WordScrambler.validateAnswer(
      gameState.selectedWords,
      gameState.currentSentence
    );

    if (isCorrect) {
      const timeBonus = Math.floor(gameState.timeLeft / 5);
      const wordBonus = gameState.currentSentence.split(' ').length * 10;
      const roundScore = 50 + timeBonus + wordBonus;

      setGameState(prev => ({
        ...prev,
        score: prev.score + roundScore,
        message: `Correct! +${roundScore} points`
      }));

      setTimeout(() => {
        startNewRound();
      }, 1500);
    } else {
      setGameState(prev => ({
        ...prev,
        message: 'Incorrect! Try again',
        selectedWords: [],
        availableWords: WordScrambler.scrambleWords(prev.currentSentence)
      }));
    }
  }, [gameState.isPlaying, gameState.isGameOver, gameState.selectedWords, gameState.currentSentence, gameState.timeLeft, startNewRound]);

  const setCategory = useCallback((category) => {
    setGameState(prev => ({
      ...prev,
      currentCategory: category
    }));
  }, []);

  // Timer effect
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isGameOver) return;

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          clearInterval(timer);
          return {
            ...prev,
            timeLeft: 0,
            isGameOver: true,
            message: 'Time\'s up! Game Over'
          };
        }
        return {
          ...prev,
          timeLeft: prev.timeLeft - 1
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.isPlaying, gameState.isGameOver]);

  return {
    gameState,
    startGame,
    selectWord,
    deselectWord,
    submitAnswer,
    setCategory
  };
};