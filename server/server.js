const express = require('express');
const cors = require('cors');
const path = require('path');
const PhraseService = require('./phraseService');
const SessionManager = require('./sessionManager');

class Server {
  constructor() {
    this.app = express();
    this.phraseService = new PhraseService();
    this.sessionManager = new SessionManager();
    this.port = process.env.PORT || 3001;
  }

  async start() {
    console.log("server started");
    // Middleware
    this.app.use(cors());
    this.app.use(express.json());

    // Serve static files from dist directory (for production)
    this.app.use(express.static(path.join(__dirname, '../dist')));

    // API Routes
    this.setupRoutes();

    // Initialize services
    await this.phraseService.init();

    // Seed initial phrases if database is empty
    await this.phraseService.seedInitialPhrases();

    // Start server
    this.server = this.app.listen(this.port, () => {
      console.log(`Server running on http://localhost:${this.port}`);
      console.log('Make sure Ollama is running on http://localhost:11434');
    });

    // Start session cleanup
    this.sessionManager.startCleanup();

    // Setup graceful shutdown
    this.setupGracefulShutdown();

    return this.app;
  }

  setupRoutes() {
    // Health check
    this.app.get('/api/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // Get random phrase
    this.app.get('/api/phrases/random', async (req, res) => {
      try {
        const category = req.query.category || null;
        const excludeIds = this.sessionManager.getUsedPhrases(req);
        const phrase = await this.phraseService.getRandomPhrase(category, excludeIds);
        
        // Mark this phrase as used for this session
        this.sessionManager.markPhraseUsed(req, phrase.id);
        
        res.json(phrase);
      } catch (error) {
        console.error('Error getting random phrase:', error);
        res.status(500).json({
          error: 'Failed to get phrase',
          message: error.message
        });
      }
    });

    // Record guess result
    this.app.post('/api/phrases/guess-result', async (req, res) => {
      try {
        const { phraseId, wasCorrect } = req.body;

        if (typeof phraseId !== 'number' || typeof wasCorrect !== 'boolean') {
          return res.status(400).json({
            error: 'Invalid request body',
            message: 'phraseId must be a number and wasCorrect must be a boolean'
          });
        }

        const result = await this.phraseService.recordGuessResult(phraseId, wasCorrect);
        res.json(result);
      } catch (error) {
        console.error('Error recording guess result:', error);
        res.status(500).json({
          error: 'Failed to record guess',
          message: error.message
        });
      }
    });

    // Get available categories
    this.app.get('/api/categories', async (req, res) => {
      try {
        const categories = await this.phraseService.getCategories();
        res.json(categories);
      } catch (error) {
        console.error('Error getting categories:', error);
        res.status(500).json({
          error: 'Failed to get categories',
          message: error.message
        });
      }
    });

    // Reset used phrases for new game session
    this.app.post('/api/session/reset', async (req, res) => {
      try {
        this.sessionManager.resetSession(req);
        res.json({ success: true, message: 'Session reset - fresh phrases will be served' });
      } catch (error) {
        console.error('Error resetting session:', error);
        res.status(500).json({
          error: 'Failed to reset session',
          message: error.message
        });
      }
    });

    // Catch-all handler for SPA routing
    this.app.get(/^(?!\/api).*/, (req, res) => {
      res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
  }

  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      console.log(`\nReceived ${signal}, shutting down gracefully...`);
      
      // Close HTTP server
      if (this.server) {
        this.server.close(() => {
          console.log('HTTP server closed');
        });
      }
      
      // Close database connections
      await this.stop();
      
      console.log('Server shutdown complete');
      process.exit(0);
    };

    // Handle SIGINT (Ctrl+C) and SIGTERM
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  }

  async stop() {
    await this.phraseService.close();
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new Server();
  server.start().catch(console.error);
}

module.exports = Server;