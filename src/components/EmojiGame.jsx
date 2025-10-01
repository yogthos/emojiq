import { h } from 'preact';
import { useGameState } from '../hooks/useGameState';
import { LLMService } from '../services/llmService';
import './emoji-game.css';

const EmojiGame = () => {
  const {
    gameState,
    startGame,
    selectWord,
    deselectWord,
    submitAnswer,
    setCategory
  } = useGameState();

  const categories = LLMService.getAvailableCategories();

  return (
    <div class="emoji-game">
      <div class="game-header">
        <h1>🎮 Emoji Word Game</h1>
        <div class="game-info">
          <div class="score">Score: {gameState.score}</div>
          <div class="timer">Time: {gameState.timeLeft}s</div>
        </div>
      </div>

      {!gameState.isPlaying ? (
        <div class="start-screen">
          <h2>Welcome to Emoji Word Game!</h2>
          <p>Guess the sentence from emojis by selecting the correct words!</p>
          
          <div class="category-selector">
            <label for="category">Choose a category:</label>
            <select 
              id="category"
              value={gameState.currentCategory}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <button class="start-button" onClick={startGame}>
            Start Game
          </button>
        </div>
      ) : (
        <div class="game-board">
          {gameState.isGameOver ? (
            <div class="game-over">
              <h2>Game Over!</h2>
              <p>Final Score: {gameState.score}</p>
              <button class="restart-button" onClick={startGame}>
                Play Again
              </button>
            </div>
          ) : (
            <>
              <div class="emoji-display">
                <h3>What does this mean?</h3>
                <div class="emojis">{gameState.currentEmojis}</div>
              </div>

              <div class="selected-words">
                <h4>Your sentence:</h4>
                <div class="selected-words-list">
                  {gameState.selectedWords.map((word, index) => (
                    <button
                      key={`${word}-${index}`}
                      class="selected-word"
                      onClick={() => deselectWord(word)}
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>

              <div class="word-bank">
                <h4>Available words:</h4>
                <div class="word-bank-list">
                  {gameState.availableWords.map((word, index) => (
                    <button
                      key={`${word}-${index}`}
                      class="word-button"
                      onClick={() => selectWord(word)}
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>

              <div class="game-controls">
                <button 
                  class="submit-button" 
                  onClick={submitAnswer}
                  disabled={gameState.selectedWords.length === 0}
                >
                  Submit Answer
                </button>
              </div>

              {gameState.message && (
                <div class={`message ${gameState.message.includes('Correct') ? 'success' : 'error'}`}>
                  {gameState.message}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default EmojiGame;