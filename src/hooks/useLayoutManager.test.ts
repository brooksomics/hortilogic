/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLayoutManager } from './useLayoutManager'
import type { Crop, GardenProfile } from '../types/garden'
import type { ExportedLayout } from '../utils/layoutExportImport'

// Test profile ID (simulates the ID from useProfiles hook)
const TEST_PROFILE_ID = 'test-profile-id'

// Sample crops for testing
const lettuce: Crop = {
  id: 'lettuce',
  name: 'Lettuce',
  sfg_density: 4,
  planting_strategy: { start_window_start: -4, start_window_end: 2 },
  companions: { friends: ['carrot'], enemies: [] },
}

const tomato: Crop = {
  id: 'tomato',
  name: 'Tomato',
  sfg_density: 1,
  planting_strategy: { start_window_start: 0, start_window_end: 4 },
  companions: { friends: [], enemies: ['carrot'] },
}

describe('useLayoutManager', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    localStorage.clear()
    vi.useRealTimers()
  })

  it('initializes with default layout named "My Garden"', () => {
    const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

    expect(result.current.layouts).toBeDefined()
    expect(Object.keys(result.current.layouts)).toHaveLength(1)

    const layoutIds = Object.keys(result.current.layouts)
    const layoutId = layoutIds[0]
    if (!layoutId) throw new Error('Layout ID not found')
    const defaultLayout = result.current.layouts[layoutId]

    expect(defaultLayout?.name).toBe('My Garden')
    expect(defaultLayout?.boxes).toHaveLength(1)
    expect(defaultLayout?.boxes[0]?.cells).toHaveLength(16)
    expect(defaultLayout?.boxes[0]?.cells.every((cell: Crop | null) => cell === null)).toBe(true)
  })

  it('sets activeLayoutId to the default layout', () => {
    const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

    expect(result.current.activeLayoutId).toBeTruthy()

    const activeLayout = result.current.layouts[result.current.activeLayoutId]
    expect(activeLayout).toBeDefined()
  })

  it('provides activeLayout object for convenience', () => {
    const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

    expect(result.current.activeLayout).toBeDefined()
    expect(result.current.activeLayout?.name).toBe('My Garden')
    expect(result.current.activeLayout?.id).toBe(result.current.activeLayoutId)
  })

  it('creates new blank layout with given name', () => {
    const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

    act(() => {
      result.current.createLayout('Spring 2026')
    })

    const layouts = Object.values(result.current.layouts)
    expect(layouts).toHaveLength(2)

    const springLayout = layouts.find((l) => l.name === 'Spring 2026')
    expect(springLayout).toBeDefined()
    expect(springLayout?.boxes).toHaveLength(1)
    expect(springLayout?.boxes[0]?.cells).toHaveLength(16)
    expect(springLayout?.boxes[0]?.cells.every((cell) => cell === null)).toBe(true)
  })

  it('switches to newly created layout automatically', () => {
    const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

    let newLayoutId: string | undefined

    act(() => {
      newLayoutId = result.current.createLayout('Fall 2026')
    })

    expect(result.current.activeLayoutId).toBe(newLayoutId)
    expect(result.current.activeLayout?.name).toBe('Fall 2026')
  })

  it('switches active layout without losing data', () => {
    const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

    const layout1Id = result.current.activeLayoutId

    // Plant crop in layout 1
    act(() => {
      result.current.plantCrop(0, lettuce)
    })

    // Create layout 2 (switches to it)
    act(() => {
      result.current.createLayout('Layout 2')
    })

    // Switch back to layout 1
    act(() => {
      result.current.switchLayout(layout1Id)
    })

    expect(result.current.activeLayoutId).toBe(layout1Id)
    expect(result.current.activeLayout?.boxes[0]?.cells[0]).toEqual(lettuce)
  })

  it('renames layout and preserves data', () => {
    const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

    const layoutId = result.current.activeLayoutId

    // Plant crop first
    act(() => {
      result.current.plantCrop(5, tomato)
    })

    // Then rename
    act(() => {
      result.current.renameLayout(layoutId, 'Renamed Garden')
    })

    const renamedLayout = result.current.layouts[layoutId]
    if (!renamedLayout) throw new Error('Renamed layout not found')
    expect(renamedLayout.name).toBe('Renamed Garden')
    expect(renamedLayout.boxes[0]!.cells[5]).toEqual(tomato)
  })

  it('duplicates layout with all bed data', () => {
    const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

    const originalId = result.current.activeLayoutId

    // Plant crops
    act(() => {
      result.current.plantCrop(0, lettuce)
    })

    act(() => {
      result.current.plantCrop(5, tomato)
    })

    // Duplicate layout
    let duplicateId: string | undefined
    act(() => {
      duplicateId = result.current.duplicateLayout(originalId, 'Garden Copy')
    })

    if (!duplicateId) throw new Error('Duplicate ID not returned')
    const duplicate = result.current.layouts[duplicateId]
    if (!duplicate) throw new Error('Duplicate layout not found')
    expect(duplicate.name).toBe('Garden Copy')
    expect(duplicate.boxes[0]!.cells[0]).toEqual(lettuce)
    expect(duplicate.boxes[0]!.cells[5]).toEqual(tomato)
    expect(duplicate.id).not.toBe(originalId)
  })

  it('deletes layout and switches to another', () => {
    const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

    const layout1Id = result.current.activeLayoutId

    // Create layout 2
    let layout2Id: string | undefined
    act(() => {
      layout2Id = result.current.createLayout('Layout 2')
    })

    // Delete layout 2
    act(() => {
      result.current.deleteLayout(layout2Id!)
    })

    expect(result.current.layouts[layout2Id!]).toBeUndefined()
    expect(result.current.activeLayoutId).toBe(layout1Id)
    expect(Object.keys(result.current.layouts)).toHaveLength(1)
  })

  it('prevents deleting the last remaining layout', () => {
    const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

    const onlyLayoutId = result.current.activeLayoutId

    act(() => {
      result.current.deleteLayout(onlyLayoutId)
    })

    // Layout should still exist
    expect(result.current.layouts[onlyLayoutId]).toBeDefined()
    expect(Object.keys(result.current.layouts)).toHaveLength(1)
  })

  it('updates timestamps on modification', () => {
    const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

    const layoutId = result.current.activeLayoutId
    const layout = result.current.layouts[layoutId]
    if (!layout) throw new Error('Layout not found')
    const originalUpdatedAt = layout.updatedAt

    // Advance time to ensure timestamp changes
    act(() => {
      vi.advanceTimersByTime(10)
    })

    act(() => {
      result.current.plantCrop(0, lettuce)
    })

    const updatedLayout = result.current.layouts[layoutId]
    if (!updatedLayout) throw new Error('Layout not found after update')
    const newUpdatedAt = updatedLayout.updatedAt
    expect(newUpdatedAt).not.toBe(originalUpdatedAt)
  })

  it('persists layouts to localStorage', () => {
    const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

    act(() => {
      result.current.createLayout('Test Layout')
    })

    // Advance timers to trigger debounced localStorage write
    act(() => {
      vi.runAllTimers()
    })

    const stored = localStorage.getItem('hortilogic:layouts')
    expect(stored).not.toBeNull()

    if (!stored) return

    const parsed = JSON.parse(stored)
    expect(parsed.version).toBe(2)
    expect(parsed.layouts).toBeDefined()
    expect(Object.keys(parsed.layouts)).toHaveLength(2)
  })

  it('restores layouts from localStorage on mount', () => {
    const layoutId = '123e4567-e89b-12d3-a456-426614174002'
    const profileId = '123e4567-e89b-12d3-a456-426614174001'
    const boxId = '123e4567-e89b-12d3-a456-426614174003'

    const storedData = {
      version: 2,
      activeLayoutId: layoutId,
      layouts: {
        [layoutId]: {
          id: layoutId,
          name: 'Restored Layout',
          profileId: profileId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          boxes: [
            {
              id: boxId,
              name: 'Main Bed',
              width: 4,
              height: 4,
              cells: Array(16).fill(null),
            },
          ],
        },
      },
      // defaultProfileId not in LayoutStorage
    }

    localStorage.setItem('hortilogic:layouts', JSON.stringify(storedData))

    const { result } = renderHook(() => useLayoutManager(profileId))

    expect(Object.keys(result.current.layouts)).toHaveLength(1)
    expect(result.current.layouts[layoutId]).toBeDefined()
    expect(result.current.layouts[layoutId]?.name).toBe('Restored Layout')
  })

  it('plantCrop updates only the active layout', () => {
    const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

    const layout1Id = result.current.activeLayoutId

    // Plant in layout 1
    act(() => {
      result.current.plantCrop(0, lettuce)
    })

    // Create and switch to layout 2
    let layout2Id: string | undefined
    act(() => {
      layout2Id = result.current.createLayout('Layout 2')
    })

    // Plant in layout 2
    act(() => {
      result.current.plantCrop(0, tomato)
    })

    const l1 = result.current.layouts[layout1Id]
    if (!l1 || !layout2Id) throw new Error('Layouts not found')
    const l2 = result.current.layouts[layout2Id]
    if (!l2) throw new Error('Layout 2 not found')
    expect(l1.boxes[0]!.cells[0]).toEqual(lettuce)
    expect(l2.boxes[0]!.cells[0]).toEqual(tomato)
  })

  it('removeCrop updates only the active layout', () => {
    const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

    act(() => {
      result.current.plantCrop(0, lettuce)
    })

    const layoutId = result.current.activeLayoutId

    act(() => {
      result.current.removeCrop(0)
    })

    const layout = result.current.layouts[layoutId]
    if (!layout) throw new Error('Layout not found')
    expect(layout.boxes[0]!.cells[0]).toBeNull()
  })

  it('clearBed clears only the active layout', () => {
    const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

    const layout1Id = result.current.activeLayoutId

    // Plant in layout 1
    act(() => {
      result.current.plantCrop(0, lettuce)
    })

    act(() => {
      result.current.plantCrop(5, tomato)
    })

    // Create layout 2 and plant in it
    let layout2Id: string | undefined
    act(() => {
      layout2Id = result.current.createLayout('Layout 2')
    })

    act(() => {
      result.current.plantCrop(10, lettuce)
    })

    // Clear layout 2
    act(() => {
      result.current.clearBed()
    })

    // Layout 2 should be cleared
    if (!layout2Id) throw new Error('Layout 2 ID not set')
    const l2 = result.current.layouts[layout2Id]
    if (!l2) throw new Error('Layout 2 not found')
    expect(l2.boxes[0]!.cells.every((cell: Crop | null) => cell === null)).toBe(true)

    // Layout 1 should still have crops
    const l1 = result.current.layouts[layout1Id]
    if (!l1) throw new Error('Layout 1 not found')
    expect(l1.boxes[0]!.cells[0]).toEqual(lettuce)
    expect(l1.boxes[0]!.cells[5]).toEqual(tomato)
  })

  it('clearBed clears all boxes in multi-box layout', () => {
    const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

    // Add a second box
    act(() => {
      result.current.addBox('Second Bed', 4, 4)
    })

    // Get current layout and set up crops in both boxes
    const layout = result.current.activeLayout
    if (!layout) throw new Error('No active layout')
    expect(layout.boxes.length).toBe(2)

    const updatedBoxes = [...layout.boxes]

    // Plant crops in first box
    const box1Cells = [...updatedBoxes[0]!.cells]
    box1Cells[0] = lettuce
    box1Cells[5] = tomato
    updatedBoxes[0] = { ...updatedBoxes[0]!, cells: box1Cells }

    // Plant crops in second box
    const box2Cells = [...updatedBoxes[1]!.cells]
    box2Cells[0] = lettuce
    box2Cells[3] = tomato
    updatedBoxes[1] = { ...updatedBoxes[1]!, cells: box2Cells }

    // Update layout with crops in both boxes
    act(() => {
      result.current.setAllBoxes(updatedBoxes)
    })

    // Verify both boxes have crops
    const layoutBefore = result.current.activeLayout
    if (!layoutBefore) throw new Error('No active layout')
    expect(layoutBefore.boxes[0]!.cells[0]).toEqual(lettuce)
    expect(layoutBefore.boxes[0]!.cells[5]).toEqual(tomato)
    expect(layoutBefore.boxes[1]!.cells[0]).toEqual(lettuce)
    expect(layoutBefore.boxes[1]!.cells[3]).toEqual(tomato)

    // Clear all crops
    act(() => {
      result.current.clearBed()
    })

    // Verify ALL boxes are cleared (not just the first one)
    const layoutAfter = result.current.activeLayout
    if (!layoutAfter) throw new Error('No active layout')
    expect(layoutAfter.boxes[0]!.cells.every((cell: Crop | null) => cell === null)).toBe(true)
    expect(layoutAfter.boxes[1]!.cells.every((cell: Crop | null) => cell === null)).toBe(true)
  })

  it('setBed updates entire bed in single operation', () => {
    const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

    // Create a new bed with multiple crops
    const newBed: (Crop | null)[] = Array(32).fill(null)
    newBed[0] = lettuce
    newBed[5] = tomato
    newBed[10] = lettuce
    newBed[15] = tomato

    // Update entire bed at once
    act(() => {
      result.current.setBed(newBed)
    })

    // Verify all crops were planted
    expect(result.current.currentBed[0]).toEqual(lettuce)
    expect(result.current.currentBed[5]).toEqual(tomato)
    expect(result.current.currentBed[10]).toEqual(lettuce)
    expect(result.current.currentBed[15]).toEqual(tomato)
    expect(result.current.currentBed[20]).toBeNull()
  })

  it('setBed updates only the active layout', () => {
    const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

    const layout1Id = result.current.activeLayoutId

    // Create layout 2
    let layout2Id: string | undefined
    act(() => {
      layout2Id = result.current.createLayout('Layout 2')
    })

    // Update layout 2 bed
    const newBed: (Crop | null)[] = Array(32).fill(null)
    newBed[0] = lettuce
    newBed[5] = tomato

    act(() => {
      result.current.setBed(newBed)
    })

    // Layout 2 should have the new bed
    if (!layout2Id) throw new Error('Layout 2 ID not set')
    const l2 = result.current.layouts[layout2Id]
    if (!l2) throw new Error('Layout 2 not found')
    expect(l2.boxes[0]!.cells[0]).toEqual(lettuce)
    expect(l2.boxes[0]!.cells[5]).toEqual(tomato)

    // Layout 1 should be unchanged
    const l1 = result.current.layouts[layout1Id]
    if (!l1) throw new Error('Layout 1 not found')
    expect(l1.boxes[0]!.cells.every((cell: Crop | null) => cell === null)).toBe(true)
  })

  it('returns current bed from active layout', () => {
    const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

    act(() => {
      result.current.plantCrop(0, lettuce)
    })

    expect(result.current.currentBed).toBeDefined()
    expect(result.current.currentBed[0]).toEqual(lettuce)
    expect(result.current.currentBed).toHaveLength(16)
  })

  it('adds a new box to the active layout', () => {
    const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

    const initialBoxCount = result.current.activeLayout?.boxes.length

    act(() => {
      result.current.addBox('Herb Box', 2, 4)
    })

    const updatedLayout = result.current.activeLayout
    expect(updatedLayout?.boxes).toHaveLength((initialBoxCount ?? 0) + 1)

    const newBox = updatedLayout?.boxes[updatedLayout.boxes.length - 1]
    expect(newBox?.name).toBe('Herb Box')
    expect(newBox?.width).toBe(2)
    expect(newBox?.height).toBe(4)
    expect(newBox?.cells).toHaveLength(8) // 2 * 4
    expect(newBox?.cells.every(cell => cell === null)).toBe(true)
  })

  it('removes a box from the active layout', () => {
    const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

    // Add two more boxes (separate act calls to avoid batching)
    let box1Id: string | undefined
    let box2Id: string | undefined

    act(() => {
      box1Id = result.current.addBox('Box 1', 2, 2)
    })

    act(() => {
      box2Id = result.current.addBox('Box 2', 3, 3)
    })

    expect(result.current.activeLayout?.boxes).toHaveLength(3) // Main Bed + 2 new

    // Remove the first added box
    act(() => {
      if (box1Id) {
        result.current.removeBox(box1Id)
      }
    })

    expect(result.current.activeLayout?.boxes).toHaveLength(2)
    expect(result.current.activeLayout?.boxes.find(b => b.id === box1Id)).toBeUndefined()
    expect(result.current.activeLayout?.boxes.find(b => b.id === box2Id)).toBeDefined()
  })

  it('prevents removing the last remaining box', () => {
    const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

    const onlyBoxId = result.current.activeLayout?.boxes[0]?.id

    expect(result.current.activeLayout?.boxes).toHaveLength(1)

    act(() => {
      if (onlyBoxId) {
        result.current.removeBox(onlyBoxId)
      }
    })

    // Should still have 1 box
    expect(result.current.activeLayout?.boxes).toHaveLength(1)
  })

  describe('Export/Import', () => {
    const mockProfile: GardenProfile = {
      name: 'Test Garden',
      hardiness_zone: '5b',
      location: 'Denver, CO',
      last_frost_date: '2024-04-15',
      first_frost_date: '2024-10-15',
      season_extension_weeks: 2,
      targetPlantingDate: '2024-05-01',
    }

    it('exports active layout with profile', () => {
      const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

      // Plant some crops
      act(() => {
        result.current.plantCrop(0, lettuce)
      })
      act(() => {
        result.current.plantCrop(5, tomato)
      })

      // Verify crops were planted
      expect(result.current.activeLayout?.boxes[0]!.cells[0]).toEqual(lettuce)
      expect(result.current.activeLayout?.boxes[0]!.cells[5]).toEqual(tomato)

      // Export layout
      const exportData = result.current.exportLayout(mockProfile)

      expect(exportData).toBeDefined()
      expect(exportData.version).toBe(1)
      expect(exportData.exportedAt).toBeDefined()
      expect(exportData.layout).toBeDefined()
      expect(exportData.profile).toEqual(mockProfile)
      expect(exportData.layout.boxes[0]?.cells[0]).toEqual(lettuce)
      expect(exportData.layout.boxes[0]?.cells[5]).toEqual(tomato)
    })

    it('exports active layout without profile', () => {
      const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

      let exportData: ExportedLayout | undefined
      act(() => {
        exportData = result.current.exportLayout()
      })

      expect(exportData).toBeDefined()
      if (!exportData) throw new Error('Export data is undefined')
      expect(exportData.version).toBe(1)
      expect(exportData.profile).toBeUndefined()
    })

    it('imports layout and creates new layout with new IDs', () => {
      const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

      // Plant crops and export
      act(() => {
        result.current.plantCrop(0, lettuce)
      })
      act(() => {
        result.current.plantCrop(5, tomato)
      })

      const exportData = result.current.exportLayout(mockProfile)
      const originalLayoutId = result.current.activeLayoutId
      const originalBoxId = result.current.activeLayout?.boxes[0]?.id

      // Import the layout
      let importedId: string | undefined
      act(() => {
        importedId = result.current.importLayout(exportData, 'Imported Layout')
      })

      // Verify new layout was created
      expect(importedId).toBeDefined()
      expect(importedId).not.toBe(originalLayoutId)

      // Verify imported layout is now active
      expect(result.current.activeLayoutId).toBe(importedId)

      // Verify layout has new IDs
      const importedLayout = result.current.activeLayout
      expect(importedLayout?.id).toBe(importedId)
      expect(importedLayout?.name).toBe('Imported Layout')
      expect(importedLayout?.boxes[0]?.id).not.toBe(originalBoxId)

      // Verify crops were preserved
      expect(importedLayout?.boxes[0]?.cells[0]).toEqual(lettuce)
      expect(importedLayout?.boxes[0]?.cells[5]).toEqual(tomato)
    })

    it('imports layout with custom name', () => {
      const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

      const exportData = result.current.exportLayout()

      let importedId: string | undefined
      act(() => {
        importedId = result.current.importLayout(exportData, 'January 2025 Plan')
      })

      if (!importedId) throw new Error('Import failed')
      const importedLayout = result.current.layouts[importedId]
      expect(importedLayout?.name).toBe('January 2025 Plan')
    })

    it('throws error when importing invalid data', () => {
      const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

      const invalidData = {
        version: 999,
        exportedAt: new Date().toISOString(),
      } as unknown as ExportedLayout

      expect(() => {
        act(() => {
          result.current.importLayout(invalidData, 'Invalid')
        })
      }).toThrow()
    })
  })

  describe('Disliked Crops (Don\'t Like)', () => {
    it('initializes with empty dislikedCropIds array', () => {
      const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

      expect(result.current.activeLayout?.dislikedCropIds).toBeUndefined()
    })

    it('adds crop to disliked list when not already disliked', () => {
      const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

      act(() => {
        result.current.toggleDislikedCrop('tomato')
      })

      expect(result.current.activeLayout?.dislikedCropIds).toContain('tomato')
    })

    it('removes crop from disliked list when already disliked', () => {
      const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

      // Add tomato to disliked list
      act(() => {
        result.current.toggleDislikedCrop('tomato')
      })

      expect(result.current.activeLayout?.dislikedCropIds).toContain('tomato')

      // Remove tomato from disliked list
      act(() => {
        result.current.toggleDislikedCrop('tomato')
      })

      expect(result.current.activeLayout?.dislikedCropIds).not.toContain('tomato')
    })

    it('handles multiple disliked crops', () => {
      const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

      act(() => {
        result.current.toggleDislikedCrop('tomato')
        result.current.toggleDislikedCrop('carrot')
        result.current.toggleDislikedCrop('lettuce')
      })

      expect(result.current.activeLayout?.dislikedCropIds).toEqual(
        expect.arrayContaining(['tomato', 'carrot', 'lettuce'])
      )
      expect(result.current.activeLayout?.dislikedCropIds).toHaveLength(3)
    })

    it('persists disliked crops to localStorage', () => {
      const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

      act(() => {
        result.current.toggleDislikedCrop('tomato')
      })

      // Advance timers to trigger debounced localStorage write
      act(() => {
        vi.runAllTimers()
      })

      const stored = localStorage.getItem('hortilogic:layouts')
      expect(stored).not.toBeNull()

      if (!stored) return

      const parsed = JSON.parse(stored)
      const layoutId = result.current.activeLayoutId
      expect(parsed.layouts[layoutId].dislikedCropIds).toContain('tomato')
    })

    it('restores disliked crops from localStorage on mount', () => {
      const layoutId = '123e4567-e89b-12d3-a456-426614174002'
      const profileId = '123e4567-e89b-12d3-a456-426614174001'
      const boxId = '123e4567-e89b-12d3-a456-426614174003'

      const storedData = {
        version: 2,
        activeLayoutId: layoutId,
        layouts: {
          [layoutId]: {
            id: layoutId,
            name: 'Restored Layout',
            profileId: profileId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dislikedCropIds: ['tomato', 'carrot'],
            boxes: [
              {
                id: boxId,
                name: 'Main Bed',
                width: 4,
                height: 4,
                cells: Array(16).fill(null),
              },
            ],
          },
        },
      }

      localStorage.setItem('hortilogic:layouts', JSON.stringify(storedData))

      const { result } = renderHook(() => useLayoutManager(profileId))

      expect(result.current.activeLayout?.dislikedCropIds).toEqual(['tomato', 'carrot'])
    })

    it('updates timestamps when toggling disliked crops', () => {
      const { result } = renderHook(() => useLayoutManager(TEST_PROFILE_ID))

      const layoutId = result.current.activeLayoutId
      const layout = result.current.layouts[layoutId]
      if (!layout) throw new Error('Layout not found')
      const originalUpdatedAt = layout.updatedAt

      // Advance time to ensure timestamp changes
      act(() => {
        vi.advanceTimersByTime(10)
      })

      act(() => {
        result.current.toggleDislikedCrop('tomato')
      })

      const updatedLayout = result.current.layouts[layoutId]
      if (!updatedLayout) throw new Error('Layout not found after update')
      const newUpdatedAt = updatedLayout.updatedAt
      expect(newUpdatedAt).not.toBe(originalUpdatedAt)
    })
  })
})
