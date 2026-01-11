import { useState, useEffect } from 'react'
import { autoFillBed } from '../utils/companionEngine'
import { CORE_50_CROPS } from '../data/crops'
import type { Crop, GardenProfile, GardenLayout, GardenBox, GardenStash } from '../types/garden'
import { autoFillAllBoxes, autoFillGaps } from '../utils/prioritySolver'
import type { PlacementSummary } from '../components/StashSummary'

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

  /** Current stash state */
  stash: GardenStash

  /** Add crop to stash */
  addToStash: (cropId: string, amount: number) => void

  /** Remove crop from stash */
  removeFromStash: (cropId: string, amount: number) => void

  /** Clear entire stash */
  clearStash: () => void

  /** Get total area of crops in stash (sq ft) */
  getStashTotalArea: () => number

  /** Check if crop can be added to stash (based on bed capacity) */
  canAddToStash: (crop: Crop) => boolean

  /** Handle distributing stash items */
  handleDistributeStash: (fillGaps: boolean) => void
  /** Result of last placement operation */
  placementResult: PlacementSummary | null

  /** Undo last bulk action */
  undo: () => void

  /** Can undo state */
  canUndo: boolean

  /** Distributing state */
  isDistributing: boolean
}

interface UseGardenInteractionsProps {
  currentBed: (Crop | null)[]
  gardenProfile: GardenProfile | null
  activeLayout: GardenLayout | null
  setAllBoxes: (boxes: GardenBox[]) => void
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
  setAllBoxes,
  plantCrop,
  removeCrop,
  updateProfile,
}: UseGardenInteractionsProps): UseGardenInteractionsResult {
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  /* Stash Logic */
  const [stash, setStash] = useState<GardenStash>(() => {
    if (activeLayout?.id) {
      const saved = localStorage.getItem(`hortilogic_stash_${activeLayout.id}`)
      return saved ? JSON.parse(saved) as GardenStash : {}
    }
    return {}
  })

  /* Undo Logic */
  const [history, setHistory] = useState<GardenBox[][]>([])

  const saveToHistory = () => {
    if (activeLayout?.boxes) {
      setHistory(prev => {
        const newHistory = [...prev, activeLayout.boxes]
        return newHistory.slice(-10) // Keep last 10
      })
    }
  }

  const undo = () => {
    setHistory(prev => {
      if (prev.length === 0) return prev
      const previousBoxes = prev[prev.length - 1]
      // Determine if previousBoxes is defined before using it
      if (previousBoxes) {
        setAllBoxes(previousBoxes)
      }
      return prev.slice(0, -1)
    })
  }

  const canUndo = history.length > 0

  /* Placement Result State */
  const [placementResult, setPlacementResult] = useState<PlacementSummary | null>(null)
  const [isDistributing, setIsDistributing] = useState(false)
  // Load stash when layout changes
  useEffect(() => {
    if (activeLayout?.id) {
      const key = `hortilogic_stash_${activeLayout.id}`
      const saved = localStorage.getItem(key)
      if (saved) {
        try {
          setStash(JSON.parse(saved) as GardenStash)
        } catch (e) {
          console.error("Failed to parse stash", e)
          setStash({})
        }
      } else {
        setStash({})
      }
    } else {
      setStash({})
    }
  }, [activeLayout?.id])

  // Save stash to local storage on change
  useEffect(() => {
    if (activeLayout) {
      const key = `hortilogic_stash_${activeLayout.id}`
      localStorage.setItem(key, JSON.stringify(stash))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stash, activeLayout?.id])

  const addToStash = (cropId: string, amount: number) => {
    setStash((prev: GardenStash) => {
      const current = prev[cropId] || 0
      return { ...prev, [cropId]: current + amount }
    })
  }

  const removeFromStash = (cropId: string, amount: number) => {
    setStash((prev: GardenStash) => {
      const current = prev[cropId] || 0
      const updated = current - amount
      if (updated <= 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [cropId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [cropId]: updated }
    })
  }

  const clearStash = () => {
    setStash({})
  }

  const getStashTotalArea = (): number => {
    return Object.entries(stash).reduce((total, [cropId, qty]) => {
      const crop = CORE_50_CROPS.find((c) => c.id === cropId)
      if (!crop) return total
      // sqftPerPlant is 1/density. Total area = qty / density
      // Since density is plants PER sq ft, area = ceil(qty / density)
      return total + Math.ceil(qty / crop.sfg_density)
    }, 0)
  }

  const canAddToStash = (crop: Crop) => {
    const currentArea = getStashTotalArea()

    // Calculate area with new item
    const currentQty = stash[crop.id] || 0
    const newQty = currentQty + 1
    const oldSqFt = Math.ceil(currentQty / crop.sfg_density)
    const newSqFt = Math.ceil(newQty / crop.sfg_density)
    const delta = newSqFt - oldSqFt

    // Need total bed area from active layout
    const totalBedArea = activeLayout?.boxes.reduce((sum: number, box: GardenBox) => sum + box.width * box.height, 0) ?? 0

    return currentArea + delta <= totalBedArea
  }

  const handleAutoFill = (): void => {
    if (!gardenProfile || !activeLayout || activeLayout.boxes.length === 0) {
      return
    }

    // Process ALL boxes in the layout
    const updatedBoxes = activeLayout.boxes.map((box: GardenBox) => {
      const filledCells = autoFillBed(
        box.cells,
        CORE_50_CROPS,
        gardenProfile,
        new Date(),
        box.width,
        box.height
      )
      return { ...box, cells: filledCells }
    })

    setAllBoxes(updatedBoxes)
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

  /* New Priority Solver Logic */
  const handleDistributeStash = (fillGaps: boolean) => {
    if (!activeLayout || Object.keys(stash).length === 0) return

    // We need to map `bed` to `cells`.
    const solverInput = activeLayout.boxes.map((box: GardenBox) => ({
      id: box.id,
      cells: [...box.cells], // Clone cells
      width: box.width
    }))

    setIsDistributing(true)

    // Allow UI to update (spinner)
    setTimeout(() => {
      saveToHistory() // Save state before changes

      try {
        const { boxResults, remainingStash } = autoFillAllBoxes(solverInput, stash, CORE_50_CROPS)

        // Aggregate results for report
        let placedCount = 0
        let allFailed: Array<{ cropId: string; reason: string }> = []

        // Apply changes to layout
        const finalBoxes = activeLayout.boxes.map((originalBox: GardenBox) => {
          const result = boxResults.find(r => r.boxId === originalBox.id)
          if (!result) return originalBox

          placedCount += result.placed.length
          allFailed = [...allFailed, ...result.failed]

          // Apply placements to this box's bed
          const newBed = [...originalBox.cells]

          // The solver result `placed` has {cellIndex, cropId}.
          result.placed.forEach(p => {
            const crop = CORE_50_CROPS.find(c => c.id === p.cropId)
            if (crop) {
              newBed[p.cellIndex] = crop
            }
          })

          if (fillGaps) {
            // Run gap filler on the bed state AFTER stash placement
            const gapPlacements = autoFillGaps(newBed, CORE_50_CROPS, originalBox.width)

            gapPlacements.forEach(p => {
              const crop = CORE_50_CROPS.find(c => c.id === p.cropId)
              if (crop) {
                newBed[p.cellIndex] = crop
              }
            })

            placedCount += gapPlacements.length
          }

          return {
            ...originalBox,
            cells: newBed
          }
        })

        setAllBoxes(finalBoxes)
        // Set stash to whatever remains (failed items usually)
        setStash(remainingStash)

        setPlacementResult({
          placed: placedCount,
          failed: allFailed
        })
      } finally {
        setIsDistributing(false)
      }
    }, 100) // Small delay for spinner
  }

  return {
    selectedCrop,
    setSelectedCrop,
    isSettingsOpen,
    handleAutoFill,
    handleSquareClick,
    handleSettingsSave,
    handleSettingsClose,
    openSettings: () => { setIsSettingsOpen(true); },
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
    isDistributing
  }
}

