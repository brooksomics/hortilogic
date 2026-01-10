import { useState } from 'react'
import { autoFillBed } from '../utils/companionEngine'
import { CORE_50_CROPS } from '../data/crops'
import type { Crop, GardenProfile, GardenLayout } from '../types/garden'

export interface UseGardenInteractionsResult {
  /** Currently selected crop */
  selectedCrop: Crop | null

  /** Set selected crop */
  setSelectedCrop: (crop: Crop | null) => void

  /** Settings modal open state */
  isSettingsOpen: boolean

  /** Handle autofill action */
  handleAutoFill: () => void

  /** Handle square click for planting/removing */
  handleSquareClick: (index: number) => void

  /** Handle settings save */
  handleSettingsSave: (profile: GardenProfile) => void

  /** Handle settings close */
  handleSettingsClose: () => void

  /** Open settings modal */
  openSettings: () => void
}

interface UseGardenInteractionsProps {
  currentBed: (Crop | null)[]
  gardenProfile: GardenProfile | null
  activeLayout: GardenLayout | null
  setBed: (bed: (Crop | null)[]) => void
  plantCrop: (index: number, crop: Crop) => void
  removeCrop: (index: number) => void
  updateProfile: (id: string, profile: GardenProfile) => void
}

/**
 * Hook to manage garden interaction handlers
 *
 * Handles autofill, crop planting/removing, and settings management.
 * Extracts interaction logic from App component to reduce complexity.
 */
export function useGardenInteractions({
  currentBed,
  gardenProfile,
  activeLayout,
  setBed,
  plantCrop,
  removeCrop,
  updateProfile,
}: UseGardenInteractionsProps): UseGardenInteractionsResult {
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const handleAutoFill = (): void => {
    if (!gardenProfile || !activeLayout) {
      return
    }

    const newBed = autoFillBed(currentBed, CORE_50_CROPS, gardenProfile, new Date())
    setBed(newBed)
  }

  const handleSquareClick = (index: number): void => {
    const existingCrop = currentBed[index]

    if (existingCrop) {
      removeCrop(index)
    } else if (selectedCrop) {
      plantCrop(index, selectedCrop)
    }
  }

  const handleSettingsSave = (updatedProfile: GardenProfile): void => {
    if (activeLayout) {
      updateProfile(activeLayout.profileId, updatedProfile)
    }
    setIsSettingsOpen(false)
  }

  const handleSettingsClose = (): void => {
    setIsSettingsOpen(false)
  }

  const openSettings = (): void => {
    setIsSettingsOpen(true)
  }

  return {
    selectedCrop,
    setSelectedCrop,
    isSettingsOpen,
    handleAutoFill,
    handleSquareClick,
    handleSettingsSave,
    handleSettingsClose,
    openSettings,
  }
}
