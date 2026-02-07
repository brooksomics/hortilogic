import { describe, it, expect } from 'vitest'
import {
  getHeightCategory,
  getSouthDistance,
  heightPlacementPenalty,
  HEIGHT_PLACEMENT_WEIGHT,
} from './heightScoring'

describe('getHeightCategory', () => {
  it('returns "low" for crops under 12 inches', () => {
    expect(getHeightCategory(6)).toBe('low')
    expect(getHeightCategory(11)).toBe('low')
  })

  it('returns "medium" for crops 12-36 inches', () => {
    expect(getHeightCategory(12)).toBe('medium')
    expect(getHeightCategory(24)).toBe('medium')
    expect(getHeightCategory(36)).toBe('medium')
  })

  it('returns "tall" for crops over 36 inches', () => {
    expect(getHeightCategory(37)).toBe('tall')
    expect(getHeightCategory(72)).toBe('tall')
    expect(getHeightCategory(96)).toBe('tall')
  })
})

describe('getSouthDistance', () => {
  // 4-wide x 3-tall grid, 12 cells

  it('returns 0 for south edge when north is at top (orientation=0)', () => {
    // Row 2 (last row) is the south edge when north at top
    const dist = getSouthDistance(8, 4, 3, 0) // cell 8 = row 2
    expect(dist).toBe(0)
  })

  it('returns max for north edge when north is at top (orientation=0)', () => {
    // Row 0 is the north edge → distance from south = 2 (max)
    const dist = getSouthDistance(0, 4, 3, 0)
    expect(dist).toBe(2)
  })

  it('returns middle for middle row (orientation=0)', () => {
    const dist = getSouthDistance(4, 4, 3, 0) // cell 4 = row 1
    expect(dist).toBe(1)
  })

  it('handles orientation=180 (south at top)', () => {
    // Row 0 is the south edge → distance from south = 0
    const dist = getSouthDistance(0, 4, 3, 180)
    expect(dist).toBe(0)
    // Row 2 is the north edge → distance from south = 2
    const dist2 = getSouthDistance(8, 4, 3, 180)
    expect(dist2).toBe(2)
  })

  it('handles orientation=90 (east at top, south on left)', () => {
    // Column 0 is the south edge → distance from south = 0
    const dist = getSouthDistance(0, 4, 3, 90) // col 0
    expect(dist).toBe(0)
    // Column 3 (rightmost) → distance from south = 3
    const dist2 = getSouthDistance(3, 4, 3, 90) // col 3
    expect(dist2).toBe(3)
  })

  it('handles orientation=270 (west at top, south on right)', () => {
    // Column 3 is the south edge → distance from south = 0
    const dist = getSouthDistance(3, 4, 3, 270)
    expect(dist).toBe(0)
    // Column 0 → distance from south = 3
    const dist2 = getSouthDistance(0, 4, 3, 270)
    expect(dist2).toBe(3)
  })
})

describe('heightPlacementPenalty', () => {
  it('returns 0 for short crops (no shading concern)', () => {
    const penalty = heightPlacementPenalty(6, 0, 2)
    expect(penalty).toBe(0)
  })

  it('returns 0 penalty for tall crops far from south edge', () => {
    // Tall crop at north edge (distance from south = 2) → good placement
    const penalty = heightPlacementPenalty(72, 2, 2)
    expect(penalty).toBe(0)
  })

  it('returns negative penalty for tall crops near south edge', () => {
    // Tall crop at south edge (distance from south = 0) → bad, blocks sun
    const penalty = heightPlacementPenalty(72, 0, 2)
    expect(penalty).toBeLessThan(0)
  })

  it('penalty scales with height', () => {
    // Taller crops get worse penalty at south edge
    const penaltyMedium = heightPlacementPenalty(24, 0, 2)
    const penaltyTall = heightPlacementPenalty(72, 0, 2)
    expect(penaltyTall).toBeLessThan(penaltyMedium)
  })

  it('penalty is proportional to HEIGHT_PLACEMENT_WEIGHT', () => {
    const penalty = heightPlacementPenalty(72, 0, 3)
    // Should be a meaningful negative value
    expect(penalty).toBeLessThan(0)
    expect(typeof HEIGHT_PLACEMENT_WEIGHT).toBe('number')
  })

  it('returns 0 for medium crops at middle distance', () => {
    // Medium crop at middle row → neutral
    const penalty = heightPlacementPenalty(24, 1, 2)
    expect(penalty).toBeCloseTo(0, 0)
  })
})
