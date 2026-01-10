import { describe, it, expect } from 'vitest'
import { getNeighbors, checkCompanionConstraints, autoFillBed } from './companionEngine'
import type { Crop, GardenProfile } from '@/types'

describe('getNeighbors', () => {
  // Helper to create a grid with some crops
  const createGrid = (): (Crop | null)[] => Array(32).fill(null) as (Crop | null)[]

  const tomato: Crop = {
    id: 'tomato',
    name: 'Tomato',
    sfg_density: 1,
    planting_strategy: { start_window_start: 0, start_window_end: 4 },
    companions: { friends: ['carrot'], enemies: ['peas'] }
  }

  const peas: Crop = {
    id: 'peas',
    name: 'Peas',
    sfg_density: 8,
    planting_strategy: { start_window_start: -8, start_window_end: -2 },
    companions: { friends: ['carrot'], enemies: ['tomato'] }
  }

  const carrot: Crop = {
    id: 'carrot',
    name: 'Carrot',
    sfg_density: 16,
    planting_strategy: { start_window_start: -2, start_window_end: 4 },
    companions: { friends: ['tomato', 'peas'], enemies: [] }
  }

  it('returns empty array for cell in top-left corner (index 0)', () => {
    const grid = createGrid()
    grid[1] = tomato  // Right neighbor
    grid[8] = peas    // Bottom neighbor

    const neighbors = getNeighbors(grid, 0, 8, 4)

    // Only right and bottom neighbors exist for corner cell
    expect(neighbors).toHaveLength(2)
    expect(neighbors).toContain('tomato')
    expect(neighbors).toContain('peas')
  })

  it('returns all 4 neighbors for a center cell', () => {
    const grid = createGrid()
    // Cell 9 (row 1, col 1) has neighbors at: 1 (top), 8 (left), 10 (right), 17 (bottom)
    grid[1] = tomato   // Top
    grid[8] = peas     // Left
    grid[10] = carrot  // Right
    grid[17] = tomato  // Bottom

    const neighbors = getNeighbors(grid, 9, 8, 4)

    expect(neighbors).toHaveLength(4)
    expect(neighbors.filter(n => n === 'tomato')).toHaveLength(2)
    expect(neighbors).toContain('peas')
    expect(neighbors).toContain('carrot')
  })

  it('returns only crop IDs, ignoring null cells', () => {
    const grid = createGrid()
    grid[1] = tomato  // Top neighbor of index 9
    // Other neighbors (8, 10, 17) are null

    const neighbors = getNeighbors(grid, 9, 8, 4)

    expect(neighbors).toHaveLength(1)
    expect(neighbors).toEqual(['tomato'])
  })

  it('handles right edge cells correctly (only left, top, bottom)', () => {
    const grid = createGrid()
    // Cell 7 is on right edge (row 0, col 7)
    grid[6] = peas    // Left
    grid[15] = carrot // Bottom

    const neighbors = getNeighbors(grid, 7, 8, 4)

    expect(neighbors).toHaveLength(2)
    expect(neighbors).toContain('peas')
    expect(neighbors).toContain('carrot')
  })

  it('handles bottom-right corner (index 31)', () => {
    const grid = createGrid()
    grid[30] = tomato  // Left
    grid[23] = peas    // Top

    const neighbors = getNeighbors(grid, 31, 8, 4)

    expect(neighbors).toHaveLength(2)
    expect(neighbors).toContain('tomato')
    expect(neighbors).toContain('peas')
  })

  it('returns empty array when all neighbors are null', () => {
    const grid = createGrid()

    const neighbors = getNeighbors(grid, 9, 8, 4)

    expect(neighbors).toEqual([])
  })
})

describe('checkCompanionConstraints', () => {
  const tomato: Crop = {
    id: 'tomato',
    name: 'Tomato',
    sfg_density: 1,
    planting_strategy: { start_window_start: 0, start_window_end: 4 },
    companions: { friends: ['carrot'], enemies: ['peas'] }
  }

  const carrot: Crop = {
    id: 'carrot',
    name: 'Carrot',
    sfg_density: 16,
    planting_strategy: { start_window_start: -2, start_window_end: 4 },
    companions: { friends: ['tomato', 'peas'], enemies: [] }
  }

  it('returns TRUE when no neighbors are enemies', () => {
    const neighborIds = ['carrot', 'lettuce']
    expect(checkCompanionConstraints(tomato, neighborIds)).toBe(true)
  })

  it('returns FALSE when at least one neighbor is an enemy', () => {
    const neighborIds = ['carrot', 'peas']  // peas is enemy of tomato
    expect(checkCompanionConstraints(tomato, neighborIds)).toBe(false)
  })

  it('returns TRUE when neighbors array is empty', () => {
    expect(checkCompanionConstraints(tomato, [])).toBe(true)
  })

  it('returns TRUE when crop has no enemies', () => {
    const neighborIds = ['tomato', 'peas', 'anything']
    expect(checkCompanionConstraints(carrot, neighborIds)).toBe(true)
  })

  it('returns FALSE when multiple neighbors are enemies', () => {
    const multiEnemy: Crop = {
      id: 'test',
      sfg_density: 1,
      planting_strategy: { start_window_start: 0, start_window_end: 4 },
      companions: { friends: [], enemies: ['peas', 'tomato', 'carrot'] }
    }

    const neighborIds = ['peas', 'tomato']
    expect(checkCompanionConstraints(multiEnemy, neighborIds)).toBe(false)
  })
})

describe('autoFillBed', () => {
  const profile: GardenProfile = {
    name: 'Test Garden',
    hardiness_zone: '5b',
    last_frost_date: '2024-05-15',
    first_frost_date: '2024-10-01',
    season_extension_weeks: 0
  }

  const tomato: Crop = {
    id: 'tomato',
    name: 'Tomato',
    sfg_density: 1,
    planting_strategy: { start_window_start: 0, start_window_end: 4 },
    companions: { friends: ['carrot'], enemies: ['peas'] }
  }

  const peas: Crop = {
    id: 'peas',
    name: 'Peas',
    sfg_density: 8,
    planting_strategy: { start_window_start: -8, start_window_end: -2 },
    companions: { friends: ['carrot'], enemies: ['tomato'] }
  }

  const carrot: Crop = {
    id: 'carrot',
    name: 'Carrot',
    sfg_density: 16,
    planting_strategy: { start_window_start: -2, start_window_end: 4 },
    companions: { friends: ['tomato', 'peas'], enemies: [] }
  }

  it('fills empty cells with viable crops', () => {
    const grid: (Crop | null)[] = Array(32).fill(null) as (Crop | null)[]
    const crops = [tomato, carrot]
    const targetDate = new Date('2024-05-20') // Just after LFD - tomato and carrot are viable

    const result = autoFillBed(grid, crops, profile, 8, 4, targetDate)

    // Should have planted some crops
    const plantedCount = result.filter(cell => cell !== null).length
    expect(plantedCount).toBeGreaterThan(0)

    // All planted crops should be from our crop list
    result.forEach(cell => {
      if (cell) {
        expect(['tomato', 'carrot']).toContain(cell.id)
      }
    })
  })

  it('preserves existing crops (does not overwrite)', () => {
    const grid: (Crop | null)[] = Array(32).fill(null) as (Crop | null)[]
    grid[0] = tomato  // Manually planted
    grid[5] = carrot  // Manually planted

    const crops = [peas]
    const targetDate = new Date('2024-03-15') // Peas are viable

    const result = autoFillBed(grid, crops, profile, 8, 4, targetDate)

    // Original crops should still be there
    expect(result[0]).toEqual(tomato)
    expect(result[5]).toEqual(carrot)
  })

  it('respects companion planting rules (no enemies adjacent)', () => {
    const grid: (Crop | null)[] = Array(32).fill(null) as (Crop | null)[]
    grid[0] = tomato  // Tomato at index 0

    const crops = [peas, carrot]
    const targetDate = new Date('2024-03-15') // Both peas and carrot are viable

    const result = autoFillBed(grid, crops, profile, 8, 4, targetDate)

    // Index 1 is to the right of tomato (index 0)
    // Should NOT plant peas there (enemy of tomato)
    if (result[1]) {
      expect(result[1].id).not.toBe('peas')
    }

    // Index 8 is below tomato (index 0)
    // Should NOT plant peas there either
    if (result[8]) {
      expect(result[8].id).not.toBe('peas')
    }
  })

  it('only plants crops that are viable for the target date', () => {
    const grid: (Crop | null)[] = Array(32).fill(null) as (Crop | null)[]
    const crops = [tomato, peas, carrot]
    const targetDate = new Date('2024-06-01') // Only tomato and carrot viable, peas window has passed

    const result = autoFillBed(grid, crops, profile, 8, 4, targetDate)

    // No peas should be planted
    const peasPlanted = result.some(cell => cell?.id === 'peas')
    expect(peasPlanted).toBe(false)
  })

  it('handles empty crop library gracefully', () => {
    const grid: (Crop | null)[] = Array(32).fill(null) as (Crop | null)[]
    const crops: Crop[] = []
    const targetDate = new Date('2024-05-20')

    const result = autoFillBed(grid, crops, profile, 8, 4, targetDate)

    // Should return grid unchanged (all null)
    expect(result.every(cell => cell === null)).toBe(true)
  })

  it('handles fully planted grid gracefully', () => {
    const grid: (Crop | null)[] = Array(32).fill(tomato) as (Crop | null)[]
    const crops = [carrot]
    const targetDate = new Date('2024-05-20')

    const result = autoFillBed(grid, crops, profile, 8, 4, targetDate)

    // Should return grid unchanged (all tomato)
    expect(result.every(cell => cell?.id === 'tomato')).toBe(true)
  })
})
