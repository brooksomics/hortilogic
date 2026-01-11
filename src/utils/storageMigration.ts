import type {
  LegacyGardenState,
  GardenLayout,
  LayoutStorage,
  ProfileStorage,
  GardenProfile,
  GardenBox,
  Crop,
} from '../types/garden'
import { generateUUID } from './uuid'

const LEGACY_KEY = 'hortilogic:garden'
const LAYOUTS_KEY = 'hortilogic:layouts'
const PROFILES_KEY = 'hortilogic:profiles'
const MIGRATED_KEY = 'hortilogic:garden:migrated'

export interface MigrationResult {
  success: boolean
  migrated: boolean
  reason?: string
}

/**
 * Creates default Denver-based garden profile
 */
function createDefaultProfile(): GardenProfile {
  return {
    name: 'My Garden',
    hardiness_zone: '5b',
    last_frost_date: '2024-05-15',
    first_frost_date: '2024-10-01',
    season_extension_weeks: 0,
  }
}

/**
 * Creates a legacy-sized 8x4 garden box for migration purposes
 * 8 feet wide (columns) x 4 feet long (rows) = 32 sq ft
 * Used to preserve existing user data when migrating from old schema
 */
function createLegacyBox(name = 'Main Bed', cells: (Crop | null)[] = Array(32).fill(null) as (Crop | null)[]): GardenBox {
  return {
    id: generateUUID(),
    name,
    width: 8,
    height: 4,
    cells,
  }
}

/**
 * Migrates from legacy single-layout schema to new multi-layout schema
 *
 * Detects old localStorage key "hortilogic:garden" and migrates to:
 * - "hortilogic:layouts" (multiple layouts)
 * - "hortilogic:profiles" (garden profiles)
 *
 * @returns Migration result with success status and reason
 */
export function migrateToLayoutsSchema(): MigrationResult {
  try {
    // Check if already migrated
    const existingLayouts = localStorage.getItem(LAYOUTS_KEY)
    if (existingLayouts) {
      return {
        success: true,
        migrated: false,
        reason: 'already_migrated',
      }
    }

    // Check for legacy data
    const legacyData = localStorage.getItem(LEGACY_KEY)
    if (!legacyData) {
      return {
        success: true,
        migrated: false,
        reason: 'no_legacy_data',
      }
    }

    // Parse legacy schema
    const legacyState = JSON.parse(legacyData) as LegacyGardenState

    // Create profile from legacy gardenProfile or use defaults
    const profileId = generateUUID()
    const profile: GardenProfile =
      legacyState.gardenProfile || createDefaultProfile()

    const profileStorage: ProfileStorage = {
      version: 1,
      profiles: {
        [profileId]: profile,
      },
      defaultProfileId: profileId,
    }

    // Create layout from legacy currentBed
    const now = new Date().toISOString()
    const layoutId = generateUUID()

    // Convert to new multi-box format
    // Use legacy box size (8x4) to preserve existing data
    const box = createLegacyBox('Main Bed', legacyState.currentBed)
    const layout: GardenLayout = {
      id: layoutId,
      name: 'My Garden',
      createdAt: now,
      updatedAt: now,
      boxes: [box],
      profileId,
    }

    const layoutStorage: LayoutStorage = {
      version: 2,
      activeLayoutId: layout.id,
      layouts: {
        [layout.id]: layout,
      },
    }

    // Write new schema to localStorage
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profileStorage))
    localStorage.setItem(LAYOUTS_KEY, JSON.stringify(layoutStorage))

    // Mark old key as migrated (rename instead of delete for safety)
    localStorage.setItem(MIGRATED_KEY, legacyData)
    localStorage.removeItem(LEGACY_KEY)

    return {
      success: true,
      migrated: true,
    }
  } catch (error) {
    console.error('Migration failed:', error)
    return {
      success: false,
      migrated: false,
      reason: error instanceof Error ? error.message : 'unknown_error',
    }
  }
}

/**
 * Migrates from single-bed layout schema to multi-box schema
 *
 * Converts layouts with `bed` array to layouts with `boxes` array.
 * Wraps existing bed data into a single "Main Bed" box (8x4 to preserve legacy data).
 * Bumps storage version from 1 to 2.
 *
 * @returns Migration result with success status and reason
 */
export function migrateToMultiBoxSchema(): MigrationResult {
  try {
    // Check if layouts exist
    const layoutsData = localStorage.getItem(LAYOUTS_KEY)
    if (!layoutsData) {
      return {
        success: true,
        migrated: false,
        reason: 'no_layouts_data',
      }
    }

    const layoutStorage = JSON.parse(layoutsData) as LayoutStorage

    // Check if already migrated (version 2 or has boxes)
    if (layoutStorage.version >= 2) {
      return {
        success: true,
        migrated: false,
        reason: 'already_migrated',
      }
    }

    // Check if any layout already has boxes property
    const hasBoxes = Object.values(layoutStorage.layouts).some(
      (layout) => Array.isArray(layout.boxes) && layout.boxes.length > 0
    )
    if (hasBoxes) {
      return {
        success: true,
        migrated: false,
        reason: 'already_migrated',
      }
    }

    // Migrate each layout
    const migratedLayouts: Record<string, GardenLayout> = {}
    for (const [layoutId, layout] of Object.entries(layoutStorage.layouts)) {
      // Create a GardenBox from the legacy bed array
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      const cells = layout.bed || (Array(32).fill(null) as (Crop | null)[])

      // Create box using helper function (8x4 dimensions for legacy data)
      const box = createLegacyBox('Main Bed', cells)

      // Create migrated layout with boxes array
      migratedLayouts[layoutId] = {
        ...layout,
        boxes: [box],
      }
    }

    // Update storage with migrated layouts and bumped version
    const updatedStorage: LayoutStorage = {
      ...layoutStorage,
      version: 2,
      layouts: migratedLayouts,
    }

    // Write updated storage to localStorage
    localStorage.setItem(LAYOUTS_KEY, JSON.stringify(updatedStorage))

    return {
      success: true,
      migrated: true,
    }
  } catch (error) {
    console.error('Multi-box migration failed:', error)
    return {
      success: false,
      migrated: false,
      reason: error instanceof Error ? error.message : 'unknown_error',
    }
  }
}
