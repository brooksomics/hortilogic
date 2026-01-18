/**
 * Garden profile containing frost dates and season extension settings
 */
export interface GardenProfile {
  /** User-friendly name for the garden (e.g., "Backyard Bed") */
  name: string

  /** USDA hardiness zone (e.g., "5b", "10a") */
  hardiness_zone: string

  /** Optional location/city for better user context (e.g., "Denver, CO") */
  location?: string

  /** ISO date string for last spring frost (e.g., "2024-04-15") */
  last_frost_date: string

  /** ISO date string for first fall frost (e.g., "2024-10-15") */
  first_frost_date: string

  /** Number of weeks the growing season can be extended (via season extension techniques) */
  season_extension_weeks: number

  /** ISO date string for target planting date (defaults to today) */
  targetPlantingDate?: string
}

/**
 * Garden box (bed) with custom dimensions
 * A layout can contain multiple boxes of different sizes
 */
export interface GardenBox {
  /** Unique identifier (UUID v4) */
  id: string

  /** User-friendly box name (e.g., "North Bed", "Herb Box") */
  name: string

  /** Width in feet/columns */
  width: number

  /** Height in feet/rows */
  height: number

  /** Array of cells with planted crops (length = width * height) */
  cells: (Crop | null)[]
}

/**
 * Individual garden layout with crops and timestamps
 * Multiple layouts enable seasonal planning (e.g., "Spring 2026" vs "Fall 2026")
 */
export interface GardenLayout {
  /** Unique identifier (UUID v4) */
  id: string

  /** User-defined layout name (e.g., "Spring 2026", "Fall Plan") */
  name: string

  /** ISO timestamp when layout was created */
  createdAt: string

  /** ISO timestamp when layout was last modified */
  updatedAt: string

  /** Array of garden boxes (supports multiple beds of different sizes) */
  boxes: GardenBox[]

  /** Reference to garden profile ID */
  profileId: string

  /** @deprecated Legacy single-bed array (pre-F008), kept for migration compatibility */
  bed?: (Crop | null)[]
}

/**
 * Storage schema for multiple layouts
 * Stored at localStorage key: "hortilogic:layouts"
 */
export interface LayoutStorage {
  /** Schema version number for future migrations */
  version: number

  /** ID of the currently active layout */
  activeLayoutId: string

  /** Map of all layouts keyed by ID */
  layouts: Record<string, GardenLayout>
}

/**
 * Storage schema for garden profiles
 * Stored at localStorage key: "hortilogic:profiles"
 */
export interface ProfileStorage {
  /** Schema version number for future migrations */
  version: number

  /** Map of all profiles keyed by ID */
  profiles: Record<string, GardenProfile>

  /** ID of the default profile */
  defaultProfileId: string
}

/**
 * Legacy garden layout (pre-F008, single bed only)
 * Used for migration to multi-box schema
 */
export interface LegacyGardenLayout {
  /** Unique identifier (UUID v4) */
  id: string

  /** User-defined layout name */
  name: string

  /** ISO timestamp when layout was created */
  createdAt: string

  /** ISO timestamp when layout was last modified */
  updatedAt: string

  /** Array of 32 cells (4x8 grid) with planted crops */
  bed: (Crop | null)[]

  /** Reference to garden profile ID */
  profileId: string
}

/**
 * Legacy storage schema (pre-F005)
 * Used for migration detection
 * Stored at localStorage key: "hortilogic:garden" (old schema)
 */
export interface LegacyGardenState {
  /** Single bed array (32 cells) */
  currentBed: (Crop | null)[]

  /** Single garden profile */
  gardenProfile: GardenProfile | null
}

/**
 * Planting strategy defining when a crop can be started relative to frost dates
 */
export interface PlantingStrategy {
  /**
   * Start of planting window in weeks relative to Last Frost Date
   * Negative = before LFD, Positive = after LFD
   * Example: -4 means "4 weeks before last frost"
   */
  start_window_start: number

  /**
   * End of planting window in weeks relative to Last Frost Date
   * Example: 2 means "up to 2 weeks after last frost"
   */
  start_window_end: number
}

/**
 * Companion planting rules for a crop
 */
export interface CompanionRules {
  /** Crop IDs that grow well together (beneficial companions) */
  friends: string[]

  /** Crop IDs that should NOT be planted adjacent (hard constraint) */
  enemies: string[]
}

/**
 * Crop definition with spacing and planting requirements
 * V2 Schema with Smart Crop Metadata
 */
export interface Crop {
  /** Unique identifier for the crop */
  id: string

  /**
   * Square Foot Gardening density
   * Number of plants that fit in one square foot
   * Example: 16 for radishes, 1 for tomatoes
   */
  sfg_density: number

  /** When this crop can be planted relative to frost dates */
  planting_strategy: PlantingStrategy

  /** Companion planting rules for this crop */
  companions: CompanionRules

  /** Display name for the crop (optional, can derive from id) */
  name?: string

  /** Emoji icon for visual display */
  emoji?: string

  /** Crop type classification (V2) */
  type: 'vegetable' | 'herb' | 'flower'

  /** Botanical family for crop rotation planning (V2) */
  botanical_family: string

  /** Sun requirements (V2) */
  sun: 'full' | 'partial' | 'shade'

  /** Average days to maturity (V2) */
  days_to_maturity: number
}

/**
 * Garden Stash (Planning Cart)
 * Maps crop ID to quantity desired
 * Example: { "tomato": 4, "carrot": 8 }
 */
export interface GardenStash {
  [cropId: string]: number
}
