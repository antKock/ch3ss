---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-03-08'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/product-brief-ch3ss-2026-03-07.md
  - docs/chess3-brief.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/planning-artifacts/ux-screens.html
workflowType: 'architecture'
project_name: 'ch3ss'
user_name: 'Anthony'
date: '2026-03-08'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
22 FRs spanning 6 categories. The architecture is driven by the 3-move selection mechanic (FR2-FR4), which requires Stockfish multi-PV analysis, eval-loss classification, and blind presentation. Game persistence (FR13-FR14) and offline play (FR19-FR21) require careful localStorage and Service Worker strategies. The AI opponent (FR5, FR12) runs freely at configurable ELO with artificial delay for natural rhythm. All other FRs (board rendering, game flow, settings) are standard SPA concerns.

**Non-Functional Requirements:**
13 NFRs in 3 categories. Performance NFRs are the most architecturally significant: Stockfish must complete move generation in <200ms P95 on mid-range mobile (NFR1), UI interactions must stay under 400ms (NFR2), and board animations must maintain 60fps (NFR5). The WASM binary (~2-4MB) must load asynchronously without blocking first render (NFR6). Reliability NFRs require game state to survive browser crashes and OS kills (NFR11-NFR13).

**UX Complexity:**
The UX specification defines rich animated interactions: arrow appear/dismiss sequences for move presentation, piece fly animations, opponent move animations, undo mechanic with cooldown ring, and checkmate halo/tremble effects. Mobile-first design (360-428px) with dark theme (sable) as primary. Single-screen SPA with settings drawer overlay and end-game screen. Poppins typography throughout.

**Scale & Complexity:**
- Primary domain: Frontend Web (PWA, mobile-first SPA)
- Complexity level: Low
- Estimated architectural components: ~6 (Board/UI, Chess Engine Worker, Move Selection Logic, Game State Management, Service Worker/PWA, Settings/Persistence)

### Technical Constraints & Dependencies

- **Framework: React** — Confirmed tech stack. Enables future native distribution via Capacitor (PWA wrapping) or React Native port.
- **Hosting: Vercel** — Already in use. Static deployment, edge network, good fit for zero-backend PWA.
- **Future native distribution** — If the concept validates, the app targets iOS App Store + Google Play. Tech stack must enable a credible path to native packaging (e.g., Capacitor wrapping the PWA) without a rewrite.
- **Stockfish.js** — WASM binary running in Web Worker, client-side only. Main performance risk on mobile devices.
- **chess.js** — Standard chess rules engine for move validation, game state management.
- **Zero backend** — Static hosting on Vercel. No API, no database, no server-side code.
- **localStorage** — ~5MB limit per origin. Game state (FEN + move history) is well within limits. History list may need pruning.
- **WebAssembly** — Required by all target browsers (modern evergreen only: Chrome, Safari, Firefox, Edge).
- **Service Worker** — Caches app shell and WASM binary for full offline capability after initial load.

### Cross-Cutting Concerns Identified

- **Web Worker communication** — postMessage protocol for Stockfish requests/responses affects move selection, AI opponent, and engine initialization flows
- **State persistence** — localStorage must be written at every state change to survive unexpected app kills (FR13, NFR11)
- **Animation performance** — Rich animations (arrows, piece moves, effects) must coexist with 60fps constraint on mobile
- **Asset loading strategy** — WASM binary is the largest asset; loading/caching strategy affects initial load, offline capability, and first interaction time
- **ELO-dependent behavior** — Configurable opponent ELO (800-1600) and eval-loss thresholds affect both move generation and AI opponent play
- **Native distribution path** — Tech stack must not paint into a corner. The PWA must be architectable so that wrapping for app stores (via Capacitor or similar) is feasible without a rewrite. This affects framework choice, asset loading, and any browser-specific APIs used.

## Starter Template Evaluation

### Primary Technology Domain

Frontend Web — Single Page Application (PWA, mobile-first, offline-capable). No SSR, no routing, no backend.

### Starter Options Considered

| Option | Fit | Verdict |
|--------|-----|---------|
| **Vite + React** | Perfect — lightweight SPA builder, fast dev, excellent PWA plugin | **Selected** |
| **Next.js** | Overkill — SSR/routing/API routes not needed for a single-screen SPA | Rejected |
| **Create React App** | Deprecated, no longer maintained | Rejected |

### Selected Starter: Vite + React TypeScript (SWC)

**Rationale:** Vite is the modern standard for React SPAs. Zero overhead from features we don't need (SSR, file-based routing, API layers). Fast dev server with HMR, optimized production builds, and a mature PWA plugin ecosystem. Deploys as static site on Vercel.

**Initialization Command:**

```bash
npm create vite@latest ch3ss -- --template react-swc-ts
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript with SWC for fast compilation
- ESM-first module system

**Styling Solution:**
- Tailwind CSS (added post-init) — utility-first, mobile-friendly, fast iteration

**Build Tooling:**
- Vite 6.x — Rollup-based production builds, esbuild/SWC for dev
- Tree-shaking, code splitting, asset optimization out of the box

**Testing Framework:**
- Vitest — native Vite integration, Jest-compatible API, fast parallel execution
- React Testing Library — component testing
- jsdom environment for DOM simulation

**PWA Support:**
- vite-plugin-pwa — zero-config Service Worker via Workbox, manifest generation, offline caching

**Code Organization:**
- Flat `src/` structure appropriate for a low-complexity SPA

**Development Experience:**
- Hot Module Replacement (HMR) via Vite dev server
- TypeScript type-checking
- ESLint for linting

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
1. State management: Zustand v5.0.10 with persist middleware
2. Web Worker communication: Promise-based service wrapper over Stockfish
3. Animation approach: CSS animations + Tailwind (no library)
4. Component architecture: Feature-based flat structure with engine separation

**Important Decisions (Shape Architecture):**
5. localStorage data model with typed game state
6. Stockfish package: `stockfish` v18.0.5 (npm, WASM + Web Worker)
7. Game history: capped at 100 entries, FIFO pruning

**Deferred Decisions (Post-MVP):**
- CI/CD pipeline (manual Vercel deploys from git push)
- Monitoring/analytics
- Capacitor native wrapping (only if concept validates)

### Frontend Architecture

**State Management: Zustand v5.0.10**
- Single store with logical slices: `gameState`, `settings`, `ui`
- `persist` middleware for automatic localStorage sync — covers FR13/FR14/NFR11 with minimal code
- No providers or wrappers needed — clean, direct store access from any component
- Rationale: Perfect fit for a small SPA with persistence needs. React Context + useReducer would work but requires more boilerplate for the same result.

**Component Architecture: Feature-based flat structure**
```
src/
  components/
    Board/          # Chessboard rendering, square interactions
    MoveArrows/     # SVG arrow overlay for 3-move presentation
    GameControls/   # Resign, new game, undo
    EndGame/        # Game-over overlay with stats
    Settings/       # Settings drawer (ELO, theme)
    Header/         # App header with gear icon
  engine/
    stockfish.worker.ts   # Web Worker wrapper
    stockfish-service.ts  # High-level API (generateMoves, getAIMove)
    move-classifier.ts    # Eval-loss bucket algorithm (Top/Correct/Bof)
  store/
    game-store.ts         # Zustand store (game state, settings, UI)
  hooks/
    useStockfish.ts       # React hook wrapping engine service
  types/
    chess.ts              # Game types, move types, store types
  App.tsx
  main.tsx
```
- Rationale: Flat enough for a low-complexity SPA, but separates the chess engine logic (pure TypeScript, no React) from UI components. The `engine/` folder is framework-agnostic — portable to React Native if needed later.

**Animation Approach: CSS animations + Tailwind**
- CSS `@keyframes` and transitions for all animations (arrow appear/dismiss, piece fly, checkmate effects)
- Tailwind utility classes for transitions where possible
- No animation library (Framer Motion adds ~30KB for animations achievable with CSS)
- SVG animations for arrow rendering (already demonstrated in ux-screens.html)
- `prefers-reduced-motion` respected via Tailwind's `motion-reduce:` variant (NFR10)
- Rationale: The UX mockup already implements all animations in pure CSS/JS. No need for a library.

**Routing: None**
- Single screen SPA — no router needed. Game phases (playing, ended, settings) managed via Zustand UI state.

### API & Communication

**Web Worker Communication: Promise-based wrapper**
- `stockfish-service.ts` wraps the raw `postMessage`/`onmessage` protocol in a clean async API
- Two primary operations: `generatePlayerMoves(fen, depth)` → returns 3 classified moves, `getAIMove(fen, elo)` → returns single AI move
- Worker initialized once on app load, kept alive for the session
- Error handling: timeout after 5s (safety net, should never hit), graceful fallback if Worker fails to initialize
- Rationale: Raw postMessage is error-prone and hard to test. A service layer provides a clean boundary between engine and UI.

### Data Architecture (localStorage)

**Game State Model:**
```typescript
interface GameState {
  fen: string                    // Current board position
  moveHistory: MoveRecord[]      // All moves played this game
  gamePhase: 'playing' | 'ended' // Current phase
  result?: GameResult            // Win/loss/draw/resign
  playerColor: 'w' | 'b'        // Player's color
  settings: {
    opponentElo: number          // 800-1600
    theme: 'dark' | 'light'     // Visual theme
  }
}

interface MoveRecord {
  fen: string                    // Position before move
  played: Move                   // Move the player chose
  options: ClassifiedMove[]      // The 3 options presented
  classification: 'top' | 'correct' | 'bof'  // What they picked
}

interface GameHistory {
  games: CompletedGame[]         // Max ~100 games stored
}
```

**Pruning Strategy:** Cap game history at 100 entries, FIFO. At ~500 bytes per completed game summary, 100 games = ~50KB — well within localStorage limits.

### Infrastructure & Deployment

**Hosting:** Vercel static deployment (confirmed)
- `vite build` → `dist/` → Vercel auto-deploys from git push
- No server functions, no edge functions, no API routes

**Environment Configuration:**
- Dev thresholds (T1, T2, Stockfish depth) exposed via `.env` variables for playtesting tuning
- No production env vars needed (no secrets, no API keys)

**Stockfish Package: `stockfish` v18.0.5 (npm)**
- WASM binary with Web Worker support
- Stockfish 18 engine — latest, well-maintained
- Binary cached by Service Worker after first load

### Decision Impact Analysis

**Implementation Sequence:**
1. Project init (Vite + React + TS + Tailwind)
2. Stockfish Web Worker integration + service layer (validate <200ms on mobile — go/no-go gate)
3. Chess.js integration + game state store (Zustand)
4. Board rendering + move arrow presentation
5. Game flow (start, play, end, replay)
6. Settings, theme, persistence
7. PWA (Service Worker, manifest, offline)
8. Animations and polish

**Cross-Component Dependencies:**
- `engine/` depends on nothing (pure TS + Stockfish)
- `store/` depends on `engine/` types only
- `components/` depend on `store/` and `hooks/`
- `hooks/` bridge `engine/` and React lifecycle

## Implementation Patterns & Consistency Rules

### Critical Conflict Points Identified

12 areas where AI agents could make different choices, grouped by relevance to this project.

### Naming Patterns

**File & Directory Naming:**
- Component folders: `PascalCase` — `Board/`, `MoveArrows/`, `EndGame/`
- Component files: `PascalCase.tsx` — `Board.tsx`, `MoveArrows.tsx`
- Non-component TS files: `kebab-case.ts` — `stockfish-service.ts`, `game-store.ts`, `move-classifier.ts`
- Test files: co-located, `*.test.ts` or `*.test.tsx` — `stockfish-service.test.ts`
- Types files: `kebab-case.ts` — `chess.ts`

**Code Naming:**
- Components: `PascalCase` — `Board`, `MoveArrows`, `GameControls`
- Functions/hooks: `camelCase` — `generatePlayerMoves`, `useStockfish`
- Variables/constants: `camelCase` — `gamePhase`, `opponentElo`
- Global constants: `UPPER_SNAKE_CASE` — `DEFAULT_ELO`, `MAX_HISTORY_SIZE`, `EVAL_THRESHOLD_T1`
- Types/interfaces: `PascalCase` — `GameState`, `MoveRecord`, `ClassifiedMove`
- Zustand store actions: `camelCase` verbs — `playMove`, `startNewGame`, `updateSettings`
- Enums/union types: prefer string literal unions over enums — `'playing' | 'ended'` not `enum GamePhase`

### Structure Patterns

**Project Organization:**
- Tests co-located next to source files (`*.test.ts` alongside `*.ts`)
- No `__tests__/` directories
- Components organized by feature (as defined in component architecture)
- Shared types in `src/types/`
- Constants in relevant files, not a global `constants.ts` (unless truly cross-cutting)

**Static Assets:**
- Chess piece SVGs in `public/pieces/` — named `{color}{piece}.svg` (e.g., `wK.svg`, `bQ.svg`)
- App icons in `public/icons/`
- No assets inside `src/` unless they need build processing

### State Management Patterns

**Zustand Store Rules:**
- Single store in `src/store/game-store.ts`
- State is immutable — always return new objects, never mutate
- Actions defined inside the store (not external functions)
- Selectors: use shallow equality when selecting multiple fields — `useGameStore(state => ({ fen: state.fen, phase: state.gamePhase }), shallow)`
- Persist middleware: persist only `gameState` and `settings`, NOT `ui` state (transient)
- No derived state in the store — compute in components or selectors

**State Update Pattern:**
```typescript
// GOOD: action inside store
playMove: (move) => set((state) => ({
  fen: newFen,
  moveHistory: [...state.moveHistory, record],
}))

// BAD: external mutation
const state = useGameStore.getState()
state.fen = newFen  // Never do this
```

### Component Patterns

**Component Structure:**
- Functional components only (no class components)
- Props typed with `interface`, not `type` — `interface BoardProps { ... }`
- No default exports — use named exports: `export function Board() { ... }`
- One component per file (small helpers in same file are OK)
- Tailwind for all styling — no inline `style={}` except for dynamic values (board square colors, piece positions)

**Component Hierarchy:**
```
App
├── Header
├── Board
│   └── MoveArrows (SVG overlay)
├── GameControls
├── EndGame (conditional overlay)
└── Settings (conditional drawer)
```

### Engine Integration Patterns

**Web Worker Communication:**
- All Stockfish communication goes through `stockfish-service.ts` — components never touch the Worker directly
- Service methods return Promises — `async generatePlayerMoves(fen: string, depth: number): Promise<ClassifiedMove[]>`
- Worker errors are caught and surfaced as typed errors, never swallowed silently
- Service is a singleton — instantiated once, imported where needed

**Chess.js Usage:**
- chess.js `Chess` instance is NOT stored in Zustand (it's mutable, not serializable)
- Create `Chess` instance from FEN when needed for move validation/generation
- Store FEN strings in state, not Chess objects

### Error Handling Patterns

**Error Boundaries:**
- One top-level React Error Boundary wrapping `App`
- Engine errors: show a toast/message, allow retry — never crash the app
- State corruption: if localStorage state is unparseable, reset to fresh game (no crash)

**Error Logging:**
- `console.error` for actual errors
- `console.warn` for recoverable issues
- No `console.log` in production code (use only during dev)

### Loading State Patterns

**Loading UI:**
- Engine loading (WASM init): show board immediately with a subtle loading indicator until engine is ready
- Move generation: no loading spinner — the ~200ms latency is invisible. AI response has intentional ~1s delay (FR12) which is the natural rhythm, not a "loading" state
- Game state: `gamePhase` drives all UI states — no separate `isLoading` booleans

### Anti-Patterns to Avoid

- **Don't** create wrapper components just for styling — use Tailwind directly
- **Don't** add a router — game phases are UI state, not routes
- **Don't** put chess.js Chess instances in state — store FEN strings
- **Don't** call the Stockfish Worker directly from components — always go through the service
- **Don't** use `any` type — type everything, especially engine responses
- **Don't** create utility files preemptively — extract only when genuinely shared

### Enforcement Guidelines

**All AI Agents MUST:**
1. Follow the naming conventions exactly (PascalCase components, kebab-case services, camelCase functions)
2. Route all engine communication through `stockfish-service.ts`
3. Use Zustand store actions for all state mutations — no external state manipulation
4. Use named exports, functional components, Tailwind styling
5. Co-locate tests next to source files
6. Store FEN strings, never Chess instances, in state

## Project Structure & Boundaries

### Complete Project Directory Structure

```
ch3ss/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── eslint.config.js
├── .env                          # Dev tuning: VITE_STOCKFISH_DEPTH, VITE_THRESHOLD_T1, VITE_THRESHOLD_T2
├── .env.example
├── .gitignore
├── public/
│   ├── pieces/                   # Chess piece SVGs
│   │   ├── wK.svg
│   │   ├── wQ.svg
│   │   ├── wR.svg
│   │   ├── wB.svg
│   │   ├── wN.svg
│   │   ├── wP.svg
│   │   ├── bK.svg
│   │   ├── bQ.svg
│   │   ├── bR.svg
│   │   ├── bB.svg
│   │   ├── bN.svg
│   │   └── bP.svg
│   ├── icons/                    # PWA icons (192x192, 512x512)
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   ├── favicon.svg
│   └── og-image.png              # Social sharing preview image (FR22)
├── src/
│   ├── main.tsx                  # App entry point, render root
│   ├── App.tsx                   # Root component, Error Boundary, layout
│   ├── index.css                 # Tailwind directives, global styles, @keyframes
│   ├── components/
│   │   ├── Board/
│   │   │   ├── Board.tsx         # 8x8 grid, square rendering, piece placement
│   │   │   └── Board.test.tsx
│   │   ├── MoveArrows/
│   │   │   ├── MoveArrows.tsx    # SVG overlay: 3 arrows for move options
│   │   │   └── MoveArrows.test.tsx
│   │   ├── GameControls/
│   │   │   ├── GameControls.tsx  # Resign, undo (with cooldown), new game
│   │   │   └── GameControls.test.tsx
│   │   ├── EndGame/
│   │   │   ├── EndGame.tsx       # Game-over overlay: result, stats, replay
│   │   │   └── EndGame.test.tsx
│   │   ├── Settings/
│   │   │   ├── Settings.tsx      # Drawer: ELO slider, theme toggle, history
│   │   │   └── Settings.test.tsx
│   │   └── Header/
│   │       ├── Header.tsx        # App title, gear icon
│   │       └── Header.test.tsx
│   ├── engine/
│   │   ├── stockfish.worker.ts   # Web Worker: loads WASM, handles UCI protocol
│   │   ├── stockfish-service.ts  # Promise-based API: generatePlayerMoves, getAIMove
│   │   ├── stockfish-service.test.ts
│   │   ├── move-classifier.ts    # Eval-loss bucket algo: Top/Correct/Bof classification
│   │   └── move-classifier.test.ts
│   ├── store/
│   │   ├── game-store.ts         # Zustand store: game state, settings, UI, actions
│   │   └── game-store.test.ts
│   ├── hooks/
│   │   ├── useStockfish.ts       # React hook: engine init, move generation, AI response
│   │   └── useStockfish.test.ts
│   ├── types/
│   │   └── chess.ts              # All types: GameState, MoveRecord, ClassifiedMove, etc.
│   └── vite-env.d.ts             # Vite type declarations
└── vitest.config.ts              # Test configuration (jsdom environment)
```

### Architectural Boundaries

```
┌─────────────────────────────────────────────┐
│ App (Error Boundary)                        │
│  ┌────────┐  ┌───────────────────────────┐  │
│  │ Header │  │ Board + MoveArrows        │  │
│  └────────┘  │  (visual layer only)      │  │
│              └──────────┬────────────────┘  │
│  ┌──────────────┐       │                   │
│  │ GameControls │       │ user interaction  │
│  └──────┬───────┘       │                   │
│         │               ▼                   │
│  ┌──────┴───────────────────────────┐       │
│  │ Zustand Store (game-store.ts)    │       │
│  │  gameState | settings | ui       │       │
│  └──────────────┬───────────────────┘       │
│                 │                            │
│  ┌──────────────▼───────────────────┐       │
│  │ useStockfish hook                │       │
│  │  (bridges React ↔ Engine)        │       │
│  └──────────────┬───────────────────┘       │
│                 │                            │
│  ┌──────────────▼───────────────────┐       │
│  │ Engine Layer (framework-agnostic)│       │
│  │  stockfish-service.ts            │       │
│  │  move-classifier.ts              │       │
│  │  stockfish.worker.ts ──► WASM    │       │
│  └──────────────────────────────────┘       │
│                                              │
│  ┌────────────┐  ┌──────────┐               │
│  │ EndGame    │  │ Settings │  (overlays)   │
│  └────────────┘  └──────────┘               │
└─────────────────────────────────────────────┘
```

**Boundary Rules:**
- Components → Store: read state via selectors, write via store actions only
- Components → Engine: NEVER direct. Always via `useStockfish` hook
- Hook → Engine: calls `stockfish-service.ts` async methods
- Engine → Worker: `stockfish-service.ts` owns the Worker instance exclusively
- Store → localStorage: automatic via Zustand persist middleware (no manual read/write)

### Requirements to Structure Mapping

**FR Category → Files:**

| FR Category | Primary Files |
|-------------|--------------|
| Game Play (FR1-FR7) | `Board.tsx`, `MoveArrows.tsx`, `engine/*`, `game-store.ts` |
| Game Flow (FR8-FR12) | `App.tsx`, `GameControls.tsx`, `EndGame.tsx`, `game-store.ts` |
| Game Persistence (FR13-FR15) | `game-store.ts` (persist middleware), `Settings.tsx` (history view) |
| Settings (FR16-FR18) | `Settings.tsx`, `game-store.ts` (settings slice) |
| Offline/PWA (FR19-FR21) | `vite.config.ts` (vite-plugin-pwa config), Service Worker auto-generated |
| Social Sharing (FR22) | `index.html` (meta tags), `public/og-image.png` |

**NFR → Files:**

| NFR | Addressed By |
|-----|-------------|
| NFR1 (<200ms engine) | `stockfish-service.ts`, `stockfish.worker.ts` |
| NFR2 (<400ms UI) | All components, `index.css` (animations) |
| NFR5 (60fps) | `index.css` (CSS animations, GPU-accelerated transforms) |
| NFR6 (async WASM) | `useStockfish.ts` (lazy init), `stockfish.worker.ts` |
| NFR7-NFR10 (a11y) | All components (ARIA, keyboard nav, contrast, reduced-motion) |
| NFR11-NFR13 (reliability) | `game-store.ts` (persist middleware, corruption recovery) |

### Data Flow

```
User taps arrow on board
  → Board.tsx detects click on move arrow
  → calls store action: playMove(selectedMove)
  → game-store.ts updates FEN, appends to moveHistory, persists to localStorage
  → useStockfish hook triggers AI response:
    → stockfish-service.ts.getAIMove(newFen, elo)
    → Worker computes, returns move
    → ~1s artificial delay (FR12)
  → store action: playAIMove(aiMove)
  → game-store.ts updates FEN, persists
  → useStockfish hook triggers player move generation:
    → stockfish-service.ts.generatePlayerMoves(newFen, depth)
    → move-classifier.ts classifies into Top/Correct/Bof
    → returns 3 ClassifiedMoves
  → store action: presentMoves(classifiedMoves)
  → Board + MoveArrows re-render with new arrows
```

### Development Workflow

**Dev Server:** `npm run dev` → Vite dev server with HMR on `localhost:5173`
**Build:** `npm run build` → `dist/` (static files + WASM)
**Test:** `npm run test` → Vitest runs all co-located `*.test.ts(x)` files
**Deploy:** `git push` → Vercel auto-deploys `dist/` from build

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices are compatible and well-tested together: Vite 6.x + React 19 + TypeScript + SWC, Zustand v5.0.10, Tailwind CSS, vite-plugin-pwa + Workbox, Stockfish v18.0.5 + chess.js v1.4.0. No version incompatibilities detected.

**Pattern Consistency:**
Naming conventions are internally consistent. State management patterns align with Zustand best practices. Engine integration pattern (service → worker) is clean and testable. All patterns support the "no backend" constraint.

**Structure Alignment:**
Project structure directly maps to architectural decisions. Boundary diagram matches component hierarchy. Engine layer separation enables future React Native portability.

### Requirements Coverage Validation ✅

**Functional Requirements — 22/22 covered:**

| FR | Coverage | Architectural Support |
|----|----------|----------------------|
| FR1 (board display) | ✅ | `Board.tsx` |
| FR2 (3 move options) | ✅ | `MoveArrows.tsx` + `move-classifier.ts` |
| FR3 (select move) | ✅ | `Board.tsx` → store action `playMove` |
| FR4 (generate 3 moves) | ✅ | `stockfish-service.ts` + `move-classifier.ts` |
| FR5 (AI opponent) | ✅ | `stockfish-service.ts.getAIMove()` |
| FR6 (chess rules) | ✅ | chess.js v1.4.0 |
| FR7 (resign) | ✅ | `GameControls.tsx` → store action |
| FR8 (instant start) | ✅ | No auth, direct to board |
| FR9 (instant replay) | ✅ | `EndGame.tsx` → store action `startNewGame` |
| FR10 (end detection) | ✅ | chess.js checkmate/stalemate detection |
| FR11 (game result) | ✅ | `EndGame.tsx` |
| FR12 (AI delay) | ✅ | ~1s artificial delay in `useStockfish` |
| FR13 (auto-save) | ✅ | Zustand persist middleware |
| FR14 (auto-restore) | ✅ | Zustand persist rehydration |
| FR15 (game history) | ✅ | `Settings.tsx` + `GameHistory` in store |
| FR16 (ELO config) | ✅ | `Settings.tsx` + store `settings.opponentElo` |
| FR17 (theme toggle) | ✅ | `Settings.tsx` + store `settings.theme` |
| FR18 (persist prefs) | ✅ | Zustand persist middleware |
| FR19 (offline play) | ✅ | Stockfish WASM client-side + Service Worker cache |
| FR20 (installable) | ✅ | vite-plugin-pwa manifest + Service Worker |
| FR21 (asset caching) | ✅ | vite-plugin-pwa Workbox configuration |
| FR22 (social cards) | ✅ | `index.html` OG/Twitter meta tags + `og-image.png` |

**Non-Functional Requirements — 13/13 covered:**

| NFR | Coverage | How |
|-----|----------|-----|
| NFR1 (<200ms engine) | ✅ | Web Worker isolation, Stockfish WASM, go/no-go gate at step 2 |
| NFR2 (<400ms UI) | ✅ | CSS animations, no heavy JS transitions |
| NFR3 (<3s initial load) | ✅ | Async WASM loading, Vite code splitting |
| NFR4 (<1s cached load) | ✅ | Service Worker cache, static assets |
| NFR5 (60fps) | ✅ | CSS transforms (GPU-accelerated), no JS-driven animations |
| NFR6 (async WASM) | ✅ | Worker loads WASM independently, board renders immediately |
| NFR7 (keyboard nav) | ✅ | Component pattern: all interactive elements keyboard-accessible |
| NFR8 (ARIA labels) | ✅ | Component pattern: ARIA on board squares and controls |
| NFR9 (color contrast) | ✅ | UX spec dark theme validated for WCAG AA |
| NFR10 (reduced motion) | ✅ | Tailwind `motion-reduce:` variant |
| NFR11 (persist crashes) | ✅ | Zustand persist writes on every state change |
| NFR12 (offline=online) | ✅ | Full client-side architecture, Service Worker cache |
| NFR13 (no data loss) | ✅ | Persist middleware + corruption recovery pattern |

### Implementation Readiness Validation ✅

**Decision Completeness:** All critical and important decisions documented with specific versions. No ambiguous "TBD" items remain.

**Structure Completeness:** Every file and directory is named and mapped to specific requirements. No placeholder directories.

**Pattern Completeness:** Naming, state management, component, engine integration, error handling, and loading patterns are all defined with examples and anti-patterns.

### Gap Analysis Results

**Critical Gaps:** None identified.

**Important Gaps (non-blocking):**
1. **Pawn promotion UI** — FR6 includes promotion but no specific UI component is defined. Handle inline in `Board.tsx` with a small overlay when promotion occurs. Detail in implementation stories.
2. **Stockfish UCI protocol details** — Service API is defined but UCI command sequences (`uci`, `isready`, `position`, `go`) are implementation details for the story.

**Nice-to-Have Gaps:**
- Animation timing values (durations, easing curves) — the UX screens HTML file serves as the reference.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Low)
- [x] Technical constraints identified (React, Vercel, Stockfish WASM, no backend)
- [x] Cross-cutting concerns mapped (6 identified)

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions (Zustand 5.0.10, Stockfish 18.0.5, chess.js 1.4.0)
- [x] Technology stack fully specified (Vite + React + TS + Tailwind + Zustand)
- [x] Integration patterns defined (service → worker, hook → service)
- [x] Performance considerations addressed (go/no-go gate, async WASM, CSS animations)

**✅ Implementation Patterns**
- [x] Naming conventions established (files, code, types, actions)
- [x] Structure patterns defined (co-located tests, feature components)
- [x] Communication patterns specified (store actions, worker service)
- [x] Process patterns documented (error handling, loading states)

**✅ Project Structure**
- [x] Complete directory structure defined (every file named)
- [x] Component boundaries established (boundary diagram)
- [x] Integration points mapped (data flow diagram)
- [x] Requirements to structure mapping complete (FR and NFR tables)

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Zero-backend architecture eliminates infrastructure complexity
- Clean separation between engine layer (portable) and UI layer (React-specific)
- Zustand persist middleware solves the entire persistence requirement with minimal code
- All animations proven feasible in the UX mockup HTML
- Go/no-go gate on Stockfish performance as the first implementation task — fail fast on the biggest risk

**Areas for Future Enhancement:**
- Capacitor wrapping for app store distribution (post-validation)
- Player ELO tracking system (post-MVP)
- Analytics/monitoring (post-MVP)
- CI/CD pipeline (post-MVP, manual deploys are fine for solo dev)

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions

**First Implementation Priority:**
```bash
npm create vite@latest ch3ss -- --template react-swc-ts
```
Then immediately: Stockfish Web Worker integration to validate <200ms performance on mobile (go/no-go gate).
