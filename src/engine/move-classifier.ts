import type { ClassifiedMove } from '../types/chess'

export interface RawMove {
  from: string
  to: string
  san: string
  score: number // centipawns (from engine perspective)
  promotion?: string
}

/**
 * Dynamic thresholds for move classification based on opponent Elo.
 *
 * ACPL model: acpl = 600 * exp(-0.0012 * elo)
 * Fitted to empirical ACPL-by-Elo data (Lichess/FIDE aggregates):
 *   Elo  800 → ~230cp    Elo 1600 → ~88cp
 *   Elo 1000 → ~181cp    Elo 1800 → ~69cp
 *   Elo 1200 → ~142cp    Elo 2000 → ~54cp
 *
 * Coefficients k1=0.3 and k2=1.4 were calibrated via Monte Carlo
 * simulation (5000 games/config, 30 moves/side, log-normal eval
 * loss distribution, Elo expected score model). Optimized for:
 *   - Good player (60% top, 30% correct, 10% bof) → ~88% winrate
 *   - Average player (50/30/20) → ~60% winrate
 *   - Random picks (33/34/33) → ~23% winrate
 *   - Each bof pick costs ~3-4% winrate
 *
 * To recalibrate: adjust k1 (tightens/loosens top tier) and k2
 * (controls how punishing the bof tier is). Lower k2 = subtler
 * bof (more positional), higher k2 = harsher bof (more tactical).
 */
export function getThresholds(opponentElo: number): { T1: number; T2: number } {
  const acpl = 600 * Math.exp(-0.0012 * opponentElo)
  const T1 = Math.round(acpl * 0.3)
  const T2 = Math.round(acpl * 1.4)
  return { T1, T2 }
}

export function classifyMoves(moves: RawMove[], opponentElo: number): ClassifiedMove[] {
  if (moves.length === 0) return []

  const { T1, T2 } = getThresholds(opponentElo)

  // Best move score is the reference point
  const bestScore = moves[0].score

  // Classify each move by eval loss
  const classified = moves.map((move) => {
    const evalLoss = bestScore - move.score
    let classification: 'top' | 'correct' | 'bof'

    if (evalLoss <= T1) {
      classification = 'top'
    } else if (evalLoss <= T2) {
      classification = 'correct'
    } else {
      classification = 'bof'
    }

    return {
      from: move.from,
      to: move.to,
      san: move.san,
      classification,
      evalLoss,
      promotion: move.promotion,
    }
  })

  // Pick one move from each tier, with fallback
  return selectThreeMoves(classified)
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function selectThreeMoves(classified: ClassifiedMove[]): ClassifiedMove[] {
  const topMoves = classified.filter((m) => m.classification === 'top')
  const correctMoves = classified.filter((m) => m.classification === 'correct')
  const bofMoves = classified.filter((m) => m.classification === 'bof')

  // Normal case: all 3 tiers populated → pick 1 random per tier
  if (topMoves.length > 0 && correctMoves.length > 0 && bofMoves.length > 0) {
    return [pickRandom(topMoves), pickRandom(correctMoves), pickRandom(bofMoves)]
  }

  // Relative fallback: redistribute into tiers based on actual eval spread
  // In calm positions where all moves cluster in one tier, this guarantees
  // 3 visually distinct choices while being honest about the low stakes.
  const sorted = [...classified].sort((a, b) => a.evalLoss - b.evalLoss)
  const third = Math.ceil(sorted.length / 3)

  const relTop = sorted.slice(0, third)
  const relCorrect = sorted.slice(third, third * 2)
  const relBof = sorted.slice(third * 2)

  const selected: ClassifiedMove[] = []
  if (relTop.length > 0) selected.push(pickRandom(relTop))
  if (relCorrect.length > 0) selected.push(pickRandom(relCorrect))
  if (relBof.length > 0) selected.push(pickRandom(relBof))

  // Backfill if fewer than 3 legal moves available
  const remaining = classified.filter((m) => !selected.includes(m))
  while (selected.length < 3 && remaining.length > 0) {
    selected.push(remaining.shift()!)
  }

  return selected.slice(0, 3)
}

// Convert mate scores to centipawn equivalent
export function mateScoreToCp(mateIn: number): number {
  // Positive mateIn = winning, negative = losing
  // Use large values that preserve ordering
  return mateIn > 0 ? 30000 - mateIn * 100 : -30000 - mateIn * 100
}
