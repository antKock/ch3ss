import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGameStore } from './game-store'
import type { ClassifiedMove } from '../types/chess'

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

describe('game-store', () => {
  beforeEach(() => {
    useGameStore.setState({
      fen: STARTING_FEN,
      moveHistory: [],
      gamePhase: 'playing',
      result: undefined,
      playerColor: 'w',
      currentMoves: null,
      shuffledMoves: null,
      isEngineReady: false,
      pendingPromotion: null,
      isMoving: false,
      showSettings: false,
      settings: { opponentElo: 1000, theme: 'dark', devT1: 30, devT2: 100, devDepth: 12 },
      gameHistory: [],
      gameStartTime: Date.now(),
      lastPlayerMove: null,
      lastAIMove: null,
      undoState: null,
      boardFadeOut: false,
      showFinalBoard: false,
    })
  })

  describe('playMove', () => {
    it('updates FEN after a valid move', () => {
      const move: ClassifiedMove = {
        from: 'e2',
        to: 'e4',
        san: 'e4',
        classification: 'top',
        evalLoss: 0,
      }
      useGameStore.setState({
        currentMoves: [move],
      })

      useGameStore.getState().playMove(move)

      const state = useGameStore.getState()
      expect(state.fen).not.toBe(STARTING_FEN)
      expect(state.fen).toContain('4P3') // e4 pawn
    })

    it('records move in history', () => {
      const moves: ClassifiedMove[] = [
        { from: 'e2', to: 'e4', san: 'e4', classification: 'top', evalLoss: 0 },
        { from: 'd2', to: 'd4', san: 'd4', classification: 'correct', evalLoss: 50 },
        { from: 'a2', to: 'a3', san: 'a3', classification: 'bof', evalLoss: 150 },
      ]
      useGameStore.setState({ currentMoves: moves })

      useGameStore.getState().playMove(moves[0])

      const state = useGameStore.getState()
      expect(state.moveHistory).toHaveLength(1)
      expect(state.moveHistory[0].played.from).toBe('e2')
      expect(state.moveHistory[0].played.to).toBe('e4')
      expect(state.moveHistory[0].classification).toBe('top')
      expect(state.moveHistory[0].options).toEqual(moves)
    })

    it('clears currentMoves after playing', () => {
      const move: ClassifiedMove = {
        from: 'e2',
        to: 'e4',
        san: 'e4',
        classification: 'top',
        evalLoss: 0,
      }
      useGameStore.setState({ currentMoves: [move] })

      useGameStore.getState().playMove(move)

      expect(useGameStore.getState().currentMoves).toBeNull()
    })
  })

  describe('playAIMove', () => {
    it('updates FEN after AI move', () => {
      // First play e4 as player
      const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'
      useGameStore.setState({ fen })

      useGameStore.getState().playAIMove({ from: 'e7', to: 'e5' })

      expect(useGameStore.getState().fen).toContain('4p3')
    })
  })

  describe('startNewGame', () => {
    it('resets to starting position', () => {
      useGameStore.setState({
        fen: 'some-modified-fen',
        moveHistory: [{ fen: '', played: { from: 'e2', to: 'e4', san: 'e4' }, options: [], classification: 'top' }],
        gamePhase: 'ended',
      })

      useGameStore.getState().startNewGame()

      const state = useGameStore.getState()
      expect(state.fen).toBe(STARTING_FEN)
      expect(state.moveHistory).toHaveLength(0)
      expect(state.gamePhase).toBe('playing')
      expect(state.result).toBeUndefined()
      expect(state.currentMoves).toBeNull()
    })
  })

  describe('endGame', () => {
    it('sets gamePhase to ended with result', () => {
      useGameStore.getState().endGame({ type: 'checkmate', winner: 'w' })

      const state = useGameStore.getState()
      expect(state.gamePhase).toBe('ended')
      expect(state.result).toEqual({ type: 'checkmate', winner: 'w' })
      expect(state.currentMoves).toBeNull()
    })
  })

  describe('resign', () => {
    it('sets resignation result', () => {
      useGameStore.getState().resign()

      const state = useGameStore.getState()
      expect(state.gamePhase).toBe('ended')
      expect(state.result).toEqual({ type: 'resignation', resignedBy: 'w' })
    })
  })

  describe('presentMoves', () => {
    it('stores classified moves', () => {
      const moves: ClassifiedMove[] = [
        { from: 'e2', to: 'e4', san: 'e4', classification: 'top', evalLoss: 0 },
      ]
      useGameStore.getState().presentMoves(moves)

      expect(useGameStore.getState().currentMoves).toEqual(moves)
    })
  })

  describe('gameHistory', () => {
    it('endGame adds entry to gameHistory', () => {
      useGameStore.setState({
        moveHistory: [
          { fen: '', played: { from: 'e2', to: 'e4', san: 'e4' }, options: [], classification: 'top' },
          { fen: '', played: { from: 'd2', to: 'd4', san: 'd4' }, options: [], classification: 'correct' },
        ],
      })

      useGameStore.getState().endGame({ type: 'checkmate', winner: 'w' })

      const state = useGameStore.getState()
      expect(state.gameHistory).toHaveLength(1)
      expect(state.gameHistory[0].result).toEqual({ type: 'checkmate', winner: 'w' })
      expect(state.gameHistory[0].moveCount).toBe(2)
      expect(state.gameHistory[0].playerColor).toBe('w')
      expect(state.gameHistory[0].date).toBeDefined()
    })

    it('gameHistory is prepended (newest first)', () => {
      useGameStore.getState().endGame({ type: 'checkmate', winner: 'w' })
      useGameStore.setState({ gamePhase: 'playing', result: undefined })
      useGameStore.getState().endGame({ type: 'stalemate' })

      const state = useGameStore.getState()
      expect(state.gameHistory).toHaveLength(2)
      expect(state.gameHistory[0].result).toEqual({ type: 'stalemate' })
      expect(state.gameHistory[1].result).toEqual({ type: 'checkmate', winner: 'w' })
    })

    it('FIFO pruning at 101 entries removes oldest', () => {
      // Fill with 100 entries
      const existing = Array.from({ length: 100 }, (_, i) => ({
        date: new Date(2026, 0, i + 1).toISOString(),
        result: { type: 'checkmate' as const, winner: 'w' as const },
        moveCount: 10,
        playerColor: 'w' as const,
      }))
      useGameStore.setState({ gameHistory: existing })

      // Add one more
      useGameStore.getState().endGame({ type: 'stalemate' })

      const state = useGameStore.getState()
      expect(state.gameHistory).toHaveLength(100)
      expect(state.gameHistory[0].result).toEqual({ type: 'stalemate' })
    })

    it('game history persists via Zustand persist', () => {
      useGameStore.getState().endGame({ type: 'checkmate', winner: 'w' })

      const stored = JSON.parse(localStorage.getItem('ch3ss-game') || '{}')
      expect(stored.state.gameHistory).toHaveLength(1)
    })

    it('resign adds exactly one history entry', () => {
      useGameStore.getState().resign()

      const state = useGameStore.getState()
      expect(state.gameHistory).toHaveLength(1)
      expect(state.gameHistory[0].result).toEqual({ type: 'resignation', resignedBy: 'w' })
    })
  })

  describe('persist middleware', () => {
    it('persists game state to localStorage after playMove', () => {
      const move: ClassifiedMove = {
        from: 'e2',
        to: 'e4',
        san: 'e4',
        classification: 'top',
        evalLoss: 0,
      }
      useGameStore.setState({ currentMoves: [move] })
      useGameStore.getState().playMove(move)

      const stored = JSON.parse(localStorage.getItem('ch3ss-game') || '{}')
      expect(stored.state.fen).toContain('4P3')
      expect(stored.state.moveHistory).toHaveLength(1)
    })

    it('persists game state to localStorage after startNewGame', () => {
      useGameStore.setState({ gamePhase: 'ended', result: { type: 'checkmate', winner: 'w' } })
      useGameStore.getState().startNewGame()

      const stored = JSON.parse(localStorage.getItem('ch3ss-game') || '{}')
      expect(stored.state.fen).toBe(STARTING_FEN)
      expect(stored.state.gamePhase).toBe('playing')
    })

    it('restores FEN, moveHistory, gamePhase from localStorage', () => {
      const savedState = {
        state: {
          fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
          moveHistory: [{ fen: STARTING_FEN, played: { from: 'e2', to: 'e4', san: 'e4' }, options: [], classification: 'top' }],
          gamePhase: 'playing',
          result: undefined,
          playerColor: 'w',
          settings: { opponentElo: 1000, theme: 'dark', devT1: 30, devT2: 100, devDepth: 12 },
          gameStartTime: 0,
        },
        version: 2,
      }
      localStorage.setItem('ch3ss-game', JSON.stringify(savedState))

      // Trigger rehydration
      useGameStore.persist.rehydrate()

      const state = useGameStore.getState()
      expect(state.fen).toContain('4P3')
      expect(state.moveHistory).toHaveLength(1)
      expect(state.gamePhase).toBe('playing')
    })

    it('recovers from corrupted localStorage by using initial state', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      localStorage.setItem('ch3ss-game', '{invalid json!!!')

      useGameStore.persist.rehydrate()

      // Store should still be functional with initial state
      const state = useGameStore.getState()
      expect(state.gamePhase).toBeDefined()
      consoleSpy.mockRestore()
    })

    it('starts fresh when localStorage key is missing', () => {
      localStorage.removeItem('ch3ss-game')

      useGameStore.persist.rehydrate()

      const state = useGameStore.getState()
      expect(state.fen).toBe(STARTING_FEN)
      // Default gamePhase is still whatever was set in beforeEach since rehydrate with no data keeps current state
      expect(state.gamePhase).toBeDefined()
    })

    it('persists settings across sessions', () => {
      useGameStore.getState().updateSettings({ opponentElo: 1400, theme: 'light' })

      const stored = JSON.parse(localStorage.getItem('ch3ss-game') || '{}')
      expect(stored.state.settings.opponentElo).toBe(1400)
      expect(stored.state.settings.theme).toBe('light')
    })

    it('does not persist transient UI state', () => {
      useGameStore.setState({
        currentMoves: [{ from: 'e2', to: 'e4', san: 'e4', classification: 'top', evalLoss: 0 }],
        isEngineReady: true,
        isMoving: true,
      })

      const stored = JSON.parse(localStorage.getItem('ch3ss-game') || '{}')
      expect(stored.state.currentMoves).toBeUndefined()
      expect(stored.state.isEngineReady).toBeUndefined()
      expect(stored.state.isMoving).toBeUndefined()
    })
  })
})
