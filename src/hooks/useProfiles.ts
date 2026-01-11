import { useLocalStorage } from './useLocalStorage'
import type { ProfileStorage, GardenProfile } from '../types/garden'
import { generateUUID } from '../utils/uuid'

const PROFILES_KEY = 'hortilogic:profiles'

/**
 * Creates default Denver-based garden profile
 */
function createDefaultProfile(): GardenProfile {
  // Get current year for frost dates
  const currentYear = new Date().getFullYear()

  return {
    name: 'My Garden',
    hardiness_zone: '5b',
    last_frost_date: `${currentYear.toString()}-05-15`,
    first_frost_date: `${currentYear.toString()}-10-01`,
    season_extension_weeks: 0,
    targetPlantingDate: new Date().toISOString().split('T')[0], // Default to today
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
    defaultProfileId: profileId,
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
import { ProfileStorageSchema } from '../schemas/garden'

// ...

export function useProfiles(): UseProfilesResult {
  const [profileStorage, setProfileStorage] = useLocalStorage<ProfileStorage>(
    PROFILES_KEY,
    createDefaultProfileStorage(),
    (data) => {
      const result = ProfileStorageSchema.safeParse(data)
      if (result.success) {
        return result.data
      }
      console.error('[useProfiles] Storage validation failed:', result.error)
      return null
    }
  )

  const profiles = profileStorage.profiles
  const defaultProfileId = profileStorage.defaultProfileId

  const getProfile = (id: string): GardenProfile | undefined => {
    return profiles[id]
  }

  const updateProfile = (id: string, profile: GardenProfile): void => {
    if (!profiles[id]) {
      console.error(`Profile ${id} not found`)
      return
    }

    setProfileStorage({
      version: profileStorage.version,
      defaultProfileId: profileStorage.defaultProfileId,
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
