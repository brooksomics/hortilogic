import { describe, it, expect } from 'vitest'
import { CORE_50_CROPS, CROPS_BY_ID } from './crops'

describe('CORE_50_CROPS', () => {
  it('has exactly 50 crops', () => {
    expect(CORE_50_CROPS).toHaveLength(50)
  })

  it('all crops have unique IDs', () => {
    const ids = CORE_50_CROPS.map((c) => {
      return c.id
    })
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(50)
  })

  it('all crops have valid planting windows (start <= end)', () => {
    CORE_50_CROPS.forEach((crop) => {
      expect(crop.planting_strategy.start_window_start).toBeLessThanOrEqual(
        crop.planting_strategy.start_window_end
      )
    })
  })

  it('all enemy references point to valid crop IDs', () => {
    const ids = new Set(CORE_50_CROPS.map((c) => {
      return c.id
    }))
    CORE_50_CROPS.forEach((crop) => {
      crop.companions.enemies.forEach((enemy) => {
        expect(ids.has(enemy)).toBe(true)
      })
    })
  })

  it('all friend references point to valid crop IDs', () => {
    const ids = new Set(CORE_50_CROPS.map((c) => {
      return c.id
    }))
    CORE_50_CROPS.forEach((crop) => {
      crop.companions.friends.forEach((friend) => {
        expect(ids.has(friend)).toBe(true)
      })
    })
  })

  it('all crops have valid SFG density (1, 4, 9, or 16)', () => {
    const validDensities = [1, 4, 9, 16]
    CORE_50_CROPS.forEach((crop) => {
      expect(validDensities).toContain(crop.sfg_density)
    })
  })

  it('all crops have non-empty IDs', () => {
    CORE_50_CROPS.forEach((crop) => {
      expect(crop.id).toBeTruthy()
      expect(crop.id.length).toBeGreaterThan(0)
    })
  })
})

describe('CROPS_BY_ID', () => {
  it('provides lookup object with all 50 crops', () => {
    expect(Object.keys(CROPS_BY_ID)).toHaveLength(50)
  })

  it('all crops in CROPS_BY_ID match their ID keys', () => {
    Object.entries(CROPS_BY_ID).forEach(([id, crop]) => {
      expect(crop.id).toBe(id)
    })
  })
})
