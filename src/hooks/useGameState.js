import { useState, useEffect, useCallback } from 'preact/hooks';
import { ApiClient } from '../services/apiClient';
import { WordScrambler } from '../services/wordScrambler';

export const useGameState = () => {
  const [gameState, setGameState] = useState({
    currentSentence: '',
    currentEmojis: '',
    currentPhraseId: null,
    availableWords: [],
    selectedWords: [],
    score: 0,
    timeLeft: 60,
    isPlaying: false,
    isGameOver: false,
    currentCategory: 'movies',
    message: '',
    categories: ['movies', 'idioms', 'songs'],
    isLoading: false
  });

  const startNewRound = useCallback(async () => {
    try {
      setGameState(prev => ({ ...prev, isLoading: true }));
      
      const phraseData = await ApiClient.getRandomPhrase(gameState.currentCategory);
      const scrambledWords = WordScrambler.scrambleWords(phraseData.phrase);
      
      setGameState(prev => ({
        ...prev,
        currentSentence: phraseData.phrase,
        currentEmojis: phraseData.emojis,
        currentPhraseId: phraseData.id,
        availableWords: scrambledWords,
        selectedWords: [],
        message: '',
        isLoading: false
      }));
    } catch (error) {
      console.error('Error starting new round:', error);
      setGameState(prev => ({ 
        ...prev, 
        message: 'Failed to load phrase. Please try again.',
        isLoading: false 
      }));
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

  const submitAnswer = useCallback(async () => {
    if (!gameState.isPlaying || gameState.isGameOver) return;

    const isCorrect = WordScrambler.validateAnswer(
      gameState.selectedWords,
      gameState.currentSentence
    );

    // Record the guess result to update difficulty
    if (gameState.currentPhraseId) {
      try {
        await ApiClient.recordGuessResult(gameState.currentPhraseId, isCorrect);
      } catch (error) {
        console.error('Error recording guess result:', error);
      }
    }

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
  }, [gameState.isPlaying, gameState.isGameOver, gameState.selectedWords, gameState.currentSentence, gameState.timeLeft, gameState.currentPhraseId, startNewRound]);

  const setCategory = useCallback((category) => {
    setGameState(prev => ({
      ...prev,
      currentCategory: category
    }));
  }, []);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await ApiClient.getCategories();
        setGameState(prev => ({
          ...prev,
          categories
        }));
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
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