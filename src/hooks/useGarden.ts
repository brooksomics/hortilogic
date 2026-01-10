import { useLocalStorage } from './useLocalStorage'
import { autoFillBed } from '@/utils/companionEngine'
import type { Crop, GardenProfile } from '@/types'

interface GardenState {
  /** Array of 32 cells, each containing a Crop or null */
  currentBed: (Crop | null)[]

  /** User's garden profile with frost dates */
  gardenProfile: GardenProfile | null
}

const GARDEN_STORAGE_KEY = 'hortilogic:garden'

const DEFAULT_GARDEN_STATE: GardenState = {
  currentBed: Array(32).fill(null) as (Crop | null)[],
  gardenProfile: null
}

/**
 * Custom hook for managing garden state with LocalStorage persistence
 *
 * @returns Garden state and actions
 */
export function useGarden() {
  const [gardenState, setGardenState] = useLocalStorage<GardenState>(
    GARDEN_STORAGE_KEY,
    DEFAULT_GARDEN_STATE
  )

  /**
   * Plant a crop in a specific cell
   * @param cellIndex - Index of the cell (0-31)
   * @param crop - The crop to plant
   */
  const plantCrop = (cellIndex: number, crop: Crop) => {
    if (cellIndex < 0 || cellIndex >= 32) {
      console.error(`Invalid cell index: ${String(cellIndex)}. Must be 0-31.`)
      return
    }

    setGardenState(prev => {
      const newBed = [...prev.currentBed]
      newBed[cellIndex] = crop
      return { ...prev, currentBed: newBed }
    })
  }

  /**
   * Remove a crop from a specific cell
   * @param cellIndex - Index of the cell (0-31)
   */
  const removeCrop = (cellIndex: number) => {
    if (cellIndex < 0 || cellIndex >= 32) {
      console.error(`Invalid cell index: ${String(cellIndex)}. Must be 0-31.`)
      return
    }

    setGardenState(prev => {
      const newBed = [...prev.currentBed]
      newBed[cellIndex] = null
      return { ...prev, currentBed: newBed }
    })
  }

  /**
   * Clear all crops from the bed
   */
  const clearBed = () => {
    setGardenState(prev => ({
      ...prev,
      currentBed: Array(32).fill(null) as (Crop | null)[]
    }))
  }

  /**
   * Update the garden profile (frost dates)
   * @param profile - The new garden profile
   */
  const setGardenProfile = (profile: GardenProfile) => {
    setGardenState(prev => ({
      ...prev,
      gardenProfile: profile
    }))
  }

  /**
   * Automagically fill empty cells with viable, compatible crops
   * @param cropLibrary - Available crops to choose from
   * @param targetDate - Date to check viability against (defaults to today)
   */
  const autoFill = (cropLibrary: Crop[], targetDate: Date = new Date()) => {
    if (!gardenState.gardenProfile) {
      console.error('Cannot auto-fill: garden profile not set')
      return
    }

    const newBed = autoFillBed(
      gardenState.currentBed,
      cropLibrary,
      gardenState.gardenProfile,
      targetDate
    )

    setGardenState(prev => ({
      ...prev,
      currentBed: newBed
    }))
  }

  return {
    currentBed: gardenState.currentBed,
    gardenProfile: gardenState.gardenProfile,
    plantCrop,
    removeCrop,
    clearBed,
    setGardenProfile,
    autoFill
  }
}
