import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { Header } from './Header'
import { useGameStore } from '../../store/game-store'

describe('Header', () => {
  beforeEach(() => {
    useGameStore.setState({ showSettings: false })
  })

  it('renders app title', () => {
    render(<Header />)
    expect(screen.getByText('ch3ss')).toBeInTheDocument()
  })

  it('renders settings button', () => {
    render(<Header />)
    expect(screen.getByLabelText('Settings')).toBeInTheDocument()
  })

  it('opens Settings drawer when gear icon is clicked', () => {
    render(<Header />)
    fireEvent.click(screen.getByLabelText('Settings'))
    expect(useGameStore.getState().showSettings).toBe(true)
  })
})
