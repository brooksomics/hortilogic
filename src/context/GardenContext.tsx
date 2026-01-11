import { createContext, useContext, ReactNode, useEffect } from 'react'
import { useLayoutManager } from '../hooks/useLayoutManager'
import { useLayoutActions } from '../hooks/useLayoutActions'
import { useGardenInteractions } from '../hooks/useGardenInteractions'
import { useProfiles } from '../hooks/useProfiles'
import { migrateToLayoutsSchema, migrateToMultiBoxSchema } from '../utils/storageMigration'
import type {
  Crop,
  GardenProfile,
  GardenLayout,
  GardenBox,
  GardenStash,
} from '../types/garden'
import type { LayoutActionMode } from '../components/LayoutActionModal'
import type { PlacementSummary } from '../components/StashSummary'

/**
 * Garden Context Value Interface
 * Consolidates all garden state and actions into a single context
 */
export interface GardenContextValue {
  // Profile Management
  getProfile: (id: string) => GardenProfile | undefined
  updateProfile: (id: string, profile: GardenProfile) => void
  defaultProfileId: string

  // Layout Management
  layouts: Record<string, GardenLayout>
  activeLayoutId: string
  activeLayout: GardenLayout | null
  currentBed: (Crop | null)[]
  gardenProfile: GardenProfile | null
  switchLayout: (id: string) => void
  plantCrop: (index: number, crop: Crop) => void
  removeCrop: (index: number) => void
  clearBed: () => void
  setAllBoxes: (boxes: GardenBox[]) => void
  addBox: (name: string, width: number, height: number) => void
  removeBox: (boxId: string) => void
  totalArea: number

  // Layout Actions
  layoutModalMode: LayoutActionMode | null
  targetLayoutId: string | null
  handleCreateLayout: () => void
  handleRenameLayout: (id: string) => void
  handleDuplicateLayout: (id: string) => void
  handleDeleteLayout: (id: string) => void
  handleLayoutModalConfirm: (name: string) => void
  handleLayoutModalClose: () => void

  // Garden Interactions
  selectedCrop: Crop | null
  setSelectedCrop: (crop: Crop | null) => void
  isSettingsOpen: boolean
  handleAutoFill: () => void
  handleSquareClick: (index: number) => void
  handleSettingsSave: (profile: GardenProfile) => void
  handleSettingsClose: () => void
  openSettings: () => void

  // Stash Management
  stash: GardenStash
  addToStash: (cropId: string, amount: number) => void
  removeFromStash: (cropId: string, amount: number) => void
  clearStash: () => void
  getStashTotalArea: () => number
  canAddToStash: (crop: Crop) => boolean
  handleDistributeStash: (fillGaps: boolean) => void
  placementResult: PlacementSummary | null
  isDistributing: boolean

  // History (Undo/Redo)
  undo: () => void
  canUndo: boolean
}

const GardenContext = createContext<GardenContextValue | null>(null)

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
    (sum, box) => sum + box.width * box.height,
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

/**
 * Custom hook to access Garden Context
 * Throws error if used outside GardenProvider
 */
export function useGardenContext(): GardenContextValue {
  const context = useContext(GardenContext)
  if (!context) {
    throw new Error('useGardenContext must be used within GardenProvider')
  }
  return context
}
