import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { CropLibrary } from './CropLibrary'
import type { Crop } from '@/types'

const sampleCrops: Crop[] = [
  {
    id: 'lettuce',
    name: 'Lettuce',
    sfg_density: 4,
    planting_strategy: { start_window_start: -4, start_window_end: 2 },
    companions: { friends: [], enemies: [] }
  },
  {
    id: 'tomato',
    name: 'Tomato',
    sfg_density: 1,
    planting_strategy: { start_window_start: 0, start_window_end: 4 },
    companions: { friends: [], enemies: [] }
  },
  {
    id: 'carrot',
    name: 'Carrot',
    sfg_density: 16,
    planting_strategy: { start_window_start: -2, start_window_end: 4 },
    companions: { friends: [], enemies: [] }
  }
]

describe('CropLibrary', () => {
  it('renders crop library heading', () => {
    render(<CropLibrary crops={sampleCrops} selectedCrop={null} onSelectCrop={vi.fn()} />)

    expect(screen.getByText('Crop Library')).toBeInTheDocument()
    expect(screen.getByText('Select a crop to plant in your garden')).toBeInTheDocument()
  })

  it('displays all provided crops', () => {
    render(<CropLibrary crops={sampleCrops} selectedCrop={null} onSelectCrop={vi.fn()} />)

    expect(screen.getByText('Lettuce')).toBeInTheDocument()
    expect(screen.getByText('Tomato')).toBeInTheDocument()
    expect(screen.getByText('Carrot')).toBeInTheDocument()
  })

  it('displays crop density for each crop', () => {
    render(<CropLibrary crops={sampleCrops} selectedCrop={null} onSelectCrop={vi.fn()} />)

    expect(screen.getByText('4 per sq ft')).toBeInTheDocument()
    expect(screen.getByText('1 per sq ft')).toBeInTheDocument()
    expect(screen.getByText('16 per sq ft')).toBeInTheDocument()
  })

  it('calls onSelectCrop when a crop is clicked', async () => {
    const user = userEvent.setup()
    const handleSelect = vi.fn()

    render(<CropLibrary crops={sampleCrops} selectedCrop={null} onSelectCrop={handleSelect} />)

    const lettuceButton = screen.getByRole('button', { name: /Select Lettuce for planting/i })
    await user.click(lettuceButton)

    expect(handleSelect).toHaveBeenCalledWith(sampleCrops[0])
  })

  it('highlights the selected crop', () => {
    const selectedCrop = sampleCrops[1] // Tomato
    if (!selectedCrop) throw new Error('Selected crop not found')

    render(<CropLibrary crops={sampleCrops} selectedCrop={selectedCrop} onSelectCrop={vi.fn()} />)

    const tomatoButton = screen.getByRole('button', { name: /Select Tomato for planting/i })
    expect(tomatoButton).toHaveClass('border-leaf-500')
    expect(tomatoButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows check icon for selected crop', () => {
    const selectedCrop = sampleCrops[0] // Lettuce
    if (!selectedCrop) throw new Error('Selected crop not found')

    render(<CropLibrary crops={sampleCrops} selectedCrop={selectedCrop} onSelectCrop={vi.fn()} />)

    // Check that the selected crop's button contains the check icon
    const lettuceButton = screen.getByRole('button', { name: /Select Lettuce for planting/i })
    const checkIcon = lettuceButton.querySelector('svg[aria-hidden="true"]')
    expect(checkIcon).toBeInTheDocument()
  })

  it('displays selection hint when a crop is selected', () => {
    const selectedCrop = sampleCrops[0]
    if (!selectedCrop) throw new Error('Selected crop not found')

    render(<CropLibrary crops={sampleCrops} selectedCrop={selectedCrop} onSelectCrop={vi.fn()} />)

    expect(screen.getByText(/Selected: Lettuce/i)).toBeInTheDocument()
    expect(screen.getByText('Click an empty square to plant')).toBeInTheDocument()
  })

  it('does not display selection hint when no crop is selected', () => {
    render(<CropLibrary crops={sampleCrops} selectedCrop={null} onSelectCrop={vi.fn()} />)

    expect(screen.queryByText(/Selected:/i)).not.toBeInTheDocument()
    expect(screen.queryByText('Click an empty square to plant')).not.toBeInTheDocument()
  })

  it('uses crop id as fallback when name is not provided', () => {
    const cropWithoutName: Crop = {
      id: 'radish',
      sfg_density: 16,
      planting_strategy: { start_window_start: -4, start_window_end: 2 },
      companions: { friends: [], enemies: [] }
    }

    render(<CropLibrary crops={[cropWithoutName]} selectedCrop={null} onSelectCrop={vi.fn()} />)

    expect(screen.getByText('radish')).toBeInTheDocument()
  })

  it('handles empty crops array gracefully', () => {
    render(<CropLibrary crops={[]} selectedCrop={null} onSelectCrop={vi.fn()} />)

    // Should still render the heading
    expect(screen.getByText('Crop Library')).toBeInTheDocument()

    // Should not have any crop buttons
    const buttons = screen.queryAllByRole('button')
    expect(buttons).toHaveLength(0)
  })

  describe('Search and Filter', () => {
    const largeCropList: Crop[] = [
      ...sampleCrops,
      {
        id: 'cherry-tomato',
        name: 'Cherry Tomato',
        sfg_density: 1,
        planting_strategy: { start_window_start: 0, start_window_end: 4 },
        companions: { friends: [], enemies: [] }
      },
      {
        id: 'spinach',
        name: 'Spinach',
        sfg_density: 9,
        planting_strategy: { start_window_start: -6, start_window_end: 0 },
        companions: { friends: [], enemies: [] }
      }
    ]

    it('renders search input field', () => {
      render(<CropLibrary crops={largeCropList} selectedCrop={null} onSelectCrop={vi.fn()} />)

      const searchInput = screen.getByPlaceholderText(/search crops/i)
      expect(searchInput).toBeInTheDocument()
    })

    it('filters crops by search query', async () => {
      const user = userEvent.setup()
      render(<CropLibrary crops={largeCropList} selectedCrop={null} onSelectCrop={vi.fn()} />)

      const searchInput = screen.getByPlaceholderText(/search crops/i)
      await user.type(searchInput, 'tom')

      // Should show tomato crops
      expect(screen.getByText('Tomato')).toBeInTheDocument()
      expect(screen.getByText('Cherry Tomato')).toBeInTheDocument()

      // Should not show other crops
      expect(screen.queryByText('Lettuce')).not.toBeInTheDocument()
      expect(screen.queryByText('Carrot')).not.toBeInTheDocument()
      expect(screen.queryByText('Spinach')).not.toBeInTheDocument()
    })

    it('is case insensitive when searching', async () => {
      const user = userEvent.setup()
      render(<CropLibrary crops={largeCropList} selectedCrop={null} onSelectCrop={vi.fn()} />)

      const searchInput = screen.getByPlaceholderText(/search crops/i)
      await user.type(searchInput, 'LETTUCE')

      expect(screen.getByText('Lettuce')).toBeInTheDocument()
      expect(screen.queryByText('Tomato')).not.toBeInTheDocument()
    })

    it('shows all crops when search is empty', async () => {
      const user = userEvent.setup()
      render(<CropLibrary crops={largeCropList} selectedCrop={null} onSelectCrop={vi.fn()} />)

      const searchInput = screen.getByPlaceholderText(/search crops/i)

      // Type and then clear
      await user.type(searchInput, 'tom')
      await user.clear(searchInput)

      // All crops should be visible again
      expect(screen.getByText('Lettuce')).toBeInTheDocument()
      expect(screen.getByText('Tomato')).toBeInTheDocument()
      expect(screen.getByText('Carrot')).toBeInTheDocument()
      expect(screen.getByText('Spinach')).toBeInTheDocument()
    })

    it('displays crop count', () => {
      render(<CropLibrary crops={largeCropList} selectedCrop={null} onSelectCrop={vi.fn()} />)

      expect(screen.getByText(/5 crops/i)).toBeInTheDocument()
    })

    it('updates crop count when filtered', async () => {
      const user = userEvent.setup()
      render(<CropLibrary crops={largeCropList} selectedCrop={null} onSelectCrop={vi.fn()} />)

      const searchInput = screen.getByPlaceholderText(/search crops/i)
      await user.type(searchInput, 'tom')

      expect(screen.getByText(/2 crops/i)).toBeInTheDocument()
    })

    it('shows clear button when search has text', async () => {
      const user = userEvent.setup()
      render(<CropLibrary crops={largeCropList} selectedCrop={null} onSelectCrop={vi.fn()} />)

      const searchInput = screen.getByPlaceholderText(/search crops/i)
      await user.type(searchInput, 'tom')

      const clearButton = screen.getByRole('button', { name: /clear search/i })
      expect(clearButton).toBeInTheDocument()
    })

    it('clears search when clear button is clicked', async () => {
      const user = userEvent.setup()
      render(<CropLibrary crops={largeCropList} selectedCrop={null} onSelectCrop={vi.fn()} />)

      const searchInput = screen.getByPlaceholderText(/search crops/i)
      await user.type(searchInput, 'tom')

      const clearButton = screen.getByRole('button', { name: /clear search/i })
      await user.click(clearButton)

      expect(searchInput).toHaveValue('')
      expect(screen.getByText('Lettuce')).toBeInTheDocument()
    })
  })
})
