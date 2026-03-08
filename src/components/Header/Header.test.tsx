import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Header } from './Header'

describe('Header', () => {
  it('renders app title', () => {
    render(<Header />)
    expect(screen.getByText('ch3ss')).toBeInTheDocument()
  })

  it('renders settings button', () => {
    render(<Header />)
    expect(screen.getByLabelText('Settings')).toBeInTheDocument()
  })
})
