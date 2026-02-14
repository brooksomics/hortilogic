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
      type: 'vegetable',
      botanical_family: 'Asteraceae',
      sun: 'partial',
      days_to_maturity: 55,
      water_need: 3,
      height_inches: 24,
      trellisable: false,
      sfg_density: 4,
      planting_strategy: { start_window_start: -4, start_window_end: 2 },
      companions: { friends: [], enemies: [] }
    }

    const squares = Array(32).fill(null)
    squares[0] = lettuce

    render(<GardenBed squares={squares} />)

    expect(screen.getByText('Lettuce')).toBeInTheDocument()
    expect(screen.getByText(/4\/sq ft/)).toBeInTheDocument()
  })

  it('uses crop id as fallback when name is not provided', () => {
    const tomato: Crop = {
      id: 'tomato',
      type: 'vegetable',
      botanical_family: 'Solanaceae',
      sun: 'full',
      days_to_maturity: 80,
      water_need: 3,
      height_inches: 24,
      trellisable: false,
      sfg_density: 1,
      planting_strategy: { start_window_start: 0, start_window_end: 4 },
      companions: { friends: [], enemies: [] }
    }

    const squares = Array(32).fill(null)
    squares[5] = tomato

    render(<GardenBed squares={squares} />)

    expect(screen.getByText('tomato')).toBeInTheDocument()
    expect(screen.getByText(/1\/sq ft/)).toBeInTheDocument()
  })

  it('calls onSquareClick with correct index when square is clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<GardenBed onSquareClick={handleClick} />)

    const squares = screen.getAllByRole('button')

    // Click first square (index 0)
    const firstSquare = squares[0]
    if (!firstSquare) throw new Error('First square not found')
    await user.click(firstSquare)
    expect(handleClick).toHaveBeenCalledWith(0)

    // Click last square (index 31)
    const lastSquare = squares[31]
    if (!lastSquare) throw new Error('Last square not found')
    await user.click(lastSquare)
    expect(handleClick).toHaveBeenCalledWith(31)
  })

  it('handles partial squares array (less than 32)', () => {
    const carrot: Crop = {
      id: 'carrot',
      type: 'vegetable',
      botanical_family: 'Apiaceae',
      sun: 'full',
      days_to_maturity: 70,
      water_need: 3,
      height_inches: 24,
      trellisable: false,
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

    expect(screen.getByText(/Garden Bed \(8' × 4'\)/i)).toBeInTheDocument()
    expect(screen.getByText(/32 Square Foot Gardening cells/i)).toBeInTheDocument()
  })

  it('renders drip line indicators for each row', () => {
    const lettuce: Crop = {
      id: 'lettuce',
      name: 'Lettuce',
      type: 'vegetable',
      botanical_family: 'Asteraceae',
      sun: 'partial',
      days_to_maturity: 55,
      water_need: 4,
      height_inches: 24,
      trellisable: false,
      sfg_density: 4,
      planting_strategy: { start_window_start: -4, start_window_end: 2 },
      companions: { friends: [], enemies: [] }
    }

    // 4x4 grid, fill row 0 with lettuce
    const squares: (Crop | null)[] = Array(16).fill(null) as (Crop | null)[]
    squares[0] = lettuce
    squares[1] = lettuce
    squares[2] = lettuce
    squares[3] = lettuce

    render(<GardenBed squares={squares} width={4} height={4} />)

    // Should render drip line labels for each row
    const dripLines = screen.getAllByText(/Row \d+/)
    expect(dripLines.length).toBe(4) // 4 rows
  })

  it('renders drip tubing assumption note', () => {
    render(<GardenBed />)

    expect(screen.getByText(/Earthline Brown PC 1-GPH/)).toBeInTheDocument()
  })

  it('has proper accessibility labels', () => {
    const peas: Crop = {
      id: 'peas',
      name: 'Sugar Snap Peas',
      type: 'vegetable',
      botanical_family: 'Fabaceae',
      sun: 'full',
      days_to_maturity: 60,
      water_need: 3,
      height_inches: 24,
      trellisable: false,
      sfg_density: 8,
      planting_strategy: { start_window_start: -8, start_window_end: -2 },
      companions: { friends: [], enemies: [] }
    }

    const squares = Array(32).fill(null)
    squares[10] = peas

    render(<GardenBed squares={squares} />)

    // Grid should have accessible label
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', '8 by 4 foot garden bed with 32 squares')

    // Planted square should have accessible label
    const plantedSquare = screen.getByLabelText('Planted: Sugar Snap Peas')
    expect(plantedSquare).toBeInTheDocument()

    // Empty squares should have accessible labels
    const emptySquares = screen.getAllByLabelText('Empty square')
    expect(emptySquares).toHaveLength(31)
  })

  it('displays harvest date badge and tooltip when profile is active', () => {
    const radish: Crop = {
      id: 'radish',
      name: 'Radish',
      type: 'vegetable',
      botanical_family: 'Brassicaceae',
      sun: 'full',
      days_to_maturity: 25,
      water_need: 2,
      height_inches: 6,
      trellisable: false,
      sfg_density: 16,
      planting_strategy: { start_window_start: -4, start_window_end: 4 },
      companions: { friends: [], enemies: [] }
    }

    const squares = Array(32).fill(null)
    squares[0] = radish

    const mockProfile = {
      name: 'Test Garden',
      hardiness_zone: '6b',
      last_frost_date: '2024-04-15',
      first_frost_date: '2024-10-15',
      season_extension_weeks: 0,
      targetPlantingDate: '2024-05-01' // Planting on May 1st
    }

    // May 1 + 25 days = May 26
    // If checking today (e.g. May 1), days remaining should be 25?
    // Let's rely on the badge content.
    // We need to control "today" if we want exact days, but GardenBed uses
    // calculateHarvestDate(targetDate, maturity) -> harvestDate
    // getDaysUntilHarvest(harvestDate) -> assumes "today" is now.
    // 
    // To make this test deterministic without mocking system time for getDaysUntilHarvest,
    // we can check if the badge contains "d" (days).
    // Or we can just check the tooltip which contains the date string!
    // formatHarvestDate uses locale date string.

    // 2024-05-01 + 25 days = 2024-05-26.
    // formatHarvestDate should output "May 26"

    render(
      <GardenBed
        squares={squares}
        gardenProfile={mockProfile}
      />
    )

    // Check for badge (days remaining) - just check for existence of badge style or content
    // The badge has class 'text-[9px] bg-white/80...'
    // And contains number + "d"
    // Since we can't easily predict 'today', let's look for the harvest date in the tooltip/aria-label

    const plantedSquare = screen.getByLabelText((content, element) => {
      return content.includes('May 26') && content.includes('Radish')
    })
    expect(plantedSquare).toBeInTheDocument()
    expect(plantedSquare).toHaveAttribute('title', expect.stringContaining('Harvest: May 26'))
  })
})
