import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { RecapScreen } from './RecapScreen'
import { useGameStore } from '../../store/game-store'

describe('RecapScreen', () => {
  beforeEach(() => {
    useGameStore.setState({
      gamePhase: 'ended',
      result: { type: 'checkmate', winner: 'w' },
      playerColor: 'w',
      moveHistory: [
        { fen: '', played: { from: 'e2', to: 'e4', san: 'e4' }, options: [], classification: 'top' },
        { fen: '', played: { from: 'd2', to: 'd4', san: 'd4' }, options: [], classification: 'correct' },
      ],
      gameHistory: [
        {
          date: '2026-03-08T12:00:00.000Z',
          result: { type: 'checkmate', winner: 'w' },
          moveCount: 2,
          playerColor: 'w' as const,
          duration: 120,
          distribution: { top: 50, correct: 50, bof: 0 },
        },
      ],
      showSettings: false,
      showFinalBoard: false,
    })
  })

  it('renders nothing when game is not ended', () => {
    useGameStore.setState({ gamePhase: 'playing' })
    const { container } = render(<RecapScreen />)
    expect(container.firstChild).toBeNull()
  })

  it('shows "Victoire" on checkmate win', () => {
    render(<RecapScreen />)
    expect(screen.getByText('Victoire')).toBeInTheDocument()
  })

  it('shows "Défaite" on checkmate loss', () => {
    useGameStore.setState({ result: { type: 'checkmate', winner: 'b' } })
    render(<RecapScreen />)
    expect(screen.getByText('Défaite')).toBeInTheDocument()
  })

  it('shows "Égalité" on stalemate', () => {
    useGameStore.setState({ result: { type: 'stalemate' } })
    render(<RecapScreen />)
    expect(screen.getByText('Égalité')).toBeInTheDocument()
  })

  it('shows "Défaite" on resignation', () => {
    useGameStore.setState({ result: { type: 'resignation', resignedBy: 'w' } })
    render(<RecapScreen />)
    expect(screen.getByText('Défaite')).toBeInTheDocument()
  })

  it('shows move count and duration', () => {
    render(<RecapScreen />)
    expect(screen.getByText(/2 coups/)).toBeInTheDocument()
    expect(screen.getByText(/2min 0s/)).toBeInTheDocument()
  })

  it('shows distribution bars', () => {
    render(<RecapScreen />)
    expect(screen.getByText('Top')).toBeInTheDocument()
    expect(screen.getByText('Correct')).toBeInTheDocument()
    expect(screen.getByText('Bof')).toBeInTheDocument()
    expect(screen.getAllByText('50%').length).toBeGreaterThanOrEqual(1)
  })

  it('shows "Rejouer" button', () => {
    render(<RecapScreen />)
    expect(screen.getByText('Rejouer')).toBeInTheDocument()
  })

  it('starts new game on "Rejouer" click', () => {
    render(<RecapScreen />)
    fireEvent.click(screen.getByText('Rejouer'))
    expect(useGameStore.getState().gamePhase).toBe('playing')
  })

  it('shows secondary links: Accueil and Voir le plateau', () => {
    render(<RecapScreen />)
    expect(screen.getByText('Accueil')).toBeInTheDocument()
    expect(screen.getByText('Voir le plateau')).toBeInTheDocument()
  })

  it('navigates to home on "Accueil" click', () => {
    render(<RecapScreen />)
    fireEvent.click(screen.getByText('Accueil'))
    expect(useGameStore.getState().gamePhase).toBe('home')
  })

  it('shows final board on "Voir le plateau" click', () => {
    render(<RecapScreen />)
    fireEvent.click(screen.getByText('Voir le plateau'))
    expect(useGameStore.getState().showFinalBoard).toBe(true)
  })

  it('renders gear icon for settings', () => {
    render(<RecapScreen />)
    expect(screen.getByLabelText('Réglages')).toBeInTheDocument()
  })

  it('has accessible region role', () => {
    render(<RecapScreen />)
    expect(screen.getByRole('region')).toBeInTheDocument()
  })
})
