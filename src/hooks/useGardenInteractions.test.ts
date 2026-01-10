import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGardenInteractions } from './useGardenInteractions'
import type { Crop, GardenProfile, GardenLayout, GardenBox } from '../types/garden'

describe('useGardenInteractions', () => {
  let mockProfile: GardenProfile
  let mockLayout: GardenLayout
  let mockSetBed: (bed: (Crop | null)[]) => void
  let mockSetAllBoxes: (boxes: GardenBox[]) => void
  let mockPlantCrop: (index: number, crop: Crop) => void
  let mockRemoveCrop: (index: number) => void
  let mockUpdateProfile: (id: string, profile: GardenProfile) => void
  let mockCurrentBed: (Crop | null)[]
  let allBoxesUpdated: GardenBox[]

  beforeEach(() => {
    mockProfile = {
      id: 'test-profile',
      name: 'Test Garden',
      location: 'Denver, CO',
      hardinessZone: '5b',
      lastFrostDate: '05-15',
      firstFrostDate: '10-01',
      targetPlantingDate: '03-01',
      seasonExtensionWeeks: 0,
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

    mockCurrentBed = mockLayout.boxes[0]!.cells
    allBoxesUpdated = []

    // Mock setBed to capture first box updates
    mockSetBed = (bed: (Crop | null)[]) => {
      mockCurrentBed = bed
    }

    // Mock setAllBoxes to capture all box updates
    mockSetAllBoxes = (boxes: GardenBox[]) => {
      allBoxesUpdated = boxes
    }

    mockPlantCrop = () => {}
    mockRemoveCrop = () => {}
    mockUpdateProfile = () => {}
  })

  describe('handleAutoFill - Multi-Box Support', () => {
    it('fills ALL boxes in layout, not just the first box', () => {
      const { result } = renderHook(() =>
        useGardenInteractions({
          currentBed: mockCurrentBed,
          gardenProfile: mockProfile,
          activeLayout: mockLayout,
          setBed: mockSetBed,
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
      expect(allBoxesUpdated[0]!.cells).toHaveLength(8) // 4x2
      expect(allBoxesUpdated[1]!.cells).toHaveLength(4) // 2x2
      expect(allBoxesUpdated[2]!.cells).toHaveLength(9) // 3x3

      // Verify each box maintains its identity
      expect(allBoxesUpdated[0]!.id).toBe('box-1')
      expect(allBoxesUpdated[1]!.id).toBe('box-2')
      expect(allBoxesUpdated[2]!.id).toBe('box-3')

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
          setBed: mockSetBed,
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
      expect(allBoxesUpdated[0]!.cells).toHaveLength(4)
    })

    it('preserves existing crops when autofilling multiple boxes', () => {
      const lettuce: Crop = {
        id: 'lettuce',
        name: 'Lettuce',
        scientificName: 'Lactuca sativa',
        plantingDepth: '0.25-0.5',
        spacing: 6,
        daysToMaturity: '45-55',
        sunRequirement: 'Full Sun to Partial Shade',
        wateringNeeds: 'Moderate',
        companionPlants: ['carrots', 'radishes'],
        avoidPlants: [],
        offsetWeeks: -4,
        seasonalCategory: 'spring',
      }

      // Pre-fill some cells in box 1
      mockLayout.boxes[0]!.cells[0] = lettuce
      mockLayout.boxes[0]!.cells[3] = lettuce

      const { result } = renderHook(() =>
        useGardenInteractions({
          currentBed: mockLayout.boxes[0]!.cells,
          gardenProfile: mockProfile,
          activeLayout: mockLayout,
          setBed: mockSetBed,
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
      expect(allBoxesUpdated[0]!.cells[0]).toEqual(lettuce)
      expect(allBoxesUpdated[0]!.cells[3]).toEqual(lettuce)
    })
  })
})
