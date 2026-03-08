import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { Settings } from './Settings'
import { useGameStore } from '../../store/game-store'

describe('Settings', () => {
  beforeEach(() => {
    useGameStore.setState({
      showSettings: false,
      settings: { opponentElo: 1000, theme: 'dark' },
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
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('closes when backdrop is clicked', () => {
    useGameStore.setState({ showSettings: true })
    const { container } = render(<Settings />)
    // Click the outer fixed div (backdrop container)
    fireEvent.click(container.firstChild as Element)
    expect(useGameStore.getState().showSettings).toBe(false)
  })

  it('closes when close button is clicked', () => {
    useGameStore.setState({ showSettings: true })
    render(<Settings />)
    fireEvent.click(screen.getByLabelText('Close settings'))
    expect(useGameStore.getState().showSettings).toBe(false)
  })

  it('closes when Escape key is pressed', () => {
    useGameStore.setState({ showSettings: true })
    render(<Settings />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(useGameStore.getState().showSettings).toBe(false)
  })

  it('traps focus within drawer when open', () => {
    useGameStore.setState({ showSettings: true })
    render(<Settings />)
    const dialog = screen.getByRole('dialog')
    const focusable = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0] as HTMLElement
    const last = focusable[focusable.length - 1] as HTMLElement

    // Focus should start on first element
    expect(document.activeElement).toBe(first)

    // Tab from last element should wrap to first
    last.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(first)

    // Shift+Tab from first element should wrap to last
    first.focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last)
  })

  it('updates ELO slider value in store', () => {
    useGameStore.setState({ showSettings: true })
    render(<Settings />)
    const slider = screen.getByLabelText('AI difficulty ELO')
    fireEvent.change(slider, { target: { value: '1400' } })
    expect(useGameStore.getState().settings.opponentElo).toBe(1400)
  })

  it('toggles theme in store', () => {
    useGameStore.setState({ showSettings: true })
    render(<Settings />)
    const toggle = screen.getByLabelText('Toggle theme')
    fireEvent.click(toggle)
    expect(useGameStore.getState().settings.theme).toBe('light')
  })

  it('settings persist after drawer close via Zustand persist', () => {
    useGameStore.setState({ showSettings: true })
    render(<Settings />)
    // Change ELO
    fireEvent.change(screen.getByLabelText('AI difficulty ELO'), { target: { value: '1200' } })
    // Close drawer
    fireEvent.click(screen.getByLabelText('Close settings'))

    const stored = JSON.parse(localStorage.getItem('ch3ss-game') || '{}')
    expect(stored.state.settings.opponentElo).toBe(1200)
  })

  it('shows empty state message when no history', () => {
    useGameStore.setState({ showSettings: true, gameHistory: [] })
    render(<Settings />)
    expect(screen.getByText('No games played yet')).toBeInTheDocument()
  })

  it('renders history list with correct data', () => {
    useGameStore.setState({
      showSettings: true,
      gameHistory: [
        {
          date: '2026-03-08T12:00:00.000Z',
          result: { type: 'checkmate', winner: 'w' },
          moveCount: 25,
          playerColor: 'w',
        },
        {
          date: '2026-03-07T10:00:00.000Z',
          result: { type: 'stalemate' },
          moveCount: 40,
          playerColor: 'w',
        },
      ],
    })
    render(<Settings />)

    expect(screen.getByText('Victory')).toBeInTheDocument()
    expect(screen.getByText('25 moves')).toBeInTheDocument()
    expect(screen.getByText('Draw')).toBeInTheDocument()
    expect(screen.getByText('40 moves')).toBeInTheDocument()
  })
})
