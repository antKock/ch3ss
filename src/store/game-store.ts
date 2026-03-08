import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Chess } from 'chess.js'
import type { ClassifiedMove, GameResult, MoveRecord, Settings } from '../types/chess'

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export interface GameStore {
  // Game state (persisted)
  fen: string
  moveHistory: MoveRecord[]
  gamePhase: 'playing' | 'ended'
  result?: GameResult
  playerColor: 'w'

  // Settings (persisted)
  settings: Settings

  // UI state (NOT persisted)
  currentMoves: ClassifiedMove[] | null
  isEngineReady: boolean
  pendingPromotion: { from: string; to: string; options: ClassifiedMove[] } | null
  isMoving: boolean

  // Actions
  playMove: (move: ClassifiedMove) => void
  playAIMove: (move: { from: string; to: string; promotion?: string }) => void
  startNewGame: () => void
  updateSettings: (settings: Partial<Settings>) => void
  presentMoves: (moves: ClassifiedMove[]) => void
  endGame: (result: GameResult) => void
  resign: () => void
  setEngineReady: (ready: boolean) => void
  setPendingPromotion: (promo: { from: string; to: string; options: ClassifiedMove[] } | null) => void
  setIsMoving: (moving: boolean) => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial game state
      fen: STARTING_FEN,
      moveHistory: [],
      gamePhase: 'playing' as const,
      result: undefined,
      playerColor: 'w' as const,

      // Initial settings
      settings: {
        opponentElo: 1000,
        theme: 'dark' as const,
      },

      // Initial UI state
      currentMoves: null,
      isEngineReady: false,
      pendingPromotion: null,
      isMoving: false,

      // Actions
      playMove: (move: ClassifiedMove) => {
        const state = get()
        const chess = new Chess(state.fen)
        const result = chess.move({
          from: move.from,
          to: move.to,
          promotion: move.promotion,
        })
        if (!result) return // Invalid move — should never happen

        const record: MoveRecord = {
          fen: state.fen,
          played: {
            from: move.from,
            to: move.to,
            san: result.san,
            promotion: move.promotion,
          },
          options: state.currentMoves!,
          classification: move.classification,
        }

        set({
          fen: chess.fen(),
          moveHistory: [...state.moveHistory, record],
          currentMoves: null,
        })
      },

      playAIMove: (move) => {
        const state = get()
        const chess = new Chess(state.fen)
        chess.move(move)
        set({ fen: chess.fen() })
      },

      startNewGame: () =>
        set({
          fen: STARTING_FEN,
          moveHistory: [],
          gamePhase: 'playing',
          result: undefined,
          playerColor: 'w',
          currentMoves: null,
          pendingPromotion: null,
          isMoving: false,
        }),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      presentMoves: (moves) => set({ currentMoves: moves }),

      endGame: (result) =>
        set({
          gamePhase: 'ended',
          result,
          currentMoves: null,
        }),

      resign: () =>
        set({
          gamePhase: 'ended',
          result: { type: 'resignation', resignedBy: 'w' },
          currentMoves: null,
        }),

      setEngineReady: (ready) => set({ isEngineReady: ready }),
      setPendingPromotion: (promo) => set({ pendingPromotion: promo }),
      setIsMoving: (moving) => set({ isMoving: moving }),
    }),
    {
      name: 'ch3ss-game',
      partialize: (state) => ({
        fen: state.fen,
        moveHistory: state.moveHistory,
        gamePhase: state.gamePhase,
        result: state.result,
        playerColor: state.playerColor,
        settings: state.settings,
      }),
    },
  ),
)
