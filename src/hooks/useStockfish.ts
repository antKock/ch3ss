import { useCallback, useEffect, useState } from 'react'
import { Chess } from 'chess.js'
import {
  initEngine,
  generatePlayerMoves,
  getAIMove as getAIMoveService,
} from '../engine/stockfish-service'
import { useGameStore } from '../store/game-store'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function detectAndEndGame(
  chess: InstanceType<typeof Chess>,
  endGame: (result: import('../types/chess').GameResult) => void,
): void {
  if (chess.isCheckmate()) {
    // The player whose turn it is has been checkmated
    // So the OTHER player won
    const winner = chess.turn() === 'w' ? 'b' : 'w'
    endGame({ type: 'checkmate', winner: winner as 'w' | 'b' })
  } else if (chess.isStalemate() || chess.isDraw()) {
    endGame({ type: 'stalemate' })
  }
}

export function useStockfish() {
  const fen = useGameStore((state) => state.fen)
  const settings = useGameStore((state) => state.settings)
  const presentMoves = useGameStore((state) => state.presentMoves)
  const playAIMove = useGameStore((state) => state.playAIMove)
  const endGame = useGameStore((state) => state.endGame)
  const setEngineReady = useGameStore((state) => state.setEngineReady)
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize engine on mount
  useEffect(() => {
    initEngine()
      .then(() => {
        setIsReady(true)
        setEngineReady(true)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err))
        console.error('Stockfish init failed:', err)
      })
  }, [setEngineReady])

  // Generate 3 classified moves for the current position
  const generateMoves = useCallback(
    async (targetFen?: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const moves = await generatePlayerMoves(targetFen ?? fen)
        presentMoves(moves)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
        console.error('Move generation failed:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [fen, presentMoves],
  )

  // Full turn cycle: after player moves, AI responds, then generate new player moves
  const handlePlayerMoveComplete = useCallback(async () => {
    const currentFen = useGameStore.getState().fen
    const currentPhase = useGameStore.getState().gamePhase

    if (currentPhase !== 'playing') return

    // Check if game is over after player move
    const chess = new Chess(currentFen)
    if (chess.isGameOver()) {
      detectAndEndGame(chess, endGame)
      return
    }

    // It should now be black's turn (AI)
    if (chess.turn() !== 'b') return

    setIsAIThinking(true)
    setError(null)

    try {
      const startTime = Date.now()

      // Get AI response
      const aiMove = await getAIMoveService(
        currentFen,
        settings.opponentElo,
      )

      // Apply artificial delay (~1s total)
      const elapsed = Date.now() - startTime
      if (elapsed < 1000) {
        await delay(1000 - elapsed)
      }

      // Execute AI move
      playAIMove(aiMove)

      setIsAIThinking(false)

      // Check if game is over after AI move
      const postAiFen = useGameStore.getState().fen
      const postAiPhase = useGameStore.getState().gamePhase
      if (postAiPhase !== 'playing') return

      const postAiChess = new Chess(postAiFen)
      if (postAiChess.isGameOver()) {
        detectAndEndGame(postAiChess, endGame)
        return
      }

      // Generate new player moves
      const moves = await generatePlayerMoves(postAiFen)
      presentMoves(moves)
    } catch (err) {
      setIsAIThinking(false)
      setError(err instanceof Error ? err.message : String(err))
      console.error('AI response failed:', err)
    }
  }, [settings.opponentElo, playAIMove, presentMoves, endGame])

  return {
    isReady,
    isLoading,
    isAIThinking,
    error,
    generateMoves,
    handlePlayerMoveComplete,
  }
}
