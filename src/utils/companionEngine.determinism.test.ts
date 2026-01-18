import { describe, it, expect } from 'vitest'
import { autoFillBed } from './companionEngine'
import { CROP_DATABASE } from '../data/crops'
import type { GardenProfile } from '../types/garden'

describe('autoFillBed - Determinism (TODO-023)', () => {
  const testProfile: GardenProfile = {
    name: 'Test Garden',
    hardiness_zone: '5b',
    last_frost_date: '2024-05-15',
    first_frost_date: '2024-10-01',
    season_extension_weeks: 0,
  }

  const testDate = new Date(2024, 4, 15) // May 15, 2024
  const emptyBed = Array(32).fill(null) as (null)[]

  it('SHOULD produce identical results when called multiple times with same seed', () => {
    // This test WILL FAIL initially (proving non-determinism)
    // After implementing seeded RNG, it WILL PASS

    const results: string[][] = []

    // Run autoFill 10 times with the same seed
    for (let i = 0; i < 10; i++) {
      const filled = autoFillBed(
        [...emptyBed],
        CROP_DATABASE,
        testProfile,
        testDate,
        8, // width
        4, // height
        'test-seed-123' // SEED - should produce identical results
      )

      // Convert to crop IDs for comparison
      const cropIds = filled.map(cell => cell?.id ?? 'empty')
      results.push(cropIds)
    }

    // All 10 results should be IDENTICAL
    const firstResult = results[0]
    for (let i = 1; i < results.length; i++) {
      expect(results[i]).toEqual(firstResult)
    }
  })

  it('SHOULD produce different results with different seeds', () => {
    const result1 = autoFillBed(
      [...emptyBed],
      CROP_DATABASE,
      testProfile,
      testDate,
      8,
      4,
      'seed-A'
    )

    const result2 = autoFillBed(
      [...emptyBed],
      CROP_DATABASE,
      testProfile,
      testDate,
      8,
      4,
      'seed-B'
    )

    const ids1 = result1.map(c => c?.id ?? 'empty')
    const ids2 = result2.map(c => c?.id ?? 'empty')

    // Different seeds should produce different layouts
    expect(ids1).not.toEqual(ids2)
  })
})
