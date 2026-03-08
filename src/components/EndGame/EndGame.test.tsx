import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { EndGame } from './EndGame'
import { useGameStore } from '../../store/game-store'

describe('EndGame', () => {
  beforeEach(() => {
    useGameStore.setState({
      gamePhase: 'playing',
      result: undefined,
      moveHistory: [],
    })
  })

  it('renders nothing when game is playing', () => {
    const { container } = render(<EndGame />)
    expect(container.firstChild).toBeNull()
  })

  it('shows Victory on player checkmate win', () => {
    useGameStore.setState({
      gamePhase: 'ended',
      result: { type: 'checkmate', winner: 'w' },
      playerColor: 'w',
    })
    render(<EndGame />)
    expect(screen.getByText('Victory')).toBeInTheDocument()
    expect(screen.getByText('Checkmate')).toBeInTheDocument()
  })

  it('shows Defeat on player checkmate loss', () => {
    useGameStore.setState({
      gamePhase: 'ended',
      result: { type: 'checkmate', winner: 'b' },
      playerColor: 'w',
    })
    render(<EndGame />)
    expect(screen.getByText('Defeat')).toBeInTheDocument()
  })

  it('shows Draw on stalemate', () => {
    useGameStore.setState({
      gamePhase: 'ended',
      result: { type: 'stalemate' },
    })
    render(<EndGame />)
    expect(screen.getByText('Draw')).toBeInTheDocument()
    expect(screen.getByText('Stalemate')).toBeInTheDocument()
  })

  it('shows Resigned on resignation', () => {
    useGameStore.setState({
      gamePhase: 'ended',
      result: { type: 'resignation', resignedBy: 'w' },
    })
    render(<EndGame />)
    expect(screen.getByText('Resigned')).toBeInTheDocument()
  })

  it('has ARIA dialog attributes', () => {
    useGameStore.setState({
      gamePhase: 'ended',
      result: { type: 'checkmate', winner: 'w' },
    })
    render(<EndGame />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('shows New Game button', () => {
    useGameStore.setState({
      gamePhase: 'ended',
      result: { type: 'checkmate', winner: 'w' },
    })
    render(<EndGame />)
    expect(screen.getByLabelText('Start new game')).toBeInTheDocument()
  })

  it('shows move count', () => {
    useGameStore.setState({
      gamePhase: 'ended',
      result: { type: 'checkmate', winner: 'w' },
      moveHistory: [
        { fen: '', played: { from: 'e2', to: 'e4', san: 'e4' }, options: [], classification: 'top' },
        { fen: '', played: { from: 'd2', to: 'd4', san: 'd4' }, options: [], classification: 'correct' },
      ],
    })
    render(<EndGame />)
    expect(screen.getByText('2 moves played')).toBeInTheDocument()
  })
})
