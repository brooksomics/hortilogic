import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useContext } from 'react'
import { GardenProvider } from './GardenProvider'
import { GardenContext } from './GardenContext'
import { getStorageHealth, reportStorageWrite } from '../hooks/useStorageHealth'

function renderGarden() {
  return renderHook(() => useContext(GardenContext), { wrapper: GardenProvider })
}

describe('GardenProvider stash restore write failures (hortilogic-xow)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    reportStorageWrite(true)
    localStorage.clear()
  })

  it('does not crash and reports the failure when the stash restore write throws', () => {
    const { result } = renderGarden()

    // Build a stash, then clear it (captures an undo snapshot of the stash)
    act(() => {
      result.current?.addToStash('tomato', 2)
    })
    act(() => {
      result.current?.clearStash()
    })
    expect(result.current?.undoToast.snapshot?.type).toBe('stash')

    // Quota exceeded: undoing the clear writes the stash back to localStorage
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })

    expect(() => {
      act(() => {
        result.current?.undoToast.executeUndo()
      })
    }).not.toThrow()

    // The in-memory restore still happens; the failed write is only reported
    expect(result.current?.stash).toEqual({ tomato: 2 })
    expect(getStorageHealth()).toBe(true)
  })
})
