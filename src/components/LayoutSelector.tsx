import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Plus, Edit2, Copy, Trash2 } from 'lucide-react'
import type { GardenLayout } from '../types/garden'

export interface LayoutSelectorProps {
  layouts: Record<string, GardenLayout>
  activeLayoutId: string
  onSwitch: (layoutId: string) => void
  onCreate: () => void
  onRename: (layoutId: string) => void
  onDuplicate: (layoutId: string) => void
  onDelete: (layoutId: string) => void
}

export function LayoutSelector({
  layouts,
  activeLayoutId,
  onSwitch,
  onCreate,
  onRename,
  onDuplicate,
  onDelete,
}: LayoutSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activeLayout = layouts[activeLayoutId]
  const layoutCount = Object.keys(layouts).length
  const canDelete = layoutCount > 1

  // Sort layouts by updatedAt descending (newest first)
  const sortedLayouts = Object.values(layouts).sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close dropdown when pressing Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleSwitch = (layoutId: string) => {
    onSwitch(layoutId)
    setIsOpen(false)
  }

  const handleAction = (action: () => void): void => {
    action()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen)
        }}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-soil-300 rounded-md hover:bg-soil-50 focus:outline-none focus:ring-2 focus:ring-leaf-600"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-soil-900">{activeLayout?.name || 'Select Layout'}</span>
        <ChevronDown className={`w-4 h-4 text-soil-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-soil-300 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="py-1">
            {sortedLayouts.map((layout) => (
              <div
                key={layout.id}
                className={`group hover:bg-soil-50 ${layout.id === activeLayoutId ? 'bg-leaf-50' : ''}`}
              >
                <div className="flex items-center justify-between px-4 py-2">
                  {/* Layout Name - Clickable */}
                  <button
                    onClick={() => {
                      handleSwitch(layout.id)
                    }}
                    className="flex-1 text-left font-medium text-soil-900 hover:text-leaf-600"
                  >
                    {layout.name}
                    {layout.id === activeLayoutId && (
                      <span className="ml-2 text-xs text-leaf-600">(active)</span>
                    )}
                  </button>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAction(() => {
                          onRename(layout.id)
                        })
                      }}
                      className="p-1 text-soil-600 hover:text-leaf-600 hover:bg-leaf-100 rounded"
                      aria-label={`Rename ${layout.name}`}
                      title="Rename"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAction(() => {
                          onDuplicate(layout.id)
                        })
                      }}
                      className="p-1 text-soil-600 hover:text-leaf-600 hover:bg-leaf-100 rounded"
                      aria-label={`Duplicate ${layout.name}`}
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAction(() => {
                          onDelete(layout.id)
                        })
                      }}
                      disabled={!canDelete}
                      className={`p-1 rounded ${
                        canDelete
                          ? 'text-soil-600 hover:text-red-600 hover:bg-red-100'
                          : 'text-soil-300 cursor-not-allowed'
                      }`}
                      aria-label={`Delete ${layout.name}`}
                      title={canDelete ? 'Delete' : 'Cannot delete last layout'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* New Layout Button */}
          <div className="border-t border-soil-200 py-1">
            <button
              onClick={() => {
                handleAction(onCreate)
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-left text-leaf-600 hover:bg-leaf-50 font-medium"
            >
              <Plus className="w-4 h-4" />
              New Layout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
