# Story 2.2: Settings Drawer — ELO & Theme

Status: ready-for-dev

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

- [ ] Task 1: Create Settings component (AC: #1, #8)
  - [ ] Create `src/components/Settings/Settings.tsx`
  - [ ] Implement as a slide-in drawer overlay from the right side
  - [ ] Backdrop: semi-transparent overlay behind drawer, clicking closes drawer
  - [ ] Close button (X) at top of drawer
  - [ ] Slide-in/slide-out CSS animation (transform translateX)
  - [ ] Use `motion-reduce:` Tailwind variant to disable animation for reduced-motion preference
  - [ ] Add to App.tsx: render conditionally based on `showSettings` UI state
- [ ] Task 2: Wire Header gear icon (AC: #1)
  - [ ] In `src/components/Header/Header.tsx`, wire gear icon `onClick` to toggle `showSettings` in store
  - [ ] Add `setShowSettings(boolean)` action to game-store.ts UI slice
  - [ ] Gear icon: use an inline SVG or Unicode ⚙ character — no icon library needed
- [ ] Task 3: ELO slider (AC: #2, #3, #4)
  - [ ] Add range input (`<input type="range">`) for ELO: min=800, max=1600, step=50
  - [ ] Display current ELO value next to slider
  - [ ] On change: update `settings.opponentElo` in store
  - [ ] Zustand persist middleware (from Story 2.1) auto-saves the new value
  - [ ] ELO change takes effect on next AI move — no special logic needed, `getAIMove` reads current `opponentElo` from store at call time
  - [ ] Style slider with Tailwind: accent color matching theme
  - [ ] ARIA: `aria-label="AI difficulty ELO"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`
- [ ] Task 4: Theme toggle (AC: #5, #6, #7)
  - [ ] Add toggle switch for dark/light theme
  - [ ] On toggle: update `settings.theme` in store ('dark' | 'light')
  - [ ] Apply theme by toggling a CSS class on `<html>` or `<body>` element: `dark` class for dark theme
  - [ ] Use Tailwind dark mode with `class` strategy (configured in `tailwind.config.ts`: `darkMode: 'class'`)
  - [ ] On app load: read theme from persisted store and apply class immediately (prevent flash)
  - [ ] Dark theme (sable) is default — initial store value: `theme: 'dark'`
  - [ ] ARIA: `aria-label="Toggle theme"`, `role="switch"`, `aria-checked`
- [ ] Task 5: Theme CSS implementation (AC: #6)
  - [ ] Define light theme color tokens in `index.css` or Tailwind config
  - [ ] Dark theme colors already defined (Story 1.1 — sable base styles)
  - [ ] Ensure all existing components use Tailwind `dark:` variant for theme-aware styling
  - [ ] Board squares: theme-appropriate colors for light/dark squares
  - [ ] Text, backgrounds, borders: all theme-aware
  - [ ] Settings drawer itself: theme-aware
  - [ ] Color contrast meets WCAG AA in both themes (NFR9)
- [ ] Task 6: Accessibility (AC: #9)
  - [ ] Settings drawer: `role="dialog"`, `aria-label="Settings"`, `aria-modal="true"`
  - [ ] Focus trap: when drawer is open, Tab cycles within drawer only
  - [ ] Escape key closes drawer
  - [ ] On close: return focus to gear icon (focus management)
  - [ ] All interactive elements keyboard-navigable (Tab + Enter/Space)
- [ ] Task 7: Write tests (AC: all)
  - [ ] Test: gear icon click opens Settings drawer
  - [ ] Test: backdrop click closes Settings drawer
  - [ ] Test: close button closes Settings drawer
  - [ ] Test: ELO slider updates store value
  - [ ] Test: theme toggle switches theme class on document
  - [ ] Test: Escape key closes drawer
  - [ ] Test: settings persist after drawer close (via Zustand persist)

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

### Debug Log References

### Completion Notes List

### File List
