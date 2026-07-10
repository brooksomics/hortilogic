import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGardenInteractions } from './useGardenInteractions'
import type { Crop, GardenProfile, GardenLayout, GardenBox } from '../types/garden'

describe('useGardenInteractions - distribute & settings', () => {
  let profile: GardenProfile
  let layout: GardenLayout
  let setAllBoxes: ReturnType<typeof vi.fn>
  let updateProfile: ReturnType<typeof vi.fn>
  let captureUndo: ReturnType<typeof vi.fn>

  const renderInteractions = (activeLayout: GardenLayout | null = layout) =>
    renderHook(() =>
      useGardenInteractions({
        currentBed: activeLayout?.boxes[0]?.cells ?? [],
        gardenProfile: profile,
        activeLayout,
        setAllBoxes: setAllBoxes as unknown as (boxes: GardenBox[]) => void,
        plantCrop: () => undefined,
        removeCrop: () => undefined,
        updateProfile: updateProfile as unknown as (id: string, p: GardenProfile) => void,
        captureUndo,
      })
    )

  beforeEach(() => {
    profile = {
      name: 'Test Garden',
      location: 'Denver, CO',
      hardiness_zone: '5b',
      last_frost_date: '2026-05-15',
      first_frost_date: '2026-10-01',
      targetPlantingDate: '2026-06-01',
      season_extension_weeks: 0,
    }
    layout = {
      id: 'distribute-layout',
      name: 'Distribute Test',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profileId: 'profile-1',
      boxes: [
        { id: 'box-1', name: 'Bed', width: 2, height: 2, cells: Array(4).fill(null) as (Crop | null)[] },
      ],
    }
    setAllBoxes = vi.fn()
    updateProfile = vi.fn()
    captureUndo = vi.fn()
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('handleDistributeStash', () => {
    it('places stash crops, captures undo, and reports the result', () => {
      const { result } = renderInteractions()

      act(() => { result.current.addToStash('tomato-beefsteak', 2) })

      act(() => { result.current.handleDistributeStash(false) })
      expect(result.current.isDistributing).toBe(true)

      act(() => { vi.advanceTimersByTime(150) })

      expect(captureUndo).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'boxes',
          label: 'Distributed stash',
          stash: { 'tomato-beefsteak': 2 },
        })
      )
      expect(setAllBoxes).toHaveBeenCalledTimes(1)
      expect(result.current.isDistributing).toBe(false)
      expect(result.current.placementResult).not.toBeNull()
      expect(result.current.placementResult?.placed).toBeGreaterThan(0)
    })

    it('fills leftover gaps when fillGaps is true', () => {
      const { result } = renderInteractions()

      act(() => { result.current.addToStash('tomato-beefsteak', 1) })
      act(() => { result.current.handleDistributeStash(true) })
      act(() => { vi.advanceTimersByTime(150) })

      const boxes = setAllBoxes.mock.calls[0]?.[0] as GardenBox[]
      const filledCells = boxes[0]?.cells.filter((c) => c !== null) ?? []
      // Stash had 1 sq ft of tomato; gap filling should plant beyond that
      expect(filledCells.length).toBeGreaterThan(1)
      expect(result.current.isDistributing).toBe(false)
    })

    it('does nothing when the stash is empty', () => {
      const { result } = renderInteractions()

      act(() => { result.current.handleDistributeStash(false) })
      act(() => { vi.advanceTimersByTime(150) })

      expect(captureUndo).not.toHaveBeenCalled()
      expect(setAllBoxes).not.toHaveBeenCalled()
      expect(result.current.isDistributing).toBe(false)
    })

    it('does nothing when there is no active layout', () => {
      const { result } = renderInteractions(null)

      act(() => { result.current.addToStash('tomato-beefsteak', 1) })
      act(() => { result.current.handleDistributeStash(false) })
      act(() => { vi.advanceTimersByTime(150) })

      expect(setAllBoxes).not.toHaveBeenCalled()
    })
  })

  describe('settings handlers', () => {
    it('openSettings and handleSettingsClose toggle the modal', () => {
      const { result } = renderInteractions()

      expect(result.current.isSettingsOpen).toBe(false)
      act(() => { result.current.openSettings() })
      expect(result.current.isSettingsOpen).toBe(true)
      act(() => { result.current.handleSettingsClose() })
      expect(result.current.isSettingsOpen).toBe(false)
    })

    it('handleSettingsSave updates the active layout profile and closes', () => {
      const { result } = renderInteractions()
      const updated = { ...profile, name: 'Renamed Garden' }

      act(() => { result.current.openSettings() })
      act(() => { result.current.handleSettingsSave(updated) })

      expect(updateProfile).toHaveBeenCalledWith('profile-1', updated)
      expect(result.current.isSettingsOpen).toBe(false)
    })

    it('handleSettingsSave without active layout closes without updating', () => {
      const { result } = renderInteractions(null)

      act(() => { result.current.handleSettingsSave(profile) })

      expect(updateProfile).not.toHaveBeenCalled()
      expect(result.current.isSettingsOpen).toBe(false)
    })
  })

  describe('stash restore event', () => {
    it('replaces stash when a stash-restore event fires', () => {
      const { result } = renderInteractions()

      act(() => {
        window.dispatchEvent(new CustomEvent('stash-restore', { detail: { carrot: 5 } }))
      })

      expect(result.current.stash).toEqual({ carrot: 5 })
    })
  })
})
