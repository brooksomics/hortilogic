/** Primary weight: penalize tall crops near the south edge (blocks main sun). */
export const HEIGHT_PLACEMENT_WEIGHT = 5.0

/** Secondary weight: penalize tall crops near the west edge (blocks afternoon sun). */
export const HEIGHT_WEST_WEIGHT = 1.5

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
 * Supports all 8 compass directions (N, NE, E, SE, S, SW, W, NW).
 *
 * For cardinal directions, distance is along one axis (row or column).
 * For intercardinal (diagonal) directions, distance is the sum of
 * row and column distances from the south corner.
 *
 * @param cellIndex - Index of the cell in the flat grid array
 * @param width - Grid width in columns
 * @param height - Grid height in rows
 * @param orientation - Degrees (0=N, 45=NE, 90=E, 135=SE, 180=S, 225=SW, 270=W, 315=NW)
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
  const norm = ((orientation % 360) + 360) % 360
  const maxRow = height - 1
  const maxCol = width - 1

  // Use 22.5° bands to snap to nearest of 8 compass points
  if (norm < 22.5 || norm >= 337.5) {
    // N (0°): south at bottom
    return maxRow - row
  } else if (norm < 67.5) {
    // NE (45°): south at bottom-right corner
    return (maxRow - row) + (maxCol - col)
  } else if (norm < 112.5) {
    // E (90°): south at right
    return maxCol - col
  } else if (norm < 157.5) {
    // SE (135°): south at top-right corner
    return row + (maxCol - col)
  } else if (norm < 202.5) {
    // S (180°): south at top
    return row
  } else if (norm < 247.5) {
    // SW (225°): south at top-left corner
    return row + col
  } else if (norm < 292.5) {
    // W (270°): south at left
    return col
  } else {
    // NW (315°): south at bottom-left corner
    return (maxRow - row) + col
  }
}

/**
 * Get the maximum possible south distance for a grid and orientation.
 * Used to normalize the south distance into a 0-1 range.
 *
 * @param width - Grid width in columns
 * @param height - Grid height in rows
 * @param orientation - Compass orientation in degrees
 * @returns Maximum south distance
 */
export function getMaxSouthDistance(
  width: number,
  height: number,
  orientation: number
): number {
  const norm = ((orientation % 360) + 360) % 360

  // Cardinal directions use a single axis
  if (norm < 22.5 || norm >= 337.5 || (norm >= 157.5 && norm < 202.5)) {
    return height - 1 // N or S
  } else if ((norm >= 67.5 && norm < 112.5) || (norm >= 247.5 && norm < 292.5)) {
    return width - 1 // E or W
  } else {
    // Diagonal: both axes contribute
    return (height - 1) + (width - 1)
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

/**
 * Compute a directional height penalty with a custom weight.
 */
function directionalPenalty(
  heightInches: number,
  distance: number,
  maxDistance: number,
  weight: number
): number {
  const category = getHeightCategory(heightInches)
  if (category === 'low' || maxDistance === 0) return 0
  const normalizedPos = distance / maxDistance
  const heightFactor = category === 'tall'
    ? heightInches / 36
    : (heightInches - LOW_HEIGHT_THRESHOLD) / (MEDIUM_HEIGHT_THRESHOLD - LOW_HEIGHT_THRESHOLD) * 0.5
  const posPenalty = 1 - normalizedPos
  if (posPenalty === 0) return 0
  return -(heightFactor * posPenalty * weight)
}

/**
 * Combined height penalty: south (primary) + west (secondary afternoon sun).
 * Pushes tall crops toward the northeast corner of the bed.
 */
export function combinedHeightPenalty(
  heightInches: number,
  cellIndex: number,
  width: number,
  height: number,
  orientation: number
): number {
  if (getHeightCategory(heightInches) === 'low' || height === 0) return 0
  const sDist = getSouthDistance(cellIndex, width, height, orientation)
  const sMax = getMaxSouthDistance(width, height, orientation)
  const wOrient = (orientation + 270) % 360
  const wDist = getSouthDistance(cellIndex, width, height, wOrient)
  const wMax = getMaxSouthDistance(width, height, wOrient)
  return directionalPenalty(heightInches, sDist, sMax, HEIGHT_PLACEMENT_WEIGHT)
       + directionalPenalty(heightInches, wDist, wMax, HEIGHT_WEST_WEIGHT)
}
