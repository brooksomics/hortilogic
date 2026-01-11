import { describe, it, expect } from 'vitest'
import { SeededRandom } from './seededRandom'

describe('SeededRandom', () => {
  describe('Determinism', () => {
    it('produces identical sequences with same string seed', () => {
      const rng1 = new SeededRandom('test-seed')
      const rng2 = new SeededRandom('test-seed')

      const sequence1 = Array.from({ length: 10 }, () => rng1.next())
      const sequence2 = Array.from({ length: 10 }, () => rng2.next())

      expect(sequence1).toEqual(sequence2)
    })

    it('produces identical sequences with same numeric seed', () => {
      const rng1 = new SeededRandom(12345)
      const rng2 = new SeededRandom(12345)

      const sequence1 = Array.from({ length: 10 }, () => rng1.next())
      const sequence2 = Array.from({ length: 10 }, () => rng2.next())

      expect(sequence1).toEqual(sequence2)
    })

    it('produces different sequences with different seeds', () => {
      const rng1 = new SeededRandom('seed-A')
      const rng2 = new SeededRandom('seed-B')

      const sequence1 = Array.from({ length: 10 }, () => rng1.next())
      const sequence2 = Array.from({ length: 10 }, () => rng2.next())

      expect(sequence1).not.toEqual(sequence2)
    })
  })

  describe('next()', () => {
    it('returns numbers between 0 and 1', () => {
      const rng = new SeededRandom('test')

      for (let i = 0; i < 100; i++) {
        const value = rng.next()
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThan(1)
      }
    })

    it('produces different values on subsequent calls', () => {
      const rng = new SeededRandom('test')

      const values = new Set()
      for (let i = 0; i < 10; i++) {
        values.add(rng.next())
      }

      // Should have multiple unique values
      expect(values.size).toBeGreaterThan(1)
    })
  })

  describe('shuffle()', () => {
    it('produces identical shuffles with same seed', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

      const rng1 = new SeededRandom('shuffle-test')
      const rng2 = new SeededRandom('shuffle-test')

      const shuffled1 = rng1.shuffle(array)
      const shuffled2 = rng2.shuffle(array)

      expect(shuffled1).toEqual(shuffled2)
    })

    it('does not modify original array', () => {
      const original = [1, 2, 3, 4, 5]
      const rng = new SeededRandom('test')

      rng.shuffle(original)

      expect(original).toEqual([1, 2, 3, 4, 5])
    })

    it('contains all original elements', () => {
      const original = [1, 2, 3, 4, 5]
      const rng = new SeededRandom('test')

      const shuffled = rng.shuffle(original)

      expect(shuffled.sort()).toEqual(original.sort())
    })

    it('produces different shuffles with different seeds', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

      const rng1 = new SeededRandom('seed-A')
      const rng2 = new SeededRandom('seed-B')

      const shuffled1 = rng1.shuffle(array)
      const shuffled2 = rng2.shuffle(array)

      expect(shuffled1).not.toEqual(shuffled2)
    })
  })

  describe('choice()', () => {
    it('returns element from array', () => {
      const array = ['a', 'b', 'c', 'd']
      const rng = new SeededRandom('test')

      const choice = rng.choice(array)

      expect(array).toContain(choice)
    })

    it('returns undefined for empty array', () => {
      const rng = new SeededRandom('test')
      const emptyArray: string[] = []

      const choice = rng.choice(emptyArray)

      expect(choice).toBeUndefined()
    })

    it('produces same choice with same seed', () => {
      const array = ['a', 'b', 'c', 'd']

      const rng1 = new SeededRandom('choice-test')
      const rng2 = new SeededRandom('choice-test')

      const choice1 = rng1.choice(array)
      const choice2 = rng2.choice(array)

      expect(choice1).toBe(choice2)
    })
  })

  describe('randInt()', () => {
    it('returns integer in range', () => {
      const rng = new SeededRandom('test')

      for (let i = 0; i < 100; i++) {
        const value = rng.randInt(0, 10)
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThan(10)
        expect(Number.isInteger(value)).toBe(true)
      }
    })

    it('produces same sequence with same seed', () => {
      const rng1 = new SeededRandom('int-test')
      const rng2 = new SeededRandom('int-test')

      const sequence1 = Array.from({ length: 10 }, () => rng1.randInt(0, 100))
      const sequence2 = Array.from({ length: 10 }, () => rng2.randInt(0, 100))

      expect(sequence1).toEqual(sequence2)
    })
  })
})
