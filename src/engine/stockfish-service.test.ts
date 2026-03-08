import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { initEngine, generatePlayerMoves, getAIMove, destroyEngine, StockfishTimeoutError } from './stockfish-service'

// Mock the worker
class MockWorker {
  onmessage: ((e: MessageEvent) => void) | null = null
  onerror: ((e: ErrorEvent) => void) | null = null
  private messageQueue: string[] = []

  postMessage(msg: string): void {
    this.messageQueue.push(msg)

    // Simulate UCI protocol responses
    if (msg === 'uci') {
      setTimeout(() => this.respond('uciok'), 5)
    } else if (msg === 'isready') {
      setTimeout(() => this.respond('readyok'), 5)
    } else if (msg.startsWith('go depth')) {
      setTimeout(() => {
        // Simulate multi-PV output
        this.respond('info depth 12 multipv 1 score cp 50 pv e2e4')
        this.respond('info depth 12 multipv 2 score cp 30 pv d2d4')
        this.respond('info depth 12 multipv 3 score cp -20 pv c2c4')
        this.respond('info depth 12 multipv 4 score cp -60 pv g1f3')
        this.respond('info depth 12 multipv 5 score cp -150 pv a2a3')
        this.respond('bestmove e2e4 ponder d7d5')
      }, 10)
    }
  }

  private respond(line: string): void {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data: line }))
    }
  }

  terminate(): void {}
}

// Mock the worker factory
vi.mock('./stockfish.worker', () => ({
  createStockfishWorker: () => new MockWorker(),
  STOCKFISH_WORKER_PATH: '/stockfish/stockfish-18-lite-single.js',
}))

describe('stockfish-service', () => {
  beforeEach(() => {
    destroyEngine()
  })

  afterEach(() => {
    destroyEngine()
  })

  it('initializes the engine successfully', async () => {
    await expect(initEngine()).resolves.toBeUndefined()
  })

  it('generates player moves returning classified moves', async () => {
    const moves = await generatePlayerMoves(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      12,
    )

    expect(moves.length).toBeGreaterThan(0)
    expect(moves.length).toBeLessThanOrEqual(3)

    for (const move of moves) {
      expect(move).toHaveProperty('from')
      expect(move).toHaveProperty('to')
      expect(move).toHaveProperty('san')
      expect(move).toHaveProperty('classification')
      expect(move).toHaveProperty('evalLoss')
      expect(['top', 'correct', 'bof']).toContain(move.classification)
    }
  })

  it('gets AI move successfully', async () => {
    const move = await getAIMove(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      1000,
    )

    expect(move).toHaveProperty('from')
    expect(move).toHaveProperty('to')
    expect(move.from).toHaveLength(2)
    expect(move.to).toHaveLength(2)
  })

  it('reuses the same worker instance (singleton)', async () => {
    const firstInit = initEngine()
    const secondInit = initEngine()

    // Both should return the same promise (singleton)
    expect(firstInit).toBe(secondInit)

    await firstInit
  })
})

describe('StockfishTimeoutError', () => {
  it('creates error with correct name', () => {
    const err = new StockfishTimeoutError('test timeout')
    expect(err.name).toBe('StockfishTimeoutError')
    expect(err.message).toBe('test timeout')
    expect(err).toBeInstanceOf(Error)
  })
})
