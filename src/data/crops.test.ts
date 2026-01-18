import { describe, it, expect } from 'vitest'
import { CROP_DATABASE, CROPS_BY_ID } from './crops'

describe('CROP_DATABASE', () => {
  it('has exactly 162 crops', () => {
    expect(CROP_DATABASE).toHaveLength(162)
  })

  it('all crops have unique IDs', () => {
    const ids = CROP_DATABASE.map((c) => {
      return c.id
    })
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(162)
  })

  it('all crops have valid planting windows (start <= end)', () => {
    CROP_DATABASE.forEach((crop) => {
      expect(crop.planting_strategy.start_window_start).toBeLessThanOrEqual(
        crop.planting_strategy.start_window_end
      )
    })
  })

  it('all enemy references point to valid crop IDs', () => {
    const ids = new Set(CROP_DATABASE.map((c) => {
      return c.id
    }))
    CROP_DATABASE.forEach((crop) => {
      crop.companions.enemies.forEach((enemy) => {
        expect(ids.has(enemy)).toBe(true)
      })
    })
  })

  it('all friend references point to valid crop IDs', () => {
    const ids = new Set(CROP_DATABASE.map((c) => {
      return c.id
    }))
    CROP_DATABASE.forEach((crop) => {
      crop.companions.friends.forEach((friend) => {
        expect(ids.has(friend)).toBe(true)
      })
    })
  })

  it('all crops have valid SFG density (1, 4, 9, or 16)', () => {
    const validDensities = [1, 4, 9, 16]
    CROP_DATABASE.forEach((crop) => {
      expect(validDensities).toContain(crop.sfg_density)
    })
  })

  it('all crops have non-empty IDs', () => {
    CROP_DATABASE.forEach((crop) => {
      expect(crop.id).toBeTruthy()
      expect(crop.id.length).toBeGreaterThan(0)
    })
  })
})

describe('CROPS_BY_ID', () => {
  it('provides lookup object with all 162 crops', () => {
    expect(Object.keys(CROPS_BY_ID)).toHaveLength(162)
  })

  it('all crops in CROPS_BY_ID match their ID keys', () => {
    Object.entries(CROPS_BY_ID).forEach(([id, crop]) => {
      expect(crop.id).toBe(id)
    })
  })
})
