import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { GardenBed } from './GardenBed'
import type { Crop } from '@/types'

describe('GardenBed', () => {
  it('renders 32 squares by default', () => {
    render(<GardenBed />)
    const squares = screen.getAllByRole('button')
    expect(squares).toHaveLength(32)
  })

  it('displays crop information when a square is planted', () => {
    const lettuce: Crop = {
      id: 'lettuce',
      name: 'Lettuce',
      sfg_density: 4,
      planting_strategy: { start_window_start: -4, start_window_end: 2 },
      companions: { friends: [], enemies: [] }
    }

    const squares = Array(32).fill(null)
    squares[0] = lettuce

    render(<GardenBed squares={squares} />)

    expect(screen.getByText('Lettuce')).toBeInTheDocument()
    expect(screen.getByText('4/sq ft')).toBeInTheDocument()
  })

  it('uses crop id as fallback when name is not provided', () => {
    const tomato: Crop = {
      id: 'tomato',
      sfg_density: 1,
      planting_strategy: { start_window_start: 0, start_window_end: 4 },
      companions: { friends: [], enemies: [] }
    }

    const squares = Array(32).fill(null)
    squares[5] = tomato

    render(<GardenBed squares={squares} />)

    expect(screen.getByText('tomato')).toBeInTheDocument()
    expect(screen.getByText('1/sq ft')).toBeInTheDocument()
  })

  it('calls onSquareClick with correct index when square is clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<GardenBed onSquareClick={handleClick} />)

    const squares = screen.getAllByRole('button')

    // Click first square (index 0)
    await user.click(squares[0]!)
    expect(handleClick).toHaveBeenCalledWith(0)

    // Click last square (index 31)
    await user.click(squares[31]!)
    expect(handleClick).toHaveBeenCalledWith(31)
  })

  it('handles partial squares array (less than 32)', () => {
    const carrot: Crop = {
      id: 'carrot',
      sfg_density: 16,
      planting_strategy: { start_window_start: -2, start_window_end: 4 },
      companions: { friends: [], enemies: [] }
    }

    // Only provide 10 squares
    const squares = Array(10).fill(null)
    squares[3] = carrot

    render(<GardenBed squares={squares} />)

    // Should still render 32 squares
    const allSquares = screen.getAllByRole('button')
    expect(allSquares).toHaveLength(32)

    // But only the provided ones have crops
    expect(screen.getByText('carrot')).toBeInTheDocument()
  })

  it('truncates squares array if more than 32 provided', () => {
    // Provide 40 squares (more than 32)
    const squares = Array(40).fill(null)

    render(<GardenBed squares={squares} />)

    // Should only render 32 squares
    const allSquares = screen.getAllByRole('button')
    expect(allSquares).toHaveLength(32)
  })

  it('renders grid header with bed dimensions', () => {
    render(<GardenBed />)

    expect(screen.getByText(/Garden Bed \(4' × 8'\)/i)).toBeInTheDocument()
    expect(screen.getByText(/32 Square Foot Gardening cells/i)).toBeInTheDocument()
  })

  it('has proper accessibility labels', () => {
    const peas: Crop = {
      id: 'peas',
      name: 'Sugar Snap Peas',
      sfg_density: 8,
      planting_strategy: { start_window_start: -8, start_window_end: -2 },
      companions: { friends: [], enemies: [] }
    }

    const squares = Array(32).fill(null)
    squares[10] = peas

    render(<GardenBed squares={squares} />)

    // Grid should have accessible label
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', '4 by 8 foot garden bed with 32 squares')

    // Planted square should have accessible label
    const plantedSquare = screen.getByLabelText('Planted: Sugar Snap Peas')
    expect(plantedSquare).toBeInTheDocument()

    // Empty squares should have accessible labels
    const emptySquares = screen.getAllByLabelText('Empty square')
    expect(emptySquares).toHaveLength(31)
  })
})
