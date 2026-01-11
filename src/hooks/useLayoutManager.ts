import { useLocalStorage } from './useLocalStorage'
import type { LayoutStorage, GardenLayout, Crop, GardenBox } from '../types/garden'
import { generateUUID } from '../utils/uuid'

const LAYOUTS_KEY = 'hortilogic:layouts'

/**
 * Creates an empty bed with 32 null cells
 */
function createEmptyBed(): (Crop | null)[] {
  return Array(32).fill(null) as (Crop | null)[]
}

/**
 * Creates a new garden box with given dimensions
 */
function createEmptyBox(name: string, width: number, height: number): GardenBox {
  return {
    id: generateUUID(),
    name,
    width,
    height,
    cells: Array(width * height).fill(null) as (Crop | null)[],
  }
}

/**
 * Creates a new layout with given name and profile
 * New layouts use the multi-box schema with one "Main Bed" box (4x8)
 */
function createNewLayout(name: string, profileId: string): GardenLayout {
  const now = new Date().toISOString()
  const mainBox = createEmptyBox('Main Bed', 4, 8)

  return {
    id: generateUUID(),
    name,
    createdAt: now,
    updatedAt: now,
    boxes: [mainBox],
    profileId,
  }
}

/**
 * Creates default layout storage with one layout
 * Uses version 2 (multi-box schema)
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

  // Get current bed from boxes (multi-box schema) or fall back to legacy bed
  // eslint-disable-next-line @typescript-eslint/no-deprecated, @typescript-eslint/no-unnecessary-condition
  const currentBed =
    activeLayout?.boxes?.[0]?.cells ?? activeLayout?.bed ?? createEmptyBed()

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

    // Copy boxes from original layout (multi-box schema)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (original.boxes && original.boxes.length > 0) {
      duplicate.boxes = original.boxes.map((box) => ({
        ...box,
        id: generateUUID(), // Generate new ID for duplicated box
        cells: [...box.cells],
      }))
    }
    // Fall back to legacy bed if boxes don't exist
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    else if (original.bed && duplicate.boxes[0]) {
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      duplicate.boxes[0].cells = [...original.bed]
    }

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
    if (!activeLayout) return

    // Update boxes array (multi-box schema)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (activeLayout.boxes && activeLayout.boxes.length > 0) {
      const newBoxes = [...activeLayout.boxes]
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const newCells = [...newBoxes[0]!.cells]
      newCells[cellIndex] = crop
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      newBoxes[0] = { ...newBoxes[0]!, cells: newCells }

      setLayoutStorage({
        ...layoutStorage,
        layouts: {
          ...layouts,
          [activeLayoutId]: touchLayout({ ...activeLayout, boxes: newBoxes }),
        },
      })
    }
    // Fall back to legacy bed for backward compatibility
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    else if (activeLayout.bed) {
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      const newBed = [...activeLayout.bed]
      newBed[cellIndex] = crop

      setLayoutStorage({
        ...layoutStorage,
        layouts: {
          ...layouts,
          [activeLayoutId]: touchLayout({ ...activeLayout, bed: newBed }),
        },
      })
    }
  }

  const removeCrop = (cellIndex: number): void => {
    if (!activeLayout) return

    // Update boxes array (multi-box schema)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (activeLayout.boxes && activeLayout.boxes.length > 0) {
      const newBoxes = [...activeLayout.boxes]
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const newCells = [...newBoxes[0]!.cells]
      newCells[cellIndex] = null
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      newBoxes[0] = { ...newBoxes[0]!, cells: newCells }

      setLayoutStorage({
        ...layoutStorage,
        layouts: {
          ...layouts,
          [activeLayoutId]: touchLayout({ ...activeLayout, boxes: newBoxes }),
        },
      })
    }
    // Fall back to legacy bed for backward compatibility
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    else if (activeLayout.bed) {
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      const newBed = [...activeLayout.bed]
      newBed[cellIndex] = null

      setLayoutStorage({
        ...layoutStorage,
        layouts: {
          ...layouts,
          [activeLayoutId]: touchLayout({ ...activeLayout, bed: newBed }),
        },
      })
    }
  }

  const clearBed = (): void => {
    if (!activeLayout) return

    // Update boxes array (multi-box schema)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (activeLayout.boxes && activeLayout.boxes.length > 0) {
      const newBoxes = [...activeLayout.boxes]
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const firstBox = newBoxes[0]!
      newBoxes[0] = {
        ...firstBox,
        cells: Array(firstBox.width * firstBox.height).fill(null) as (Crop | null)[],
      }

      setLayoutStorage({
        ...layoutStorage,
        layouts: {
          ...layouts,
          [activeLayoutId]: touchLayout({ ...activeLayout, boxes: newBoxes }),
        },
      })
    }
    // Fall back to legacy bed for backward compatibility
    else {
      setLayoutStorage({
        ...layoutStorage,
        layouts: {
          ...layouts,
          [activeLayoutId]: touchLayout({ ...activeLayout, bed: createEmptyBed() }),
        },
      })
    }
  }

  const setBed = (newBed: (Crop | null)[]): void => {
    if (!activeLayout) return

    // Update boxes array (multi-box schema)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (activeLayout.boxes && activeLayout.boxes.length > 0) {
      const newBoxes = [...activeLayout.boxes]
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      newBoxes[0] = { ...newBoxes[0]!, cells: [...newBed] }

      setLayoutStorage({
        ...layoutStorage,
        layouts: {
          ...layouts,
          [activeLayoutId]: touchLayout({ ...activeLayout, boxes: newBoxes }),
        },
      })
    }
    // Fall back to legacy bed for backward compatibility
    else {
      setLayoutStorage({
        ...layoutStorage,
        layouts: {
          ...layouts,
          [activeLayoutId]: touchLayout({ ...activeLayout, bed: [...newBed] }),
        },
      })
    }
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
  }
}
