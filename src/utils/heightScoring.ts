/**
 * Weight applied to height placement penalty.
 * Comparable to water variance penalty (~2 friend bonuses).
 */
export const HEIGHT_PLACEMENT_WEIGHT = 1.5

/**
 * Height threshold for "low" crops (inches).
 * Crops at or below this don't cast meaningful shade.
 */
const LOW_HEIGHT_THRESHOLD = 12

/**
 * Height threshold for "medium" crops (inches).
 * Crops above this are considered "tall" and cast shade.
 */
const MEDIUM_HEIGHT_THRESHOLD = 36

export type HeightCategory = 'low' | 'medium' | 'tall'

/**
 * Classify a crop by its height into low/medium/tall.
 */
export function getHeightCategory(heightInches: number): HeightCategory {
  if (heightInches < LOW_HEIGHT_THRESHOLD) return 'low'
  if (heightInches <= MEDIUM_HEIGHT_THRESHOLD) return 'medium'
  return 'tall'
}

/**
 * Calculate distance from the south edge of the grid for a given cell.
 * Returns 0 at the south edge, increasing toward the north edge.
 *
 * @param cellIndex - Index of the cell in the flat grid array
 * @param width - Grid width in columns
 * @param height - Grid height in rows
 * @param orientation - Degrees (0=N at top, 90=E at top, 180=S at top, 270=W at top)
 * @returns Distance from south edge (0 = at south edge)
 */
export function getSouthDistance(
  cellIndex: number,
  width: number,
  height: number,
  orientation: number
): number {
  const row = Math.floor(cellIndex / width)
  const col = cellIndex % width
  const normalizedOrientation = ((orientation % 360) + 360) % 360

  if (normalizedOrientation < 45 || normalizedOrientation >= 315) {
    // ~0°: North at top → south is bottom → distance = max row - row
    return (height - 1) - row
  } else if (normalizedOrientation >= 45 && normalizedOrientation < 135) {
    // ~90°: East at top → south is left → distance = col
    return col
  } else if (normalizedOrientation >= 135 && normalizedOrientation < 225) {
    // ~180°: South at top → south is top → distance = row
    return row
  } else {
    // ~270°: West at top → south is right → distance = max col - col
    return (width - 1) - col
  }
}

/**
 * Calculate the height placement penalty for placing a crop at a position.
 * Tall crops near the south edge get penalized (they block sun).
 * Short crops are never penalized. Medium crops get light penalty only at south edge.
 *
 * @param heightInches - Crop height in inches
 * @param southDistance - Distance from south edge (0 = at south, higher = further north)
 * @param maxDistance - Maximum possible south distance for this grid/orientation
 * @returns Negative penalty (0 = no penalty, negative = bad placement)
 */
export function heightPlacementPenalty(
  heightInches: number,
  southDistance: number,
  maxDistance: number
): number {
  const category = getHeightCategory(heightInches)

  // Short crops never cause shading issues
  if (category === 'low') return 0

  // No penalty if maxDistance is 0 (single row/column in sun direction)
  if (maxDistance === 0) return 0

  // Normalized position: 0 = south edge, 1 = north edge
  const normalizedPosition = southDistance / maxDistance

  // Height factor: taller crops get worse penalties
  const heightFactor = category === 'tall'
    ? heightInches / 36
    : (heightInches - LOW_HEIGHT_THRESHOLD) / (MEDIUM_HEIGHT_THRESHOLD - LOW_HEIGHT_THRESHOLD) * 0.5

  // Penalty increases as crop is closer to south edge
  // At north edge (normalizedPosition=1): no penalty
  // At south edge (normalizedPosition=0): full penalty
  const positionPenalty = 1 - normalizedPosition

  // No penalty at the north edge
  if (positionPenalty === 0) return 0

  return -(heightFactor * positionPenalty * HEIGHT_PLACEMENT_WEIGHT)
}
