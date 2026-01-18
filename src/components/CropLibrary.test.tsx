import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { CropLibrary } from './CropLibrary'
import type { Crop, GardenProfile } from '@/types'

const sampleCrops: Crop[] = [
  {
    id: 'lettuce-butterhead',
    name: 'Butterhead Lettuce',
    type: 'vegetable',
    botanical_family: 'Asteraceae',
    sun: 'partial',
    days_to_maturity: 55,
    sfg_density: 4,
    planting_strategy: { start_window_start: -4, start_window_end: 2 },
    companions: { friends: [], enemies: [] }
  },
  {
    id: 'tomato-beefsteak',
    name: 'Beefsteak Tomato',
    type: 'vegetable',
    botanical_family: 'Solanaceae',
    sun: 'full',
    days_to_maturity: 85,
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

    expect(screen.getByText('Butterhead Lettuce')).toBeInTheDocument()
    expect(screen.getByText('Beefsteak Tomato')).toBeInTheDocument()
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
    const card = screen.getByTestId('crop-card-tomato-beefsteak')
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
      id: 'radish-red',
      type: 'vegetable',
      botanical_family: 'Brassicaceae',
      sun: 'full',
      days_to_maturity: 25,
      sfg_density: 16,
      planting_strategy: { start_window_start: -4, start_window_end: 2 },
      companions: { friends: [], enemies: [] }
    }

    render(<CropLibrary crops={[cropWithoutName]} selectedCrop={null} onSelectCrop={vi.fn()} />)

    expect(screen.getByText('radish-red')).toBeInTheDocument()
  })

  it('handles empty crops array gracefully', () => {
    render(<CropLibrary crops={[]} selectedCrop={null} onSelectCrop={vi.fn()} />)

    // Should still render the heading
    expect(screen.getByText('Crop Library')).toBeInTheDocument()

    // Should still render category tabs and sun filter pills
    expect(screen.getByRole('button', { name: /^All$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /☀️ Full Sun/i })).toBeInTheDocument()

    // Should show 0 crops
    expect(screen.getByText('0 crops')).toBeInTheDocument()

    // Should not have any crop selection buttons (buttons with "Select" in aria-label)
    const cropButtons = screen.queryAllByRole('button', { name: /Select .* for planting/i })
    expect(cropButtons).toHaveLength(0)
  })

  describe('Search and Filter', () => {
    const largeCropList: Crop[] = [
      ...sampleCrops,
      {
        id: 'tomato-cherry',
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
      expect(screen.getByText('Beefsteak Tomato')).toBeInTheDocument()
      expect(screen.getByText('Cherry Tomato')).toBeInTheDocument()

      // Should not show other crops
      expect(screen.queryByText('Butterhead Lettuce')).not.toBeInTheDocument()
      expect(screen.queryByText('Carrot')).not.toBeInTheDocument()
      expect(screen.queryByText('Spinach')).not.toBeInTheDocument()
    })

    it('is case insensitive when searching', async () => {
      const user = userEvent.setup()
      render(<CropLibrary crops={largeCropList} selectedCrop={null} onSelectCrop={vi.fn()} />)

      const searchInput = screen.getByPlaceholderText(/search crops/i)
      await user.type(searchInput, 'BUTTERHEAD')

      expect(screen.getByText('Butterhead Lettuce')).toBeInTheDocument()
      expect(screen.queryByText('Beefsteak Tomato')).not.toBeInTheDocument()
    })

    it('shows all crops when search is empty', async () => {
      const user = userEvent.setup()
      render(<CropLibrary crops={largeCropList} selectedCrop={null} onSelectCrop={vi.fn()} />)

      const searchInput = screen.getByPlaceholderText(/search crops/i)

      // Type and then clear
      await user.type(searchInput, 'tom')
      await user.clear(searchInput)

      // All crops should be visible again
      expect(screen.getByText('Butterhead Lettuce')).toBeInTheDocument()
      expect(screen.getByText('Beefsteak Tomato')).toBeInTheDocument()
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
      expect(screen.getByText('Butterhead Lettuce')).toBeInTheDocument()
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

      const card = screen.getByTestId('crop-card-lettuce-butterhead')
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

      const card = screen.getByTestId('crop-card-lettuce-butterhead')
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
      expect(screen.getByText('Butterhead Lettuce')).toBeInTheDocument()
      expect(screen.getByText('Beefsteak Tomato')).toBeInTheDocument()
      expect(screen.getByText('Carrot')).toBeInTheDocument()

      // Enable filter
      const filterCheckbox = screen.getByRole('checkbox', { name: /hide out-of-season/i })
      await user.click(filterCheckbox)

      // All crops should be hidden in summer (all are spring crops)
      expect(screen.queryByText('Butterhead Lettuce')).not.toBeInTheDocument()
      expect(screen.queryByText('Beefsteak Tomato')).not.toBeInTheDocument()
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
      expect(screen.getByText('Butterhead Lettuce')).toBeInTheDocument()
      expect(screen.getByText('Beefsteak Tomato')).toBeInTheDocument()
      expect(screen.getByText('Carrot')).toBeInTheDocument()
    })
  })

  describe('Category Tabs (TODO-028)', () => {
    const mixedCrops: Crop[] = [
      {
        id: 'lettuce',
        name: 'Butterhead Lettuce',
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
        name: 'Beefsteak Tomato',
        type: 'vegetable',
        botanical_family: 'Solanaceae',
        sun: 'full',
        days_to_maturity: 80,
        sfg_density: 1,
        planting_strategy: { start_window_start: 0, start_window_end: 4 },
        companions: { friends: [], enemies: [] }
      },
      {
        id: 'basil',
        name: 'Basil',
        type: 'herb',
        botanical_family: 'Lamiaceae',
        sun: 'full',
        days_to_maturity: 60,
        sfg_density: 4,
        planting_strategy: { start_window_start: 0, start_window_end: 4 },
        companions: { friends: [], enemies: [] }
      },
      {
        id: 'cilantro',
        name: 'Cilantro',
        type: 'herb',
        botanical_family: 'Apiaceae',
        sun: 'partial',
        days_to_maturity: 45,
        sfg_density: 9,
        planting_strategy: { start_window_start: -4, start_window_end: 2 },
        companions: { friends: [], enemies: [] }
      },
      {
        id: 'marigold',
        name: 'Marigold',
        type: 'flower',
        botanical_family: 'Asteraceae',
        sun: 'full',
        days_to_maturity: 50,
        sfg_density: 4,
        planting_strategy: { start_window_start: 0, start_window_end: 4 },
        companions: { friends: [], enemies: [] }
      },
      {
        id: 'nasturtium',
        name: 'Nasturtium',
        type: 'flower',
        botanical_family: 'Tropaeolaceae',
        sun: 'full',
        days_to_maturity: 45,
        sfg_density: 2,
        planting_strategy: { start_window_start: 0, start_window_end: 4 },
        companions: { friends: [], enemies: [] }
      }
    ]

    it('renders category tabs (All, Vegetables, Herbs, Flowers)', () => {
      render(<CropLibrary crops={mixedCrops} selectedCrop={null} onSelectCrop={vi.fn()} />)

      expect(screen.getByRole('button', { name: /^All$/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^Vegetables$/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^Herbs$/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^Flowers$/i })).toBeInTheDocument()
    })

    it('shows all crops when "All" tab is active (default)', () => {
      render(<CropLibrary crops={mixedCrops} selectedCrop={null} onSelectCrop={vi.fn()} />)

      expect(screen.getByText('Butterhead Lettuce')).toBeInTheDocument()
      expect(screen.getByText('Beefsteak Tomato')).toBeInTheDocument()
      expect(screen.getByText('Basil')).toBeInTheDocument()
      expect(screen.getByText('Cilantro')).toBeInTheDocument()
      expect(screen.getByText('Marigold')).toBeInTheDocument()
      expect(screen.getByText('Nasturtium')).toBeInTheDocument()
    })

    it('shows only vegetables when "Vegetables" tab is clicked', async () => {
      const user = userEvent.setup()
      render(<CropLibrary crops={mixedCrops} selectedCrop={null} onSelectCrop={vi.fn()} />)

      const vegTab = screen.getByRole('button', { name: /^Vegetables$/i })
      await user.click(vegTab)

      // Should show vegetables
      expect(screen.getByText('Butterhead Lettuce')).toBeInTheDocument()
      expect(screen.getByText('Beefsteak Tomato')).toBeInTheDocument()

      // Should NOT show herbs or flowers
      expect(screen.queryByText('Basil')).not.toBeInTheDocument()
      expect(screen.queryByText('Cilantro')).not.toBeInTheDocument()
      expect(screen.queryByText('Marigold')).not.toBeInTheDocument()
      expect(screen.queryByText('Nasturtium')).not.toBeInTheDocument()
    })

    it('shows only herbs when "Herbs" tab is clicked', async () => {
      const user = userEvent.setup()
      render(<CropLibrary crops={mixedCrops} selectedCrop={null} onSelectCrop={vi.fn()} />)

      const herbTab = screen.getByRole('button', { name: /^Herbs$/i })
      await user.click(herbTab)

      // Should show herbs
      expect(screen.getByText('Basil')).toBeInTheDocument()
      expect(screen.getByText('Cilantro')).toBeInTheDocument()

      // Should NOT show vegetables or flowers
      expect(screen.queryByText('Butterhead Lettuce')).not.toBeInTheDocument()
      expect(screen.queryByText('Beefsteak Tomato')).not.toBeInTheDocument()
      expect(screen.queryByText('Marigold')).not.toBeInTheDocument()
      expect(screen.queryByText('Nasturtium')).not.toBeInTheDocument()
    })

    it('shows only flowers when "Flowers" tab is clicked', async () => {
      const user = userEvent.setup()
      render(<CropLibrary crops={mixedCrops} selectedCrop={null} onSelectCrop={vi.fn()} />)

      const flowerTab = screen.getByRole('button', { name: /^Flowers$/i })
      await user.click(flowerTab)

      // Should show flowers
      expect(screen.getByText('Marigold')).toBeInTheDocument()
      expect(screen.getByText('Nasturtium')).toBeInTheDocument()

      // Should NOT show vegetables or herbs
      expect(screen.queryByText('Butterhead Lettuce')).not.toBeInTheDocument()
      expect(screen.queryByText('Beefsteak Tomato')).not.toBeInTheDocument()
      expect(screen.queryByText('Basil')).not.toBeInTheDocument()
      expect(screen.queryByText('Cilantro')).not.toBeInTheDocument()
    })

    it('works with search filtering (combined filters)', async () => {
      const user = userEvent.setup()
      render(<CropLibrary crops={mixedCrops} selectedCrop={null} onSelectCrop={vi.fn()} />)

      // Select Vegetables tab
      const vegTab = screen.getByRole('button', { name: /^Vegetables$/i })
      await user.click(vegTab)

      // Search for "tom"
      const searchInput = screen.getByPlaceholderText(/search crops/i)
      await user.type(searchInput, 'tom')

      // Should only show Tomato (vegetable + matches search)
      expect(screen.getByText('Beefsteak Tomato')).toBeInTheDocument()

      // Should NOT show Lettuce (vegetable but doesn't match search)
      expect(screen.queryByText('Butterhead Lettuce')).not.toBeInTheDocument()

      // Should NOT show herbs/flowers
      expect(screen.queryByText('Basil')).not.toBeInTheDocument()
      expect(screen.queryByText('Marigold')).not.toBeInTheDocument()
    })
  })

  describe('Sun Filter Pills (TODO-028)', () => {
    const sunVarietyCrops: Crop[] = [
      {
        id: 'lettuce',
        name: 'Butterhead Lettuce',
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
        name: 'Beefsteak Tomato',
        type: 'vegetable',
        botanical_family: 'Solanaceae',
        sun: 'full',
        days_to_maturity: 80,
        sfg_density: 1,
        planting_strategy: { start_window_start: 0, start_window_end: 4 },
        companions: { friends: [], enemies: [] }
      },
      {
        id: 'hostas',
        name: 'Hostas',
        type: 'flower',
        botanical_family: 'Asparagaceae',
        sun: 'shade',
        days_to_maturity: 90,
        sfg_density: 1,
        planting_strategy: { start_window_start: -2, start_window_end: 2 },
        companions: { friends: [], enemies: [] }
      }
    ]

    it('renders sun filter pills (Full Sun, Partial Shade, Shade)', () => {
      render(<CropLibrary crops={sunVarietyCrops} selectedCrop={null} onSelectCrop={vi.fn()} />)

      expect(screen.getByRole('button', { name: /☀️ Full Sun/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /⛅ Partial Shade/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /🌙 Shade/i })).toBeInTheDocument()
    })

    it('shows all crops when no sun filter is selected (default)', () => {
      render(<CropLibrary crops={sunVarietyCrops} selectedCrop={null} onSelectCrop={vi.fn()} />)

      expect(screen.getByText('Butterhead Lettuce')).toBeInTheDocument()
      expect(screen.getByText('Beefsteak Tomato')).toBeInTheDocument()
      expect(screen.getByText('Hostas')).toBeInTheDocument()
    })

    it('shows only full sun crops when "Full Sun" pill is clicked', async () => {
      const user = userEvent.setup()
      render(<CropLibrary crops={sunVarietyCrops} selectedCrop={null} onSelectCrop={vi.fn()} />)

      const fullSunPill = screen.getByRole('button', { name: /☀️ Full Sun/i })
      await user.click(fullSunPill)

      // Should show full sun crops
      expect(screen.getByText('Beefsteak Tomato')).toBeInTheDocument()

      // Should NOT show partial/shade crops
      expect(screen.queryByText('Butterhead Lettuce')).not.toBeInTheDocument()
      expect(screen.queryByText('Hostas')).not.toBeInTheDocument()
    })

    it('shows only partial shade crops when "Partial Shade" pill is clicked', async () => {
      const user = userEvent.setup()
      render(<CropLibrary crops={sunVarietyCrops} selectedCrop={null} onSelectCrop={vi.fn()} />)

      const partialPill = screen.getByRole('button', { name: /⛅ Partial Shade/i })
      await user.click(partialPill)

      // Should show partial shade crops
      expect(screen.getByText('Butterhead Lettuce')).toBeInTheDocument()

      // Should NOT show full/shade crops
      expect(screen.queryByText('Beefsteak Tomato')).not.toBeInTheDocument()
      expect(screen.queryByText('Hostas')).not.toBeInTheDocument()
    })

    it('shows only shade crops when "Shade" pill is clicked', async () => {
      const user = userEvent.setup()
      render(<CropLibrary crops={sunVarietyCrops} selectedCrop={null} onSelectCrop={vi.fn()} />)

      const shadePill = screen.getByRole('button', { name: /🌙 Shade/i })
      await user.click(shadePill)

      // Should show shade crops
      expect(screen.getByText('Hostas')).toBeInTheDocument()

      // Should NOT show full/partial crops
      expect(screen.queryByText('Butterhead Lettuce')).not.toBeInTheDocument()
      expect(screen.queryByText('Beefsteak Tomato')).not.toBeInTheDocument()
    })

    it('works with category tabs (combined filters)', async () => {
      const user = userEvent.setup()
      const mixedCrops: Crop[] = [
        ...sunVarietyCrops,
        {
          id: 'basil',
          name: 'Basil',
          type: 'herb',
          botanical_family: 'Lamiaceae',
          sun: 'full',
          days_to_maturity: 60,
          sfg_density: 4,
          planting_strategy: { start_window_start: 0, start_window_end: 4 },
          companions: { friends: [], enemies: [] }
        }
      ]

      render(<CropLibrary crops={mixedCrops} selectedCrop={null} onSelectCrop={vi.fn()} />)

      // Select Vegetables tab
      const vegTab = screen.getByRole('button', { name: /^Vegetables$/i })
      await user.click(vegTab)

      // Select Full Sun pill
      const fullSunPill = screen.getByRole('button', { name: /☀️ Full Sun/i })
      await user.click(fullSunPill)

      // Should only show Tomato (vegetable + full sun)
      expect(screen.getByText('Beefsteak Tomato')).toBeInTheDocument()

      // Should NOT show Lettuce (vegetable but partial sun)
      expect(screen.queryByText('Butterhead Lettuce')).not.toBeInTheDocument()

      // Should NOT show Basil (full sun but herb)
      expect(screen.queryByText('Basil')).not.toBeInTheDocument()

      // Should NOT show Hostas (not vegetable)
      expect(screen.queryByText('Hostas')).not.toBeInTheDocument()
    })

    it('can deselect sun filter by clicking again', async () => {
      const user = userEvent.setup()
      render(<CropLibrary crops={sunVarietyCrops} selectedCrop={null} onSelectCrop={vi.fn()} />)

      const fullSunPill = screen.getByRole('button', { name: /☀️ Full Sun/i })

      // Click to select
      await user.click(fullSunPill)
      expect(screen.getByText('Beefsteak Tomato')).toBeInTheDocument()
      expect(screen.queryByText('Butterhead Lettuce')).not.toBeInTheDocument()

      // Click again to deselect
      await user.click(fullSunPill)
      expect(screen.getByText('Beefsteak Tomato')).toBeInTheDocument()
      expect(screen.getByText('Butterhead Lettuce')).toBeInTheDocument()
      expect(screen.getByText('Hostas')).toBeInTheDocument()
    })
  })

  describe('Botanical Family Grouping (TODO-028)', () => {
    const familyTestCrops: Crop[] = [
      {
        id: 'lettuce',
        name: 'Butterhead Lettuce',
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
        name: 'Beefsteak Tomato',
        type: 'vegetable',
        botanical_family: 'Solanaceae',
        sun: 'full',
        days_to_maturity: 80,
        sfg_density: 1,
        planting_strategy: { start_window_start: 0, start_window_end: 4 },
        companions: { friends: [], enemies: [] }
      },
      {
        id: 'pepper',
        name: 'Bell Pepper',
        type: 'vegetable',
        botanical_family: 'Solanaceae',
        sun: 'full',
        days_to_maturity: 75,
        sfg_density: 1,
        planting_strategy: { start_window_start: 0, start_window_end: 4 },
        companions: { friends: [], enemies: [] }
      },
      {
        id: 'basil',
        name: 'Basil',
        type: 'herb',
        botanical_family: 'Lamiaceae',
        sun: 'full',
        days_to_maturity: 60,
        sfg_density: 4,
        planting_strategy: { start_window_start: 0, start_window_end: 4 },
        companions: { friends: [], enemies: [] }
      }
    ]

    it('groups crops by botanical family when "Vegetables" tab is selected', async () => {
      const user = userEvent.setup()
      render(<CropLibrary crops={familyTestCrops} selectedCrop={null} onSelectCrop={vi.fn()} />)

      const vegTab = screen.getByRole('button', { name: /^Vegetables$/i })
      await user.click(vegTab)

      // Should display family headers
      expect(screen.getByText(/Asteraceae/i)).toBeInTheDocument()
      expect(screen.getByText(/Solanaceae/i)).toBeInTheDocument()
    })

    it('displays crops under correct family headers', async () => {
      const user = userEvent.setup()
      render(<CropLibrary crops={familyTestCrops} selectedCrop={null} onSelectCrop={vi.fn()} />)

      const vegTab = screen.getByRole('button', { name: /^Vegetables$/i })
      await user.click(vegTab)

      // Verify Asteraceae group contains Lettuce
      const asteraceaeSection = screen.getByText(/Asteraceae/i).closest('[data-testid*="family-group"]')
      expect(asteraceaeSection).toBeInTheDocument()

      // Verify Solanaceae group contains Tomato and Pepper
      const solanaceaeSection = screen.getByText(/Solanaceae/i).closest('[data-testid*="family-group"]')
      expect(solanaceaeSection).toBeInTheDocument()
    })

    it('does not group when "All" tab is selected', () => {
      render(<CropLibrary crops={familyTestCrops} selectedCrop={null} onSelectCrop={vi.fn()} />)

      // Family headers should NOT appear on All tab
      expect(screen.queryByText(/Asteraceae/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Solanaceae/i)).not.toBeInTheDocument()

      // But crops should still be visible
      expect(screen.getByText('Butterhead Lettuce')).toBeInTheDocument()
      expect(screen.getByText('Beefsteak Tomato')).toBeInTheDocument()
    })

    it('does not group when "Herbs" tab is selected', async () => {
      const user = userEvent.setup()
      render(<CropLibrary crops={familyTestCrops} selectedCrop={null} onSelectCrop={vi.fn()} />)

      const herbTab = screen.getByRole('button', { name: /^Herbs$/i })
      await user.click(herbTab)

      // Family headers should NOT appear on Herbs tab
      expect(screen.queryByText(/Lamiaceae/i)).not.toBeInTheDocument()

      // But herb should be visible
      expect(screen.getByText('Basil')).toBeInTheDocument()
    })

    it('does not group when "Flowers" tab is selected', async () => {
      const user = userEvent.setup()
      const cropsWithFlower: Crop[] = [
        ...familyTestCrops,
        {
          id: 'marigold',
          name: 'Marigold',
          type: 'flower',
          botanical_family: 'Asteraceae',
          sun: 'full',
          days_to_maturity: 50,
          sfg_density: 4,
          planting_strategy: { start_window_start: 0, start_window_end: 4 },
          companions: { friends: [], enemies: [] }
        }
      ]

      render(<CropLibrary crops={cropsWithFlower} selectedCrop={null} onSelectCrop={vi.fn()} />)

      const flowerTab = screen.getByRole('button', { name: /^Flowers$/i })
      await user.click(flowerTab)

      // Family headers should NOT appear on Flowers tab
      expect(screen.queryByText(/Asteraceae/i)).not.toBeInTheDocument()

      // But flower should be visible
      expect(screen.getByText('Marigold')).toBeInTheDocument()
    })
  })

  describe('Enhanced Search (TODO-028)', () => {
    const searchTestCrops: Crop[] = [
      {
        id: 'lettuce',
        name: 'Butterhead Lettuce',
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
        name: 'Beefsteak Tomato',
        type: 'vegetable',
        botanical_family: 'Solanaceae',
        sun: 'full',
        days_to_maturity: 80,
        sfg_density: 1,
        planting_strategy: { start_window_start: 0, start_window_end: 4 },
        companions: { friends: [], enemies: [] }
      },
      {
        id: 'pepper',
        name: 'Bell Pepper',
        type: 'vegetable',
        botanical_family: 'Solanaceae',
        sun: 'full',
        days_to_maturity: 75,
        sfg_density: 1,
        planting_strategy: { start_window_start: 0, start_window_end: 4 },
        companions: { friends: [], enemies: [] }
      },
      {
        id: 'eggplant',
        name: 'Eggplant',
        type: 'vegetable',
        botanical_family: 'Solanaceae',
        sun: 'full',
        days_to_maturity: 85,
        sfg_density: 1,
        planting_strategy: { start_window_start: 0, start_window_end: 4 },
        companions: { friends: [], enemies: [] }
      }
    ]

    it('searches by botanical family name (e.g., "Solanaceae" shows tomatoes)', async () => {
      const user = userEvent.setup()
      render(<CropLibrary crops={searchTestCrops} selectedCrop={null} onSelectCrop={vi.fn()} />)

      const searchInput = screen.getByPlaceholderText(/search crops/i)
      await user.type(searchInput, 'Solanaceae')

      // Should show all Solanaceae crops
      expect(screen.getByText('Beefsteak Tomato')).toBeInTheDocument()
      expect(screen.getByText('Bell Pepper')).toBeInTheDocument()
      expect(screen.getByText('Eggplant')).toBeInTheDocument()

      // Should NOT show Asteraceae crops
      expect(screen.queryByText('Butterhead Lettuce')).not.toBeInTheDocument()
    })

    it('still matches crop names (existing functionality)', async () => {
      const user = userEvent.setup()
      render(<CropLibrary crops={searchTestCrops} selectedCrop={null} onSelectCrop={vi.fn()} />)

      const searchInput = screen.getByPlaceholderText(/search crops/i)
      await user.type(searchInput, 'pepper')

      // Should show Bell Pepper
      expect(screen.getByText('Bell Pepper')).toBeInTheDocument()

      // Should NOT show other crops
      expect(screen.queryByText('Beefsteak Tomato')).not.toBeInTheDocument()
      expect(screen.queryByText('Butterhead Lettuce')).not.toBeInTheDocument()
    })

    it('search is case insensitive for botanical family', async () => {
      const user = userEvent.setup()
      render(<CropLibrary crops={searchTestCrops} selectedCrop={null} onSelectCrop={vi.fn()} />)

      const searchInput = screen.getByPlaceholderText(/search crops/i)
      await user.type(searchInput, 'solanaceae')

      // Should show all Solanaceae crops (case insensitive)
      expect(screen.getByText('Beefsteak Tomato')).toBeInTheDocument()
      expect(screen.getByText('Bell Pepper')).toBeInTheDocument()
      expect(screen.getByText('Eggplant')).toBeInTheDocument()
    })

    it('searches by partial botanical family name', async () => {
      const user = userEvent.setup()
      render(<CropLibrary crops={searchTestCrops} selectedCrop={null} onSelectCrop={vi.fn()} />)

      const searchInput = screen.getByPlaceholderText(/search crops/i)
      await user.type(searchInput, 'Solan')

      // Should show all Solanaceae crops
      expect(screen.getByText('Beefsteak Tomato')).toBeInTheDocument()
      expect(screen.getByText('Bell Pepper')).toBeInTheDocument()
      expect(screen.getByText('Eggplant')).toBeInTheDocument()
    })
  })

  describe('Don\'t Like Button', () => {
    it('displays dislike button for each crop', () => {
      render(
        <CropLibrary
          crops={sampleCrops}
          selectedCrop={null}
          onSelectCrop={vi.fn()}
          dislikedCropIds={[]}
          onToggleDislikedCrop={vi.fn()}
        />
      )

      // Should have a dislike button for each crop
      const dislikeButtons = screen.getAllByRole('button', { name: /Mark .* as don't like/i })
      expect(dislikeButtons).toHaveLength(3)
    })

    it('shows filled icon for disliked crops', () => {
      render(
        <CropLibrary
          crops={sampleCrops}
          selectedCrop={null}
          onSelectCrop={vi.fn()}
          dislikedCropIds={['tomato']}
          onToggleDislikedCrop={vi.fn()}
        />
      )

      // Tomato should have filled dislike button
      const tomatoDislikeBtn = screen.getByRole('button', { name: /Unmark Tomato as don't like/i })
      expect(tomatoDislikeBtn).toBeInTheDocument()

      // Others should have outline button
      const lettuceDislikeBtn = screen.getByRole('button', { name: /Mark Lettuce as don't like/i })
      expect(lettuceDislikeBtn).toBeInTheDocument()
    })

    it('calls onToggleDislikedCrop when dislike button is clicked', async () => {
      const user = userEvent.setup()
      const handleToggle = vi.fn()

      render(
        <CropLibrary
          crops={sampleCrops}
          selectedCrop={null}
          onSelectCrop={vi.fn()}
          dislikedCropIds={[]}
          onToggleDislikedCrop={handleToggle}
        />
      )

      const lettuceDislikeBtn = screen.getByRole('button', { name: /Mark Lettuce as don't like/i })
      await user.click(lettuceDislikeBtn)

      expect(handleToggle).toHaveBeenCalledWith('lettuce')
    })

    it('does not show dislike buttons when onToggleDislikedCrop is not provided', () => {
      render(
        <CropLibrary
          crops={sampleCrops}
          selectedCrop={null}
          onSelectCrop={vi.fn()}
        />
      )

      // Should not have any dislike buttons
      const dislikeButtons = screen.queryAllByRole('button', { name: /don't like/i })
      expect(dislikeButtons).toHaveLength(0)
    })
  })
})
