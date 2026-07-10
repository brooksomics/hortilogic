import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebouncedLocalStorage } from './useDebouncedLocalStorage'
import { getStorageHealth, reportStorageWrite } from './useStorageHealth'

describe('useDebouncedLocalStorage', () => {
  const TEST_KEY = 'test-debounced-key'
  const DEBOUNCE_DELAY = 300

  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
    reportStorageWrite(true) // reset shared storage-health state
  })

  it('should return initial value on first render', () => {
    const { result } = renderHook(() =>
      useDebouncedLocalStorage(TEST_KEY, 'initial')
    )

    expect(result.current[0]).toBe('initial')
  })

  it('should debounce multiple rapid setState calls into single write', () => {
    const { result } = renderHook(() =>
      useDebouncedLocalStorage(TEST_KEY, 0, DEBOUNCE_DELAY)
    )

    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

    // Rapidly call setValue 10 times
    act(() => {
      for (let i = 1; i <= 10; i++) {
        result.current[1](i)
      }
    })

    // State should update immediately
    expect(result.current[0]).toBe(10)

    // No writes should happen immediately
    expect(setItemSpy).not.toHaveBeenCalled()

    // Advance timers by debounce delay
    act(() => {
      vi.runAllTimers()
    })

    // Should only write once after debounce
    expect(setItemSpy).toHaveBeenCalledTimes(1)
    expect(setItemSpy).toHaveBeenCalledWith(TEST_KEY, JSON.stringify(10))
  })

  it('should flush pending writes on unmount', () => {
    const { result, unmount } = renderHook(() =>
      useDebouncedLocalStorage(TEST_KEY, 0, DEBOUNCE_DELAY)
    )

    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

    // Make a change
    act(() => {
      result.current[1](42)
    })

    // Unmount before debounce completes
    act(() => {
      unmount()
    })

    // Should flush immediately on unmount
    expect(setItemSpy).toHaveBeenCalledWith(TEST_KEY, JSON.stringify(42))
  })

  it('should support manual flush() method for immediate writes', () => {
    const { result } = renderHook(() =>
      useDebouncedLocalStorage(TEST_KEY, 0, DEBOUNCE_DELAY)
    )

    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

    // Make a change
    act(() => {
      result.current[1](99)
    })

    // Call flush immediately
    act(() => {
      result.current[2]() // flush() is the third element
    })

    // Should write immediately without waiting for debounce
    expect(setItemSpy).toHaveBeenCalledWith(TEST_KEY, JSON.stringify(99))

    // Advancing timers should not cause another write
    act(() => {
      vi.runAllTimers()
    })

    expect(setItemSpy).toHaveBeenCalledTimes(1)
  })

  it('should create separate writes when delay elapses between calls', () => {
    const { result } = renderHook(() =>
      useDebouncedLocalStorage(TEST_KEY, 0, DEBOUNCE_DELAY)
    )

    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

    // First update
    act(() => {
      result.current[1](1)
    })

    // Wait for debounce to complete
    act(() => {
      vi.runAllTimers()
    })

    expect(setItemSpy).toHaveBeenCalledTimes(1)

    // Second update after delay
    act(() => {
      result.current[1](2)
    })

    // Wait for debounce to complete again
    act(() => {
      vi.runAllTimers()
    })

    // Should have 2 separate writes
    expect(setItemSpy).toHaveBeenCalledTimes(2)
    expect(setItemSpy).toHaveBeenNthCalledWith(1, TEST_KEY, JSON.stringify(1))
    expect(setItemSpy).toHaveBeenNthCalledWith(2, TEST_KEY, JSON.stringify(2))
  })

  it('should support functional updates like useState', () => {
    const { result } = renderHook(() =>
      useDebouncedLocalStorage(TEST_KEY, 10, DEBOUNCE_DELAY)
    )

    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

    // Use functional update
    act(() => {
      result.current[1]((prev) => prev + 5)
    })

    // State should update immediately
    expect(result.current[0]).toBe(15)

    act(() => {
      vi.runAllTimers()
    })

    expect(setItemSpy).toHaveBeenCalledWith(TEST_KEY, JSON.stringify(15))
  })

  it('should handle object values correctly', () => {
    type TestObj = { count: number; name: string }
    const { result } = renderHook(() =>
      useDebouncedLocalStorage<TestObj>(
        TEST_KEY,
        { count: 0, name: 'test' },
        DEBOUNCE_DELAY
      )
    )

    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

    act(() => {
      result.current[1]({ count: 42, name: 'updated' })
    })

    expect(result.current[0]).toEqual({ count: 42, name: 'updated' })

    act(() => {
      vi.runAllTimers()
    })

    expect(setItemSpy).toHaveBeenCalledWith(
      TEST_KEY,
      JSON.stringify({ count: 42, name: 'updated' })
    )
  })

  it('should read existing value from localStorage on mount', () => {
    localStorage.setItem(TEST_KEY, JSON.stringify('existing'))

    const { result } = renderHook(() =>
      useDebouncedLocalStorage(TEST_KEY, 'initial')
    )

    expect(result.current[0]).toBe('existing')
  })

  it('should cancel pending write when new value is set before debounce completes', () => {
    const { result } = renderHook(() =>
      useDebouncedLocalStorage(TEST_KEY, 0, DEBOUNCE_DELAY)
    )

    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

    // First update
    act(() => {
      result.current[1](1)
    })

    // Advance time partially
    act(() => {
      vi.advanceTimersByTime(100)
    })

    // Second update (should cancel first)
    act(() => {
      result.current[1](2)
    })

    // Complete debounce
    act(() => {
      vi.runAllTimers()
    })

    // Should only write the final value once
    expect(setItemSpy).toHaveBeenCalledTimes(1)
    expect(setItemSpy).toHaveBeenCalledWith(TEST_KEY, JSON.stringify(2))
  })

  describe('pagehide flush and cross-tab sync (hortilogic-a0h.2, a0h.3)', () => {
    it('flushes a pending write when the tab is hidden or closed', () => {
      const { result } = renderHook(() =>
        useDebouncedLocalStorage(TEST_KEY, 0, DEBOUNCE_DELAY)
      )
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

      act(() => {
        result.current[1](7)
      })
      expect(setItemSpy).not.toHaveBeenCalled()

      act(() => {
        window.dispatchEvent(new Event('pagehide'))
      })

      expect(setItemSpy).toHaveBeenCalledWith(TEST_KEY, JSON.stringify(7))
    })

    it('does not write on pagehide when nothing is pending', () => {
      renderHook(() => useDebouncedLocalStorage(TEST_KEY, 0, DEBOUNCE_DELAY))
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

      act(() => {
        window.dispatchEvent(new Event('pagehide'))
      })

      expect(setItemSpy).not.toHaveBeenCalled()
    })

    it('updates in-memory state when another tab writes the same key', () => {
      const { result } = renderHook(() =>
        useDebouncedLocalStorage(TEST_KEY, 0, DEBOUNCE_DELAY)
      )

      act(() => {
        localStorage.setItem(TEST_KEY, JSON.stringify(42))
        window.dispatchEvent(
          new StorageEvent('storage', { key: TEST_KEY, newValue: JSON.stringify(42) })
        )
      })

      expect(result.current[0]).toBe(42)
    })

    it('ignores storage events for other keys', () => {
      const { result } = renderHook(() =>
        useDebouncedLocalStorage(TEST_KEY, 0, DEBOUNCE_DELAY)
      )

      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', { key: 'other-key', newValue: JSON.stringify(42) })
        )
      })

      expect(result.current[0]).toBe(0)
    })

    it('ignores storage events with unparseable payloads', () => {
      const { result } = renderHook(() =>
        useDebouncedLocalStorage(TEST_KEY, 0, DEBOUNCE_DELAY)
      )

      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', { key: TEST_KEY, newValue: 'not json {{{' })
        )
      })

      expect(result.current[0]).toBe(0)
    })

    it('rejects cross-tab values that fail the validator', () => {
      const validator = (data: unknown): number | null =>
        typeof data === 'number' && data >= 0 ? data : null
      const { result } = renderHook(() =>
        useDebouncedLocalStorage(TEST_KEY, 0, DEBOUNCE_DELAY, validator)
      )

      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', { key: TEST_KEY, newValue: JSON.stringify(-5) })
        )
      })

      expect(result.current[0]).toBe(0)
    })

    it('removes the pagehide listener on unmount', () => {
      const removeSpy = vi.spyOn(window, 'removeEventListener')
      const { unmount } = renderHook(() =>
        useDebouncedLocalStorage(TEST_KEY, 0, DEBOUNCE_DELAY)
      )

      unmount()

      expect(removeSpy.mock.calls.some(([type]) => type === 'pagehide')).toBe(true)
    })
  })

  describe('surfaces write failures (hortilogic-696.3)', () => {
    it('reports storage unhealthy when a write throws and healthy when it succeeds', () => {
      const { result } = renderHook(() =>
        useDebouncedLocalStorage(TEST_KEY, 0, DEBOUNCE_DELAY)
      )
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

      // Quota exceeded: the debounced write throws
      setItemSpy.mockImplementationOnce(() => {
        throw new DOMException('quota', 'QuotaExceededError')
      })
      act(() => {
        result.current[1](1)
      })
      act(() => {
        vi.runAllTimers()
      })
      expect(getStorageHealth()).toBe(true)

      // A later successful write clears the warning
      act(() => {
        result.current[1](2)
      })
      act(() => {
        vi.runAllTimers()
      })
      expect(getStorageHealth()).toBe(false)
    })
  })
})
