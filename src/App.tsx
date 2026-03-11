import { useCallback, useEffect, useRef, Component, type ReactNode } from 'react'
import './index.css'
import { Header } from './components/Header/Header'
import { Board } from './components/Board/Board'
import { MoveArrows } from './components/MoveArrows/MoveArrows'
import { GameControls } from './components/GameControls/GameControls'
import { HomeScreen } from './components/HomeScreen/HomeScreen'
import { RecapScreen } from './components/RecapScreen/RecapScreen'
import { Settings } from './components/Settings/Settings'
import { UndoToast } from './components/UndoToast/UndoToast'
import { CapturedPieces } from './components/CapturedPieces/CapturedPieces'
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
        <div className="min-h-screen flex items-center justify-center bg-(--color-bg) text-(--color-text)">
          <div className="text-center">
            <p className="text-lg mb-4">Something went wrong.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg text-white"
              style={{ backgroundColor: 'var(--color-accent)' }}
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

function FinalBoardView() {
  const setShowFinalBoard = useGameStore((state) => state.setShowFinalBoard)
  const goHome = useGameStore((state) => state.goHome)

  return (
    <div className="min-h-screen bg-(--color-bg) flex flex-col items-center pt-4">
      <div className="w-full max-w-md mx-auto px-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setShowFinalBoard(false)}
            className="p-1 hover:opacity-80 transition-opacity"
            aria-label="Retour"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-bold">Position finale</h2>
        </div>
      </div>
      <div className="relative">
        <Board />
      </div>
      <button
        onClick={() => {
          setShowFinalBoard(false)
          goHome()
        }}
        className="mt-4 text-[13px] text-(--color-text-sec) hover:opacity-80"
      >
        Accueil
      </button>
    </div>
  )
}

function GameApp() {
  const { isReady, isAIThinking, generateMoves, handlePlayerMoveComplete, handleAIFirstMove } = useStockfish()
  const gamePhase = useGameStore((state) => state.gamePhase)
  const fen = useGameStore((state) => state.fen)
  const currentMoves = useGameStore((state) => state.currentMoves)
  const playMove = useGameStore((state) => state.playMove)
  const playerColor = useGameStore((state) => state.playerColor)
  const theme = useGameStore((state) => state.settings.theme)
  const showFinalBoard = useGameStore((state) => state.showFinalBoard)
  const hasInitializedRef = useRef(false)

  // Apply theme class on document element
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  // On engine ready + game playing, generate initial moves or trigger AI
  useEffect(() => {
    if (isReady && gamePhase === 'playing' && !currentMoves && !hasInitializedRef.current) {
      hasInitializedRef.current = true
      const chess_turn = fen.includes(' w ') ? 'w' : 'b'

      if (chess_turn === playerColor) {
        // Player's turn — generate move options
        generateMoves(fen)
      } else {
        // AI's turn — either first move (player is black) or restored mid-game
        handleAIFirstMove()
      }
    }
  }, [isReady, gamePhase, currentMoves, fen, playerColor, generateMoves, handleAIFirstMove])

  // Reset init flag when game phase changes (new game or return to home)
  useEffect(() => {
    hasInitializedRef.current = false
  }, [gamePhase])

  const handleSelectMove = useCallback(
    (move: ClassifiedMove, arrowColor?: string) => {
      // Auto-promote to queen — no promotion dialog (Story 4.7)
      playMove(move, arrowColor)
      // Don't trigger AI immediately — undo toast cooldown handles timing
    },
    [playMove],
  )

  // Called when undo cooldown expires — now trigger AI response
  const handleUndoCooldownExpired = useCallback(() => {
    handlePlayerMoveComplete()
  }, [handlePlayerMoveComplete])

  // When a new game starts, generate moves
  useEffect(() => {
    if (isReady && gamePhase === 'playing' && !currentMoves) {
      const timer = setTimeout(() => {
        const state = useGameStore.getState()
        if (state.gamePhase !== 'playing') return
        const chess_turn = state.fen.includes(' w ') ? 'w' : 'b'
        if (chess_turn === state.playerColor && !state.currentMoves) {
          generateMoves(state.fen)
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isReady, gamePhase, currentMoves, generateMoves])

  // === SCREEN ROUTING ===

  // Home screen
  if (gamePhase === 'home') {
    return (
      <>
        <HomeScreen />
        <Settings />
      </>
    )
  }

  // Final board view (from recap)
  if (showFinalBoard) {
    return (
      <>
        <FinalBoardView />
        <Settings />
      </>
    )
  }

  // Recap screen (end game)
  if (gamePhase === 'ended') {
    return (
      <>
        <RecapScreen />
        <Settings />
      </>
    )
  }

  // Playing screen
  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-text) font-['Poppins',sans-serif] flex flex-col items-center">
      <Header />
      <main className="relative w-full max-w-md mx-auto flex flex-col items-center justify-center flex-1 px-4">
        {/* Captured pieces — adversary (top) */}
        <div className="w-[min(calc(100vw-2rem),428px)] mb-1">
          <CapturedPieces position="top" />
        </div>

        <div className="relative">
          <Board />
          <MoveArrows onSelectMove={handleSelectMove} />
          {/* AI thinking indicator */}
          {isAIThinking && (
            <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/50 rounded-full px-3 py-1">
              <div className="w-2 h-2 rounded-full bg-(--color-accent) animate-pulse" />
              <span className="text-xs text-(--color-text-sec)">Thinking</span>
            </div>
          )}
          {/* Engine loading indicator */}
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-[10px]">
              <div className="flex items-center gap-2 bg-black/70 rounded-full px-4 py-2">
                <div className="w-3 h-3 rounded-full bg-(--color-accent) animate-pulse" />
                <span className="text-sm">Loading engine...</span>
              </div>
            </div>
          )}
        </div>

        {/* Undo toast — below the board */}
        <UndoToast onCooldownExpired={handleUndoCooldownExpired} />

        {/* Captured pieces — player (bottom) */}
        <div className="w-[min(calc(100vw-2rem),428px)] mt-1">
          <CapturedPieces position="bottom" />
        </div>

        <GameControls />
      </main>
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
