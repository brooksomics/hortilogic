import type { Crop } from '@/types'

/**
 * Weight applied to water variance penalty.
 * A variance of 1.0 costs ~2 points (comparable to 2 friend bonuses).
 */
export const WATER_VARIANCE_WEIGHT = 2.0

/**
 * Calculate the statistical variance of water_need values in a row.
 * @returns Variance (0 = uniform), or null if row is empty.
 */
export function getRowWaterVariance(
  cells: (Crop | null)[],
  width: number,
  rowIndex: number
): number | null {
  const rowStart = rowIndex * width
  const rowCells = cells.slice(rowStart, rowStart + width)
  const waterNeeds = rowCells
    .filter((c): c is Crop => c !== null)
    .map(c => c.water_need)

  if (waterNeeds.length <= 1) {
    return waterNeeds.length === 0 ? null : 0
  }

  const mean = waterNeeds.reduce((s, v) => s + v, 0) / waterNeeds.length
  const variance = waterNeeds.reduce((s, v) => s + (v - mean) ** 2, 0) / waterNeeds.length
  return variance
}

/**
 * Calculate the water penalty for placing a crop with a given water_need
 * in a specific row. Simulates what the row variance *would be* if placed.
 * @returns Negative penalty (0 if compatible, negative if mismatched).
 */
export function waterPenalty(
  cells: (Crop | null)[],
  width: number,
  rowIndex: number,
  candidateWaterNeed: number
): number {
  const rowStart = rowIndex * width
  const rowCells = cells.slice(rowStart, rowStart + width)
  const waterNeeds = rowCells
    .filter((c): c is Crop => c !== null)
    .map(c => c.water_need)

  // No existing crops in row: no penalty (any crop can start a row)
  if (waterNeeds.length === 0) return 0

  // Simulate placing the candidate
  const withCandidate = [...waterNeeds, candidateWaterNeed]
  const mean = withCandidate.reduce((s, v) => s + v, 0) / withCandidate.length
  const variance = withCandidate.reduce((s, v) => s + (v - mean) ** 2, 0) / withCandidate.length

  return -(variance * WATER_VARIANCE_WEIGHT)
}

/**
 * Calculate the average water_need for a row (for UI display).
 * @returns Average water need (1-5), or null if row is empty.
 */
export function getRowWaterAverage(
  cells: (Crop | null)[],
  width: number,
  rowIndex: number
): number | null {
  const rowStart = rowIndex * width
  const rowCells = cells.slice(rowStart, rowStart + width)
  const waterNeeds = rowCells
    .filter((c): c is Crop => c !== null)
    .map(c => c.water_need)

  if (waterNeeds.length === 0) return null
  return waterNeeds.reduce((s, v) => s + v, 0) / waterNeeds.length
}

/**
 * Get the Tailwind color class for a drip line based on water need average.
 * Uses a warm-to-cool hue scale: amber (dry) -> yellow -> green -> teal -> blue (wet).
 */
export function getDripLineColor(avg: number | null): string {
  if (avg === null) return 'bg-gray-300'
  if (avg <= 2) return 'bg-amber-300'
  if (avg <= 3) return 'bg-green-300'
  if (avg <= 4) return 'bg-teal-400'
  return 'bg-blue-500'
}

/**
 * Get a human-readable label for a row's water intensity.
 */
export function getWaterLabel(avg: number | null): string {
  if (avg === null) return 'empty'
  if (avg <= 2) return 'low water need'
  if (avg <= 3) return 'moderate water need'
  if (avg <= 4) return 'high water need'
  return 'very high water need'
}
