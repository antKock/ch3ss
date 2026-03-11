import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../../store/game-store'
import type { GameResult } from '../../types/chess'

const ELO_PRESETS = [800, 1000, 1200, 1400, 1600]

function resultIcon(result: GameResult, playerColor: 'w' | 'b'): { icon: string; color: string } {
  switch (result.type) {
    case 'checkmate':
      return result.winner === playerColor
        ? { icon: '✓', color: 'var(--color-accent)' }
        : { icon: '✗', color: '#c44' }
    case 'stalemate':
      return { icon: '=', color: 'var(--color-text-sec)' }
    case 'resignation':
      return { icon: '✗', color: '#c44' }
  }
}

export function Settings() {
  const showSettings = useGameStore((state) => state.showSettings)
  const setShowSettings = useGameStore((state) => state.setShowSettings)
  const settings = useGameStore((state) => state.settings)
  const updateSettings = useGameStore((state) => state.updateSettings)
  const gameHistory = useGameStore((state) => state.gameHistory)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  // Track mount/unmount with animation
  useEffect(() => {
    if (showSettings) {
      setIsVisible(true)
      setIsClosing(false)
    } else if (isVisible) {
      // Animate out
      setIsClosing(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setIsClosing(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [showSettings]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (showSettings && containerRef.current) {
      triggerRef.current = document.activeElement as HTMLElement
      containerRef.current.focus()
    }
  }, [showSettings])

  useEffect(() => {
    if (!showSettings && triggerRef.current) {
      triggerRef.current.focus()
      triggerRef.current = null
    }
  }, [showSettings])

  useEffect(() => {
    if (!showSettings) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSettings(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [showSettings, setShowSettings])

  if (!isVisible) return null

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 bg-(--color-bg) overflow-y-auto ${isClosing ? 'settings-screen-exit' : 'settings-screen-enter'}`}
      role="dialog"
      aria-label="Réglages"
      aria-modal="true"
      tabIndex={-1}
    >
      <div className="max-w-md mx-auto px-4 pt-3 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setShowSettings(false)}
            className="p-1 hover:opacity-80 transition-opacity"
            aria-label="Retour"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-bold">Réglages</h2>
        </div>

        <div className="flex flex-col gap-4">
          {/* Theme toggle */}
          <section
            className="rounded-[18px] p-5"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <p className="text-[12px] font-bold uppercase text-(--color-text-sec) mb-3 tracking-wider">Thème</p>
            <div
              className="flex rounded-[10px] overflow-hidden"
              style={{ backgroundColor: 'var(--color-input-bg)' }}
            >
              {(['light', 'dark'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => updateSettings({ theme: t })}
                  className="flex-1 py-2 text-[13px] font-semibold transition-all"
                  style={{
                    backgroundColor: settings.theme === t ? 'var(--color-accent)' : 'transparent',
                    color: settings.theme === t ? '#fff' : 'var(--color-text)',
                  }}
                >
                  {t === 'light' ? 'Clair' : 'Sombre'}
                </button>
              ))}
            </div>
          </section>

          {/* ELO presets */}
          <section
            className="rounded-[18px] p-5"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <p className="text-[12px] font-bold uppercase text-(--color-text-sec) mb-3 tracking-wider">Niveau ELO</p>
            <div className="flex gap-2">
              {ELO_PRESETS.map((elo) => (
                <button
                  key={elo}
                  onClick={() => updateSettings({ opponentElo: elo })}
                  className="flex-1 py-2 rounded-[10px] text-[13px] font-semibold transition-all"
                  style={{
                    backgroundColor: settings.opponentElo === elo ? 'var(--color-accent)' : 'var(--color-input-bg)',
                    color: settings.opponentElo === elo ? '#fff' : 'var(--color-text)',
                  }}
                  aria-label={`ELO ${elo}`}
                  aria-pressed={settings.opponentElo === elo}
                >
                  {elo}
                </button>
              ))}
            </div>
          </section>

          {/* Dev controls - Thresholds */}
          <section
            className="rounded-[18px] p-5"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <p className="text-[12px] font-bold uppercase text-(--color-text-sec) tracking-wider">Eval-loss seuils (CP)</p>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded"
                style={{
                  color: 'var(--color-accent)',
                  backgroundColor: 'rgba(106, 128, 96, 0.15)',
                }}
              >
                DEV
              </span>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[11px] text-(--color-text-sec) mb-1 block">T1</label>
                <input
                  type="number"
                  value={settings.devT1}
                  onChange={(e) => updateSettings({ devT1: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-[10px] text-[14px] text-center bg-(--color-input-bg) text-(--color-text) border-0 outline-none"
                  min={0}
                  max={500}
                />
              </div>
              <div className="flex-1">
                <label className="text-[11px] text-(--color-text-sec) mb-1 block">T2</label>
                <input
                  type="number"
                  value={settings.devT2}
                  onChange={(e) => updateSettings({ devT2: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-[10px] text-[14px] text-center bg-(--color-input-bg) text-(--color-text) border-0 outline-none"
                  min={0}
                  max={1000}
                />
              </div>
            </div>
          </section>

          {/* Dev controls - Depth */}
          <section
            className="rounded-[18px] p-5"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <p className="text-[12px] font-bold uppercase text-(--color-text-sec) tracking-wider">Depth (demi-coups)</p>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded"
                style={{
                  color: 'var(--color-accent)',
                  backgroundColor: 'rgba(106, 128, 96, 0.15)',
                }}
              >
                DEV
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={4}
                max={20}
                value={settings.devDepth}
                onChange={(e) => updateSettings({ devDepth: Number(e.target.value) })}
                className="flex-1 accent-(--color-accent)"
                aria-label="Stockfish depth"
              />
              <span className="text-[14px] font-semibold w-8 text-right">{settings.devDepth}</span>
            </div>
          </section>

          {/* Game history */}
          <section
            className="rounded-[18px] p-5"
            style={{ backgroundColor: 'var(--color-surface)' }}
            aria-label="Historique"
          >
            <p className="text-[12px] font-bold uppercase text-(--color-text-sec) mb-3 tracking-wider">Historique</p>
            {gameHistory.length === 0 ? (
              <p className="text-(--color-text-sec) text-center py-4 text-[13px]">Aucune partie jouée</p>
            ) : (
              <div className="flex flex-col">
                {gameHistory.map((game, idx) => {
                  const { icon, color } = resultIcon(game.result, game.playerColor)
                  const dist = game.distribution
                  return (
                    <div
                      key={game.date}
                      className={`flex items-center gap-3 py-2.5 ${
                        idx < gameHistory.length - 1 ? 'border-b border-(--color-border)' : ''
                      }`}
                    >
                      <span className="text-[16px] font-bold w-6 text-center" style={{ color }}>
                        {icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-(--color-text)">
                          {game.moveCount} coups
                          {game.duration ? ` · ${Math.floor(game.duration / 60)}m${game.duration % 60}s` : ''}
                        </p>
                        {dist && (
                          <p className="text-[11px] text-(--color-text-sec)">
                            Top {dist.top}% · Correct {dist.correct}% · Bof {dist.bof}%
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
