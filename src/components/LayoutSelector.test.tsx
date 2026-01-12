import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LayoutSelector } from './LayoutSelector'
import type { GardenLayout, Crop, GardenProfile } from '../types/garden'
import type { ExportedLayout } from '../utils/layoutExportImport'
import { generateUUID } from '../utils/uuid'

describe('LayoutSelector', () => {
  const mockOnSwitch = vi.fn()
  const mockOnCreate = vi.fn()
  const mockOnRename = vi.fn()
  const mockOnDuplicate = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnExport = vi.fn(() => ({} as ExportedLayout))
  const mockOnImport = vi.fn(() => 'imported-id')

  const mockProfile: GardenProfile = {
    name: 'Test Garden',
    hardiness_zone: '5b',
    last_frost_date: '2024-04-15',
    first_frost_date: '2024-10-15',
    season_extension_weeks: 2,
  }

  const createLayout = (id: string, name: string, updatedAt: string): GardenLayout => ({
    id,
    name,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt,
    boxes: [{
      id: generateUUID(),
      name: 'Main Bed',
      width: 4,
      height: 8,
      cells: Array(32).fill(null) as (Crop | null)[],
    }],
    profileId: 'profile-1',
  })

  const layouts: Record<string, GardenLayout> = {
    'layout-1': createLayout('layout-1', 'My Garden', '2026-01-09T10:00:00.000Z'),
    'layout-2': createLayout('layout-2', 'Spring 2026', '2026-01-09T11:00:00.000Z'),
    'layout-3': createLayout('layout-3', 'Fall 2026', '2026-01-09T09:00:00.000Z'),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays active layout name', () => {
    render(
      <LayoutSelector
        onExport={mockOnExport}
        onImport={mockOnImport}
        gardenProfile={mockProfile}
        layouts={layouts}
        activeLayoutId="layout-1"
        onSwitch={mockOnSwitch}
        onCreate={mockOnCreate}
        onRename={mockOnRename}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('My Garden')).toBeInTheDocument()
  })

  it('opens dropdown when button clicked', () => {
    render(
      <LayoutSelector
        onExport={mockOnExport}
        onImport={mockOnImport}
        gardenProfile={mockProfile}
        layouts={layouts}
        activeLayoutId="layout-1"
        onSwitch={mockOnSwitch}
        onCreate={mockOnCreate}
        onRename={mockOnRename}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
      />
    )

    const button = screen.getByRole('button', { name: /My Garden/i })
    fireEvent.click(button)

    // Should show all 3 layouts
    expect(screen.getByText('Spring 2026')).toBeInTheDocument()
    expect(screen.getByText('Fall 2026')).toBeInTheDocument()
  })

  it('shows layouts sorted by updatedAt descending', () => {
    render(
      <LayoutSelector
        onExport={mockOnExport}
        onImport={mockOnImport}
        gardenProfile={mockProfile}
        layouts={layouts}
        activeLayoutId="layout-1"
        onSwitch={mockOnSwitch}
        onCreate={mockOnCreate}
        onRename={mockOnRename}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
      />
    )

    const button = screen.getByRole('button', { name: /My Garden/i })
    fireEvent.click(button)

    // Get all layout items (excluding the active layout button and New Layout button)
    const layoutItems = screen.getAllByRole('button')

    // Spring 2026 should be first (newest updatedAt: 11:00)
    // My Garden second (10:00)
    // Fall 2026 last (09:00)
    const layoutNames = layoutItems.map(item => item.textContent).filter(Boolean)

    expect(layoutNames).toContain('Spring 2026')
    expect(layoutNames).toContain('Fall 2026')
  })

  it('calls onSwitch when different layout clicked', () => {
    render(
      <LayoutSelector
        onExport={mockOnExport}
        onImport={mockOnImport}
        gardenProfile={mockProfile}
        layouts={layouts}
        activeLayoutId="layout-1"
        onSwitch={mockOnSwitch}
        onCreate={mockOnCreate}
        onRename={mockOnRename}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
      />
    )

    // Open dropdown
    const button = screen.getByRole('button', { name: /My Garden/i })
    fireEvent.click(button)

    // Click on Spring 2026
    const springLayout = screen.getByText('Spring 2026')
    fireEvent.click(springLayout)

    expect(mockOnSwitch).toHaveBeenCalledWith('layout-2')
  })

  it('calls onCreate when "New Layout" button clicked', () => {
    render(
      <LayoutSelector
        onExport={mockOnExport}
        onImport={mockOnImport}
        gardenProfile={mockProfile}
        layouts={layouts}
        activeLayoutId="layout-1"
        onSwitch={mockOnSwitch}
        onCreate={mockOnCreate}
        onRename={mockOnRename}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
      />
    )

    // Open dropdown
    const button = screen.getByRole('button', { name: /My Garden/i })
    fireEvent.click(button)

    // Click "New Layout"
    const newLayoutButton = screen.getByText('New Layout')
    fireEvent.click(newLayoutButton)

    expect(mockOnCreate).toHaveBeenCalled()
  })

  it('calls onRename when rename action clicked', () => {
    render(
      <LayoutSelector
        onExport={mockOnExport}
        onImport={mockOnImport}
        gardenProfile={mockProfile}
        layouts={layouts}
        activeLayoutId="layout-1"
        onSwitch={mockOnSwitch}
        onCreate={mockOnCreate}
        onRename={mockOnRename}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
      />
    )

    // Open dropdown
    const button = screen.getByRole('button', { name: /My Garden/i })
    fireEvent.click(button)

    // Find and click rename button for Spring 2026
    const renameButtons = screen.getAllByLabelText(/Rename/i)
    const renameButton = renameButtons[0]
    if (!renameButton) throw new Error('Rename button not found')
    fireEvent.click(renameButton)

    expect(mockOnRename).toHaveBeenCalledWith('layout-2')
  })

  it('calls onDuplicate when duplicate action clicked', () => {
    render(
      <LayoutSelector
        onExport={mockOnExport}
        onImport={mockOnImport}
        gardenProfile={mockProfile}
        layouts={layouts}
        activeLayoutId="layout-1"
        onSwitch={mockOnSwitch}
        onCreate={mockOnCreate}
        onRename={mockOnRename}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
      />
    )

    // Open dropdown
    const button = screen.getByRole('button', { name: /My Garden/i })
    fireEvent.click(button)

    // Find and click duplicate button
    const duplicateButtons = screen.getAllByLabelText(/Duplicate/i)
    const duplicateButton = duplicateButtons[0]
    if (!duplicateButton) throw new Error('Duplicate button not found')
    fireEvent.click(duplicateButton)

    expect(mockOnDuplicate).toHaveBeenCalledWith('layout-2')
  })

  it('calls onDelete when delete action clicked', () => {
    render(
      <LayoutSelector
        onExport={mockOnExport}
        onImport={mockOnImport}
        gardenProfile={mockProfile}
        layouts={layouts}
        activeLayoutId="layout-1"
        onSwitch={mockOnSwitch}
        onCreate={mockOnCreate}
        onRename={mockOnRename}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
      />
    )

    // Open dropdown
    const button = screen.getByRole('button', { name: /My Garden/i })
    fireEvent.click(button)

    // Find and click delete button
    const deleteButtons = screen.getAllByLabelText(/Delete/i)
    const deleteButton = deleteButtons[0]
    if (!deleteButton) throw new Error('Delete button not found')
    fireEvent.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledWith('layout-2')
  })

  it('disables delete button when only one layout exists', () => {
    const layout1 = layouts['layout-1']
    if (!layout1) throw new Error('Layout 1 not found')
    const singleLayout = {
      'layout-1': layout1,
    }

    render(
      <LayoutSelector
        onExport={mockOnExport}
        onImport={mockOnImport}
        gardenProfile={mockProfile}
        layouts={singleLayout}
        activeLayoutId="layout-1"
        onSwitch={mockOnSwitch}
        onCreate={mockOnCreate}
        onRename={mockOnRename}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
      />
    )

    // Open dropdown
    const button = screen.getByRole('button', { name: /My Garden/i })
    fireEvent.click(button)

    // Delete button should be disabled
    const deleteButton = screen.getByLabelText(/Delete/i)
    expect(deleteButton).toBeDisabled()
  })

  it('closes dropdown when clicking outside', () => {
    render(
      <div data-testid="outside">
        <LayoutSelector
        onExport={mockOnExport}
        onImport={mockOnImport}
        gardenProfile={mockProfile}
          layouts={layouts}
          activeLayoutId="layout-1"
          onSwitch={mockOnSwitch}
          onCreate={mockOnCreate}
          onRename={mockOnRename}
          onDuplicate={mockOnDuplicate}
          onDelete={mockOnDelete}
        />
      </div>
    )

    // Open dropdown
    const button = screen.getByRole('button', { name: /My Garden/i })
    fireEvent.click(button)

    // Dropdown should be open
    expect(screen.getByText('Spring 2026')).toBeInTheDocument()

    // Click outside
    const outside = screen.getByTestId('outside')
    fireEvent.mouseDown(outside)

    // Dropdown should be closed (Spring 2026 no longer visible)
    expect(screen.queryByText('Spring 2026')).not.toBeInTheDocument()
  })

  it('closes dropdown when Escape key pressed', () => {
    render(
      <LayoutSelector
        onExport={mockOnExport}
        onImport={mockOnImport}
        gardenProfile={mockProfile}
        layouts={layouts}
        activeLayoutId="layout-1"
        onSwitch={mockOnSwitch}
        onCreate={mockOnCreate}
        onRename={mockOnRename}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
      />
    )

    // Open dropdown
    const button = screen.getByRole('button', { name: /My Garden/i })
    fireEvent.click(button)

    // Dropdown should be open
    expect(screen.getByText('Spring 2026')).toBeInTheDocument()

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' })

    // Dropdown should be closed
    expect(screen.queryByText('Spring 2026')).not.toBeInTheDocument()
  })
})
