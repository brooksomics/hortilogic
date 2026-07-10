import { describe, it, expect } from 'vitest'
import { calculatePlantingDate, isCropViable } from './dateEngine'
import type { Crop, GardenProfile } from '@/types'

describe('calculatePlantingDate', () => {
  it('calculates date correctly when offsetWeeks is 0', () => {
    const lfd = new Date('2024-04-15')
    const result = calculatePlantingDate(lfd, 0)
    expect(result.toISOString().split('T')[0]).toBe('2024-04-15')
  })

  it('calculates date correctly with positive offset (after LFD)', () => {
    const lfd = new Date('2024-04-15')
    const result = calculatePlantingDate(lfd, 2) // 2 weeks after
    expect(result.toISOString().split('T')[0]).toBe('2024-04-29')
  })

  it('calculates date correctly with negative offset (before LFD)', () => {
    const lfd = new Date('2024-04-15')
    const result = calculatePlantingDate(lfd, -4) // 4 weeks before
    expect(result.toISOString().split('T')[0]).toBe('2024-03-18')
  })

  it('handles month boundaries correctly', () => {
    const lfd = new Date('2024-05-01')
    const result = calculatePlantingDate(lfd, -2) // 2 weeks before (crosses into April)
    expect(result.toISOString().split('T')[0]).toBe('2024-04-17')
  })

  it('handles year boundaries correctly', () => {
    const lfd = new Date('2024-01-10')
    const result = calculatePlantingDate(lfd, -3) // 3 weeks before (crosses into previous year)
    expect(result.toISOString().split('T')[0]).toBe('2023-12-20')
  })

  it('handles leap years correctly', () => {
    const lfd = new Date('2024-03-01') // 2024 is a leap year
    const result = calculatePlantingDate(lfd, -1) // 1 week before (should be Feb 23, not Feb 22)
    expect(result.toISOString().split('T')[0]).toBe('2024-02-23')
  })

  it('returns a new Date object (does not mutate input)', () => {
    const lfd = new Date('2024-04-15')
    const originalTime = lfd.getTime()
    calculatePlantingDate(lfd, 2)
    expect(lfd.getTime()).toBe(originalTime)
  })
})

describe('isCropViable', () => {
  const profile: GardenProfile = {
    name: 'Test Garden',
    hardiness_zone: '5b',
    last_frost_date: '2024-04-15',
    first_frost_date: '2024-10-15',
    season_extension_weeks: 0
  }

  const lettuce: Crop = {
    id: 'lettuce',
    type: 'vegetable',
    botanical_family: 'Asteraceae',
    sun: 'partial',
    days_to_maturity: 55,
    water_need: 3,
    height_inches: 24,
    trellisable: false,
    sfg_density: 4,
    planting_strategy: {
      start_window_start: -4, // 4 weeks before LFD
      start_window_end: 2     // up to 2 weeks after LFD
    },
    companions: { friends: [], enemies: [] }
  }

  it('returns TRUE when target date falls within planting window', () => {
    // Test date exactly at window start (4 weeks before LFD = March 18)
    const dateAtStart = new Date('2024-03-18')
    expect(isCropViable(lettuce, profile, dateAtStart)).toBe(true)

    // Test date in middle of window (LFD = April 15)
    const dateInMiddle = new Date('2024-04-15')
    expect(isCropViable(lettuce, profile, dateInMiddle)).toBe(true)

    // Test date at window end (2 weeks after LFD = April 29)
    const dateAtEnd = new Date('2024-04-29')
    expect(isCropViable(lettuce, profile, dateAtEnd)).toBe(true)
  })

  it('returns FALSE when target date is before planting window', () => {
    // 5 weeks before LFD (outside the -4 week start window)
    const dateTooEarly = new Date('2024-03-11')
    expect(isCropViable(lettuce, profile, dateTooEarly)).toBe(false)
  })

  it('returns FALSE when target date is after planting window', () => {
    // 3 weeks after LFD (outside the 2 week end window)
    const dateTooLate = new Date('2024-05-06')
    expect(isCropViable(lettuce, profile, dateTooLate)).toBe(false)
  })

  it('returns TRUE when season_extension_weeks shifts date into valid window', () => {
    const profileWithExtension: GardenProfile = {
      ...profile,
      season_extension_weeks: 2 // Extend season by 2 weeks earlier
    }

    // Date that was previously too early (5 weeks before LFD)
    // With 2 week extension, window now starts at -6 weeks, so -5 is valid
    const previouslyTooEarly = new Date('2024-03-11')
    expect(isCropViable(lettuce, profileWithExtension, previouslyTooEarly)).toBe(true)

    // Verify the extended window start (6 weeks before = March 4)
    const extendedWindowStart = new Date('2024-03-04')
    expect(isCropViable(lettuce, profileWithExtension, extendedWindowStart)).toBe(true)
  })

  it('handles crops with positive-only planting windows (after frost only)', () => {
    const tomatoCrop: Crop = {
      id: 'tomato',
      type: 'vegetable',
      botanical_family: 'Solanaceae',
      sun: 'full',
      days_to_maturity: 80,
      water_need: 3,
      height_inches: 24,
      trellisable: false,
      sfg_density: 1,
      planting_strategy: {
        start_window_start: 0,  // At LFD
        start_window_end: 4     // Up to 4 weeks after
      },
      companions: { friends: [], enemies: [] }
    }

    // Before LFD should be invalid
    const beforeLFD = new Date('2024-04-01')
    expect(isCropViable(tomatoCrop, profile, beforeLFD)).toBe(false)

    // At LFD should be valid
    const atLFD = new Date('2024-04-15')
    expect(isCropViable(tomatoCrop, profile, atLFD)).toBe(true)

    // 2 weeks after LFD should be valid
    const afterLFD = new Date('2024-04-29')
    expect(isCropViable(tomatoCrop, profile, afterLFD)).toBe(true)
  })

  it('handles crops with all-negative planting windows (early spring only)', () => {
    const peasCrop: Crop = {
      id: 'peas',
      type: 'vegetable',
      botanical_family: 'Fabaceae',
      sun: 'full',
      days_to_maturity: 60,
      water_need: 3,
      height_inches: 24,
      trellisable: false,
      sfg_density: 8,
      planting_strategy: {
        start_window_start: -8, // 8 weeks before LFD
        start_window_end: -2    // Up to 2 weeks before LFD
      },
      companions: { friends: [], enemies: [] }
    }

    // 6 weeks before LFD should be valid (within -8 to -2 window)
    const earlySpring = new Date('2024-03-04')
    expect(isCropViable(peasCrop, profile, earlySpring)).toBe(true)

    // At LFD should be invalid (outside window)
    const atLFD = new Date('2024-04-15')
    expect(isCropViable(peasCrop, profile, atLFD)).toBe(false)
  })
})

describe('isCropViable - FFD-based window extension for long-season climates', () => {
  const socalProfile: GardenProfile = {
    name: 'SoCal Garden',
    hardiness_zone: '10a',
    last_frost_date: '2026-01-15',
    first_frost_date: '2026-12-31',
    season_extension_weeks: 0
  }

  const bellPepper: Crop = {
    id: 'pepper-bell',
    type: 'vegetable',
    botanical_family: 'Solanaceae',
    sun: 'full',
    days_to_maturity: 70,
    water_need: 3,
    height_inches: 30,
    trellisable: false,
    sfg_density: 1,
    planting_strategy: {
      start_window_start: 1,  // 1 week after LFD
      start_window_end: 6     // up to 6 weeks after LFD (~Feb 26)
    },
    companions: { friends: [], enemies: [] }
  }

  it('returns TRUE for April 11 planting in SoCal (ample time before FFD Dec 31)', () => {
    // Apr 11 is ~12.6 weeks after Jan 15 LFD — past fixed window end (Feb 26)
    // But Dec 31 FFD - 70 days maturity - 14 buffer = ~Oct 8, so still plantable
    const april11 = new Date('2026-04-11')
    expect(isCropViable(bellPepper, socalProfile, april11)).toBe(true)
  })

  it('returns FALSE when too late to mature before FFD', () => {
    // Oct 20 + 70 days + 14 buffer = Jan 12, which is after Dec 31 FFD
    const oct20 = new Date('2026-10-20')
    expect(isCropViable(bellPepper, socalProfile, oct20)).toBe(false)
  })

  it('does NOT extend window for cold-tolerant crops (start_window_start < 0)', () => {
    const lettuce: Crop = {
      id: 'lettuce',
      type: 'vegetable',
      botanical_family: 'Asteraceae',
      sun: 'partial',
      days_to_maturity: 55,
      water_need: 3,
      height_inches: 24,
      trellisable: false,
      sfg_density: 4,
      planting_strategy: {
        start_window_start: -4, // cold-tolerant: can plant before LFD
        start_window_end: 2
      },
      companions: { friends: [], enemies: [] }
    }

    // April 11 in SoCal is ~12.6 weeks after Jan 15 LFD — well past the 2-week window end
    // Even though FFD is Dec 31, lettuce is heat-sensitive: no extension applied
    const april11 = new Date('2026-04-11')
    expect(isCropViable(lettuce, socalProfile, april11)).toBe(false)
  })

  it('does NOT extend window for early-spring-only crops (start_window_end < 0)', () => {
    const peas: Crop = {
      id: 'peas',
      type: 'vegetable',
      botanical_family: 'Fabaceae',
      sun: 'full',
      days_to_maturity: 60,
      water_need: 3,
      height_inches: 24,
      trellisable: false,
      sfg_density: 8,
      planting_strategy: {
        start_window_start: -8,
        start_window_end: -2
      },
      companions: { friends: [], enemies: [] }
    }

    // April 11 is after LFD — cold-season window is closed, no FFD extension
    const april11 = new Date('2026-04-11')
    expect(isCropViable(peas, socalProfile, april11)).toBe(false)
  })
})
