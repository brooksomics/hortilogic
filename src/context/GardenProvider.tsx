import { ReactNode, useEffect } from 'react'
import { GardenContext, type GardenContextValue } from './GardenContext'
import type { GardenBox } from '../types/garden'
import { useLayoutManager } from '../hooks/useLayoutManager'
import { useLayoutActions } from '../hooks/useLayoutActions'
import { useGardenInteractions } from '../hooks/useGardenInteractions'
import { useProfiles } from '../hooks/useProfiles'
import { migrateToLayoutsSchema, migrateToMultiBoxSchema } from '../utils/storageMigration'

export interface GardenProviderProps {
  children: ReactNode
}

/**
 * Garden Provider Component
 * Wraps the app and provides all garden state and actions via context
 */
export function GardenProvider({ children }: GardenProviderProps): React.JSX.Element {
  // Run migrations on mount
  useEffect(() => {
    migrateToLayoutsSchema()
    migrateToMultiBoxSchema()
  }, [])

  // Profile management (must come before layout management to avoid Split Brain bug)
  const { getProfile, updateProfile, defaultProfileId } = useProfiles()

  // Layout management
  const layoutManager = useLayoutManager(defaultProfileId)
  const {
    layouts,
    activeLayoutId,
    activeLayout,
    currentBed,
    switchLayout,
    plantCrop,
    removeCrop,
    clearBed,
    setAllBoxes,
    addBox,
    removeBox,
    setBoxOrientation,
    toggleDislikedCrop,
    exportLayout,
    importLayout,
  } = layoutManager

  // Layout actions
  const {
    layoutModalMode,
    targetLayoutId,
    handleCreateLayout,
    handleRenameLayout,
    handleDuplicateLayout,
    handleDeleteLayout,
    handleLayoutModalConfirm,
    handleLayoutModalClose,
  } = useLayoutActions(layoutManager)

  // Get garden profile for active layout (with fallback to default profile)
  const gardenProfile = activeLayout
    ? (getProfile(activeLayout.profileId) || getProfile(defaultProfileId) || null)
    : null

  // Garden interactions
  const {
    selectedCrop,
    setSelectedCrop,
    isSettingsOpen,
    handleAutoFill,
    handleSquareClick,
    handleSettingsSave,
    handleSettingsClose,
    openSettings,
    stash,
    addToStash,
    removeFromStash,
    clearStash,
    getStashTotalArea,
    canAddToStash,
    handleDistributeStash,
    placementResult,
    undo,
    canUndo,
    isDistributing,
  } = useGardenInteractions({
    currentBed,
    gardenProfile,
    activeLayout,
    setAllBoxes,
    plantCrop,
    removeCrop,
    updateProfile,
  })

  // Calculate total area for all boxes
  const totalArea = activeLayout?.boxes.reduce(
    (sum: number, box: GardenBox) => sum + box.width * box.height,
    0
  ) ?? 0

  const value: GardenContextValue = {
    // Profile Management
    getProfile,
    updateProfile,
    defaultProfileId,

    // Layout Management
    layouts,
    activeLayoutId,
    activeLayout,
    currentBed,
    gardenProfile,
    switchLayout,
    plantCrop,
    removeCrop,
    clearBed,
    setAllBoxes,
    addBox,
    removeBox,
    setBoxOrientation,
    toggleDislikedCrop,
    totalArea,

    // Layout Actions
    layoutModalMode,
    targetLayoutId,
    handleCreateLayout,
    handleRenameLayout,
    handleDuplicateLayout,
    handleDeleteLayout,
    handleLayoutModalConfirm,
    handleLayoutModalClose,

    // Export/Import
    exportLayout,
    importLayout,

    // Garden Interactions
    selectedCrop,
    setSelectedCrop,
    isSettingsOpen,
    handleAutoFill,
    handleSquareClick,
    handleSettingsSave,
    handleSettingsClose,
    openSettings,

    // Stash Management
    stash,
    addToStash,
    removeFromStash,
    clearStash,
    getStashTotalArea,
    canAddToStash,
    handleDistributeStash,
    placementResult,
    isDistributing,

    // History
    undo,
    canUndo,
  }

  return <GardenContext.Provider value={value}>{children}</GardenContext.Provider>
}


