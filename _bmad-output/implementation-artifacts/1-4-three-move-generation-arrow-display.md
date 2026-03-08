# Story 1.4: Three-Move Generation & Arrow Display

Status: ready-for-dev

## Story

As a player,
I want to see 3 move options displayed as arrows on the chessboard,
So that I can choose one of the proposed moves to play.

## Acceptance Criteria

1. When it's the player's turn and the engine is ready, 3 SVG arrows appear on the board showing source → destination for each move
2. Arrows appear with staggered animation sequence (per UX spec)
3. All 3 arrows are visually distinct and clearly identifiable (different colors or numbering)
4. Move quality classification (Top/Correct/Bof) is NOT visible to the player (blind selection)
5. Arrows have touch-optimized tap targets for mobile selection (large enough on 360px screens)
6. Arrows have descriptive ARIA labels (e.g., "Move knight from g1 to f3") (NFR8)
7. Arrow animations respect `prefers-reduced-motion` (NFR10)
8. If fewer than 3 distinct quality tiers are available, system still presents 3 valid moves
9. useStockfish hook bridges React lifecycle with engine service

## Tasks / Subtasks

- [ ] Task 1: Create useStockfish hook (AC: #9)
  - [ ] Create `src/hooks/useStockfish.ts`
  - [ ] Handle engine initialization state (`isEngineReady`)
  - [ ] Expose `generateMoves(fen)` that calls `stockfish-service.generatePlayerMoves()`
  - [ ] Store generated moves in Zustand `currentMoves` state
  - [ ] Handle loading/error states
- [ ] Task 2: Create MoveArrows component (AC: #1, #2, #3, #5, #6, #7)
  - [ ] Create `src/components/MoveArrows/MoveArrows.tsx`
  - [ ] Render SVG overlay on top of the Board component
  - [ ] Draw arrows from source square to destination square for each of the 3 moves
  - [ ] Position arrows correctly using board square coordinates (translate chess notation to pixel positions)
  - [ ] Style arrows with 3 distinct visual treatments (colors: e.g., blue, green, orange — neutral, not quality-indicating)
  - [ ] Staggered appear animation (arrow 1, then 2, then 3 with slight delay)
  - [ ] Touch targets: ensure arrow tap areas are ≥44px on mobile
  - [ ] ARIA labels on each arrow describing the move in plain language
- [ ] Task 3: Integrate with game flow (AC: #1, #8)
  - [ ] On game start (or after AI move), trigger move generation via useStockfish
  - [ ] Pass generated `ClassifiedMove[]` to MoveArrows component
  - [ ] Handle edge case: fewer than 3 legal moves (endgame positions)
- [ ] Task 4: Reduced motion support (AC: #7)
  - [ ] Use Tailwind `motion-reduce:` variant or `prefers-reduced-motion` media query
  - [ ] When reduced motion preferred, arrows appear instantly (no stagger animation)
- [ ] Task 5: Write tests (AC: all)
  - [ ] `MoveArrows.test.tsx` — renders 3 arrows given 3 moves
  - [ ] Test ARIA labels present and descriptive
  - [ ] Test arrows render at correct positions
  - [ ] `useStockfish.test.ts` — hook calls engine service correctly

## Dev Notes

### Architecture Compliance

- **MoveArrows is an SVG overlay** — rendered as a sibling or child of Board, positioned absolutely over the board
- **Components → Engine: NEVER direct** — always via `useStockfish` hook
- **Named exports**: `export function MoveArrows() { ... }`
- **Tailwind + CSS for animations** — no Framer Motion

### SVG Arrow Rendering

The UX mockup (`ux-screens.html`) already demonstrates arrow rendering. Key approach:

```tsx
// Arrow SVG overlay — positioned absolutely over the board
<svg className="absolute inset-0 pointer-events-none" viewBox="0 0 800 800">
  {moves.map((move, i) => (
    <g key={i} className="pointer-events-auto cursor-pointer">
      <line
        x1={squareToX(move.from)} y1={squareToY(move.from)}
        x2={squareToX(move.to)} y2={squareToY(move.to)}
        stroke={ARROW_COLORS[i]}
        strokeWidth={8}
        markerEnd="url(#arrowhead)"
      />
      {/* Larger invisible hitbox for touch */}
      <line
        x1={squareToX(move.from)} y1={squareToY(move.from)}
        x2={squareToX(move.to)} y2={squareToY(move.to)}
        stroke="transparent"
        strokeWidth={44}
        onClick={() => onSelectMove(move)}
        role="button"
        aria-label={`Move ${pieceNameAt(move.from)} from ${move.from} to ${move.to}`}
        tabIndex={0}
      />
    </g>
  ))}
</svg>
```

### Square-to-Pixel Coordinate Mapping

```typescript
// Convert chess notation (e.g., 'e4') to pixel center coordinates
function squareToPixel(square: string, boardSize: number): { x: number; y: number } {
  const file = square.charCodeAt(0) - 97 // 'a' = 0, 'h' = 7
  const rank = parseInt(square[1]) - 1    // '1' = 0, '8' = 7
  const squareSize = boardSize / 8
  return {
    x: (file + 0.5) * squareSize,
    y: ((7 - rank) + 0.5) * squareSize,  // Flip: rank 8 at top
  }
}
```

### Arrow Colors (Neutral — No Quality Indication)

Use 3 visually distinct colors that do NOT correlate with "good/bad":
- Arrow 1: `#5B8DEF` (blue)
- Arrow 2: `#50C878` (green)
- Arrow 3: `#FFA500` (orange)

The order of arrows must NOT correlate with quality tier. Shuffle/randomize the assignment of colors to classified moves.

### Staggered Animation

```css
@keyframes arrowAppear {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

.arrow-1 { animation: arrowAppear 0.3s ease-out 0ms forwards; }
.arrow-2 { animation: arrowAppear 0.3s ease-out 100ms forwards; }
.arrow-3 { animation: arrowAppear 0.3s ease-out 200ms forwards; }

@media (prefers-reduced-motion: reduce) {
  .arrow-1, .arrow-2, .arrow-3 {
    animation: none;
    opacity: 1;
  }
}
```

### useStockfish Hook Shape

```typescript
export function useStockfish() {
  const fen = useGameStore(state => state.fen)
  const presentMoves = useGameStore(state => state.presentMoves)
  const [isReady, setIsReady] = useState(false)

  // Initialize engine on mount
  useEffect(() => {
    initEngine().then(() => setIsReady(true))
  }, [])

  // Generate moves when it's player's turn
  const generateMoves = useCallback(async () => {
    const moves = await generatePlayerMoves(fen, depth)
    presentMoves(moves)
  }, [fen])

  return { isReady, generateMoves }
}
```

### Project Structure Notes

- Depends on: Story 1.1 (types), Story 1.2 (engine service), Story 1.3 (Board component, store)
- Creates: `src/components/MoveArrows/MoveArrows.tsx`, `src/hooks/useStockfish.ts`
- This story is DISPLAY only for arrows — selection/execution is Story 1.5

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Component Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Engine Integration Patterns]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.4]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Composant: Flèches de coup]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Micro-interactions]
- [Source: _bmad-output/planning-artifacts/architecture.md#Animation Approach]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
