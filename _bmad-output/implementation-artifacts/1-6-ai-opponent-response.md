# Story 1.6: AI Opponent Response

Status: ready-for-dev

## Story

As a player,
I want the AI to respond with its own move after I play,
So that I experience a natural back-and-forth chess game.

## Acceptance Criteria

1. After the player plays a move, the AI calculates and plays a response freely (not constrained to 3 options) at the configured ELO level (default 1000)
2. Artificial delay of ~1 second applied before the AI's move appears (FR12)
3. AI's piece animates from source to destination (opponent move animation per UX spec)
4. Board state updates to reflect the AI's move
5. After the AI moves, system automatically generates 3 new move options for the player's next turn
6. Full turn cycle (player move → AI response → new 3-move options) flows seamlessly
7. During AI "thinking" time, UI indicates it's the opponent's turn (subtle visual cue)

## Tasks / Subtasks

- [ ] Task 1: AI response trigger (AC: #1, #2)
  - [ ] After `playMove` updates the store, detect that it's now the AI's turn (black to move)
  - [ ] Call `useStockfish.getAIMove(fen, elo)` to get AI response
  - [ ] Apply ~1s artificial delay AFTER Stockfish returns (total visible delay = Stockfish time + padding to reach ~1s)
  - [ ] Use `setTimeout` or `requestAnimationFrame` for the delay
- [ ] Task 2: AI move execution (AC: #3, #4)
  - [ ] Implement `playAIMove(move)` store action
  - [ ] Validate AI move with chess.js
  - [ ] Update FEN, do NOT append to player moveHistory (AI moves are implicit)
  - [ ] Animate AI piece movement (reuse piece fly animation from Story 1.5)
- [ ] Task 3: Turn cycle automation (AC: #5, #6)
  - [ ] After AI move completes, automatically trigger `generatePlayerMoves()` for new position
  - [ ] Present 3 new classified moves to the player
  - [ ] Full cycle: player selects arrow → piece moves → ~1s delay → AI piece moves → new arrows appear
- [ ] Task 4: "Opponent thinking" indicator (AC: #7)
  - [ ] During the AI delay, show a subtle visual cue (e.g., pulsing indicator, dimmed arrows area)
  - [ ] Don't block the UI — player can still see the board
  - [ ] Remove indicator when AI moves
- [ ] Task 5: Update useStockfish hook (AC: all)
  - [ ] Add `getAIResponse(fen, elo)` method to hook
  - [ ] Orchestrate the full turn cycle within the hook
  - [ ] Handle errors: if AI move fails, retry once, then show error
- [ ] Task 6: Write tests (AC: all)
  - [ ] Test: AI move triggered after player move
  - [ ] Test: artificial delay is applied (~1s)
  - [ ] Test: new player moves generated after AI response
  - [ ] Test: full turn cycle completes

## Dev Notes

### Architecture Compliance

- **Hook → Engine only**: `useStockfish` calls `stockfish-service.ts.getAIMove()` — components never call the service directly
- **Store actions**: `playAIMove` is a Zustand action like `playMove`
- **No loading spinners for AI delay**: the ~1s delay IS the UX rhythm (FR12), not a loading state. Show a subtle "opponent's turn" cue, not a spinner.

### Turn Cycle Orchestration

The full turn cycle lives in `useStockfish` hook:

```typescript
// In useStockfish hook
const handlePlayerMove = useCallback(async (move: ClassifiedMove) => {
  // 1. Player move already applied to store by playMove action
  const newFen = useGameStore.getState().fen

  // 2. Check if game is over after player move
  const chess = new Chess(newFen)
  if (chess.isGameOver()) return // Story 1.7 handles this

  // 3. Get AI response
  const aiMove = await getAIMove(newFen, settings.opponentElo)

  // 4. Apply artificial delay (pad to ~1s total)
  await delay(1000) // Or calculate: 1000 - elapsedTime

  // 5. Execute AI move
  playAIMove(aiMove)

  // 6. Check if game is over after AI move
  const postAiFen = useGameStore.getState().fen
  const postAiChess = new Chess(postAiFen)
  if (postAiChess.isGameOver()) return // Story 1.7 handles this

  // 7. Generate new player moves
  const moves = await generatePlayerMoves(postAiFen, depth)
  presentMoves(moves)
}, [])
```

### playAIMove Store Action

```typescript
playAIMove: (move: { from: string; to: string; promotion?: string }) => set((state) => {
  const chess = new Chess(state.fen)
  chess.move(move)
  return { fen: chess.fen() }
  // Note: AI moves are NOT added to player moveHistory
  // moveHistory tracks player decisions only
})
```

### Artificial Delay Strategy

Per FR12, the delay creates natural game rhythm. Implementation:
1. Record timestamp before calling `getAIMove`
2. After response, compute `elapsed = Date.now() - startTime`
3. If `elapsed < 1000ms`, wait for `1000 - elapsed` ms
4. If `elapsed >= 1000ms`, execute immediately (Stockfish was slow)
5. This ensures consistent ~1s visible delay regardless of engine speed

### Visual "Thinking" Indicator

Keep it subtle — per UX spec, this is about rhythm not loading:
- Slight board overlay dimming
- Or a small animated dot near the opponent's side
- NOT a full-screen spinner or loading bar

### Project Structure Notes

- Depends on: Stories 1.1-1.5
- Modifies: `useStockfish.ts` (add AI response orchestration), `game-store.ts` (add `playAIMove` action)
- After this story, a complete player turn → AI response → new options cycle works end to end

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Data Flow]
- [Source: _bmad-output/planning-artifacts/architecture.md#Loading State Patterns]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.6]
- [Source: _bmad-output/planning-artifacts/prd.md#FR12]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Animation: Coup adverse]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
