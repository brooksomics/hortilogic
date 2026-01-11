import type { Crop, GardenStash } from '../types/garden'
import { getNeighbors } from './companionEngine'
import { SeededRandom } from './seededRandom'

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
    let currentStash = { ...initialStash }
    const boxResults: BoxPlacementResult[] = []

    for (const box of layoutBoxes) {
        if (Object.keys(currentStash).length === 0) {
            break
        }

        const { placed, failed } = autoFillFromStash(box.cells, currentStash, allCrops, box.width, seed)

        boxResults.push({
            boxId: box.id,
            placed,
            failed // Note: These failed items will be retried in next box or returned as final remaining
        })

        // Update currentStash: remove placed items
        // Reconstruct stash from FAILED items. 
        // `failed` contains everything that wasn't placed.

        // Convert 'failed' list back to Stash map
        const newStash: GardenStash = {}
        for (const fail of failed) {
            newStash[fail.cropId] = (newStash[fail.cropId] || 0) + 1
        }
        currentStash = newStash
    }

    return { boxResults, remainingStash: currentStash }
}

/**
 * Fills remaining empty cells with compatible crops
 * @param bed Current bed state (after stash placement)
 * @param allCrops Available crops to choose from
 * @param width Bed width
 * @param maxFills Maximum number of gaps to fill (optional)
 */
export function autoFillGaps(
    bed: (Crop | null)[],
    allCrops: Crop[],
    width: number,
    maxFills: number = Infinity,
    seed?: string | number
): CropPlacement[] {
    const placed: CropPlacement[] = []
    const workingBed = [...bed]

    // Create seeded RNG for deterministic gap filling (TODO-023)
    const rng = new SeededRandom(seed ?? 'default')

    const emptyIndices = workingBed
        .map((crop, idx) => (crop === null ? idx : null))
        .filter((idx): idx is number => idx !== null)

    let fills = 0
    for (const cellIndex of emptyIndices) {
        if (fills >= maxFills) break

        // Find best crop for this cell
        let bestCrop: Crop | null = null
        let bestScore = -Infinity

        // Only consider checking crops that are "friends" with neighbors to save time?
        // Or just check all crops. 50 crops * ~50 cells = 2500 checks. Fast enough.
        for (const crop of allCrops) {
            // Basic strict filter: Dont plant large crops in gaps if we want to be safe?
            // Actually, a gap is 1 cell. If crop density is 1 (sqftPerPlant=1), it fits.
            // If density is 4, it fits.
            // We assume 1 cell = 1 square foot.
            // Any crop fits in 1 sq ft.

            const score = scoreCell(cellIndex, crop.id, workingBed, allCrops, width)

            // Strict requirement for gap filling: Must replace valid space AND prefer friends.
            // Score > 0 implies at least one friend (and NO enemies).
            // Score 0 means neutral.
            // Let's require > 0 to ensure we only add BENEFICIAL additions.
            // Or at least >= 0.
            if (score <= -100) continue // Enemy

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
        }
    }

    return placed
}
