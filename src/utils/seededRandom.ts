/**
 * Seeded Random Number Generator (TODO-023)
 *
 * Provides deterministic random number generation using Linear Congruential Generator (LCG).
 * This ensures that the same seed always produces the same sequence of random numbers,
 * making the Automagic Fill solver predictable and reproducible.
 *
 * @example
 * const rng = new SeededRandom('my-seed')
 * const value1 = rng.next() // 0.123...
 * const value2 = rng.next() // 0.456...
 *
 * const rng2 = new SeededRandom('my-seed')
 * const value3 = rng2.next() // 0.123... (same as value1)
 */

export class SeededRandom {
  private seed: number

  /**
   * Create a new seeded random number generator
   * @param seed - String or number to seed the generator
   */
  constructor(seed: string | number) {
    this.seed = typeof seed === 'string' ? this.hashCode(seed) : seed
  }

  /**
   * Convert string to numeric hash (simple hash function)
   * @param str - String to hash
   * @returns Numeric hash value
   */
  private hashCode(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i)
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  /**
   * Generate next random number in sequence
   * Uses Linear Congruential Generator (LCG) algorithm
   * @returns Random number between 0 and 1
   */
  next(): number {
    // LCG parameters (same as glibc)
    const a = 1664525
    const c = 1013904223
    const m = 2 ** 32

    this.seed = (a * this.seed + c) % m
    return this.seed / m
  }

  /**
   * Shuffle array using Fisher-Yates algorithm with seeded randomness
   * @param array - Array to shuffle
   * @returns New shuffled array (original not modified)
   */
  shuffle<T>(array: T[]): T[] {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
    }
    return arr
  }

  /**
   * Select random element from array
   * @param array - Array to select from
   * @returns Random element or undefined if array is empty
   */
  choice<T>(array: T[]): T | undefined {
    if (array.length === 0) return undefined
    const index = Math.floor(this.next() * array.length)
    return array[index]
  }

  /**
   * Generate random integer in range [min, max)
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (exclusive)
   * @returns Random integer
   */
  randInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min
  }
}
