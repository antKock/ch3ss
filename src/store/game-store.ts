import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Chess } from 'chess.js'
import type { ClassifiedMove, CompletedGame, GameResult, MoveRecord, Settings } from '../types/chess'

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

function computeDistribution(history: MoveRecord[]): { top: number; correct: number; bof: number } {
  if (history.length === 0) return { top: 0, correct: 0, bof: 0 }
  const counts = { top: 0, correct: 0, bof: 0 }
  for (const record of history) {
    counts[record.classification]++
  }
  const total = history.length
  return {
    top: Math.round((counts.top / total) * 100),
    correct: Math.round((counts.correct / total) * 100),
    bof: Math.round((counts.bof / total) * 100),
  }
}

export interface AnimatingMove {
  from: string
  to: string
  pieceColor: 'w' | 'b'
  pieceType: string
  capturedColor?: 'w' | 'b'
  capturedType?: string
  capturedSquare?: string // Different from `to` for en passant
  isKnight: boolean
}

export interface GameStore {
  // Game state (persisted)
  fen: string
  moveHistory: MoveRecord[]
  gamePhase: 'home' | 'playing' | 'ended'
  result?: GameResult
  playerColor: 'w' | 'b'
  gameStartTime: number

  // Settings (persisted)
  settings: Settings

  // Game history (persisted)
  gameHistory: CompletedGame[]

  // UI state (NOT persisted)
  currentMoves: ClassifiedMove[] | null
  shuffledMoves: ClassifiedMove[] | null
  isEngineReady: boolean
  pendingPromotion: { from: string; to: string; options: ClassifiedMove[] } | null
  isMoving: boolean
  showSettings: boolean
  lastPlayerMove: { from: string; to: string; arrowColor?: string } | null
  lastAIMove: { from: string; to: string } | null
  animatingMove: AnimatingMove | null
  undoState: {
    previousFen: string
    previousMoveHistory: MoveRecord[]
    moves: ClassifiedMove[]
  } | null
  boardFadeOut: boolean
  showFinalBoard: boolean

  // Actions
  playMove: (move: ClassifiedMove, arrowColor?: string) => void
  playAIMove: (move: { from: string; to: string; promotion?: string }) => void
  startNewGame: () => void
  goHome: () => void
  updateSettings: (settings: Partial<Settings>) => void
  presentMoves: (moves: ClassifiedMove[]) => void
  endGame: (result: GameResult) => void
  resign: () => void
  undoMove: () => void
  clearUndo: () => void
  setEngineReady: (ready: boolean) => void
  setPendingPromotion: (promo: { from: string; to: string; options: ClassifiedMove[] } | null) => void
  setIsMoving: (moving: boolean) => void
  setShowSettings: (show: boolean) => void
  setBoardFadeOut: (fade: boolean) => void
  setShowFinalBoard: (show: boolean) => void
  setAnimatingMove: (move: AnimatingMove | null) => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial game state
      fen: STARTING_FEN,
      moveHistory: [],
      gamePhase: 'home' as const,
      result: undefined,
      playerColor: 'w' as const,
      gameStartTime: 0,

      // Initial settings
      settings: {
        opponentElo: 1000,
        theme: 'dark' as const,
        devT1: 30,
        devT2: 100,
        devDepth: 12,
      },

      // Game history
      gameHistory: [],

      // Initial UI state
      currentMoves: null,
      shuffledMoves: null,
      isEngineReady: false,
      pendingPromotion: null,
      isMoving: false,
      showSettings: false,
      lastPlayerMove: null,
      lastAIMove: null,
      animatingMove: null,
      undoState: null,
      boardFadeOut: false,
      showFinalBoard: false,

      // Actions
      playMove: (move: ClassifiedMove, arrowColor?: string) => {
        const state = get()
        if (!state.currentMoves) return
        const chess = new Chess(state.fen)

        // Capture pre-move info for animation
        const movingPiece = chess.get(move.from as import('chess.js').Square)
        const targetPiece = chess.get(move.to as import('chess.js').Square)
        const df = Math.abs(move.from.charCodeAt(0) - move.to.charCodeAt(0))
        const dr = Math.abs(parseInt(move.from[1]) - parseInt(move.to[1]))
        const isKnight = (df === 1 && dr === 2) || (df === 2 && dr === 1)

        const result = chess.move({
          from: move.from,
          to: move.to,
          promotion: move.promotion || 'q', // Auto-promote to queen (Story 4.7)
        })
        if (!result) return

        const record: MoveRecord = {
          fen: state.fen,
          played: {
            from: move.from,
            to: move.to,
            san: result.san,
            promotion: move.promotion,
          },
          options: state.currentMoves,
          classification: move.classification,
        }

        // Detect en passant: captured pawn is on (to file, from rank)
        const isEnPassant = result.flags.includes('e')
        const capturedColor = isEnPassant
          ? (movingPiece!.color === 'w' ? 'b' : 'w') as 'w' | 'b'
          : targetPiece ? targetPiece.color as 'w' | 'b' : undefined
        const capturedType = isEnPassant ? 'p' : targetPiece ? targetPiece.type : undefined
        const capturedSquare = isEnPassant
          ? `${move.to[0]}${move.from[1]}` // Same file as destination, same rank as origin
          : undefined

        set({
          fen: chess.fen(),
          moveHistory: [...state.moveHistory, record],
          currentMoves: null,
          shuffledMoves: null,
          lastPlayerMove: { from: move.from, to: move.to, arrowColor },
          lastAIMove: null,
          animatingMove: movingPiece ? {
            from: move.from,
            to: move.to,
            pieceColor: movingPiece.color as 'w' | 'b',
            pieceType: movingPiece.type,
            capturedColor,
            capturedType,
            capturedSquare,
            isKnight,
          } : null,
          undoState: {
            previousFen: state.fen,
            previousMoveHistory: state.moveHistory,
            moves: state.currentMoves,
          },
        })
      },

      playAIMove: (move) => {
        const state = get()
        const chess = new Chess(state.fen)

        // Capture pre-move info for animation
        const movingPiece = chess.get(move.from as import('chess.js').Square)
        const targetPiece = chess.get(move.to as import('chess.js').Square)
        const df = Math.abs(move.from.charCodeAt(0) - move.to.charCodeAt(0))
        const dr = Math.abs(parseInt(move.from[1]) - parseInt(move.to[1]))
        const isKnight = (df === 1 && dr === 2) || (df === 2 && dr === 1)

        const result = chess.move(move)
        if (!result) {
          console.error('Invalid AI move:', move)
          return
        }
        // Detect en passant
        const isEnPassant = result.flags.includes('e')
        const aiCapturedColor = isEnPassant
          ? (movingPiece!.color === 'w' ? 'b' : 'w') as 'w' | 'b'
          : targetPiece ? targetPiece.color as 'w' | 'b' : undefined
        const aiCapturedType = isEnPassant ? 'p' : targetPiece ? targetPiece.type : undefined
        const aiCapturedSquare = isEnPassant
          ? `${move.to[0]}${move.from[1]}`
          : undefined

        set({
          fen: chess.fen(),
          lastAIMove: { from: move.from, to: move.to },
          lastPlayerMove: null,
          animatingMove: movingPiece ? {
            from: move.from,
            to: move.to,
            pieceColor: movingPiece.color as 'w' | 'b',
            pieceType: movingPiece.type,
            capturedColor: aiCapturedColor,
            capturedType: aiCapturedType,
            capturedSquare: aiCapturedSquare,
            isKnight,
          } : null,
        })
      },

      startNewGame: () => {
        const color = Math.random() < 0.5 ? 'w' : 'b'
        set({
          fen: STARTING_FEN,
          moveHistory: [],
          gamePhase: 'playing',
          result: undefined,
          playerColor: color as 'w' | 'b',
          currentMoves: null,
          shuffledMoves: null,
          pendingPromotion: null,
          isMoving: false,
          lastPlayerMove: null,
          lastAIMove: null,
          animatingMove: null,
          undoState: null,
          boardFadeOut: false,
          showFinalBoard: false,
          gameStartTime: Date.now(),
        })
      },

      goHome: () =>
        set({
          gamePhase: 'home',
          result: undefined,
          currentMoves: null,
          shuffledMoves: null,
          undoState: null,
          animatingMove: null,
          boardFadeOut: false,
          showFinalBoard: false,
        }),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      presentMoves: (moves) =>
        set({
          currentMoves: moves,
          shuffledMoves: [...moves].sort(() => Math.random() - 0.5),
        }),

      endGame: (result) =>
        set((state) => {
          const duration = state.gameStartTime
            ? Math.round((Date.now() - state.gameStartTime) / 1000)
            : undefined
          const entry: CompletedGame = {
            date: new Date().toISOString(),
            result,
            moveCount: state.moveHistory.length,
            playerColor: state.playerColor,
            duration,
            distribution: computeDistribution(state.moveHistory),
          }
          return {
            gamePhase: 'ended' as const,
            result,
            currentMoves: null,
            shuffledMoves: null,
            undoState: null,
            gameHistory: [entry, ...state.gameHistory].slice(0, 100),
          }
        }),

      resign: () =>
        set((state) => {
          const result: GameResult = { type: 'resignation', resignedBy: state.playerColor }
          const duration = state.gameStartTime
            ? Math.round((Date.now() - state.gameStartTime) / 1000)
            : undefined
          const entry: CompletedGame = {
            date: new Date().toISOString(),
            result,
            moveCount: state.moveHistory.length,
            playerColor: state.playerColor,
            duration,
            distribution: computeDistribution(state.moveHistory),
          }
          return {
            gamePhase: 'ended' as const,
            result,
            currentMoves: null,
            shuffledMoves: null,
            undoState: null,
            gameHistory: [entry, ...state.gameHistory].slice(0, 100),
          }
        }),

      undoMove: () => {
        const state = get()
        if (!state.undoState) return
        const moves = state.undoState.moves
        set({
          fen: state.undoState.previousFen,
          moveHistory: state.undoState.previousMoveHistory,
          currentMoves: moves,
          shuffledMoves: [...moves].sort(() => Math.random() - 0.5),
          lastPlayerMove: null,
          lastAIMove: null,
          animatingMove: null,
          undoState: null,
        })
      },

      clearUndo: () => set({ undoState: null }),

      setEngineReady: (ready) => set({ isEngineReady: ready }),
      setPendingPromotion: (promo) => set({ pendingPromotion: promo }),
      setIsMoving: (moving) => set({ isMoving: moving }),
      setShowSettings: (show) => set({ showSettings: show }),
      setBoardFadeOut: (fade) => set({ boardFadeOut: fade }),
      setShowFinalBoard: (show) => set({ showFinalBoard: show }),
      setAnimatingMove: (move) => set({ animatingMove: move }),
    }),
    {
      name: 'ch3ss-game',
      version: 2,
      partialize: (state) => ({
        fen: state.fen,
        moveHistory: state.moveHistory,
        gamePhase: state.gamePhase,
        result: state.result,
        playerColor: state.playerColor,
        settings: state.settings,
        gameHistory: state.gameHistory,
        gameStartTime: state.gameStartTime,
      }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.error('Rehydration failed, starting fresh game')
        }
      },
      migrate: (persisted, version) => {
        if (version === 1) {
          const state = persisted as Record<string, unknown>
          const settings = state.settings as Record<string, unknown> || {}
          return {
            ...state,
            playerColor: state.playerColor || 'w',
            gameStartTime: 0,
            settings: {
              opponentElo: settings.opponentElo || 1000,
              theme: settings.theme || 'dark',
              devT1: 30,
              devT2: 100,
              devDepth: 12,
            },
          }
        }
        return persisted as GameStore
      },
    },
  ),
)
