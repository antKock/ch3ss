import { useCallback, useEffect, useRef, Component, type ReactNode } from 'react'
import { Chess } from 'chess.js'
import './index.css'
import { Header } from './components/Header/Header'
import { Board } from './components/Board/Board'
import { MoveArrows } from './components/MoveArrows/MoveArrows'
import { GameControls } from './components/GameControls/GameControls'
import { EndGame } from './components/EndGame/EndGame'
import { Settings } from './components/Settings/Settings'
import { useStockfish } from './hooks/useStockfish'
import { useGameStore } from './store/game-store'
import type { ClassifiedMove } from './types/chess'

// Error Boundary
interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
          <div className="text-center">
            <p className="text-lg mb-4">Something went wrong.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white"
            >
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function GameApp() {
  const { isReady, isAIThinking, generateMoves, handlePlayerMoveComplete } = useStockfish()
  const gamePhase = useGameStore((state) => state.gamePhase)
  const fen = useGameStore((state) => state.fen)
  const currentMoves = useGameStore((state) => state.currentMoves)
  const playMove = useGameStore((state) => state.playMove)
  const pendingPromotion = useGameStore((state) => state.pendingPromotion)
  const setPendingPromotion = useGameStore((state) => state.setPendingPromotion)
  const theme = useGameStore((state) => state.settings.theme)
  const hasInitializedRef = useRef(false)

  // Apply theme class on document element
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  // On engine ready + game playing, generate initial moves or trigger AI
  useEffect(() => {
    if (isReady && gamePhase === 'playing' && !currentMoves && !hasInitializedRef.current) {
      hasInitializedRef.current = true
      if (fen.includes(' w ')) {
        // Player's turn — generate move options
        generateMoves(fen)
      } else if (fen.includes(' b ')) {
        // AI's turn (restored mid-game) — trigger AI response
        handlePlayerMoveComplete()
      }
    }
  }, [isReady, gamePhase, currentMoves, fen, generateMoves, handlePlayerMoveComplete])

  // Reset init flag on new game
  useEffect(() => {
    if (gamePhase === 'playing' && !currentMoves) {
      hasInitializedRef.current = false
    }
  }, [gamePhase, currentMoves])

  const handleSelectMove = useCallback(
    (move: ClassifiedMove) => {
      // Check for pawn promotion using chess.js to verify the piece type
      const chess = new Chess(fen)
      const piece = chess.get(move.from as import('chess.js').Square)
      const isPawnPromotion =
        piece?.type === 'p' &&
        move.to[1] === '8' &&
        !move.promotion

      if (isPawnPromotion) {
        setPendingPromotion({
          from: move.from,
          to: move.to,
          options: useGameStore.getState().currentMoves!,
        })
        return
      }

      playMove(move)
      // Trigger AI response after a short delay for the board to update
      setTimeout(() => handlePlayerMoveComplete(), 50)
    },
    [fen, playMove, setPendingPromotion, handlePlayerMoveComplete],
  )

  // When a new game starts (after EndGame "New Game" button), generate moves
  useEffect(() => {
    if (isReady && gamePhase === 'playing' && !currentMoves && !pendingPromotion) {
      // Small delay to allow state to settle
      const timer = setTimeout(() => {
        const currentFen = useGameStore.getState().fen
        if (currentFen.includes(' w ') && !useGameStore.getState().currentMoves) {
          generateMoves(currentFen)
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isReady, gamePhase, currentMoves, pendingPromotion, generateMoves])

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] font-['Poppins',sans-serif] flex flex-col items-center">
      <Header />
      <main className="relative w-full max-w-md mx-auto flex flex-col items-center">
        <div className="relative">
          <Board />
          <MoveArrows onSelectMove={handleSelectMove} />
          {/* AI thinking indicator */}
          {isAIThinking && (
            <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/50 rounded-full px-3 py-1">
              <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
              <span className="text-xs text-[var(--color-text-secondary)]">Thinking</span>
            </div>
          )}
          {/* Engine loading indicator */}
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="flex items-center gap-2 bg-black/70 rounded-full px-4 py-2">
                <div className="w-3 h-3 rounded-full bg-[var(--color-accent)] animate-pulse" />
                <span className="text-sm">Loading engine...</span>
              </div>
            </div>
          )}
        </div>
        <GameControls />
      </main>
      <EndGame />
      <Settings />
    </div>
  )
}

export function App() {
  return (
    <ErrorBoundary>
      <GameApp />
    </ErrorBoundary>
  )
}
