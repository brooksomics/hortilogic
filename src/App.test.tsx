import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import App from './App'
import { GardenProvider } from './context/GardenProvider'

// Helper to render App with GardenProvider
function renderApp() {
  return render(
    <GardenProvider>
      <App />
    </GardenProvider>
  )
}

describe('App', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders HortiLogic heading', () => {
    renderApp()
    expect(screen.getByText('HortiLogic')).toBeInTheDocument()
  })

  it('warns when localStorage writes fail and clears the warning on a successful write', async () => {
    const user = userEvent.setup()
    // Simulate quota exceeded for the profile write (goes through useLocalStorage);
    // pass other keys through so unrelated writes still succeed.
    // eslint-disable-next-line @typescript-eslint/unbound-method -- re-invoked with the mock's `this`
    const realSetItem = Storage.prototype.setItem
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(function (this: Storage, key: string, value: string) {
        if (key === 'hortilogic:profiles') {
          throw new DOMException('quota', 'QuotaExceededError')
        }
        realSetItem.call(this, key, value)
      })

    renderApp() // mount-time profile persist fails -> warning surfaces

    // Query by text (UndoToast also uses role="alert")
    expect(await screen.findByText(/not being saved/i)).toBeInTheDocument()

    // Storage recovers; a successful write should clear the warning
    setItemSpy.mockRestore()
    await user.click(
      screen.getByRole('button', { name: /Select Beefsteak Tomato for planting/i })
    )
    const empty = screen.getAllByRole('button', { name: /: empty$/ })[0]
    if (!empty) throw new Error('No empty square found')
    await user.click(empty)

    await waitFor(
      () => {
        expect(screen.queryByText(/not being saved/i)).not.toBeInTheDocument()
      },
      { timeout: 2000 }
    )
  })

  it('renders Interactive Garden Planner subtitle', () => {
    renderApp()
    expect(screen.getByText(/Interactive Garden Planner/i)).toBeInTheDocument()
  })

  it('renders Garden Bed component', () => {
    renderApp()
    expect(screen.getByRole('grid')).toBeInTheDocument()
    expect(screen.getByText(/Main Bed/i)).toBeInTheDocument()
  })

  it('renders Crop Library', () => {
    renderApp()
    expect(screen.getByText('Crop Library')).toBeInTheDocument()
  })

  it('displays crops from expanded database (286 crops) in library', () => {
    renderApp()
    // Should display crops from the expanded database
    // Check for specific varieties that exist in the new database
    expect(screen.getByText(/Butterhead Lettuce/i)).toBeInTheDocument()
    expect(screen.getByText(/Beefsteak Tomato/i)).toBeInTheDocument()
    expect(screen.getByText(/^Carrot$/i)).toBeInTheDocument()
    expect(screen.getByText(/^Spinach$/i)).toBeInTheDocument()
    expect(screen.getByText(/Sweet Basil/i)).toBeInTheDocument()
  })

  it('allows selecting a crop from library', async () => {
    const user = userEvent.setup()
    renderApp()

    const lettuceButton = screen.getByRole('button', { name: /Select Butterhead Lettuce for planting/i })
    await user.click(lettuceButton)

    // Should show selection hint (there will be two instances - one in sidebar, one in instructions)
    expect(screen.getAllByText(/Selected.*Butterhead Lettuce/i)).toHaveLength(2)
  })

  it('allows planting a crop in garden bed', async () => {
    const user = userEvent.setup()
    renderApp()

    // Select a crop
    const tomatoButton = screen.getByRole('button', { name: /Select Beefsteak Tomato for planting/i })
    await user.click(tomatoButton)

    // Click an empty square (first square)
    const squares = screen.getAllByRole('button', { name: /: empty$/ })
    expect(squares.length).toBeGreaterThan(0)
    const firstSquare = squares[0]
    if (!firstSquare) throw new Error('First square not found')
    await user.click(firstSquare)

    // Square should now show the planted crop
    expect(screen.getByLabelText(/: Beefsteak Tomato/i)).toBeInTheDocument()
  })

  it('allows removing a planted crop', async () => {
    const user = userEvent.setup()
    renderApp()

    // Select and plant a crop
    const carrotButton = screen.getByRole('button', { name: /Select Carrot for planting/i })
    await user.click(carrotButton)

    const emptySquares = screen.getAllByRole('button', { name: /: empty$/ })
    expect(emptySquares.length).toBeGreaterThan(0)
    const firstEmptySquare = emptySquares[0]
    if (!firstEmptySquare) throw new Error('First empty square not found')
    await user.click(firstEmptySquare)

    // Verify crop was planted
    expect(screen.getByLabelText(/: Carrot/i)).toBeInTheDocument()

    // Click the planted square to remove it
    const plantedSquare = screen.getByLabelText(/: Carrot/i)
    await user.click(plantedSquare)

    // Square should be empty again
    expect(screen.queryByLabelText(/: Carrot/i)).not.toBeInTheDocument()
  })

  it('renders clear all crops button', () => {
    renderApp()
    expect(screen.getByRole('button', { name: /Clear All Crops/i })).toBeInTheDocument()
  })

  it('renders how to use instructions', () => {
    renderApp()
    expect(screen.getByText(/How to Use/i)).toBeInTheDocument()
    expect(screen.getByText(/Step 1: Setup Your Garden/i)).toBeInTheDocument()
    expect(screen.getByText(/Step 2: Select Your Crops/i)).toBeInTheDocument()
    expect(screen.getByText(/Step 3: Optimize Placement/i)).toBeInTheDocument()
  })

  it('renders Automagic Fill button', () => {
    renderApp()
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
    renderApp()

    // Initially all squares should be empty
    const emptySquaresBefore = screen.getAllByRole('button', { name: /: empty$/ })
    expect(emptySquaresBefore).toHaveLength(16)

    // Click Automagic Fill
    const automagicButton = screen.getByRole('button', { name: /Automagic Fill/i })
    await user.click(automagicButton)

    // Should have planted some crops (exact number depends on randomness and viability)
    const emptySquaresAfter = screen.queryAllByRole('button', { name: /: empty$/ })
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
    renderApp()

    // Manually plant a crop first
    const tomatoButton = screen.getByRole('button', { name: /Select Beefsteak Tomato for planting/i })
    await user.click(tomatoButton)

    const emptySquares = screen.getAllByRole('button', { name: /: empty$/ })
    const firstEmptySquare = emptySquares[0]
    if (!firstEmptySquare) throw new Error('First empty square not found')
    await user.click(firstEmptySquare)

    // Verify tomato was planted
    expect(screen.getByLabelText(/: Beefsteak Tomato/i)).toBeInTheDocument()

    // Click Automagic Fill
    const automagicButton = screen.getByRole('button', { name: /Automagic Fill/i })
    await user.click(automagicButton)

    // Original tomato should still be there (may have additional tomatoes planted by autoFill)
    const tomatoesAfterFill = screen.getAllByLabelText(/: Beefsteak Tomato/i)
    expect(tomatoesAfterFill.length).toBeGreaterThanOrEqual(1)

    global.Date = RealDate
  })

  it('loads expanded crop database (286 crops)', () => {
    renderApp()

    // Should display crop count showing 286 crops
    expect(screen.getByText(/286 crops/i)).toBeInTheDocument()
  })
})
