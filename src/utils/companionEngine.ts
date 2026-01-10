import type { Crop, GardenProfile } from '@/types'
import { isCropViable } from './dateEngine'

/**
 * Grid dimensions for 4' x 8' bed
 * 4 rows x 8 columns = 32 cells
 */
const GRID_ROWS = 4
const GRID_COLS = 8

/**
 * Get the crop IDs of all adjacent neighbors (up, down, left, right) for a given cell
 *
 * @param grid - The garden bed grid (32 cells)
 * @param cellIndex - Index of the cell to check (0-31)
 * @returns Array of crop IDs for adjacent neighbors (empty cells excluded)
 */
export function getNeighbors(grid: (Crop | null)[], cellIndex: number): string[] {
  const neighbors: string[] = []

  // Calculate row and column from cell index
  const row = Math.floor(cellIndex / GRID_COLS)
  const col = cellIndex % GRID_COLS

  // Check top neighbor (row - 1)
  if (row > 0) {
    const topIndex = (row - 1) * GRID_COLS + col
    const topCrop = grid[topIndex]
    if (topCrop) {
      neighbors.push(topCrop.id)
    }
  }

  // Check bottom neighbor (row + 1)
  if (row < GRID_ROWS - 1) {
    const bottomIndex = (row + 1) * GRID_COLS + col
    const bottomCrop = grid[bottomIndex]
    if (bottomCrop) {
      neighbors.push(bottomCrop.id)
    }
  }

  // Check left neighbor (col - 1)
  if (col > 0) {
    const leftIndex = row * GRID_COLS + (col - 1)
    const leftCrop = grid[leftIndex]
    if (leftCrop) {
      neighbors.push(leftCrop.id)
    }
  }

  // Check right neighbor (col + 1)
  if (col < GRID_COLS - 1) {
    const rightIndex = row * GRID_COLS + (col + 1)
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
 * @param currentGrid - Current garden bed state (32 cells)
 * @param cropLibrary - Available crops to choose from
 * @param gardenProfile - Garden profile with frost dates
 * @param targetDate - Date to check viability against (defaults to today)
 * @returns New grid with auto-filled crops (preserves existing crops)
 */
export function autoFillBed(
  currentGrid: (Crop | null)[],
  cropLibrary: Crop[],
  gardenProfile: GardenProfile,
  targetDate: Date = new Date()
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

  // Shuffle viable crops for randomness (simple "Feeling Lucky" heuristic)
  const shuffledCrops = [...viableCrops].sort(() => Math.random() - 0.5)

  // Iterate through each cell
  for (let cellIndex = 0; cellIndex < 32; cellIndex++) {
    // Skip if cell is already occupied (preserve existing crops)
    if (newGrid[cellIndex] !== null) {
      continue
    }

    // Get neighbor crop IDs
    const neighborIds = getNeighbors(newGrid, cellIndex)

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
