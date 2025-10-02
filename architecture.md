# Emoji Word Game Architecture

## Game Flow Diagram

```mermaid
flowchart TD
    A[Start Game] --> B[Reset Session / Clear Used Phrases]
    B --> C[Request Phrase from Server]
    C --> D{Check SQLite Cache}
    D -->|Cache Hit| E[Filter Used Phrases]
    D -->|Cache Miss| F{Check Provider Config}
    F -->|Ollama| G[Call Ollama Qwen3:32b]
    F -->|DeepSeek| H[Call DeepSeek API]
    E --> I{Any Unused Phrases?}
    I -->|Yes| J[Return Fresh Phrase+Emojis]
    I -->|No| F
    G --> K[Generate Phrase & Emojis]
    H --> K
    K --> L[Store in SQLite Cache]
    L --> J
    J --> M[Track Phrase as Used]
    M --> N[Scramble Words + Add Decoys]
    N --> O[Display Emojis & Word Bank]
    O --> P[User Selects Words]
    P --> Q{Check Answer}
    Q -->|Correct| R[Update Score & Add Time Bonus]
    Q -->|Incorrect| S[Show Error & Reset Words]
    R --> T{Time Remaining?}
    S --> T
    T -->|Yes| C
    T -->|No| U[Game Over]
    U --> V[Show Final Score]
```

## Code Structure

```mermaid
graph TB
    subgraph "Frontend (Preact + Vite)"
        A[App] --> B[EmojiGame Component]
        B --> C[useGameState Hook]
        C --> D[API Client]
        C --> E[Word Scrambler]
        F[Timer Logic] --> C
        G[Score Logic] --> C
        H[Loading Animation] --> B
    end

    subgraph "Backend Server (Express)"
        I[Express Server] --> J[Server Class]
        J --> K[Phrase Service]
        J --> L[Session Manager]
        K --> M[AI Provider Factory]
        M --> N[Ollama Client]
        M --> O[DeepSeek Client]
        K --> P[SQLite Database]
        L --> Q[Cookie-based Session Tracking]
        R[Background Generation] --> K
        S[Configuration Manager] --> M
    end

    subgraph "Database Schema"
        P --> T[phrases table]
        T --> U[id: INTEGER PRIMARY KEY]
        T --> V[phrase: TEXT]
        T --> W[emojis: TEXT]
        T --> X[category: TEXT]
        T --> Y[difficulty: INTEGER]
        T --> Z[correct_guesses: INTEGER]
        T --> AA[total_attempts: INTEGER]
        T --> AB[created_at: DATETIME]
        T --> AC[UNIQUE phrase, category]
    end

    D --> I
    K --> L
```

## Component Responsibilities

### Frontend Components (Preact + Vite)
- **App**: Main application router and entry point
- **EmojiGame**: Main game component with UI layout and loading animation
- **useGameState Hook**: Central state management for game logic with timer pausing during loading
- **API Client**: HTTP communication with backend server
- **Word Scrambler**: Scrambles phrases and validates answers with strict validation rules
- **Timer Logic**: Countdown timer with time extension on correct answers, pauses during phrase generation
- **Score Logic**: Score calculation with time and word bonuses
- **Loading Animation**: Animated loading indicator during phrase generation

### Backend Components (Node.js + Express)
- **Server Class**: Main server setup with graceful shutdown
- **Phrase Service**: Core business logic for phrase management with duplicate protection
- **Session Manager**: Cookie-based session tracking for phrase uniqueness
- **AI Provider Factory**: Creates appropriate AI provider based on configuration
- **Ollama Client**: Integration with local Ollama server using Qwen3:32b
- **DeepSeek Client**: Integration with DeepSeek API using deepseek-chat model
- **SQLite Database**: Persistent phrase caching with automatic cleanup
- **Background Generation**: Automatic phrase population when cache is low with duplicate limits
- **Configuration Manager**: Loads and manages provider configuration from config.json

### Database Schema
- **phrases table**: Cached phrases with metadata
  - `id`: Primary key
  - `phrase`: The original sentence
  - `emojis`: Emoji representation
  - `category`: Phrase category (movies, idioms, songs)
  - `difficulty`: Calculated difficulty (1-10)
  - `correct_guesses`: Number of successful guesses
  - `total_attempts`: Total number of attempts
  - `created_at`: Timestamp of creation
  - `UNIQUE(phrase, category)`: Ensures phrase uniqueness per category

## API Endpoints

### GET /api/phrases/random
- **Purpose**: Get a random phrase with emojis (ensures fresh phrases per session)
- **Query Params**: `category` (optional)
- **Response**: `{ id: number, phrase: string, emojis: string, category: string }`
- **Session Management**: Uses cookie-based session tracking to prevent phrase repetition

### POST /api/phrases/guess-result
- **Purpose**: Update difficulty tracking and performance metrics
- **Body**: `{ phraseId: number, wasCorrect: boolean }`
- **Response**: `{ success: boolean }`

### GET /api/categories
- **Purpose**: Get available categories
- **Response**: `string[]`

### POST /api/session/reset
- **Purpose**: Reset used phrase tracking for new game session
- **Response**: `{ success: boolean, message: string }`

### GET /api/health
- **Purpose**: Health check endpoint
- **Response**: `{ status: 'OK', timestamp: string }`

## Testing Architecture

### Frontend Tests
- **Jest + Testing Library**: Component testing
- **Header Tests**: Basic component rendering tests
- **Mock Setup**: Browser and file mocks for testing environment

### Backend Tests
- **Integration Tests**: Full server flow testing
- **Ollama Tests**: AI integration testing with Qwen3:32b
- **DeepSeek Tests**: DeepSeek API integration testing
- **Provider Compatibility Tests**: Ensures both providers have compatible APIs
- **Session Tests**: Multi-session uniqueness testing
- **Performance Tests**: Timer extension and phrase availability testing
- **Generation Tests**: Phrase generation and caching tests with duplicate protection

## Development Tools

- **Vite**: Frontend build tool and dev server
- **Concurrently**: Run frontend and backend simultaneously
- **Jest**: Testing framework
- **ESLint**: Code linting with Preact configuration
- **SQLite3**: Database for phrase caching

## Project Structure

```
wordgames/
├── src/                          # Frontend source code
│   ├── components/               # Preact components
│   │   ├── app.jsx              # Main app component
│   │   ├── EmojiGame.jsx        # Main game component
│   │   ├── emoji-game.css       # Game styles
│   │   └── header/              # Header component
│   ├── hooks/                   # Custom React hooks
│   │   └── useGameState.js      # Main game state management
│   ├── services/                # Frontend services
│   │   ├── apiClient.js         # API communication
│   │   ├── wordScrambler.js     # Word scrambling logic
│   │   └── test-validation.js   # Test utilities
│   ├── routes/                  # Application routes
│   │   └── profile/             # Profile route (placeholder)
│   ├── assets/                  # Static assets
│   ├── style/                   # Global styles
│   ├── index.jsx                # Application entry point
│   ├── sw.jsx                   # Service worker
│   └── manifest.json            # PWA manifest
├── server/                      # Backend server code
│   ├── server.js                # Main server class
│   ├── phraseService.js         # Phrase generation service with duplicate protection
│   ├── sessionManager.js        # Session management
│   ├── aiProvider.js            # AI provider factory
│   ├── ollamaClient.js          # Ollama AI integration with Qwen3:32b
│   ├── deepseekClient.js        # DeepSeek API integration
│   ├── database.js              # SQLite database wrapper
│   ├── config.js                # Configuration management
│   ├── config.json              # Provider configuration
│   ├── cleanup-database.js      # Database maintenance
│   ├── check-phrases.js         # Phrase validation
│   └── phrases.db               # SQLite database file
├── tests/                       # Test files
│   ├── server/                  # Backend integration tests
│   │   ├── test-full-flow.js    # Complete flow test
│   │   ├── test-ollama.js       # Ollama integration test
│   │   ├── test-deepseek.js     # DeepSeek API integration test
│   │   ├── test-provider-compatibility.js # Provider compatibility test
│   │   ├── test-unique-phrases.js # Phrase uniqueness test
│   │   ├── test-multi-session-unique.js # Multi-session test
│   │   ├── test-phrase-generation.js # Generation tests
│   │   ├── test-empty-cache-generation.js # Cache tests
│   │   ├── test-direct-generation.js # Direct generation test
│   │   ├── test-timer-extension.js # Timer logic test
│   │   ├── test-simple-availability.js # Availability test
│   │   ├── test-phrase-availability.js # Phrase availability
│   │   ├── test-complete-game.js # Complete game flow
│   │   ├── test-multi-user.js   # Multi-user scenario
│   │   ├── test-repeat-prevention.js # Repeat prevention
│   │   └── test-fresh-phrases.js # Fresh phrase testing
│   ├── __mocks__/               # Test mocks
│   └── header.test.js           # Frontend component test
├── package.json                 # Project dependencies
├── architecture.md              # Architecture documentation
└── README.md                    # Project documentation
```