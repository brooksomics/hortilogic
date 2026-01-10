import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGarden } from './useGarden'
import type { Crop, GardenProfile } from '@/types'

// Sample crops for testing
const lettuce: Crop = {
  id: 'lettuce',
  name: 'Lettuce',
  sfg_density: 4,
  planting_strategy: { start_window_start: -4, start_window_end: 2 },
  companions: { friends: [], enemies: [] }
}

const tomato: Crop = {
  id: 'tomato',
  name: 'Tomato',
  sfg_density: 1,
  planting_strategy: { start_window_start: 0, start_window_end: 4 },
  companions: { friends: [], enemies: [] }
}

describe('useGarden', () => {
  // Clear localStorage before each test
  beforeEach(() => {
    localStorage.clear()
  })

  // Clear localStorage after all tests
  afterEach(() => {
    localStorage.clear()
  })

  it('initializes with empty bed (32 null cells)', () => {
    const { result } = renderHook(() => useGarden())

    expect(result.current.currentBed).toHaveLength(32)
    expect(result.current.currentBed.every(cell => cell === null)).toBe(true)
  })

  it('initializes with null garden profile', () => {
    const { result } = renderHook(() => useGarden())

    expect(result.current.gardenProfile).toBeNull()
  })

  it('plants a crop in a specific cell', () => {
    const { result } = renderHook(() => useGarden())

    act(() => {
      result.current.plantCrop(0, lettuce)
    })

    expect(result.current.currentBed[0]).toEqual(lettuce)
    expect(result.current.currentBed[1]).toBeNull()
  })

  it('plants multiple crops in different cells', () => {
    const { result } = renderHook(() => useGarden())

    act(() => {
      result.current.plantCrop(0, lettuce)
      result.current.plantCrop(5, tomato)
    })

    expect(result.current.currentBed[0]).toEqual(lettuce)
    expect(result.current.currentBed[5]).toEqual(tomato)
    expect(result.current.currentBed[1]).toBeNull()
  })

  it('replaces an existing crop when planting in occupied cell', () => {
    const { result } = renderHook(() => useGarden())

    act(() => {
      result.current.plantCrop(0, lettuce)
    })

    expect(result.current.currentBed[0]).toEqual(lettuce)

    act(() => {
      result.current.plantCrop(0, tomato)
    })

    expect(result.current.currentBed[0]).toEqual(tomato)
  })

  it('removes a crop from a cell', () => {
    const { result } = renderHook(() => useGarden())

    act(() => {
      result.current.plantCrop(0, lettuce)
    })

    expect(result.current.currentBed[0]).toEqual(lettuce)

    act(() => {
      result.current.removeCrop(0)
    })

    expect(result.current.currentBed[0]).toBeNull()
  })

  it('clears all crops from the bed', () => {
    const { result } = renderHook(() => useGarden())

    act(() => {
      result.current.plantCrop(0, lettuce)
      result.current.plantCrop(5, tomato)
      result.current.plantCrop(10, lettuce)
    })

    expect(result.current.currentBed[0]).toEqual(lettuce)
    expect(result.current.currentBed[5]).toEqual(tomato)
    expect(result.current.currentBed[10]).toEqual(lettuce)

    act(() => {
      result.current.clearBed()
    })

    expect(result.current.currentBed.every(cell => cell === null)).toBe(true)
  })

  it('sets garden profile', () => {
    const { result } = renderHook(() => useGarden())

    const profile: GardenProfile = {
      name: 'Test Garden',
      hardiness_zone: '5b',
      last_frost_date: '2024-05-15',
      first_frost_date: '2024-10-01',
      season_extension_weeks: 0
    }

    act(() => {
      result.current.setGardenProfile(profile)
    })

    expect(result.current.gardenProfile).toEqual(profile)
  })

  it('persists state to localStorage', () => {
    const { result } = renderHook(() => useGarden())

    act(() => {
      result.current.plantCrop(0, lettuce)
    })

    // Check that localStorage was updated
    const stored = localStorage.getItem('hortilogic:garden')
    expect(stored).toBeTruthy()
    expect(stored).not.toBeNull()

    if (stored) {
      const parsedState = JSON.parse(stored) as { currentBed: (typeof lettuce | null)[] }
      expect(parsedState.currentBed[0]).toEqual(lettuce)
    }
  })

  it('restores state from localStorage on mount', () => {
    // Set up initial state in localStorage
    const initialState = {
      currentBed: Array(32).fill(null),
      gardenProfile: null
    }
    initialState.currentBed[3] = tomato
    localStorage.setItem('hortilogic:garden', JSON.stringify(initialState))

    // Render hook - should restore from localStorage
    const { result } = renderHook(() => useGarden())

    expect(result.current.currentBed[3]).toEqual(tomato)
    expect(result.current.currentBed[0]).toBeNull()
  })

  it('handles invalid cell index gracefully (negative)', () => {
    const { result } = renderHook(() => useGarden())

    act(() => {
      result.current.plantCrop(-1, lettuce)
    })

    // Should not crash, and bed should remain empty
    expect(result.current.currentBed.every(cell => cell === null)).toBe(true)
  })

  it('handles invalid cell index gracefully (too large)', () => {
    const { result } = renderHook(() => useGarden())

    act(() => {
      result.current.plantCrop(32, lettuce)
    })

    // Should not crash, and bed should remain empty
    expect(result.current.currentBed.every(cell => cell === null)).toBe(true)
  })
})
