import { useMemo } from 'react'
import { useGameStore } from '../../store/game-store'
import type { ClassifiedMove } from '../../types/chess'

const ARROW_COLORS = ['#5B8DEF', '#50C878', '#FFA500']
const BOARD_SIZE = 800 // SVG viewBox size

interface MoveArrowsProps {
  onSelectMove?: (move: ClassifiedMove) => void
}

function squareToPixel(square: string): { x: number; y: number } {
  const file = square.charCodeAt(0) - 97 // 'a' = 0, 'h' = 7
  const rank = parseInt(square[1]) - 1 // '1' = 0, '8' = 7
  const squareSize = BOARD_SIZE / 8
  return {
    x: (file + 0.5) * squareSize,
    y: (7 - rank + 0.5) * squareSize, // Flip: rank 8 at top
  }
}

function getPieceNameForArrow(san: string): string {
  // Simple mapping from SAN first character
  if (san.startsWith('K') || san.startsWith('k')) return 'king'
  if (san.startsWith('Q') || san.startsWith('q')) return 'queen'
  if (san.startsWith('R') || san.startsWith('r')) return 'rook'
  if (san.startsWith('B') || san.startsWith('b')) return 'bishop'
  if (san.startsWith('N') || san.startsWith('n')) return 'knight'
  return 'pawn'
}

export function MoveArrows({ onSelectMove }: MoveArrowsProps) {
  const currentMoves = useGameStore((state) => state.currentMoves)

  // Shuffle once when moves change so colors don't correlate with quality
  const shuffled = useMemo(() => {
    if (!currentMoves || currentMoves.length === 0) return null
    return [...currentMoves].sort(() => Math.random() - 0.5)
  }, [currentMoves])

  if (!shuffled) return null

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
      aria-label="Move options"
    >
      <defs>
        {ARROW_COLORS.map((color, i) => (
          <marker
            key={`arrowhead-${i}`}
            id={`arrowhead-${i}`}
            markerWidth="10"
            markerHeight="7"
            refX="10"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={color} />
          </marker>
        ))}
      </defs>

      {shuffled.map((move, i) => {
        const from = squareToPixel(move.from)
        const to = squareToPixel(move.to)
        const color = ARROW_COLORS[i % ARROW_COLORS.length]
        const pieceName = getPieceNameForArrow(move.san)

        return (
          <g
            key={`${move.from}-${move.to}`}
            className={`arrow-group motion-safe:animate-arrow-${i + 1} motion-reduce:opacity-100`}
            style={{ opacity: 0 }}
          >
            {/* Visible arrow */}
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={color}
              strokeWidth={8}
              strokeLinecap="round"
              markerEnd={`url(#arrowhead-${i})`}
              opacity={0.8}
            />
            {/* Larger invisible hitbox for touch */}
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="transparent"
              strokeWidth={44}
              className="pointer-events-auto cursor-pointer"
              onClick={() => onSelectMove?.(move)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelectMove?.(move)
                }
              }}
              role="button"
              aria-label={`Move ${pieceName} from ${move.from} to ${move.to}`}
              tabIndex={0}
            />
          </g>
        )
      })}
    </svg>
  )
}
