import { Chess } from 'chess.js'
import { useGameStore } from '../../store/game-store'

const PIECE_MAP: Record<string, string> = {
  wk: '/pieces/wK.svg',
  wq: '/pieces/wQ.svg',
  wr: '/pieces/wR.svg',
  wb: '/pieces/wB.svg',
  wn: '/pieces/wN.svg',
  wp: '/pieces/wP.svg',
  bk: '/pieces/bK.svg',
  bq: '/pieces/bQ.svg',
  br: '/pieces/bR.svg',
  bb: '/pieces/bB.svg',
  bn: '/pieces/bN.svg',
  bp: '/pieces/bP.svg',
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1']

const PIECE_NAMES: Record<string, string> = {
  q: 'Queen',
  r: 'Rook',
  b: 'Bishop',
  n: 'Knight',
}

function getPieceName(type: string, color: string): string {
  const names: Record<string, string> = {
    k: 'king',
    q: 'queen',
    r: 'rook',
    b: 'bishop',
    n: 'knight',
    p: 'pawn',
  }
  const colorName = color === 'w' ? 'white' : 'black'
  return `${colorName} ${names[type] || type}`
}

export function Board() {
  const fen = useGameStore((state) => state.fen)
  const gamePhase = useGameStore((state) => state.gamePhase)
  const result = useGameStore((state) => state.result)
  const pendingPromotion = useGameStore((state) => state.pendingPromotion)
  const playMove = useGameStore((state) => state.playMove)
  const setPendingPromotion = useGameStore((state) => state.setPendingPromotion)

  const chess = new Chess(fen)
  const board = chess.board()

  // Check for checkmate to apply visual effects
  const isCheckmate = gamePhase === 'ended' && result?.type === 'checkmate'

  const handlePromotion = (piece: string) => {
    if (!pendingPromotion) return
    // Find the move that matches from the options
    const move = pendingPromotion.options.find(
      (m) => m.from === pendingPromotion.from && m.to === pendingPromotion.to,
    )
    if (move) {
      playMove({ ...move, promotion: piece })
    }
    setPendingPromotion(null)
  }

  return (
    <div
      className={`relative w-[min(calc(100vw-2rem),428px)] aspect-square ${
        isCheckmate ? 'checkmate-board' : ''
      }`}
      role="grid"
      aria-label="Chess board"
    >
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {board.map((row, rankIdx) =>
          row.map((square, fileIdx) => {
            const isLight = (rankIdx + fileIdx) % 2 === 0
            const file = FILES[fileIdx]
            const rank = RANKS[rankIdx]
            const squareName = `${file}${rank}`
            const piece = square
              ? PIECE_MAP[`${square.color}${square.type}`]
              : null
            const pieceName = square
              ? getPieceName(square.type, square.color)
              : 'empty'

            // Checkmate king halo
            const isCheckmatedKing =
              isCheckmate &&
              square?.type === 'k' &&
              result?.type === 'checkmate' &&
              ((result.winner === 'w' && square.color === 'b') ||
                (result.winner === 'b' && square.color === 'w'))

            return (
              <div
                key={squareName}
                className={`relative flex items-center justify-center ${
                  isLight
                    ? 'bg-[var(--color-square-light)]'
                    : 'bg-[var(--color-square-dark)]'
                } ${isCheckmatedKing ? 'checkmate-king' : ''}`}
                role="gridcell"
                aria-label={`${squareName}, ${pieceName}`}
                tabIndex={0}
                data-square={squareName}
              >
                {piece && (
                  <img
                    src={piece}
                    alt={pieceName}
                    className="w-[85%] h-[85%] select-none pointer-events-none"
                    draggable={false}
                  />
                )}
                {rankIdx === 7 && (
                  <span
                    className={`absolute bottom-0 right-0.5 text-[0.5rem] leading-none opacity-50 ${
                      isLight
                        ? 'text-[var(--color-square-dark)]'
                        : 'text-[var(--color-square-light)]'
                    }`}
                    aria-hidden="true"
                  >
                    {file}
                  </span>
                )}
                {fileIdx === 0 && (
                  <span
                    className={`absolute top-0 left-0.5 text-[0.5rem] leading-none opacity-50 ${
                      isLight
                        ? 'text-[var(--color-square-dark)]'
                        : 'text-[var(--color-square-light)]'
                    }`}
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

      {/* Pawn promotion overlay */}
      {pendingPromotion && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/50 z-20"
          role="dialog"
          aria-label="Choose promotion piece"
          aria-modal="true"
        >
          <div className="flex gap-2 bg-[var(--color-bg-secondary)] p-4 rounded-lg shadow-lg">
            {(['q', 'r', 'b', 'n'] as const).map((piece) => (
              <button
                key={piece}
                onClick={() => handlePromotion(piece)}
                className="w-14 h-14 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
                aria-label={`Promote to ${PIECE_NAMES[piece]}`}
              >
                <img
                  src={`/pieces/w${piece.toUpperCase()}.svg`}
                  className="w-10 h-10"
                  alt={PIECE_NAMES[piece]}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
