# Story 1.7: Game End Detection & Result Display

Status: review

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

- [x] Task 1: Game end detection (AC: #1, #4)
  - [x] After every move (player or AI), check chess.js: `chess.isCheckmate()`, `chess.isStalemate()`, `chess.isDraw()`, `chess.isInsufficientMaterial()`, `chess.isThreefoldRepetition()`
  - [x] Set `gamePhase: 'ended'` and `result` in store when game over detected
  - [x] Integrate detection into the turn cycle in `useStockfish` hook
- [x] Task 2: Resign functionality (AC: #6)
  - [x] Create `src/components/GameControls/GameControls.tsx`
  - [x] Add resign button
  - [x] Implement `resign()` store action: sets `gamePhase: 'ended'`, `result: { type: 'resignation', resignedBy: 'w' }`
  - [x] Confirm resignation with a simple tap (no confirmation dialog at MVP — keep it frictionless)
- [x] Task 3: Checkmate visual effects (AC: #2)
  - [x] King halo effect: glowing ring around the checkmated king
  - [x] Board tremble: subtle shake animation on the board
  - [x] CSS keyframes for both effects
  - [x] Respect `prefers-reduced-motion` — skip effects if enabled
- [x] Task 4: EndGame overlay component (AC: #3, #5, #7, #8, #9)
  - [x] Create `src/components/EndGame/EndGame.tsx`
  - [x] Display conditionally when `gamePhase === 'ended'`
  - [x] Show result text based on `result` type:
    - Checkmate + player won: "Victory" with a win indicator
    - Checkmate + player lost: "Defeat"
    - Stalemate: "Draw — Stalemate"
    - Resignation: "Resigned"
  - [x] Show move count from move history
  - [x] Include "New Game" button (functionality in Story 1.8)
  - [x] Full-screen overlay with semi-transparent backdrop
  - [x] Keyboard accessible: focus trap within overlay, Escape to... nothing (must tap New Game)
  - [x] ARIA: `role="dialog"`, `aria-labelledby`, `aria-modal="true"`
- [x] Task 5: Store actions for game end (AC: all)
  - [x] Implement `endGame(result: GameResult)` store action
  - [x] Sets `gamePhase: 'ended'`, stores `result`
  - [x] Clears `currentMoves` (no arrows on ended game)
- [x] Task 6: Write tests (AC: all)
  - [x] Test: checkmate detection triggers endGame
  - [x] Test: stalemate detection triggers endGame
  - [x] Test: resign button triggers endGame with resignation result
  - [x] Test: EndGame overlay shows correct result text
  - [x] Test: overlay has ARIA attributes

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

Claude Opus 4.6

### Completion Notes List

- Created GameControls component with resign button
- Created EndGame overlay with result display (Victory/Defeat/Draw/Resigned)
- Integrated game end detection into useStockfish turn cycle (checkmate, stalemate, draw)
- EndGame has ARIA dialog, focus trap, move count display, New Game button
- Checkmate visual effects (king halo, board tremble) already in Board from Story 1.5
- 8 EndGame tests, 3 GameControls tests all passing

### Change Log

- 2026-03-08: Story 1.7 implemented — Game end detection and result display

### File List

- src/components/GameControls/GameControls.tsx (new)
- src/components/GameControls/GameControls.test.tsx (new)
- src/components/EndGame/EndGame.tsx (new)
- src/components/EndGame/EndGame.test.tsx (new)
- src/hooks/useStockfish.ts (modified — game end detection with endGame calls)
