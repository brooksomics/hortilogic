import { describe, it, expect, afterEach } from 'vitest'
import { generateUUID } from './uuid'

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

describe('generateUUID', () => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(crypto, 'randomUUID')

  afterEach(() => {
    if (originalDescriptor) {
      Object.defineProperty(crypto, 'randomUUID', originalDescriptor)
    }
  })

  it('returns a valid UUID v4 via crypto.randomUUID', () => {
    expect(generateUUID()).toMatch(UUID_V4)
  })

  it('returns unique values across calls', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateUUID()))
    expect(ids.size).toBe(100)
  })

  it('falls back to Math.random when crypto.randomUUID is unavailable', () => {
    Object.defineProperty(crypto, 'randomUUID', {
      value: undefined,
      configurable: true,
      writable: true,
    })

    const id = generateUUID()
    expect(id).toMatch(UUID_V4)
    expect(new Set([id, generateUUID(), generateUUID()]).size).toBe(3)
  })
})
