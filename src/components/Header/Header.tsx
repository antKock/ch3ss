import { useGameStore } from '../../store/game-store'

export function Header() {
  const gamePhase = useGameStore((state) => state.gamePhase)

  // During gameplay, show only the logo centered (no gear icon — Story 4.8)
  if (gamePhase !== 'playing') return null

  return (
    <header className="w-full max-w-md mx-auto flex items-center justify-center px-4 py-3">
      <h1 className="text-[20px] font-extrabold tracking-tight">
        ch<span className="text-(--color-accent)">3</span>ss
      </h1>
    </header>
  )
}
