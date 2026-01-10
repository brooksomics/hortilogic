import { useState } from 'react'
import type { UseLayoutManagerResult } from './useLayoutManager'

export interface UseLayoutActionsResult {
  /** Current modal mode */
  layoutModalMode: 'create' | 'rename' | 'delete' | null

  /** Target layout ID for rename/delete operations */
  targetLayoutId: string | null

  /** Handle create layout button click */
  handleCreateLayout: () => void

  /** Handle rename layout action */
  handleRenameLayout: (layoutId: string) => void

  /** Handle duplicate layout action */
  handleDuplicateLayout: (layoutId: string) => void

  /** Handle delete layout action */
  handleDeleteLayout: (layoutId: string) => void

  /** Handle modal confirm action */
  handleLayoutModalConfirm: (name: string) => void

  /** Handle modal close action */
  handleLayoutModalClose: () => void
}

/**
 * Hook to manage layout CRUD actions and modal state
 *
 * Extracts layout action handlers from App component to reduce complexity.
 * Manages modal state for create/rename/delete operations.
 */
export function useLayoutActions(
  layoutManager: Pick<UseLayoutManagerResult, 'layouts' | 'createLayout' | 'renameLayout' | 'deleteLayout' | 'duplicateLayout'>
): UseLayoutActionsResult {
  const [layoutModalMode, setLayoutModalMode] = useState<'create' | 'rename' | 'delete' | null>(null)
  const [targetLayoutId, setTargetLayoutId] = useState<string | null>(null)

  const handleCreateLayout = (): void => {
    setLayoutModalMode('create')
  }

  const handleRenameLayout = (layoutId: string): void => {
    setTargetLayoutId(layoutId)
    setLayoutModalMode('rename')
  }

  const handleDuplicateLayout = (layoutId: string): void => {
    const layout = layoutManager.layouts[layoutId]
    if (layout) {
      layoutManager.duplicateLayout(layoutId, `${layout.name} (Copy)`)
    }
  }

  const handleDeleteLayout = (layoutId: string): void => {
    setTargetLayoutId(layoutId)
    setLayoutModalMode('delete')
  }

  const handleLayoutModalConfirm = (name: string): void => {
    if (layoutModalMode === 'create') {
      layoutManager.createLayout(name)
    } else if (layoutModalMode === 'rename' && targetLayoutId) {
      layoutManager.renameLayout(targetLayoutId, name)
    } else if (layoutModalMode === 'delete' && targetLayoutId) {
      layoutManager.deleteLayout(targetLayoutId)
    }
    setLayoutModalMode(null)
    setTargetLayoutId(null)
  }

  const handleLayoutModalClose = (): void => {
    setLayoutModalMode(null)
    setTargetLayoutId(null)
  }

  return {
    layoutModalMode,
    targetLayoutId,
    handleCreateLayout,
    handleRenameLayout,
    handleDuplicateLayout,
    handleDeleteLayout,
    handleLayoutModalConfirm,
    handleLayoutModalClose,
  }
}
