/**
 * Split Brain Bug Regression Test (TODO-012)
 *
 * This test verifies that Settings changes persist correctly.
 * The "Split Brain" bug occurred when useLayoutManager and App.tsx
 * both called useProfiles() independently, creating two different
 * default profiles with different UUIDs.
 *
 * FIX: useLayoutManager now accepts defaultProfileId as a parameter
 * instead of calling useProfiles() internally.
 */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import App from '../App'
import { GardenProvider } from '../context/GardenContext'

// Helper to render App with GardenProvider
function renderApp() {
  return render(
    <GardenProvider>
      <App />
    </GardenProvider>
  )
}

describe('Settings Persistence - Split Brain Bug Regression (TODO-012)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('CRITICAL: Settings persist when using actual App component', async () => {
    const user = userEvent.setup()

    // Render the actual App component
    renderApp()

    // Wait for app to load
    await waitFor(() => {
      expect(screen.getByText('HortiLogic')).toBeInTheDocument()
    })

    // Step 1: Open Settings
    const settingsButton = screen.getByTitle('Settings')
    await user.click(settingsButton)

    // Verify modal opened
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Step 2: Change hardiness zone from default (5b) to 10a
    const zoneInput = screen.getByLabelText(/hardiness zone/i) as HTMLInputElement
    expect(zoneInput.value).toBe('5b') // Default value

    await user.clear(zoneInput)
    await user.type(zoneInput, '10a')
    expect(zoneInput.value).toBe('10a')

    // Step 3: Click Save
    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    // Verify modal closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    // Step 4: Reopen Settings
    await user.click(settingsButton)

    // Verify modal reopened
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Step 5: CRITICAL TEST - Zone should still be 10a (not reverted to 5b)
    // This is where the Split Brain bug manifested: values reverted to defaults
    const zoneInputAfterReopen = screen.getByLabelText(/hardiness zone/i) as HTMLInputElement
    expect(zoneInputAfterReopen.value).toBe('10a')
  })

  it('CRITICAL: Location field persists correctly in actual App', async () => {
    const user = userEvent.setup()
    renderApp()

    await waitFor(() => {
      expect(screen.getByText('HortiLogic')).toBeInTheDocument()
    })

    // Open Settings
    await user.click(screen.getByTitle('Settings'))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Set location
    const locationInput = screen.getByLabelText(/location/i)
    await user.type(locationInput, 'Escondido, CA')

    // Save
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    // Reopen and verify
    await user.click(screen.getByTitle('Settings'))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    const locationInputAfterReopen = screen.getByLabelText(/location/i) as HTMLInputElement
    expect(locationInputAfterReopen.value).toBe('Escondido, CA')
  })

  it('CRITICAL: Frost dates persist correctly in actual App', async () => {
    const user = userEvent.setup()
    renderApp()

    await waitFor(() => {
      expect(screen.getByText('HortiLogic')).toBeInTheDocument()
    })

    // Open Settings
    await user.click(screen.getByTitle('Settings'))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Change frost dates
    const { fireEvent } = await import('@testing-library/react')
    const lastFrostInput = screen.getByLabelText(/last frost date/i) as HTMLInputElement
    fireEvent.change(lastFrostInput, { target: { value: '2026-01-15' } })

    const firstFrostInput = screen.getByLabelText(/first frost date/i) as HTMLInputElement
    fireEvent.change(firstFrostInput, { target: { value: '2026-12-01' } })

    // Save
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    // Reopen and verify
    await user.click(screen.getByTitle('Settings'))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    const lastFrostAfter = screen.getByLabelText(/last frost date/i) as HTMLInputElement
    const firstFrostAfter = screen.getByLabelText(/first frost date/i) as HTMLInputElement
    expect(lastFrostAfter.value).toBe('2026-01-15')
    expect(firstFrostAfter.value).toBe('2026-12-01')
  })
})
