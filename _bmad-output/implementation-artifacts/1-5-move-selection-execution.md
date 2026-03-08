# Story 1.5: Move Selection & Execution

Status: ready-for-dev

## Story

As a player,
I want to tap one of the 3 arrows to play that move,
So that my chosen piece moves on the board and the game progresses.

## Acceptance Criteria

1. Tapping/clicking an arrow executes the corresponding move on the board
2. Selected piece animates from source to destination square (piece fly animation per UX spec)
3. Other 2 arrows dismiss with animated exit sequence
4. Board state updates to reflect new position (chess.js validates the move)
5. All standard chess rules enforced: legal moves, check, castling, en passant (FR6)
6. Pawn promotion displays an inline selection overlay when a pawn reaches the last rank (FR6)
7. Move recorded in move history with the 3 options and player's classification choice
8. UI interaction completes within <400ms (NFR2)

## Tasks / Subtasks

- [ ] Task 1: Arrow click handler (AC: #1)
  - [ ] Add `onClick` handler to each arrow in MoveArrows component
  - [ ] Pass selected `ClassifiedMove` to store action `playMove`
  - [ ] Disable further arrow clicks while move is executing (prevent double-tap)
- [ ] Task 2: Piece fly animation (AC: #2, #8)
  - [ ] Animate the moving piece from source to destination square
  - [ ] Use CSS transform + transition (GPU-accelerated, 60fps)
  - [ ] Animation duration: ~300ms (fast enough for <400ms total interaction)
  - [ ] Handle captured pieces: remove captured piece when moving piece arrives
  - [ ] Respect `prefers-reduced-motion` — instant move if reduced motion
- [ ] Task 3: Arrow dismiss animation (AC: #3)
  - [ ] Animate the 2 unselected arrows out (fade + scale down)
  - [ ] Selected arrow can briefly highlight before the piece moves
  - [ ] Dismiss animation runs simultaneously with piece fly
- [ ] Task 4: State update via store action (AC: #4, #7)
  - [ ] Implement `playMove(move: ClassifiedMove)` store action
  - [ ] Validate move with chess.js: `new Chess(fen).move({ from, to, promotion })`
  - [ ] Update `fen` to new position
  - [ ] Append `MoveRecord` to `moveHistory` (position before, move played, all 3 options, classification)
  - [ ] Clear `currentMoves` (arrows no longer displayed)
  - [ ] Zustand persist auto-saves to localStorage
- [ ] Task 5: Chess rules enforcement (AC: #5)
  - [ ] chess.js handles all rule validation automatically
  - [ ] Castling: if king moves 2 squares, rook animation also needed
  - [ ] En passant: captured pawn is on a different square than destination — handle removal
  - [ ] Ensure the 3 generated moves from Stockfish are always legal (validated by chess.js before display)
- [ ] Task 6: Pawn promotion (AC: #6)
  - [ ] Detect when a move's destination is the last rank and piece is a pawn
  - [ ] Show inline promotion overlay: Queen, Rook, Bishop, Knight options
  - [ ] Apply selected promotion piece to the move
  - [ ] Overlay is accessible (keyboard nav, ARIA labels)
  - [ ] Handle promotion in Board.tsx (not a separate component — per architecture "Pawn promotion UI handled inline in Board.tsx")
- [ ] Task 7: Write tests (AC: all)
  - [ ] Test: clicking arrow calls `playMove` with correct move
  - [ ] Test: FEN updates after move
  - [ ] Test: move history records correctly
  - [ ] Test: pawn promotion shows overlay

## Dev Notes

### Architecture Compliance

- **Store actions for all state mutations** — `playMove` is a Zustand action, not external state manipulation
- **chess.js for validation** — create `new Chess(fen)` instance, call `.move()`, get new FEN via `.fen()`
- **chess.js NOT in store** — create Chess instances locally, store FEN strings only
- **Pawn promotion inline in Board.tsx** — per architecture decision, not a separate component

### playMove Store Action Pattern

```typescript
playMove: (move: ClassifiedMove) => set((state) => {
  const chess = new Chess(state.fen)
  const result = chess.move({
    from: move.from,
    to: move.to,
    promotion: move.promotion,
  })
  if (!result) return state // Invalid move — should never happen

  const record: MoveRecord = {
    fen: state.fen,           // Position BEFORE the move
    played: { from: move.from, to: move.to, san: result.san, promotion: move.promotion },
    options: state.currentMoves!,
    classification: move.classification,
  }

  return {
    fen: chess.fen(),
    moveHistory: [...state.moveHistory, record],
    currentMoves: null,
  }
})
```

### Piece Fly Animation Approach

The piece animation is a CSS transition on `transform: translate()`:

1. When move is selected, calculate pixel offset from source to destination
2. Apply `transform: translate(dx, dy)` with `transition: transform 0.3s ease-out`
3. After transition ends, update the board state (pieces re-render in correct positions)
4. The animation is on the piece `<img>` element, not the square

Alternative simpler approach: use a temporary "flying piece" element positioned absolutely, animate it, then remove it when board state updates.

### Castling Animation

When the king castles, TWO pieces move:
- King moves 2 squares (e1→g1 or e1→c1)
- Rook moves to the other side of the king

chess.js `.move()` handles this — the returned FEN has both pieces in new positions. For animation, detect if the move is castling (king moves 2 squares horizontally) and animate both pieces.

### En Passant Visual

chess.js handles en passant rules. The captured pawn is on a different square than the destination. After the move, the board re-renders from FEN — the captured pawn disappears. For animation, detect en passant captures and animate the captured pawn removal.

### Promotion Overlay

Simple inline overlay in Board.tsx:
```tsx
{showPromotion && (
  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
    <div className="flex gap-2 bg-gray-800 p-4 rounded-lg">
      {['q', 'r', 'b', 'n'].map(piece => (
        <button
          key={piece}
          onClick={() => handlePromotion(piece)}
          aria-label={`Promote to ${PIECE_NAMES[piece]}`}
        >
          <img src={`/pieces/w${piece.toUpperCase()}.svg`} className="w-12 h-12" />
        </button>
      ))}
    </div>
  </div>
)}
```

### Project Structure Notes

- Depends on: Stories 1.1-1.4
- Modifies: `MoveArrows.tsx` (add click handlers), `Board.tsx` (add promotion overlay, piece animation), `game-store.ts` (implement `playMove` action)
- Does NOT trigger AI response — that's Story 1.6

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Data Flow]
- [Source: _bmad-output/planning-artifacts/architecture.md#State Management Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Animation Approach]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.5]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Animation: Pièce volante]
- [Source: _bmad-output/planning-artifacts/architecture.md#Gap Analysis - Pawn promotion UI]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
