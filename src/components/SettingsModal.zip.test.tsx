import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { SettingsModal } from './SettingsModal'
import type { GardenProfile } from '../types/garden'

describe('SettingsModal - ZIP Code Lookup', () => {
  const mockProfile: GardenProfile = {
    name: 'My Garden',
    hardiness_zone: '5b',
    last_frost_date: '2026-05-15',
    first_frost_date: '2026-10-15',
    season_extension_weeks: 0,
  }

  const mockOnSave = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders ZIP code input field', () => {
    render(
      <SettingsModal
        isOpen={true}
        profile={mockProfile}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    const zipInput = screen.getByLabelText(/zip code/i)
    expect(zipInput).toBeInTheDocument()
  })

  it('renders Look Up button', () => {
    render(
      <SettingsModal
        isOpen={true}
        profile={mockProfile}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByRole('button', { name: /look up/i })).toBeInTheDocument()
  })

  it('auto-fills zone and frost dates when valid ZIP is looked up', async () => {
    const user = userEvent.setup()
    render(
      <SettingsModal
        isOpen={true}
        profile={mockProfile}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    const zipInput = screen.getByLabelText(/zip code/i)
    await user.clear(zipInput)
    await user.type(zipInput, '80202') // Denver, CO - zone 5b

    const lookUpBtn = screen.getByRole('button', { name: /look up/i })
    await user.click(lookUpBtn)

    // Zone should be auto-filled
    const zoneInput = screen.getByLabelText(/hardiness zone/i)
    expect(zoneInput).toHaveValue('5b')

    // Frost dates should be auto-filled (zone 5b: 04-10 and 10-20)
    const year = String(new Date().getFullYear())
    const lastFrostInput = screen.getByLabelText(/last frost date/i)
    expect(lastFrostInput).toHaveValue(`${year}-04-10`)

    const firstFrostInput = screen.getByLabelText(/first frost date/i)
    expect(firstFrostInput).toHaveValue(`${year}-10-20`)
  })

  it('shows error for invalid ZIP code', async () => {
    const user = userEvent.setup()
    render(
      <SettingsModal
        isOpen={true}
        profile={mockProfile}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    const zipInput = screen.getByLabelText(/zip code/i)
    await user.clear(zipInput)
    await user.type(zipInput, '00099')

    const lookUpBtn = screen.getByRole('button', { name: /look up/i })
    await user.click(lookUpBtn)

    expect(screen.getByText(/zip code not found/i)).toBeInTheDocument()
  })

  it('shows error for too-short ZIP code', async () => {
    const user = userEvent.setup()
    render(
      <SettingsModal
        isOpen={true}
        profile={mockProfile}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    const zipInput = screen.getByLabelText(/zip code/i)
    await user.clear(zipInput)
    await user.type(zipInput, '123')

    const lookUpBtn = screen.getByRole('button', { name: /look up/i })
    await user.click(lookUpBtn)

    expect(screen.getByText(/enter a 5-digit zip code/i)).toBeInTheDocument()
  })

  it('saves zip_code in profile on submit', async () => {
    const user = userEvent.setup()
    render(
      <SettingsModal
        isOpen={true}
        profile={mockProfile}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    const zipInput = screen.getByLabelText(/zip code/i)
    await user.type(zipInput, '80202')

    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({ zip_code: '80202' })
    )
  })

  it('preserves existing zip_code from profile', () => {
    const profileWithZip: GardenProfile = {
      ...mockProfile,
      zip_code: '02101',
    }

    render(
      <SettingsModal
        isOpen={true}
        profile={profileWithZip}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    const zipInput = screen.getByLabelText(/zip code/i)
    expect(zipInput).toHaveValue('02101')
  })

  it('allows manual override after auto-fill', async () => {
    const user = userEvent.setup()
    render(
      <SettingsModal
        isOpen={true}
        profile={mockProfile}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    // Auto-fill from ZIP
    const zipInput = screen.getByLabelText(/zip code/i)
    await user.type(zipInput, '80202')
    const lookUpBtn = screen.getByRole('button', { name: /look up/i })
    await user.click(lookUpBtn)

    // Manually override the zone
    const zoneInput = screen.getByLabelText(/hardiness zone/i)
    await user.clear(zoneInput)
    await user.type(zoneInput, '6a')

    // Save should have the manually overridden zone
    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({ hardiness_zone: '6a' })
    )
  })
})
