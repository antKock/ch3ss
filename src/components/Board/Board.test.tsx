import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { Board } from './Board'
import { useGameStore } from '../../store/game-store'

describe('Board', () => {
  beforeEach(() => {
    useGameStore.setState({
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    })
  })

  it('renders 64 squares', () => {
    render(<Board />)
    const squares = screen.getAllByRole('gridcell')
    expect(squares).toHaveLength(64)
  })

  it('renders board grid', () => {
    render(<Board />)
    const grid = screen.getByRole('grid')
    expect(grid).toBeInTheDocument()
  })

  it('shows pieces in starting position', () => {
    render(<Board />)
    // White pieces on ranks 1-2
    expect(screen.getByLabelText('e1, white king')).toBeInTheDocument()
    expect(screen.getByLabelText('d1, white queen')).toBeInTheDocument()
    expect(screen.getByLabelText('a1, white rook')).toBeInTheDocument()
    expect(screen.getByLabelText('e2, white pawn')).toBeInTheDocument()

    // Black pieces on ranks 7-8
    expect(screen.getByLabelText('e8, black king')).toBeInTheDocument()
    expect(screen.getByLabelText('d8, black queen')).toBeInTheDocument()
  })

  it('shows empty squares', () => {
    render(<Board />)
    expect(screen.getByLabelText('e4, empty')).toBeInTheDocument()
    expect(screen.getByLabelText('d5, empty')).toBeInTheDocument()
  })

  it('has ARIA labels on all squares', () => {
    render(<Board />)
    const squares = screen.getAllByRole('gridcell')
    for (const square of squares) {
      expect(square).toHaveAttribute('aria-label')
    }
  })

  it('squares are focusable for keyboard navigation', () => {
    render(<Board />)
    const squares = screen.getAllByRole('gridcell')
    for (const square of squares) {
      expect(square).toHaveAttribute('tabIndex', '0')
    }
  })

  it('renders piece images', () => {
    render(<Board />)
    const images = screen.getAllByRole('img')
    // 32 pieces in starting position
    expect(images).toHaveLength(32)
  })

  it('updates when FEN changes', () => {
    render(<Board />)
    // After 1. e4, e2 pawn should be on e4
    act(() => {
      useGameStore.setState({
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
      })
    })

    // Re-render will pick up store change automatically via Zustand
    const { unmount } = render(<Board />)
    expect(screen.getAllByLabelText('e4, white pawn').length).toBeGreaterThan(0)
    unmount()
  })
})
