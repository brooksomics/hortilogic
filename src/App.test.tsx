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
    expect(screen.getByText(/Garden Bed \(4' × 8'\)/i)).toBeInTheDocument()
  })

  it('renders Crop Library', () => {
    render(<App />)
    expect(screen.getByText('Crop Library')).toBeInTheDocument()
  })

  it('displays all sample crops in library', () => {
    render(<App />)
    expect(screen.getByText('Lettuce')).toBeInTheDocument()
    expect(screen.getByText('Tomato')).toBeInTheDocument()
    expect(screen.getByText('Carrot')).toBeInTheDocument()
    expect(screen.getByText('Sugar Snap Peas')).toBeInTheDocument()
    expect(screen.getByText('Radish')).toBeInTheDocument()
  })

  it('allows selecting a crop from library', async () => {
    const user = userEvent.setup()
    render(<App />)

    const lettuceButton = screen.getByRole('button', { name: /Select Lettuce for planting/i })
    await user.click(lettuceButton)

    // Should show selection hint (there will be two instances - one in sidebar, one in instructions)
    expect(screen.getAllByText(/Selected: Lettuce/i)).toHaveLength(2)
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
    await user.click(squares[0]!)

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
    await user.click(emptySquares[0]!)

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.Date = class extends RealDate {
      constructor() {
        super()
        return mockDate
      }
    } as any

    const user = userEvent.setup()
    render(<App />)

    // Initially all squares should be empty
    const emptySquaresBefore = screen.getAllByRole('button', { name: 'Empty square' })
    expect(emptySquaresBefore).toHaveLength(32)

    // Click Automagic Fill
    const automagicButton = screen.getByRole('button', { name: /Automagic Fill/i })
    await user.click(automagicButton)

    // Should have planted some crops (exact number depends on randomness and viability)
    const emptySquaresAfter = screen.queryAllByRole('button', { name: 'Empty square' })
    expect(emptySquaresAfter.length).toBeLessThan(32)

    global.Date = RealDate
  })

  it('preserves existing crops when Automagic Fill is clicked', async () => {
    // Mock date to May (month 4) when most crops are viable
    const RealDate = Date
    const mockDate = new RealDate(2024, 4, 15)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.Date = class extends RealDate {
      constructor() {
        super()
        return mockDate
      }
    } as any

    const user = userEvent.setup()
    render(<App />)

    // Manually plant a crop first
    const tomatoButton = screen.getByRole('button', { name: /Select Tomato for planting/i })
    await user.click(tomatoButton)

    const emptySquares = screen.getAllByRole('button', { name: 'Empty square' })
    await user.click(emptySquares[0]!)

    // Verify tomato was planted
    expect(screen.getByLabelText(/Planted: Tomato/i)).toBeInTheDocument()

    // Click Automagic Fill
    const automagicButton = screen.getByRole('button', { name: /Automagic Fill/i })
    await user.click(automagicButton)

    // Original tomato should still be there
    expect(screen.getByLabelText(/Planted: Tomato/i)).toBeInTheDocument()

    global.Date = RealDate
  })
})
