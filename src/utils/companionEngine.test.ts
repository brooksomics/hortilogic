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

  describe('custom grid widths', () => {
    it('handles 2x4 grid (8 cells, width=2)', () => {
      const grid: (Crop | null)[] = Array(8).fill(null) as (Crop | null)[]
      // Grid layout (2 cols x 4 rows):
      // [0][1]
      // [2][3]
      // [4][5]
      // [6][7]

      grid[0] = tomato  // Top-left
      grid[1] = peas    // Top-right
      grid[2] = carrot  // Below tomato
      grid[3] = peas    // Right of cell 2
      grid[4] = tomato  // Below cell 2

      // Cell 2 (row 1, col 0) should have neighbors: 0 (top), 3 (right), 4 (bottom)
      const neighbors = getNeighbors(grid, 2, 2)

      expect(neighbors).toHaveLength(3)
      expect(neighbors.filter(n => n === 'tomato')).toHaveLength(2) // top and bottom
      expect(neighbors).toContain('peas') // right
    })

    it('handles 3x3 grid (9 cells, width=3)', () => {
      const grid: (Crop | null)[] = Array(9).fill(null) as (Crop | null)[]
      // Grid layout (3 cols x 3 rows):
      // [0][1][2]
      // [3][4][5]
      // [6][7][8]

      grid[1] = tomato   // Top
      grid[3] = peas     // Left
      grid[5] = carrot   // Right
      grid[7] = tomato   // Bottom

      // Cell 4 (center) should have all 4 neighbors
      const neighbors = getNeighbors(grid, 4, 3)

      expect(neighbors).toHaveLength(4)
      expect(neighbors.filter(n => n === 'tomato')).toHaveLength(2)
      expect(neighbors).toContain('peas')
      expect(neighbors).toContain('carrot')
    })

    it('handles 6x4 grid with correct right edge detection', () => {
      const grid: (Crop | null)[] = Array(24).fill(null) as (Crop | null)[]
      // Grid layout (6 cols x 4 rows)
      // Cell 5 is on right edge (row 0, col 5)

      grid[4] = peas     // Left of cell 5
      grid[11] = carrot  // Below cell 5 (5 + 6 = 11)

      const neighbors = getNeighbors(grid, 5, 6)

      // Should have left and bottom neighbors only (no right or top)
      expect(neighbors).toHaveLength(2)
      expect(neighbors).toContain('peas')
      expect(neighbors).toContain('carrot')
    })

    it('handles 1x10 grid (single column)', () => {
      const grid: (Crop | null)[] = Array(10).fill(null) as (Crop | null)[]

      grid[4] = tomato   // Above cell 5
      grid[6] = peas     // Below cell 5

      // Cell 5 in single column should only have top and bottom neighbors
      const neighbors = getNeighbors(grid, 5, 1)

      expect(neighbors).toHaveLength(2)
      expect(neighbors).toContain('tomato')
      expect(neighbors).toContain('peas')
    })

    it('handles 10x1 grid (single row)', () => {
      const grid: (Crop | null)[] = Array(10).fill(null) as (Crop | null)[]

      grid[4] = tomato   // Left of cell 5
      grid[6] = peas     // Right of cell 5

      // Cell 5 in single row should only have left and right neighbors
      const neighbors = getNeighbors(grid, 5, 10)

      expect(neighbors).toHaveLength(2)
      expect(neighbors).toContain('tomato')
      expect(neighbors).toContain('peas')
    })

    it('maintains backward compatibility with default width=8', () => {
      const grid = createGrid()
      grid[1] = tomato   // Top
      grid[8] = peas     // Left
      grid[10] = carrot  // Right
      grid[17] = tomato  // Bottom

      // Cell 9 with no width param should default to 8 (4x8 grid)
      const neighbors = getNeighbors(grid, 9)

      expect(neighbors).toHaveLength(4)
    })
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

  describe('custom dimensions', () => {
    it('handles 2x4 grid (8 cells)', () => {
      const grid: (Crop | null)[] = Array(8).fill(null) as (Crop | null)[]
      const crops = [tomato, carrot]
      const targetDate = new Date('2024-05-20')

      const result = autoFillBed(grid, crops, profile, targetDate, 2, 4)

      // Should fill the 8-cell grid
      expect(result).toHaveLength(8)
      const plantedCount = result.filter(cell => cell !== null).length
      expect(plantedCount).toBeGreaterThan(0)
    })

    it('handles 3x3 grid (9 cells)', () => {
      const grid: (Crop | null)[] = Array(9).fill(null) as (Crop | null)[]
      const crops = [tomato, carrot, peas]
      const targetDate = new Date('2024-05-20')

      const result = autoFillBed(grid, crops, profile, targetDate, 3, 3)

      // Should fill the 9-cell grid
      expect(result).toHaveLength(9)
      const plantedCount = result.filter(cell => cell !== null).length
      expect(plantedCount).toBeGreaterThan(0)
    })

    it('respects companion rules with custom dimensions', () => {
      const grid: (Crop | null)[] = Array(6).fill(null) as (Crop | null)[]
      // 2x3 grid:
      // [0][1]
      // [2][3]
      // [4][5]
      grid[0] = tomato  // Plant tomato at top-left

      const crops = [peas, carrot]
      const targetDate = new Date('2024-03-15') // Both peas and carrot are viable

      const result = autoFillBed(grid, crops, profile, targetDate, 2, 3)

      // Cell 1 is to the right of tomato (enemy of peas)
      if (result[1]) {
        expect(result[1].id).not.toBe('peas')
      }

      // Cell 2 is below tomato (enemy of peas)
      if (result[2]) {
        expect(result[2].id).not.toBe('peas')
      }
    })

    it('maintains backward compatibility with default dimensions (4x8)', () => {
      const grid: (Crop | null)[] = Array(32).fill(null) as (Crop | null)[]
      const crops = [tomato, carrot]
      const targetDate = new Date('2024-05-20')

      // Call without width/height parameters
      const result = autoFillBed(grid, crops, profile, targetDate)

      // Should work as before (32 cells)
      expect(result).toHaveLength(32)
      const plantedCount = result.filter(cell => cell !== null).length
      expect(plantedCount).toBeGreaterThan(0)
    })
  })
})
