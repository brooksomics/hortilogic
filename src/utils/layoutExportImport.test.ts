import { describe, it, expect } from 'vitest'
import { exportLayoutToJSON, importLayoutFromJSON, validateImportedLayout } from './layoutExportImport'
import type { GardenLayout, GardenProfile, Crop } from '../types/garden'

describe('layoutExportImport', () => {
  const mockProfile: GardenProfile = {
    name: 'Test Garden',
    hardiness_zone: '5b',
    location: 'Denver, CO',
    last_frost_date: '2024-04-15',
    first_frost_date: '2024-10-15',
    season_extension_weeks: 2,
    targetPlantingDate: '2024-05-01',
  }

  const mockLayout: GardenLayout = {
    id: 'layout-123',
    name: 'Spring 2024',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
    profileId: 'profile-123',
    boxes: [
      {
        id: 'box-1',
        name: 'Main Bed',
        width: 4,
        height: 4,
        cells: Array(16).fill(null) as (Crop | null)[],
      },
    ],
  }

  describe('exportLayoutToJSON', () => {
    it('should export layout with metadata', () => {
      const result = exportLayoutToJSON(mockLayout, mockProfile)

      expect(result).toHaveProperty('version', 1)
      expect(result).toHaveProperty('exportedAt')
      expect(result).toHaveProperty('layout')
      expect(result).toHaveProperty('profile')
      expect(result.layout).toEqual(mockLayout)
      expect(result.profile).toEqual(mockProfile)
    })

    it('should export layout without profile', () => {
      const result = exportLayoutToJSON(mockLayout)

      expect(result).toHaveProperty('version', 1)
      expect(result).toHaveProperty('exportedAt')
      expect(result).toHaveProperty('layout')
      expect(result.profile).toBeUndefined()
    })

    it('should include valid ISO timestamp for exportedAt', () => {
      const result = exportLayoutToJSON(mockLayout)
      const timestamp = new Date(result.exportedAt)

      expect(timestamp.toISOString()).toBe(result.exportedAt)
    })
  })

  describe('validateImportedLayout', () => {
    it('should return valid for correct export format', () => {
      const exportData = exportLayoutToJSON(mockLayout, mockProfile)
      const result = validateImportedLayout(exportData)

      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject missing version', () => {
      const invalidData = {
        exportedAt: new Date().toISOString(),
        layout: mockLayout,
      }
      const result = validateImportedLayout(invalidData)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('version')
    })

    it('should reject unsupported version', () => {
      const invalidData = {
        version: 999,
        exportedAt: new Date().toISOString(),
        layout: mockLayout,
      }
      const result = validateImportedLayout(invalidData)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('version')
    })

    it('should reject missing layout', () => {
      const invalidData = {
        version: 1,
        exportedAt: new Date().toISOString(),
      }
      const result = validateImportedLayout(invalidData)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('layout')
    })

    it('should reject layout without required fields', () => {
      const invalidData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        layout: { name: 'Invalid' }, // Missing required fields
      }
      const result = validateImportedLayout(invalidData)

      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('importLayoutFromJSON', () => {
    it('should import valid layout with new IDs', () => {
      const exportData = exportLayoutToJSON(mockLayout, mockProfile)
      const result = importLayoutFromJSON(exportData, 'new-profile-id')

      expect(result.layout.id).not.toBe(mockLayout.id)
      expect(result.layout.name).toBe(mockLayout.name)
      expect(result.layout.boxes).toHaveLength(1)
      expect(result.layout.boxes[0]?.id).not.toBe(mockLayout.boxes[0]?.id)
      expect(result.layout.boxes[0]?.name).toBe(mockLayout.boxes[0]?.name)
      expect(result.layout.profileId).toBe('new-profile-id')
    })

    it('should preserve box dimensions and cells', () => {
      const layoutWithCrops: GardenLayout = {
        ...mockLayout,
        boxes: [
          {
            id: 'box-1',
            name: 'Main Bed',
            width: 4,
            height: 4,
            cells: [
              { id: 'tomato', name: 'Tomato', emoji: '🍅', sfg_density: 1, planting_strategy: { start_window_start: -2, start_window_end: 4 }, companions: { friends: [], enemies: [] } },
              null,
              null,
              null,
              null, null, null, null,
              null, null, null, null,
              null, null, null, null,
            ] as (Crop | null)[],
          },
        ],
      }

      const exportData = exportLayoutToJSON(layoutWithCrops, mockProfile)
      const result = importLayoutFromJSON(exportData, 'new-profile-id')

      expect(result.layout.boxes[0]?.width).toBe(4)
      expect(result.layout.boxes[0]?.height).toBe(4)
      expect(result.layout.boxes[0]?.cells).toHaveLength(16)
      expect(result.layout.boxes[0]?.cells[0]).toMatchObject({ id: 'tomato' })
    })

    it('should return imported profile if included', () => {
      const exportData = exportLayoutToJSON(mockLayout, mockProfile)
      const result = importLayoutFromJSON(exportData, 'new-profile-id')

      expect(result.profile).toEqual(mockProfile)
    })

    it('should handle missing profile in export', () => {
      const exportData = exportLayoutToJSON(mockLayout)
      const result = importLayoutFromJSON(exportData, 'new-profile-id')

      expect(result.profile).toBeUndefined()
    })

    it('should throw error for invalid export data', () => {
      const invalidData = {
        version: 1,
        exportedAt: new Date().toISOString(),
      }

      expect(() => importLayoutFromJSON(invalidData, 'new-profile-id')).toThrow()
    })
  })
})
