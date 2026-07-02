import { describe, it, expect } from 'vitest'
import { CropSchema } from './crop'
import cropsJson from '../data/crops.json'

describe('CropSchema', () => {
  it('validates every crop in the catalog', () => {
    expect(() => CropSchema.array().parse(cropsJson)).not.toThrow()
  })

  it('rejects a crop with a missing required field', () => {
    const bad = { ...cropsJson[0], id: undefined }
    expect(() => CropSchema.parse(bad)).toThrow()
  })

  it('rejects an out-of-range water_need', () => {
    const bad = { ...cropsJson[0], water_need: 9 }
    expect(() => CropSchema.parse(bad)).toThrow()
  })

  it('rejects an unknown crop type', () => {
    const bad = { ...cropsJson[0], type: 'mineral' }
    expect(() => CropSchema.parse(bad)).toThrow()
  })
})
