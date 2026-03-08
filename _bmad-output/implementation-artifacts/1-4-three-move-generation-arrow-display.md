# Story 1.4: Three-Move Generation & Arrow Display

Status: review

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

- [x] Task 1: Create useStockfish hook (AC: #9)
  - [x] Create `src/hooks/useStockfish.ts`
  - [x] Handle engine initialization state (`isEngineReady`)
  - [x] Expose `generateMoves(fen)` that calls `stockfish-service.generatePlayerMoves()`
  - [x] Store generated moves in Zustand `currentMoves` state
  - [x] Handle loading/error states
- [x] Task 2: Create MoveArrows component (AC: #1, #2, #3, #5, #6, #7)
  - [x] Create `src/components/MoveArrows/MoveArrows.tsx`
  - [x] Render SVG overlay on top of the Board component
  - [x] Draw arrows from source square to destination square for each of the 3 moves
  - [x] Position arrows correctly using board square coordinates (translate chess notation to pixel positions)
  - [x] Style arrows with 3 distinct visual treatments (colors: e.g., blue, green, orange — neutral, not quality-indicating)
  - [x] Staggered appear animation (arrow 1, then 2, then 3 with slight delay)
  - [x] Touch targets: ensure arrow tap areas are ≥44px on mobile
  - [x] ARIA labels on each arrow describing the move in plain language
- [x] Task 3: Integrate with game flow (AC: #1, #8)
  - [x] On game start (or after AI move), trigger move generation via useStockfish
  - [x] Pass generated `ClassifiedMove[]` to MoveArrows component
  - [x] Handle edge case: fewer than 3 legal moves (endgame positions)
- [x] Task 4: Reduced motion support (AC: #7)
  - [x] Use Tailwind `motion-reduce:` variant or `prefers-reduced-motion` media query
  - [x] When reduced motion preferred, arrows appear instantly (no stagger animation)
- [x] Task 5: Write tests (AC: all)
  - [x] `MoveArrows.test.tsx` — renders 3 arrows given 3 moves
  - [x] Test ARIA labels present and descriptive
  - [x] Test arrows render at correct positions
  - [x] `useStockfish.test.ts` — hook calls engine service correctly

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

Claude Opus 4.6

### Completion Notes List

- Created useStockfish hook bridging React lifecycle with engine service
- Created MoveArrows SVG overlay component with 3 distinct arrow colors
- Arrows have staggered CSS animation (300ms each, 100ms delays)
- Touch-optimized hitboxes (44px invisible stroke), ARIA labels, keyboard nav
- Colors randomly shuffled to avoid quality correlation
- prefers-reduced-motion support via CSS
- 4 MoveArrows tests + 1 useStockfish test passing

### Change Log

- 2026-03-08: Story 1.4 implemented — Move arrows + useStockfish hook

### File List

- src/hooks/useStockfish.ts (new)
- src/hooks/useStockfish.test.ts (new)
- src/components/MoveArrows/MoveArrows.tsx (new)
- src/components/MoveArrows/MoveArrows.test.tsx (new)
- src/index.css (modified — arrow + checkmate animations)
