import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { Header } from './Header'
import { useGameStore } from '../../store/game-store'

describe('Header', () => {
  beforeEach(() => {
    useGameStore.setState({ gamePhase: 'playing', showSettings: false })
  })

  it('renders app title during gameplay', () => {
    render(<Header />)
    expect(screen.getByText(/ch/)).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('does not render gear icon during gameplay (Story 4.8)', () => {
    render(<Header />)
    expect(screen.queryByLabelText('Réglages')).not.toBeInTheDocument()
  })

  it('does not render on home screen', () => {
    useGameStore.setState({ gamePhase: 'home' })
    const { container } = render(<Header />)
    expect(container.firstChild).toBeNull()
  })
})
