/**
 * Zod Schemas for LocalStorage Validation (TODO-024)
 *
 * These schemas validate data read from LocalStorage to prevent crashes
 * from schema changes, corrupted data, or version mismatches.
 *
 * Benefits:
 * - Graceful degradation instead of crashes
 * - Safe schema evolution
 * - Clear error messages for invalid data
 * - Type safety at runtime
 */

import { z } from 'zod'

/**
 * Crop Schema
 * Validates crop objects (used in cells)
 */
export const CropSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  sfg_density: z.number().int().positive(),
  planting_strategy: z.object({
    start_window_start: z.number().int(),
    start_window_end: z.number().int(),
  }),
  companions: z.object({
    friends: z.array(z.string()),
    enemies: z.array(z.string()),
  }),
})

/**
 * Garden Profile Schema
 * Validates profile data from localStorage
 */
export const GardenProfileSchema = z.object({
  name: z.string().min(1),
  hardiness_zone: z.string().regex(/^\d{1,2}[a-b]$/i, 'Invalid hardiness zone format'),
  location: z.string().optional(),
  last_frost_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (expected YYYY-MM-DD)'),
  first_frost_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (expected YYYY-MM-DD)'),
  season_extension_weeks: z.number().int().min(0).max(52).default(0),
  targetPlantingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

/**
 * Garden Box Schema
 * Validates individual garden box (bed) data
 */
export const GardenBoxSchema = z.object({
  id: z.string().uuid('Invalid UUID format'),
  name: z.string().min(1),
  width: z.number().int().min(2).max(20),
  height: z.number().int().min(2).max(20),
  cells: z.array(z.union([CropSchema, z.null()])),
})

/**
 * Garden Layout Schema
 * Validates complete layout data
 */
export const GardenLayoutSchema = z.object({
  id: z.string().uuid('Invalid UUID format'),
  name: z.string().min(1),
  profileId: z.string().uuid('Invalid profile UUID'),
  boxes: z.array(GardenBoxSchema).min(1, 'Layout must have at least one box'),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
})

/**
 * Garden Stash Schema
 * Validates stash data (crop ID -> quantity mapping)
 */
export const GardenStashSchema = z.record(
  z.string().min(1), // crop ID
  z.number().int().positive() // quantity
)

/**
 * Profile Storage Schema
 * Validates the entire profiles storage object
 */
export const ProfileStorageSchema = z.object({
  version: z.literal(1),
  profiles: z.record(z.string().uuid(), GardenProfileSchema),
  defaultProfileId: z.string().uuid(),
})

/**
 * Layout Storage Schema
 * Validates the entire layouts storage object
 */
export const LayoutStorageSchema = z.object({
  version: z.literal(1),
  layouts: z.record(z.string().uuid(), GardenLayoutSchema),
  activeLayoutId: z.string().uuid(),
})

/**
 * Stash Storage Schema
 * Validates stash storage for a specific layout
 */
export const StashStorageSchema = GardenStashSchema

/**
 * Type exports (inferred from schemas)
 */
export type ValidatedGardenProfile = z.infer<typeof GardenProfileSchema>
export type ValidatedGardenBox = z.infer<typeof GardenBoxSchema>
export type ValidatedGardenLayout = z.infer<typeof GardenLayoutSchema>
export type ValidatedGardenStash = z.infer<typeof GardenStashSchema>
export type ValidatedProfileStorage = z.infer<typeof ProfileStorageSchema>
export type ValidatedLayoutStorage = z.infer<typeof LayoutStorageSchema>
