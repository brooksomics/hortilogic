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

describe('CROP_DATABASE water_need (F009)', () => {
  it('all crops have a valid water_need value (1-5)', () => {
    CROP_DATABASE.forEach((crop) => {
      expect(crop.water_need).toBeGreaterThanOrEqual(1)
      expect(crop.water_need).toBeLessThanOrEqual(5)
    })
  })

  it('no single water_need score exceeds 50% of all crops', () => {
    const counts: Record<number, number> = {}
    CROP_DATABASE.forEach((crop) => {
      counts[crop.water_need] = (counts[crop.water_need] || 0) + 1
    })
    const maxAllowed = Math.floor(CROP_DATABASE.length * 0.5)
    Object.values(counts).forEach((count) => {
      expect(count).toBeLessThanOrEqual(maxAllowed)
    })
  })

  it('drought-tolerant herbs have water_need 1', () => {
    const droughtTolerant = ['rosemary', 'thyme', 'oregano', 'lavender', 'sage']
    droughtTolerant.forEach((id) => {
      const crop = CROPS_BY_ID[id]
      expect(crop).toBeDefined()
      expect(crop?.water_need).toBe(1)
    })
  })

  it('tomato varieties have water_need 3 (moderate)', () => {
    const tomatoes = CROP_DATABASE.filter((c) => {
      return c.id.startsWith('tomato-')
    })
    tomatoes.forEach((crop) => {
      expect(crop.water_need).toBe(3)
    })
  })

  it('lettuce varieties have water_need 4 (high)', () => {
    const lettuces = CROP_DATABASE.filter((c) => {
      return c.id.startsWith('lettuce-')
    })
    lettuces.forEach((crop) => {
      expect(crop.water_need).toBe(4)
    })
  })

  it('watercress has water_need 5 (very high)', () => {
    const watercress = CROPS_BY_ID['watercress']
    expect(watercress).toBeDefined()
    expect(watercress?.water_need).toBe(5)
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
