import { describe, it, expect } from 'vitest'
import { nextGridIndex } from './gridNavigation'

// 4 wide x 2 tall grid (8 cells): indices 0..7
const W = 4
const T = 8

describe('nextGridIndex', () => {
  it('moves right within a row', () => {
    expect(nextGridIndex('ArrowRight', 0, W, T)).toBe(1)
  })

  it('does not wrap past the right edge', () => {
    expect(nextGridIndex('ArrowRight', 3, W, T)).toBeNull()
  })

  it('moves left within a row', () => {
    expect(nextGridIndex('ArrowLeft', 2, W, T)).toBe(1)
  })

  it('does not wrap past the left edge', () => {
    expect(nextGridIndex('ArrowLeft', 4, W, T)).toBeNull()
  })

  it('moves down a row', () => {
    expect(nextGridIndex('ArrowDown', 1, W, T)).toBe(5)
  })

  it('does not move below the last row', () => {
    expect(nextGridIndex('ArrowDown', 5, W, T)).toBeNull()
  })

  it('moves up a row', () => {
    expect(nextGridIndex('ArrowUp', 5, W, T)).toBe(1)
  })

  it('does not move above the first row', () => {
    expect(nextGridIndex('ArrowUp', 1, W, T)).toBeNull()
  })

  it('Home jumps to the start of the row', () => {
    expect(nextGridIndex('Home', 6, W, T)).toBe(4)
  })

  it('End jumps to the end of the row, clamped to total', () => {
    expect(nextGridIndex('End', 4, W, T)).toBe(7)
    // Ragged last row (6 cells, width 4): End on index 4 clamps to 5, not 7
    expect(nextGridIndex('End', 4, W, 6)).toBe(5)
  })

  it('ignores non-navigation keys', () => {
    expect(nextGridIndex('Enter', 0, W, T)).toBeNull()
  })
})
