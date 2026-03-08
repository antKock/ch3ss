import type { ClassifiedMove } from '../types/chess'
import { classifyMoves, mateScoreToCp, type RawMove } from './move-classifier'
import { createStockfishWorker } from './stockfish.worker'

const TIMEOUT_MS = 5000
const DEFAULT_DEPTH = 12
const MULTI_PV = 5

function getDepth(): number {
  const env = import.meta.env.VITE_STOCKFISH_DEPTH
  return env ? Number(env) : DEFAULT_DEPTH
}

// Singleton worker state
let worker: Worker | null = null
let initPromise: Promise<void> | null = null

type MessageHandler = (line: string) => void
let currentHandler: MessageHandler | null = null

function onWorkerMessage(e: MessageEvent): void {
  const line = typeof e.data === 'string' ? e.data : String(e.data)
  if (currentHandler) {
    currentHandler(line)
  }
}

export function initEngine(): Promise<void> {
  if (initPromise) return initPromise

  initPromise = new Promise<void>((resolve, reject) => {
    try {
      worker = createStockfishWorker()
      worker.onmessage = (e: MessageEvent) => {
        const line = typeof e.data === 'string' ? e.data : String(e.data)

        if (line === 'uciok') {
          if (worker) worker.postMessage('isready')
        } else if (line === 'readyok') {
          // Switch to the general handler
          if (worker) worker.onmessage = onWorkerMessage
          resolve()
        }
      }

      worker.onerror = (err) => {
        initPromise = null
        reject(new Error(`Stockfish init failed: ${err.message}`))
      }

      worker.postMessage('uci')

      // Safety timeout
      setTimeout(() => {
        if (!worker) {
          initPromise = null
          reject(new Error('Stockfish init timeout'))
        }
      }, TIMEOUT_MS)
    } catch (err) {
      initPromise = null
      reject(err)
    }
  })

  return initPromise
}

function sendCommand(cmd: string): void {
  if (!worker) throw new Error('Engine not initialized')
  worker.postMessage(cmd)
}

function collectOutput(
  predicate: (line: string) => boolean,
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const lines: string[] = []
    const timer = setTimeout(() => {
      currentHandler = null
      reject(new StockfishTimeoutError('Engine response timeout'))
    }, TIMEOUT_MS)

    currentHandler = (line: string) => {
      lines.push(line)
      if (predicate(line)) {
        clearTimeout(timer)
        currentHandler = null
        resolve(lines)
      }
    }
  })
}

export class StockfishTimeoutError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StockfishTimeoutError'
  }
}

// Parse UCI info line to extract move data
function parseInfoLine(line: string): {
  multipv?: number
  score?: number
  mate?: number
  pv?: string
} | null {
  if (!line.startsWith('info')) return null
  // Only care about final depth lines (with multipv)
  if (!line.includes('multipv')) return null

  const parts = line.split(' ')
  const result: { multipv?: number; score?: number; mate?: number; pv?: string } = {}

  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === 'multipv') result.multipv = Number(parts[i + 1])
    if (parts[i] === 'cp') result.score = Number(parts[i + 1])
    if (parts[i] === 'mate') result.mate = Number(parts[i + 1])
    if (parts[i] === 'pv') result.pv = parts[i + 1]
  }

  return result
}

// Convert UCI move (e.g. "e2e4") to from/to format
function parseUCIMove(uciMove: string): { from: string; to: string; promotion?: string } {
  const from = uciMove.slice(0, 2)
  const to = uciMove.slice(2, 4)
  const promotion = uciMove.length > 4 ? uciMove.slice(4) : undefined
  return { from, to, promotion }
}

export async function generatePlayerMoves(
  fen: string,
  depth?: number,
): Promise<ClassifiedMove[]> {
  await initEngine()

  const d = depth ?? getDepth()

  // Set up multi-PV analysis
  sendCommand(`setoption name MultiPV value ${MULTI_PV}`)
  sendCommand(`position fen ${fen}`)
  sendCommand(`go depth ${d}`)

  const lines = await collectOutput((line) => line.startsWith('bestmove'))

  // Parse the info lines for the final depth
  const moveData = new Map<number, { score: number; pv: string }>()
  let maxDepth = 0

  for (const line of lines) {
    const info = parseInfoLine(line)
    if (!info || !info.multipv || !info.pv) continue

    const depthMatch = line.match(/depth (\d+)/)
    const lineDepth = depthMatch ? Number(depthMatch[1]) : 0

    if (lineDepth > maxDepth) {
      maxDepth = lineDepth
      moveData.clear()
    }

    if (lineDepth === maxDepth) {
      const score = info.mate != null ? mateScoreToCp(info.mate) : (info.score ?? 0)
      moveData.set(info.multipv, { score, pv: info.pv })
    }
  }

  // Build raw moves sorted by score (best first)
  const rawMoves: RawMove[] = []
  const sortedEntries = [...moveData.entries()].sort((a, b) => b[1].score - a[1].score)

  // We need SAN notation — use a chess.js import dynamically if needed,
  // but for now UCI moves are sufficient (SAN will be derived when playing the move)
  for (const [, data] of sortedEntries) {
    const { from, to, promotion } = parseUCIMove(data.pv)
    rawMoves.push({
      from,
      to,
      san: data.pv, // Will be replaced with proper SAN when move is played
      score: data.score,
      promotion,
    })
  }

  // Reset multi-PV to 1
  sendCommand('setoption name MultiPV value 1')

  return classifyMoves(rawMoves)
}

export async function getAIMove(
  fen: string,
  elo: number,
): Promise<{ from: string; to: string; san: string; promotion?: string }> {
  await initEngine()

  const d = getDepth()

  sendCommand('setoption name UCI_LimitStrength value true')
  sendCommand(`setoption name UCI_Elo value ${elo}`)
  sendCommand(`position fen ${fen}`)
  sendCommand(`go depth ${d}`)

  const lines = await collectOutput((line) => line.startsWith('bestmove'))

  // Extract best move from "bestmove e2e4" line
  const bestmoveLine = lines.find((l) => l.startsWith('bestmove'))
  if (!bestmoveLine) throw new Error('No bestmove received from engine')

  const uciMove = bestmoveLine.split(' ')[1]
  const { from, to, promotion } = parseUCIMove(uciMove)

  // Reset ELO limiting
  sendCommand('setoption name UCI_LimitStrength value false')

  return { from, to, san: uciMove, promotion }
}

export function isEngineInitialized(): boolean {
  return worker !== null && initPromise !== null
}

export function destroyEngine(): void {
  if (worker) {
    worker.terminate()
    worker = null
    initPromise = null
    currentHandler = null
  }
}
