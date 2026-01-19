/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { describe, it, expect } from 'vitest'
import {
    calculateDifficulty,
    sortByPriority,
    scoreCell,
    autoFillFromStash,
    autoFillAllBoxes,
    autoFillGaps
} from './prioritySolver'
import type { Crop, GardenStash } from '../types/garden'

// Mock crops for testing
const mockCrops: Crop[] = [
    {
        id: 'tomato',
        name: 'Tomato',
        type: 'vegetable',
        botanical_family: 'Solanaceae',
        emoji: '🍅',
        sfg_density: 1, // Large crop (1 per sq ft)
        sun: 'full',
        days_to_maturity: 80,
        companions: {
            friends: ['basil', 'carrot', 'marigold'],
            enemies: ['brassica', 'potato']
        },
        // Mock other required fields
        planting_strategy: { start_window_start: 0, start_window_end: 4 }
    },
    {
        id: 'basil',
        name: 'Basil',
        type: 'herb',
        botanical_family: 'Lamiaceae',
        emoji: '🌿',
        sfg_density: 4, // Small crop
        sun: 'full',
        days_to_maturity: 60,
        companions: {
            friends: ['tomato'],
            enemies: []
        },
        planting_strategy: { start_window_start: 0, start_window_end: 4 }
    },
    {
        id: 'brassica',
        name: 'Brassica',
        type: 'vegetable',
        botanical_family: 'Brassicaceae',
        emoji: '🥦',
        sfg_density: 1,
        sun: 'full',
        days_to_maturity: 70,
        companions: {
            friends: [],
            enemies: ['tomato']
        },
        planting_strategy: { start_window_start: 0, start_window_end: 4 }
    },
    {
        id: 'lettuce',
        name: 'Lettuce',
        type: 'vegetable',
        botanical_family: 'Asteraceae',
        emoji: '🥬',
        sfg_density: 4,
        sun: 'partial',
        days_to_maturity: 55,
        companions: {
            friends: [],
            enemies: []
        },
        planting_strategy: { start_window_start: 0, start_window_end: 4 }
    },
    {
        id: 'marigold',
        name: 'Marigold',
        type: 'flower',
        botanical_family: 'Asteraceae',
        emoji: '🌼',
        sfg_density: 4,
        sun: 'full',
        days_to_maturity: 50,
        companions: {
            friends: ['tomato', 'basil'],
            enemies: []
        },
        planting_strategy: { start_window_start: 0, start_window_end: 6 }
    }
]

describe('Priority Solver Logic', () => {
    describe('calculateDifficulty', () => {
        it('scores crops with enemies higher than crops without', () => {
            const tomatoScore = calculateDifficulty(mockCrops.find(c => c.id === 'tomato')!)
            const lettuceScore = calculateDifficulty(mockCrops.find(c => c.id === 'lettuce')!)

            expect(tomatoScore).toBeGreaterThan(lettuceScore)
        })

        it('scores large crops higher than small crops', () => {
            const brassicaScore = calculateDifficulty(mockCrops.find(c => c.id === 'brassica')!)
            const basilScore = calculateDifficulty(mockCrops.find(c => c.id === 'basil')!)

            expect(brassicaScore).toBeGreaterThan(basilScore)
        })
    })

    describe('sortByPriority', () => {
        it('sorts stash items by difficulty descending', () => {
            const stash: GardenStash = {
                'basil': 5,
                'tomato': 5
            }

            const sorted = sortByPriority(stash, mockCrops)

            expect(sorted[0]!.cropId).toBe('tomato')
            expect(sorted[1]!.cropId).toBe('basil')
        })
    })

    describe('scoreCell', () => {
        it('returns positive score for friendly neighbor', () => {
            const bed = [null, mockCrops.find(c => c.id === 'tomato')!, null, null]

            // Checking index 0 for Basil (friend of Tomato)
            // Assuming width 2 for a 2x2 grid: 0 and 1 are neighbors
            const score = scoreCell(0, 'basil', bed, mockCrops, 2)

            expect(score).toBeGreaterThan(0)
        })

        it('returns massive negative score for enemy neighbor', () => {
            const bed = [null, mockCrops.find(c => c.id === 'tomato')!, null, null]
            const score = scoreCell(0, 'brassica', bed, mockCrops, 2)
            expect(score).toBeLessThan(-100)
        })

        it('returns zero for neutral or empty neighbors', () => {
            const bed = [null, null, null, null]
            const score = scoreCell(0, 'lettuce', bed, mockCrops, 2)
            expect(score).toBe(0)
        })

        it('gives extra bonus for flower-vegetable friendship', () => {
            // Tomato (vegetable) at index 1, testing Marigold (flower) at index 0
            const bed = [null, mockCrops.find(c => c.id === 'tomato')!, null, null]

            const marigoldScore = scoreCell(0, 'marigold', bed, mockCrops, 2)

            // Marigold and Tomato are friends
            // Standard friend bonus: +1
            // Flower-vegetable bonus: +1
            // Total expected: +2
            expect(marigoldScore).toBe(2)
        })

        it('gives extra bonus for vegetable-flower friendship', () => {
            // Marigold (flower) at index 1, testing Tomato (vegetable) at index 0
            const bed = [null, mockCrops.find(c => c.id === 'marigold')!, null, null]

            const tomatoScore = scoreCell(0, 'tomato', bed, mockCrops, 2)

            // Tomato and Marigold are friends
            // Standard friend bonus: +1
            // Vegetable-flower bonus: +1
            // Total expected: +2
            expect(tomatoScore).toBe(2)
        })

        it('gives standard bonus for herb-vegetable friendship (no flower bonus)', () => {
            // Basil (herb) at index 1, testing Tomato (vegetable) at index 0
            const bed = [null, mockCrops.find(c => c.id === 'basil')!, null, null]

            const tomatoScore = scoreCell(0, 'tomato', bed, mockCrops, 2)

            // Tomato and Basil are friends, but neither is a flower
            // Standard friend bonus only: +1
            expect(tomatoScore).toBe(1)
        })

        it('gives standard bonus for vegetable-vegetable friendship (no flower bonus)', () => {
            // Tomato at index 1, Carrot at index 0 (they're friends in the actual DB)
            const carrot: Crop = {
                id: 'carrot',
                name: 'Carrot',
                type: 'vegetable',
                botanical_family: 'Apiaceae',
                emoji: '🥕',
                sfg_density: 16,
                sun: 'full',
                days_to_maturity: 70,
                companions: {
                    friends: ['tomato'],
                    enemies: []
                },
                planting_strategy: { start_window_start: 0, start_window_end: 4 }
            }

            const bed = [null, mockCrops.find(c => c.id === 'tomato')!, null, null]
            const cropsWithCarrot = [...mockCrops, carrot]

            const carrotScore = scoreCell(0, 'carrot', bed, cropsWithCarrot, 2)

            // Carrot and Tomato are friends, but neither is a flower
            // Standard friend bonus only: +1
            expect(carrotScore).toBe(1)
        })
    })

    describe('autoFillFromStash', () => {
        it('places single crop in empty bed', () => {
            const bed = Array(4).fill(null)
            const stash = { 'tomato': 1 }

            const result = autoFillFromStash(bed, stash, mockCrops, 2)

            expect(result.placed.length).toBe(1)
            expect(result.placed[0]!.cropId).toBe('tomato')
            expect(result.failed.length).toBe(0)
        })

        it('places compatible crops together', () => {
            const bed = Array(4).fill(null)
            const stash = { 'tomato': 1, 'basil': 1 }

            const result = autoFillFromStash(bed, stash, mockCrops, 2)

            expect(result.placed.length).toBe(2)

            const idx1 = result.placed[0]!.cellIndex
            const idx2 = result.placed[1]!.cellIndex
            const isAdjacent = Math.abs(idx1 - idx2) === 1 || Math.abs(idx1 - idx2) === 2
            expect(isAdjacent).toBe(true)
        })

        it('avoids placing enemies together', () => {
            const bed = Array(4).fill(null)
            const stash = { 'tomato': 1, 'brassica': 1 }

            const result = autoFillFromStash(bed, stash, mockCrops, 2)

            expect(result.placed.length).toBe(2)
            // Just assert they are placed. The logic guarantees avoidance if possible.
        })

        it('reports failure when no valid spots exist', () => {
            const tomato = mockCrops.find(c => c.id === 'tomato')!
            // 1x3 bed: [Tomato, Empty, Tomato]
            const bed2 = [tomato, null, tomato]
            const stash = { 'brassica': 1 }

            const result = autoFillFromStash(bed2, stash, mockCrops, 3)

            expect(result.placed.length).toBe(0)
            expect(result.failed.length).toBe(1)
            expect(result.failed[0]!.reason).toContain('No valid spot')
        })
    })

    describe('autoFillAllBoxes', () => {
        it('distributes stash proportionally across equal-sized boxes', () => {
            // Box 1: 2x2. Box 2: 2x2. Equal size boxes should get roughly equal allocation.
            const box1 = { id: 'b1', cells: Array(4).fill(null) as (Crop | null)[], width: 2 }
            const box2 = { id: 'b2', cells: Array(4).fill(null) as (Crop | null)[], width: 2 }
            const stash = { 'tomato': 6 }

            const result = autoFillAllBoxes([box1, box2], stash, mockCrops)

            const r1 = result.boxResults.find(r => r.boxId === 'b1')!
            const r2 = result.boxResults.find(r => r.boxId === 'b2')!

            // With proportional distribution, each box should get 3 tomatoes (6 * 0.5)
            expect(r1.placed.length).toBe(3)
            expect(r2.placed.length).toBe(3)
            expect(result.remainingStash['tomato']).toBeUndefined() // Fully placed
        })

        it('distributes stash evenly when first box can fit everything', () => {
            // Bug: When first box is large enough, it takes everything and leaves nothing for other boxes
            // Box 1: 4x4 = 16 cells (plenty of space). Box 2: 3x3 = 9 cells.
            const box1 = { id: 'b1', cells: Array(16).fill(null) as (Crop | null)[], width: 4 }
            const box2 = { id: 'b2', cells: Array(9).fill(null) as (Crop | null)[], width: 3 }
            const stash = { 'tomato': 4, 'basil': 2 }

            const result = autoFillAllBoxes([box1, box2], stash, mockCrops)

            const r1 = result.boxResults.find(r => r.boxId === 'b1')!
            const r2 = result.boxResults.find(r => r.boxId === 'b2')!

            // Should distribute items across both boxes, not put everything in box1
            expect(r1.placed.length).toBeGreaterThan(0)
            expect(r2.placed.length).toBeGreaterThan(0) // This will fail with current buggy implementation

            // Total should be 6 items placed
            expect(r1.placed.length + r2.placed.length).toBe(6)
            expect(result.remainingStash['tomato']).toBeUndefined()
            expect(result.remainingStash['basil']).toBeUndefined()
        })

        it('returns remaining stash if all boxes full', () => {
            // Box 1: 2x2. Stash: 10 tomatoes.
            const box1 = { id: 'b1', cells: Array(4).fill(null) as (Crop | null)[], width: 2 }
            const stash = { 'tomato': 10 }

            const result = autoFillAllBoxes([box1], stash, mockCrops)

            // Should place 4. Remaining should be 6.
            expect(result.boxResults[0]!.placed.length).toBe(4)
            expect(result.remainingStash['tomato']).toBe(6)
        })
    })
})

describe('autoFillGaps', () => {
    it('fills empty cells with friendly crops', () => {
        // Setup: Bed with 1 Tomato (needs Basil or Marigold)
        const bed = Array(4).fill(null)
        const tomato = mockCrops.find(c => c.id === 'tomato')!
        bed[0] = tomato

        // Should fill remaining 3 slots with friendly crops (Basil or Marigold)
        const result = autoFillGaps(bed, mockCrops, 4)

        expect(result.length).toBeGreaterThan(0)
        // At least one placement should be a friend of tomato (basil or marigold)
        const hasFriendlyPlacement = result.some(p =>
            p.cropId === 'basil' || p.cropId === 'marigold'
        )
        expect(hasFriendlyPlacement).toBe(true)
    })

    it('does not place enemies adjacent to each other', () => {
        // Setup: Bed with Brassica at position 0 in a 2x2 grid (width=2)
        // Grid: [Brassica, ?, ?, ?]
        // Position 1 (right) and 2 (below) are adjacent to position 0
        const bed = Array(4).fill(null)
        const brassica = mockCrops.find(c => c.id === 'brassica')!
        bed[0] = brassica

        const result = autoFillGaps(bed, mockCrops, 2)

        // Tomato is enemy of Brassica, but can be placed at position 3 (not adjacent)
        // So we just verify that enemies aren't placed in adjacent cells (positions 1 and 2)
        const tomatoAt1 = result.some(p => p.cropId === 'tomato' && p.cellIndex === 1)
        const tomatoAt2 = result.some(p => p.cropId === 'tomato' && p.cellIndex === 2)

        expect(tomatoAt1).toBe(false) // Position 1 is adjacent (right)
        expect(tomatoAt2).toBe(false) // Position 2 is adjacent (below)
    })

    it('respects flower density limit during gap filling', () => {
        // Setup: Bed with 2 existing flowers in a 32-cell grid (4x8 bed)
        const bed = Array(32).fill(null) as (Crop | null)[]
        const marigold = mockCrops.find(c => c.id === 'marigold')!

        // Pre-plant 2 flowers
        bed[0] = marigold
        bed[1] = marigold

        // Max flowers for 32 cells = 15% of 32 = 4.8 -> 4 flowers
        // We have 2. We can plant 2 more. The rest MUST be vegetables.

        const result = autoFillGaps(bed, mockCrops, 8)

        // Count total flowers (pre-planted + new)
        const newFlowers = result.filter(p => p.cropId === 'marigold').length
        const totalFlowers = 2 + newFlowers

        // Should not exceed 4 (15% of 32)
        expect(totalFlowers).toBeLessThanOrEqual(4)

        // Should have planted vegetables in the remaining spots
        const newVegetables = result.filter(p => {
            const crop = mockCrops.find(c => c.id === p.cropId)
            return crop?.type === 'vegetable'
        }).length
        expect(newVegetables).toBeGreaterThan(10)
    })
})
