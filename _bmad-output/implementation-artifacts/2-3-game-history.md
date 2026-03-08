# Story 2.3: Game History

Status: ready-for-dev

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

- [ ] Task 1: Define CompletedGame type (AC: #1)
  - [ ] Add `CompletedGame` interface to `src/types/chess.ts`:
    ```typescript
    interface CompletedGame {
      date: string          // ISO date string
      result: GameResult    // 'win' | 'loss' | 'draw' | 'resign'
      moves: number         // Total number of moves played
      playerColor: 'w' | 'b'
    }
    ```
  - [ ] Add `gameHistory: CompletedGame[]` to the store state
- [ ] Task 2: Record completed games in store (AC: #1, #3, #4)
  - [ ] Create `addCompletedGame(result: GameResult)` action in game-store.ts
  - [ ] Called when game ends (checkmate, stalemate, resign) — wire into existing end-game logic from Story 1.7
  - [ ] Compute game summary: `{ date: new Date().toISOString(), result, moves: moveHistory.length, playerColor }`
  - [ ] Prepend to `gameHistory` array (newest first)
  - [ ] If `gameHistory.length > 100`, slice to keep first 100 entries (FIFO pruning — newest stays, oldest dropped)
  - [ ] Zustand persist (Story 2.1) auto-saves the updated history
- [ ] Task 3: Game History UI in Settings drawer (AC: #2, #5)
  - [ ] Add "Game History" section inside `Settings.tsx` (below ELO slider and theme toggle)
  - [ ] Section header: "History" or "Past Games"
  - [ ] List each game: date (formatted as relative or short date), result icon/text, move count
  - [ ] Result display: "Victory" / "Defeat" / "Draw" / "Resigned"
  - [ ] Date formatting: use `toLocaleDateString()` for short date
  - [ ] Scrollable list within the drawer if many entries
  - [ ] Empty state: centered text "No games played yet" when `gameHistory.length === 0`
- [ ] Task 4: Wire end-game to history recording (AC: #1)
  - [ ] In the existing game end flow (Story 1.7 — EndGame component / store actions):
    - When `gamePhase` transitions to `'ended'`, call `addCompletedGame(result)`
    - Ensure this is called exactly once per game end (not on re-render)
  - [ ] The `endGame(result)` action in store should call `addCompletedGame` internally
- [ ] Task 5: Write tests (AC: all)
  - [ ] Test: addCompletedGame adds entry to gameHistory
  - [ ] Test: gameHistory is prepended (newest first)
  - [ ] Test: FIFO pruning at 101 entries removes oldest
  - [ ] Test: game history persists via Zustand persist
  - [ ] Test: empty state message renders when no history
  - [ ] Test: history list renders with correct data (date, result, moves)
  - [ ] Test: completing a game adds exactly one history entry

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

### Debug Log References

### Completion Notes List

### File List
