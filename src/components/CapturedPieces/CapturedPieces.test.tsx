import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { CapturedPieces } from './CapturedPieces'
import { useGameStore } from '../../store/game-store'

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

describe('CapturedPieces', () => {
  beforeEach(() => {
    useGameStore.setState({
      fen: STARTING_FEN,
      playerColor: 'w',
      settings: { opponentElo: 1000, theme: 'dark', devT1: 30, devT2: 100, devDepth: 12 },
    })
  })

  it('renders nothing when no pieces are captured (starting position)', () => {
    const { container } = render(<CapturedPieces position="top" />)
    // The row should be empty (CapturedPiecesRow returns null for empty pieces)
    expect(container.querySelector('img')).toBeNull()
  })

  it('shows captured pieces when pieces are missing from the board', () => {
    // FEN where black queen is missing (captured by white)
    useGameStore.setState({
      fen: 'rnb1kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    })
    const { container } = render(<CapturedPieces position="top" />)
    // Top = adversary pieces captured by player. Black queen is missing.
    const images = container.querySelectorAll('img')
    expect(images.length).toBe(1)
  })

  it('sorts captured pieces by value descending', () => {
    // FEN where black has lost queen and a pawn
    useGameStore.setState({
      fen: 'rnb1kbnr/ppppppp1/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    })
    const { container } = render(<CapturedPieces position="top" />)
    const images = container.querySelectorAll('img')
    expect(images.length).toBe(2)
    // Queen should come first (higher value)
    expect(images[0].alt).toContain('q')
    expect(images[1].alt).toContain('p')
  })

  it('applies dark mode brightness filter to black pieces', () => {
    useGameStore.setState({
      fen: 'rnb1kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    })
    const { container } = render(<CapturedPieces position="top" />)
    const img = container.querySelector('img')
    expect(img?.style.filter).toContain('brightness(1.6)')
  })

  it('has accessible label on captured pieces row', () => {
    useGameStore.setState({
      fen: 'rnb1kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    })
    render(<CapturedPieces position="top" />)
    expect(screen.getByLabelText(/Captured/)).toBeInTheDocument()
  })
})
