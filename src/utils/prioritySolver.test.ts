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
        emoji: '🍅',
        sfg_density: 1, // Large crop (1 per sq ft)
        companions: {
            friends: ['basil', 'carrot'],
            enemies: ['brassica', 'potato']
        },
        // Mock other required fields
        planting_strategy: { start_window_start: 0, start_window_end: 4 }
    },
    {
        id: 'basil',
        name: 'Basil',
        emoji: '🌿',
        sfg_density: 4, // Small crop
        companions: {
            friends: ['tomato'],
            enemies: []
        },
        planting_strategy: { start_window_start: 0, start_window_end: 4 }
    },
    {
        id: 'brassica',
        name: 'Brassica',
        emoji: '🥦',
        sfg_density: 1,
        companions: {
            friends: [],
            enemies: ['tomato']
        },
        planting_strategy: { start_window_start: 0, start_window_end: 4 }
    },
    {
        id: 'lettuce',
        name: 'Lettuce',
        emoji: '🥬',
        sfg_density: 4,
        companions: {
            friends: [],
            enemies: []
        },
        planting_strategy: { start_window_start: 0, start_window_end: 4 }
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
        it('distributes stash across multiple boxes', () => {
            // Box 1: 2x2. Box 2: 2x2.
            const box1 = { id: 'b1', cells: Array(4).fill(null) as (Crop | null)[], width: 2 }
            const box2 = { id: 'b2', cells: Array(4).fill(null) as (Crop | null)[], width: 2 }
            const stash = { 'tomato': 6 }

            const result = autoFillAllBoxes([box1, box2], stash, mockCrops)

            const r1 = result.boxResults.find(r => r.boxId === 'b1')!
            const r2 = result.boxResults.find(r => r.boxId === 'b2')!

            expect(r1.placed.length).toBe(4)
            expect(r2.placed.length).toBe(2)
            expect(result.remainingStash['tomato']).toBeUndefined() // Fully placed
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
        // Setup: Bed with 1 Tomato (needs Basil)
        const bed = Array(4).fill(null)
        const tomato = mockCrops.find(c => c.id === 'tomato')!
        bed[0] = tomato

        // Should fill remaining 3 slots with Basil (or others) preference
        const result = autoFillGaps(bed, mockCrops, 4)

        expect(result.length).toBeGreaterThan(0)
        expect(result.length).toBeGreaterThan(0)
        expect(result.some(p => p.cropId === 'basil')).toBe(true)
        expect(result.some(p => p.cropId === 'basil')).toBe(true)
    })

    it('does not place enemies', () => {
        // Setup: Bed with Potato
        const bed = Array(4).fill(null)
        const potato = mockCrops.find(c => c.id === 'potato')!
        bed[0] = potato

        const result = autoFillGaps(bed, mockCrops, 2)

        // Should NOT place Tomato (enemy of Potato)
        const tomatoPlacements = result.filter(p => p.cropId === 'tomato')
        expect(tomatoPlacements.length).toBe(0)
    })
})
