import { useLocalStorage } from './useLocalStorage'
import type { ProfileStorage, GardenProfile } from '../types/garden'
import { generateUUID } from '../utils/uuid'

const PROFILES_KEY = 'hortilogic:profiles'

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

  /** Update a profile by ID */
  updateProfile: (id: string, profile: GardenProfile) => void
}

/**
 * Hook to manage garden profiles
 *
 * Loads profiles from localStorage or creates a default profile.
 * Profiles are shared across layouts - a "Spring Plan" and "Fall Plan"
 * typically share the same location and frost dates.
 */
export function useProfiles(): UseProfilesResult {
  const [profileStorage, setProfileStorage] = useLocalStorage<ProfileStorage>(
    PROFILES_KEY,
    createDefaultProfileStorage()
  )

  const profiles = profileStorage.profiles
  const profileIds = Object.keys(profiles)
  const defaultProfileId = profileIds[0] ?? ''

  const getProfile = (id: string): GardenProfile | undefined => {
    return profiles[id]
  }

  const updateProfile = (id: string, profile: GardenProfile): void => {
    if (!profiles[id]) {
      console.error(`Profile ${id} not found`)
      return
    }

    setProfileStorage({
      ...profileStorage,
      profiles: {
        ...profiles,
        [id]: profile,
      },
    })
  }

  return {
    profiles,
    defaultProfileId,
    getProfile,
    updateProfile,
  }
}
