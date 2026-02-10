import { describe, it, expect } from 'vitest'
import { lookupByZip } from './zipLookup'

describe('lookupByZip', () => {
  it('returns zone and frost dates for a valid ZIP code', () => {
    // Denver, CO area (ZIP 802xx)
    const result = lookupByZip('80202')
    expect(result).not.toBeNull()
    if (!result) return
    expect(result.zone).toBeDefined()
    expect(result.lastFrostMMDD).toMatch(/^\d{2}-\d{2}$/)
    expect(result.firstFrostMMDD).toMatch(/^\d{2}-\d{2}$/)
  })

  it('returns correct zone for known ZIP codes', () => {
    // Boston, MA area (ZIP 021xx) - zone 6b
    const boston = lookupByZip('02101')
    expect(boston).not.toBeNull()
    if (!boston) return
    expect(boston.zone).toBe('6b')

    // Miami, FL area (ZIP 331xx) - zone 10b
    const miami = lookupByZip('33101')
    expect(miami).not.toBeNull()
    if (!miami) return
    expect(miami.zone).toBe('10b')

    // Minneapolis, MN area (ZIP 554xx) - zone 4a
    const minneapolis = lookupByZip('55401')
    expect(minneapolis).not.toBeNull()
    if (!minneapolis) return
    expect(minneapolis.zone).toBe('4a')
  })

  it('uses first 3 digits of ZIP for lookup', () => {
    // All ZIPs starting with 802 should return the same result
    const a = lookupByZip('80201')
    const b = lookupByZip('80299')
    expect(a).toEqual(b)
  })

  it('returns null for empty string', () => {
    expect(lookupByZip('')).toBeNull()
  })

  it('returns null for non-numeric input', () => {
    expect(lookupByZip('abcde')).toBeNull()
  })

  it('returns null for ZIP codes shorter than 5 digits', () => {
    expect(lookupByZip('123')).toBeNull()
    expect(lookupByZip('1234')).toBeNull()
  })

  it('returns null for unknown ZIP3 prefix', () => {
    // ZIP3 prefix 000 is not allocated
    expect(lookupByZip('00099')).toBeNull()
  })

  it('handles ZIP codes with leading zeros', () => {
    // Connecticut area (ZIP 060xx)
    const result = lookupByZip('06001')
    expect(result).not.toBeNull()
    if (!result) return
    expect(result.zone).toBeDefined()
  })

  it('returns frost dates in correct chronological order', () => {
    const result = lookupByZip('80202')
    expect(result).not.toBeNull()
    if (!result) return

    // Last frost (spring) should be before first frost (fall)
    const lastMonth = parseInt(result.lastFrostMMDD.split('-')[0] ?? '0')
    const firstMonth = parseInt(result.firstFrostMMDD.split('-')[0] ?? '0')
    expect(lastMonth).toBeLessThan(firstMonth)
  })

  it('builds full ISO date string with provided year', () => {
    const result = lookupByZip('80202')
    expect(result).not.toBeNull()
    if (!result) return

    const year = String(2026)
    const lastFrostISO = `${year}-${result.lastFrostMMDD}`
    const firstFrostISO = `${year}-${result.firstFrostMMDD}`

    // Should be valid ISO date strings
    expect(new Date(lastFrostISO).toString()).not.toBe('Invalid Date')
    expect(new Date(firstFrostISO).toString()).not.toBe('Invalid Date')
  })

  it('ignores extra characters beyond 5 digits', () => {
    const full = lookupByZip('80202')
    const withExtra = lookupByZip('80202-1234')
    expect(full).toEqual(withExtra)
  })
})
