import { useDebouncedLocalStorage } from './useDebouncedLocalStorage'
import type { LayoutStorage, GardenLayout, GardenBox, Crop, GardenProfile } from '../types/garden'
import { generateUUID } from '../utils/uuid'
import { exportLayoutToJSON, importLayoutFromJSON } from '../utils/layoutExportImport'
import type { ExportedLayout } from '../utils/layoutExportImport'

const LAYOUTS_KEY = 'hortilogic:layouts'
const DEBOUNCE_DELAY = 300 // ms - delay localStorage writes to batch rapid operations

/**
 * Creates an empty 4x4 garden box
 * 4 feet wide (columns) x 4 feet long (rows) = 16 sq ft
 */
function createEmptyBox(name = 'Main Bed'): GardenBox {
  return {
    id: generateUUID(),
    name,
    width: 4,
    height: 4,
    cells: Array(16).fill(null) as (Crop | null)[],
  }
}

/**
 * Creates a new layout with given name and profile
 */
function createNewLayout(name: string, profileId: string): GardenLayout {
  const now = new Date().toISOString()
  return {
    id: generateUUID(),
    name,
    createdAt: now,
    updatedAt: now,
    boxes: [createEmptyBox('Main Bed')],
    profileId,
  }
}

/**
 * Creates default layout storage with one layout
 */
function createDefaultLayoutStorage(profileId: string): LayoutStorage {
  const layout = createNewLayout('My Garden', profileId)
  return {
    version: 2,
    activeLayoutId: layout.id,
    layouts: {
      [layout.id]: layout,
    },
  }
}

/**
 * Updates a layout's updatedAt timestamp
 */
function touchLayout(layout: GardenLayout): GardenLayout {
  return {
    ...layout,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Returns a copy of the layout with one cell set, or null if the box is missing
 */
function setCell(
  layout: GardenLayout,
  change: { cellIndex: number; value: Crop | null; boxId?: string }
): GardenLayout | null {
  const targetBoxId = change.boxId ?? layout.boxes[0]?.id
  const boxIndex = layout.boxes.findIndex((box) => box.id === targetBoxId)
  const targetBox = layout.boxes[boxIndex]

  if (!targetBox) {
    console.error(`Box ${targetBoxId ?? 'undefined'} not found`)
    return null
  }

  const newCells = [...targetBox.cells]
  newCells[change.cellIndex] = change.value

  const updatedBoxes = [...layout.boxes]
  updatedBoxes[boxIndex] = { ...targetBox, cells: newCells }

  return { ...layout, boxes: updatedBoxes }
}

/**
 * Returns storage without the given layout, switching active if needed.
 * Refuses to remove the last remaining layout.
 */
function removeLayoutFromStorage(storage: LayoutStorage, layoutId: string): LayoutStorage {
  const layoutIds = Object.keys(storage.layouts)
  if (layoutIds.length <= 1) {
    console.warn('Cannot delete the last remaining layout')
    return storage
  }

  const remainingLayouts = Object.fromEntries(
    Object.entries(storage.layouts).filter(([id]) => id !== layoutId)
  )
  const newActiveId =
    storage.activeLayoutId === layoutId
      ? layoutIds.find((id) => id !== layoutId) ?? storage.activeLayoutId
      : storage.activeLayoutId

  return { ...storage, activeLayoutId: newActiveId, layouts: remainingLayouts }
}

export interface UseLayoutManagerResult {
  /** Map of all layouts keyed by ID */
  layouts: Record<string, GardenLayout>

  /** ID of the currently active layout */
  activeLayoutId: string

  /** The active layout object (for convenience) */
  activeLayout: GardenLayout | null

  /** Current bed from active layout */
  currentBed: (Crop | null)[]

  /** Create a new layout and switch to it */
  createLayout: (name: string) => string

  /** Switch to a different layout */
  switchLayout: (layoutId: string) => void

  /** Rename a layout */
  renameLayout: (layoutId: string, newName: string) => void

  /** Delete a layout (prevents deleting last layout) */
  deleteLayout: (layoutId: string) => void

  /** Duplicate a layout with all its bed data */
  duplicateLayout: (layoutId: string, newName: string) => string

  /** Plant a crop in the active layout (optionally specify boxId, defaults to first box) */
  plantCrop: (cellIndex: number, crop: Crop, boxId?: string) => void

  /** Remove a crop from the active layout (optionally specify boxId, defaults to first box) */
  removeCrop: (cellIndex: number, boxId?: string) => void

  /** Clear all crops from the active layout */
  clearBed: () => void

  /** Replace entire bed in single operation (batch update) */
  setBed: (newBed: (Crop | null)[]) => void

  /** Update all boxes in the active layout (for multi-box operations) */
  setAllBoxes: (boxes: GardenBox[]) => void

  /** Add a new box to the active layout */
  addBox: (name: string, width: number, height: number) => string

  /** Remove a box from the active layout */
  removeBox: (boxId: string) => void

  /** Set compass orientation for a box (degrees, 0=N at top) */
  setBoxOrientation: (boxId: string, orientation: number) => void

  /** Export active layout to JSON format */
  exportLayout: (profile?: GardenProfile) => ExportedLayout

  /** Import layout from JSON and create new layout */
  importLayout: (exportData: ExportedLayout, newName: string) => string

  /** Toggle a crop in the disliked list (add if not present, remove if present) */
  toggleDislikedCrop: (cropId: string) => void
}

/**
 * Hook to manage multiple garden layouts
 *
 * Enables users to create, switch, rename, delete, and duplicate layouts.
 * Each layout has its own bed of crops, enabling seasonal planning
 * (e.g., "Spring 2026" vs "Fall 2026").
 *
 * @param defaultProfileId - The default profile ID to use for new layouts
 */
export function useLayoutManager(defaultProfileId: string): UseLayoutManagerResult {
  const [layoutStorage, setLayoutStorage] = useDebouncedLocalStorage<LayoutStorage>(
    LAYOUTS_KEY,
    createDefaultLayoutStorage(defaultProfileId),
    DEBOUNCE_DELAY
  )

  const layouts = layoutStorage.layouts
  const activeLayoutId = layoutStorage.activeLayoutId
  const activeLayout = layouts[activeLayoutId] ?? null
  // For backward compatibility, currentBed returns the first box's cells
  const currentBed = activeLayout?.boxes[0]?.cells ?? []

  /**
   * Functionally update the active layout so same-tick mutations compose
   * instead of clobbering each other (hortilogic-a0h.1).
   * The transform returns null to skip the write.
   */
  const updateActiveLayout = (
    transform: (layout: GardenLayout) => GardenLayout | null
  ): void => {
    setLayoutStorage((prev) => {
      const layout = prev.layouts[prev.activeLayoutId]
      const next = layout ? transform(layout) : null
      if (!next) return prev
      return {
        ...prev,
        layouts: { ...prev.layouts, [prev.activeLayoutId]: touchLayout(next) },
      }
    })
  }

  const createLayout = (name: string): string => {
    const newLayout = createNewLayout(name, defaultProfileId)

    setLayoutStorage((prev) => ({
      ...prev,
      activeLayoutId: newLayout.id,
      layouts: { ...prev.layouts, [newLayout.id]: newLayout },
    }))

    return newLayout.id
  }

  const switchLayout = (layoutId: string): void => {
    if (!layouts[layoutId]) {
      console.error(`Layout ${layoutId} not found`)
      return
    }

    setLayoutStorage((prev) => ({ ...prev, activeLayoutId: layoutId }))
  }

  const renameLayout = (layoutId: string, newName: string): void => {
    if (!layouts[layoutId]) {
      console.error(`Layout ${layoutId} not found`)
      return
    }

    setLayoutStorage((prev) => {
      const layout = prev.layouts[layoutId]
      if (!layout) return prev
      return {
        ...prev,
        layouts: { ...prev.layouts, [layoutId]: touchLayout({ ...layout, name: newName }) },
      }
    })
  }

  const deleteLayout = (layoutId: string): void => {
    setLayoutStorage((prev) => removeLayoutFromStorage(prev, layoutId))
  }

  const duplicateLayout = (layoutId: string, newName: string): string => {
    const original = layouts[layoutId]
    if (!original) {
      console.error(`Layout ${layoutId} not found`)
      return ''
    }

    const duplicate = createNewLayout(newName, original.profileId)

    setLayoutStorage((prev) => {
      const source = prev.layouts[layoutId]
      if (!source) return prev
      // Deep copy boxes with their cells, from prev so same-tick edits survive
      const copy: GardenLayout = {
        ...duplicate,
        boxes: source.boxes.map((box) => ({
          ...box,
          id: generateUUID(),
          cells: [...box.cells],
        })),
      }
      return {
        ...prev,
        activeLayoutId: copy.id,
        layouts: { ...prev.layouts, [copy.id]: copy },
      }
    })

    return duplicate.id
  }

  const plantCrop = (cellIndex: number, crop: Crop, boxId?: string): void => {
    updateActiveLayout((layout) =>
      layout.boxes.length === 0 ? null : setCell(layout, { cellIndex, value: crop, boxId })
    )
  }

  const removeCrop = (cellIndex: number, boxId?: string): void => {
    updateActiveLayout((layout) =>
      layout.boxes.length === 0 ? null : setCell(layout, { cellIndex, value: null, boxId })
    )
  }

  const clearBed = (): void => {
    updateActiveLayout((layout) =>
      layout.boxes.length === 0
        ? null
        : {
            ...layout,
            boxes: layout.boxes.map((box) => ({
              ...box,
              cells: Array(box.width * box.height).fill(null) as (Crop | null)[],
            })),
          }
    )
  }

  const setBed = (newBed: (Crop | null)[]): void => {
    updateActiveLayout((layout) => {
      const firstBox = layout.boxes[0]
      if (!firstBox) return null
      const updatedBoxes = [...layout.boxes]
      updatedBoxes[0] = { ...firstBox, cells: [...newBed] }
      return { ...layout, boxes: updatedBoxes }
    })
  }

  const setAllBoxes = (boxes: GardenBox[]): void => {
    updateActiveLayout((layout) => ({ ...layout, boxes }))
  }

  const addBox = (name: string, width: number, height: number): string => {
    if (!activeLayout) return ''

    const newBox: GardenBox = {
      id: generateUUID(),
      name,
      width,
      height,
      cells: Array(width * height).fill(null) as (Crop | null)[],
    }

    updateActiveLayout((layout) => ({ ...layout, boxes: [...layout.boxes, newBox] }))

    return newBox.id
  }

  const removeBox = (boxId: string): void => {
    updateActiveLayout((layout) => {
      if (layout.boxes.length <= 1) {
        console.warn('Cannot remove the last remaining box')
        return null
      }
      return { ...layout, boxes: layout.boxes.filter((box) => box.id !== boxId) }
    })
  }

  const setBoxOrientation = (boxId: string, orientation: number): void => {
    updateActiveLayout((layout) => ({
      ...layout,
      boxes: layout.boxes.map((box) => (box.id === boxId ? { ...box, orientation } : box)),
    }))
  }

  const exportLayout = (profile?: GardenProfile): ExportedLayout => {
    if (!activeLayout) {
      throw new Error('No active layout to export')
    }

    return exportLayoutToJSON(activeLayout, profile)
  }

  const importLayout = (exportData: ExportedLayout, newName: string): string => {
    // Import and generate new IDs
    const importResult = importLayoutFromJSON(exportData, defaultProfileId)

    // Apply custom name
    const importedLayout: GardenLayout = {
      ...importResult.layout,
      name: newName,
    }

    // Add to layouts and switch to it
    setLayoutStorage((prev) => ({
      ...prev,
      activeLayoutId: importedLayout.id,
      layouts: { ...prev.layouts, [importedLayout.id]: importedLayout },
    }))

    return importedLayout.id
  }

  const toggleDislikedCrop = (cropId: string): void => {
    if (!activeLayout) {
      throw new Error('No active layout')
    }

    setLayoutStorage((prevStorage) => {
      const prevLayout = prevStorage.layouts[activeLayout.id]
      if (!prevLayout) {
        throw new Error('Layout not found')
      }

      const currentDisliked = prevLayout.dislikedCropIds ?? []
      const newDisliked = currentDisliked.includes(cropId)
        ? currentDisliked.filter((id) => id !== cropId) // Remove if present
        : [...currentDisliked, cropId] // Add if not present

      const updatedLayout = touchLayout({
        ...prevLayout,
        dislikedCropIds: newDisliked,
      })

      return {
        ...prevStorage,
        layouts: {
          ...prevStorage.layouts,
          [activeLayout.id]: updatedLayout,
        },
      }
    })
  }

  return {
    layouts,
    activeLayoutId,
    activeLayout,
    currentBed,
    createLayout,
    switchLayout,
    renameLayout,
    deleteLayout,
    duplicateLayout,
    plantCrop,
    removeCrop,
    clearBed,
    setBed,
    setAllBoxes,
    addBox,
    removeBox,
    setBoxOrientation,
    exportLayout,
    importLayout,
    toggleDislikedCrop,
  }
}
