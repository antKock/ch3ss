# Story 1.3: Interactive Chessboard

Status: review

## Story

As a player,
I want to see a chessboard with pieces in their standard starting positions,
So that I have a visual game board to play on.

## Acceptance Criteria

1. 8x8 chessboard displayed with alternating light/dark squares
2. All 32 pieces shown in standard starting positions using SVG piece images from `public/pieces/`
3. Board is mobile-first, filling available width on 360-428px screens (portrait)
4. Board scales responsively on tablet/desktop (max-width capped to avoid oversized board)
5. Square coordinates (a-h, 1-8) subtly indicated on edge squares
6. Board meets WCAG AA color contrast requirements (NFR9)
7. All board squares have descriptive ARIA labels (e.g., "e4, white pawn") (NFR8)
8. Board is keyboard-navigable — Tab through squares, Enter to select (NFR7)
9. Board renders at 60fps with no dropped frames (NFR5)
10. Board reads position from Zustand store `fen` field (chess.js parses FEN to piece placement)

## Tasks / Subtasks

- [x] Task 1: Create Zustand game store foundation (AC: #10)
  - [x] Create `src/store/game-store.ts` with initial state (starting FEN, gamePhase: 'playing')
  - [x] Use Zustand v5.0.10 with persist middleware
  - [x] Define store actions: `playMove`, `startNewGame` (stubs for now)
  - [x] Persist `gameState` and `settings`, NOT `ui` state
- [x] Task 2: Create Board component (AC: #1, #2, #3, #4, #9)
  - [x] Create `src/components/Board/Board.tsx`
  - [x] Render 8x8 grid using CSS Grid or Flexbox
  - [x] Alternate square colors (dark sable theme colors)
  - [x] Parse FEN from store using chess.js `Chess` instance (create from FEN, read board)
  - [x] Render piece SVGs from `public/pieces/{color}{piece}.svg`
  - [x] Mobile-first sizing: `width: min(100vw - padding, 428px)`, square = width/8
  - [x] Use CSS transforms for any animations (GPU-accelerated, 60fps)
- [x] Task 3: Chess piece SVGs (AC: #2)
  - [x] Source or create 12 chess piece SVG files for `public/pieces/`
  - [x] File naming: `wK.svg`, `wQ.svg`, `wR.svg`, `wB.svg`, `wN.svg`, `wP.svg`, `bK.svg`, `bQ.svg`, `bR.svg`, `bB.svg`, `bN.svg`, `bP.svg`
  - [x] SVGs should be clean, scalable, and visually clear at small sizes
- [x] Task 4: Coordinates display (AC: #5)
  - [x] Show file letters (a-h) on bottom edge
  - [x] Show rank numbers (1-8) on left edge
  - [x] Subtle styling — small font, low contrast, not distracting
- [x] Task 5: Accessibility (AC: #6, #7, #8)
  - [x] Add ARIA labels to each square: `aria-label="e4, white pawn"` or `aria-label="e4, empty"`
  - [x] Make squares focusable with `tabIndex` for keyboard navigation
  - [x] Ensure square colors pass WCAG AA contrast (3:1 for UI components)
  - [x] Test with keyboard navigation (Tab through board)
- [x] Task 6: Write tests (AC: all)
  - [x] `Board.test.tsx` — renders 64 squares, shows pieces in starting position
  - [x] Test piece placement matches starting FEN
  - [x] Test ARIA labels are present and descriptive
  - [x] Test responsive sizing

## Dev Notes

### Architecture Compliance

- **Named export**: `export function Board() { ... }` — no default exports
- **Tailwind styling**: use Tailwind utilities for layout, colors, spacing. Use inline `style={}` ONLY for dynamic values (square sizes, piece positions)
- **FEN from store**: `const fen = useGameStore(state => state.fen)` — use Zustand selector
- **chess.js usage**: create `new Chess(fen)` locally in component to read board state. Do NOT store Chess instance in Zustand — store FEN strings only
- **Component folder**: `src/components/Board/Board.tsx` + `Board.test.tsx`

### Zustand Store Initial Shape

```typescript
// src/store/game-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GameStore {
  // Game state (persisted)
  fen: string
  moveHistory: MoveRecord[]
  gamePhase: 'playing' | 'ended'
  result?: GameResult
  playerColor: 'w'

  // Settings (persisted)
  settings: {
    opponentElo: number  // default 1000
    theme: 'dark' | 'light'  // default 'dark'
  }

  // UI state (NOT persisted)
  currentMoves: ClassifiedMove[] | null  // 3 moves to display
  isEngineReady: boolean

  // Actions
  playMove: (move: ClassifiedMove) => void
  startNewGame: () => void
  updateSettings: (settings: Partial<Settings>) => void
  presentMoves: (moves: ClassifiedMove[]) => void
}
```

Use `partialize` option in persist to exclude UI state:
```typescript
persist(storeCreator, {
  name: 'ch3ss-game',
  partialize: (state) => ({
    fen: state.fen,
    moveHistory: state.moveHistory,
    gamePhase: state.gamePhase,
    result: state.result,
    playerColor: state.playerColor,
    settings: state.settings,
  }),
})
```

### Board Rendering Strategy

- Use CSS Grid for the 8x8 layout: `grid-template-columns: repeat(8, 1fr)`
- Each square is a `<div>` with conditional background color
- Pieces rendered as `<img>` tags inside squares, sized to fill the square
- Board container width: `min(calc(100vw - 2rem), 428px)` — full width on mobile with padding, capped on larger screens
- Square size = container width / 8

### Piece SVG Mapping

```typescript
// Map chess.js piece codes to SVG filenames
const PIECE_MAP: Record<string, string> = {
  'wk': '/pieces/wK.svg', 'wq': '/pieces/wQ.svg',
  'wr': '/pieces/wR.svg', 'wb': '/pieces/wB.svg',
  'wn': '/pieces/wN.svg', 'wp': '/pieces/wP.svg',
  'bk': '/pieces/bK.svg', 'bq': '/pieces/bQ.svg',
  'br': '/pieces/bR.svg', 'bb': '/pieces/bB.svg',
  'bn': '/pieces/bN.svg', 'bp': '/pieces/bP.svg',
}
```

chess.js `.board()` returns a 2D array with `{ type: 'k', color: 'w' }` objects or `null` for empty squares.

### Dark Theme Square Colors

Per UX spec (sable theme):
- Light squares: warm neutral (e.g., `#B7C0D8` or similar from UX spec)
- Dark squares: deep sable (e.g., `#4A5568` or similar)
- These should be defined as CSS custom properties or Tailwind theme extensions for theme switching later

### Project Structure Notes

- Depends on: Story 1.1 (project setup, types)
- Creates: `src/components/Board/Board.tsx`, `src/store/game-store.ts`
- The Zustand store created here is the FOUNDATION for all subsequent stories
- This story focuses on DISPLAY only — no interaction, no move selection yet

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Component Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#State Management Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Complete Project Directory Structure]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Composant: Échiquier]
- [Source: _bmad-output/planning-artifacts/architecture.md#Anti-Patterns to Avoid]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No issues encountered.

### Completion Notes List

- Created Zustand game store with persist middleware (partializing UI state out)
- Created Board component with 8x8 CSS grid, piece rendering from FEN via chess.js
- Mobile-first sizing: min(100vw-2rem, 428px)
- ARIA labels on every square, keyboard navigable with tabIndex
- Coordinate labels on edges (files a-h bottom, ranks 1-8 left)
- 8 tests passing for Board component

### Change Log

- 2026-03-08: Story 1.3 implemented — Interactive chessboard with store

### File List

- src/store/game-store.ts (new)
- src/components/Board/Board.tsx (new)
- src/components/Board/Board.test.tsx (new)
