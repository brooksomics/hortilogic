import { Undo2, X } from 'lucide-react'

export interface UndoToastProps {
  isVisible: boolean
  label: string
  onUndo: () => void
  onDismiss: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export function UndoToast({
  isVisible,
  label,
  onUndo,
  onDismiss,
  onMouseEnter,
  onMouseLeave,
}: UndoToastProps) {
  if (!isVisible) {
    return null
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up z-50"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className="text-sm">{label}</span>

      <button
        onClick={onUndo}
        className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-sm font-medium"
        aria-label="Undo"
      >
        <Undo2 size={16} />
        <span>Undo</span>
      </button>

      <button
        onClick={onDismiss}
        className="p-1 hover:bg-gray-700 rounded transition-colors"
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  )
}
