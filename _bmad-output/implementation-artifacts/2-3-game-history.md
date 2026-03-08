# Story 2.3: Game History

Status: review

## Story

As a player,
I want to browse my past games,
So that I can see my game results over time.

## Acceptance Criteria

1. After completing a game, the result is saved to game history with date, result (win/loss/draw/resign), and number of moves (FR15)
2. Game history section in the Settings drawer displays past games in reverse chronological order (most recent first)
3. Game history is capped at 100 entries — oldest game removed (FIFO) when cap is exceeded
4. Pruning happens automatically without user intervention
5. Empty state message displayed when no games have been completed (e.g., "No games played yet")
6. Game history persists across sessions via Zustand persist middleware (FR18)

## Tasks / Subtasks

- [x] Task 1: Define CompletedGame type (AC: #1)
  - [x] Add `CompletedGame` interface to `src/types/chess.ts`:
    ```typescript
    interface CompletedGame {
      date: string          // ISO date string
      result: GameResult    // 'win' | 'loss' | 'draw' | 'resign'
      moves: number         // Total number of moves played
      playerColor: 'w' | 'b'
    }
    ```
  - [x] Add `gameHistory: CompletedGame[]` to the store state
- [x] Task 2: Record completed games in store (AC: #1, #3, #4)
  - [x] Create `addCompletedGame(result: GameResult)` action in game-store.ts
  - [x] Called when game ends (checkmate, stalemate, resign) — wire into existing end-game logic from Story 1.7
  - [x] Compute game summary: `{ date: new Date().toISOString(), result, moves: moveHistory.length, playerColor }`
  - [x] Prepend to `gameHistory` array (newest first)
  - [x] If `gameHistory.length > 100`, slice to keep first 100 entries (FIFO pruning — newest stays, oldest dropped)
  - [x] Zustand persist (Story 2.1) auto-saves the updated history
- [x] Task 3: Game History UI in Settings drawer (AC: #2, #5)
  - [x] Add "Game History" section inside `Settings.tsx` (below ELO slider and theme toggle)
  - [x] Section header: "History" or "Past Games"
  - [x] List each game: date (formatted as relative or short date), result icon/text, move count
  - [x] Result display: "Victory" / "Defeat" / "Draw" / "Resigned"
  - [x] Date formatting: use `toLocaleDateString()` for short date
  - [x] Scrollable list within the drawer if many entries
  - [x] Empty state: centered text "No games played yet" when `gameHistory.length === 0`
- [x] Task 4: Wire end-game to history recording (AC: #1)
  - [x] In the existing game end flow (Story 1.7 — EndGame component / store actions):
    - When `gamePhase` transitions to `'ended'`, call `addCompletedGame(result)`
    - Ensure this is called exactly once per game end (not on re-render)
  - [x] The `endGame(result)` action in store should call `addCompletedGame` internally
- [x] Task 5: Write tests (AC: all)
  - [x] Test: addCompletedGame adds entry to gameHistory
  - [x] Test: gameHistory is prepended (newest first)
  - [x] Test: FIFO pruning at 101 entries removes oldest
  - [x] Test: game history persists via Zustand persist
  - [x] Test: empty state message renders when no history
  - [x] Test: history list renders with correct data (date, result, moves)
  - [x] Test: completing a game adds exactly one history entry

## Dev Notes

### Architecture Compliance

- **Game history lives in the Zustand store** — `gameHistory: CompletedGame[]` field, persisted via persist middleware
- **100-entry cap** enforced in store action, not in UI
- **Named exports**: all components and types
- **No utility files** — pruning logic is inline in the store action (2 lines)
- **Tailwind styling** for history list

### Store Integration

```typescript
// In game-store.ts
gameHistory: [] as CompletedGame[],

addCompletedGame: (result: GameResult) => set((state) => {
  const entry: CompletedGame = {
    date: new Date().toISOString(),
    result,
    moves: state.moveHistory.length,
    playerColor: state.playerColor,
  }
  const updated = [entry, ...state.gameHistory].slice(0, 100)
  return { gameHistory: updated }
}),

// Modify existing endGame action to include history recording:
endGame: (result: GameResult) => set((state) => {
  const entry: CompletedGame = {
    date: new Date().toISOString(),
    result,
    moves: state.moveHistory.length,
    playerColor: state.playerColor,
  }
  return {
    gamePhase: 'ended' as const,
    result,
    gameHistory: [entry, ...state.gameHistory].slice(0, 100),
  }
}),
```

### FIFO Pruning — Simple Slice

```typescript
// Prepend new game, keep first 100
const updated = [newEntry, ...state.gameHistory].slice(0, 100)
```

At ~100 bytes per CompletedGame summary, 100 games = ~10KB. Well within localStorage limits. No optimization needed.

### History UI in Settings Drawer

```tsx
// Inside Settings.tsx
<section aria-label="Game History">
  <h3 className="text-lg font-semibold mb-2">History</h3>
  {gameHistory.length === 0 ? (
    <p className="text-gray-400 text-center py-4">No games played yet</p>
  ) : (
    <ul className="space-y-2 max-h-60 overflow-y-auto">
      {gameHistory.map((game, i) => (
        <li key={i} className="flex justify-between text-sm">
          <span>{new Date(game.date).toLocaleDateString()}</span>
          <span>{resultLabel(game.result)}</span>
          <span>{game.moves} moves</span>
        </li>
      ))}
    </ul>
  )}
</section>
```

### Result Labels

```typescript
function resultLabel(result: GameResult): string {
  switch (result) {
    case 'win': return 'Victory'
    case 'loss': return 'Defeat'
    case 'draw': return 'Draw'
    case 'resign': return 'Resigned'
  }
}
```

### Integration Points

- **Story 1.7 (EndGame)**: The `endGame` store action already sets `gamePhase: 'ended'` and `result`. This story adds `addCompletedGame` call inside that same action — single atomic update.
- **Story 2.1 (Persist)**: `gameHistory` must be included in the `partialize` config so it persists to localStorage.
- **Story 2.2 (Settings)**: History section added inside the existing Settings drawer below the ELO/theme controls.

### Project Structure Notes

- Modifies: `src/types/chess.ts` (add CompletedGame), `src/store/game-store.ts` (add gameHistory, addCompletedGame, modify endGame), `src/components/Settings/Settings.tsx` (add history section)
- Does NOT create new component files — history is a section within Settings, not a separate component
- Depends on: Story 2.1 (persist middleware), Story 2.2 (Settings drawer)
- After this story, Epic 2 is COMPLETE

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture — GameHistory, pruning strategy]
- [Source: _bmad-output/planning-artifacts/architecture.md#State Management Patterns]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.3]
- [Source: _bmad-output/planning-artifacts/prd.md#FR15, FR18]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
No issues encountered.

### Completion Notes List
- CompletedGame type already existed in chess.ts from story spec creation
- Added gameHistory array to store state, interface, and partialize config
- Modified endGame and resign actions to atomically record game history entries with FIFO pruning (100 cap)
- Added History section to Settings drawer with result labels, date formatting, scrollable list, and empty state
- 7 new tests: 5 store tests (endGame recording, prepend order, FIFO pruning, persist, resign recording) + 2 UI tests (empty state, history list rendering)
- All 77 tests pass, TypeScript compiles cleanly

### File List
- `src/store/game-store.ts` — Modified: added gameHistory state, modified endGame/resign to record history, added to partialize
- `src/store/game-store.test.ts` — Modified: added 5 gameHistory tests, updated beforeEach
- `src/components/Settings/Settings.tsx` — Modified: added game history UI section with resultLabel helper
- `src/components/Settings/Settings.test.tsx` — Modified: added 2 history UI tests
- `src/types/chess.ts` — Already had CompletedGame type (no changes needed)

### Change Log
- 2026-03-08: Implemented Story 2.3 — Game history recording, FIFO pruning, Settings UI, persistence, and tests
