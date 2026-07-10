import { describe, it, expect, beforeEach } from 'vitest'
import { exportAll, importAll } from './backupAll'

const LAYOUTS_KEY = 'hortilogic:layouts'
const PROFILES_KEY = 'hortilogic:profiles'

const PROFILE_ID = '11111111-1111-4111-8111-111111111111'
const LAYOUT_ID = '22222222-2222-4222-8222-222222222222'
const BOX_ID = '33333333-3333-4333-8333-333333333333'

const profileStorage = {
  version: 1,
  profiles: {
    [PROFILE_ID]: {
      name: 'Home',
      hardiness_zone: '10a',
      last_frost_date: '2026-01-15',
      first_frost_date: '2026-12-15',
      season_extension_weeks: 0,
    },
  },
  defaultProfileId: PROFILE_ID,
}

const layoutStorage = {
  version: 2,
  layouts: {
    [LAYOUT_ID]: {
      id: LAYOUT_ID,
      name: 'Spring',
      profileId: PROFILE_ID,
      boxes: [
        {
          id: BOX_ID,
          name: 'Box 1',
          width: 2,
          height: 2,
          cells: [null, { cropId: 'tomato', plantedAt: 1750000000000 }, null, null],
        },
      ],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  },
  activeLayoutId: LAYOUT_ID,
}

const stash = { tomato: 3, basil: 1 }

function seedStorage(): void {
  localStorage.setItem(LAYOUTS_KEY, JSON.stringify(layoutStorage))
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profileStorage))
  localStorage.setItem(`hortilogic_stash_${LAYOUT_ID}`, JSON.stringify(stash))
}

describe('backupAll', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('exportAll', () => {
    it('captures layouts, profiles, and stashes with a schema version', () => {
      seedStorage()
      const backup = exportAll()

      expect(backup.version).toBe(1)
      expect(typeof backup.exportedAt).toBe('string')
      expect(backup.layouts).toEqual(layoutStorage)
      expect(backup.profiles).toEqual(profileStorage)
      expect(backup.stashes).toEqual({ [LAYOUT_ID]: stash })
    })

    it('skips corrupted stash entries instead of throwing', () => {
      seedStorage()
      localStorage.setItem('hortilogic_stash_corrupt', 'not json {{{')
      const backup = exportAll()
      expect(backup.stashes).toEqual({ [LAYOUT_ID]: stash })
    })

    it('returns nulls and empty stashes when storage is empty', () => {
      const backup = exportAll()
      expect(backup.layouts).toBeNull()
      expect(backup.profiles).toBeNull()
      expect(backup.stashes).toEqual({})
    })
  })

  describe('importAll', () => {
    it('round-trips: export, clear storage, import restores everything', () => {
      seedStorage()
      const backup = exportAll()
      localStorage.clear()

      const result = importAll(JSON.parse(JSON.stringify(backup)))

      expect(result.ok).toBe(true)
      expect(JSON.parse(localStorage.getItem(LAYOUTS_KEY) ?? '')).toEqual(layoutStorage)
      expect(JSON.parse(localStorage.getItem(PROFILES_KEY) ?? '')).toEqual(profileStorage)
      expect(JSON.parse(localStorage.getItem(`hortilogic_stash_${LAYOUT_ID}`) ?? '')).toEqual(stash)
    })

    it('rejects a non-object payload', () => {
      const result = importAll('not a backup')
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error).toBeTruthy()
      expect(localStorage.getItem(LAYOUTS_KEY)).toBeNull()
    })

    it('rejects an unsupported version', () => {
      const result = importAll({ version: 99, exportedAt: 'x', layouts: null, profiles: null, stashes: {} })
      expect(result.ok).toBe(false)
    })

    it('rejects malformed layout data without writing anything', () => {
      const result = importAll({
        version: 1,
        exportedAt: '2026-01-01T00:00:00.000Z',
        layouts: { version: 2, layouts: { bad: { id: 'not-a-uuid' } }, activeLayoutId: LAYOUT_ID },
        profiles: null,
        stashes: {},
      })
      expect(result.ok).toBe(false)
      expect(localStorage.getItem(LAYOUTS_KEY)).toBeNull()
    })

    it('accepts a backup with null sections as a no-op success', () => {
      const result = importAll({
        version: 1,
        exportedAt: '2026-01-01T00:00:00.000Z',
        layouts: null,
        profiles: null,
        stashes: {},
      })
      expect(result.ok).toBe(true)
      expect(localStorage.getItem(LAYOUTS_KEY)).toBeNull()
    })
  })
})
