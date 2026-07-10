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
 *
 * PERF NOTE (hortilogic-tys): These tests previously took 15-25s each
 * locally (~33s on shared CI runners). Two costs were removed:
 * 1. Unscoped screen.getByLabelText()/getByRole() queries scanned the
 *    entire App DOM (garden grid, crop library) computing accessible
 *    names — ~8s per query in jsdom. Queries are now scoped to the
 *    settings dialog via within(dialog), which is also more precise.
 * 2. userEvent.type()/clear() drove per-keystroke event sequences
 *    through the full App DOM. Keystroke granularity is not what is
 *    under test — persistence of committed input values is — so
 *    fireEvent.change/fireEvent.click are semantically equivalent.
 */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react'
import App from '../App'
import { GardenProvider } from '../context/GardenProvider'

// Helper to render App with GardenProvider
function renderApp() {
  return render(
    <GardenProvider>
      <App />
    </GardenProvider>
  )
}

// Wait for the settings dialog to appear and return it for scoped queries
async function openedDialog(): Promise<HTMLElement> {
  await waitFor(() => {
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
  return screen.getByRole('dialog')
}

describe('Settings Persistence - Split Brain Bug Regression (TODO-012)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('CRITICAL: Settings persist when using actual App component', async () => {
    // Render the actual App component
    renderApp()

    // Wait for app to load
    await waitFor(() => {
      expect(screen.getByText('HortiLogic')).toBeInTheDocument()
    })

    // Step 1: Open Settings
    const settingsButton = screen.getByTitle('Settings')
    fireEvent.click(settingsButton)
    const dialog = await openedDialog()

    // Step 2: Change hardiness zone from default (5b) to 10a
    const zoneInput = within(dialog).getByLabelText(/hardiness zone/i) as HTMLInputElement
    expect(zoneInput.value).toBe('5b') // Default value

    fireEvent.change(zoneInput, { target: { value: '10a' } })
    expect(zoneInput.value).toBe('10a')

    // Step 3: Click Save
    fireEvent.click(within(dialog).getByRole('button', { name: /save/i }))

    // Verify modal closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    // Step 4: Reopen Settings
    fireEvent.click(settingsButton)
    const reopenedDialog = await openedDialog()

    // Step 5: CRITICAL TEST - Zone should still be 10a (not reverted to 5b)
    // This is where the Split Brain bug manifested: values reverted to defaults
    const zoneInputAfterReopen = within(reopenedDialog).getByLabelText(
      /hardiness zone/i
    ) as HTMLInputElement
    expect(zoneInputAfterReopen.value).toBe('10a')
  }, 30000)

  it('CRITICAL: Location field persists correctly in actual App', async () => {
    renderApp()

    await waitFor(() => {
      expect(screen.getByText('HortiLogic')).toBeInTheDocument()
    })

    // Open Settings
    fireEvent.click(screen.getByTitle('Settings'))
    const dialog = await openedDialog()

    // Set location
    const locationInput = within(dialog).getByLabelText(/location/i) as HTMLInputElement
    fireEvent.change(locationInput, { target: { value: 'Escondido, CA' } })
    expect(locationInput.value).toBe('Escondido, CA')

    // Save
    fireEvent.click(within(dialog).getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    // Reopen and verify
    fireEvent.click(screen.getByTitle('Settings'))
    const reopenedDialog = await openedDialog()

    const locationInputAfterReopen = within(reopenedDialog).getByLabelText(
      /location/i
    ) as HTMLInputElement
    expect(locationInputAfterReopen.value).toBe('Escondido, CA')
  }, 30000)

  it('CRITICAL: Frost dates persist correctly in actual App', async () => {
    renderApp()

    await waitFor(() => {
      expect(screen.getByText('HortiLogic')).toBeInTheDocument()
    })

    // Open Settings
    fireEvent.click(screen.getByTitle('Settings'))
    const dialog = await openedDialog()

    // Change frost dates
    const lastFrostInput = within(dialog).getByLabelText(/last frost date/i) as HTMLInputElement
    fireEvent.change(lastFrostInput, { target: { value: '2026-01-15' } })

    const firstFrostInput = within(dialog).getByLabelText(/first frost date/i) as HTMLInputElement
    fireEvent.change(firstFrostInput, { target: { value: '2026-12-01' } })

    // Save
    fireEvent.click(within(dialog).getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    // Reopen and verify
    fireEvent.click(screen.getByTitle('Settings'))
    const reopenedDialog = await openedDialog()

    const lastFrostAfter = within(reopenedDialog).getByLabelText(
      /last frost date/i
    ) as HTMLInputElement
    const firstFrostAfter = within(reopenedDialog).getByLabelText(
      /first frost date/i
    ) as HTMLInputElement
    expect(lastFrostAfter.value).toBe('2026-01-15')
    expect(firstFrostAfter.value).toBe('2026-12-01')
  }, 30000)
})
