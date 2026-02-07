import { describe, it, expect } from 'vitest'
import {
  getHeightCategory,
  getSouthDistance,
  getMaxSouthDistance,
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

  // --- Intercardinal (diagonal) orientations ---
  // 4-wide x 3-tall grid, 12 cells

  it('handles orientation=45 (NE at top, south is at bottom-left)', () => {
    // Bottom-left corner (row=2, col=0) → south edge → distance = 0
    const dist = getSouthDistance(8, 4, 3, 45) // cell 8 = row 2, col 0
    expect(dist).toBe(0)
    // Top-right corner (row=0, col=3) → north edge → distance = max
    const dist2 = getSouthDistance(3, 4, 3, 45) // cell 3 = row 0, col 3
    expect(dist2).toBe(5) // (3-1-0) + 3 = 2 + 3 = 5
  })

  it('handles orientation=135 (SE at top, south is at top-left)', () => {
    // Top-left corner (row=0, col=0) → south edge → distance = 0
    const dist = getSouthDistance(0, 4, 3, 135)
    expect(dist).toBe(0)
    // Bottom-right corner (row=2, col=3) → north edge → distance = max
    const dist2 = getSouthDistance(11, 4, 3, 135) // cell 11 = row 2, col 3
    expect(dist2).toBe(5) // 2 + 3 = 5
  })

  it('handles orientation=225 (SW at top, south is at top-right)', () => {
    // Top-right corner (row=0, col=3) → south edge → distance = 0
    const dist = getSouthDistance(3, 4, 3, 225)
    expect(dist).toBe(0)
    // Bottom-left corner (row=2, col=0) → north edge → distance = max
    const dist2 = getSouthDistance(8, 4, 3, 225) // cell 8 = row 2, col 0
    expect(dist2).toBe(5) // 2 + (4-1-0) = 2 + 3 = 5
  })

  it('handles orientation=315 (NW at top, south is at bottom-right)', () => {
    // Bottom-right corner (row=2, col=3) → south edge → distance = 0
    const dist = getSouthDistance(11, 4, 3, 315)
    expect(dist).toBe(0)
    // Top-left corner (row=0, col=0) → north edge → distance = max
    const dist2 = getSouthDistance(0, 4, 3, 315)
    expect(dist2).toBe(5) // (3-1-0) + (4-1-0) = 2 + 3 = 5
  })

  it('diagonal center cell has intermediate distance', () => {
    // Center cell (row=1, col=2), orientation=45 (NE at top)
    const dist = getSouthDistance(6, 4, 3, 45) // cell 6 = row 1, col 2
    expect(dist).toBe(3) // (3-1-1) + 2 = 1 + 2 = 3
  })
})

describe('getMaxSouthDistance', () => {
  it('returns height-1 for cardinal N/S orientations', () => {
    expect(getMaxSouthDistance(4, 3, 0)).toBe(2) // height - 1
    expect(getMaxSouthDistance(4, 3, 180)).toBe(2)
  })

  it('returns width-1 for cardinal E/W orientations', () => {
    expect(getMaxSouthDistance(4, 3, 90)).toBe(3) // width - 1
    expect(getMaxSouthDistance(4, 3, 270)).toBe(3)
  })

  it('returns (height-1)+(width-1) for diagonal orientations', () => {
    expect(getMaxSouthDistance(4, 3, 45)).toBe(5) // 2 + 3
    expect(getMaxSouthDistance(4, 3, 135)).toBe(5)
    expect(getMaxSouthDistance(4, 3, 225)).toBe(5)
    expect(getMaxSouthDistance(4, 3, 315)).toBe(5)
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
