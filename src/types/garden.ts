/**
 * Garden profile containing frost dates and season extension settings
 */
export interface GardenProfile {
  /** ISO date string for last spring frost (e.g., "2024-04-15") */
  last_frost_date: string

  /** ISO date string for first fall frost (e.g., "2024-10-15") */
  first_frost_date: string

  /** Number of weeks the growing season can be extended (via season extension techniques) */
  season_extension_weeks: number
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
 * Crop definition with spacing and planting requirements
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

  /** Display name for the crop (optional, can derive from id) */
  name?: string
}
