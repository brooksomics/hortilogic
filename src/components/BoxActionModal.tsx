import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export type BoxActionMode = 'add' | 'delete'

export interface BoxData {
  name: string
  width: number
  height: number
}

interface BoxActionModalProps {
  isOpen: boolean
  mode: BoxActionMode
  boxName?: string
  onConfirm: (data?: BoxData) => void
  onClose: () => void
}

/**
 * Modal for adding or deleting garden boxes
 * Supports two modes: 'add' (create new box) and 'delete' (confirm deletion)
 */
export function BoxActionModal({
  isOpen,
  mode,
  boxName = '',
  onConfirm,
  onClose,
}: BoxActionModalProps) {
  const [name, setName] = useState('')
  const [width, setWidth] = useState('4')
  const [height, setHeight] = useState('4')

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && mode === 'add') {
      setName('')
      setWidth('4')
      setHeight('4')
    }
  }, [isOpen, mode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === 'add') {
      const widthNum = parseInt(width, 10)
      const heightNum = parseInt(height, 10)

      // Validate: name required, width and height must be positive
      if (!name.trim()) {
        return
      }

      if (widthNum <= 0 || heightNum <= 0 || isNaN(widthNum) || isNaN(heightNum)) {
        return
      }

      onConfirm({
        name: name.trim(),
        width: widthNum,
        height: heightNum,
      })
    } else {
      // delete mode
      onConfirm()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        onClick={(e) => { e.stopPropagation() }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-soil-900">
            {mode === 'add' ? 'Add New Bed' : 'Delete Bed'}
          </h2>
          <button
            onClick={onClose}
            className="text-soil-600 hover:text-soil-900"
            type="button"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          {mode === 'add' ? (
            <div className="space-y-4">
              {/* Name Input */}
              <div>
                <label
                  htmlFor="box-name"
                  className="block text-sm font-semibold text-soil-700 mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="box-name"
                  value={name}
                  onChange={(e) => { setName(e.target.value) }}
                  placeholder="e.g., Herb Box, Main Bed"
                  className="w-full px-3 py-2 border border-soil-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-leaf-500"
                  required
                />
              </div>

              {/* Width Input */}
              <div>
                <label
                  htmlFor="box-width"
                  className="block text-sm font-semibold text-soil-700 mb-1"
                >
                  Width (feet)
                </label>
                <input
                  type="number"
                  id="box-width"
                  value={width}
                  onChange={(e) => { setWidth(e.target.value) }}
                  min="1"
                  max="12"
                  className="w-full px-3 py-2 border border-soil-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-leaf-500"
                  required
                />
              </div>

              {/* Height Input */}
              <div>
                <label
                  htmlFor="box-height"
                  className="block text-sm font-semibold text-soil-700 mb-1"
                >
                  Height (feet)
                </label>
                <input
                  type="number"
                  id="box-height"
                  value={height}
                  onChange={(e) => { setHeight(e.target.value) }}
                  min="1"
                  max="12"
                  className="w-full px-3 py-2 border border-soil-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-leaf-500"
                  required
                />
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-soil-700">
                Are you sure you want to delete <span className="font-semibold">{boxName}</span>?
                This action cannot be undone.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-soil-300 rounded-lg text-soil-700 hover:bg-soil-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${
                mode === 'add'
                  ? 'bg-leaf-600 hover:bg-leaf-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {mode === 'add' ? 'Add' : 'Delete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
