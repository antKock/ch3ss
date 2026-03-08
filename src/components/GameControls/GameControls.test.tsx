import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { GameControls } from './GameControls'
import { useGameStore } from '../../store/game-store'

describe('GameControls', () => {
  beforeEach(() => {
    useGameStore.setState({
      gamePhase: 'playing',
      result: undefined,
      playerColor: 'w',
    })
  })

  it('renders abandon button during play', () => {
    render(<GameControls />)
    expect(screen.getByLabelText('Abandonner la partie')).toBeInTheDocument()
  })

  it('hides controls when game is ended', () => {
    useGameStore.setState({ gamePhase: 'ended' })
    const { container } = render(<GameControls />)
    expect(container.firstChild).toBeNull()
  })

  it('shows resign toast with cooldown when abandon is tapped', () => {
    render(<GameControls />)
    fireEvent.click(screen.getByLabelText('Abandonner la partie'))

    // Toast should appear
    expect(screen.getByText('Partie abandonnée')).toBeInTheDocument()
    expect(screen.getByLabelText("Annuler l'abandon")).toBeInTheDocument()
  })
})
