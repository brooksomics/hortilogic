import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { SettingsModal } from './SettingsModal'
import type { GardenProfile } from '../types/garden'

describe('SettingsModal', () => {
  const mockProfile: GardenProfile = {
    name: 'My Garden',
    hardiness_zone: '5b',
    last_frost_date: '2024-05-15',
    first_frost_date: '2024-10-15',
    season_extension_weeks: 0
  }

  const mockOnSave = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders modal when open', () => {
    render(
      <SettingsModal
        isOpen={true}
        profile={mockProfile}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Garden Settings')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <SettingsModal
        isOpen={false}
        profile={mockProfile}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders all input fields with current values', () => {
    render(
      <SettingsModal
        isOpen={true}
        profile={mockProfile}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    // Garden name input
    const nameInput = screen.getByLabelText(/garden name/i)
    expect(nameInput).toHaveValue('My Garden')

    // Hardiness zone input
    const zoneInput = screen.getByLabelText(/hardiness zone/i)
    expect(zoneInput).toHaveValue('5b')

    // Last frost date input
    const lastFrostInput = screen.getByLabelText(/last frost date/i)
    expect(lastFrostInput).toHaveValue('2024-05-15')

    // First frost date input
    const firstFrostInput = screen.getByLabelText(/first frost date/i)
    expect(firstFrostInput).toHaveValue('2024-10-15')

    // Season extension input
    const extensionInput = screen.getByLabelText(/season extension/i)
    expect(extensionInput).toHaveValue(0)
  })

  it('calls onSave with updated values when save is clicked', async () => {
    const user = userEvent.setup()
    render(
      <SettingsModal
        isOpen={true}
        profile={mockProfile}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    // Change garden name
    const nameInput = screen.getByLabelText(/garden name/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Backyard Bed')

    // Change last frost date
    const lastFrostInput = screen.getByLabelText(/last frost date/i)
    await user.clear(lastFrostInput)
    await user.type(lastFrostInput, '2024-01-15')

    // Change season extension
    const extensionInput = screen.getByLabelText(/season extension/i)
    await user.clear(extensionInput)
    await user.type(extensionInput, '2')

    // Click save
    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    expect(mockOnSave).toHaveBeenCalledWith({
      name: 'Backyard Bed',
      hardiness_zone: '5b',
      last_frost_date: '2024-01-15',
      first_frost_date: '2024-10-15',
      season_extension_weeks: 2
    })
  })

  it('calls onClose when cancel is clicked', async () => {
    const user = userEvent.setup()
    render(
      <SettingsModal
        isOpen={true}
        profile={mockProfile}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalled()
    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('shows validation error when last frost is after first frost', async () => {
    const user = userEvent.setup()
    render(
      <SettingsModal
        isOpen={true}
        profile={mockProfile}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    // Set last frost to be after first frost (invalid)
    const lastFrostInput = screen.getByLabelText(/last frost date/i)
    await user.clear(lastFrostInput)
    await user.type(lastFrostInput, '2024-11-01')

    // Try to save
    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    // Should show error and not call onSave
    expect(screen.getByText(/last frost date must be before first frost date/i)).toBeInTheDocument()
    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('validates season extension is between 0 and 8', async () => {
    const user = userEvent.setup()
    render(
      <SettingsModal
        isOpen={true}
        profile={mockProfile}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    // Try to set season extension to 10 (invalid)
    const extensionInput = screen.getByLabelText(/season extension/i)
    await user.clear(extensionInput)
    await user.type(extensionInput, '10')

    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    // Should show error
    expect(screen.getByText(/season extension must be between 0 and 8 weeks/i)).toBeInTheDocument()
    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('allows closing modal with escape key', async () => {
    const user = userEvent.setup()
    render(
      <SettingsModal
        isOpen={true}
        profile={mockProfile}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    await user.keyboard('{Escape}')

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('has accessible form labels and inputs', () => {
    render(
      <SettingsModal
        isOpen={true}
        profile={mockProfile}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    // All inputs should be properly labeled
    expect(screen.getByLabelText(/garden name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/hardiness zone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last frost date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/first frost date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/season extension/i)).toBeInTheDocument()
  })
})
