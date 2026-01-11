/**
 * Storage Validation Helpers (TODO-024)
 *
 * Provides safe reading/writing of data to LocalStorage with Zod validation.
 * Prevents crashes from corrupted data, schema changes, or version mismatches.
 *
 * Key Features:
 * - Runtime validation with Zod schemas
 * - Graceful fallback to defaults on validation errors
 * - Error logging for debugging
 * - Type-safe parsing
 */

import { ZodSchema, ZodError } from 'zod'
import {
  ProfileStorageSchema,
  LayoutStorageSchema,
  StashStorageSchema,
  type ValidatedProfileStorage,
  type ValidatedLayoutStorage,
  type ValidatedGardenStash,
} from '../schemas/garden'

/**
 * Parse and validate data using a Zod schema
 * @param data - Raw data to validate
 * @param schema - Zod schema to validate against
 * @param errorContext - Context for error logging
 * @returns Validated data or null if validation fails
 */
function parseWithSchema<T>(
  data: unknown,
  schema: ZodSchema<T>,
  errorContext: string
): T | null {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(`[StorageValidation] ${errorContext}:`, {
        errors: error.errors,
        data,
      })
    } else {
      console.error(`[StorageValidation] Unexpected error in ${errorContext}:`, error)
    }
    return null
  }
}

/**
 * Safely read and parse ProfileStorage from localStorage
 * @param key - LocalStorage key
 * @returns Validated ProfileStorage or null if invalid
 */
export function readProfileStorage(key: string): ValidatedProfileStorage | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    return parseWithSchema(parsed, ProfileStorageSchema, `readProfileStorage(${key})`)
  } catch (error) {
    console.error(`[StorageValidation] Failed to read ProfileStorage from key "${key}":`, error)
    return null
  }
}

/**
 * Safely read and parse LayoutStorage from localStorage
 * @param key - LocalStorage key
 * @returns Validated LayoutStorage or null if invalid
 */
export function readLayoutStorage(key: string): ValidatedLayoutStorage | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    return parseWithSchema(parsed, LayoutStorageSchema, `readLayoutStorage(${key})`)
  } catch (error) {
    console.error(`[StorageValidation] Failed to read LayoutStorage from key "${key}":`, error)
    return null
  }
}

/**
 * Safely read and parse GardenStash from localStorage
 * @param key - LocalStorage key
 * @returns Validated GardenStash or empty stash if invalid
 */
export function readStashStorage(key: string): ValidatedGardenStash {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return {}

    const parsed = JSON.parse(raw)
    const validated = parseWithSchema(parsed, StashStorageSchema, `readStashStorage(${key})`)
    return validated ?? {}
  } catch (error) {
    console.error(`[StorageValidation] Failed to read StashStorage from key "${key}":`, error)
    return {}
  }
}

/**
 * Safely write ProfileStorage to localStorage
 * Validates before writing to catch bugs early
 * @param key - LocalStorage key
 * @param data - ProfileStorage to write
 * @returns true if successful, false if validation failed
 */
export function writeProfileStorage(key: string, data: unknown): boolean {
  const validated = parseWithSchema(data, ProfileStorageSchema, `writeProfileStorage(${key})`)
  if (!validated) {
    console.error(`[StorageValidation] Attempted to write invalid ProfileStorage to "${key}"`)
    return false
  }

  try {
    localStorage.setItem(key, JSON.stringify(validated))
    return true
  } catch (error) {
    console.error(`[StorageValidation] Failed to write ProfileStorage to "${key}":`, error)
    return false
  }
}

/**
 * Safely write LayoutStorage to localStorage
 * Validates before writing to catch bugs early
 * @param key - LocalStorage key
 * @param data - LayoutStorage to write
 * @returns true if successful, false if validation failed
 */
export function writeLayoutStorage(key: string, data: unknown): boolean {
  const validated = parseWithSchema(data, LayoutStorageSchema, `writeLayoutStorage(${key})`)
  if (!validated) {
    console.error(`[StorageValidation] Attempted to write invalid LayoutStorage to "${key}"`)
    return false
  }

  try {
    localStorage.setItem(key, JSON.stringify(validated))
    return true
  } catch (error) {
    console.error(`[StorageValidation] Failed to write LayoutStorage to "${key}":`, error)
    return false
  }
}

/**
 * Safely write GardenStash to localStorage
 * Validates before writing
 * @param key - LocalStorage key
 * @param data - GardenStash to write
 * @returns true if successful, false if validation failed
 */
export function writeStashStorage(key: string, data: unknown): boolean {
  const validated = parseWithSchema(data, StashStorageSchema, `writeStashStorage(${key})`)
  if (!validated) {
    console.error(`[StorageValidation] Attempted to write invalid StashStorage to "${key}"`)
    return false
  }

  try {
    localStorage.setItem(key, JSON.stringify(validated))
    return true
  } catch (error) {
    console.error(`[StorageValidation] Failed to write StashStorage to "${key}":`, error)
    return false
  }
}

/**
 * Generic safe read with fallback
 * @param key - LocalStorage key
 * @param schema - Zod schema for validation
 * @param fallback - Default value if read/parse fails
 * @returns Validated data or fallback
 */
export function safeRead<T>(key: string, schema: ZodSchema<T>, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback

    const parsed = JSON.parse(raw)
    const validated = parseWithSchema(parsed, schema, `safeRead(${key})`)
    return validated ?? fallback
  } catch (error) {
    console.error(`[StorageValidation] safeRead failed for key "${key}":`, error)
    return fallback
  }
}
