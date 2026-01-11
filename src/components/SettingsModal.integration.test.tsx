/**
 * Integration test for Settings persistence bug (TODO-012)
 *
 * Tests the full flow: open Settings → change values → save → reopen → verify persistence
 */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { SettingsModal } from './SettingsModal'
import { useProfiles } from '../hooks/useProfiles'
import { useGardenInteractions } from '../hooks/useGardenInteractions'
import type { GardenProfile, GardenLayout, Crop } from '../types/garden'
import { generateUUID } from '../utils/uuid'

/**
 * Test harness component that integrates all the hooks together
 * to simulate the real App.tsx behavior
 */
function SettingsTestHarness() {
  const { getProfile, updateProfile, defaultProfileId } = useProfiles()

  // Mock active layout (similar to App.tsx)
  const activeLayout: GardenLayout = {
    id: 'test-layout-id',
    name: 'Test Layout',
    profileId: defaultProfileId,
    boxes: [{
      id: generateUUID(),
      name: 'Main Bed',
      width: 4,
      height: 8,
      cells: Array(32).fill(null) as (Crop | null)[],
    }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const gardenProfile = getProfile(activeLayout.profileId) || null

  const {
    isSettingsOpen,
    handleSettingsSave,
    handleSettingsClose,
    openSettings,
  } = useGardenInteractions({
    currentBed: activeLayout.boxes[0]?.cells || [],
    gardenProfile,
    activeLayout,
    setAllBoxes: () => {},
    plantCrop: () => {},
    removeCrop: () => {},
    updateProfile,
  })

  return (
    <div>
      <button onClick={openSettings} data-testid="open-settings-btn">
        Open Settings
      </button>
      {gardenProfile && (
        <SettingsModal
          isOpen={isSettingsOpen}
          profile={gardenProfile}
          onSave={handleSettingsSave}
          onClose={handleSettingsClose}
        />
      )}
      {/* Display current profile values for verification */}
      <div data-testid="current-zone">{gardenProfile?.hardiness_zone}</div>
      <div data-testid="current-location">{gardenProfile?.location || 'none'}</div>
      <div data-testid="current-target-date">{gardenProfile?.targetPlantingDate}</div>
    </div>
  )
}

describe('Settings Persistence Integration (TODO-012)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('RED: persists zone change for OLD profile (without location/targetPlantingDate)', async () => {
    const user = userEvent.setup()

    // Simulate OLD profile from before TODO-011 (no location or targetPlantingDate)
    const oldProfile: GardenProfile = {
      name: 'Old Garden',
      hardiness_zone: '5b',
      last_frost_date: '2026-05-15',
      first_frost_date: '2026-10-01',
      season_extension_weeks: 0,
      // Note: NO location or targetPlantingDate fields
    }

    const profileId = 'old-profile-id'
    const profileStorage = {
      version: 1,
      profiles: {
        [profileId]: oldProfile,
      },
    }

    // Seed localStorage with old profile
    localStorage.setItem('hortilogic:profiles', JSON.stringify(profileStorage))

    // Also need a layout that references this profile
    const layoutStorage = {
      version: 1,
      layouts: {
        'layout-1': {
          id: 'layout-1',
          name: 'My Layout',
          profileId: profileId,
          bed: Array(32).fill(null),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      activeLayoutId: 'layout-1',
    }
    localStorage.setItem('hortilogic:layouts', JSON.stringify(layoutStorage))

    // Render component
    render(<SettingsTestHarness />)

    // Verify initial zone is 5b
    expect(screen.getByTestId('current-zone')).toHaveTextContent('5b')

    // Open Settings
    await user.click(screen.getByTestId('open-settings-btn'))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Change zone to 10a
    const zoneInput = screen.getByLabelText(/hardiness zone/i) as HTMLInputElement
    expect(zoneInput.value).toBe('5b')
    await user.clear(zoneInput)
    await user.type(zoneInput, '10a')

    // Save
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    // Reopen Settings
    await user.click(screen.getByTestId('open-settings-btn'))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // CRITICAL: Zone should be 10a (bug would cause it to revert to 5b)
    const zoneInputAfterReopen = screen.getByLabelText(/hardiness zone/i) as HTMLInputElement
    expect(zoneInputAfterReopen.value).toBe('10a')
  })

  it('RED: persists zone change when Settings is saved and reopened', async () => {
    const user = userEvent.setup()

    // Render the integrated component
    render(<SettingsTestHarness />)

    // Verify initial state (default zone should be 5b)
    expect(screen.getByTestId('current-zone')).toHaveTextContent('5b')

    // Step 1: Open Settings modal
    const openBtn = screen.getByTestId('open-settings-btn')
    await user.click(openBtn)

    // Verify modal is open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Step 2: Change hardiness zone from 5b to 10a
    const zoneInput = screen.getByLabelText(/hardiness zone/i) as HTMLInputElement
    expect(zoneInput.value).toBe('5b')

    await user.clear(zoneInput)
    await user.type(zoneInput, '10a')
    expect(zoneInput.value).toBe('10a')

    // Step 3: Click Save
    const saveBtn = screen.getByRole('button', { name: /save/i })
    await user.click(saveBtn)

    // Verify modal closes
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    // Verify the displayed zone updated
    expect(screen.getByTestId('current-zone')).toHaveTextContent('10a')

    // Step 4: Reopen Settings modal
    await user.click(openBtn)

    // Verify modal reopened
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Step 5: CRITICAL TEST - Zone input should show 10a (not 5b)
    // This is where the bug manifests: values revert to defaults
    const zoneInputAfterReopen = screen.getByLabelText(/hardiness zone/i) as HTMLInputElement
    expect(zoneInputAfterReopen.value).toBe('10a') // Should be 10a, but bug causes it to show 5b
  })

  it('RED: persists location when Settings is saved and reopened', async () => {
    const user = userEvent.setup()
    render(<SettingsTestHarness />)

    // Initial location should be empty
    expect(screen.getByTestId('current-location')).toHaveTextContent('none')

    // Open Settings
    await user.click(screen.getByTestId('open-settings-btn'))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Change location
    const locationInput = screen.getByLabelText(/location/i) as HTMLInputElement
    await user.type(locationInput, 'Escondido, CA')
    expect(locationInput.value).toBe('Escondido, CA')

    // Save
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    // Verify location updated
    expect(screen.getByTestId('current-location')).toHaveTextContent('Escondido, CA')

    // Reopen Settings
    await user.click(screen.getByTestId('open-settings-btn'))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // CRITICAL TEST - Location should persist
    const locationInputAfterReopen = screen.getByLabelText(/location/i) as HTMLInputElement
    expect(locationInputAfterReopen.value).toBe('Escondido, CA')
  })

  it('RED: persists target planting date when Settings is saved and reopened', async () => {
    const user = userEvent.setup()
    render(<SettingsTestHarness />)

    // Open Settings
    await user.click(screen.getByTestId('open-settings-btn'))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Change target planting date to Feb 1, 2026
    // Note: userEvent.type() doesn't work well with date inputs, use fireEvent instead
    const targetDateInput = screen.getByLabelText(/target planting date/i) as HTMLInputElement
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.change(targetDateInput, { target: { value: '2026-02-01' } })
    expect(targetDateInput.value).toBe('2026-02-01')

    // Save
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    // Verify date updated
    expect(screen.getByTestId('current-target-date')).toHaveTextContent('2026-02-01')

    // Reopen Settings
    await user.click(screen.getByTestId('open-settings-btn'))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // CRITICAL TEST - Date should persist
    const targetDateInputAfterReopen = screen.getByLabelText(/target planting date/i) as HTMLInputElement
    expect(targetDateInputAfterReopen.value).toBe('2026-02-01')
  })

  it('RED: persists frost dates when Settings is saved and reopened', async () => {
    const user = userEvent.setup()
    render(<SettingsTestHarness />)

    // Open Settings
    await user.click(screen.getByTestId('open-settings-btn'))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Change last frost date
    const lastFrostInput = screen.getByLabelText(/last frost date/i) as HTMLInputElement
    await user.clear(lastFrostInput)
    await user.type(lastFrostInput, '2026-01-15')
    expect(lastFrostInput.value).toBe('2026-01-15')

    // Change first frost date
    const firstFrostInput = screen.getByLabelText(/first frost date/i) as HTMLInputElement
    await user.clear(firstFrostInput)
    await user.type(firstFrostInput, '2026-12-01')
    expect(firstFrostInput.value).toBe('2026-12-01')

    // Save
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    // Reopen Settings
    await user.click(screen.getByTestId('open-settings-btn'))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // CRITICAL TEST - Frost dates should persist
    const lastFrostInputAfterReopen = screen.getByLabelText(/last frost date/i) as HTMLInputElement
    const firstFrostInputAfterReopen = screen.getByLabelText(/first frost date/i) as HTMLInputElement
    expect(lastFrostInputAfterReopen.value).toBe('2026-01-15')
    expect(firstFrostInputAfterReopen.value).toBe('2026-12-01')
  })
})
