import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { App } from './App'
import { useGameStore } from './store/game-store'

// Mock the engine service so App doesn't try to load real Stockfish
vi.mock('./engine/stockfish-service', () => ({
  initEngine: vi.fn().mockResolvedValue(undefined),
  generatePlayerMoves: vi.fn().mockResolvedValue([
    { from: 'e2', to: 'e4', san: 'e4', classification: 'top', evalLoss: 0 },
    { from: 'd2', to: 'd4', san: 'd4', classification: 'correct', evalLoss: 50 },
    { from: 'a2', to: 'a3', san: 'a3', classification: 'bof', evalLoss: 150 },
  ]),
  getAIMove: vi.fn().mockResolvedValue({ from: 'e7', to: 'e5', san: 'e5' }),
}))

describe('App', () => {
  beforeEach(() => {
    useGameStore.setState({
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      gamePhase: 'playing',
      moveHistory: [],
      currentMoves: null,
      result: undefined,
      isEngineReady: false,
    })
  })

  it('renders app with header', async () => {
    await act(async () => {
      render(<App />)
    })
    expect(screen.getByText('ch3ss')).toBeInTheDocument()
  })

  it('renders board on mount', async () => {
    await act(async () => {
      render(<App />)
    })
    expect(screen.getByRole('grid')).toBeInTheDocument()
  })

  it('renders 64 squares', async () => {
    await act(async () => {
      render(<App />)
    })
    expect(screen.getAllByRole('gridcell')).toHaveLength(64)
  })

  it('renders resign button during play', async () => {
    await act(async () => {
      render(<App />)
    })
    expect(screen.getByLabelText('Resign game')).toBeInTheDocument()
  })

  it('does not show EndGame overlay during play', async () => {
    await act(async () => {
      render(<App />)
    })
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
