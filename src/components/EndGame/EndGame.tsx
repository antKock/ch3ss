import { useEffect, useRef } from 'react'
import { useGameStore } from '../../store/game-store'
import type { GameResult } from '../../types/chess'

function getResultDisplay(
  result: GameResult,
  playerColor: 'w',
): { title: string; subtitle?: string } {
  switch (result.type) {
    case 'checkmate':
      return result.winner === playerColor
        ? { title: 'Victory', subtitle: 'Checkmate' }
        : { title: 'Defeat', subtitle: 'Checkmate' }
    case 'stalemate':
      return { title: 'Draw', subtitle: 'Stalemate' }
    case 'resignation':
      return { title: 'Resigned' }
  }
}

export function EndGame() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const result = useGameStore((state) => state.result)
  const playerColor = useGameStore((state) => state.playerColor)
  const moveHistory = useGameStore((state) => state.moveHistory)
  const startNewGame = useGameStore((state) => state.startNewGame)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Focus trap: focus the dialog when it appears
  useEffect(() => {
    if (gamePhase === 'ended' && dialogRef.current) {
      dialogRef.current.focus()
    }
  }, [gamePhase])

  if (gamePhase !== 'ended' || !result) return null

  const { title, subtitle } = getResultDisplay(result, playerColor)

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
      role="dialog"
      aria-labelledby="endgame-title"
      aria-modal="true"
    >
      <div
        ref={dialogRef}
        className="bg-[var(--color-bg-secondary)] rounded-2xl p-8 text-center max-w-sm mx-4 shadow-2xl"
        tabIndex={-1}
      >
        <h2
          id="endgame-title"
          className="text-3xl font-bold mb-2"
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-[var(--color-text-secondary)] text-lg mb-4">
            {subtitle}
          </p>
        )}
        <p className="text-[var(--color-text-secondary)] text-sm mb-6">
          {moveHistory.length} move{moveHistory.length !== 1 ? 's' : ''} played
        </p>
        <button
          onClick={startNewGame}
          className="px-6 py-3 rounded-lg bg-[var(--color-accent)] text-white font-semibold hover:opacity-90 transition-opacity text-lg"
          aria-label="Start new game"
        >
          New Game
        </button>
      </div>
    </div>
  )
}
