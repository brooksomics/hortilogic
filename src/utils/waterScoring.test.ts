import { describe, it, expect } from 'vitest'
import type { Crop } from '../types/garden'
import {
  getRowWaterVariance,
  waterPenalty,
  WATER_VARIANCE_WEIGHT,
  getRowWaterAverage,
  getDripLineColor,
  getWaterLabel,
} from './waterScoring'

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

describe('getRowWaterAverage', () => {
  it('returns average for a row with crops', () => {
    const cells: (Crop | null)[] = [
      makeCrop('a', 2), makeCrop('b', 4),
      makeCrop('c', 2), makeCrop('d', 4),
    ]
    expect(getRowWaterAverage(cells, 4, 0)).toBe(3)
  })

  it('returns null for empty row', () => {
    const cells: (Crop | null)[] = [null, null, null, null]
    expect(getRowWaterAverage(cells, 4, 0)).toBeNull()
  })

  it('ignores null cells in average', () => {
    const cells: (Crop | null)[] = [
      makeCrop('a', 4), null, null, makeCrop('b', 2),
    ]
    expect(getRowWaterAverage(cells, 4, 0)).toBe(3)
  })
})

describe('getDripLineColor', () => {
  it('returns gray for null (empty row)', () => {
    expect(getDripLineColor(null)).toBe('bg-gray-300')
  })

  it('returns amber for low water (1-2)', () => {
    expect(getDripLineColor(1)).toBe('bg-amber-300')
    expect(getDripLineColor(2)).toBe('bg-amber-300')
  })

  it('returns green for moderate water (2.5-3)', () => {
    expect(getDripLineColor(2.5)).toBe('bg-green-300')
    expect(getDripLineColor(3)).toBe('bg-green-300')
  })

  it('returns teal for high water (3.5-4)', () => {
    expect(getDripLineColor(3.5)).toBe('bg-teal-400')
    expect(getDripLineColor(4)).toBe('bg-teal-400')
  })

  it('returns blue for very high water (4.5-5)', () => {
    expect(getDripLineColor(4.5)).toBe('bg-blue-500')
    expect(getDripLineColor(5)).toBe('bg-blue-500')
  })
})

describe('getWaterLabel', () => {
  it('returns "empty" for null', () => {
    expect(getWaterLabel(null)).toBe('empty')
  })

  it('returns correct labels for water levels', () => {
    expect(getWaterLabel(1.5)).toBe('low water need')
    expect(getWaterLabel(2.5)).toBe('moderate water need')
    expect(getWaterLabel(3.5)).toBe('high water need')
    expect(getWaterLabel(4.5)).toBe('very high water need')
  })
})
