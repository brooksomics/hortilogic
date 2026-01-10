import type {
  LegacyGardenState,
  LegacyGardenLayout,
  GardenLayout,
  GardenBox,
  LayoutStorage,
  ProfileStorage,
  GardenProfile,
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
 * Creates a default layout with empty bed (legacy version for F005 migration)
 */
function createDefaultLegacyLayout(profileId: string, bed: (typeof import('../types/garden').Crop | null)[]): LegacyGardenLayout {
  const now = new Date().toISOString()
  return {
    id: generateUUID(),
    name: 'My Garden',
    createdAt: now,
    updatedAt: now,
    bed,
    profileId,
  }
}

/**
 * Creates a default layout with a single 4x8 box
 */
function createDefaultLayout(profileId: string, boxes: GardenBox[]): GardenLayout {
  const now = new Date().toISOString()
  return {
    id: generateUUID(),
    name: 'My Garden',
    createdAt: now,
    updatedAt: now,
    boxes,
    profileId,
  }
}

/**
 * Creates a default 4x8 garden box with empty cells
 */
function createDefaultBox(name = 'Main Bed', cells: (typeof import('../types/garden').Crop | null)[] = Array(32).fill(null)): GardenBox {
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
    }

    // Create layout from legacy currentBed
    const legacyLayout = createDefaultLegacyLayout(profileId, legacyState.currentBed)

    // Convert to new multi-box format
    const box = createDefaultBox('Main Bed', legacyLayout.bed)
    const layout = {
      ...legacyLayout,
      boxes: [box],
    }
    // Remove the old 'bed' property
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (layout as any).bed

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
 * Migrates from single-bed layouts (version 1) to multi-box layouts (version 2)
 *
 * Converts layouts with 'bed' property to 'boxes' array containing a single "Main Bed"
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

    // Check if already migrated to version 2
    if (layoutStorage.version >= 2) {
      return {
        success: true,
        migrated: false,
        reason: 'already_migrated',
      }
    }

    // Migrate each layout from single bed to boxes
    const migratedLayouts: Record<string, GardenLayout> = {}

    for (const [layoutId, layout] of Object.entries(layoutStorage.layouts)) {
      const legacyLayout = layout as unknown as LegacyGardenLayout

      // Create a single box from the bed data
      const box = createDefaultBox('Main Bed', legacyLayout.bed)

      // Create new layout with boxes
      const migratedLayout: GardenLayout = {
        id: legacyLayout.id,
        name: legacyLayout.name,
        createdAt: legacyLayout.createdAt,
        updatedAt: legacyLayout.updatedAt,
        boxes: [box],
        profileId: legacyLayout.profileId,
      }

      migratedLayouts[layoutId] = migratedLayout
    }

    // Update storage with version 2 and migrated layouts
    const updatedStorage: LayoutStorage = {
      version: 2,
      activeLayoutId: layoutStorage.activeLayoutId,
      layouts: migratedLayouts,
    }

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
