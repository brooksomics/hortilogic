import {
  ZIP3_ZONE_RANGES,
  ZONE_FROST_DATES,
} from '@/data/zipZoneData'

export interface ZipLookupResult {
  /** USDA Hardiness Zone (e.g., "5b", "10a") */
  zone: string
  /** Average last spring frost date as MM-DD */
  lastFrostMMDD: string
  /** Average first fall frost date as MM-DD */
  firstFrostMMDD: string
}

/**
 * Look up USDA hardiness zone and average frost dates by US ZIP code.
 * Uses the first 3 digits (ZIP3 prefix) for geographic matching.
 *
 * @param zipCode - 5-digit US ZIP code (e.g., "80202")
 * @returns Zone and frost dates, or null if not found
 */
export function lookupByZip(zipCode: string): ZipLookupResult | null {
  // Extract digits only (handles "80202-1234" format)
  const digits = zipCode.replace(/\D/g, '')

  if (digits.length < 5) {
    return null
  }

  const zip3 = parseInt(digits.substring(0, 3), 10)

  // Find matching range
  const match = ZIP3_ZONE_RANGES.find(
    (r) => zip3 >= r.start && zip3 <= r.end
  )

  if (!match) {
    return null
  }

  const frostDates = ZONE_FROST_DATES[match.zone]
  if (!frostDates) {
    return null
  }

  return {
    zone: match.zone,
    lastFrostMMDD: frostDates.lastFrost,
    firstFrostMMDD: frostDates.firstFrost,
  }
}
