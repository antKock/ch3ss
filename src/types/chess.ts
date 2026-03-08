export interface ClassifiedMove {
  from: string
  to: string
  san: string
  classification: 'top' | 'correct' | 'bof'
  evalLoss: number // centipawns
  promotion?: string
}

export interface MoveRecord {
  fen: string // Position before move
  played: { from: string; to: string; san: string; promotion?: string }
  options: ClassifiedMove[] // The 3 options presented
  classification: 'top' | 'correct' | 'bof' // What the player picked
}

export type GameResult =
  | { type: 'checkmate'; winner: 'w' | 'b' }
  | { type: 'stalemate' }
  | { type: 'resignation'; resignedBy: 'w' | 'b' }

export interface GameState {
  fen: string
  moveHistory: MoveRecord[]
  gamePhase: 'home' | 'playing' | 'ended'
  result?: GameResult
  playerColor: 'w' | 'b'
}

export interface Settings {
  opponentElo: number // 800-1600, default 1000
  theme: 'dark' | 'light' // default 'dark'
  devT1: number // Top→Correct threshold cp, default 30
  devT2: number // Correct→Bof threshold cp, default 100
  devDepth: number // Stockfish depth, default 12
}

export interface CompletedGame {
  date: string // ISO date
  result: GameResult
  moveCount: number
  playerColor: 'w' | 'b'
  duration?: number // seconds
  distribution?: { top: number; correct: number; bof: number }
}
