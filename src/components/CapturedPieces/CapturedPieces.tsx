import { useMemo } from 'react'
import { Chess } from 'chess.js'
import { useGameStore } from '../../store/game-store'

const PIECE_VALUES: Record<string, number> = { q: 9, r: 5, b: 3, n: 3, p: 1 }
const INITIAL_PIECES: Record<string, number> = { q: 1, r: 2, b: 2, n: 2, p: 8 }

const STAUNTY_BASE = 'https://cdn.jsdelivr.net/gh/lichess-org/lila@6e3b5257/public/piece/staunty'

function pieceUrl(color: string, type: string): string {
  const c = color === 'w' ? 'w' : 'b'
  const t = type.toUpperCase()
  return `${STAUNTY_BASE}/${c}${t}.svg`
}

function getCapturedPieces(fen: string): { white: string[]; black: string[] } {
  const chess = new Chess(fen)
  const board = chess.board()
  const remaining: Record<string, Record<string, number>> = {
    w: { q: 0, r: 0, b: 0, n: 0, p: 0 },
    b: { q: 0, r: 0, b: 0, n: 0, p: 0 },
  }

  for (const row of board) {
    for (const square of row) {
      if (square && square.type !== 'k') {
        remaining[square.color][square.type]++
      }
    }
  }

  const captured: { white: string[]; black: string[] } = { white: [], black: [] }

  for (const type of Object.keys(INITIAL_PIECES)) {
    const missingWhite = INITIAL_PIECES[type] - remaining.w[type]
    const missingBlack = INITIAL_PIECES[type] - remaining.b[type]
    for (let i = 0; i < missingWhite; i++) captured.white.push(type)
    for (let i = 0; i < missingBlack; i++) captured.black.push(type)
  }

  // Sort by value descending
  const sortByValue = (a: string, b: string) => (PIECE_VALUES[b] || 0) - (PIECE_VALUES[a] || 0)
  captured.white.sort(sortByValue)
  captured.black.sort(sortByValue)

  return captured
}

interface CapturedPiecesRowProps {
  pieces: string[]
  color: 'w' | 'b'
  isDarkMode: boolean
}

function CapturedPiecesRow({ pieces, color, isDarkMode }: CapturedPiecesRowProps) {
  if (pieces.length === 0) return null

  return (
    <div className="flex items-center gap-0.5 h-6 min-h-[22px]" aria-label={`Captured ${color === 'w' ? 'white' : 'black'} pieces`}>
      {pieces.map((type, i) => (
        <img
          key={`${type}-${i}`}
          src={pieceUrl(color, type)}
          alt={`${color === 'w' ? 'white' : 'black'} ${type}`}
          className="select-none pointer-events-none"
          style={{
            width: 22,
            height: 22,
            opacity: 0.85,
            filter: isDarkMode && color === 'b'
              ? 'brightness(1.6) drop-shadow(0 0 2px rgba(255,255,255,0.3))'
              : 'brightness(1.1)',
          }}
          draggable={false}
        />
      ))}
    </div>
  )
}

export function CapturedPieces({ position }: { position: 'top' | 'bottom' }) {
  const fen = useGameStore((state) => state.fen)
  const playerColor = useGameStore((state) => state.playerColor)
  const theme = useGameStore((state) => state.settings.theme)
  const isDarkMode = theme === 'dark'

  const captured = useMemo(() => getCapturedPieces(fen), [fen])

  // Top = adversary's captured pieces (pieces the player took)
  // Bottom = player's captured pieces (pieces the AI took)
  const adversaryColor = playerColor === 'w' ? 'b' : 'w'

  if (position === 'top') {
    // Pieces the player captured (adversary's pieces)
    return <CapturedPiecesRow pieces={captured[adversaryColor === 'w' ? 'white' : 'black']} color={adversaryColor} isDarkMode={isDarkMode} />
  }

  // Pieces the AI captured (player's pieces)
  return <CapturedPiecesRow pieces={captured[playerColor === 'w' ? 'white' : 'black']} color={playerColor} isDarkMode={isDarkMode} />
}
