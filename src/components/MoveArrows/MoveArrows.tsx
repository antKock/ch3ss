import { useState, useCallback, useRef, useEffect } from 'react'
import { useGameStore } from '../../store/game-store'
import type { ClassifiedMove } from '../../types/chess'

// Ocean accessible palette (Story 4.5)
const ARROW_COLORS = ['#3A70B0', '#B8860B', '#8D5AA5']
const BOARD_SIZE = 800

// Arrow geometry constants (Story 4.5)
const STROKE = 22
const HEAD_HALF_W = 28
const HEAD_LEN = 40
const START_OFF = 44
const TIP_OFF = 8
const RND = 0.22

interface MoveArrowsProps {
  onSelectMove?: (move: ClassifiedMove, arrowColor?: string) => void
}

function squareToPixel(square: string, isFlipped: boolean): { x: number; y: number } {
  const file = square.charCodeAt(0) - 97
  const rank = parseInt(square[1]) - 1
  const squareSize = BOARD_SIZE / 8
  if (isFlipped) {
    return {
      x: (7 - file + 0.5) * squareSize,
      y: (rank + 0.5) * squareSize,
    }
  }
  return {
    x: (file + 0.5) * squareSize,
    y: (7 - rank + 0.5) * squareSize,
  }
}

function buildArrowPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  isKnight: boolean,
): { shaftPath: string; headPoints: string } {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const ux = dx / dist
  const uy = dy / dist

  // Start and tip offsets
  const sx = from.x + ux * START_OFF
  const sy = from.y + uy * START_OFF
  const tx = to.x - ux * TIP_OFF
  const ty = to.y - uy * TIP_OFF

  if (isKnight) {
    // L-shaped path for knight moves — right-angle, not curved
    const fileMove = Math.abs(dx)
    const rankMove = Math.abs(dy)
    const verticalFirst = rankMove > fileMove

    let midX: number, midY: number
    if (verticalFirst) {
      midX = from.x
      midY = to.y
    } else {
      midX = to.x
      midY = from.y
    }

    // Direction of leg 1 (from → mid)
    const leg1Dx = midX - from.x
    const leg1Dy = midY - from.y
    const leg1Dist = Math.sqrt(leg1Dx * leg1Dx + leg1Dy * leg1Dy)
    const startX = from.x + (leg1Dist > 0 ? (leg1Dx / leg1Dist) * START_OFF : 0)
    const startY = from.y + (leg1Dist > 0 ? (leg1Dy / leg1Dist) * START_OFF : 0)

    // Direction of leg 2 (mid → to) for tip offset and arrow head
    const leg2Dx = to.x - midX
    const leg2Dy = to.y - midY
    const leg2Dist = Math.sqrt(leg2Dx * leg2Dx + leg2Dy * leg2Dy)
    const eUx = leg2Dist > 0 ? leg2Dx / leg2Dist : 0
    const eUy = leg2Dist > 0 ? leg2Dy / leg2Dist : 0

    // Tip position offset along leg 2 direction
    const tipX = to.x - eUx * TIP_OFF
    const tipY = to.y - eUy * TIP_OFF

    // Shaft: two straight segments forming a right angle
    const shaftEndX = tipX - eUx * HEAD_LEN
    const shaftEndY = tipY - eUy * HEAD_LEN
    const shaftPath = `M ${startX} ${startY} L ${midX} ${midY} L ${shaftEndX} ${shaftEndY}`

    // Arrow head at the tip
    const headBase = { x: tipX - eUx * HEAD_LEN, y: tipY - eUy * HEAD_LEN }
    const perpX = -eUy
    const perpY = eUx

    const p1 = `${headBase.x + perpX * HEAD_HALF_W},${headBase.y + perpY * HEAD_HALF_W}`
    const p2 = `${tipX},${tipY}`
    const p3 = `${headBase.x - perpX * HEAD_HALF_W},${headBase.y - perpY * HEAD_HALF_W}`

    return { shaftPath, headPoints: `${p1} ${p2} ${p3}` }
  }

  // Straight arrow
  const shaftEndX = tx - ux * HEAD_LEN
  const shaftEndY = ty - uy * HEAD_LEN
  const shaftPath = `M ${sx} ${sy} L ${shaftEndX} ${shaftEndY}`

  // Arrow head
  const perpX = -uy
  const perpY = ux
  const headBase = { x: tx - ux * HEAD_LEN, y: ty - uy * HEAD_LEN }

  const p1 = `${headBase.x + perpX * HEAD_HALF_W},${headBase.y + perpY * HEAD_HALF_W}`
  const p2 = `${tx},${ty}`
  const p3 = `${headBase.x - perpX * HEAD_HALF_W},${headBase.y - perpY * HEAD_HALF_W}`

  return { shaftPath, headPoints: `${p1} ${p2} ${p3}` }
}

function isKnightMove(from: string, to: string): boolean {
  const df = Math.abs(from.charCodeAt(0) - to.charCodeAt(0))
  const dr = Math.abs(parseInt(from[1]) - parseInt(to[1]))
  return (df === 1 && dr === 2) || (df === 2 && dr === 1)
}

function getPieceNameForArrow(san: string): string {
  if (san.startsWith('K') || san.startsWith('k')) return 'king'
  if (san.startsWith('Q') || san.startsWith('q')) return 'queen'
  if (san.startsWith('R') || san.startsWith('r')) return 'rook'
  if (san.startsWith('B') || san.startsWith('b')) return 'bishop'
  if (san.startsWith('N') || san.startsWith('n')) return 'knight'
  return 'pawn'
}

export function MoveArrows({ onSelectMove }: MoveArrowsProps) {
  const currentMoves = useGameStore((state) => state.currentMoves)
  const shuffled = useGameStore((state) => state.shuffledMoves)
  const playerColor = useGameStore((state) => state.playerColor)
  const [shakeKey, setShakeKey] = useState(0)
  const [dismissState, setDismissState] = useState<{ chosenIdx: number } | null>(null)
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFlipped = playerColor === 'b'

  // Cleanup dismiss timer on unmount
  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
    }
  }, [])

  // Handle invalid tap (tap on board but not on a move square)
  const handleBoardClick = useCallback(
    (e: React.MouseEvent) => {
      const el = e.target as SVGElement
      if (el.dataset?.squareHitbox) return
      if (currentMoves && currentMoves.length > 0 && !dismissState) {
        setShakeKey((k) => k + 1)
      }
    },
    [currentMoves, dismissState],
  )

  const handleArrowClick = useCallback(
    (move: ClassifiedMove, idx: number) => {
      if (dismissState) return
      const arrowColor = ARROW_COLORS[idx % ARROW_COLORS.length]

      // Start dismiss animation
      setDismissState({ chosenIdx: idx })

      // After dismiss animation completes (220ms = longest), trigger move
      dismissTimerRef.current = setTimeout(() => {
        onSelectMove?.(move, arrowColor)
        setDismissState(null)
      }, 220)
    },
    [dismissState, onSelectMove],
  )

  if (!shuffled) return null

  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none z-10 ${
        shakeKey > 0 && !dismissState ? 'arrow-shake' : ''
      }`}
      key={dismissState ? `dismiss-${shakeKey}` : shakeKey}
      viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
      aria-label="Move options"
      onClick={handleBoardClick}
      style={{ pointerEvents: 'auto' }}
    >
      {shuffled.map((move, i) => {
        const from = squareToPixel(move.from, isFlipped)
        const to = squareToPixel(move.to, isFlipped)
        const color = ARROW_COLORS[i % ARROW_COLORS.length]
        const knight = isKnightMove(move.from, move.to)
        const { shaftPath, headPoints } = buildArrowPath(from, to, knight)
        const pieceName = getPieceNameForArrow(move.san)

        // Determine animation class
        let animClass: string
        if (dismissState) {
          animClass = i === dismissState.chosenIdx ? 'arrow-dismiss-chosen' : 'arrow-dismiss-other'
        } else {
          animClass = `animate-arrow-${i + 1}`
        }

        return (
          <g
            key={`${move.from}-${move.to}`}
            className={animClass}
            style={{ opacity: dismissState ? 1 : 0 }}
          >
            {/* Shaft */}
            <path
              d={shaftPath}
              stroke={color}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity={0.8}
            />
            {/* Head */}
            <polygon
              points={headPoints}
              fill={color}
              opacity={0.8}
              rx={RND * HEAD_HALF_W}
            />
            {/* Hitbox for source square */}
            <rect
              x={from.x - BOARD_SIZE / 16}
              y={from.y - BOARD_SIZE / 16}
              width={BOARD_SIZE / 8}
              height={BOARD_SIZE / 8}
              fill="transparent"
              className="cursor-pointer"
              data-square-hitbox="true"
              onClick={(e) => {
                e.stopPropagation()
                handleArrowClick(move, i)
              }}
            />
            {/* Hitbox for destination square */}
            <rect
              x={to.x - BOARD_SIZE / 16}
              y={to.y - BOARD_SIZE / 16}
              width={BOARD_SIZE / 8}
              height={BOARD_SIZE / 8}
              fill="transparent"
              className="cursor-pointer"
              data-square-hitbox="true"
              role="button"
              aria-label={`Move ${pieceName} from ${move.from} to ${move.to}`}
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                handleArrowClick(move, i)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleArrowClick(move, i)
                }
              }}
            />
          </g>
        )
      })}
    </svg>
  )
}
