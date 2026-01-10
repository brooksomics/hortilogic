import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders HortiLogic heading', () => {
    render(<App />)
    expect(screen.getByText('HortiLogic')).toBeInTheDocument()
  })

  it('renders Core MVP Demo subtitle', () => {
    render(<App />)
    expect(screen.getByText(/Parametric Garden Planner - Core MVP Demo/i)).toBeInTheDocument()
  })

  it('renders Garden Bed component', () => {
    render(<App />)
    expect(screen.getByRole('grid')).toBeInTheDocument()
    expect(screen.getByText(/Garden Bed \(4' × 8'\)/i)).toBeInTheDocument()
  })

  it('renders crop viability section', () => {
    render(<App />)
    expect(screen.getByText(/Crop Viability Today/i)).toBeInTheDocument()
  })

  it('displays all sample crops in viability check', () => {
    render(<App />)
    expect(screen.getByText('Lettuce')).toBeInTheDocument()
    expect(screen.getByText('Tomato')).toBeInTheDocument()
    expect(screen.getByText('Carrot')).toBeInTheDocument()
    expect(screen.getByText('Sugar Snap Peas')).toBeInTheDocument()
  })
})
