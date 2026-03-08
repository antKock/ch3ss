---
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics, step-03-create-stories, step-04-final-validation]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# ch3ss - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for ch3ss, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

- FR1: Player can view a chessboard with standard piece placement and positioning
- FR2: Player can see 3 move options highlighted on the board at each turn
- FR3: Player can select one of the 3 proposed moves to execute it
- FR4: System generates 3 moves per turn classified by quality tier (Top, Correct, Bof) without revealing the classification to the player
- FR5: AI opponent can play a responding move freely after the player's move
- FR6: System enforces all standard chess rules (legal moves, check, castling, en passant, promotion)
- FR7: Player can resign from a game in progress
- FR8: Player can start a new game immediately upon app launch (no signup, no barriers)
- FR9: Player can start a new game immediately after a game ends
- FR10: System detects and announces end-of-game conditions (checkmate, stalemate)
- FR11: Player can view game result at end of game (win, loss, draw, resignation)
- FR12: AI opponent responds with an artificial delay to create natural game rhythm
- FR13: System automatically saves game state when the player leaves or closes the app
- FR14: System automatically restores a saved game when the player returns
- FR15: Player can view a history of past games
- FR16: Player can configure the AI opponent's ELO level
- FR17: Player can switch between light and dark visual themes
- FR18: System persists player preferences across sessions
- FR19: Player can play a complete game without network connectivity
- FR20: Player can install the app to their device home screen
- FR21: System caches all required assets for offline functionality after initial load
- FR22: System renders rich preview cards (title, description, image) when the app URL is shared on social platforms
- FR23: Player can cancel their last move within a brief cooldown window (~1.2s) to re-choose from the same 3 options

### NonFunctional Requirements

- NFR1: Stockfish move generation completes in <200ms (P95) on mid-range mobile devices
- NFR2: All UI interactions (tap, transition, overlay) render within <400ms
- NFR3: Initial app load completes in <3 seconds on 4G mobile connection
- NFR4: Subsequent app loads (cached via Service Worker) complete in <1 second
- NFR5: Board interactions maintain 60fps — no dropped frames during move animations
- NFR6: Stockfish WASM binary loads asynchronously without blocking first render
- NFR7: All interactive elements are keyboard-navigable (Tab + Enter)
- NFR8: Move options and board squares have descriptive ARIA labels for screen readers
- NFR9: Color contrast ratios meet WCAG AA minimum (4.5:1 text, 3:1 UI components)
- NFR10: Animations respect prefers-reduced-motion user preference
- NFR11: Game state persists across browser crashes, OS kills, and accidental closures
- NFR12: App functions identically offline and online after initial asset cache
- NFR13: No data loss occurs under any normal usage scenario (close, reload, navigate away)

### Additional Requirements

**From Architecture:**
- Starter template: Vite + React TypeScript (SWC) — `npm create vite@latest ch3ss -- --template react-swc-ts`
- State management: Zustand v5.0.10 with persist middleware for automatic localStorage sync
- Chess engine: Stockfish v18.0.5 npm package, WASM binary in Web Worker
- Chess rules: chess.js v1.4.0 for move validation and game state
- Styling: Tailwind CSS utility-first framework
- PWA: vite-plugin-pwa with Workbox for Service Worker and offline caching
- Animation: CSS animations + Tailwind (no animation library)
- Testing: Vitest + React Testing Library, co-located test files
- Hosting: Vercel static deployment from git push
- Environment variables for dev tuning: VITE_STOCKFISH_DEPTH, VITE_THRESHOLD_T1, VITE_THRESHOLD_T2
- Feature-based flat component structure with engine layer separation
- Promise-based Web Worker communication wrapper (stockfish-service.ts)
- Game history capped at 100 entries, FIFO pruning strategy
- Pawn promotion UI handled inline in Board.tsx
- Go/no-go gate: Stockfish <200ms performance validation as first dev task

**From UX Design:**
- Dark theme (sable) as primary, light theme as secondary
- Mobile-first design targeting 360-428px portrait width
- Poppins typography throughout
- SVG arrow overlay for 3-move presentation with animated appear/dismiss sequences
- Piece fly animations for move execution
- AI opponent move animation with ~1s artificial delay
- Undo mechanic with cooldown ring animation
- Checkmate halo/tremble effects
- Settings drawer overlay (not a separate page)
- End-game screen overlay with result display and instant replay
- Touch-optimized large tap targets for mobile
- Chess piece SVGs in public/pieces/ directory
- No hover-dependent interactions (mobile-first)

### FR Coverage Map

- FR1: Epic 1 — Chessboard display (core game UI)
- FR2: Epic 1 — 3 move options highlighted on board
- FR3: Epic 1 — Select one of 3 moves
- FR4: Epic 1 — Generate 3 classified moves via Stockfish
- FR5: Epic 1 — AI opponent plays responding move
- FR6: Epic 1 — Standard chess rules enforcement
- FR7: Epic 1 — Resign from game
- FR8: Epic 1 — Start game immediately on launch
- FR9: Epic 1 — Start new game after game ends
- FR10: Epic 1 — Detect/announce end-of-game conditions
- FR11: Epic 1 — Display game result
- FR12: Epic 1 — AI responds with artificial delay
- FR13: Epic 2 — Auto-save game state
- FR14: Epic 2 — Auto-restore saved game
- FR15: Epic 2 — View game history
- FR16: Epic 2 — Configure AI ELO level
- FR17: Epic 2 — Light/dark theme toggle
- FR18: Epic 2 — Persist player preferences
- FR19: Epic 3 — Offline gameplay
- FR20: Epic 3 — Install to home screen
- FR21: Epic 3 — Cache assets for offline
- FR22: Epic 3 — Social sharing preview cards
- FR23: Epic 1 — Cancel last move within cooldown window

**Epic 4 additions (UX audit gaps):**
- FR2: Epic 4 — Arrow geometry, square tinting, Ocean palette (visual fidelity)
- FR3: Epic 4 — Move animations, dismiss transitions, shake feedback
- FR7: Epic 4 — Resign flow with toast confirmation and fade transition
- FR8: Epic 4 — Home screen as entry point
- FR9: Epic 4 — Recap screen with distribution bars and replay
- FR11: Epic 4 — Enriched end-game display (king icons, duration, distribution)
- FR23: Epic 4 — Undo toast with cooldown ring (implementation)

## Epic List

### Epic 1: Core Chess Experience
Player can open ch3ss and immediately play a complete chess game using the 3-move selection mechanic against an AI opponent — from first move to checkmate, stalemate, or resignation. This is the full playable experience: board display, 3-move generation and selection, AI responses with natural rhythm, game flow (start, play, end, replay). Includes project foundation (Vite + React + Stockfish integration) as the enabling first stories.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR23
**NFRs addressed:** NFR1, NFR2, NFR5, NFR6

### Epic 2: Persistence & Settings
Player's game is automatically saved and restored across sessions. Player can configure the AI opponent's ELO level, switch between light/dark themes, and browse past game history. Preferences persist across sessions.
**FRs covered:** FR13, FR14, FR15, FR16, FR17, FR18
**NFRs addressed:** NFR11, NFR13

### Epic 3: PWA, Offline & Distribution
Player can install ch3ss to their home screen, play fully offline after initial load, and share the app URL with rich social previews. The app functions identically online and offline.
**FRs covered:** FR19, FR20, FR21, FR22
**NFRs addressed:** NFR3, NFR4, NFR12

### Epic 4: UX Polish — Visual Fidelity & Missing Interactions
The implementation is aligned with the UX design specification and HTML mockups. All visual tokens (colors, typography, spacing), interaction patterns (undo toast, arrow geometry, animations), and missing screens (home, recap) are brought to spec. This epic closes every gap identified in the UX audit between the current build and the approved designs.
**FRs covered:** FR2, FR3, FR7, FR8, FR9, FR11, FR23
**NFRs addressed:** NFR2, NFR5, NFR9, NFR10

---

## Epic 1: Core Chess Experience

Player can open ch3ss and immediately play a complete chess game using the 3-move selection mechanic against an AI opponent — from first move to checkmate, stalemate, or resignation. Includes project foundation and Stockfish engine integration as enabling first stories.

### Story 1.1: Project Foundation

As a developer,
I want a fully configured Vite + React TypeScript project with all dependencies installed,
So that I have a working development environment to build ch3ss.

**Acceptance Criteria:**

**Given** no existing project
**When** the project is initialized with `npm create vite@latest ch3ss -- --template react-swc-ts`
**Then** the project builds and runs with `npm run dev`
**And** Tailwind CSS is configured and functional
**And** Zustand v5.0.10, chess.js v1.4.0, and stockfish v18.0.5 are installed
**And** Vitest is configured with jsdom environment and React Testing Library
**And** ESLint is configured
**And** the project directory structure matches the architecture specification (src/components/, src/engine/, src/store/, src/hooks/, src/types/)
**And** TypeScript types file (src/types/chess.ts) defines GameState, MoveRecord, ClassifiedMove, and GameResult interfaces per architecture spec
**And** environment variables (.env.example) are set up for VITE_STOCKFISH_DEPTH, VITE_THRESHOLD_T1, VITE_THRESHOLD_T2
**And** Poppins font is loaded (Google Fonts)
**And** dark theme (sable) base styles are applied as default in index.css

### Story 1.2: Stockfish Engine Integration & Performance Validation

As a developer,
I want a working Stockfish engine running in a Web Worker with a promise-based service API,
So that I can validate the <200ms move generation target before building the UI (go/no-go gate).

**Acceptance Criteria:**

**Given** the Stockfish v18.0.5 npm package is installed
**When** the stockfish.worker.ts Web Worker is created
**Then** it loads the Stockfish WASM binary and initializes the UCI protocol
**And** stockfish-service.ts provides an async `generatePlayerMoves(fen, depth)` method returning 3 ClassifiedMoves
**And** stockfish-service.ts provides an async `getAIMove(fen, elo)` method returning a single move
**And** move-classifier.ts classifies moves into Top (eval-loss 0-T1), Correct (T1-T2), Bof (>T2) tiers using centipawn thresholds
**And** default thresholds are T1=30cp, T2=100cp, depth=12 (configurable via env vars)
**And** the service is a singleton with one-time initialization
**And** Worker errors are caught with a 5s timeout safety net
**And** a performance benchmark test confirms <200ms P95 move generation on standard positions
**And** WASM loads asynchronously without blocking the main thread (NFR6)

### Story 1.3: Interactive Chessboard

As a player,
I want to see a chessboard with pieces in their standard starting positions,
So that I have a visual game board to play on.

**Acceptance Criteria:**

**Given** the app is loaded
**When** the Board component renders
**Then** an 8x8 chessboard is displayed with alternating light/dark squares
**And** all 32 pieces are shown in their standard starting positions using SVG piece images from public/pieces/
**And** the board is mobile-first, filling the available width on 360-428px screens
**And** the board is responsive and scales appropriately on tablet/desktop
**And** square coordinates (a-h, 1-8) are subtly indicated
**And** the board meets WCAG AA color contrast requirements (NFR9)
**And** all board squares have descriptive ARIA labels for screen readers (NFR8)
**And** board interactions are keyboard-navigable (NFR7)
**And** the board renders at 60fps with no dropped frames (NFR5)

### Story 1.4: Three-Move Generation & Arrow Display

As a player,
I want to see 3 move options displayed as arrows on the chessboard,
So that I can choose one of the proposed moves to play.

**Acceptance Criteria:**

**Given** it is the player's turn and the Stockfish engine is ready
**When** the system generates 3 moves for the current position
**Then** 3 SVG arrows appear on the board showing the source and destination squares for each move
**And** arrows appear with an animated sequence (staggered appearance per UX spec)
**And** all 3 arrows are visually distinct and clearly identifiable
**And** the move quality classification (Top/Correct/Bof) is NOT visible to the player (blind selection)
**And** arrows have touch-optimized tap targets for mobile selection
**And** arrows have descriptive ARIA labels (e.g., "Move knight from g1 to f3") (NFR8)
**And** arrow animations respect prefers-reduced-motion (NFR10)
**And** if fewer than 3 distinct quality tiers are available, the system still presents 3 valid moves

### Story 1.5: Move Selection & Execution

As a player,
I want to tap one of the 3 arrows to play that move,
So that my chosen piece moves on the board and the game progresses.

**Acceptance Criteria:**

**Given** 3 move arrows are displayed on the board
**When** the player taps/clicks one of the arrows
**Then** the selected move is executed on the board
**And** the piece animates from source to destination square (piece fly animation per UX spec)
**And** the other 2 arrows dismiss with an animated exit sequence
**And** the board state updates to reflect the new position (chess.js validates the move)
**And** all standard chess rules are enforced: legal moves, check, castling, en passant (FR6)
**And** pawn promotion displays an inline selection overlay when a pawn reaches the last rank (FR6)
**And** the move is recorded in the move history with the 3 options and the player's classification choice
**And** UI interaction completes within <400ms (NFR2)

### Story 1.5b: Move Undo with Cooldown

As a player,
I want to cancel my last move within a brief window after playing it,
So that I can reconsider my choice without committing instantly.

**Acceptance Criteria:**

**Given** the player has just selected and executed a move from the 3 options
**When** the move is played on the board
**Then** a toast appears at the bottom of the screen with a "Cancel" button and a cooldown ring animation (~1.2s) (FR23)
**And** the toast slides up with a bounce animation (350ms ease-out)
**And** the cooldown ring is an SVG path stroke animation (linear, 1.2s)

**Given** the undo toast is visible and the cooldown has not expired
**When** the player taps "Cancel"
**Then** the move is reverted on the board (piece returns to original square)
**And** the same 3 move arrows reappear for the player to re-choose
**And** the toast disappears

**Given** the undo toast is visible
**When** the cooldown ring completes (~1.2s) without the player tapping "Cancel"
**Then** the toast disappears and the AI opponent plays its response immediately (no additional delay — the cooldown serves as the perceived AI thinking time)

**Given** the player taps "Cancel" at the exact moment the cooldown expires (race condition)
**When** both events fire simultaneously
**Then** the cancel action wins — the player always has priority

**Given** the undo toast is visible
**When** the player views it
**Then** the toast is keyboard-accessible (Escape to cancel) and has ARIA labels (NFR7, NFR8)
**And** the cooldown animation respects prefers-reduced-motion (NFR10)

### Story 1.6: AI Opponent Response

As a player,
I want the AI to respond with its own move after I play,
So that I experience a natural back-and-forth chess game.

**Acceptance Criteria:**

**Given** the player has just played a move
**When** the AI opponent calculates its response
**Then** the AI plays a move freely (not constrained to 3 options) at the configured ELO level (default 1000)
**And** an artificial delay of ~1 second is applied before the AI's move appears (FR12)
**And** the AI's piece animates from source to destination (opponent move animation per UX spec)
**And** the board state updates to reflect the AI's move
**And** after the AI moves, the system automatically generates 3 new move options for the player's next turn
**And** the full turn cycle (player move → AI response → new 3-move options) flows seamlessly

### Story 1.7: Game End Detection & Result Display

As a player,
I want to know when the game is over and see the result,
So that I understand the outcome and can decide what to do next.

**Acceptance Criteria:**

**Given** a game is in progress
**When** checkmate occurs
**Then** the system detects and announces checkmate (FR10)
**And** a checkmate visual effect plays (halo/tremble per UX spec)
**And** an end-game overlay displays showing the result: "Victory" or "Defeat" (FR11)

**Given** a game is in progress
**When** stalemate occurs
**Then** the system detects and announces stalemate (FR10)
**And** an end-game overlay displays showing "Draw — Stalemate" (FR11)

**Given** a game is in progress
**When** the player taps the resign button
**Then** the game ends immediately (FR7)
**And** an end-game overlay displays showing "Resigned" (FR11)

**Given** the end-game overlay is displayed
**When** the player views the result
**Then** the overlay shows the game result clearly (win/loss/draw/resignation)
**And** the overlay is accessible via keyboard and has ARIA labels (NFR7, NFR8)

### Story 1.8: Game Start & Instant Replay

As a player,
I want to start playing immediately when I open the app and replay instantly after a game ends,
So that I experience zero friction between games.

**Acceptance Criteria:**

**Given** the player opens ch3ss for the first time (no saved game)
**When** the app loads
**Then** a new game starts immediately with the board in starting position and 3 move options displayed (FR8)
**And** no signup, account creation, or onboarding flow is shown
**And** the initial load completes in under 3 seconds on 4G (NFR3)

**Given** the end-game overlay is displayed after a game ends
**When** the player taps "New Game"
**Then** a new game starts immediately with a fresh board and new 3-move options (FR9)
**And** the transition from end-game to new game is near-instant (<400ms) (NFR2)

**Given** a new game is starting
**When** the board is set up
**Then** the player always plays as white (first move)
**And** 3 move options for the opening position are generated and displayed

---

## Epic 2: Persistence & Settings

Player's game is automatically saved and restored across sessions. Player can configure the AI opponent's ELO level, switch between light/dark themes, and browse past game history. Preferences persist across sessions.

### Story 2.1: Game State Auto-Save & Restore

As a player,
I want my in-progress game to be saved automatically and restored when I return,
So that I never lose progress even if I close the app unexpectedly.

**Acceptance Criteria:**

**Given** a game is in progress
**When** the player closes the browser, navigates away, or the app is killed by the OS
**Then** the current game state (FEN, move history, game phase) is persisted to localStorage via Zustand persist middleware (FR13)
**And** state is saved on every state change (not just on unload) (NFR11)

**Given** a saved game exists in localStorage
**When** the player reopens ch3ss
**Then** the saved game is automatically restored: board position, whose turn it is, and move history (FR14)
**And** if it's the player's turn, 3 new move options are generated for the current position
**And** if it's the AI's turn, the AI plays its response

**Given** localStorage contains corrupted or unparseable game data
**When** the app loads
**Then** the system resets to a fresh new game (no crash, no error shown to user)
**And** no data loss occurs under any normal usage scenario (NFR13)

### Story 2.2: Settings Drawer — ELO & Theme

As a player,
I want to adjust the AI difficulty and switch between light/dark themes,
So that I can customize my ch3ss experience.

**Acceptance Criteria:**

**Given** the app is displaying the game board
**When** the player taps the gear icon in the header
**Then** a settings drawer slides in as an overlay (not a new page) per UX spec

**Given** the settings drawer is open
**When** the player adjusts the ELO slider
**Then** the AI opponent ELO is configurable between 800 and 1600 (FR16)
**And** the new ELO takes effect on the next AI move (not mid-move)
**And** the selected ELO is persisted across sessions (FR18)

**Given** the settings drawer is open
**When** the player toggles the theme switch
**Then** the app switches between dark (sable) and light themes (FR17)
**And** the theme change applies immediately to all UI elements
**And** the theme preference is persisted across sessions (FR18)

**Given** the settings drawer is open
**When** the player taps outside the drawer or the close button
**Then** the drawer closes with a smooth animation
**And** the drawer is keyboard-navigable and has ARIA labels (NFR7, NFR8)

### Story 2.3: Game History

As a player,
I want to browse my past games,
So that I can see my game results over time.

**Acceptance Criteria:**

**Given** the player has completed one or more games
**When** the player opens the game history section in the settings drawer
**Then** a list of past games is displayed showing: date, result (win/loss/draw/resign), number of moves (FR15)
**And** games are listed in reverse chronological order (most recent first)

**Given** the game history contains more than 100 entries
**When** a new game is completed
**Then** the oldest game is removed (FIFO pruning) to stay within the 100-game cap
**And** the pruning happens automatically without user intervention

**Given** no games have been completed yet
**When** the player opens the game history section
**Then** an empty state message is displayed (e.g., "No games played yet")

---

## Epic 3: PWA, Offline & Distribution

Player can install ch3ss to their home screen, play fully offline after initial load, and share the app URL with rich social previews.

### Story 3.1: Service Worker & Offline Play

As a player,
I want to play ch3ss without an internet connection,
So that I can play in the subway, on a plane, or anywhere without network.

**Acceptance Criteria:**

**Given** the player has loaded ch3ss at least once with network connectivity
**When** the player opens ch3ss without network connectivity
**Then** the app loads fully and gameplay works identically to online mode (FR19, NFR12)
**And** the Stockfish WASM binary, app shell, and all assets are served from the Service Worker cache (FR21)

**Given** the app is being set up for offline support
**When** vite-plugin-pwa is configured
**Then** a Service Worker is generated via Workbox that caches the app shell and WASM binary
**And** the cached app loads in <1 second on subsequent visits (NFR4)
**And** the initial app load (with caching) completes in <3 seconds on 4G (NFR3)

### Story 3.2: PWA Installation

As a player,
I want to install ch3ss to my phone's home screen,
So that it feels like a native app and I can launch it with one tap.

**Acceptance Criteria:**

**Given** the player visits ch3ss in a supported browser (Chrome, Safari)
**When** the PWA installation criteria are met
**Then** the browser prompts or allows the player to add ch3ss to their home screen (FR20)
**And** a Web App Manifest is served with: app name ("ch3ss"), icons (192x192, 512x512), theme color, standalone display mode
**And** once installed, the app launches in standalone mode (no browser chrome)
**And** the app icon appears on the home screen

### Story 3.3: Social Sharing Preview

As a player,
I want a rich preview card to appear when I share the ch3ss URL on social media,
So that the link looks compelling and attracts other players.

**Acceptance Criteria:**

**Given** the ch3ss URL is shared on a social platform (Twitter, Facebook, Discord, iMessage, etc.)
**When** the platform fetches the URL's metadata
**Then** a rich preview card renders with: title ("ch3ss"), description, and a preview image (FR22)
**And** Open Graph meta tags (og:title, og:description, og:image, og:url) are set in index.html
**And** Twitter Card meta tags (twitter:card, twitter:title, twitter:description, twitter:image) are set in index.html
**And** the preview image (public/og-image.png) is visually compelling and represents the game

---

## Epic 4: UX Polish — Visual Fidelity & Missing Interactions

The implementation is aligned with the UX design specification (`ux-design-specification.md`) and HTML mockups (`ux-screens.html`). All visual tokens, interaction patterns, animations, and missing screens are brought to spec. This epic closes every gap identified in the UX audit.

**Audit source:** UX fidelity review comparing current implementation against `ux-screens.html` mockups and `ux-design-specification.md`, section "Screen Designs" through "UX Consistency Patterns".

### Story 4.1: Visual Identity & Theme Alignment

As a player,
I want the app's colors, board theme, arrow palette, and branding to match the approved UX design,
So that the visual experience is cohesive, accessible, and differentiated from generic chess apps.

**Acceptance Criteria:**

**Given** the app uses a dark theme by default
**When** the dark theme is active
**Then** the CSS tokens match the Forêt palette: `bg: #1E2A22`, `text: #E0DDD6`, `textSec: #8A9A86`, `surface: #2A3A2E`, `accent: #6A8060`
**And** the board squares use the Menthe palette: light `#E8F0E8`, dark `#B8D0B4`

**Given** the player activates the light theme
**When** the light theme is active
**Then** the CSS tokens match the Sable palette: `bg: #EDE8DF`, `text: #3D3A36`, `textSec: #8A8078`, `surface: #ffffff`, `accent: #6A8060`
**And** the board squares use the Menthe palette (same as dark): light `#E8F0E8`, dark `#B8D0B4`

**Given** arrows are displayed on the board
**When** the player views the 3 move options
**Then** the arrow colors use the Ocean accessible palette: Blue `#3A70B0`, Ambre `#B8860B`, Violet `#8D5AA5`
**And** the palette is WCAG 2.1 SC 1.4.11 compliant (≥ 3:1 contrast on both square colors)
**And** colors do not form a "traffic light" hierarchy (no red/yellow/green)

**Given** the app header or home screen displays the brand name
**When** the player views "ch3ss"
**Then** the "3" character is rendered in accent color (`#6A8060`)
**And** the font weight is Poppins ExtraBold (800)

**Given** the board is rendered
**When** the player views it
**Then** the board has `border-radius: 10px`, `overflow: hidden`, and a subtle `box-shadow: 0 4px 20px rgba(0,0,0,0.08)`

**Given** pieces are displayed on the board
**When** the player views them
**Then** pieces use the Staunty set via lichess CDN (`cdn.jsdelivr.net/gh/lichess-org/lila@6e3b5257/public/piece/staunty`) with `brightness(1.1)` filter

### Story 4.2: Home Screen

As a player,
I want to see a welcoming home screen when I open the app (and no game is in progress),
So that I have a clear entry point to start playing and see my play history at a glance.

**Acceptance Criteria:**

**Given** the app is opened and no game is in progress
**When** the home screen is displayed
**Then** the layout is a centered vertical column (480px height, gap 24px) containing:
  1. Logo `ch3ss` at 42px ExtraBold with "3" in accent, tagline "3 options, ton choix" in 13px textSec below
  2. Mini-board: 4×4 grid (140×140px, border-radius 14px) with 3 mini-flèches in Ocean palette
  3. "Jouer" button: accent bg, white text, 16px SemiBold, border-radius 14px, padding 14×56px, box-shadow
  4. Game counter: "X parties jouées" in 11px textSec, or "Première partie !" if 0 games
**And** a gear icon (opacity 50%) is displayed in the top-right corner

**Given** the home screen is displayed
**When** the player taps "Jouer"
**Then** a new game starts with random player color assignment (white or black)
**And** if the player is black, the board is flipped and the AI plays first

**Given** a game was in progress (saved state exists)
**When** the app reopens
**Then** the home screen is skipped — the player goes directly to the in-progress game (no intermediate screen)

### Story 4.3: Undo Toast with Cooldown Ring

As a player,
I want a brief window to cancel my last move after playing it,
So that accidental taps don't ruin my game and the cooldown provides natural AI thinking time.

**Acceptance Criteria:**

**Given** the player has just selected and executed a move
**When** the move is played on the board
**Then** a toast appears at the bottom of the screen (absolute, bottom 16px) with:
  - Background: `surface` color, border-radius 18px, box-shadow
  - Text: "Coup joué" (13px SemiBold) + "Annuler" button (accent text on accent 10% bg)
  - Cooldown ring: SVG path stroke following the toast contour, accent color, `stroke-dashoffset` animation linear 1.2s
  - Entry animation: slide-up + bounce (`translateY(12px → -2px → 0)`, 350ms ease-out)

**Given** the toast is visible and cooldown has not expired
**When** the player taps "Annuler"
**Then** the move is reverted (piece returns to original square)
**And** the same 3 arrows reappear for the player to re-choose
**And** the toast disappears

**Given** the toast is visible
**When** the cooldown expires (1.2s) without the player cancelling
**Then** the toast disappears and the AI plays its response immediately (no additional delay — the cooldown IS the perceived AI thinking time)

**Given** the player taps "Annuler" at the exact moment the cooldown expires
**When** both events fire simultaneously
**Then** the cancel action wins — the player always has priority (race condition rule)

**Given** the toast is displayed
**When** the player views or interacts with it
**Then** the toast is keyboard-accessible (Escape = cancel) with ARIA labels
**And** animations respect `prefers-reduced-motion`

### Story 4.4: End Game Recap Screen

As a player,
I want to see a detailed recap of my performance after each game,
So that I feel curious about my choices and motivated to play again.

**Acceptance Criteria:**

**Given** a game has ended (checkmate, stalemate, or resignation)
**When** the recap screen is displayed
**Then** the layout is a centered column (padding-top 40px, gap 20px) containing:

1. **Result section:**
   - King icon: player's king SVG (56×56px) — debout (victoire), couché `rotate(90deg)` (défaite), or both kings side by side (48×48px, gap 4px) for draw
   - Title: "Victoire" / "Défaite" / "Égalité" in 26px ExtraBold
   - Subtitle: "{nb coups} coups · {durée}" in 13px textSec

2. **Card "Tes choix":**
   - Background surface, border-radius 18px, padding 20px
   - Title: "TES CHOIX" in 12px uppercase textSec
   - 3 progress bars labeled "Top" / "Correct" / "Bof" with:
     - Label (13px bold) + percentage (14px ExtraBold) in accent color
     - Bar track (6px, border-radius 3px) with fill in accent (opacity 0.7)
   - Distribution computed from `moveHistory` classifications

3. **"Rejouer" button:** full width, accent bg, white text, 16px SemiBold, border-radius 14px, box-shadow

4. **Gear icon:** top-right, opacity 50%

5. **Secondary links:** "Accueil" + "Voir le plateau" in 12px textSec, centered row with gap 16px

**Given** the recap screen is displayed
**When** the player taps "Rejouer"
**Then** a new game starts immediately with random color assignment

**Given** the recap screen is displayed
**When** the player taps "Accueil"
**Then** the home screen is displayed

**Given** the recap screen is displayed
**When** the player taps "Voir le plateau"
**Then** the final board position is displayed (read-only)

### Story 4.5: Arrow Geometry & Square Tinting

As a player,
I want the move arrows to be visually refined (proper geometry, knight L-paths, tinted squares),
So that the 3 options are instantly readable and the board feels polished.

**Acceptance Criteria:**

**Given** 3 move arrows are displayed on the board
**When** the player views them
**Then** arrows use the spec geometry: stroke-width=22, head with rounded triangle (r=0.22), HEAD_HALF_W=28, HEAD_LEN=40
**And** arrow start is offset 44px from square center, tip offset 8px
**And** arrows use `<path>` elements (not `<line>` + markers)

**Given** a move option is a knight move
**When** the arrow is rendered
**Then** the arrow follows an L-shaped path using Bézier Q curve with radius R=28
**And** the L direction is: vertical first if `dr > dc`, horizontal first otherwise

**Given** arrows are displayed on the board
**When** the player views the board squares
**Then** the source and destination squares of each arrow are tinted with an opaque color mix: `mixColors(squareBg, arrowColor, 0.45)`
**And** if two arrows share a square, the tints are layered (not overwritten)
**And** untinted squares retain their base Menthe color

**Given** arrows appear on the board
**When** the staggered animation plays
**Then** arrows appear one by one with 90ms delay between each (spec: not 100ms)
**And** animation per arrow: `scale(0.85) → scale(1.03) → scale(1)` + `opacity 0 → 1`, duration 220ms ease-out (spec: not 300ms)
**And** case tints appear synchronized with their arrow (transition `background 200ms ease-out`)

### Story 4.6: Move Animations & Interaction Polish

As a player,
I want piece movements to be animated, invalid taps to give feedback, and arrow selections to have dismiss transitions,
So that every interaction feels fluid and satisfying.

**Acceptance Criteria:**

**Given** the player selects an arrow
**When** the move is executed
**Then** the chosen arrow fades out (`opacity 1 → 0`, 150ms ease-out)
**And** the non-chosen arrows shrink and fade (`scale(1) → scale(0.9)` + `opacity 1 → 0`, 220ms ease-out)
**And** the tinted squares of non-chosen arrows un-tint synchronously (220ms)
**And** the tinted squares of the chosen move remain tinted

**Given** a piece moves (player or AI)
**When** the move animation plays
**Then** a clone element is created and animated from source to destination (200ms ease-out)
**And** for knight moves: 2 legs (120ms ease-in + 120ms ease-out) through the L midpoint
**And** captures: the captured piece fades + shrinks (`opacity 1→0`, `scale(1)→scale(0.7)`, 150ms)
**And** after animation, the clone is removed and the board re-renders at the final position

**Given** it is the player's turn with 3 arrows displayed
**When** the player taps a square that is NOT part of any of the 3 options
**Then** the 3 arrows shake (`translateX(0 → -3px → 3px → -3px → 2px → 0)`, 300ms ease-out) + pulse (`opacity 1 → 0.5 → 1`, 300ms)
**And** the arrows remain visible after the shake

**Given** the AI has played its response
**When** the board updates
**Then** the player's last-move tint is cleared
**And** the AI's source and destination squares are tinted in neutral color `#8A8078` (opaque mix 35%)

### Story 4.7: Random Player Color & Auto-Promotion

As a player,
I want to randomly play as white or black each game, and pawn promotions to happen automatically,
So that games feel varied and the rhythm is never broken by extra dialogs.

**Acceptance Criteria:**

**Given** a new game starts
**When** the player color is assigned
**Then** the color is randomly chosen (50/50 white or black)
**And** if the player is black, the board is flipped (rank 1 at top, rank 8 at bottom)
**And** captured pieces rows are swapped (adversary top, player bottom)

**Given** the player is black
**When** the game begins
**Then** the AI plays its opening move first, then 3 arrows appear for the player

**Given** a pawn reaches the last rank
**When** promotion is triggered
**Then** the pawn is automatically promoted to Queen (no dialog)
**And** the promotion modal currently in Board.tsx is removed

### Story 4.8: Resign Flow & Header Context

As a player,
I want the resign button to be discreet and confirm via a toast cooldown, and the settings gear to be hidden during gameplay,
So that the game screen is distraction-free and destructive actions are protected.

**Acceptance Criteria:**

**Given** a game is in progress
**When** the player views the game screen
**Then** "Abandonner" is displayed at the bottom (11px textSec, opacity 0.5, no border, no background)
**And** the header shows only the `ch3ss` logo (20px, centered) — no gear icon

**Given** the player taps "Abandonner"
**When** the resign action is initiated
**Then** a toast appears (same UI as undo toast) with text "Partie abandonnée" + "Annuler" button + cooldown ring (1.2s)
**And** tapping "Annuler" during cooldown returns to the game
**And** if cooldown expires: plateau fades out (`opacity 1 → 0`, 400ms ease-out) → recap screen in defeat mode
**And** race condition: "Annuler" always wins

**Given** the home screen or recap screen is displayed
**When** the player views the screen
**Then** the gear icon is visible (top-right, opacity 50%)

### Story 4.9: Settings Screen Overhaul

As a player,
I want the settings to be a full-screen view with ELO presets, a segmented theme toggle, dev controls, and enriched game history,
So that configuration is quick and the history gives me meaningful insight into my play.

**Acceptance Criteria:**

**Given** the player opens settings
**When** the settings screen is displayed
**Then** it is a full-screen view (not a side drawer) with:
  - Back arrow ← + title "Réglages" at top
  - Each section in a card (surface bg, border-radius 18px)

**Given** the settings screen is displayed
**When** the player views the theme section
**Then** a segmented toggle "Clair / Sombre" is shown (active segment = accent bg + white text)

**Given** the settings screen is displayed
**When** the player views the ELO section
**Then** 5 preset buttons are shown in a row: 800 / 1000 / 1200 / 1400 / 1600
**And** the selected preset has accent bg + white text, others have inputBg + normal text
**And** the slider is removed (presets only)

**Given** the settings screen is displayed
**When** the player views the dev controls
**Then** two sections are visible (with "DEV" badge in accent on accent 15% bg):
  - "EVAL-LOSS SEUILS (CP)": 2 inputs side-by-side for T1 (default 30) and T2 (default 100)
  - "DEPTH (DEMI-COUPS)": slider 4–20 (default 12) with current value display

**Given** the settings screen is displayed
**When** the player views the history section
**Then** each entry shows: result icon (✓ accent / ✗ red / = textSec), "{nb coups} coups · {durée}", distribution "Top X% · Correct X% · Bof X%"
**And** entries are separated by dividers

### Story 4.10: Checkmate Effects & Endgame Transitions

As a player,
I want the checkmate animation to match the design spec, and resignation to have a soft fade transition,
So that game endings feel emotionally appropriate — dramatic for checkmate, gentle for resignation.

**Acceptance Criteria:**

**Given** checkmate occurs
**When** the checkmate animation plays
**Then** the mated king trembles: `king-tremble` keyframes (`translateX ±2px → ±0.5px` + slight `rotate ±1deg`), 600ms ease-out, infinite loop
**And** the mated king's square has a red halo: `box-shadow: inset 0 0 18px 4px rgba(200, 50, 50, 0.4)`
**And** the mating piece pulses once: `scale(1 → 1.08 → 1)`, 400ms ease-out
**And** the tremble and halo are on the king only (not the whole board)
**And** after ~1.5s pause, transition to the recap screen

**Given** the player's resignation is confirmed (toast cooldown expired)
**When** the transition to recap plays
**Then** the board fades out globally (`opacity 1 → 0`, 400ms ease-out)
**And** no king tremble, no halo — resignation is a calm exit
**And** the recap screen appears in defeat mode

**Given** any endgame animation is playing
**When** the user has `prefers-reduced-motion: reduce`
**Then** tremble, pulse, and fade animations are disabled
**And** transitions are instant

### Story 4.11: Captured Pieces Display

As a player,
I want to see which pieces have been captured during the game,
So that I have a visual sense of the material balance.

**Acceptance Criteria:**

**Given** a game is in progress
**When** pieces have been captured
**Then** two rows of captured pieces are displayed:
  - Above the board: adversary's captured pieces (pieces the player took)
  - Below the board: player's captured pieces (pieces the AI took)
**And** pieces are 22px, opacity 0.85, sorted by descending value: Q > R > B > N > P
**And** in dark mode, black captured pieces have `brightness(1.6)` + `drop-shadow(0 0 2px rgba(255,255,255,0.3))`

**Given** no pieces have been captured
**When** the player views the board area
**Then** the captured pieces rows are invisible (no empty placeholder)

### Story 4.12: Bundle Poppins Font Locally

As a player,
I want the app font to be bundled locally instead of loaded from Google CDN,
So that the first offline launch displays the correct typography.

**Acceptance Criteria:**

**Given** the app is loaded offline for the first time (cold cache)
**When** the UI renders
**Then** Poppins font (weights 400, 500, 600, 700, 800) is loaded from local files (not Google Fonts CDN)
**And** the Google Fonts `<link>` tag is removed from `index.html`
**And** font files are included in the PWA cache via service worker
