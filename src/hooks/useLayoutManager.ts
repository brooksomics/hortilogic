import { useLocalStorage } from './useLocalStorage'
import type { LayoutStorage, GardenLayout, GardenBox, Crop } from '../types/garden'
import { generateUUID } from '../utils/uuid'

const LAYOUTS_KEY = 'hortilogic:layouts'

/**
 * Creates an empty 4x8 garden box
 */
function createEmptyBox(name = 'Main Bed'): GardenBox {
  return {
    id: generateUUID(),
    name,
    width: 8,
    height: 4,
    cells: Array(32).fill(null) as (Crop | null)[],
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

  /** Plant a crop in the active layout */
  plantCrop: (cellIndex: number, crop: Crop) => void

  /** Remove a crop from the active layout */
  removeCrop: (cellIndex: number) => void

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
  const [layoutStorage, setLayoutStorage] = useLocalStorage<LayoutStorage>(
    LAYOUTS_KEY,
    createDefaultLayoutStorage(defaultProfileId)
  )

  const layouts = layoutStorage.layouts
  const activeLayoutId = layoutStorage.activeLayoutId
  const activeLayout = layouts[activeLayoutId] ?? null
  // For backward compatibility, currentBed returns the first box's cells
  const currentBed = activeLayout?.boxes[0]?.cells ?? []

  const createLayout = (name: string): string => {
    const newLayout = createNewLayout(name, defaultProfileId)

    setLayoutStorage({
      ...layoutStorage,
      activeLayoutId: newLayout.id,
      layouts: {
        ...layouts,
        [newLayout.id]: newLayout,
      },
    })

    return newLayout.id
  }

  const switchLayout = (layoutId: string): void => {
    if (!layouts[layoutId]) {
      console.error(`Layout ${layoutId} not found`)
      return
    }

    setLayoutStorage({
      ...layoutStorage,
      activeLayoutId: layoutId,
    })
  }

  const renameLayout = (layoutId: string, newName: string): void => {
    const layout = layouts[layoutId]
    if (!layout) {
      console.error(`Layout ${layoutId} not found`)
      return
    }

    setLayoutStorage({
      ...layoutStorage,
      layouts: {
        ...layouts,
        [layoutId]: touchLayout({ ...layout, name: newName }),
      },
    })
  }

  const deleteLayout = (layoutId: string): void => {
    const layoutIds = Object.keys(layouts)

    // Prevent deleting last layout
    if (layoutIds.length <= 1) {
      console.warn('Cannot delete the last remaining layout')
      return
    }

    // Remove the layout from the layouts object
    const remainingLayouts: Record<string, GardenLayout> = {}
    for (const [id, layout] of Object.entries(layouts)) {
      if (id !== layoutId) {
        remainingLayouts[id] = layout
      }
    }

    // If deleting active layout, switch to another
    const newActiveId =
      activeLayoutId === layoutId
        ? layoutIds.find((id) => id !== layoutId) ?? activeLayoutId
        : activeLayoutId

    setLayoutStorage({
      ...layoutStorage,
      activeLayoutId: newActiveId,
      layouts: remainingLayouts,
    })
  }

  const duplicateLayout = (layoutId: string, newName: string): string => {
    const original = layouts[layoutId]
    if (!original) {
      console.error(`Layout ${layoutId} not found`)
      return ''
    }

    const duplicate = createNewLayout(newName, original.profileId)
    // Deep copy boxes with their cells
    duplicate.boxes = original.boxes.map(box => ({
      ...box,
      id: generateUUID(), // New ID for duplicated box
      cells: [...box.cells],
    }))

    setLayoutStorage({
      ...layoutStorage,
      activeLayoutId: duplicate.id,
      layouts: {
        ...layouts,
        [duplicate.id]: duplicate,
      },
    })

    return duplicate.id
  }

  const plantCrop = (cellIndex: number, crop: Crop): void => {
    if (!activeLayout || !activeLayout.boxes[0]) return

    const firstBox = activeLayout.boxes[0]
    const newCells = [...firstBox.cells]
    newCells[cellIndex] = crop

    const updatedBoxes = [...activeLayout.boxes]
    updatedBoxes[0] = { ...firstBox, cells: newCells }

    setLayoutStorage({
      ...layoutStorage,
      layouts: {
        ...layouts,
        [activeLayoutId]: touchLayout({ ...activeLayout, boxes: updatedBoxes }),
      },
    })
  }

  const removeCrop = (cellIndex: number): void => {
    if (!activeLayout || !activeLayout.boxes[0]) return

    const firstBox = activeLayout.boxes[0]
    const newCells = [...firstBox.cells]
    newCells[cellIndex] = null

    const updatedBoxes = [...activeLayout.boxes]
    updatedBoxes[0] = { ...firstBox, cells: newCells }

    setLayoutStorage({
      ...layoutStorage,
      layouts: {
        ...layouts,
        [activeLayoutId]: touchLayout({ ...activeLayout, boxes: updatedBoxes }),
      },
    })
  }

  const clearBed = (): void => {
    if (!activeLayout || !activeLayout.boxes[0]) return

    const firstBox = activeLayout.boxes[0]
    const updatedBoxes = [...activeLayout.boxes]
    updatedBoxes[0] = {
      ...firstBox,
      cells: Array(firstBox.width * firstBox.height).fill(null) as (Crop | null)[],
    }

    setLayoutStorage({
      ...layoutStorage,
      layouts: {
        ...layouts,
        [activeLayoutId]: touchLayout({ ...activeLayout, boxes: updatedBoxes }),
      },
    })
  }

  const setBed = (newBed: (Crop | null)[]): void => {
    if (!activeLayout || !activeLayout.boxes[0]) return

    const firstBox = activeLayout.boxes[0]
    const updatedBoxes = [...activeLayout.boxes]
    updatedBoxes[0] = { ...firstBox, cells: [...newBed] }

    setLayoutStorage({
      ...layoutStorage,
      layouts: {
        ...layouts,
        [activeLayoutId]: touchLayout({ ...activeLayout, boxes: updatedBoxes }),
      },
    })
  }

  const setAllBoxes = (boxes: GardenBox[]): void => {
    if (!activeLayout) return

    setLayoutStorage({
      ...layoutStorage,
      layouts: {
        ...layouts,
        [activeLayoutId]: touchLayout({ ...activeLayout, boxes }),
      },
    })
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

    const updatedBoxes = [...activeLayout.boxes, newBox]

    setLayoutStorage({
      ...layoutStorage,
      layouts: {
        ...layouts,
        [activeLayoutId]: touchLayout({ ...activeLayout, boxes: updatedBoxes }),
      },
    })

    return newBox.id
  }

  const removeBox = (boxId: string): void => {
    if (!activeLayout) return

    // Prevent removing the last remaining box
    if (activeLayout.boxes.length <= 1) {
      console.warn('Cannot remove the last remaining box')
      return
    }

    const updatedBoxes = activeLayout.boxes.filter(box => box.id !== boxId)

    setLayoutStorage({
      ...layoutStorage,
      layouts: {
        ...layouts,
        [activeLayoutId]: touchLayout({ ...activeLayout, boxes: updatedBoxes }),
      },
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
  }
}
