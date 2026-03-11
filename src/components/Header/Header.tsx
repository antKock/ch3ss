import { useGameStore } from '../../store/game-store'

export function Header() {
  const gamePhase = useGameStore((state) => state.gamePhase)

  // During gameplay, show only the logo centered (no gear icon — Story 4.8)
  if (gamePhase !== 'playing') return null

  return (
    <header className="w-full max-w-md mx-auto flex flex-col items-center justify-center px-4 pt-3 pb-1">
      <h1 className="text-[24px] font-extrabold tracking-tight">
        ch<span className="text-(--color-accent)">3</span>ss
      </h1>
      <p className="text-[11px] text-(--color-text-sec) opacity-60 tracking-wide">
        3 options, ton choix
      </p>
    </header>
  )
}
