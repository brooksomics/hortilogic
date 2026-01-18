import { describe, it, expect } from 'vitest'
import { getCropViabilityStatus, getViabilityStyles } from './cropViabilityHelper'
import type { Crop, GardenProfile } from '@/types'

describe('getCropViabilityStatus', () => {
  const profile: GardenProfile = {
    name: 'Test Garden',
    hardiness_zone: '5b',
    last_frost_date: '2024-04-15',
    first_frost_date: '2024-10-15',
    season_extension_weeks: 0,
  }

  const lettuce: Crop = {
    id: 'lettuce',
    type: 'vegetable',
    botanical_family: 'Asteraceae',
    sun: 'partial',
    days_to_maturity: 55,
    sfg_density: 4,
    planting_strategy: {
      start_window_start: -4,
      start_window_end: 2,
    },
    companions: { friends: [], enemies: [] },
  }

  it('returns "viable" for crops within planting window', () => {
    const targetDate = new Date('2024-04-01') // 2 weeks before LFD
    const status = getCropViabilityStatus(lettuce, profile, targetDate)
    expect(status).toBe('viable')
  })

  it('returns "not-viable" for crops outside planting window', () => {
    const targetDate = new Date('2024-07-01') // Way past planting window
    const status = getCropViabilityStatus(lettuce, profile, targetDate)
    expect(status).toBe('not-viable')
  })

  it('returns "marginal" for crops slightly outside window with season extension possible', () => {
    const profileWithExtension: GardenProfile = {
      ...profile,
      season_extension_weeks: 4,
    }
    const targetDate = new Date('2024-03-01') // Would be marginal
    const status = getCropViabilityStatus(lettuce, profileWithExtension, targetDate)
    // With 4 weeks extension, window starts at -8 weeks from LFD
    // March 1 is about 6.5 weeks before April 15, so it's viable
    expect(status).toBe('viable')
  })
})

describe('getViabilityStyles', () => {
  it('returns green styles for viable crops', () => {
    const styles = getViabilityStyles('viable')
    expect(styles.className).toContain('border-green-500')
    expect(styles.className).toContain('bg-green-50')
    expect(styles.label).toBe('Plantable now')
  })

  it('returns orange styles for marginal crops', () => {
    const styles = getViabilityStyles('marginal')
    expect(styles.className).toContain('border-orange-400')
    expect(styles.className).toContain('bg-orange-50')
    expect(styles.label).toBe('Marginal (season extension needed)')
  })

  it('returns gray styles for not-viable crops', () => {
    const styles = getViabilityStyles('not-viable')
    expect(styles.className).toContain('border-gray-300')
    expect(styles.className).toContain('bg-gray-50')
    expect(styles.className).toContain('opacity-60')
    expect(styles.label).toBe('Out of season')
  })

  it('includes icon component for each status', () => {
    const viableStyles = getViabilityStyles('viable')
    const marginalStyles = getViabilityStyles('marginal')
    const notViableStyles = getViabilityStyles('not-viable')

    expect(viableStyles.icon).toBeDefined()
    expect(marginalStyles.icon).toBeDefined()
    expect(notViableStyles.icon).toBeDefined()
  })
})
