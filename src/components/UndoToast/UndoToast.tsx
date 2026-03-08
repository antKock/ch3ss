import { useEffect, useRef, useCallback } from 'react'
import { useGameStore } from '../../store/game-store'

const COOLDOWN_MS = 1200
const RING_PERIMETER = 240

interface UndoToastProps {
  onCooldownExpired: () => void
}

export function UndoToast({ onCooldownExpired }: UndoToastProps) {
  const undoState = useGameStore((state) => state.undoState)
  const undoMove = useGameStore((state) => state.undoMove)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancelledRef = useRef(false)

  const handleCancel = useCallback(() => {
    cancelledRef.current = true
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    undoMove()
  }, [undoMove])

  useEffect(() => {
    if (!undoState) return
    cancelledRef.current = false
    timerRef.current = setTimeout(() => {
      if (!cancelledRef.current) {
        useGameStore.getState().clearUndo()
        onCooldownExpired()
      }
    }, COOLDOWN_MS)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [undoState, onCooldownExpired])

  // Keyboard handling
  useEffect(() => {
    if (!undoState) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [undoState, handleCancel])

  if (!undoState) return null

  return (
    <div
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 toast-enter"
      role="status"
      aria-label="Coup joué. Annuler disponible"
    >
      <div
        className="relative flex items-center gap-3 px-4 py-3.5 rounded-[18px] shadow-lg overflow-hidden"
        style={{
          backgroundColor: 'var(--color-surface)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        }}
      >
        {/* Cooldown ring SVG */}
        <svg
          className="absolute pointer-events-none"
          style={{
            '--ring-length': RING_PERIMETER,
            inset: '1px',
            width: 'calc(100% - 2px)',
            height: 'calc(100% - 2px)',
          } as React.CSSProperties}
        >
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            rx="17"
            ry="17"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeDasharray={RING_PERIMETER}
            strokeDashoffset="0"
            className="cooldown-ring"
            opacity="0.6"
          />
        </svg>

        <span className="text-[13px] font-semibold text-[var(--color-text)]">
          Coup joué
        </span>
        <button
          onClick={handleCancel}
          className="text-[14px] font-semibold px-3 py-1 rounded-[14px] transition-opacity hover:opacity-80"
          style={{
            color: 'var(--color-accent)',
            backgroundColor: 'rgba(106, 128, 96, 0.1)',
          }}
          aria-label="Annuler le dernier coup"
        >
          Annuler
        </button>
      </div>
    </div>
  )
}
