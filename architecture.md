# Emoji Word Game Architecture

## Game Flow Diagram

```mermaid
flowchart TD
    A[Start Game] --> B[Request Phrase from Server]
    B --> C{Check SQLite Cache}
    C -->|Cache Hit| D[Return Cached Phrase+Emojis]
    C -->|Cache Miss| E[Call Ollama Qwen3:1.7b]
    E --> F[Generate Phrase & Emojis]
    F --> G[Store in SQLite Cache]
    G --> D
    D --> H[Scramble Words + Add Decoys]
    H --> I[Display Emojis & Word Bank]
    I --> J[User Selects Words]
    J --> K{Check Answer}
    K -->|Correct| L[Update Score & Difficulty]
    K -->|Incorrect| M[Show Hint/Retry]
    L --> N{Time Remaining?}
    M --> N
    N -->|Yes| B
    N -->|No| O[Game Over]
    O --> P[Show Final Score]
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
    end
    
    subgraph "Database Schema"
        O --> Q[phrases table]
        Q --> R[id: INTEGER PRIMARY KEY]
        Q --> S[phrase: TEXT]
        Q --> T[emojis: TEXT]
        Q --> U[category: TEXT]
        Q --> V[difficulty: INTEGER]
        Q --> W[correct_guesses: INTEGER]
        Q --> X[total_attempts: INTEGER]
        Q --> Y[created_at: DATETIME]
    end
    
    I --> K
    L --> P
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
- **Purpose**: Get a random phrase with emojis
- **Query Params**: `category` (optional)
- **Response**: `{ phrase: string, emojis: string, category: string }`

### POST /api/phrases/guess-result
- **Purpose**: Update difficulty tracking
- **Body**: `{ phraseId: number, wasCorrect: boolean }`
- **Response**: `{ success: boolean }`

### GET /api/categories
- **Purpose**: Get available categories
- **Response**: `string[]`

### UI Components
- EmojiDisplay: Shows emoji puzzle
- WordBank: Displays available words
- SelectedWords: Shows user's current selection
- TimerDisplay: Shows remaining time
- ScoreDisplay: Shows current score