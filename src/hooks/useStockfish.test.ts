import { describe, it, expect, vi } from 'vitest'

// Mock the engine service
vi.mock('../engine/stockfish-service', () => ({
  initEngine: vi.fn().mockResolvedValue(undefined),
  generatePlayerMoves: vi.fn().mockResolvedValue([
    { from: 'e2', to: 'e4', san: 'e4', classification: 'top', evalLoss: 0 },
    { from: 'd2', to: 'd4', san: 'd4', classification: 'correct', evalLoss: 50 },
    { from: 'a2', to: 'a3', san: 'a3', classification: 'bof', evalLoss: 150 },
  ]),
  getAIMove: vi.fn().mockResolvedValue({ from: 'e7', to: 'e5', san: 'e7e5' }),
}))

describe('useStockfish', () => {
  it('module can be imported', async () => {
    const mod = await import('./useStockfish')
    expect(mod.useStockfish).toBeDefined()
    expect(typeof mod.useStockfish).toBe('function')
  })

  it('engine service mock works correctly', async () => {
    const { initEngine, generatePlayerMoves, getAIMove } = await import('../engine/stockfish-service')

    await expect(initEngine()).resolves.toBeUndefined()

    const moves = await generatePlayerMoves('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    expect(moves).toHaveLength(3)

    const aiMove = await getAIMove('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', 1000)
    expect(aiMove.from).toBe('e7')
    expect(aiMove.to).toBe('e5')
  })
})
