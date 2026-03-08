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

function detectGameResult(
  chess: InstanceType<typeof Chess>,
): import('../types/chess').GameResult | null {
  if (chess.isCheckmate()) {
    const winner = chess.turn() === 'w' ? 'b' : 'w'
    return { type: 'checkmate', winner: winner as 'w' | 'b' }
  } else if (chess.isStalemate() || chess.isDraw()) {
    return { type: 'stalemate' }
  }
  return null
}

export function useStockfish() {
  const fen = useGameStore((state) => state.fen)
  const settings = useGameStore((state) => state.settings)
  const playerColor = useGameStore((state) => state.playerColor)
  const presentMoves = useGameStore((state) => state.presentMoves)
  const playAIMove = useGameStore((state) => state.playAIMove)
  const endGame = useGameStore((state) => state.endGame)
  const setEngineReady = useGameStore((state) => state.setEngineReady)
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const aiColor = playerColor === 'w' ? 'b' : 'w'

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

    // Wait for piece animation to complete before continuing
    await delay(250)

    // Check if game is over after player move
    const chess = new Chess(currentFen)
    const playerResult = detectGameResult(chess)
    if (playerResult) {
      // Checkmate: pause 1.5s on board with king tremble visible, then end
      if (playerResult.type === 'checkmate') {
        await delay(1500)
      }
      endGame(playerResult)
      return
    }

    // It should now be AI's turn
    if (chess.turn() !== aiColor) return

    setIsAIThinking(true)
    setError(null)

    try {
      // Get AI response
      const aiMove = await getAIMoveService(
        currentFen,
        settings.opponentElo,
      )

      // No artificial delay — the undo toast cooldown serves as AI thinking time
      // Small delay only if undo was already consumed
      const undoState = useGameStore.getState().undoState
      if (!undoState) {
        await delay(300)
      }

      // Execute AI move
      playAIMove(aiMove)
      setIsAIThinking(false)

      // Wait for piece animation to complete
      await delay(250)

      // Check if game is over after AI move
      const postAiFen = useGameStore.getState().fen
      const postAiPhase = useGameStore.getState().gamePhase
      if (postAiPhase !== 'playing') return

      const postAiChess = new Chess(postAiFen)
      const aiResult = detectGameResult(postAiChess)
      if (aiResult) {
        if (aiResult.type === 'checkmate') {
          await delay(1500)
        }
        endGame(aiResult)
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
  }, [aiColor, settings.opponentElo, playAIMove, presentMoves, endGame])

  // Handle AI's first move when player is black
  const handleAIFirstMove = useCallback(async () => {
    const currentFen = useGameStore.getState().fen
    setIsAIThinking(true)
    try {
      const aiMove = await getAIMoveService(currentFen, settings.opponentElo)
      await delay(800)
      playAIMove(aiMove)
      setIsAIThinking(false)

      const postAiFen = useGameStore.getState().fen
      const moves = await generatePlayerMoves(postAiFen)
      presentMoves(moves)
    } catch (err) {
      setIsAIThinking(false)
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [settings.opponentElo, playAIMove, presentMoves])

  return {
    isReady,
    isLoading,
    isAIThinking,
    error,
    generateMoves,
    handlePlayerMoveComplete,
    handleAIFirstMove,
  }
}
