const crypto = require('crypto');

class SessionManager {
  constructor() {
    // Track sessions by session ID (could be user ID, IP, or generated session ID)
    this.sessions = new Map();
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    // Global tracking of recently used phrases across all sessions
    this.globalUsedPhrases = new Set();
    this.globalPhraseTimeout = 60 * 60 * 1000; // 1 hour
    this.globalPhraseTimestamps = new Map(); // phraseId -> timestamp
  }

  // Generate or get session ID from request
  getSessionId(req) {
    // Try to get session ID from cookie first
    if (req.headers.cookie) {
      const sessionCookie = req.headers.cookie
        .split(';')
        .find(c => c.trim().startsWith('sessionId='));
      if (sessionCookie) {
        return sessionCookie.split('=')[1];
      }
    }

    // Fallback to generating a new session ID
    const sessionId = crypto.randomUUID();
    return sessionId;
  }

  // Get or create session
  getSession(sessionId) {
    let session = this.sessions.get(sessionId);

    if (!session) {
      session = {
        id: sessionId,
        usedPhrases: new Set(),
        lastActivity: Date.now()
      };
      this.sessions.set(sessionId, session);
    } else {
      // Update last activity
      session.lastActivity = Date.now();
    }

    return session;
  }

  // Get used phrases for session (combines session-specific and global tracking)
  getUsedPhrases(req) {
    const sessionId = this.getSessionId(req);
    const session = this.getSession(sessionId);
    const sessionUsed = Array.from(session.usedPhrases);
    const globalUsed = Array.from(this.globalUsedPhrases);

    // Combine and deduplicate
    const allUsed = [...new Set([...sessionUsed, ...globalUsed])];
    return allUsed;
  }

  // Add phrase to used phrases for session and global tracking
  markPhraseUsed(req, phraseId) {
    const sessionId = this.getSessionId(req);
    const session = this.getSession(sessionId);
    session.usedPhrases.add(phraseId);

    // Also add to global tracking
    this.globalUsedPhrases.add(phraseId);
    this.globalPhraseTimestamps.set(phraseId, Date.now());
  }

  // Atomic operation: reserve a phrase ID to prevent race conditions
  reservePhraseId(phraseId) {
    // Check if phrase is already reserved globally
    if (this.globalUsedPhrases.has(phraseId)) {
      return false; // Already used
    }

    // Reserve it immediately
    this.globalUsedPhrases.add(phraseId);
    this.globalPhraseTimestamps.set(phraseId, Date.now());
    return true; // Successfully reserved
  }

  // Reset used phrases for session
  resetSession(req) {
    const sessionId = this.getSessionId(req);
    const session = this.getSession(sessionId);
    session.usedPhrases.clear();
  }

  // Clean up expired sessions and global phrases
  cleanupExpiredSessions() {
    const now = Date.now();

    // Clean up expired sessions
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.sessionTimeout) {
        this.sessions.delete(sessionId);
      }
    }

    // Clean up expired global phrases
    for (const [phraseId, timestamp] of this.globalPhraseTimestamps.entries()) {
      if (now - timestamp > this.globalPhraseTimeout) {
        this.globalUsedPhrases.delete(phraseId);
        this.globalPhraseTimestamps.delete(phraseId);
      }
    }
  }

  // Start cleanup interval
  startCleanup() {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000); // Clean up every 5 minutes
  }
}

module.exports = SessionManager;