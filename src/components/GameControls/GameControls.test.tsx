import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { GameControls } from './GameControls'
import { useGameStore } from '../../store/game-store'

describe('GameControls', () => {
  beforeEach(() => {
    useGameStore.setState({
      gamePhase: 'playing',
      result: undefined,
    })
  })

  it('renders resign button during play', () => {
    render(<GameControls />)
    expect(screen.getByLabelText('Resign game')).toBeInTheDocument()
  })

  it('hides controls when game is ended', () => {
    useGameStore.setState({ gamePhase: 'ended' })
    const { container } = render(<GameControls />)
    expect(container.firstChild).toBeNull()
  })

  it('resign button triggers endGame with resignation', () => {
    render(<GameControls />)
    fireEvent.click(screen.getByLabelText('Resign game'))

    const state = useGameStore.getState()
    expect(state.gamePhase).toBe('ended')
    expect(state.result).toEqual({ type: 'resignation', resignedBy: 'w' })
  })
})
