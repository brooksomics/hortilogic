import { describe, it, expect, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { reportStorageWrite, useStorageHealth } from './useStorageHealth'

describe('useStorageHealth', () => {
  afterEach(() => {
    // Reset shared module state between tests
    reportStorageWrite(true)
  })

  it('is healthy (false) by default', () => {
    const { result } = renderHook(() => useStorageHealth())
    expect(result.current).toBe(false)
  })

  it('reports a failure and clears when a later write succeeds', () => {
    const { result } = renderHook(() => useStorageHealth())

    act(() => {
      reportStorageWrite(false)
    })
    expect(result.current).toBe(true)

    act(() => {
      reportStorageWrite(true)
    })
    expect(result.current).toBe(false)
  })
})
