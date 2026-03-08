# Story 2.1: Game State Auto-Save & Restore

Status: review

## Story

As a player,
I want my in-progress game to be saved automatically and restored when I return,
So that I never lose progress even if I close the app unexpectedly.

## Acceptance Criteria

1. Game state (FEN, move history, game phase) is persisted to localStorage via Zustand persist middleware on every state change (FR13, NFR11)
2. On reopen, saved game is automatically restored: board position, whose turn, move history (FR14)
3. If restored to player's turn, 3 new move options are generated for the current position
4. If restored to AI's turn, the AI plays its response
5. Corrupted or unparseable localStorage data resets to a fresh new game — no crash, no error shown to user
6. No data loss under any normal usage scenario: close, reload, navigate away, OS kill (NFR13)
7. State persists across browser crashes, OS kills, and accidental closures (NFR11)

## Tasks / Subtasks

- [x] Task 1: Configure Zustand persist middleware in game-store.ts (AC: #1, #6, #7)
  - [x] Add `persist` middleware wrapping the store creator
  - [x] Set storage key: `'ch3ss-game'`
  - [x] Configure `partialize` to persist `gameState` and `settings` slices only — exclude transient `ui` state (e.g., `showSettings`, `currentMoves` display state)
  - [x] Verify persist writes on every `set()` call (Zustand persist default behavior — synchronous write to localStorage)
  - [x] No debouncing or batching — every state change must persist immediately for crash resilience
- [x] Task 2: Implement onRehydrateStorage callback (AC: #2, #3, #4)
  - [x] Add `onRehydrateStorage` to persist config
  - [x] On successful rehydration: check `gamePhase`
  - [x] If `gamePhase === 'playing'` and it's player's turn → set flag to trigger move generation
  - [x] If `gamePhase === 'playing'` and it's AI's turn → set flag to trigger AI response
  - [x] If `gamePhase === 'ended'` → show EndGame overlay with stored result
  - [x] Determine whose turn by reading the FEN's active color field (6th FEN component: 'w' = white = player's turn)
- [x] Task 3: Implement corruption recovery (AC: #5, #6)
  - [x] Wrap rehydration in try/catch — if localStorage data fails to parse, Zustand falls back to initial state (equivalent to fresh game)
  - [x] Add `version` field to persist config for future migration support
  - [x] Test: manually corrupt localStorage, verify app recovers to new game
  - [x] Test: delete localStorage key, verify app starts fresh game
  - [x] Test: store invalid JSON in localStorage key, verify recovery
- [x] Task 4: Integrate restore flow in App.tsx (AC: #2, #3, #4)
  - [x] Use Zustand's `useStore.persist.hasHydrated()` or `onRehydrateStorage` to detect hydration complete
  - [x] After hydration: if saved game exists and it's player's turn, trigger move generation via `useStockfish`
  - [x] After hydration: if saved game exists and it's AI's turn, trigger AI response
  - [x] Board should render immediately with restored position — arrows appear when engine is ready
- [x] Task 5: Write tests (AC: all)
  - [x] Test: state persists to localStorage after playMove action
  - [x] Test: state persists to localStorage after startNewGame action
  - [x] Test: rehydration restores FEN, moveHistory, gamePhase correctly
  - [x] Test: corrupted localStorage triggers startNewGame (recovery)
  - [x] Test: missing localStorage key starts fresh game
  - [x] Test: settings persist across sessions (opponentElo, theme)

## Dev Notes

### Architecture Compliance

- **Single store**: `src/store/game-store.ts` — Zustand with persist middleware
- **Persist only serializable state**: FEN (string), moveHistory (array), gamePhase (string), result (object), settings (object)
- **Do NOT persist**: Chess.js instances, current move arrows, UI transient state (showSettings, isEngineReady)
- **Do NOT persist** `currentMoves` (the 3 ClassifiedMoves currently displayed) — regenerate from engine on restore
- **Named exports**: `export const useGameStore = create(persist(...))`

### Zustand Persist Configuration

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useGameStore = create(
  persist(
    (set, get) => ({
      // ... store definition from previous stories
    }),
    {
      name: 'ch3ss-game',
      version: 1,
      partialize: (state) => ({
        fen: state.fen,
        moveHistory: state.moveHistory,
        gamePhase: state.gamePhase,
        result: state.result,
        playerColor: state.playerColor,
        settings: state.settings,
        gameHistory: state.gameHistory,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Rehydration failed, starting fresh game')
          // Store will use initial state → triggers startNewGame in App.tsx
          return
        }
        // State is restored — App.tsx handles triggering moves/AI
      },
    }
  )
)
```

### What to Persist vs. What to Regenerate

| Field | Persist? | Reason |
|-------|----------|--------|
| `fen` | YES | Board position |
| `moveHistory` | YES | Game record |
| `gamePhase` | YES | Playing/ended |
| `result` | YES | Win/loss/draw |
| `playerColor` | YES | Always 'w' but persist for consistency |
| `settings.opponentElo` | YES | User preference |
| `settings.theme` | YES | User preference |
| `gameHistory` | YES | Past games list |
| `currentMoves` | NO | Regenerate from engine |
| `showSettings` | NO | Transient UI state |
| `isEngineReady` | NO | Runtime state |

### FEN Active Color Parsing

Determine whose turn it is from the FEN string:
```typescript
const activeColor = fen.split(' ')[1] // 'w' or 'b'
const isPlayerTurn = activeColor === 'w' // Player always plays white
```

### Restore Flow Sequence

```
App mounts → Zustand creates store → persist middleware checks localStorage
  → localStorage exists and valid?
    → YES: Rehydrate state (FEN, moveHistory, settings, etc.)
      → Board renders with restored position
      → Engine initializes (async)
      → Engine ready?
        → Player's turn → generatePlayerMoves(fen, depth)
        → AI's turn → getAIMove(fen, elo) with delay
    → NO (missing or corrupted):
      → Use initial state → startNewGame()
      → Board renders starting position
      → Engine ready → generate opening moves
```

### localStorage Size Considerations

- FEN string: ~80 bytes
- MoveRecord per move: ~200 bytes (FEN + played move + 3 options)
- 40-move game: ~8KB
- Game history (100 games × ~100 bytes summary): ~10KB
- Total worst case: ~20KB — well within 5MB localStorage limit

### Project Structure Notes

- Modifies: `src/store/game-store.ts` (add persist middleware), `src/App.tsx` (restore flow integration)
- Epic 1 stories 1.1-1.8 must be complete — this story enhances the existing store
- This story is the FOUNDATION for Epic 2 — settings persistence (2.2) and game history (2.3) build on the persist middleware configured here
- Note: Story 1.8 already has a basic persist setup sketch in its dev notes — this story fully implements and hardens it

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#State Management Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Error Handling Patterns]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.1]
- [Source: _bmad-output/planning-artifacts/prd.md#FR13, FR14, NFR11, NFR13]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
No issues encountered.

### Completion Notes List
- Persist middleware was already configured from Epic 1 — enhanced with `version: 1` and `onRehydrateStorage` error handling
- App.tsx updated to handle AI turn restore (black's turn after rehydration triggers `handlePlayerMoveComplete`)
- 7 new persistence tests added covering: persist on playMove, persist on startNewGame, rehydration restore, corrupted recovery, missing key, settings persistence, transient state exclusion
- All 15 store tests pass

### File List
- `src/store/game-store.ts` — Added version field and onRehydrateStorage callback to persist config
- `src/store/game-store.test.ts` — Added 7 persistence tests
- `src/App.tsx` — Added AI turn restore handling in initialization useEffect

### Change Log
- 2026-03-08: Implemented Story 2.1 — persist middleware hardened with version, onRehydrateStorage, corruption recovery, AI turn restore flow, and comprehensive tests
