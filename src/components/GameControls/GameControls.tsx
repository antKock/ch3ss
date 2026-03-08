import { useGameStore } from '../../store/game-store'

export function GameControls() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const resign = useGameStore((state) => state.resign)

  if (gamePhase !== 'playing') return null

  return (
    <div className="flex gap-4 mt-4">
      <button
        onClick={resign}
        className="px-4 py-2 rounded-lg bg-red-900/50 text-red-300 hover:bg-red-900/70 transition-colors text-sm font-medium"
        aria-label="Resign game"
      >
        Resign
      </button>
    </div>
  )
}
