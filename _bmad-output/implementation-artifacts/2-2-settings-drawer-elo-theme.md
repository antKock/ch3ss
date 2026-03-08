# Story 2.2: Settings Drawer — ELO & Theme

Status: review

## Story

As a player,
I want to adjust the AI difficulty and switch between light/dark themes,
So that I can customize my ch3ss experience.

## Acceptance Criteria

1. Tapping the gear icon in the Header opens a settings drawer as an overlay (not a new page)
2. ELO slider allows configuring AI opponent between 800 and 1600 (FR16)
3. New ELO takes effect on the next AI move, not mid-move
4. Selected ELO is persisted across sessions (FR18)
5. Theme toggle switches between dark (sable) and light themes (FR17)
6. Theme change applies immediately to all UI elements
7. Theme preference is persisted across sessions (FR18)
8. Tapping outside the drawer or close button closes it with smooth animation
9. Drawer is keyboard-navigable and has ARIA labels (NFR7, NFR8)

## Tasks / Subtasks

- [x] Task 1: Create Settings component (AC: #1, #8)
  - [x] Create `src/components/Settings/Settings.tsx`
  - [x] Implement as a slide-in drawer overlay from the right side
  - [x] Backdrop: semi-transparent overlay behind drawer, clicking closes drawer
  - [x] Close button (X) at top of drawer
  - [x] Slide-in/slide-out CSS animation (transform translateX)
  - [x] Use `motion-reduce:` Tailwind variant to disable animation for reduced-motion preference
  - [x] Add to App.tsx: render conditionally based on `showSettings` UI state
- [x] Task 2: Wire Header gear icon (AC: #1)
  - [x] In `src/components/Header/Header.tsx`, wire gear icon `onClick` to toggle `showSettings` in store
  - [x] Add `setShowSettings(boolean)` action to game-store.ts UI slice
  - [x] Gear icon: use an inline SVG or Unicode ⚙ character — no icon library needed
- [x] Task 3: ELO slider (AC: #2, #3, #4)
  - [x] Add range input (`<input type="range">`) for ELO: min=800, max=1600, step=50
  - [x] Display current ELO value next to slider
  - [x] On change: update `settings.opponentElo` in store
  - [x] Zustand persist middleware (from Story 2.1) auto-saves the new value
  - [x] ELO change takes effect on next AI move — no special logic needed, `getAIMove` reads current `opponentElo` from store at call time
  - [x] Style slider with Tailwind: accent color matching theme
  - [x] ARIA: `aria-label="AI difficulty ELO"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`
- [x] Task 4: Theme toggle (AC: #5, #6, #7)
  - [x] Add toggle switch for dark/light theme
  - [x] On toggle: update `settings.theme` in store ('dark' | 'light')
  - [x] Apply theme by toggling `light` CSS class on `<html>` element (dark is default, no class needed)
  - [x] Use CSS custom properties with `html.light` selector (Tailwind v4 — no `tailwind.config.ts` needed)
  - [x] On app load: read theme from persisted store and apply class immediately (prevent flash)
  - [x] Dark theme (sable) is default — initial store value: `theme: 'dark'`
  - [x] ARIA: `aria-label="Toggle theme"`, `role="switch"`, `aria-checked`
- [x] Task 5: Theme CSS implementation (AC: #6)
  - [x] Define light theme color tokens in `index.css` or Tailwind config
  - [x] Dark theme colors already defined (Story 1.1 — sable base styles)
  - [x] Ensure all existing components use CSS custom properties (`var(--color-*)`) for theme-aware styling
  - [x] Board squares: theme-appropriate colors for light/dark squares
  - [x] Text, backgrounds, borders: all theme-aware
  - [x] Settings drawer itself: theme-aware
  - [x] Color contrast meets WCAG AA in both themes (NFR9)
- [x] Task 6: Accessibility (AC: #9)
  - [x] Settings drawer: `role="dialog"`, `aria-label="Settings"`, `aria-modal="true"`
  - [x] Focus trap: when drawer is open, Tab cycles within drawer only
  - [x] Escape key closes drawer
  - [x] On close: return focus to gear icon (focus management)
  - [x] All interactive elements keyboard-navigable (Tab + Enter/Space)
- [x] Task 7: Write tests (AC: all)
  - [x] Test: gear icon click opens Settings drawer
  - [x] Test: backdrop click closes Settings drawer
  - [x] Test: close button closes Settings drawer
  - [x] Test: ELO slider updates store value
  - [x] Test: theme toggle switches theme class on document
  - [x] Test: Escape key closes drawer
  - [x] Test: settings persist after drawer close (via Zustand persist)

## Dev Notes

### Architecture Compliance

- **Settings is a conditional overlay** — rendered in App.tsx alongside other components, not a route
- **Single store**: settings state lives in `game-store.ts` under the `settings` slice
- **Named exports**: `export function Settings()`
- **Tailwind for all styling** — no inline styles except for dynamic slider values if needed
- **No animation library** — CSS transitions/transforms only

### Settings State in game-store.ts

```typescript
// Already partially defined in store — this story implements the full settings slice
settings: {
  opponentElo: 1000,  // Default ELO
  theme: 'dark' as 'dark' | 'light',
},

// New UI state
showSettings: false,

// Actions
setShowSettings: (show: boolean) => set({ showSettings: show }),
updateSettings: (partial: Partial<Settings>) => set((state) => ({
  settings: { ...state.settings, ...partial },
})),
```

### Theme Implementation Strategy

```typescript
// In App.tsx or a useEffect hook:
const theme = useGameStore((state) => state.settings.theme)

useEffect(() => {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}, [theme])
```

Tailwind config:
```typescript
// tailwind.config.ts
export default {
  darkMode: 'class',
  // ...
}
```

### Drawer Animation (CSS)

```css
/* index.css */
.settings-drawer {
  transform: translateX(100%);
  transition: transform 300ms ease-out;
}
.settings-drawer.open {
  transform: translateX(0);
}

@media (prefers-reduced-motion: reduce) {
  .settings-drawer {
    transition: none;
  }
}
```

### ELO Slider — No Special Timing Logic

The ELO value is read from the store at the moment `getAIMove(fen, elo)` is called. Since this happens after the player's move, changing ELO mid-game naturally takes effect on the next AI move. No debouncing or "apply on next move" logic needed.

### Focus Trap Pattern

```typescript
// Simple focus trap for modal/drawer
function useFocusTrap(ref: RefObject<HTMLElement>, isOpen: boolean) {
  useEffect(() => {
    if (!isOpen || !ref.current) return
    const focusable = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0] as HTMLElement
    const last = focusable[focusable.length - 1] as HTMLElement

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus()
        }
      }
      if (e.key === 'Escape') {
        // Close drawer
      }
    }
    document.addEventListener('keydown', handler)
    first?.focus()
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen])
}
```

### UX Spec Notes

From UX design specification:
- Settings is accessed via gear icon in header — NOT visible during gameplay focus
- Drawer slides in as overlay, does NOT navigate away from the board
- Dark theme (sable) is the PRIMARY theme — light is secondary
- The drawer should feel lightweight and quick — open/close is fluid, not a heavy modal

### Project Structure Notes

- Creates: `src/components/Settings/Settings.tsx`, `src/components/Settings/Settings.test.tsx`
- Modifies: `src/components/Header/Header.tsx` (wire gear icon), `src/store/game-store.ts` (settings actions, showSettings state), `src/App.tsx` (render Settings conditionally), `tailwind.config.ts` (darkMode: 'class'), `src/index.css` (drawer animation, light theme tokens)
- Depends on: Story 2.1 (persist middleware must be configured)
- Game history section (Story 2.3) will be added inside this drawer later

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Component Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#State Management Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Anti-Patterns to Avoid]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.2]
- [Source: _bmad-output/planning-artifacts/prd.md#FR16, FR17, FR18]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Design System Foundation]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
No issues encountered.

### Completion Notes List
- Created Settings drawer component with slide-in animation, backdrop, and close button
- Wired Header gear icon to toggle showSettings in store
- ELO slider: range 800-1600, step 50, with ARIA attributes
- Theme toggle: switch between dark/light with CSS custom properties on html element
- Light theme CSS already existed — updated selector from `.light` to `html.light` for specificity
- Added drawer slide-in/out CSS animation with reduced-motion support
- Full accessibility: role=dialog, aria-modal, focus trap, Escape key, focus return
- 8 tests covering all acceptance criteria

### File List
- `src/components/Settings/Settings.tsx` — New: Settings drawer component
- `src/components/Settings/Settings.test.tsx` — New: 8 tests for Settings
- `src/components/Header/Header.tsx` — Modified: wired gear icon onClick
- `src/store/game-store.ts` — Modified: added showSettings state and setShowSettings action
- `src/store/game-store.test.ts` — Modified: updated beforeEach with showSettings
- `src/App.tsx` — Modified: import and render Settings component
- `src/index.css` — Modified: drawer animation CSS, updated light theme selector

### Change Log
- 2026-03-08: Implemented Story 2.2 — Settings drawer with ELO slider, theme toggle, accessibility, and tests
