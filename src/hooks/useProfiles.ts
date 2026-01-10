import { useLocalStorage } from './useLocalStorage'
import type { ProfileStorage, GardenProfile } from '../types/garden'

const PROFILES_KEY = 'hortilogic:profiles'

/**
 * Generates a UUID v4 string
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
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
 * Creates default profile storage with one profile
 */
function createDefaultProfileStorage(): ProfileStorage {
  const profileId = generateUUID()
  const profile = createDefaultProfile()

  return {
    version: 1,
    profiles: {
      [profileId]: profile,
    },
  }
}

export interface UseProfilesResult {
  /** Map of all profiles keyed by ID */
  profiles: Record<string, GardenProfile>

  /** ID of the default profile (first profile in map) */
  defaultProfileId: string

  /** Get profile by ID, returns undefined if not found */
  getProfile: (id: string) => GardenProfile | undefined
}

/**
 * Hook to manage garden profiles
 *
 * Loads profiles from localStorage or creates a default profile.
 * Profiles are shared across layouts - a "Spring Plan" and "Fall Plan"
 * typically share the same location and frost dates.
 */
export function useProfiles(): UseProfilesResult {
  const [profileStorage] = useLocalStorage<ProfileStorage>(
    PROFILES_KEY,
    createDefaultProfileStorage()
  )

  const profiles = profileStorage.profiles
  const profileIds = Object.keys(profiles)
  const defaultProfileId = profileIds[0] ?? ''

  const getProfile = (id: string): GardenProfile | undefined => {
    return profiles[id]
  }

  return {
    profiles,
    defaultProfileId,
    getProfile,
  }
}
