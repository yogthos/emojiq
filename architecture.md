# Emoji Word Game Architecture

## Game Flow Diagram

```mermaid
flowchart TD
    A[Start Game] --> B[Reset Session / Clear Used Phrases]
    B --> C[Request Phrase from Server]
    C --> D{Check SQLite Cache}
    D -->|Cache Hit| E[Filter Used Phrases]
    D -->|Cache Miss| F[Call Ollama Qwen3:1.7b]
    E --> G{Any Unused Phrases?}
    G -->|Yes| H[Return Fresh Phrase+Emojis]
    G -->|No| F
    F --> I[Generate Phrase & Emojis]
    I --> J[Store in SQLite Cache]
    J --> H
    H --> K[Track Phrase as Used]
    K --> L[Scramble Words + Add Decoys]
    L --> M[Display Emojis & Word Bank]
    M --> N[User Selects Words]
    N --> O{Check Answer}
    O -->|Correct| P[Update Score & Difficulty]
    O -->|Incorrect| Q[Show Hint/Retry]
    P --> R{Time Remaining?}
    Q --> R
    R -->|Yes| C
    R -->|No| S[Game Over]
    S --> T[Show Final Score]
```

## Code Structure

```mermaid
graph TB
    subgraph "Frontend (Preact)"
        A[App] --> B[GameBoard]
        B --> C[EmojiDisplay]
        B --> D[WordBank]
        B --> E[SelectedWords]
        B --> F[TimerDisplay]
        B --> G[ScoreDisplay]
        H[GameState Hook] --> I[API Client]
    end
    
    subgraph "Backend Server"
        J[Express Server] --> K[Phrase Routes]
        K --> L[Phrase Controller]
        L --> M[Phrase Service]
        M --> N[Ollama Client]
        M --> O[SQLite Database]
        P[Difficulty Tracker] --> O
        Q[Session Manager] --> M
    end
    
    subgraph "Database Schema"
        O --> R[phrases table]
        R --> S[id: INTEGER PRIMARY KEY]
        R --> T[phrase: TEXT]
        R --> U[emojis: TEXT]
        R --> V[category: TEXT]
        R --> W[difficulty: INTEGER]
        R --> X[correct_guesses: INTEGER]
        R --> Y[total_attempts: INTEGER]
        R --> Z[created_at: DATETIME]
        R --> AA[UNIQUE phrase, category]
    end
    
    I --> K
    L --> P
    H --> Q
```

## Component Responsibilities

### Frontend Components
- **App**: Main application router
- **GameBoard**: Game interface container
- **EmojiDisplay**: Shows emoji puzzle
- **WordBank**: Displays available words
- **SelectedWords**: Shows user's current selection
- **TimerDisplay**: Shows remaining time
- **ScoreDisplay**: Shows current score
- **GameState Hook**: Manages game state and API calls
- **API Client**: Communicates with backend server

### Backend Components
- **Express Server**: HTTP server setup
- **Phrase Routes**: API endpoint definitions
- **Phrase Controller**: Request/response handling
- **Phrase Service**: Business logic for phrase generation
- **Ollama Client**: Integration with local Ollama server
- **SQLite Database**: Persistent phrase caching
- **Difficulty Tracker**: Updates difficulty based on player performance
- **Session Manager**: Tracks used phrases per game session

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

## API Endpoints

### GET /api/phrases/random
- **Purpose**: Get a random phrase with emojis (ensures fresh phrases per session)
- **Query Params**: `category` (optional)
- **Response**: `{ id: number, phrase: string, emojis: string, category: string }`

### POST /api/phrases/guess-result
- **Purpose**: Update difficulty tracking
- **Body**: `{ phraseId: number, wasCorrect: boolean }`
- **Response**: `{ success: boolean }`

### GET /api/categories
- **Purpose**: Get available categories
- **Response**: `string[]`

### POST /api/session/reset
- **Purpose**: Reset used phrase tracking for new game session
- **Response**: `{ success: boolean, message: string }`

### UI Components
- EmojiDisplay: Shows emoji puzzle
- WordBank: Displays available words
- SelectedWords: Shows user's current selection
- TimerDisplay: Shows remaining time
- ScoreDisplay: Shows current score