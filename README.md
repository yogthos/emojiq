# Emoji Word Game

A fun word game where players unscramble emoji puzzles to guess phrases from movies, idioms, and songs. The game uses AI-powered phrase generation via Ollama to create endless puzzles.

## Prerequisites

### 1. Install Ollama

The game requires Ollama to generate emoji puzzles. Follow these steps to install and set up Ollama:

#### macOS
```bash
# Download and install Ollama
brew install ollama

# Start Ollama service
ollama serve
```

#### Linux
```bash
# Download and install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve
```

#### Windows
Download the installer from [ollama.ai](https://ollama.ai) and run it.

### 2. Pull Required Model

The game uses the `qwen2.5:1.7b` model for phrase generation. Pull the model using:

```bash
ollama pull qwen2.5:1.7b
```

> **Note**: You can use other models by modifying the `server/ollamaClient.js` file, but `qwen2.5:1.7b` is recommended for optimal performance and quality.

### 3. Verify Ollama Setup

Ensure Ollama is running and accessible:

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# You should see a response with your models
```

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Game

```bash
# Start both frontend and backend servers
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

### 3. Verify Everything is Working

1. Open http://localhost:3000 in your browser
2. The game should load with available categories (Movies, Idioms, Songs)
3. Click "Play" to start a game session
4. You should see scrambled words with emoji hints

## Game Features

- **Multiple Categories**: Movies, idioms, and songs
- **AI-Powered Puzzles**: Fresh puzzles generated using Ollama
- **Smart Validation**: Permissive answer validation that accepts mostly correct answers
- **Session Management**: Unique puzzles per game session
- **Background Generation**: Automatic phrase generation to ensure availability
- **Difficulty Tracking**: Adaptive difficulty based on player performance

## Development Commands

```bash
# Install dependencies
npm install

# Start development servers (frontend + backend)
npm run dev

# Start only frontend development server
npm run dev:frontend

# Start only backend server
npm run dev:backend

# Build for production
npm run build

# Start production server
npm run start

# Run tests
npm run test

# Run specific server tests
npm run test:server
npm run test:unique
npm run test:multi-session
```

## API Endpoints

- `GET /api/phrases/random?category=<category>` - Get random phrase
- `POST /api/phrases/guess-result` - Record guess result
- `GET /api/categories` - Get available categories
- `POST /api/session/reset` - Reset game session

## Troubleshooting

### Common Issues

1. **"Ollama connection failed"**
   - Ensure Ollama is running: `ollama serve`
   - Verify the model is pulled: `ollama list`
   - Check if port 11434 is accessible

2. **"No phrases available"**
   - Wait for background generation to complete
   - Check server logs for generation errors
   - Verify Ollama is working correctly

3. **Database errors**
   - Delete `server/phrases.db` to reset the database
   - Restart the server

### Testing Ollama Integration

```bash
# Test Ollama connection directly
node server/test-ollama.js

# Test full server flow
node server/test-full-flow.js
```

## Architecture

- **Frontend**: Preact SPA with responsive design
- **Backend**: Node.js/Express server with SQLite database
- **AI Integration**: Ollama for phrase and emoji generation
- **Session Management**: Cookie-based session tracking
- **Background Processing**: Automatic phrase population

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test`
5. Submit a pull request

## License

MIT License - see LICENSE file for details
