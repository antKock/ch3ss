import type { ClassifiedMove } from '../types/chess'

const DEFAULT_T1 = 30
const DEFAULT_T2 = 100

function getThresholdT1(): number {
  const env = import.meta.env.VITE_THRESHOLD_T1
  return env ? Number(env) : DEFAULT_T1
}

function getThresholdT2(): number {
  const env = import.meta.env.VITE_THRESHOLD_T2
  return env ? Number(env) : DEFAULT_T2
}

export interface RawMove {
  from: string
  to: string
  san: string
  score: number // centipawns (from engine perspective)
  promotion?: string
}

export function classifyMoves(moves: RawMove[]): ClassifiedMove[] {
  if (moves.length === 0) return []

  const T1 = getThresholdT1()
  const T2 = getThresholdT2()

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

function selectThreeMoves(classified: ClassifiedMove[]): ClassifiedMove[] {
  const topMoves = classified.filter((m) => m.classification === 'top')
  const correctMoves = classified.filter((m) => m.classification === 'correct')
  const bofMoves = classified.filter((m) => m.classification === 'bof')

  const selected: ClassifiedMove[] = []

  // Pick one from each tier
  if (topMoves.length > 0) selected.push(topMoves[0])
  if (correctMoves.length > 0) selected.push(correctMoves[0])
  if (bofMoves.length > 0) selected.push(bofMoves[0])

  // If we have 3, done
  if (selected.length >= 3) return selected.slice(0, 3)

  // Fill remaining slots, but force tier diversity by reclassifying
  const remaining = classified.filter((m) => !selected.includes(m))
  while (selected.length < 3 && remaining.length > 0) {
    const move = remaining.shift()!
    const missingTiers = (['top', 'correct', 'bof'] as const).filter(
      (tier) => !selected.some((s) => s.classification === tier),
    )
    if (missingTiers.length > 0) {
      // Reclassify to fill a missing tier
      selected.push({ ...move, classification: missingTiers[0] })
    } else {
      selected.push(move)
    }
  }

  // If fewer than 3 legal moves available, return what we have
  return selected
}

// Convert mate scores to centipawn equivalent
export function mateScoreToCp(mateIn: number): number {
  // Positive mateIn = winning, negative = losing
  // Use large values that preserve ordering
  return mateIn > 0 ? 30000 - mateIn * 100 : -30000 - mateIn * 100
}
