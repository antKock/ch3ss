// Stockfish Web Worker helper
// The actual worker is the stockfish-18-lite-single.js file from the stockfish npm package,
// served from /stockfish/stockfish-18-lite-single.js
// It is a self-contained WASM engine that communicates via postMessage with UCI protocol.
// This file provides the path constant and factory function.

export const STOCKFISH_WORKER_PATH = '/stockfish/stockfish-18-lite-single.js'

export function createStockfishWorker(): Worker {
  return new Worker(STOCKFISH_WORKER_PATH)
}
