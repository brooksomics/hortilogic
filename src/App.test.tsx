import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  it('renders HortiLogic heading', () => {
    render(<App />)
    expect(screen.getByText('HortiLogic')).toBeInTheDocument()
  })

  it('renders Interactive Garden Planner subtitle', () => {
    render(<App />)
    expect(screen.getByText(/Interactive Garden Planner/i)).toBeInTheDocument()
  })

  it('renders Garden Bed component', () => {
    render(<App />)
    expect(screen.getByRole('grid')).toBeInTheDocument()
    expect(screen.getByText(/Main Bed/i)).toBeInTheDocument()
  })

  it('renders Crop Library', () => {
    render(<App />)
    expect(screen.getByText('Crop Library')).toBeInTheDocument()
  })

  it('displays Core 50 crops in library', () => {
    render(<App />)
    // Should display some common crops from the Core 50
    expect(screen.getByText('Lettuce')).toBeInTheDocument()
    expect(screen.getByText('Tomato')).toBeInTheDocument()
    expect(screen.getByText('Carrot')).toBeInTheDocument()
    expect(screen.getByText('Spinach')).toBeInTheDocument()
    expect(screen.getByText('Basil')).toBeInTheDocument()
  })

  it('allows selecting a crop from library', async () => {
    const user = userEvent.setup()
    render(<App />)

    const lettuceButton = screen.getByRole('button', { name: /Select Lettuce for planting/i })
    await user.click(lettuceButton)

    // Should show selection hint (there will be two instances - one in sidebar, one in instructions)
    expect(screen.getAllByText(/Selected.*Lettuce/i)).toHaveLength(2)
  })

  it('allows planting a crop in garden bed', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Select a crop
    const tomatoButton = screen.getByRole('button', { name: /Select Tomato for planting/i })
    await user.click(tomatoButton)

    // Click an empty square (first square)
    const squares = screen.getAllByRole('button', { name: 'Empty square' })
    expect(squares.length).toBeGreaterThan(0)
    const firstSquare = squares[0]
    if (!firstSquare) throw new Error('First square not found')
    await user.click(firstSquare)

    // Square should now show the planted crop
    expect(screen.getByLabelText(/Planted: Tomato/i)).toBeInTheDocument()
  })

  it('allows removing a planted crop', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Select and plant a crop
    const carrotButton = screen.getByRole('button', { name: /Select Carrot for planting/i })
    await user.click(carrotButton)

    const emptySquares = screen.getAllByRole('button', { name: 'Empty square' })
    expect(emptySquares.length).toBeGreaterThan(0)
    const firstEmptySquare = emptySquares[0]
    if (!firstEmptySquare) throw new Error('First empty square not found')
    await user.click(firstEmptySquare)

    // Verify crop was planted
    expect(screen.getByLabelText(/Planted: Carrot/i)).toBeInTheDocument()

    // Click the planted square to remove it
    const plantedSquare = screen.getByLabelText(/Planted: Carrot/i)
    await user.click(plantedSquare)

    // Square should be empty again
    expect(screen.queryByLabelText(/Planted: Carrot/i)).not.toBeInTheDocument()
  })

  it('renders clear all crops button', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /Clear All Crops/i })).toBeInTheDocument()
  })

  it('renders how to use instructions', () => {
    render(<App />)
    expect(screen.getByText(/How to Use/i)).toBeInTheDocument()
    expect(screen.getByText(/Select a crop from the Crop Library/i)).toBeInTheDocument()
  })

  it('renders Automagic Fill button', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /Automagic Fill/i })).toBeInTheDocument()
  })

  it('fills empty cells when Automagic Fill is clicked', async () => {
    // Mock date to May (month 4) when most crops are viable
    const RealDate = Date
    const mockDate = new RealDate(2024, 4, 15)
    // @ts-expect-error - Mocking Date for testing, constructor return type can't be properly typed
    global.Date = class extends RealDate {
      constructor() {
        super()
        return mockDate
      }
    }

    const user = userEvent.setup()
    render(<App />)

    // Initially all squares should be empty
    const emptySquaresBefore = screen.getAllByRole('button', { name: 'Empty square' })
    expect(emptySquaresBefore).toHaveLength(16)

    // Click Automagic Fill
    const automagicButton = screen.getByRole('button', { name: /Automagic Fill/i })
    await user.click(automagicButton)

    // Should have planted some crops (exact number depends on randomness and viability)
    const emptySquaresAfter = screen.queryAllByRole('button', { name: 'Empty square' })
    expect(emptySquaresAfter.length).toBeLessThan(16)

    global.Date = RealDate
  })

  it('preserves existing crops when Automagic Fill is clicked', async () => {
    // Mock date to May (month 4) when most crops are viable
    const RealDate = Date
    const mockDate = new RealDate(2024, 4, 15)
    // @ts-expect-error - Mocking Date for testing, constructor return type can't be properly typed
    global.Date = class extends RealDate {
      constructor() {
        super()
        return mockDate
      }
    }

    const user = userEvent.setup()
    render(<App />)

    // Manually plant a crop first
    const tomatoButton = screen.getByRole('button', { name: /Select Tomato for planting/i })
    await user.click(tomatoButton)

    const emptySquares = screen.getAllByRole('button', { name: 'Empty square' })
    const firstEmptySquare = emptySquares[0]
    if (!firstEmptySquare) throw new Error('First empty square not found')
    await user.click(firstEmptySquare)

    // Verify tomato was planted
    expect(screen.getByLabelText(/Planted: Tomato/i)).toBeInTheDocument()

    // Click Automagic Fill
    const automagicButton = screen.getByRole('button', { name: /Automagic Fill/i })
    await user.click(automagicButton)

    // Original tomato should still be there (may have additional tomatoes planted by autoFill)
    const tomatoesAfterFill = screen.getAllByLabelText(/Planted: Tomato/i)
    expect(tomatoesAfterFill.length).toBeGreaterThanOrEqual(1)

    global.Date = RealDate
  })

  it('loads Core 50 crop database', () => {
    render(<App />)

    // Should display crop count showing 50 crops
    expect(screen.getByText(/50 crops/i)).toBeInTheDocument()
  })
})
