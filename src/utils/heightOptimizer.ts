import type { Crop } from '../types/garden'
import { getNeighbors } from './companionEngine'
import { combinedHeightPenalty } from './heightScoring'

/**
 * Check if a crop at the given index has any enemy neighbors.
 */
function hasEnemyAt(
  crop: Crop, bed: (Crop | null)[], idx: number, width: number
): boolean {
  const neighbors = getNeighbors(bed, idx, width)
  return neighbors.some(nid =>
    crop.companions.enemies.includes(nid) ||
    bed.find(c => c?.id === nid)?.companions.enemies.includes(crop.id) === true
  )
}

/**
 * Check if swapping two occupied cells improves height scoring
 * without creating enemy conflicts.
 */
function shouldSwap(
  bed: (Crop | null)[], i: number, j: number,
  width: number, height: number, orientation: number
): boolean {
  const a = bed[i]
  const b = bed[j]
  if (!a || !b) return false
  if (a.height_inches === b.height_inches) return false

  const current =
    combinedHeightPenalty(a.height_inches, i, width, height, orientation) +
    combinedHeightPenalty(b.height_inches, j, width, height, orientation)
  const swapped =
    combinedHeightPenalty(b.height_inches, i, width, height, orientation) +
    combinedHeightPenalty(a.height_inches, j, width, height, orientation)

  if (swapped <= current) return false

  // Trial swap and check for enemy conflicts
  bed[i] = b
  bed[j] = a
  const conflict = hasEnemyAt(b, bed, i, width) || hasEnemyAt(a, bed, j, width)
  // Revert
  bed[i] = a
  bed[j] = b
  return !conflict
}

/**
 * Post-placement optimizer: swaps crop positions to improve height/sun scoring.
 * Mutates the bed array in-place. Runs until no more improving swaps exist.
 */
export function optimizeHeightPlacement(
  bed: (Crop | null)[],
  width: number,
  height: number,
  orientation: number
): void {
  let improved = true
  while (improved) {
    improved = false
    for (let i = 0; i < bed.length; i++) {
      for (let j = i + 1; j < bed.length; j++) {
        if (shouldSwap(bed, i, j, width, height, orientation)) {
          const temp = bed[i] ?? null
          bed[i] = bed[j] ?? null
          bed[j] = temp
          improved = true
        }
      }
    }
  }
}
