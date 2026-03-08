import { useEffect, useRef } from 'react'
import { useGameStore } from '../../store/game-store'
import type { GameResult } from '../../types/chess'

const STAUNTY_BASE = 'https://cdn.jsdelivr.net/gh/lichess-org/lila@6e3b5257/public/piece/staunty'

function formatDuration(seconds?: number): string {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m > 0) return `${m}min ${s}s`
  return `${s}s`
}

function getResultInfo(result: GameResult, playerColor: 'w' | 'b') {
  switch (result.type) {
    case 'checkmate':
      if (result.winner === playerColor) {
        return { title: 'Victoire', kingState: 'standing' as const }
      }
      return { title: 'Défaite', kingState: 'fallen' as const }
    case 'stalemate':
      return { title: 'Égalité', kingState: 'draw' as const }
    case 'resignation':
      return { title: 'Défaite', kingState: 'fallen' as const }
  }
}

function KingIcon({ state, playerColor }: { state: 'standing' | 'fallen' | 'draw'; playerColor: 'w' | 'b' }) {
  const playerKing = `${STAUNTY_BASE}/${playerColor}K.svg`
  const opponentKing = `${STAUNTY_BASE}/${playerColor === 'w' ? 'b' : 'w'}K.svg`

  if (state === 'draw') {
    return (
      <div className="flex items-center gap-1">
        <img src={playerKing} alt="Player king" className="w-12 h-12" style={{ filter: 'brightness(1.1)' }} />
        <img src={opponentKing} alt="Opponent king" className="w-12 h-12" style={{ filter: 'brightness(1.1)' }} />
      </div>
    )
  }

  return (
    <img
      src={playerKing}
      alt="King"
      className="w-14 h-14"
      style={{
        filter: 'brightness(1.1)',
        transform: state === 'fallen' ? 'rotate(90deg)' : 'none',
      }}
    />
  )
}

function DistributionBar({ label, percentage }: { label: string; percentage: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[13px] font-bold w-16 text-[var(--color-text)]">{label}</span>
      <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: 'var(--color-accent)',
            opacity: 0.7,
          }}
        />
      </div>
      <span className="text-[14px] font-extrabold w-10 text-right" style={{ color: 'var(--color-accent)' }}>
        {percentage}%
      </span>
    </div>
  )
}

export function RecapScreen() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const result = useGameStore((state) => state.result)
  const playerColor = useGameStore((state) => state.playerColor)
  const moveHistory = useGameStore((state) => state.moveHistory)
  const gameHistory = useGameStore((state) => state.gameHistory)
  const startNewGame = useGameStore((state) => state.startNewGame)
  const goHome = useGameStore((state) => state.goHome)
  const setShowSettings = useGameStore((state) => state.setShowSettings)
  const setShowFinalBoard = useGameStore((state) => state.setShowFinalBoard)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (gamePhase === 'ended' && containerRef.current) {
      containerRef.current.focus()
    }
  }, [gamePhase])

  if (gamePhase !== 'ended' || !result) return null

  const { title, kingState } = getResultInfo(result, playerColor)
  const moveCount = moveHistory.length
  const lastGame = gameHistory[0]
  const duration = lastGame?.duration
  const distribution = lastGame?.distribution || { top: 0, correct: 0, bof: 0 }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center relative recap-enter"
      tabIndex={-1}
      role="region"
      aria-label="Résultat de la partie"
    >
      {/* Gear icon */}
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

      <div className="flex flex-col items-center gap-5 pt-10 px-4 max-w-sm w-full">
        {/* Result section */}
        <div className="flex flex-col items-center gap-2">
          <KingIcon state={kingState} playerColor={playerColor} />
          <h2 className="text-[26px] font-extrabold">{title}</h2>
          <p className="text-[13px] text-[var(--color-text-sec)]">
            {moveCount} coups{duration ? ` · ${formatDuration(duration)}` : ''}
          </p>
        </div>

        {/* Distribution card */}
        <div
          className="w-full rounded-[18px] p-5"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          <p className="text-[12px] font-bold uppercase text-[var(--color-text-sec)] mb-4 tracking-wider">
            Tes choix
          </p>
          <div className="flex flex-col gap-3">
            <DistributionBar label="Top" percentage={distribution.top} />
            <DistributionBar label="Correct" percentage={distribution.correct} />
            <DistributionBar label="Bof" percentage={distribution.bof} />
          </div>
        </div>

        {/* Replay button */}
        <button
          onClick={startNewGame}
          className="w-full py-3.5 rounded-[14px] text-[16px] font-semibold text-white shadow-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          Rejouer
        </button>

        {/* Secondary links */}
        <div className="flex items-center gap-4">
          <button
            onClick={goHome}
            className="text-[12px] text-[var(--color-text-sec)] hover:opacity-80 transition-opacity"
          >
            Accueil
          </button>
          <button
            onClick={() => setShowFinalBoard(true)}
            className="text-[12px] text-[var(--color-text-sec)] hover:opacity-80 transition-opacity"
          >
            Voir le plateau
          </button>
        </div>
      </div>
    </div>
  )
}
