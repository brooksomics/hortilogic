/**
 * Crop catalog loader.
 *
 * The catalog data lives in crops.json (286 crops) and is validated
 * against the Zod CropSchema once at module load — invalid data throws
 * immediately rather than surfacing as downstream undefined behavior.
 */

import type { Crop } from '@/types/garden'
import { CropSchema } from '@/schemas/crop'
import cropsJson from './crops.json'

export const CROP_DATABASE: Crop[] = CropSchema.array().parse(cropsJson)

/**
 * Lookup object for quick crop retrieval by ID
 */
export const CROPS_BY_ID: Record<string, Crop> = CROP_DATABASE.reduce<
  Record<string, Crop>
>((acc, crop) => {
  acc[crop.id] = crop
  return acc
}, {})

/**
 * Get crops by type
 */
export function getCropsByType(
  type: 'vegetable' | 'herb' | 'flower' | 'fruit'
): Crop[] {
  return CROP_DATABASE.filter(crop => crop.type === type)
}

/**
 * Get crops by botanical family
 */
export function getCropsByFamily(family: string): Crop[] {
  return CROP_DATABASE.filter(crop => crop.botanical_family === family)
}

/**
 * Get all unique botanical families
 */
export function getAllFamilies(): string[] {
  const families = new Set(CROP_DATABASE.map(crop => crop.botanical_family))
  return Array.from(families).sort()
}

/**
 * Database statistics
 */
export const DATABASE_STATS = {
  total: CROP_DATABASE.length,
  vegetables: getCropsByType('vegetable').length,
  herbs: getCropsByType('herb').length,
  flowers: getCropsByType('flower').length,
  fruits: getCropsByType('fruit').length,
  families: getAllFamilies().length,
}
