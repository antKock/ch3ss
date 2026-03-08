import { useMemo } from 'react'
import { Chess } from 'chess.js'
import { useGameStore } from '../../store/game-store'
import { PieceAnimation } from './PieceAnimation'

const STAUNTY_BASE = 'https://cdn.jsdelivr.net/gh/lichess-org/lila@6e3b5257/public/piece/staunty'

function pieceImageUrl(color: string, type: string): string {
  return `${STAUNTY_BASE}/${color}${type.toUpperCase()}.svg`
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1']

// Arrow colors for square tinting (Ocean palette)
const ARROW_COLORS = ['#3A70B0', '#B8860B', '#8D5AA5']
const OPPONENT_TINT = '#8A8078'

function mixColors(base: string, overlay: string, amount: number): string {
  const parseHex = (hex: string) => {
    const h = hex.replace('#', '')
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }
  const [br, bg, bb] = parseHex(base)
  const [or, og, ob] = parseHex(overlay)
  const r = Math.round(br * (1 - amount) + or * amount)
  const g = Math.round(bg * (1 - amount) + og * amount)
  const b = Math.round(bb * (1 - amount) + ob * amount)
  return `rgb(${r},${g},${b})`
}

function getPieceName(type: string, color: string): string {
  const names: Record<string, string> = { k: 'king', q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn' }
  const colorName = color === 'w' ? 'white' : 'black'
  return `${colorName} ${names[type] || type}`
}

export function Board() {
  const fen = useGameStore((state) => state.fen)
  const gamePhase = useGameStore((state) => state.gamePhase)
  const result = useGameStore((state) => state.result)
  const playerColor = useGameStore((state) => state.playerColor)
  const shuffledMoves = useGameStore((state) => state.shuffledMoves)
  const lastPlayerMove = useGameStore((state) => state.lastPlayerMove)
  const lastAIMove = useGameStore((state) => state.lastAIMove)
  const animatingMove = useGameStore((state) => state.animatingMove)
  const boardFadeOut = useGameStore((state) => state.boardFadeOut)

  const chess = useMemo(() => new Chess(fen), [fen])
  const board = chess.board()
  const isFlipped = playerColor === 'b'

  const isCheckmate = gamePhase === 'ended' && result?.type === 'checkmate'

  // Compute square tints from current move arrows and last moves
  const squareTints = useMemo(() => {
    const tints: Record<string, string[]> = {}

    const addTint = (sq: string, color: string) => {
      if (!tints[sq]) tints[sq] = []
      tints[sq].push(color)
    }

    // Use shuffledMoves for tinting to match arrow display order (Gap 9)
    if (shuffledMoves) {
      shuffledMoves.forEach((move, i) => {
        const color = ARROW_COLORS[i % ARROW_COLORS.length]
        addTint(move.from, color)
        addTint(move.to, color)
      })
    }

    // Last player move tinting — use the chosen arrow's color
    if (lastPlayerMove && !shuffledMoves) {
      const tintColor = lastPlayerMove.arrowColor || ARROW_COLORS[0]
      addTint(lastPlayerMove.from, tintColor)
      addTint(lastPlayerMove.to, tintColor)
    }

    // Last AI move tinting
    if (lastAIMove) {
      addTint(lastAIMove.from, OPPONENT_TINT)
      addTint(lastAIMove.to, OPPONENT_TINT)
    }

    return tints
  }, [shuffledMoves, lastPlayerMove, lastAIMove])

  // Determine the mating piece square for pulse effect
  const matingSquare = useMemo(() => {
    if (!isCheckmate || !result || result.type !== 'checkmate') return null
    // Find the king that was mated, then find the piece delivering check
    const loserColor = result.winner === 'w' ? 'b' : 'w'
    const kingSquare = (() => {
      for (let r = 0; r < 8; r++) {
        for (let f = 0; f < 8; f++) {
          const sq = board[r][f]
          if (sq?.type === 'k' && sq.color === loserColor) {
            return `${FILES[f]}${RANKS[r]}`
          }
        }
      }
      return null
    })()
    if (!kingSquare) return null
    // Find attackers of king's square
    const attackers = chess.attackers(kingSquare as import('chess.js').Square, result.winner)
    return attackers.length > 0 ? attackers[0] : null
  }, [isCheckmate, result, board, chess])

  // Reorder files/ranks for flipped board
  const files = isFlipped ? [...FILES].reverse() : FILES
  const ranks = isFlipped ? [...RANKS].reverse() : RANKS

  const getSquareBg = (squareName: string, isLight: boolean) => {
    const baseBg = isLight ? '#E8F0E8' : '#B8D0B4'
    const tintColors = squareTints[squareName]
    if (!tintColors || tintColors.length === 0) return baseBg

    let mixed = baseBg
    for (const c of tintColors) {
      const amount = c === OPPONENT_TINT ? 0.35 : 0.45
      mixed = mixColors(mixed, c, amount)
    }
    return mixed
  }

  return (
    <div
      className={`relative w-[min(calc(100vw-2rem),428px)] aspect-square overflow-hidden ${
        boardFadeOut ? 'board-fade-out' : ''
      }`}
      style={{
        borderRadius: 10,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}
      role="grid"
      aria-label="Chess board"
    >
      <PieceAnimation />
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {ranks.map((rank, rankIdx) =>
          files.map((file, fileIdx) => {
            const squareName = `${file}${rank}`
            const boardRankIdx = RANKS.indexOf(rank)
            const boardFileIdx = FILES.indexOf(file)
            const square = board[boardRankIdx][boardFileIdx]
            const isLight = (boardRankIdx + boardFileIdx) % 2 === 0
            const piece = square ? pieceImageUrl(square.color, square.type) : null
            const pieceName = square ? getPieceName(square.type, square.color) : 'empty'

            const isCheckmatedKing =
              isCheckmate &&
              square?.type === 'k' &&
              result?.type === 'checkmate' &&
              ((result.winner === 'w' && square.color === 'b') ||
                (result.winner === 'b' && square.color === 'w'))

            const isMatingPiece = matingSquare === squareName

            // Hide piece at destination during animation (flying clone is visible instead)
            // Also hide the en passant captured pawn on its actual square
            const isAnimatingTo = animatingMove && (
              animatingMove.to === squareName ||
              (animatingMove.capturedSquare && animatingMove.capturedSquare === squareName)
            )
            const bgColor = getSquareBg(squareName, isLight)

            return (
              <div
                key={squareName}
                className={`relative flex items-center justify-center ${
                  isCheckmatedKing ? 'checkmate-king' : ''
                }`}
                style={{
                  backgroundColor: bgColor,
                  transition: 'background-color 200ms ease-out',
                }}
                role="gridcell"
                aria-label={`${squareName}, ${pieceName}`}
                tabIndex={0}
                data-square={squareName}
              >
                {piece && (
                  <img
                    src={piece}
                    alt={pieceName}
                    className={`w-[88%] h-[88%] select-none pointer-events-none ${
                      isMatingPiece ? 'mating-piece-pulse' : ''
                    }`}
                    style={{
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.18)) brightness(1.1)',
                      zIndex: 2,
                      opacity: isAnimatingTo ? 0 : 1,
                    }}
                    draggable={false}
                  />
                )}
                {/* File labels on bottom rank */}
                {rankIdx === 7 && (
                  <span
                    className="absolute bottom-0 right-0.5 text-[0.5rem] leading-none opacity-50"
                    style={{ color: isLight ? '#B8D0B4' : '#E8F0E8' }}
                    aria-hidden="true"
                  >
                    {file}
                  </span>
                )}
                {/* Rank labels on left file */}
                {fileIdx === 0 && (
                  <span
                    className="absolute top-0 left-0.5 text-[0.5rem] leading-none opacity-50"
                    style={{ color: isLight ? '#B8D0B4' : '#E8F0E8' }}
                    aria-hidden="true"
                  >
                    {rank}
                  </span>
                )}
              </div>
            )
          }),
        )}
      </div>
    </div>
  )
}
