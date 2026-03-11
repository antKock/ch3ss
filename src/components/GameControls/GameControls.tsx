import { useState, useEffect, useRef, useCallback } from 'react'
import { useGameStore } from '../../store/game-store'

const COOLDOWN_MS = 1200

export function GameControls() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const resign = useGameStore((state) => state.resign)
  const setBoardFadeOut = useGameStore((state) => state.setBoardFadeOut)
  const [showResignToast, setShowResignToast] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancelledRef = useRef(false)

  const handleResign = useCallback(() => {
    cancelledRef.current = false
    setShowResignToast(true)
    timerRef.current = setTimeout(() => {
      if (!cancelledRef.current) {
        setShowResignToast(false)
        // Fade out board then resign
        setBoardFadeOut(true)
        setTimeout(() => {
          resign()
        }, 400)
      }
    }, COOLDOWN_MS)
  }, [resign, setBoardFadeOut])

  const handleCancelResign = useCallback(() => {
    cancelledRef.current = true
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setShowResignToast(false)
  }, [])

  // Keyboard: Escape cancels resign
  useEffect(() => {
    if (!showResignToast) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCancelResign()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [showResignToast, handleCancelResign])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  if (gamePhase !== 'playing') return null

  return (
    <>
      {/* Discreet abandon button pinned to bottom (Story 4.8) */}
      {!showResignToast && (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-10">
          <button
            onClick={handleResign}
            className="text-[11px] text-(--color-text-sec) opacity-50 hover:opacity-80 transition-opacity bg-transparent border-0"
            aria-label="Abandonner la partie"
          >
            Abandonner
          </button>
        </div>
      )}

      {/* Resign toast with cooldown (Story 4.8) */}
      {showResignToast && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 toast-enter"
          role="status"
          aria-label="Partie abandonnée. Annuler disponible"
        >
          <div
            className="relative flex items-center gap-3 px-4 py-3.5 rounded-[18px] shadow-lg overflow-hidden"
            style={{
              backgroundColor: 'var(--color-surface)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
            }}
          >
            {/* Cooldown ring */}
            <svg
              className="absolute pointer-events-none"
              style={{
                '--ring-length': 240,
                inset: '1px',
                width: 'calc(100% - 2px)',
                height: 'calc(100% - 2px)',
              } as React.CSSProperties}
            >
              <rect
                x="0" y="0"
                width="100%" height="100%"
                rx="17" ry="17"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="2"
                strokeDasharray="240"
                strokeDashoffset="0"
                className="cooldown-ring"
                opacity="0.6"
              />
            </svg>
            <span className="text-[13px] font-semibold text-(--color-text)">
              Partie abandonnée
            </span>
            <button
              onClick={handleCancelResign}
              className="text-[14px] font-semibold px-3 py-1 rounded-[14px] transition-opacity hover:opacity-80"
              style={{
                color: 'var(--color-accent)',
                backgroundColor: 'rgba(106, 128, 96, 0.1)',
              }}
              aria-label="Annuler l'abandon"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </>
  )
}
