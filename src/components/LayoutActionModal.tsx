import { useState, useEffect } from 'react'

export interface LayoutActionModalProps {
  isOpen: boolean
  mode: 'create' | 'rename' | 'delete'
  currentName?: string
  onConfirm: (name: string) => void
  onClose: () => void
}

export function LayoutActionModal({
  isOpen,
  mode,
  currentName = '',
  onConfirm,
  onClose,
}: LayoutActionModalProps) {
  const [layoutName, setLayoutName] = useState(currentName)
  const [error, setError] = useState('')

  // Reset form when modal opens or mode/currentName changes
  useEffect(() => {
    if (isOpen) {
      setLayoutName(currentName)
      setError('')
    }
  }, [isOpen, currentName])

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Delete mode doesn't need name validation
    if (mode === 'delete') {
      onConfirm('')
      return
    }

    // Validate and trim layout name
    const trimmedName = layoutName.trim()
    if (!trimmedName) {
      setError('Layout name cannot be empty')
      return
    }

    setError('')
    onConfirm(trimmedName)
  }

  const getTitle = () => {
    switch (mode) {
      case 'create':
        return 'Create New Layout'
      case 'rename':
        return 'Rename Layout'
      case 'delete':
        return 'Delete Layout'
    }
  }

  const getButtonText = () => {
    switch (mode) {
      case 'create':
        return 'Create'
      case 'rename':
        return 'Rename'
      case 'delete':
        return 'Delete'
    }
  }

  const getButtonClass = () => {
    if (mode === 'delete') {
      return 'px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600'
    }
    return 'px-4 py-2 bg-leaf-600 text-white rounded-md hover:bg-leaf-700 focus:outline-none focus:ring-2 focus:ring-leaf-600'
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="layout-action-title"
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 id="layout-action-title" className="text-2xl font-bold mb-4 text-soil-900">
          {getTitle()}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'delete' ? (
            <div className="py-2">
              <p className="text-soil-700 mb-2">
                Are you sure you want to delete <strong>{currentName}</strong>?
              </p>
              <p className="text-sm text-soil-600">This action cannot be undone.</p>
            </div>
          ) : (
            <div>
              <label htmlFor="layout-name" className="block text-sm font-medium text-soil-700 mb-1">
                Layout Name
              </label>
              <input
                id="layout-name"
                type="text"
                value={layoutName}
                onChange={(e) => {
                  setLayoutName(e.target.value)
                  setError('')
                }}
                className="w-full px-3 py-2 border border-soil-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leaf-600"
                placeholder="e.g., Spring 2026, Fall Garden"
                autoFocus
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-soil-300 rounded-md text-soil-700 hover:bg-soil-50 focus:outline-none focus:ring-2 focus:ring-leaf-600"
            >
              Cancel
            </button>
            <button type="submit" className={getButtonClass()}>
              {getButtonText()}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
