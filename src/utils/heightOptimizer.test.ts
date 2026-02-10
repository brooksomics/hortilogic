/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, it, expect } from 'vitest'
import { optimizeHeightPlacement } from './heightOptimizer'
import type { Crop } from '../types/garden'

const makeCrop = (id: string, height: number, enemies: string[] = []): Crop => ({
    id,
    name: id,
    type: 'vegetable',
    botanical_family: 'Test',
    emoji: '🌱',
    sfg_density: 1,
    sun: 'full',
    days_to_maturity: 60,
    water_need: 3,
    height_inches: height,
    trellisable: false,
    companions: { friends: [], enemies },
    planting_strategy: { start_window_start: 0, start_window_end: 6 }
})

describe('optimizeHeightPlacement', () => {
    it('swaps tall crop south and short crop north', () => {
        // 4-wide x 2-tall grid, orientation=0 (N at top)
        // Row 0 (north): short(6") at col 0
        // Row 1 (south): tall(60") at col 0
        const short = makeCrop('radish', 6)
        const tall = makeCrop('okra', 60)
        const bed: (Crop | null)[] = [
            short, null, null, null,
            tall, null, null, null,
        ]

        optimizeHeightPlacement(bed, 4, 2, 0)

        // After optimization, tall should be at row 0 (north)
        expect(bed[0]!.id).toBe('okra')
        expect(bed[4]!.id).toBe('radish')
    })

    it('swaps tall crop east when orientation=90 (E at top)', () => {
        // 4-wide x 2-tall grid, orientation=90 (E at top)
        // South is at the right (col 3), north at the left (col 0)
        // Col 0 (north): short | Col 3 (south): tall
        const short = makeCrop('radish', 6)
        const tall = makeCrop('okra', 60)
        const bed: (Crop | null)[] = [
            short, null, null, tall,
            null, null, null, null,
        ]

        optimizeHeightPlacement(bed, 4, 2, 90)

        // Tall should move to col 0 (north/left with E at top)
        expect(bed[0]!.id).toBe('okra')
        expect(bed[3]!.id).toBe('radish')
    })

    it('does not swap if it would create enemy conflict', () => {
        // 2-wide x 2-tall grid
        // Row 0: both enemies of okra → okra blocked from all north positions
        const enemy1 = makeCrop('enemy1', 12, ['okra'])
        const enemy2 = makeCrop('enemy2', 12, ['okra'])
        const tall = makeCrop('okra', 60, ['enemy1', 'enemy2'])
        const short = makeCrop('radish', 6)
        const bed: (Crop | null)[] = [
            enemy1, enemy2,
            tall, short,
        ]

        optimizeHeightPlacement(bed, 2, 2, 0)

        // All north positions and [3] are adjacent to enemies of okra
        // Okra must stay at [2]
        expect(bed[2]!.id).toBe('okra')
    })

    it('does not swap crops of equal height', () => {
        const a = makeCrop('a', 30)
        const b = makeCrop('b', 30)
        const bed: (Crop | null)[] = [b, null, null, null, a, null, null, null]

        optimizeHeightPlacement(bed, 4, 2, 0)

        // No swap since both are same height
        expect(bed[0]!.id).toBe('b')
        expect(bed[4]!.id).toBe('a')
    })

    it('handles bed with null cells', () => {
        const tall = makeCrop('okra', 60)
        const short = makeCrop('radish', 6)
        const bed: (Crop | null)[] = [
            short, null, null, null,
            null, null, null, tall,
        ]

        optimizeHeightPlacement(bed, 4, 2, 0)

        // Tall should swap with short to get to north
        expect(bed[0]!.id).toBe('okra')
        expect(bed[7]!.id).toBe('radish')
    })
})
