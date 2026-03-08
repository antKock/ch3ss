import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { MoveArrows } from './MoveArrows'
import { useGameStore } from '../../store/game-store'
import type { ClassifiedMove } from '../../types/chess'

const mockMoves: ClassifiedMove[] = [
  { from: 'e2', to: 'e4', san: 'e4', classification: 'top', evalLoss: 0 },
  { from: 'd2', to: 'd4', san: 'd4', classification: 'correct', evalLoss: 50 },
  { from: 'a2', to: 'a3', san: 'a3', classification: 'bof', evalLoss: 150 },
]

describe('MoveArrows', () => {
  beforeEach(() => {
    useGameStore.setState({ currentMoves: null, shuffledMoves: null })
  })

  it('renders nothing when no moves available', () => {
    const { container } = render(<MoveArrows />)
    expect(container.querySelector('svg')).toBeNull()
  })

  it('renders 3 arrows when 3 moves are presented', () => {
    useGameStore.setState({ currentMoves: mockMoves, shuffledMoves: mockMoves })
    render(<MoveArrows />)

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)
  })

  it('has descriptive ARIA labels on arrows', () => {
    useGameStore.setState({ currentMoves: mockMoves, shuffledMoves: mockMoves })
    render(<MoveArrows />)

    const buttons = screen.getAllByRole('button')
    for (const button of buttons) {
      const label = button.getAttribute('aria-label')
      expect(label).toBeTruthy()
      expect(label).toMatch(/Move .+ from [a-h][1-8] to [a-h][1-8]/)
    }
  })

  it('renders SVG overlay', () => {
    useGameStore.setState({ currentMoves: mockMoves, shuffledMoves: mockMoves })
    const { container } = render(<MoveArrows />)

    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
    expect(svg?.getAttribute('viewBox')).toBe('0 0 800 800')
  })
})
