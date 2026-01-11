import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  readProfileStorage,
  readLayoutStorage,
  readStashStorage,
  writeProfileStorage,
  writeLayoutStorage,
  writeStashStorage,
  safeRead,
} from './storageHelpers'
import { ProfileStorageSchema, LayoutStorageSchema, StashStorageSchema } from '../schemas/garden'

describe('storageHelpers - Zod Validation (TODO-024)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('readProfileStorage', () => {
    it('returns valid ProfileStorage when data is correct', () => {
      const validData = {
        version: 1,
        profiles: {
          'test-uuid-123': {
            name: 'Test Garden',
            hardiness_zone: '5b',
            last_frost_date: '2024-05-15',
            first_frost_date: '2024-10-01',
            season_extension_weeks: 0,
          },
        },
        defaultProfileId: 'test-uuid-123',
      }

      localStorage.setItem('test-key', JSON.stringify(validData))
      const result = readProfileStorage('test-key')

      expect(result).toEqual(validData)
    })

    it('returns null for invalid version', () => {
      const invalidData = {
        version: 2, // Wrong version
        profiles: {},
        defaultProfileId: 'test-uuid',
      }

      localStorage.setItem('test-key', JSON.stringify(invalidData))
      const result = readProfileStorage('test-key')

      expect(result).toBeNull()
    })

    it('returns null for missing required fields', () => {
      const invalidData = {
        version: 1,
        // Missing profiles and defaultProfileId
      }

      localStorage.setItem('test-key', JSON.stringify(invalidData))
      const result = readProfileStorage('test-key')

      expect(result).toBeNull()
    })

    it('returns null for corrupted JSON', () => {
      localStorage.setItem('test-key', 'invalid JSON{{{')
      const result = readProfileStorage('test-key')

      expect(result).toBeNull()
    })

    it('returns null when key does not exist', () => {
      const result = readProfileStorage('nonexistent-key')
      expect(result).toBeNull()
    })

    it('validates profile structure (invalid hardiness zone)', () => {
      const invalidData = {
        version: 1,
        profiles: {
          'test-uuid': {
            name: 'Test',
            hardiness_zone: 'invalid', // Should be like "5b"
            last_frost_date: '2024-05-15',
            first_frost_date: '2024-10-01',
            season_extension_weeks: 0,
          },
        },
        defaultProfileId: 'test-uuid',
      }

      localStorage.setItem('test-key', JSON.stringify(invalidData))
      const result = readProfileStorage('test-key')

      expect(result).toBeNull()
    })
  })

  describe('readLayoutStorage', () => {
    it('returns valid LayoutStorage when data is correct', () => {
      const validData = {
        version: 1,
        layouts: {
          'layout-uuid': {
            id: 'layout-uuid',
            name: 'Spring 2024',
            profileId: 'profile-uuid',
            boxes: [
              {
                id: 'box-uuid',
                name: 'Main Bed',
                width: 8,
                height: 4,
                cells: Array(32).fill(null),
              },
            ],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        },
        activeLayoutId: 'layout-uuid',
      }

      localStorage.setItem('test-key', JSON.stringify(validData))
      const result = readLayoutStorage('test-key')

      expect(result).toEqual(validData)
    })

    it('returns null for invalid UUID format', () => {
      const invalidData = {
        version: 1,
        layouts: {
          'not-a-uuid': {
            // Invalid UUID in key
            id: 'not-a-uuid',
            name: 'Test',
            profileId: 'also-not-uuid',
            boxes: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        },
        activeLayoutId: 'not-a-uuid',
      }

      localStorage.setItem('test-key', JSON.stringify(invalidData))
      const result = readLayoutStorage('test-key')

      expect(result).toBeNull()
    })

    it('returns null for layout with no boxes', () => {
      const invalidData = {
        version: 1,
        layouts: {
          'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a': {
            id: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
            name: 'Empty Layout',
            profileId: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b',
            boxes: [], // Invalid: must have at least one box
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        },
        activeLayoutId: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
      }

      localStorage.setItem('test-key', JSON.stringify(invalidData))
      const result = readLayoutStorage('test-key')

      expect(result).toBeNull()
    })
  })

  describe('readStashStorage', () => {
    it('returns valid stash when data is correct', () => {
      const validStash = {
        tomato: 5,
        carrot: 10,
        lettuce: 8,
      }

      localStorage.setItem('test-key', JSON.stringify(validStash))
      const result = readStashStorage('test-key')

      expect(result).toEqual(validStash)
    })

    it('returns empty stash for invalid data', () => {
      const invalidStash = {
        tomato: -5, // Negative quantity is invalid
      }

      localStorage.setItem('test-key', JSON.stringify(invalidStash))
      const result = readStashStorage('test-key')

      expect(result).toEqual({})
    })

    it('returns empty stash when key does not exist', () => {
      const result = readStashStorage('nonexistent-key')
      expect(result).toEqual({})
    })

    it('returns empty stash for corrupted JSON', () => {
      localStorage.setItem('test-key', 'corrupted{{{')
      const result = readStashStorage('test-key')

      expect(result).toEqual({})
    })
  })

  describe('writeProfileStorage', () => {
    it('writes valid data successfully', () => {
      const validData = {
        version: 1,
        profiles: {
          'e68d7dc2-b2a0-4a68-b1af-8eb18aab7e6c': {
            name: 'Test Garden',
            hardiness_zone: '5b',
            last_frost_date: '2024-05-15',
            first_frost_date: '2024-10-01',
            season_extension_weeks: 0,
          },
        },
        defaultProfileId: 'e68d7dc2-b2a0-4a68-b1af-8eb18aab7e6c',
      }

      const result = writeProfileStorage('test-key', validData)

      expect(result).toBe(true)
      const stored = localStorage.getItem('test-key')
      expect(JSON.parse(stored!)).toEqual(validData)
    })

    it('rejects invalid data and returns false', () => {
      const invalidData = {
        version: 1,
        profiles: {},
        // Missing defaultProfileId
      }

      const result = writeProfileStorage('test-key', invalidData)

      expect(result).toBe(false)
      expect(localStorage.getItem('test-key')).toBeNull()
    })
  })

  describe('writeLayoutStorage', () => {
    it('writes valid data successfully', () => {
      const validData = {
        version: 1,
        layouts: {
          'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d': {
            id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
            name: 'Test Layout',
            profileId: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
            boxes: [
              {
                id: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
                name: 'Main Bed',
                width: 8,
                height: 4,
                cells: Array(32).fill(null),
              },
            ],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        },
        activeLayoutId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      }

      const result = writeLayoutStorage('test-key', validData)

      expect(result).toBe(true)
    })

    it('rejects invalid UUIDs', () => {
      const invalidData = {
        version: 1,
        layouts: {
          'not-a-uuid': {
            id: 'not-a-uuid',
            name: 'Test',
            profileId: 'also-not-uuid',
            boxes: [
              {
                id: 'box-not-uuid',
                name: 'Bed',
                width: 4,
                height: 4,
                cells: Array(16).fill(null),
              },
            ],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        },
        activeLayoutId: 'not-a-uuid',
      }

      const result = writeLayoutStorage('test-key', invalidData)

      expect(result).toBe(false)
    })
  })

  describe('writeStashStorage', () => {
    it('writes valid stash successfully', () => {
      const validStash = {
        tomato: 5,
        carrot: 10,
      }

      const result = writeStashStorage('test-key', validStash)

      expect(result).toBe(true)
      const stored = localStorage.getItem('test-key')
      expect(JSON.parse(stored!)).toEqual(validStash)
    })

    it('rejects invalid stash (negative quantities)', () => {
      const invalidStash = {
        tomato: -5,
      }

      const result = writeStashStorage('test-key', invalidStash)

      expect(result).toBe(false)
    })
  })

  describe('safeRead', () => {
    it('returns validated data when valid', () => {
      const validStash = { tomato: 5 }
      localStorage.setItem('test-key', JSON.stringify(validStash))

      const result = safeRead('test-key', StashStorageSchema, {})

      expect(result).toEqual(validStash)
    })

    it('returns fallback when data is invalid', () => {
      const invalidStash = { tomato: -5 }
      localStorage.setItem('test-key', JSON.stringify(invalidStash))

      const fallback = { carrot: 10 }
      const result = safeRead('test-key', StashStorageSchema, fallback)

      expect(result).toEqual(fallback)
    })

    it('returns fallback when key does not exist', () => {
      const fallback = { lettuce: 3 }
      const result = safeRead('nonexistent', StashStorageSchema, fallback)

      expect(result).toEqual(fallback)
    })

    it('returns fallback for corrupted JSON', () => {
      localStorage.setItem('test-key', 'corrupted JSON{{{')

      const fallback = { default: 1 }
      const result = safeRead('test-key', StashStorageSchema, fallback)

      expect(result).toEqual(fallback)
    })
  })
})
