/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { migrateToLayoutsSchema } from './storageMigration'
import type {
  LegacyGardenState,
  GardenProfile,
  GardenLayout,
  Crop,
  LayoutStorage,
  ProfileStorage,
} from '../types/garden'

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

// Helper to create empty bed
const createEmptyBed = (): (Crop | null)[] => Array(32).fill(null) as (Crop | null)[]

// Helper to safely get layout from storage
function getLayout(layoutId: string, layouts: LayoutStorage): GardenLayout {
  const layout = layouts.layouts[layoutId]
  if (!layout) throw new Error(`Layout ${layoutId} not found`)
  return layout
}

// Helper to safely get profile from storage
function getProfile(profileId: string, profiles: ProfileStorage): GardenProfile {
  const profile = profiles.profiles[profileId]
  if (!profile) throw new Error(`Profile ${profileId} not found`)
  return profile
}

describe('storageMigration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('migrateToLayoutsSchema', () => {
    it('detects old schema correctly when hortilogic:garden exists', () => {
      const legacyState: LegacyGardenState = {
        currentBed: createEmptyBed(),
        gardenProfile: {
          name: 'My Garden',
          hardiness_zone: '5b',
          last_frost_date: '2024-05-15',
          first_frost_date: '2024-10-01',
          season_extension_weeks: 0,
        },
      }
      localStorage.setItem('hortilogic:garden', JSON.stringify(legacyState))

      const result = migrateToLayoutsSchema()

      expect(result.migrated).toBe(true)
      expect(result.success).toBe(true)
    })

    it('migrates single layout to "My Garden" with correct name', () => {
      const legacyState: LegacyGardenState = {
        currentBed: createEmptyBed(),
        gardenProfile: {
          name: 'My Garden',
          hardiness_zone: '5b',
          last_frost_date: '2024-05-15',
          first_frost_date: '2024-10-01',
          season_extension_weeks: 0,
        },
      }
      localStorage.setItem('hortilogic:garden', JSON.stringify(legacyState))

      migrateToLayoutsSchema()

      const layoutsStr = localStorage.getItem('hortilogic:layouts')
      if (!layoutsStr) throw new Error('Layouts not found')

      const layouts = JSON.parse(layoutsStr) as LayoutStorage
      expect(layouts.version).toBe(1)

      const layoutIds = Object.keys(layouts.layouts)
      expect(layoutIds).toHaveLength(1)

      const layoutId = layoutIds[0]
      if (!layoutId) throw new Error('Layout ID not found')
      const layout = getLayout(layoutId, layouts)
      expect(layout.name).toBe('My Garden')
    })

    it('preserves all crop data in bed during migration', () => {
      const bed = createEmptyBed()
      bed[0] = lettuce
      bed[5] = tomato

      const legacyState: LegacyGardenState = {
        currentBed: bed,
        gardenProfile: {
          name: 'Test Garden',
          hardiness_zone: '10b',
          last_frost_date: '2024-01-15',
          first_frost_date: '2024-12-01',
          season_extension_weeks: 2,
        },
      }
      localStorage.setItem('hortilogic:garden', JSON.stringify(legacyState))

      migrateToLayoutsSchema()

      const layoutsStr = localStorage.getItem('hortilogic:layouts')
      if (!layoutsStr) throw new Error('Layouts not found')
      const layouts = JSON.parse(layoutsStr) as LayoutStorage
      const layoutIds = Object.keys(layouts.layouts)
      const layoutId = layoutIds[0]
      if (!layoutId) throw new Error('Layout ID not found')
      const layout = getLayout(layoutId, layouts)

      expect(layout.bed[0]).toEqual(lettuce)
      expect(layout.bed[5]).toEqual(tomato)
      expect(layout.bed[1]).toBeNull()
    })

    it('creates profile from gardenProfile during migration', () => {
      const gardenProfile: GardenProfile = {
        name: 'My Garden',
        hardiness_zone: '7a',
        last_frost_date: '2024-04-01',
        first_frost_date: '2024-11-01',
        season_extension_weeks: 4,
      }

      const legacyState: LegacyGardenState = {
        currentBed: createEmptyBed(),
        gardenProfile,
      }
      localStorage.setItem('hortilogic:garden', JSON.stringify(legacyState))

      migrateToLayoutsSchema()

      const profilesStr = localStorage.getItem('hortilogic:profiles')
      if (!profilesStr) throw new Error('Profiles not found')

      const profiles = JSON.parse(profilesStr) as ProfileStorage
      expect(profiles.version).toBe(1)

      const profileIds = Object.keys(profiles.profiles)
      expect(profileIds).toHaveLength(1)

      const profileId = profileIds[0]
      if (!profileId) throw new Error('Profile ID not found')
      const profile = getProfile(profileId, profiles)
      expect(profile).toEqual(gardenProfile)
    })

    it('handles missing gardenProfile by using Denver defaults', () => {
      const legacyState: LegacyGardenState = {
        currentBed: createEmptyBed(),
        gardenProfile: null,
      }
      localStorage.setItem('hortilogic:garden', JSON.stringify(legacyState))

      migrateToLayoutsSchema()

      const profilesStr = localStorage.getItem('hortilogic:profiles')
      if (!profilesStr) throw new Error('Profiles not found')
      const profiles = JSON.parse(profilesStr) as ProfileStorage
      const profileIds = Object.keys(profiles.profiles)
      const profileId = profileIds[0]
      if (!profileId) throw new Error('Profile ID not found')
      const profile = getProfile(profileId, profiles)

      expect(profile.name).toBe('My Garden')
      expect(profile.hardiness_zone).toBe('5b')
      expect(profile.last_frost_date).toBe('2024-05-15')
      expect(profile.first_frost_date).toBe('2024-10-01')
      expect(profile.season_extension_weeks).toBe(0)
    })

    it('marks old key as migrated after successful migration', () => {
      const legacyState: LegacyGardenState = {
        currentBed: createEmptyBed(),
        gardenProfile: null,
      }
      localStorage.setItem('hortilogic:garden', JSON.stringify(legacyState))

      migrateToLayoutsSchema()

      const oldKey = localStorage.getItem('hortilogic:garden')
      const migratedKey = localStorage.getItem('hortilogic:garden:migrated')

      expect(oldKey).toBeNull()
      expect(migratedKey).not.toBeNull()
    })

    it('handles empty currentBed correctly', () => {
      const legacyState: LegacyGardenState = {
        currentBed: createEmptyBed(),
        gardenProfile: null,
      }
      localStorage.setItem('hortilogic:garden', JSON.stringify(legacyState))

      migrateToLayoutsSchema()

      const layoutsStr = localStorage.getItem('hortilogic:layouts')
      if (!layoutsStr) throw new Error('Layouts not found')
      const layouts = JSON.parse(layoutsStr) as LayoutStorage
      const layoutIds = Object.keys(layouts.layouts)
      const layoutId = layoutIds[0]
      if (!layoutId) throw new Error('Layout ID not found')
      const layout = getLayout(layoutId, layouts)

      expect(layout.bed).toHaveLength(32)
      expect(layout.bed.every((cell: Crop | null) => cell === null)).toBe(true)
    })

    it('generates valid UUID v4 for layout ID', () => {
      const legacyState: LegacyGardenState = {
        currentBed: createEmptyBed(),
        gardenProfile: null,
      }
      localStorage.setItem('hortilogic:garden', JSON.stringify(legacyState))

      migrateToLayoutsSchema()

      const layoutsStr = localStorage.getItem('hortilogic:layouts')
      if (!layoutsStr) throw new Error('Layouts not found')
      const layouts = JSON.parse(layoutsStr) as LayoutStorage
      const layoutIds = Object.keys(layouts.layouts)

      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      const layoutId = layoutIds[0]
      if (!layoutId) throw new Error('Layout ID not found')
      expect(layoutId).toMatch(uuidRegex)
    })

    it('sets correct timestamps (createdAt and updatedAt)', () => {
      const legacyState: LegacyGardenState = {
        currentBed: createEmptyBed(),
        gardenProfile: null,
      }
      localStorage.setItem('hortilogic:garden', JSON.stringify(legacyState))

      const beforeMigration = new Date().toISOString()
      migrateToLayoutsSchema()
      const afterMigration = new Date().toISOString()

      const layoutsStr = localStorage.getItem('hortilogic:layouts')
      if (!layoutsStr) throw new Error('Layouts not found')
      const layouts = JSON.parse(layoutsStr) as LayoutStorage
      const layoutIds = Object.keys(layouts.layouts)
      const layoutId = layoutIds[0]
      if (!layoutId) throw new Error('Layout ID not found')
      const layout = getLayout(layoutId, layouts)

      expect(layout.createdAt).toBeTruthy()
      expect(layout.updatedAt).toBeTruthy()
      expect(layout.createdAt).toBe(layout.updatedAt)

      // Timestamps should be within test execution window
      expect(layout.createdAt >= beforeMigration).toBe(true)
      expect(layout.createdAt <= afterMigration).toBe(true)
    })

    it('does not migrate if hortilogic:layouts already exists (no-op)', () => {
      const legacyState: LegacyGardenState = {
        currentBed: createEmptyBed(),
        gardenProfile: null,
      }
      localStorage.setItem('hortilogic:garden', JSON.stringify(legacyState))
      localStorage.setItem(
        'hortilogic:layouts',
        JSON.stringify({ version: 1, activeLayoutId: 'test', layouts: {} })
      )

      const result = migrateToLayoutsSchema()

      expect(result.migrated).toBe(false)
      expect(result.reason).toBe('already_migrated')

      // Old key should still exist since we didn't migrate
      const oldKey = localStorage.getItem('hortilogic:garden')
      expect(oldKey).not.toBeNull()
    })

    it('links layout to profile via profileId', () => {
      const legacyState: LegacyGardenState = {
        currentBed: createEmptyBed(),
        gardenProfile: {
          name: 'Test',
          hardiness_zone: '5b',
          last_frost_date: '2024-05-15',
          first_frost_date: '2024-10-01',
          season_extension_weeks: 0,
        },
      }
      localStorage.setItem('hortilogic:garden', JSON.stringify(legacyState))

      migrateToLayoutsSchema()

      const layoutsStr = localStorage.getItem('hortilogic:layouts')
      const profilesStr = localStorage.getItem('hortilogic:profiles')
      if (!layoutsStr || !profilesStr) throw new Error('Storage not found')

      const layouts = JSON.parse(layoutsStr) as LayoutStorage
      const profiles = JSON.parse(profilesStr) as ProfileStorage

      const layoutIds = Object.keys(layouts.layouts)
      const profileIds = Object.keys(profiles.profiles)

      const layoutId = layoutIds[0]
      const profileId = profileIds[0]
      if (!layoutId || !profileId) throw new Error('IDs not found')
      const layout = getLayout(layoutId, layouts)

      expect(layout.profileId).toBe(profileId)
    })
  })
})
