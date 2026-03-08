import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { HomeScreen } from './HomeScreen'
import { useGameStore } from '../../store/game-store'

describe('HomeScreen', () => {
  beforeEach(() => {
    useGameStore.setState({
      gamePhase: 'home',
      gameHistory: [],
      showSettings: false,
    })
  })

  it('renders logo with accent "3"', () => {
    render(<HomeScreen />)
    const heading = screen.getByRole('heading')
    expect(heading.textContent).toContain('ch')
    expect(heading.textContent).toContain('3')
    expect(heading.textContent).toContain('ss')
  })

  it('renders tagline', () => {
    render(<HomeScreen />)
    expect(screen.getByText('3 options, ton choix')).toBeInTheDocument()
  })

  it('renders "Jouer" button', () => {
    render(<HomeScreen />)
    expect(screen.getByText('Jouer')).toBeInTheDocument()
  })

  it('shows "Première partie !" when no games played', () => {
    render(<HomeScreen />)
    expect(screen.getByText('Première partie !')).toBeInTheDocument()
  })

  it('shows game count when games have been played', () => {
    useGameStore.setState({
      gameHistory: [
        { date: '2026-01-01', result: { type: 'checkmate', winner: 'w' }, moveCount: 10, playerColor: 'w' as const },
      ],
    })
    render(<HomeScreen />)
    expect(screen.getByText('1 parties jouées')).toBeInTheDocument()
  })

  it('starts new game when "Jouer" is clicked', () => {
    render(<HomeScreen />)
    fireEvent.click(screen.getByText('Jouer'))
    expect(useGameStore.getState().gamePhase).toBe('playing')
  })

  it('renders gear icon for settings', () => {
    render(<HomeScreen />)
    expect(screen.getByLabelText('Réglages')).toBeInTheDocument()
  })

  it('opens settings when gear is clicked', () => {
    render(<HomeScreen />)
    fireEvent.click(screen.getByLabelText('Réglages'))
    expect(useGameStore.getState().showSettings).toBe(true)
  })

  it('renders mini board', () => {
    render(<HomeScreen />)
    const miniBoard = screen.getByRole('heading').closest('div')?.parentElement
    expect(miniBoard).toBeInTheDocument()
  })
})
