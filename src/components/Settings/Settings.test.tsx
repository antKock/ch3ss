import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { Settings } from './Settings'
import { useGameStore } from '../../store/game-store'

describe('Settings', () => {
  beforeEach(() => {
    useGameStore.setState({
      showSettings: false,
      settings: { opponentElo: 1000, theme: 'dark', devT1: 30, devT2: 100, devDepth: 12 },
      gameHistory: [],
    })
    document.documentElement.classList.remove('light')
  })

  it('does not render when showSettings is false', () => {
    render(<Settings />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders when showSettings is true', () => {
    useGameStore.setState({ showSettings: true })
    render(<Settings />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Réglages')).toBeInTheDocument()
  })

  it('closes when back arrow is clicked', () => {
    useGameStore.setState({ showSettings: true })
    render(<Settings />)
    fireEvent.click(screen.getByLabelText('Retour'))
    expect(useGameStore.getState().showSettings).toBe(false)
  })

  it('closes when Escape key is pressed', () => {
    useGameStore.setState({ showSettings: true })
    render(<Settings />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(useGameStore.getState().showSettings).toBe(false)
  })

  it('shows segmented theme toggle with Clair/Sombre', () => {
    useGameStore.setState({ showSettings: true })
    render(<Settings />)
    expect(screen.getByText('Clair')).toBeInTheDocument()
    expect(screen.getByText('Sombre')).toBeInTheDocument()
  })

  it('toggles theme via segmented control', () => {
    useGameStore.setState({ showSettings: true })
    render(<Settings />)
    fireEvent.click(screen.getByText('Clair'))
    expect(useGameStore.getState().settings.theme).toBe('light')
  })

  it('shows ELO preset buttons', () => {
    useGameStore.setState({ showSettings: true })
    render(<Settings />)
    expect(screen.getByText('800')).toBeInTheDocument()
    expect(screen.getByText('1000')).toBeInTheDocument()
    expect(screen.getByText('1200')).toBeInTheDocument()
    expect(screen.getByText('1400')).toBeInTheDocument()
    expect(screen.getByText('1600')).toBeInTheDocument()
  })

  it('updates ELO via preset buttons', () => {
    useGameStore.setState({ showSettings: true })
    render(<Settings />)
    fireEvent.click(screen.getByText('1400'))
    expect(useGameStore.getState().settings.opponentElo).toBe(1400)
  })

  it('shows dev controls with DEV badge', () => {
    useGameStore.setState({ showSettings: true })
    render(<Settings />)
    const devBadges = screen.getAllByText('DEV')
    expect(devBadges.length).toBeGreaterThanOrEqual(2)
  })

  it('shows empty state message when no history', () => {
    useGameStore.setState({ showSettings: true, gameHistory: [] })
    render(<Settings />)
    expect(screen.getByText('Aucune partie jouée')).toBeInTheDocument()
  })

  it('renders history list with correct data', () => {
    useGameStore.setState({
      showSettings: true,
      gameHistory: [
        {
          date: '2026-03-08T12:00:00.000Z',
          result: { type: 'checkmate', winner: 'w' },
          moveCount: 25,
          playerColor: 'w' as const,
          distribution: { top: 50, correct: 30, bof: 20 },
        },
        {
          date: '2026-03-07T10:00:00.000Z',
          result: { type: 'stalemate' },
          moveCount: 40,
          playerColor: 'w' as const,
          distribution: { top: 30, correct: 40, bof: 30 },
        },
      ],
    })
    render(<Settings />)

    expect(screen.getByText('25 coups')).toBeInTheDocument()
    expect(screen.getByText('40 coups')).toBeInTheDocument()
    expect(screen.getByText(/Top 50%/)).toBeInTheDocument()
  })
})
