import type { Crop, GardenProfile } from '@/types'
import { isCropViable } from './dateEngine'
import { SeededRandom } from './seededRandom'

/**
 * Default grid dimensions for 4' x 8' bed (backward compatibility)
 * 4 rows x 8 columns = 32 cells
 */
const DEFAULT_GRID_WIDTH = 8

/**
 * Get the crop IDs of all adjacent neighbors (up, down, left, right) for a given cell
 *
 * @param grid - The garden bed grid
 * @param cellIndex - Index of the cell to check
 * @param gridWidth - Width of the grid in cells (default: 8 for 4x8 bed)
 * @returns Array of crop IDs for adjacent neighbors (empty cells excluded)
 */
export function getNeighbors(
  grid: (Crop | null)[],
  cellIndex: number,
  gridWidth: number = DEFAULT_GRID_WIDTH
): string[] {
  const neighbors: string[] = []

  // Calculate total rows based on grid length and width
  const totalRows = Math.ceil(grid.length / gridWidth)

  // Calculate row and column from cell index
  const row = Math.floor(cellIndex / gridWidth)
  const col = cellIndex % gridWidth

  // Check top neighbor (row - 1)
  if (row > 0) {
    const topIndex = (row - 1) * gridWidth + col
    const topCrop = grid[topIndex]
    if (topCrop) {
      neighbors.push(topCrop.id)
    }
  }

  // Check bottom neighbor (row + 1)
  if (row < totalRows - 1) {
    const bottomIndex = (row + 1) * gridWidth + col
    const bottomCrop = grid[bottomIndex]
    if (bottomCrop) {
      neighbors.push(bottomCrop.id)
    }
  }

  // Check left neighbor (col - 1)
  if (col > 0) {
    const leftIndex = row * gridWidth + (col - 1)
    const leftCrop = grid[leftIndex]
    if (leftCrop) {
      neighbors.push(leftCrop.id)
    }
  }

  // Check right neighbor (col + 1)
  if (col < gridWidth - 1) {
    const rightIndex = row * gridWidth + (col + 1)
    const rightCrop = grid[rightIndex]
    if (rightCrop) {
      neighbors.push(rightCrop.id)
    }
  }

  return neighbors
}

/**
 * Check if a crop can be planted at a location without violating companion planting rules
 *
 * @param candidateCrop - The crop being considered for planting
 * @param neighborCropIds - Array of crop IDs for adjacent neighbors
 * @returns TRUE if no enemies are present, FALSE if any enemy is adjacent
 */
export function checkCompanionConstraints(
  candidateCrop: Crop,
  neighborCropIds: string[]
): boolean {
  // Check if any neighbor is in the candidate's enemy list
  const hasEnemy = neighborCropIds.some(neighborId =>
    candidateCrop.companions.enemies.includes(neighborId)
  )

  return !hasEnemy
}

/**
 * Automagically fill empty cells in the garden bed with compatible, viable crops
 *
 * Algorithm:
 * 1. Identify empty cells
 * 2. Filter crop library for seasonally viable crops
 * 3. For each empty cell:
 *    - Get neighbors
 *    - Try each viable crop
 *    - If compatible with neighbors, plant it
 *    - Otherwise, try next crop or leave empty
 *
 * @param currentGrid - Current garden bed state
 * @param cropLibrary - Available crops to choose from
 * @param gardenProfile - Garden profile with frost dates
 * @param targetDate - Date to check viability against (defaults to today)
 * @param gridWidth - Width of the grid in cells (default: 8 for 4x8 bed)
 * @param gridHeight - Height of the grid in cells (default: 4 for 4x8 bed)
 * @returns New grid with auto-filled crops (preserves existing crops)
 */
export function autoFillBed(
  currentGrid: (Crop | null)[],
  cropLibrary: Crop[],
  gardenProfile: GardenProfile,
  targetDate: Date = new Date(),
  gridWidth: number = DEFAULT_GRID_WIDTH,
  gridHeight: number = 4,
  seed?: string | number
): (Crop | null)[] {
  // Create a copy of the grid to avoid mutation
  const newGrid = [...currentGrid]

  // Filter for only crops that are viable for the target date
  const viableCrops = cropLibrary.filter(crop =>
    isCropViable(crop, gardenProfile, targetDate)
  )

  // If no viable crops, return grid unchanged
  if (viableCrops.length === 0) {
    return newGrid
  }

  // Create seeded RNG for deterministic randomness (TODO-023)
  const rng = new SeededRandom(seed ?? 'default')

  // Shuffle viable crops using seeded randomness
  const shuffledCrops = rng.shuffle(viableCrops)

  // Calculate total cells based on dimensions
  const totalCells = gridWidth * gridHeight

  // Iterate through each cell
  for (let cellIndex = 0; cellIndex < totalCells; cellIndex++) {
    // Skip if cell is already occupied (preserve existing crops)
    if (newGrid[cellIndex] !== null) {
      continue
    }

    // Get neighbor crop IDs with custom grid width
    const neighborIds = getNeighbors(newGrid, cellIndex, gridWidth)

    // Try each viable crop to see if it's compatible
    for (const crop of shuffledCrops) {
      if (checkCompanionConstraints(crop, neighborIds)) {
        // Found a compatible crop - plant it!
        newGrid[cellIndex] = crop
        break // Move to next cell
      }
    }

    // If no compatible crop found, cell remains empty
  }

  return newGrid
}
