# Emoji Word Game Architecture

## Game Flow Diagram

```mermaid
flowchart TD
    A[Start Game] --> B[Generate Sentence via LLM]
    B --> C[Convert Sentence to Emojis]
    C --> D[Scramble Words + Add Decoys]
    D --> E[Display Emojis & Word Bank]
    E --> F[User Selects Words]
    F --> G{Check Answer}
    G -->|Correct| H[Update Score]
    G -->|Incorrect| I[Show Hint/Retry]
    H --> J{Time Remaining?}
    I --> J
    J -->|Yes| B
    J -->|No| K[Game Over]
    K --> L[Show Final Score]
```

## Code Structure

```mermaid
graph TB
    subgraph "Core Game Logic"
        A[GameManager] --> B[LLMService]
        A --> C[EmojiConverter]
        A --> D[WordScrambler]
        A --> E[Timer]
        A --> F[ScoreManager]
    end
    
    subgraph "UI Components"
        G[App] --> H[GameBoard]
        H --> I[EmojiDisplay]
        H --> J[WordBank]
        H --> K[SelectedWords]
        H --> L[TimerDisplay]
        H --> M[ScoreDisplay]
    end
    
    subgraph "State Management"
        N[GameState] --> O[CurrentSentence]
        N --> P[CurrentEmojis]
        N --> Q[AvailableWords]
        N --> R[SelectedWords]
        N --> S[TimeLeft]
        N --> T[Score]
    end
    
    B --> O
    C --> P
    D --> Q
    E --> S
    F --> T
```

## Component Responsibilities

### GameManager
- Orchestrates game flow
- Manages game state transitions
- Coordinates between services

### LLMService
- Generates sentences based on categories
- Converts sentences to emoji representations

### EmojiConverter
- Handles emoji mapping logic
- Validates emoji representations

### WordScrambler
- Breaks sentences into words
- Adds decoy words
- Randomizes word order

### Timer
- Manages countdown
- Handles time-based events

### ScoreManager
- Tracks correct answers
- Calculates score based on time/accuracy

### UI Components
- EmojiDisplay: Shows emoji puzzle
- WordBank: Displays available words
- SelectedWords: Shows user's current selection
- TimerDisplay: Shows remaining time
- ScoreDisplay: Shows current score