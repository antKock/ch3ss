import { describe, it, expect, beforeEach } from 'vitest'
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
      isEngineReady: false,
      pendingPromotion: null,
      isMoving: false,
      settings: { opponentElo: 1000, theme: 'dark' },
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
})
