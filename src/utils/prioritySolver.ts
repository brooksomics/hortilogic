import type { Crop, GardenStash, GardenProfile } from '../types/garden'
import { getNeighbors } from './companionEngine'
import { SeededRandom } from './seededRandom'
import { isCropViable } from './dateEngine'

export interface CropPlacement {
    cropId: string
    cellIndex: number
}

export interface FailedPlacement {
    cropId: string
    reason: string
}

export interface PlacementResult {
    placed: CropPlacement[]
    failed: FailedPlacement[]
}

export interface PriorityCrop {
    cropId: string
    quantity: number
    crop: Crop
}

export function calculateDifficulty(crop: Crop): number {
    let score = 0
    score += crop.companions.enemies.length * 10
    score += crop.sfg_density === 1 ? 5 : 0 // Large crops (1 per sq ft) are generally harder to pack
    score += crop.companions.friends.length === 0 ? 3 : 0
    return score
}

export function sortByPriority(stash: GardenStash, crops: Crop[]): PriorityCrop[] {
    return Object.entries(stash)
        .map(([cropId, qty]) => {
            const crop = crops.find(c => c.id === cropId)
            if (!crop) return null
            // Fix: Map 'qty' to 'quantity' to match interface
            return { cropId, quantity: qty, crop }
        })
        .filter((item): item is PriorityCrop => item !== null)
        .sort((a, b) => {
            const scoreA = calculateDifficulty(a.crop)
            const scoreB = calculateDifficulty(b.crop)
            return scoreB - scoreA // Descending order
        })
}

export function scoreCell(
    cellIndex: number,
    cropId: string,
    bed: (Crop | null)[],
    allCrops: Crop[],
    width: number
): number {
    const candidateCrop = allCrops.find(c => c.id === cropId)
    if (!candidateCrop) return 0

    const neighbors = getNeighbors(bed, cellIndex, width)
    let score = 0

    for (const neighborId of neighbors) {
        if (candidateCrop.companions.enemies.includes(neighborId)) {
            score -= 1000 // Heavy penalty for enemies
        } else if (candidateCrop.companions.friends.includes(neighborId)) {
            score += 1 // Bonus for friends

            // Extra bonus for flower-vegetable mutualism (TODO-029)
            const neighborCrop = allCrops.find(c => c.id === neighborId)
            if (neighborCrop) {
                const isFlowerVegPair =
                    (candidateCrop.type === 'flower' && neighborCrop.type === 'vegetable') ||
                    (candidateCrop.type === 'vegetable' && neighborCrop.type === 'flower')

                if (isFlowerVegPair) {
                    score += 1 // Additional bonus for beneficial flower-vegetable relationship
                }
            }
        }
    }

    return score
}

function findBestCell(
    bed: (Crop | null)[],
    cropId: string,
    allCrops: Crop[],
    width: number,
    rng: SeededRandom
): number | null {
    // Find all empty cells
    const emptyIndices = bed
        .map((crop, idx) => (crop === null ? idx : null))
        .filter((idx): idx is number => idx !== null)

    if (emptyIndices.length === 0) return null

    let bestIndex: number | null = null
    let maxScore = -Infinity

    for (const idx of emptyIndices) {
        const score = scoreCell(idx, cropId, bed, allCrops, width)

        // Hard rejection threshold
        if (score <= -100) continue

        if (score > maxScore) {
            maxScore = score
            bestIndex = idx
        } else if (score === maxScore) {
            // Deterministic tie-breaker using seeded RNG (TODO-023)
            if (rng.next() > 0.5) {
                bestIndex = idx
            }
        }
    }

    return bestIndex
}

export function autoFillFromStash(
    currentBed: (Crop | null)[],
    stash: GardenStash,
    allCrops: Crop[],
    width: number,
    seed?: string | number
): PlacementResult {
    // Clone bed to simulate placement
    // NOTE: In the real app, currentBed actually stores `Crop` objects, not strings.
    // The solver needs to place `Crop` objects to allow future steps to see them.
    const workingBed = [...currentBed]

    const placed: CropPlacement[] = []
    const failed: FailedPlacement[] = []

    // Create seeded RNG for deterministic placement (TODO-023)
    const rng = new SeededRandom(seed ?? 'default')

    const priorityList = sortByPriority(stash, allCrops)

    for (const { cropId, quantity, crop } of priorityList) {
        for (let i = 0; i < quantity; i++) {
            const bestCell = findBestCell(workingBed, cropId, allCrops, width, rng)

            if (bestCell !== null) {
                workingBed[bestCell] = crop
                placed.push({ cropId, cellIndex: bestCell })
            } else {
                failed.push({ cropId, reason: 'No valid spot found (space or constraints)' })
            }
        }
    }

    // NOTE: The function returns placement data, but the caller needs to actually update the bed state
    // Or should we return the modified bed?
    // The spec says "Return placement report", but usually we want the modified bed too.
    // Ideally, the caller applies the `placed` list to their state.
    // But wait, `placed` only has index/cropId. The caller needs full Crop object to put in bed.
    // Actually, for this standalone solver, returning the plan is good. The caller has the `crops` list.

    return { placed, failed }
}

export interface BoxPlacementResult extends PlacementResult {
    boxId: string
    // We might want to return the modified bed here too?
    // For now, caller can derive it from `placed` if they want,
    // but simpler if we just return the new cells in the App integration later.
    // Actually, for the algorithm test, we just return the report.
    // But wait, in `autoFillAllBoxes`, we modify the box state as we go?
    // No, `workingBed` is local.
    // If we want to return the final state of all boxes, we should probably include the `bed` (cells) in the result.
    // Let's add `checkCompanionConstraints` equivalent?
    // The caller (App) probably wants the final `cells` array for each box.

    // Let's modify return type to include `finalBed`.
    // But for now, sticking to the spec interface is safer for modularity.
}

/**
 * Distribute stash across multiple garden boxes.
 * Consumes stash items as they are placed.
 */
export function autoFillAllBoxes(
    layoutBoxes: { id: string; cells: (Crop | null)[]; width: number }[],
    initialStash: GardenStash,
    allCrops: Crop[],
    seed?: string | number
): { boxResults: BoxPlacementResult[]; remainingStash: GardenStash } {
    // Calculate available space in each box
    const boxSpaces = layoutBoxes.map(box => ({
        id: box.id,
        emptyCount: box.cells.filter(cell => cell === null).length
    }))

    const totalSpace = boxSpaces.reduce((sum, box) => sum + box.emptyCount, 0)
    const totalStashSize = Object.values(initialStash).reduce((sum, qty) => sum + qty, 0)

    // Allocate stash items proportionally to each box based on available space
    const boxAllocations: Map<string, GardenStash> = new Map()

    if (totalSpace === 0 || totalStashSize === 0) {
        // No space or nothing to place
        return {
            boxResults: layoutBoxes.map(box => ({ boxId: box.id, placed: [], failed: [] })),
            remainingStash: initialStash
        }
    }

    // Distribute items across boxes proportionally
    const remainingItems: GardenStash = { ...initialStash }

    for (let i = 0; i < layoutBoxes.length; i++) {
        const box = layoutBoxes[i]
        const boxSpace = boxSpaces[i]
        if (!box || !boxSpace) continue // Should never happen, but satisfies linter

        const allocation: GardenStash = {}

        // Calculate this box's share of each crop type
        for (const [cropId, quantity] of Object.entries(remainingItems)) {
            if (quantity === 0) continue

            // For the last box, give it everything remaining
            if (i === layoutBoxes.length - 1) {
                allocation[cropId] = quantity
            } else {
                // Allocate proportional to space (but at least try to give each box something)
                const proportion = boxSpace.emptyCount / totalSpace
                const allocated = Math.max(1, Math.floor(quantity * proportion))
                allocation[cropId] = Math.min(allocated, quantity)
            }

            remainingItems[cropId] = (remainingItems[cropId] || 0) - (allocation[cropId] || 0)
        }

        boxAllocations.set(box.id, allocation)
    }

    // Now place allocated items in each box
    const boxResults: BoxPlacementResult[] = []
    let unplacedItems: GardenStash = {}

    for (const box of layoutBoxes) {
        const allocation = boxAllocations.get(box.id) || {}

        // Combine this box's allocation with any unplaced items from previous boxes
        const stashForThisBox: GardenStash = { ...unplacedItems }
        for (const [cropId, qty] of Object.entries(allocation)) {
            stashForThisBox[cropId] = (stashForThisBox[cropId] || 0) + qty
        }

        const { placed, failed } = autoFillFromStash(box.cells, stashForThisBox, allCrops, box.width, seed)

        boxResults.push({
            boxId: box.id,
            placed,
            failed
        })

        // Items that failed to place will be tried in the next box
        unplacedItems = {}
        for (const fail of failed) {
            unplacedItems[fail.cropId] = (unplacedItems[fail.cropId] || 0) + 1
        }
    }

    return { boxResults, remainingStash: unplacedItems }
}

/**
 * Fills remaining empty cells with compatible crops
 * @param bed Current bed state (after stash placement)
 * @param allCrops Available crops to choose from
 * @param width Bed width
 * @param maxFills Maximum number of gaps to fill (optional)
 * @param gardenProfile Garden profile with frost dates (required for seasonality filtering)
 * @param targetDate Date to check viability against
 * @param seed Seed for deterministic RNG
 */
export function autoFillGaps(
    bed: (Crop | null)[],
    allCrops: Crop[],
    width: number,
    maxFills: number = Infinity,
    gardenProfile?: GardenProfile,
    targetDate?: Date,
    seed?: string | number
): CropPlacement[] {
    const placed: CropPlacement[] = []
    const workingBed = [...bed]

    // Filter for only crops that are viable for the target date
    const viableCrops = gardenProfile && targetDate
        ? allCrops.filter(crop => isCropViable(crop, gardenProfile, targetDate))
        : allCrops // Fallback to all crops if no profile/date provided (backward compatibility)

    // Create seeded RNG for deterministic gap filling (TODO-023)
    const rng = new SeededRandom(seed ?? 'default')

    const emptyIndices = workingBed
        .map((crop, idx) => (crop === null ? idx : null))
        .filter((idx): idx is number => idx !== null)

    // --- TRACKING STATE FOR DIVERSITY ---
    // Count what is ALREADY in the bed to apply penalties immediately
    const plantedCounts: Record<string, number> = {}
    const familyCounts: Record<string, number> = {}
    let flowerCount = 0
    const totalCells = bed.length
    // 15% limit, but allow at least 1 flower even in small beds
    const maxFlowers = Math.max(1, Math.floor(totalCells * 0.15))

    workingBed.forEach(crop => {
        if (crop) {
            plantedCounts[crop.id] = (plantedCounts[crop.id] || 0) + 1
            familyCounts[crop.botanical_family] = (familyCounts[crop.botanical_family] || 0) + 1
            if (crop.type === 'flower') flowerCount++
        }
    })
    // -------------------------------------

    let fills = 0
    for (const cellIndex of emptyIndices) {
        if (fills >= maxFills) break

        // Find best crop for this cell
        let bestCrop: Crop | null = null
        let bestScore = -Infinity

        // Only consider viable crops (filtered by seasonality if profile/date provided)
        for (const crop of viableCrops) {
            // 1. Flower Hard Limit
            if (crop.type === 'flower' && flowerCount >= maxFlowers) {
                continue
            }

            // Calculate Base Score (Companions)
            let score = scoreCell(cellIndex, crop.id, workingBed, allCrops, width)

            // Strict requirement for gap filling: Must replace valid space AND prefer friends.
            // Score > 0 implies at least one friend (and NO enemies).
            // Score 0 means neutral.
            // Let's require > 0 to ensure we only add BENEFICIAL additions.
            // Or at least >= 0.
            if (score <= -100) continue // Enemy

            // 2. Vegetable Priority Bonus
            // Ensure veggies win ties against herbs/flowers
            if (crop.type === 'vegetable') {
                score += 2
            }

            // 3. Variety Penalty (The "Anti-Monoculture" Rule)
            // -0.5 points for every duplicate already in the bed
            const existingCount = plantedCounts[crop.id] || 0
            score -= (existingCount * 0.5)

            // 4. Family Diversity Penalty
            // -0.25 points for every plant of the same family
            // Prevents filling the bed with only one family (e.g. all Lamiaceae herbs)
            const familyCount = familyCounts[crop.botanical_family] || 0
            score -= (familyCount * 0.25)

            if (score > bestScore) {
                bestScore = score
                bestCrop = crop
            } else if (score === bestScore) {
                // Deterministic tie breaker using seeded RNG (TODO-023)
                if (rng.next() > 0.5) bestCrop = crop
            }
        }

        if (bestCrop && bestScore >= -99) { // Allow neutral, reject enemies only
            workingBed[cellIndex] = bestCrop
            placed.push({ cropId: bestCrop.id, cellIndex })
            fills++

            // Update counts immediately so the NEXT cell "sees" this planting
            plantedCounts[bestCrop.id] = (plantedCounts[bestCrop.id] || 0) + 1
            familyCounts[bestCrop.botanical_family] = (familyCounts[bestCrop.botanical_family] || 0) + 1
            if (bestCrop.type === 'flower') {
                flowerCount++
            }
        }
    }

    return placed
}
