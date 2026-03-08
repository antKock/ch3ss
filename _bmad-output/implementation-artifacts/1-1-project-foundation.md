# Story 1.1: Project Foundation

Status: ready-for-dev

## Story

As a developer,
I want a fully configured Vite + React TypeScript project with all dependencies installed,
So that I have a working development environment to build ch3ss.

## Acceptance Criteria

1. Project initialized with `npm create vite@latest ch3ss -- --template react-swc-ts` (or equivalent scaffolding producing the same result)
2. Project builds and runs with `npm run dev`
3. Tailwind CSS is configured and functional (utility classes render correctly)
4. Dependencies installed: Zustand v5.0.10, chess.js v1.4.0, stockfish v18.0.5
5. Vitest configured with jsdom environment and React Testing Library (`@testing-library/react`, `@testing-library/jest-dom`)
6. ESLint configured (Vite default + React rules)
7. Project directory structure matches architecture spec:
   - `src/components/` (empty folders: `Board/`, `MoveArrows/`, `GameControls/`, `EndGame/`, `Settings/`, `Header/`)
   - `src/engine/`
   - `src/store/`
   - `src/hooks/`
   - `src/types/`
8. TypeScript types file `src/types/chess.ts` defines all interfaces per architecture spec: `GameState`, `MoveRecord`, `ClassifiedMove`, `GameResult`, `CompletedGame`
9. `.env.example` created with `VITE_STOCKFISH_DEPTH=12`, `VITE_THRESHOLD_T1=30`, `VITE_THRESHOLD_T2=100`
10. Poppins font loaded via Google Fonts (`<link>` in `index.html`)
11. Dark theme (sable) base styles applied as default in `index.css` with Tailwind directives
12. `public/pieces/` directory created with placeholder structure for chess SVGs (12 files: `wK.svg`, `wQ.svg`, `wR.svg`, `wB.svg`, `wN.svg`, `wP.svg`, `bK.svg`, `bQ.svg`, `bR.svg`, `bB.svg`, `bN.svg`, `bP.svg`)
13. `public/icons/` directory created for PWA icons
14. A basic smoke test passes (`npm run test` exits cleanly)

## Tasks / Subtasks

- [ ] Task 1: Scaffold Vite + React + TypeScript project (AC: #1, #2)
  - [ ] Run `npm create vite@latest` with `react-swc-ts` template
  - [ ] Verify `npm run dev` works
- [ ] Task 2: Install and configure Tailwind CSS (AC: #3)
  - [ ] Install `tailwindcss @tailwindcss/vite`
  - [ ] Add Tailwind plugin to `vite.config.ts`
  - [ ] Add `@import "tailwindcss"` to `index.css`
  - [ ] Verify utility classes render in a test element
- [ ] Task 3: Install core dependencies (AC: #4)
  - [ ] `npm install zustand@5.0.10 chess.js@1.4.0 stockfish@18.0.5`
  - [ ] Verify packages in `package.json`
- [ ] Task 4: Configure Vitest + React Testing Library (AC: #5, #14)
  - [ ] `npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom`
  - [ ] Create or update `vitest.config.ts` with jsdom environment
  - [ ] Add `"test": "vitest"` script to `package.json`
  - [ ] Write a minimal smoke test (e.g., `App.test.tsx` rendering App)
- [ ] Task 5: Set up project directory structure (AC: #7)
  - [ ] Create all component directories with `.gitkeep` or placeholder files
  - [ ] Create `src/engine/`, `src/store/`, `src/hooks/`, `src/types/`
- [ ] Task 6: Define TypeScript types (AC: #8)
  - [ ] Create `src/types/chess.ts` with all interfaces from architecture spec
- [ ] Task 7: Environment variables (AC: #9)
  - [ ] Create `.env.example` with Stockfish tuning variables
  - [ ] Create `.env` (gitignored) with same defaults
- [ ] Task 8: Font and theme setup (AC: #10, #11)
  - [ ] Add Poppins Google Fonts link to `index.html`
  - [ ] Configure dark sable theme as default in `index.css`
  - [ ] Set `font-family: 'Poppins', sans-serif` as base
- [ ] Task 9: Static asset directories (AC: #12, #13)
  - [ ] Create `public/pieces/` with 12 SVG chess piece files (simple placeholder SVGs are OK — real assets can come later)
  - [ ] Create `public/icons/` directory

## Dev Notes

### Architecture Compliance

- **Starter template**: `npm create vite@latest ch3ss -- --template react-swc-ts`
- **Naming conventions**: PascalCase for component folders/files, kebab-case for non-component TS files
- **Named exports only** — no default exports anywhere
- **Tailwind for all styling** — no CSS modules, no styled-components
- **ESM-first** module system

### TypeScript Types to Define

```typescript
// src/types/chess.ts

export interface ClassifiedMove {
  from: string
  to: string
  san: string
  classification: 'top' | 'correct' | 'bof'
  evalLoss: number // centipawns
  promotion?: string
}

export interface MoveRecord {
  fen: string                    // Position before move
  played: { from: string; to: string; san: string; promotion?: string }
  options: ClassifiedMove[]      // The 3 options presented
  classification: 'top' | 'correct' | 'bof'  // What the player picked
}

export type GameResult =
  | { type: 'checkmate'; winner: 'w' | 'b' }
  | { type: 'stalemate' }
  | { type: 'resignation'; resignedBy: 'w' | 'b' }

export interface GameState {
  fen: string
  moveHistory: MoveRecord[]
  gamePhase: 'playing' | 'ended'
  result?: GameResult
  playerColor: 'w'              // Player always white at MVP
}

export interface Settings {
  opponentElo: number            // 800-1600, default 1000
  theme: 'dark' | 'light'       // default 'dark'
}

export interface CompletedGame {
  date: string                   // ISO date
  result: GameResult
  moveCount: number
  playerColor: 'w'
}
```

### Tailwind Dark Theme Configuration

The dark theme (sable) is the PRIMARY theme. Set it as default in `index.css`:
- Background: dark charcoal/sable tones
- Text: light/white
- Accent colors per UX spec

Use Tailwind's `dark:` variant system OR apply dark as default with light as toggle. Architecture says dark is primary, so apply dark styles at the root level, use a `.light` class toggle for the light theme alternative.

### Poppins Font

Load from Google Fonts in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
```
Set in Tailwind config or `index.css` as the default font family.

### Project Structure Notes

- This is a greenfield project — no existing code to integrate with
- The component folders should be created but can be empty (or with placeholder index files)
- `src/types/chess.ts` is the ONLY file that needs real content in this story
- The rest of the app structure gets populated in subsequent stories

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Starter Template Evaluation]
- [Source: _bmad-output/planning-artifacts/architecture.md#Complete Project Directory Structure]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Core Architectural Decisions]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1]
- [Source: _bmad-output/planning-artifacts/prd.md#Web App Specific Requirements]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Executive Summary]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
