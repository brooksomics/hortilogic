import { describe, it, expect } from 'vitest'
import type { Crop } from '../types/garden'
import { getRowWaterVariance, waterPenalty, WATER_VARIANCE_WEIGHT } from './waterScoring'

function makeCrop(id: string, waterNeed: 1 | 2 | 3 | 4 | 5): Crop {
  return {
    id,
    type: 'vegetable',
    botanical_family: 'Test',
    sun: 'full',
    days_to_maturity: 60,
    water_need: waterNeed,
    sfg_density: 4,
    planting_strategy: { start_window_start: 0, start_window_end: 4 },
    companions: { friends: [], enemies: [] },
  }
}

describe('getRowWaterVariance', () => {
  it('returns 0 for a uniform row', () => {
    const cells: (Crop | null)[] = [
      makeCrop('a', 3), makeCrop('b', 3),
      makeCrop('c', 3), makeCrop('d', 3),
    ]
    expect(getRowWaterVariance(cells, 4, 0)).toBe(0)
  })

  it('returns high variance for mismatched row', () => {
    const cells: (Crop | null)[] = [
      makeCrop('a', 1), makeCrop('b', 1),
      makeCrop('c', 5), makeCrop('d', 5),
    ]
    const variance = getRowWaterVariance(cells, 4, 0)
    expect(variance).toBeGreaterThan(3)
  })

  it('returns low variance for compatible row', () => {
    const cells: (Crop | null)[] = [
      makeCrop('a', 2), makeCrop('b', 3),
      makeCrop('c', 3), makeCrop('d', 2),
    ]
    const variance = getRowWaterVariance(cells, 4, 0)
    expect(variance).toBeLessThan(1)
  })

  it('returns 0 for row with single crop', () => {
    const cells: (Crop | null)[] = [
      makeCrop('a', 4), null, null, null,
    ]
    expect(getRowWaterVariance(cells, 4, 0)).toBe(0)
  })

  it('returns null for empty row', () => {
    const cells: (Crop | null)[] = [null, null, null, null]
    expect(getRowWaterVariance(cells, 4, 0)).toBeNull()
  })

  it('handles multi-row grid correctly', () => {
    // 4 wide, 2 rows
    const cells: (Crop | null)[] = [
      makeCrop('a', 1), makeCrop('b', 1), makeCrop('c', 1), makeCrop('d', 1),
      makeCrop('e', 5), makeCrop('f', 5), makeCrop('g', 5), makeCrop('h', 5),
    ]
    expect(getRowWaterVariance(cells, 4, 0)).toBe(0)
    expect(getRowWaterVariance(cells, 4, 1)).toBe(0)
  })
})

describe('waterPenalty', () => {
  it('returns 0 penalty for uniform row', () => {
    const cells: (Crop | null)[] = [
      makeCrop('a', 3), makeCrop('b', 3),
      makeCrop('c', 3), null,
    ]
    const penalty = waterPenalty(cells, 4, 0, 3)
    expect(penalty).toBeCloseTo(0)
  })

  it('returns negative penalty for mismatched placement', () => {
    // Row has water_need 1,1,1 and we want to add 5
    const cells: (Crop | null)[] = [
      makeCrop('a', 1), makeCrop('b', 1),
      makeCrop('c', 1), null,
    ]
    const penalty = waterPenalty(cells, 4, 0, 5)
    expect(penalty).toBeLessThan(0)
  })

  it('returns 0 penalty for compatible placement', () => {
    // Row has water_need 3,3,3 and we want to add 3
    const cells: (Crop | null)[] = [
      makeCrop('a', 3), makeCrop('b', 3),
      makeCrop('c', 3), null,
    ]
    const penalty = waterPenalty(cells, 4, 0, 3)
    expect(penalty).toBeCloseTo(0)
  })

  it('returns 0 penalty for empty row', () => {
    const cells: (Crop | null)[] = [null, null, null, null]
    const penalty = waterPenalty(cells, 4, 0, 3)
    expect(penalty).toBe(0)
  })

  it('penalty magnitude scales with WATER_VARIANCE_WEIGHT', () => {
    const cells: (Crop | null)[] = [
      makeCrop('a', 1), makeCrop('b', 1), null, null,
    ]
    const penalty = waterPenalty(cells, 4, 0, 5)
    // Variance of [1,1,5] = mean=7/3≈2.33, var = ((1-2.33)^2+(1-2.33)^2+(5-2.33)^2)/3 ≈ 3.56
    // penalty = -3.56 * WATER_VARIANCE_WEIGHT
    expect(penalty).toBeCloseTo(-WATER_VARIANCE_WEIGHT * 3.556, 0)
  })
})
