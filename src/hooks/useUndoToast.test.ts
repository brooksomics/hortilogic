import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useUndoToast } from './useUndoToast'
import type { Crop, GardenBox, GardenStash, GardenLayout } from '../types/garden'

describe('useUndoToast', () => {
  let restoreBoxes: ReturnType<typeof vi.fn>
  let restoreStash: ReturnType<typeof vi.fn>
  let restoreLayout: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.useFakeTimers()
    restoreBoxes = vi.fn()
    restoreStash = vi.fn()
    restoreLayout = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should start with no snapshot and invisible', () => {
    const { result } = renderHook(() =>
      useUndoToast(restoreBoxes, restoreStash, restoreLayout)
    )

    expect(result.current.snapshot).toBeNull()
    expect(result.current.isVisible).toBe(false)
  })

  it('should capture snapshot and set visible to true', () => {
    const { result } = renderHook(() =>
      useUndoToast(restoreBoxes, restoreStash, restoreLayout)
    )

    const mockBoxes: GardenBox[] = [
      {
        id: 'box1',
        name: 'Test Box',
        width: 4,
        height: 4,
        cells: Array(16).fill(null) as (Crop | null)[],
      },
    ]

    act(() => {
      result.current.capture({
        type: 'boxes',
        label: 'Cleared all crops',
        boxes: mockBoxes,
      })
    })

    expect(result.current.snapshot).toMatchObject({
      type: 'boxes',
      label: 'Cleared all crops',
      boxes: mockBoxes,
    })
    expect(result.current.snapshot?.timestamp).toBeDefined()
    expect(result.current.isVisible).toBe(true)
  })

  it('should call restoreBoxes when executeUndo is called with boxes type', () => {
    const { result } = renderHook(() =>
      useUndoToast(restoreBoxes, restoreStash, restoreLayout)
    )

    const mockBoxes: GardenBox[] = [
      {
        id: 'box1',
        name: 'Test Box',
        width: 4,
        height: 4,
        cells: Array(16).fill(null) as (Crop | null)[],
      },
    ]

    act(() => {
      result.current.capture({
        type: 'boxes',
        label: 'Cleared all crops',
        boxes: mockBoxes,
      })
    })

    act(() => {
      result.current.executeUndo()
    })

    expect(restoreBoxes).toHaveBeenCalledWith(mockBoxes)
    expect(result.current.isVisible).toBe(false)
  })

  it('should call restoreStash when executeUndo is called with stash type', () => {
    const { result } = renderHook(() =>
      useUndoToast(restoreBoxes, restoreStash, restoreLayout)
    )

    const mockStash: GardenStash = { tomato: 4, lettuce: 8 }

    act(() => {
      result.current.capture({
        type: 'stash',
        label: 'Cleared stash',
        stash: mockStash,
      })
    })

    act(() => {
      result.current.executeUndo()
    })

    expect(restoreStash).toHaveBeenCalledWith(mockStash)
    expect(result.current.isVisible).toBe(false)
  })

  it('should call restoreLayout when executeUndo is called with layout type', () => {
    const { result } = renderHook(() =>
      useUndoToast(restoreBoxes, restoreStash, restoreLayout)
    )

    const mockLayout: GardenLayout = {
      id: 'layout1',
      name: 'Test Layout',
      boxes: [],
      profileId: 'profile1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    act(() => {
      result.current.capture({
        type: 'layout',
        label: 'Deleted layout',
        layout: mockLayout,
        layoutId: 'layout1',
      })
    })

    act(() => {
      result.current.executeUndo()
    })

    expect(restoreLayout).toHaveBeenCalledWith(mockLayout, 'layout1')
    expect(result.current.isVisible).toBe(false)
  })

  it('should restore both boxes and stash when both are present', () => {
    const { result } = renderHook(() =>
      useUndoToast(restoreBoxes, restoreStash, restoreLayout)
    )

    const mockBoxes: GardenBox[] = [
      {
        id: 'box1',
        name: 'Test Box',
        width: 4,
        height: 4,
        cells: Array(16).fill(null) as (Crop | null)[],
      },
    ]
    const mockStash: GardenStash = { tomato: 4 }

    act(() => {
      result.current.capture({
        type: 'boxes',
        label: 'Distributed stash',
        boxes: mockBoxes,
        stash: mockStash,
      })
    })

    act(() => {
      result.current.executeUndo()
    })

    expect(restoreBoxes).toHaveBeenCalledWith(mockBoxes)
    expect(restoreStash).toHaveBeenCalledWith(mockStash)
  })

  it('should auto-dismiss after 8 seconds', () => {
    const { result } = renderHook(() =>
      useUndoToast(restoreBoxes, restoreStash, restoreLayout)
    )

    act(() => {
      result.current.capture({
        type: 'boxes',
        label: 'Cleared all crops',
        boxes: [],
      })
    })

    expect(result.current.isVisible).toBe(true)

    act(() => {
      vi.advanceTimersByTime(8000)
    })

    expect(result.current.isVisible).toBe(false)
  })

  it('should pause and resume auto-dismiss timer', () => {
    const { result } = renderHook(() =>
      useUndoToast(restoreBoxes, restoreStash, restoreLayout)
    )

    act(() => {
      result.current.capture({
        type: 'boxes',
        label: 'Cleared all crops',
        boxes: [],
      })
    })

    act(() => {
      result.current.pause()
    })

    act(() => {
      vi.advanceTimersByTime(8000)
    })

    // Should still be visible because it's paused
    expect(result.current.isVisible).toBe(true)

    act(() => {
      result.current.resume()
    })

    act(() => {
      vi.advanceTimersByTime(8000)
    })

    // Now it should dismiss
    expect(result.current.isVisible).toBe(false)
  })

  it('should dismiss without undoing when dismiss is called', () => {
    const { result } = renderHook(() =>
      useUndoToast(restoreBoxes, restoreStash, restoreLayout)
    )

    act(() => {
      result.current.capture({
        type: 'boxes',
        label: 'Cleared all crops',
        boxes: [],
      })
    })

    act(() => {
      result.current.dismiss()
    })

    expect(result.current.isVisible).toBe(false)
    expect(restoreBoxes).not.toHaveBeenCalled()
  })

  it('should replace previous snapshot when new capture is called', () => {
    const { result } = renderHook(() =>
      useUndoToast(restoreBoxes, restoreStash, restoreLayout)
    )

    act(() => {
      result.current.capture({
        type: 'boxes',
        label: 'First action',
        boxes: [],
      })
    })

    const firstSnapshot = result.current.snapshot

    act(() => {
      result.current.capture({
        type: 'stash',
        label: 'Second action',
        stash: {},
      })
    })

    expect(result.current.snapshot?.label).toBe('Second action')
    expect(result.current.snapshot).not.toBe(firstSnapshot)
  })

  it('should be no-op when executeUndo is called with no snapshot', () => {
    const { result } = renderHook(() =>
      useUndoToast(restoreBoxes, restoreStash, restoreLayout)
    )

    act(() => {
      result.current.executeUndo()
    })

    expect(restoreBoxes).not.toHaveBeenCalled()
    expect(restoreStash).not.toHaveBeenCalled()
    expect(restoreLayout).not.toHaveBeenCalled()
  })
})
