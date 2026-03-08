# Story 1.7: Game End Detection & Result Display

Status: ready-for-dev

## Story

As a player,
I want to know when the game is over and see the result,
So that I understand the outcome and can decide what to do next.

## Acceptance Criteria

1. System detects checkmate and announces it (FR10)
2. Checkmate visual effect plays (halo/tremble per UX spec)
3. End-game overlay displays showing "Victory" or "Defeat" for checkmate (FR11)
4. System detects stalemate and announces it (FR10)
5. End-game overlay displays "Draw — Stalemate" for stalemate (FR11)
6. Player can tap resign button to end the game immediately (FR7)
7. End-game overlay displays "Resigned" for resignation (FR11)
8. Overlay shows game result clearly (win/loss/draw/resignation)
9. Overlay is accessible via keyboard and has ARIA labels (NFR7, NFR8)

## Tasks / Subtasks

- [ ] Task 1: Game end detection (AC: #1, #4)
  - [ ] After every move (player or AI), check chess.js: `chess.isCheckmate()`, `chess.isStalemate()`, `chess.isDraw()`, `chess.isInsufficientMaterial()`, `chess.isThreefoldRepetition()`
  - [ ] Set `gamePhase: 'ended'` and `result` in store when game over detected
  - [ ] Integrate detection into the turn cycle in `useStockfish` hook
- [ ] Task 2: Resign functionality (AC: #6)
  - [ ] Create `src/components/GameControls/GameControls.tsx`
  - [ ] Add resign button
  - [ ] Implement `resign()` store action: sets `gamePhase: 'ended'`, `result: { type: 'resignation', resignedBy: 'w' }`
  - [ ] Confirm resignation with a simple tap (no confirmation dialog at MVP — keep it frictionless)
- [ ] Task 3: Checkmate visual effects (AC: #2)
  - [ ] King halo effect: glowing ring around the checkmated king
  - [ ] Board tremble: subtle shake animation on the board
  - [ ] CSS keyframes for both effects
  - [ ] Respect `prefers-reduced-motion` — skip effects if enabled
- [ ] Task 4: EndGame overlay component (AC: #3, #5, #7, #8, #9)
  - [ ] Create `src/components/EndGame/EndGame.tsx`
  - [ ] Display conditionally when `gamePhase === 'ended'`
  - [ ] Show result text based on `result` type:
    - Checkmate + player won: "Victory" with a win indicator
    - Checkmate + player lost: "Defeat"
    - Stalemate: "Draw — Stalemate"
    - Resignation: "Resigned"
  - [ ] Show move count from move history
  - [ ] Include "New Game" button (functionality in Story 1.8)
  - [ ] Full-screen overlay with semi-transparent backdrop
  - [ ] Keyboard accessible: focus trap within overlay, Escape to... nothing (must tap New Game)
  - [ ] ARIA: `role="dialog"`, `aria-labelledby`, `aria-modal="true"`
- [ ] Task 5: Store actions for game end (AC: all)
  - [ ] Implement `endGame(result: GameResult)` store action
  - [ ] Sets `gamePhase: 'ended'`, stores `result`
  - [ ] Clears `currentMoves` (no arrows on ended game)
- [ ] Task 6: Write tests (AC: all)
  - [ ] Test: checkmate detection triggers endGame
  - [ ] Test: stalemate detection triggers endGame
  - [ ] Test: resign button triggers endGame with resignation result
  - [ ] Test: EndGame overlay shows correct result text
  - [ ] Test: overlay has ARIA attributes

## Dev Notes

### Architecture Compliance

- **EndGame is a conditional overlay** — rendered in App.tsx when `gamePhase === 'ended'`, not a route change
- **GameControls is a separate component** — `src/components/GameControls/GameControls.tsx`
- **Named exports only**: `export function EndGame()`, `export function GameControls()`
- **Store actions for state**: `endGame()` and `resign()` are Zustand actions

### Game End Detection Integration

Integrate into the turn cycle in `useStockfish`:

```typescript
// After every move (player or AI):
const chess = new Chess(currentFen)
if (chess.isCheckmate()) {
  const winner = chess.turn() === 'w' ? 'b' : 'w' // Player who just moved wins
  endGame({ type: 'checkmate', winner })
  return
}
if (chess.isStalemate()) {
  endGame({ type: 'stalemate' })
  return
}
if (chess.isDraw()) {
  endGame({ type: 'stalemate' }) // Treat all draws as stalemate at MVP
  return
}
```

### Checkmate Visual Effects CSS

```css
@keyframes kingHalo {
  0% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7); }
  50% { box-shadow: 0 0 20px 10px rgba(255, 215, 0, 0.4); }
  100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); }
}

@keyframes boardTremble {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-2px, 1px); }
  50% { transform: translate(2px, -1px); }
  75% { transform: translate(-1px, 2px); }
}

.checkmate-king { animation: kingHalo 1.5s ease-in-out 2; }
.checkmate-board { animation: boardTremble 0.3s ease-in-out 3; }

@media (prefers-reduced-motion: reduce) {
  .checkmate-king, .checkmate-board { animation: none; }
}
```

### EndGame Overlay Design

Per UX spec — full overlay with result:
- Semi-transparent dark backdrop (`bg-black/70`)
- Centered card with result text, large font (Poppins 600/700 weight)
- "New Game" button prominently displayed (Story 1.8 implements the action)
- Simple, clean — not a complex stats screen at MVP

### GameResult Display Mapping

```typescript
function getResultDisplay(result: GameResult, playerColor: 'w'): { title: string; subtitle?: string } {
  switch (result.type) {
    case 'checkmate':
      return result.winner === playerColor
        ? { title: 'Victory', subtitle: 'Checkmate' }
        : { title: 'Defeat', subtitle: 'Checkmate' }
    case 'stalemate':
      return { title: 'Draw', subtitle: 'Stalemate' }
    case 'resignation':
      return { title: 'Resigned' }
  }
}
```

### Project Structure Notes

- Depends on: Stories 1.1-1.6
- Creates: `src/components/EndGame/EndGame.tsx`, `src/components/GameControls/GameControls.tsx`
- Modifies: `game-store.ts` (add `endGame`, `resign` actions), `useStockfish.ts` (add game end detection to turn cycle)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Component Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Component Hierarchy]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.7]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Écran: Fin de partie]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Animation: Échec et mat]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
