import { ReactNode, useEffect, useCallback } from 'react'
import { GardenContext, type GardenContextValue } from './GardenContext'
import type { GardenBox, GardenStash } from '../types/garden'
import { useLayoutManager } from '../hooks/useLayoutManager'
import { useLayoutActions } from '../hooks/useLayoutActions'
import { useGardenInteractions } from '../hooks/useGardenInteractions'
import { useProfiles } from '../hooks/useProfiles'
import { migrateToLayoutsSchema, migrateToMultiBoxSchema } from '../utils/storageMigration'
import { useUndoToast } from '../hooks/useUndoToast'

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

  // Undo toast system
  const restoreBoxes = useCallback((boxes: GardenBox[]) => {
    setAllBoxes(boxes)
  }, [setAllBoxes])

  const restoreStash = useCallback((stash: GardenStash) => {
    if (activeLayout?.id) {
      const key = `hortilogic_stash_${activeLayout.id}`
      localStorage.setItem(key, JSON.stringify(stash))
      // Force re-render by triggering the garden interactions stash update
      window.dispatchEvent(new CustomEvent('stash-restore', { detail: stash }))
    }
  }, [activeLayout?.id])

  const undoToast = useUndoToast(
    restoreBoxes,
    restoreStash,
    () => {} // restoreLayout not used in this implementation
  )

  // Garden interactions
  const {
    selectedCrop,
    setSelectedCrop,
    isSettingsOpen,
    handleAutoFill: handleAutoFillBase,
    handleSquareClick,
    handleSettingsSave,
    handleSettingsClose,
    openSettings,
    stash,
    addToStash,
    removeFromStash,
    clearStash: clearStashBase,
    getStashTotalArea,
    canAddToStash,
    handleDistributeStash: handleDistributeStashBase,
    placementResult,
    isDistributing,
  } = useGardenInteractions({
    currentBed,
    gardenProfile,
    activeLayout,
    setAllBoxes,
    plantCrop,
    removeCrop,
    updateProfile,
    captureUndo: undoToast.capture,
  })

  // Calculate total area for all boxes
  const totalArea = activeLayout?.boxes.reduce(
    (sum: number, box: GardenBox) => sum + box.width * box.height,
    0
  ) ?? 0

  // Wrapper functions that capture snapshots before destructive actions
  const clearBedWithUndo = useCallback(() => {
    if (activeLayout?.boxes) {
      // Deep clone boxes
      const boxesSnapshot = activeLayout.boxes.map(box => ({
        ...box,
        cells: [...box.cells],
      }))
      undoToast.capture({
        type: 'boxes',
        label: 'Cleared all crops',
        boxes: boxesSnapshot,
      })
    }
    clearBed()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLayout?.boxes, clearBed, undoToast.capture])

  const handleAutoFillWithUndo = useCallback(() => {
    if (activeLayout?.boxes) {
      // Deep clone boxes before autofill
      const boxesSnapshot = activeLayout.boxes.map(box => ({
        ...box,
        cells: [...box.cells],
      }))
      undoToast.capture({
        type: 'boxes',
        label: 'Automagic Fill',
        boxes: boxesSnapshot,
      })
    }
    handleAutoFillBase()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLayout?.boxes, handleAutoFillBase, undoToast.capture])

  const removeBoxWithUndo = useCallback((boxId: string) => {
    if (activeLayout?.boxes) {
      // Deep clone all boxes
      const boxesSnapshot = activeLayout.boxes.map(box => ({
        ...box,
        cells: [...box.cells],
      }))
      undoToast.capture({
        type: 'boxes',
        label: 'Deleted box',
        boxes: boxesSnapshot,
      })
    }
    removeBox(boxId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLayout?.boxes, removeBox, undoToast.capture])

  // Dismiss toast when switching layouts
  useEffect(() => {
    undoToast.dismiss()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLayoutId])

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
    clearBed: clearBedWithUndo,
    setAllBoxes,
    addBox,
    removeBox: removeBoxWithUndo,
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
    handleAutoFill: handleAutoFillWithUndo,
    handleSquareClick,
    handleSettingsSave,
    handleSettingsClose,
    openSettings,

    // Stash Management
    stash,
    addToStash,
    removeFromStash,
    clearStash: clearStashBase,
    getStashTotalArea,
    canAddToStash,
    handleDistributeStash: handleDistributeStashBase,
    placementResult,
    isDistributing,

    // Undo Toast
    undoToast: {
      snapshot: undoToast.snapshot,
      isVisible: undoToast.isVisible,
      executeUndo: undoToast.executeUndo,
      dismiss: undoToast.dismiss,
      pause: undoToast.pause,
      resume: undoToast.resume,
    },
  }

  return <GardenContext.Provider value={value}>{children}</GardenContext.Provider>
}


