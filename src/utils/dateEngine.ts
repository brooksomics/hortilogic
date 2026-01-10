import type { Crop, GardenProfile } from '@/types'

/**
 * Normalize a date to midnight local time for accurate date-only comparisons
 * @param date - The date to normalize
 * @returns New Date object set to midnight (00:00:00) local time
 */
function normalizeDateToMidnight(date: Date): Date {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

/**
 * Calculate a planting date by adding/subtracting weeks from a reference date (typically Last Frost Date)
 *
 * @param lfd - Last Frost Date (or any reference date)
 * @param offsetWeeks - Number of weeks to offset. Negative = before, Positive = after
 * @returns New Date object representing the calculated planting date
 *
 * @example
 * // Calculate date 4 weeks before last frost
 * const lfd = new Date('2024-04-15')
 * const plantingDate = calculatePlantingDate(lfd, -4) // 2024-03-18
 */
export function calculatePlantingDate(lfd: Date, offsetWeeks: number): Date {
  // Create a new Date to avoid mutating the input
  const result = new Date(lfd)

  // Add/subtract days (offsetWeeks * 7)
  result.setDate(result.getDate() + (offsetWeeks * 7))

  return result
}

/**
 * Determine if a crop is viable to plant on a target date given the garden profile
 *
 * @param crop - The crop to check
 * @param currentProfile - The garden profile with frost dates and season extension
 * @param targetDate - The date to check if planting is viable
 * @returns true if the crop can be planted on the target date, false otherwise
 *
 * @example
 * const lettuce: Crop = {
 *   id: 'lettuce',
 *   sfg_density: 4,
 *   planting_strategy: { start_window_start: -4, start_window_end: 2 }
 * }
 * const profile: GardenProfile = {
 *   last_frost_date: '2024-04-15',
 *   first_frost_date: '2024-10-15',
 *   season_extension_weeks: 0
 * }
 * const targetDate = new Date('2024-04-01')
 * const viable = isCropViable(lettuce, profile, targetDate) // true (4 weeks before LFD)
 */
export function isCropViable(
  crop: Crop,
  currentProfile: GardenProfile,
  targetDate: Date
): boolean {
  const lfd = new Date(currentProfile.last_frost_date)

  // Calculate the start and end of the planting window
  // Apply season extension to extend the window earlier
  const windowStart = calculatePlantingDate(
    lfd,
    crop.planting_strategy.start_window_start - currentProfile.season_extension_weeks
  )
  const windowEnd = calculatePlantingDate(
    lfd,
    crop.planting_strategy.start_window_end
  )

  // Normalize all dates to midnight for accurate date-only comparison
  const normalizedTarget = normalizeDateToMidnight(targetDate)
  const normalizedStart = normalizeDateToMidnight(windowStart)
  const normalizedEnd = normalizeDateToMidnight(windowEnd)

  // Check if target date falls within the window (inclusive)
  return normalizedTarget >= normalizedStart && normalizedTarget <= normalizedEnd
}
