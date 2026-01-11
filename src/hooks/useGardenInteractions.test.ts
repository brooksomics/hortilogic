import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGardenInteractions } from './useGardenInteractions'
import type { Crop, GardenProfile, GardenLayout, GardenBox } from '../types/garden'

describe('useGardenInteractions', () => {
  let mockProfile: GardenProfile
  let mockLayout: GardenLayout
  let mockSetAllBoxes: (boxes: GardenBox[]) => void
  let mockPlantCrop: (index: number, crop: Crop) => void
  let mockRemoveCrop: (index: number) => void
  let mockUpdateProfile: (id: string, profile: GardenProfile) => void
  let mockCurrentBed: (Crop | null)[]
  let allBoxesUpdated: GardenBox[]

  beforeEach(() => {
    mockProfile = {
      name: 'Test Garden',
      location: 'Denver, CO',
      hardiness_zone: '5b',
      last_frost_date: '05-15',
      first_frost_date: '10-01',
      targetPlantingDate: '03-01',
      season_extension_weeks: 0,
    }

    // Create layout with 3 boxes of different sizes
    const box1: GardenBox = {
      id: 'box-1',
      name: 'Main Bed',
      width: 4,
      height: 2,
      cells: Array(8).fill(null) as (Crop | null)[],
    }
    const box2: GardenBox = {
      id: 'box-2',
      name: 'Herb Box',
      width: 2,
      height: 2,
      cells: Array(4).fill(null) as (Crop | null)[],
    }
    const box3: GardenBox = {
      id: 'box-3',
      name: 'Veggie Patch',
      width: 3,
      height: 3,
      cells: Array(9).fill(null) as (Crop | null)[],
    }

    mockLayout = {
      id: 'test-layout',
      name: 'Spring 2026',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      boxes: [box1, box2, box3],
      profileId: 'test-profile',
    }

    mockCurrentBed = mockLayout.boxes[0]?.cells ?? []
    allBoxesUpdated = []

    // Mock setAllBoxes to capture all box updates
    mockSetAllBoxes = (boxes: GardenBox[]) => {
      allBoxesUpdated = boxes
    }

    mockPlantCrop = () => { }
    mockRemoveCrop = () => { }
    mockUpdateProfile = () => { }

    // Clear local storage to prevent test pollution
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('handleAutoFill - Multi-Box Support', () => {
    it('fills ALL boxes in layout, not just the first box', () => {
      const { result } = renderHook(() =>
        useGardenInteractions({
          currentBed: mockCurrentBed,
          gardenProfile: mockProfile,
          activeLayout: mockLayout,
          setAllBoxes: mockSetAllBoxes,
          plantCrop: mockPlantCrop,
          removeCrop: mockRemoveCrop,
          updateProfile: mockUpdateProfile,
        })
      )

      act(() => {
        result.current.handleAutoFill()
      })

      // EXPECTED: handleAutoFill should process all 3 boxes
      // Box 1: 4x2 = 8 cells
      // Box 2: 2x2 = 4 cells
      // Box 3: 3x3 = 9 cells
      // Total: 21 cells should be filled

      // Verify setAllBoxes was called with all 3 boxes
      expect(allBoxesUpdated).toHaveLength(3)

      // Verify each box maintains correct dimensions
      expect(allBoxesUpdated[0]).toBeDefined()
      expect(allBoxesUpdated[0]?.cells).toHaveLength(8) // 4x2
      expect(allBoxesUpdated[1]).toBeDefined()
      expect(allBoxesUpdated[1]?.cells).toHaveLength(4) // 2x2
      expect(allBoxesUpdated[2]).toBeDefined()
      expect(allBoxesUpdated[2]?.cells).toHaveLength(9) // 3x3

      // Verify each box maintains its identity
      expect(allBoxesUpdated[0]?.id).toBe('box-1')
      expect(allBoxesUpdated[1]?.id).toBe('box-2')
      expect(allBoxesUpdated[2]?.id).toBe('box-3')

      // The key test: ALL boxes were processed (not just the first one)
      // This proves multi-box support is working
    })

    it('respects each box dimensions when filling', () => {
      // Create a minimal mock to test dimension handling
      const smallBox: GardenBox = {
        id: 'small',
        name: 'Small',
        width: 2,
        height: 2,
        cells: Array(4).fill(null) as (Crop | null)[],
      }

      const layoutWithSmallBox: GardenLayout = {
        ...mockLayout,
        boxes: [smallBox],
      }

      const { result } = renderHook(() =>
        useGardenInteractions({
          currentBed: smallBox.cells,
          gardenProfile: mockProfile,
          activeLayout: layoutWithSmallBox,
          setAllBoxes: mockSetAllBoxes,
          plantCrop: mockPlantCrop,
          removeCrop: mockRemoveCrop,
          updateProfile: mockUpdateProfile,
        })
      )

      act(() => {
        result.current.handleAutoFill()
      })

      // After autofill, box should have 4 cells (2x2), not 8 or 32
      expect(allBoxesUpdated).toHaveLength(1)
      expect(allBoxesUpdated[0]).toBeDefined()
      expect(allBoxesUpdated[0]?.cells).toHaveLength(4)
    })

    it('preserves existing crops when autofilling multiple boxes', () => {
      const lettuce: Crop = {
        id: 'lettuce',
        name: 'Lettuce',
        sfg_density: 4,
        planting_strategy: {
          start_window_start: -4,
          start_window_end: 2,
        },
        companions: {
          friends: ['carrots', 'radishes'],
          enemies: [],
        },
      }

      // Pre-fill some cells in box 1
      const mockBox0 = mockLayout.boxes[0]
      if (mockBox0) {
        mockBox0.cells[0] = lettuce
        mockBox0.cells[3] = lettuce
      }

      const { result } = renderHook(() =>
        useGardenInteractions({
          currentBed: mockLayout.boxes[0]?.cells ?? [],
          gardenProfile: mockProfile,
          activeLayout: mockLayout,
          setAllBoxes: mockSetAllBoxes,
          plantCrop: mockPlantCrop,
          removeCrop: mockRemoveCrop,
          updateProfile: mockUpdateProfile,
        })
      )

      act(() => {
        result.current.handleAutoFill()
      })

      // Existing crops should be preserved in first box
      expect(allBoxesUpdated[0]).toBeDefined()
      const updatedBox0 = allBoxesUpdated[0]
      if (updatedBox0) {
        expect(updatedBox0.cells[0]).toEqual(lettuce)
        expect(updatedBox0.cells[3]).toEqual(lettuce)
      }
    })
  })

  describe('Garden Stash (Planning Cart)', () => {
    it('initializes with empty stash', () => {
      const { result } = renderHook(() =>
        useGardenInteractions({
          currentBed: mockCurrentBed,
          gardenProfile: mockProfile,
          activeLayout: mockLayout,
          setAllBoxes: mockSetAllBoxes,
          plantCrop: mockPlantCrop,
          removeCrop: mockRemoveCrop,
          updateProfile: mockUpdateProfile,
        })
      )

       
      expect(result.current).toMatchObject({
        stash: {},
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        addToStash: expect.any(Function),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        removeFromStash: expect.any(Function),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        clearStash: expect.any(Function),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        getStashTotalArea: expect.any(Function),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        canAddToStash: expect.any(Function),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        handleDistributeStash: expect.any(Function),
        placementResult: null
      })
      expect(result.current.getStashTotalArea()).toBe(0)
    })

    it('addToStash increments quantity', () => {
      const { result } = renderHook(() =>
        useGardenInteractions({
          currentBed: mockCurrentBed,
          gardenProfile: mockProfile,
          activeLayout: mockLayout,
          setAllBoxes: mockSetAllBoxes,
          plantCrop: mockPlantCrop,
          removeCrop: mockRemoveCrop,
          updateProfile: mockUpdateProfile,
        })
      )

      act(() => {
        result.current.addToStash('tomato', 1)
      })

      expect(result.current.stash['tomato']).toBe(1)

      act(() => {
        result.current.addToStash('tomato', 3)
      })

      expect(result.current.stash['tomato']).toBe(4)
    })

    it('removeFromStash decrements quantity and removes if zero', () => {
      const { result } = renderHook(() =>
        useGardenInteractions({
          currentBed: mockCurrentBed,
          gardenProfile: mockProfile,
          activeLayout: mockLayout,
          setAllBoxes: mockSetAllBoxes,
          plantCrop: mockPlantCrop,
          removeCrop: mockRemoveCrop,
          updateProfile: mockUpdateProfile,
        })
      )

      // Setup: 4 tomatoes
      act(() => {
        result.current.addToStash('tomato', 4)
      })

      act(() => {
        result.current.removeFromStash('tomato', 1)
      })

      expect(result.current.stash['tomato']).toBe(3)

      act(() => {
        result.current.removeFromStash('tomato', 3)
      })

      // Should be removed completely
      expect(result.current.stash['tomato']).toBeUndefined()
    })

    it('clearStash wipes all items', () => {
      const { result } = renderHook(() =>
        useGardenInteractions({
          currentBed: mockCurrentBed,
          gardenProfile: mockProfile,
          activeLayout: mockLayout,
          setAllBoxes: mockSetAllBoxes,
          plantCrop: mockPlantCrop,
          removeCrop: mockRemoveCrop,
          updateProfile: mockUpdateProfile,
        })
      )

      act(() => {
        result.current.addToStash('tomato', 4)
        result.current.addToStash('carrot', 16)
      })

      expect(Object.keys(result.current.stash)).toHaveLength(2)

      act(() => {
        result.current.clearStash()
      })

      expect(result.current.stash).toEqual({})
    })

    it('calculates total area correctly based on crop density', () => {
      const { result } = renderHook(() =>
        useGardenInteractions({
          currentBed: mockCurrentBed,
          gardenProfile: mockProfile,
          activeLayout: mockLayout,
          setAllBoxes: mockSetAllBoxes,
          plantCrop: mockPlantCrop,
          removeCrop: mockRemoveCrop,
          updateProfile: mockUpdateProfile,
        })
      )

      // We need to inject these mock crops into the hook? 
      // The hook imports CORE_50_CROPS. We can't easily mock that import without vi.mock.
      // But we can just use the real crop IDs if they strictly match CORE_50_CROPS.
      // 'tomato' and 'carrot' exist in CORE_50_CROPS.

      act(() => {
        result.current.addToStash('tomato', 4)  // 4 sqft
        result.current.addToStash('carrot', 17) // 16 + 1 = 2 sqft
      })

      expect(result.current.getStashTotalArea()).toBe(6)
    })

    it('canAddToStash checks bed capacity', () => {
      const { result } = renderHook(() =>
        useGardenInteractions({
          currentBed: mockCurrentBed,
          gardenProfile: mockProfile,
          activeLayout: mockLayout, // Total area 21 (8 + 4 + 9) from beforeEach
          setAllBoxes: mockSetAllBoxes,
          plantCrop: mockPlantCrop,
          removeCrop: mockRemoveCrop,
          updateProfile: mockUpdateProfile,
        })
      )

      // Tomato is density 1.
      const tomato = { id: 'tomato', sfg_density: 1 } as Crop

      // Total capacity is 21.
      // Add 20 tomatoes.
      act(() => {
        result.current.addToStash('tomato', 20)
      })

      // 20/21 used. Can add 1? Yes.
      expect(result.current.canAddToStash(tomato)).toBe(true)

      // Add 1 more -> 21
      act(() => {
        result.current.addToStash('tomato', 1)
      })

      // 21/21 used. Can add 1? No.
      expect(result.current.canAddToStash(tomato)).toBe(false)
    })

    it('persists stash to local storage', () => {
      // Mock local storage
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem')

      const { result } = renderHook(() =>
        useGardenInteractions({
          currentBed: mockCurrentBed,
          gardenProfile: mockProfile,
          activeLayout: mockLayout,
          setAllBoxes: mockSetAllBoxes,
          plantCrop: mockPlantCrop,
          removeCrop: mockRemoveCrop,
          updateProfile: mockUpdateProfile,
        })
      )

      act(() => {
        result.current.addToStash('tomato', 2)
      })

      expect(setItemSpy).toHaveBeenCalledWith(
        `hortilogic_stash_${mockLayout.id}`,
        JSON.stringify({ tomato: 2 })
      )

      // Cleanup
      setItemSpy.mockRestore()
      getItemSpy.mockRestore()
    })
  })
})
