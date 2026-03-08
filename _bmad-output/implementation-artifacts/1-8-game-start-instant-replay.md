# Story 1.8: Game Start & Instant Replay

Status: ready-for-dev

## Story

As a player,
I want to start playing immediately when I open the app and replay instantly after a game ends,
So that I experience zero friction between games.

## Acceptance Criteria

1. On first launch (no saved game), a new game starts immediately with board in starting position and 3 move options displayed (FR8)
2. No signup, account creation, or onboarding flow shown
3. Initial load completes in under 3 seconds on 4G (NFR3)
4. After game ends, "New Game" button on EndGame overlay starts a new game immediately (FR9)
5. Transition from end-game to new game is near-instant (<400ms) (NFR2)
6. Player always plays as white (first move)
7. 3 move options for the opening position generated and displayed on game start
8. App entry point (App.tsx) orchestrates the full game lifecycle

## Tasks / Subtasks

- [ ] Task 1: App.tsx — game lifecycle orchestration (AC: #1, #2, #8)
  - [ ] Create the root layout in `App.tsx`: Header + Board + MoveArrows + GameControls + EndGame + Settings
  - [ ] On mount: check Zustand store for existing game state (persist rehydration)
  - [ ] If no saved game or fresh install: call `startNewGame()` and trigger move generation
  - [ ] If saved game exists: restore board, trigger move generation if player's turn
  - [ ] No auth check, no onboarding — straight to board
- [ ] Task 2: Create Header component (AC: #2)
  - [ ] Create `src/components/Header/Header.tsx`
  - [ ] App title "ch3ss" with Poppins font
  - [ ] Gear icon for settings (settings drawer is Epic 2, but icon placeholder needed)
  - [ ] Minimal, clean header — not distracting from the board
- [ ] Task 3: startNewGame store action (AC: #4, #5, #6)
  - [ ] Implement `startNewGame()` in game-store.ts
  - [ ] Reset FEN to starting position: `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`
  - [ ] Clear `moveHistory`, set `gamePhase: 'playing'`, clear `result`
  - [ ] Set `playerColor: 'w'`
  - [ ] Clear `currentMoves`
  - [ ] Persist immediately (Zustand auto-persists on state change)
- [ ] Task 4: New Game button in EndGame overlay (AC: #4, #5)
  - [ ] Wire "New Game" button in EndGame.tsx to `startNewGame()` action
  - [ ] After `startNewGame`, trigger new move generation via `useStockfish`
  - [ ] Transition should feel instant — no loading screen between games
- [ ] Task 5: Initial move generation on app load (AC: #7)
  - [ ] After engine initializes, generate 3 moves for current position
  - [ ] Handle the race: engine might not be ready when board renders — show board without arrows, add arrows when ready
  - [ ] Engine loading indicator: subtle (e.g., pulsing dot), not blocking board render
- [ ] Task 6: Performance optimization (AC: #3)
  - [ ] Ensure Stockfish WASM loads asynchronously (already in Story 1.2)
  - [ ] Board renders immediately, arrows appear after engine ready
  - [ ] No heavy computation on main thread during initial render
  - [ ] Verify initial load < 3s with Lighthouse or manual measurement
- [ ] Task 7: Write tests (AC: all)
  - [ ] Test: App renders board on mount
  - [ ] Test: startNewGame resets state correctly
  - [ ] Test: New Game button triggers startNewGame
  - [ ] Test: move generation triggers after game start
  - [ ] Test: Header renders with title

## Dev Notes

### Architecture Compliance

- **App.tsx is the root layout** — contains all top-level components per component hierarchy
- **No router** — game phases managed via Zustand `gamePhase`, not routes
- **Named exports**: `export function Header()`
- **Error Boundary**: wrap App content in a React Error Boundary (top-level crash recovery)

### App.tsx Component Structure

```tsx
export function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-sable text-white font-poppins flex flex-col items-center">
        <Header />
        <main className="relative w-full max-w-md mx-auto">
          <Board />
          <MoveArrows />
        </main>
        <GameControls />
        {gamePhase === 'ended' && <EndGame />}
        {showSettings && <Settings />}
      </div>
    </ErrorBoundary>
  )
}
```

### Game Lifecycle Flow

```
App mounts
  → Zustand rehydrates from localStorage
  → Check: is there a saved game?
    → YES: Board renders saved position
      → Is it player's turn? → Generate 3 moves when engine ready
      → Is it AI's turn? → Trigger AI response
    → NO: Call startNewGame() → Board renders starting position
      → Generate 3 moves for opening position when engine ready
  → Engine initializes asynchronously in background
  → When engine ready: generate moves for current position
```

### Zustand Persist Rehydration

Zustand persist middleware handles rehydration automatically:
```typescript
// The store auto-loads from localStorage on creation
// Check if onRehydrateStorage callback is needed for game restore logic:
persist(storeCreator, {
  name: 'ch3ss-game',
  onRehydrateStorage: () => (state) => {
    // Called after rehydration
    if (state && state.gamePhase === 'playing') {
      // Trigger move generation for current position
    }
  },
})
```

### Error Boundary

Simple top-level error boundary:
```tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. <button onClick={() => window.location.reload()}>Reload</button></div>
    }
    return this.props.children
  }
}
```

### Saved Game Corruption Recovery

Per architecture spec, if localStorage data is corrupted:
- Zustand persist middleware may throw during rehydration
- Catch in error boundary or `onRehydrateStorage`
- Reset to fresh game (call `startNewGame()`)
- No error shown to user — just start a new game

### Project Structure Notes

- Depends on: Stories 1.1-1.7
- Creates: `src/components/Header/Header.tsx`
- Modifies: `App.tsx` (full layout), `game-store.ts` (implement `startNewGame`), `EndGame.tsx` (wire New Game button)
- This is the INTEGRATION story that ties everything together into a complete playable experience
- After this story, Epic 1 is COMPLETE: a player can open ch3ss, play a full game, and replay

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Component Hierarchy]
- [Source: _bmad-output/planning-artifacts/architecture.md#Loading State Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Error Handling Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.8]
- [Source: _bmad-output/planning-artifacts/prd.md#FR8, FR9]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Flux: Lancement initial]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
