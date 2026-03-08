import { useGameStore } from '../../store/game-store'

const MINI_BOARD_COLORS = {
  light: '#E8F0E8',
  dark: '#B8D0B4',
}

const ARROW_COLORS = ['#3A70B0', '#B8860B', '#8D5AA5']

function MiniBoard() {
  return (
    <div
      className="grid grid-cols-4 grid-rows-4 rounded-[14px] overflow-hidden"
      style={{ width: 140, height: 140 }}
      aria-hidden="true"
    >
      {Array.from({ length: 16 }).map((_, i) => {
        const row = Math.floor(i / 4)
        const col = i % 4
        const isLight = (row + col) % 2 === 0
        return (
          <div
            key={i}
            style={{ backgroundColor: isLight ? MINI_BOARD_COLORS.light : MINI_BOARD_COLORS.dark }}
          />
        )
      })}
      {/* Mini arrows overlay */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 140 140">
        {/* Arrow 1: blue */}
        <line x1="52" y1="105" x2="52" y2="70" stroke={ARROW_COLORS[0]} strokeWidth="4" strokeLinecap="round" opacity="0.8" />
        <polygon points="44,73 52,62 60,73" fill={ARROW_COLORS[0]} opacity="0.8" />
        {/* Arrow 2: amber */}
        <line x1="87" y1="105" x2="87" y2="52" stroke={ARROW_COLORS[1]} strokeWidth="4" strokeLinecap="round" opacity="0.8" />
        <polygon points="79,55 87,44 95,55" fill={ARROW_COLORS[1]} opacity="0.8" />
        {/* Arrow 3: violet */}
        <line x1="52" y1="87" x2="87" y2="52" stroke={ARROW_COLORS[2]} strokeWidth="4" strokeLinecap="round" opacity="0.8" />
        <polygon points="80,44 95,48 84,58" fill={ARROW_COLORS[2]} opacity="0.8" />
      </svg>
    </div>
  )
}

export function HomeScreen() {
  const startNewGame = useGameStore((state) => state.startNewGame)
  const setShowSettings = useGameStore((state) => state.setShowSettings)
  const gameHistory = useGameStore((state) => state.gameHistory)

  const gameCount = gameHistory.length

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center relative">
      {/* Gear icon top-right */}
      <button
        className="absolute top-4 right-4 p-2 opacity-50 hover:opacity-80 transition-opacity"
        onClick={() => setShowSettings(true)}
        aria-label="Réglages"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      <div className="flex flex-col items-center gap-6" style={{ maxWidth: 320 }}>
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-[42px] font-extrabold tracking-tight leading-none">
            ch<span className="text-[var(--color-accent)]">3</span>ss
          </h1>
          <p className="text-[13px] text-[var(--color-text-sec)] mt-1">
            3 options, ton choix
          </p>
        </div>

        {/* Mini board */}
        <div className="relative">
          <MiniBoard />
        </div>

        {/* Play button */}
        <button
          onClick={startNewGame}
          className="px-14 py-3.5 rounded-[14px] text-[16px] font-semibold text-white shadow-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          Jouer
        </button>

        {/* Game counter */}
        <p className="text-[11px] text-[var(--color-text-sec)]">
          {gameCount === 0 ? 'Première partie !' : `${gameCount} parties jouées`}
        </p>
      </div>
    </div>
  )
}
