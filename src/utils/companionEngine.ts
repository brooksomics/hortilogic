import type { Crop, GardenProfile } from '@/types'
import { CROPS_BY_ID } from '@/data/crops'
import { isCropViable } from './dateEngine'
import { SeededRandom } from './seededRandom'
import { waterPenalty } from './waterScoring'
import { getSouthDistance, heightPlacementPenalty } from './heightScoring'

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
 * Checks both directions: candidate's enemies AND neighbors' enemies (bidirectional)
 *
 * @param candidateCrop - The crop being considered for planting
 * @param neighborCropIds - Array of crop IDs for adjacent neighbors
 * @returns TRUE if no enemies are present, FALSE if any enemy is adjacent
 */
export function checkCompanionConstraints(
  candidateCrop: Crop,
  neighborCropIds: string[]
): boolean {
  const hasEnemy = neighborCropIds.some(neighborId => {
    // Check if neighbor is in candidate's enemy list
    if (candidateCrop.companions.enemies.includes(neighborId)) return true
    // Check if candidate is in neighbor's enemy list (bidirectional)
    const neighbor = CROPS_BY_ID[neighborId]
    if (neighbor?.companions.enemies.includes(candidateCrop.id)) return true
    return false
  })

  return !hasEnemy
}

/**
 * Score a crop for a specific cell based on companion relationships
 * Checks both directions: crop's enemies/friends AND neighbors' enemies/friends
 *
 * @param crop - Crop being considered
 * @param neighborIds - IDs of adjacent crops
 * @returns Score (higher is better, -1000 for enemies, +1 per friend, 0 neutral)
 */
function scoreCropForCell(crop: Crop, neighborIds: string[]): number {
  let score = 0

  for (const neighborId of neighborIds) {
    const neighbor = CROPS_BY_ID[neighborId]
    const isEnemy = crop.companions.enemies.includes(neighborId) ||
      (neighbor?.companions.enemies.includes(crop.id) ?? false)
    const isFriend = crop.companions.friends.includes(neighborId) ||
      (neighbor?.companions.friends.includes(crop.id) ?? false)

    if (isEnemy) {
      score -= 1000
    } else if (isFriend) {
      score += 1
    }
  }

  return score
}

/**
 * Automagically fill empty cells in the garden bed with compatible, viable crops
 *
 * Algorithm:
 * 1. Identify empty cells
 * 2. Filter crop library for seasonally viable crops
 * 3. For each empty cell:
 *    - Score all viable crops based on neighbor relationships
 *    - Apply variety penalty to encourage crop diversity
 *    - Pick the best scoring crop
 *
 * @param currentGrid - Current garden bed state
 * @param cropLibrary - Available crops to choose from
 * @param gardenProfile - Garden profile with frost dates
 * @param targetDate - Date to check viability against (defaults to today)
 * @param gridWidth - Width of the grid in cells (default: 8 for 4x8 bed)
 * @param gridHeight - Height of the grid in cells (default: 4 for 4x8 bed)
 * @param orientation - Compass orientation in degrees (0=N at top, default: 0)
 * @returns New grid with auto-filled crops (preserves existing crops)
 */
export function autoFillBed(
  currentGrid: (Crop | null)[],
  cropLibrary: Crop[],
  gardenProfile: GardenProfile,
  targetDate: Date = new Date(),
  gridWidth: number = DEFAULT_GRID_WIDTH,
  gridHeight: number = 4,
  seed?: string | number,
  orientation: number = 0
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

  // Track planted crop counts for variety optimization
  const plantedCounts: Record<string, number> = {}

  // Count existing crops
  newGrid.forEach(cell => {
    if (cell) {
      plantedCounts[cell.id] = (plantedCounts[cell.id] || 0) + 1
    }
  })

  // Calculate total cells based on dimensions
  const totalCells = gridWidth * gridHeight

  // Calculate flower limit (15% of total cells)
  const maxFlowers = Math.floor(totalCells * 0.15)

  // Track flower count (including existing flowers)
  let flowerCount = newGrid.filter(cell => cell?.type === 'flower').length

  // Iterate through each cell
  for (let cellIndex = 0; cellIndex < totalCells; cellIndex++) {
    // Skip if cell is already occupied (preserve existing crops)
    if (newGrid[cellIndex] !== null) {
      continue
    }

    // Get neighbor crop IDs with custom grid width
    const neighborIds = getNeighbors(newGrid, cellIndex, gridWidth)

    // Score all viable crops for this cell
    let bestCrop: Crop | null = null
    let bestScore = -Infinity

    for (const crop of viableCrops) {
      // Skip flowers if we've reached the flower density limit
      if (crop.type === 'flower' && flowerCount >= maxFlowers) {
        continue
      }

      // Base score from companion relationships
      let score = scoreCropForCell(crop, neighborIds)

      // Skip crops with enemies nearby (hard constraint)
      if (score <= -100) continue

      // Water need penalty: prefer crops with similar water needs on same row
      const rowIndex = Math.floor(cellIndex / gridWidth)
      score += waterPenalty(newGrid, gridWidth, rowIndex, crop.water_need)

      // Height placement penalty: prefer tall crops on the north side
      const southDist = getSouthDistance(cellIndex, gridWidth, gridHeight, orientation)
      const maxDist = orientation % 180 === 0 ? gridHeight - 1 : gridWidth - 1
      score += heightPlacementPenalty(crop.height_inches, southDist, maxDist)

      // Variety penalty: reduce score for crops we've already planted a lot
      const timesPlanted = plantedCounts[crop.id] || 0
      score -= timesPlanted * 0.5

      // Track best crop
      if (score > bestScore) {
        bestScore = score
        bestCrop = crop
      } else if (score === bestScore && bestCrop) {
        // Deterministic tie-breaking using seeded RNG
        if (rng.next() > 0.5) {
          bestCrop = crop
        }
      }
    }

    // Plant the best crop if found
    if (bestCrop) {
      newGrid[cellIndex] = bestCrop
      plantedCounts[bestCrop.id] = (plantedCounts[bestCrop.id] || 0) + 1

      // Increment flower count if we just planted a flower
      if (bestCrop.type === 'flower') {
        flowerCount++
      }
    }
  }

  return newGrid
}
