import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UndoToast } from './UndoToast'
import { useGameStore } from '../../store/game-store'
import type { ClassifiedMove } from '../../types/chess'

const mockMoves: ClassifiedMove[] = [
  { from: 'e2', to: 'e4', san: 'e4', classification: 'top', evalLoss: 0 },
  { from: 'd2', to: 'd4', san: 'd4', classification: 'correct', evalLoss: 50 },
  { from: 'a2', to: 'a3', san: 'a3', classification: 'bof', evalLoss: 150 },
]

describe('UndoToast', () => {
  const onCooldownExpired = vi.fn()

  beforeEach(() => {
    vi.useFakeTimers()
    onCooldownExpired.mockReset()
    useGameStore.setState({
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      moveHistory: [],
      currentMoves: null,
      undoState: null,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders invisible placeholder when undoState is null', () => {
    const { container } = render(<UndoToast onCooldownExpired={onCooldownExpired} />)
    const el = container.firstChild as HTMLElement
    expect(el).not.toBeNull()
    expect(el.classList.contains('invisible')).toBe(true)
    expect(el.getAttribute('aria-hidden')).toBe('true')
  })

  it('renders toast when undoState is present', () => {
    useGameStore.setState({
      undoState: {
        previousFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        previousMoveHistory: [],
        moves: mockMoves,
      },
    })
    render(<UndoToast onCooldownExpired={onCooldownExpired} />)
    expect(screen.getByText('Coup joué')).toBeInTheDocument()
    expect(screen.getByLabelText('Annuler le dernier coup')).toBeInTheDocument()
  })

  it('calls onCooldownExpired after 1.2s', () => {
    useGameStore.setState({
      undoState: {
        previousFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        previousMoveHistory: [],
        moves: mockMoves,
      },
    })
    render(<UndoToast onCooldownExpired={onCooldownExpired} />)

    act(() => {
      vi.advanceTimersByTime(1200)
    })

    expect(onCooldownExpired).toHaveBeenCalledOnce()
  })

  it('undoes move when "Annuler" is clicked', () => {
    useGameStore.setState({
      undoState: {
        previousFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        previousMoveHistory: [],
        moves: mockMoves,
      },
    })
    render(<UndoToast onCooldownExpired={onCooldownExpired} />)
    fireEvent.click(screen.getByLabelText('Annuler le dernier coup'))

    expect(useGameStore.getState().undoState).toBeNull()
    expect(useGameStore.getState().currentMoves).toEqual(mockMoves)
  })

  it('undoes move on Escape key', () => {
    useGameStore.setState({
      undoState: {
        previousFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        previousMoveHistory: [],
        moves: mockMoves,
      },
    })
    render(<UndoToast onCooldownExpired={onCooldownExpired} />)
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(useGameStore.getState().undoState).toBeNull()
  })

  it('has ARIA status role', () => {
    useGameStore.setState({
      undoState: {
        previousFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        previousMoveHistory: [],
        moves: mockMoves,
      },
    })
    render(<UndoToast onCooldownExpired={onCooldownExpired} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
