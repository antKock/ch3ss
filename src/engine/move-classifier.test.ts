import { describe, it, expect } from 'vitest'
import { classifyMoves, mateScoreToCp, type RawMove } from './move-classifier'

describe('classifyMoves', () => {
  it('classifies moves into top/correct/bof tiers', () => {
    const moves: RawMove[] = [
      { from: 'e2', to: 'e4', san: 'e4', score: 50 },
      { from: 'd2', to: 'd4', san: 'd4', score: 30 },
      { from: 'a2', to: 'a3', san: 'a3', score: -20 },
      { from: 'h2', to: 'h3', san: 'h3', score: -80 },
      { from: 'a2', to: 'a4', san: 'a4', score: -200 },
    ]

    const classified = classifyMoves(moves, 1200)

    expect(classified).toHaveLength(3)
    // At Elo 1200: T1=43, T2=199
    // evalLoss: 0, 20, 70, 130, 250 → top(0,20), correct(70,130), bof(250)
    expect(classified[0].classification).toBe('top')
    expect(classified[1].classification).toBe('correct')
    expect(classified[2].classification).toBe('bof')
  })

  it('returns exactly 3 moves when all tiers present', () => {
    const moves: RawMove[] = [
      { from: 'e2', to: 'e4', san: 'e4', score: 100 },
      { from: 'd2', to: 'd4', san: 'd4', score: 60 },
      { from: 'a2', to: 'a3', san: 'a3', score: -10 },
    ]

    const classified = classifyMoves(moves, 1200)
    expect(classified).toHaveLength(3)
  })

  it('handles fewer than 3 distinct tiers by filling from remaining moves', () => {
    // All moves are "top" tier (evalLoss <= 30)
    const moves: RawMove[] = [
      { from: 'e2', to: 'e4', san: 'e4', score: 50 },
      { from: 'd2', to: 'd4', san: 'd4', score: 45 },
      { from: 'c2', to: 'c4', san: 'c4', score: 40 },
    ]

    const classified = classifyMoves(moves, 1200)
    expect(classified).toHaveLength(3)
  })

  it('handles fewer than 3 legal moves', () => {
    const moves: RawMove[] = [
      { from: 'e1', to: 'f1', san: 'Kf1', score: -500 },
      { from: 'e1', to: 'g1', san: 'Kg1', score: -600 },
    ]

    const classified = classifyMoves(moves, 1200)
    expect(classified).toHaveLength(2)
  })

  it('handles empty moves array', () => {
    const classified = classifyMoves([], 1200)
    expect(classified).toHaveLength(0)
  })

  it('computes evalLoss correctly', () => {
    const moves: RawMove[] = [
      { from: 'e2', to: 'e4', san: 'e4', score: 100 },
      { from: 'd2', to: 'd4', san: 'd4', score: 50 },
    ]

    const classified = classifyMoves(moves, 1200)
    expect(classified[0].evalLoss).toBe(0) // best move
    expect(classified[1].evalLoss).toBe(50) // 100 - 50
  })

  it('preserves from/to/san/promotion fields', () => {
    const moves: RawMove[] = [
      { from: 'a7', to: 'a8', san: 'a8=Q', score: 900, promotion: 'q' },
      { from: 'b2', to: 'b3', san: 'b3', score: 50 },
      { from: 'c2', to: 'c3', san: 'c3', score: -100 },
    ]

    const classified = classifyMoves(moves, 1200)
    const promoMove = classified.find((m) => m.promotion === 'q')
    expect(promoMove).toBeDefined()
    expect(promoMove!.from).toBe('a7')
    expect(promoMove!.to).toBe('a8')
  })
})

describe('mateScoreToCp', () => {
  it('converts positive mate to large positive value', () => {
    const cp = mateScoreToCp(3)
    expect(cp).toBe(29700) // 30000 - 3*100
  })

  it('converts negative mate to large negative value', () => {
    const cp = mateScoreToCp(-3)
    expect(cp).toBe(-29700) // -30000 - (-3)*100
  })

  it('mate in 1 scores higher than mate in 5', () => {
    expect(mateScoreToCp(1)).toBeGreaterThan(mateScoreToCp(5))
  })
})
