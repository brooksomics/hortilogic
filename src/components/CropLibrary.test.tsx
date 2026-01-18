import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { CropLibrary } from './CropLibrary'
import type { Crop, GardenProfile } from '@/types'

const sampleCrops: Crop[] = [
  {
    id: 'lettuce',
    name: 'Lettuce',
    type: 'vegetable',
    botanical_family: 'Asteraceae',
    sun: 'partial',
    days_to_maturity: 55,
    sfg_density: 4,
    planting_strategy: { start_window_start: -4, start_window_end: 2 },
    companions: { friends: [], enemies: [] }
  },
  {
    id: 'tomato',
    name: 'Tomato',
    type: 'vegetable',
    botanical_family: 'Solanaceae',
    sun: 'full',
    days_to_maturity: 80,
    sfg_density: 1,
    planting_strategy: { start_window_start: 0, start_window_end: 4 },
    companions: { friends: [], enemies: [] }
  },
  {
    id: 'carrot',
    name: 'Carrot',
    type: 'vegetable',
    botanical_family: 'Apiaceae',
    sun: 'full',
    days_to_maturity: 70,
    sfg_density: 16,
    planting_strategy: { start_window_start: -2, start_window_end: 4 },
    companions: { friends: [], enemies: [] }
  }
]

describe('CropLibrary', () => {
  it('renders crop library heading', () => {
    render(<CropLibrary crops={sampleCrops} selectedCrop={null} onSelectCrop={vi.fn()} />)

    expect(screen.getByText('Crop Library')).toBeInTheDocument()
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
    expect(tomatoButton).toHaveAttribute('aria-pressed', 'true')

    // Border is now on the card container
    const card = screen.getByTestId('crop-card-tomato')
    expect(card).toHaveClass('border-leaf-500')
  })

  // Check icon test removed as we use border style and aria-pressed for selection state

  it('displays selection hint when a crop is selected', () => {
    const selectedCrop = sampleCrops[0]
    if (!selectedCrop) throw new Error('Selected crop not found')

    render(<CropLibrary crops={sampleCrops} selectedCrop={selectedCrop} onSelectCrop={vi.fn()} />)

    expect(screen.getByText(/Selected for Painting: Lettuce/i)).toBeInTheDocument()
    expect(screen.getByText(/Click empty squares to plant manually/i)).toBeInTheDocument()
  })

  it('does not display selection hint when no crop is selected', () => {
    render(<CropLibrary crops={sampleCrops} selectedCrop={null} onSelectCrop={vi.fn()} />)

    expect(screen.queryByText(/Selected for Painting:/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Click empty squares to plant/i)).not.toBeInTheDocument()
  })

  it('uses crop id as fallback when name is not provided', () => {
    const cropWithoutName: Crop = {
      id: 'radish',
      type: 'vegetable',
      botanical_family: 'Brassicaceae',
      sun: 'full',
      days_to_maturity: 25,
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
        type: 'vegetable',
        botanical_family: 'Solanaceae',
        sun: 'full',
        days_to_maturity: 65,
        sfg_density: 1,
        planting_strategy: { start_window_start: 0, start_window_end: 4 },
        companions: { friends: [], enemies: [] }
      },
      {
        id: 'spinach',
        name: 'Spinach',
        type: 'vegetable',
        botanical_family: 'Amaranthaceae',
        sun: 'partial',
        days_to_maturity: 40,
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

  describe('Viability Indicators', () => {
    const testProfile: GardenProfile = {
      name: 'Test Garden',
      hardiness_zone: '5b',
      last_frost_date: '2024-04-15',
      first_frost_date: '2024-10-15',
      season_extension_weeks: 0,
      targetPlantingDate: '2024-04-01' // 2 weeks before LFD
    }

    it('shows green border for viable crops', () => {
      // Lettuce is viable (plantable -4 to +2 weeks from LFD)
      // Target is April 1, LFD is April 15 (2 weeks before, within window)
      render(
        <CropLibrary
          crops={sampleCrops}
          selectedCrop={null}
          onSelectCrop={vi.fn()}
          currentProfile={testProfile}
        />
      )

      const card = screen.getByTestId('crop-card-lettuce')
      expect(card).toHaveClass('border-green-500')
    })

    it('shows gray border for out-of-season crops', () => {
      const summerProfile: GardenProfile = {
        ...testProfile,
        targetPlantingDate: '2024-07-01' // Way past lettuce planting window
      }

      render(
        <CropLibrary
          crops={sampleCrops}
          selectedCrop={null}
          onSelectCrop={vi.fn()}
          currentProfile={summerProfile}
        />
      )

      const card = screen.getByTestId('crop-card-lettuce')
      expect(card).toHaveClass('border-gray-300')
      expect(card).toHaveClass('opacity-60')
    })

    it('displays viability icon for each crop', () => {
      render(
        <CropLibrary
          crops={sampleCrops}
          selectedCrop={null}
          onSelectCrop={vi.fn()}
          currentProfile={testProfile}
        />
      )

      // Each crop button should have a viability icon
      const lettuceButton = screen.getByRole('button', { name: /Select Lettuce for planting/i })
      const viabilityIcon = lettuceButton.querySelector('svg.viability-icon')
      expect(viabilityIcon).toBeInTheDocument()
    })

    it('includes viability label in aria-label for accessibility', () => {
      render(
        <CropLibrary
          crops={sampleCrops}
          selectedCrop={null}
          onSelectCrop={vi.fn()}
          currentProfile={testProfile}
        />
      )

      // Button should include viability status in aria-label
      const lettuceButton = screen.getByRole('button', { name: /Select Lettuce for planting - Plantable now/i })
      expect(lettuceButton).toBeInTheDocument()
    })

    it('renders season filter toggle', () => {
      render(
        <CropLibrary
          crops={sampleCrops}
          selectedCrop={null}
          onSelectCrop={vi.fn()}
          currentProfile={testProfile}
        />
      )

      const filterCheckbox = screen.getByRole('checkbox', { name: /hide out-of-season/i })
      expect(filterCheckbox).toBeInTheDocument()
    })

    it('filters out-of-season crops when toggle is enabled', async () => {
      const user = userEvent.setup()
      const summerProfile: GardenProfile = {
        ...testProfile,
        targetPlantingDate: '2024-07-01' // Summer - all spring crops out of season
      }

      render(
        <CropLibrary
          crops={sampleCrops}
          selectedCrop={null}
          onSelectCrop={vi.fn()}
          currentProfile={summerProfile}
        />
      )

      // Initially all crops visible
      expect(screen.getByText('Lettuce')).toBeInTheDocument()
      expect(screen.getByText('Tomato')).toBeInTheDocument()
      expect(screen.getByText('Carrot')).toBeInTheDocument()

      // Enable filter
      const filterCheckbox = screen.getByRole('checkbox', { name: /hide out-of-season/i })
      await user.click(filterCheckbox)

      // All crops should be hidden in summer (all are spring crops)
      expect(screen.queryByText('Lettuce')).not.toBeInTheDocument()
      expect(screen.queryByText('Tomato')).not.toBeInTheDocument()
      expect(screen.queryByText('Carrot')).not.toBeInTheDocument()
    })

    it('shows all crops when no profile is provided', () => {
      render(
        <CropLibrary
          crops={sampleCrops}
          selectedCrop={null}
          onSelectCrop={vi.fn()}
        />
      )

      // All crops should be visible without viability styling
      expect(screen.getByText('Lettuce')).toBeInTheDocument()
      expect(screen.getByText('Tomato')).toBeInTheDocument()
      expect(screen.getByText('Carrot')).toBeInTheDocument()
    })
  })
})
