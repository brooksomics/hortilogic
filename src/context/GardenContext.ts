import { createContext } from 'react'
import type {
    Crop,
    GardenProfile,
    GardenLayout,
    GardenBox,
    GardenStash,
} from '../types/garden'
import type { LayoutActionMode } from '../components/LayoutActionModal'
import type { PlacementSummary } from '../components/StashSummary'
import type { ExportedLayout } from '../utils/layoutExportImport'

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
    setBoxOrientation: (boxId: string, orientation: number) => void
    toggleDislikedCrop: (cropId: string) => void
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

    // Export/Import
    exportLayout: (profile?: GardenProfile) => ExportedLayout
    importLayout: (exportData: ExportedLayout, newName: string) => string

    // Garden Interactions
    selectedCrop: Crop | null
    setSelectedCrop: (crop: Crop | null) => void
    isSettingsOpen: boolean
    handleAutoFill: () => void
    handleSquareClick: (index: number, boxId?: string) => void
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

export const GardenContext = createContext<GardenContextValue | null>(null)
