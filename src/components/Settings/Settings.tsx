import { useEffect, useRef } from 'react'
import { useGameStore } from '../../store/game-store'
import type { GameResult } from '../../types/chess'

function resultLabel(result: GameResult): string {
  switch (result.type) {
    case 'checkmate':
      return result.winner === 'w' ? 'Victory' : 'Defeat'
    case 'stalemate':
      return 'Draw'
    case 'resignation':
      return 'Resigned'
  }
}

export function Settings() {
  const showSettings = useGameStore((state) => state.showSettings)
  const setShowSettings = useGameStore((state) => state.setShowSettings)
  const settings = useGameStore((state) => state.settings)
  const updateSettings = useGameStore((state) => state.updateSettings)
  const gameHistory = useGameStore((state) => state.gameHistory)
  const drawerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  // Focus trap and keyboard handling
  useEffect(() => {
    if (!showSettings || !drawerRef.current) return

    // Store the element that opened the drawer for focus return
    triggerRef.current = document.activeElement as HTMLElement

    const focusable = drawerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0] as HTMLElement
    const last = focusable[focusable.length - 1] as HTMLElement

    first?.focus()

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSettings(false)
        return
      }
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [showSettings, setShowSettings])

  // Return focus to trigger on close
  useEffect(() => {
    if (!showSettings && triggerRef.current) {
      triggerRef.current.focus()
      triggerRef.current = null
    }
  }, [showSettings])

  return (
    <div
      className={`fixed inset-0 z-40 transition-visibility ${showSettings ? '' : 'pointer-events-none'}`}
      onClick={() => setShowSettings(false)}
    >
      {/* Backdrop */}
      <div className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${showSettings ? 'opacity-100' : 'opacity-0'}`} />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-label="Settings"
        aria-modal="true"
        aria-hidden={!showSettings}
        inert={!showSettings ? true : undefined}
        className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-[var(--color-bg-secondary)] shadow-2xl p-6 overflow-y-auto settings-drawer ${showSettings ? 'open' : ''} motion-reduce:transition-none`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Settings</h2>
          <button
            onClick={() => setShowSettings(false)}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            aria-label="Close settings"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ELO Slider */}
        <section className="mb-8">
          <label htmlFor="elo-slider" className="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">
            AI Difficulty
          </label>
          <div className="flex items-center gap-3">
            <input
              id="elo-slider"
              type="range"
              min={800}
              max={1600}
              step={50}
              value={settings.opponentElo}
              onChange={(e) => updateSettings({ opponentElo: Number(e.target.value) })}
              className="flex-1 accent-[var(--color-accent)]"
              aria-label="AI difficulty ELO"
              aria-valuemin={800}
              aria-valuemax={1600}
              aria-valuenow={settings.opponentElo}
            />
            <span className="text-lg font-mono font-semibold w-12 text-right">{settings.opponentElo}</span>
          </div>
          <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mt-1">
            <span>800</span>
            <span>1600</span>
          </div>
        </section>

        {/* Theme Toggle */}
        <section className="mb-8">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">Light Theme</span>
            <button
              role="switch"
              aria-checked={settings.theme === 'light'}
              aria-label="Toggle theme"
              onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.theme === 'light' ? 'bg-[var(--color-accent)]' : 'bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.theme === 'light' ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        </section>

        {/* Game History */}
        <section aria-label="Game History">
          <h3 className="text-lg font-semibold mb-2">History</h3>
          {gameHistory.length === 0 ? (
            <p className="text-[var(--color-text-secondary)] text-center py-4">No games played yet</p>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {gameHistory.map((game) => (
                <li key={game.date} className="flex justify-between text-sm py-1 border-b border-white/10 last:border-0">
                  <span className="text-[var(--color-text-secondary)]">{new Date(game.date).toLocaleDateString()}</span>
                  <span className="font-medium">{resultLabel(game.result)}</span>
                  <span className="text-[var(--color-text-secondary)]">{game.moveCount} moves</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
