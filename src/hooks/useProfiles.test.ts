/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useProfiles } from './useProfiles'
import type { ProfileStorage, GardenProfile } from '../types/garden'

describe('useProfiles', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('creates default profile if none exists in localStorage', () => {
    const { result } = renderHook(() => useProfiles())

    expect(result.current.profiles).toBeDefined()
    expect(Object.keys(result.current.profiles)).toHaveLength(1)

    const profileIds = Object.keys(result.current.profiles)
    const profileId = profileIds[0]
    if (!profileId) throw new Error('Profile ID not found')
    const defaultProfile = result.current.profiles[profileId]
    if (!defaultProfile) throw new Error('Default profile not found')

    expect(defaultProfile.name).toBe('My Garden')
    expect(defaultProfile.hardiness_zone).toBe('5b')
    expect(defaultProfile.last_frost_date).toBe('2024-05-15')
    expect(defaultProfile.first_frost_date).toBe('2024-10-01')
    expect(defaultProfile.season_extension_weeks).toBe(0)
  })

  it('loads existing profiles from localStorage', () => {
    const existingProfile: GardenProfile = {
      name: 'Test Garden',
      hardiness_zone: '10b',
      last_frost_date: '2024-01-15',
      first_frost_date: '2024-12-01',
      season_extension_weeks: 4,
    }

    const profileId = 'test-profile-id'
    const storage: ProfileStorage = {
      version: 1,
      profiles: {
        [profileId]: existingProfile,
      },
    }

    localStorage.setItem('hortilogic:profiles', JSON.stringify(storage))

    const { result } = renderHook(() => useProfiles())

    expect(result.current.profiles[profileId]).toEqual(existingProfile)
    expect(Object.keys(result.current.profiles)).toHaveLength(1)
  })

  it('returns default profile ID', () => {
    const { result } = renderHook(() => useProfiles())

    expect(result.current.defaultProfileId).toBeTruthy()

    const profile = result.current.profiles[result.current.defaultProfileId]
    expect(profile).toBeDefined()
  })

  it('getProfile returns correct profile for valid ID', () => {
    const testProfile: GardenProfile = {
      name: 'Custom Garden',
      hardiness_zone: '7a',
      last_frost_date: '2024-04-01',
      first_frost_date: '2024-11-01',
      season_extension_weeks: 2,
    }

    const profileId = 'custom-id'
    const storage: ProfileStorage = {
      version: 1,
      profiles: {
        [profileId]: testProfile,
      },
    }

    localStorage.setItem('hortilogic:profiles', JSON.stringify(storage))

    const { result } = renderHook(() => useProfiles())

    const retrievedProfile = result.current.getProfile(profileId)
    expect(retrievedProfile).toEqual(testProfile)
  })

  it('getProfile returns undefined for invalid ID', () => {
    const { result } = renderHook(() => useProfiles())

    const retrievedProfile = result.current.getProfile('non-existent-id')
    expect(retrievedProfile).toBeUndefined()
  })

  it('handles corrupted localStorage data gracefully', () => {
    localStorage.setItem('hortilogic:profiles', 'invalid JSON')

    const { result } = renderHook(() => useProfiles())

    // Should fall back to creating default profile
    expect(result.current.profiles).toBeDefined()
    expect(Object.keys(result.current.profiles)).toHaveLength(1)
  })

  it('persists profiles to localStorage', () => {
    renderHook(() => useProfiles())

    // Check that profiles were persisted
    const stored = localStorage.getItem('hortilogic:profiles')
    expect(stored).not.toBeNull()

    if (!stored) return

    const parsed = JSON.parse(stored) as ProfileStorage
    expect(parsed.version).toBe(1)
    expect(parsed.profiles).toBeDefined()
    expect(Object.keys(parsed.profiles)).toHaveLength(1)
  })

  it('sets defaultProfileId to first profile when multiple profiles exist', () => {
    const profile1: GardenProfile = {
      name: 'Garden 1',
      hardiness_zone: '5b',
      last_frost_date: '2024-05-15',
      first_frost_date: '2024-10-01',
      season_extension_weeks: 0,
    }

    const profile2: GardenProfile = {
      name: 'Garden 2',
      hardiness_zone: '7a',
      last_frost_date: '2024-04-01',
      first_frost_date: '2024-11-01',
      season_extension_weeks: 2,
    }

    const storage: ProfileStorage = {
      version: 1,
      profiles: {
        'id-1': profile1,
        'id-2': profile2,
      },
    }

    localStorage.setItem('hortilogic:profiles', JSON.stringify(storage))

    const { result } = renderHook(() => useProfiles())

    // Should return one of the profile IDs as default
    const defaultId = result.current.defaultProfileId
    expect(['id-1', 'id-2']).toContain(defaultId)

    const defaultProfile = result.current.profiles[defaultId]
    expect(defaultProfile).toBeDefined()
  })
})
