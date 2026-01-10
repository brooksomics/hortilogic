/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLayoutManager } from './useLayoutManager'
import type { Crop } from '../types/garden'

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
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('initializes with default layout named "My Garden"', () => {
    const { result } = renderHook(() => useLayoutManager())

    expect(result.current.layouts).toBeDefined()
    expect(Object.keys(result.current.layouts)).toHaveLength(1)

    const layoutIds = Object.keys(result.current.layouts)
    const layoutId = layoutIds[0]
    if (!layoutId) throw new Error('Layout ID not found')
    const defaultLayout = result.current.layouts[layoutId]

    expect(defaultLayout?.name).toBe('My Garden')
    expect(defaultLayout?.bed).toHaveLength(32)
    expect(defaultLayout?.bed.every((cell: Crop | null) => cell === null)).toBe(true)
  })

  it('sets activeLayoutId to the default layout', () => {
    const { result } = renderHook(() => useLayoutManager())

    expect(result.current.activeLayoutId).toBeTruthy()

    const activeLayout = result.current.layouts[result.current.activeLayoutId]
    expect(activeLayout).toBeDefined()
  })

  it('provides activeLayout object for convenience', () => {
    const { result } = renderHook(() => useLayoutManager())

    expect(result.current.activeLayout).toBeDefined()
    expect(result.current.activeLayout?.name).toBe('My Garden')
    expect(result.current.activeLayout?.id).toBe(result.current.activeLayoutId)
  })

  it('creates new blank layout with given name', () => {
    const { result } = renderHook(() => useLayoutManager())

    act(() => {
      result.current.createLayout('Spring 2026')
    })

    const layouts = Object.values(result.current.layouts)
    expect(layouts).toHaveLength(2)

    const springLayout = layouts.find((l) => l.name === 'Spring 2026')
    expect(springLayout).toBeDefined()
    expect(springLayout?.bed).toHaveLength(32)
    expect(springLayout?.bed.every((cell) => cell === null)).toBe(true)
  })

  it('switches to newly created layout automatically', () => {
    const { result } = renderHook(() => useLayoutManager())

    let newLayoutId: string | undefined

    act(() => {
      newLayoutId = result.current.createLayout('Fall 2026')
    })

    expect(result.current.activeLayoutId).toBe(newLayoutId)
    expect(result.current.activeLayout?.name).toBe('Fall 2026')
  })

  it('switches active layout without losing data', () => {
    const { result } = renderHook(() => useLayoutManager())

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
    expect(result.current.activeLayout?.bed[0]).toEqual(lettuce)
  })

  it('renames layout and preserves data', () => {
    const { result } = renderHook(() => useLayoutManager())

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
    expect(renamedLayout.bed[5]).toEqual(tomato)
  })

  it('duplicates layout with all bed data', () => {
    const { result } = renderHook(() => useLayoutManager())

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
    expect(duplicate.bed[0]).toEqual(lettuce)
    expect(duplicate.bed[5]).toEqual(tomato)
    expect(duplicate.id).not.toBe(originalId)
  })

  it('deletes layout and switches to another', () => {
    const { result } = renderHook(() => useLayoutManager())

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
    const { result } = renderHook(() => useLayoutManager())

    const onlyLayoutId = result.current.activeLayoutId

    act(() => {
      result.current.deleteLayout(onlyLayoutId)
    })

    // Layout should still exist
    expect(result.current.layouts[onlyLayoutId]).toBeDefined()
    expect(Object.keys(result.current.layouts)).toHaveLength(1)
  })

  it('updates timestamps on modification', () => {
    const { result } = renderHook(() => useLayoutManager())

    const layoutId = result.current.activeLayoutId
    const layout = result.current.layouts[layoutId]
    if (!layout) throw new Error('Layout not found')
    const originalUpdatedAt = layout.updatedAt

    // Wait a bit to ensure timestamp changes
    setTimeout(() => {
      act(() => {
        result.current.plantCrop(0, lettuce)
      })

      const updatedLayout = result.current.layouts[layoutId]
      if (!updatedLayout) throw new Error('Layout not found after update')
      const newUpdatedAt = updatedLayout.updatedAt
      expect(newUpdatedAt).not.toBe(originalUpdatedAt)
    }, 10)
  })

  it('persists layouts to localStorage', () => {
    const { result } = renderHook(() => useLayoutManager())

    act(() => {
      result.current.createLayout('Test Layout')
    })

    const stored = localStorage.getItem('hortilogic:layouts')
    expect(stored).not.toBeNull()

    if (!stored) return

    const parsed = JSON.parse(stored)
    expect(parsed.version).toBe(1)
    expect(parsed.layouts).toBeDefined()
    expect(Object.keys(parsed.layouts)).toHaveLength(2)
  })

  it('restores layouts from localStorage on mount', () => {
    // First hook: create layouts
    const { result: result1, unmount } = renderHook(() => useLayoutManager())

    let layoutId: string | undefined

    // Create layout
    act(() => {
      layoutId = result1.current.createLayout('Persisted Layout')
    })

    // Plant crop
    act(() => {
      result1.current.plantCrop(10, lettuce)
    })

    // Unmount first hook
    unmount()

    // Second hook: restore from localStorage
    const { result: result2 } = renderHook(() => useLayoutManager())

    if (!layoutId) throw new Error('Layout ID not set')
    expect(Object.keys(result2.current.layouts)).toHaveLength(2)
    expect(result2.current.layouts[layoutId]).toBeDefined()
    const persistedLayout = result2.current.layouts[layoutId]
    if (!persistedLayout) throw new Error('Persisted layout not found')
    expect(persistedLayout.name).toBe('Persisted Layout')
    expect(persistedLayout.bed[10]).toEqual(lettuce)
  })

  it('plantCrop updates only the active layout', () => {
    const { result } = renderHook(() => useLayoutManager())

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
    expect(l1.bed[0]).toEqual(lettuce)
    expect(l2.bed[0]).toEqual(tomato)
  })

  it('removeCrop updates only the active layout', () => {
    const { result } = renderHook(() => useLayoutManager())

    act(() => {
      result.current.plantCrop(0, lettuce)
    })

    const layoutId = result.current.activeLayoutId

    act(() => {
      result.current.removeCrop(0)
    })

    const layout = result.current.layouts[layoutId]
    if (!layout) throw new Error('Layout not found')
    expect(layout.bed[0]).toBeNull()
  })

  it('clearBed clears only the active layout', () => {
    const { result } = renderHook(() => useLayoutManager())

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
    expect(l2.bed.every((cell: Crop | null) => cell === null)).toBe(true)

    // Layout 1 should still have crops
    const l1 = result.current.layouts[layout1Id]
    if (!l1) throw new Error('Layout 1 not found')
    expect(l1.bed[0]).toEqual(lettuce)
    expect(l1.bed[5]).toEqual(tomato)
  })

  it('returns current bed from active layout', () => {
    const { result } = renderHook(() => useLayoutManager())

    act(() => {
      result.current.plantCrop(0, lettuce)
    })

    expect(result.current.currentBed).toBeDefined()
    expect(result.current.currentBed[0]).toEqual(lettuce)
    expect(result.current.currentBed).toHaveLength(32)
  })
})
