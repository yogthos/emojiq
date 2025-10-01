# Emoji Word Game - Server Setup

## Overview

This is a full-stack emoji word game that uses:
- **Frontend**: Preact/Vite SPA
- **Backend**: Express.js server with SQLite database
- **AI**: Ollama with Qwen3:1.7b for phrase generation

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Ollama** installed and running locally
3. **Qwen3:1.7b** model pulled in Ollama

### Installing Ollama

```bash
# On macOS
brew install ollama

# On Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve
```

### Pulling the Model

```bash
ollama pull Qwen3:1.7b
```

## Running the Application

### Development Mode (Recommended)

```bash
npm run dev
# Starts both frontend (http://localhost:3000) and backend (http://localhost:3001)
# Frontend proxies API requests to backend automatically
# Hot reload for frontend changes
# Requires Ollama to be running for AI features
```

### Individual Development Services

```bash
# Frontend only (with API proxy)
npm run dev:frontend

# Backend only
npm run dev:backend
```

### Full Production Mode

```bash
npm start
# Builds frontend and starts production server
# Full app runs on http://localhost:3001
# Requires Ollama to be running
```

### Server Only

```bash
npm run server
# Server runs on http://localhost:3001
# Requires frontend to be built first
```

## Architecture

### Database Schema

The SQLite database (`server/phrases.db`) stores:
- `phrases` table with cached phrases
- Difficulty tracking based on player performance
- Categories and usage statistics

### API Endpoints

- `GET /api/health` - Server health check
- `GET /api/phrases/random` - Get random phrase
- `GET /api/phrases/random?category=movies` - Get phrase by category
- `POST /api/phrases/guess-result` - Record guess results
- `GET /api/categories` - Get available categories

### AI Integration

When a phrase is requested:
1. Server checks SQLite cache first
2. If not found, calls Ollama Qwen3:1.7b to generate phrase
3. Stores result in database for future use
4. Updates difficulty based on player success rate

## Configuration

### Environment Variables

- `PORT` - Server port (default: 3001)
- `OLLAMA_BASE_URL` - Ollama API URL (default: http://localhost:11434)

### Categories

Default categories:
- `movies` - Movie titles and phrases
- `idioms` - Common idioms and sayings
- `songs` - Song titles and lyrics

## Development

### Adding New Categories

1. Update the prompt templates in `server/ollamaClient.js`
2. Add initial seed phrases in `server/phraseService.js`
3. The system will automatically generate new phrases for the category

### Customizing Difficulty

Difficulty is calculated based on:
- Success rate (correct guesses / total attempts)
- Only after 5+ attempts for statistical significance
- Ranges from 1 (easy) to 10 (hard)

### Testing

```bash
# Run tests
npm test

# Lint code
npm run lint

# Build for production
npm run build
```

## Troubleshooting

### Ollama Connection Issues

1. Ensure Ollama is running: `ollama serve`
2. Check if model is available: `ollama list`
3. Verify API endpoint: `curl http://localhost:11434/api/tags`

### Database Issues

- Database file is created automatically at `server/phrases.db`
- If corrupted, delete the file and restart the server
- Initial seed phrases will be recreated

### Frontend Not Loading in Development

- Ensure both frontend and backend are running: `npm run dev`
- Check that Vite is running on port 3000
- Verify the backend is running on port 3001
- Check that API proxy is working: `curl http://localhost:3000/api/health`

### Frontend Not Loading in Production

- Ensure you've built the frontend: `npm run build`
- Check that the server is serving static files from `dist/` directory
- Verify API endpoints are accessible

## Deployment

For production deployment:

1. Build the frontend: `npm run build`
2. Set environment variables
3. Ensure Ollama service is running
4. Start the server: `npm run server`

The server handles both API requests and serves the static frontend.