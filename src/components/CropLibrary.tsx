import { useState, useMemo } from 'react'
import { Sprout, Check, X } from 'lucide-react'
import type { Crop } from '@/types'

interface CropLibraryProps {
  /** Available crops to display */
  crops: Crop[]

  /** Currently selected crop (if any) */
  selectedCrop: Crop | null

  /** Callback when a crop is selected */
  onSelectCrop: (crop: Crop) => void
}

/**
 * Crop Library sidebar component
 * Displays available crops and allows selection for planting
 */
export function CropLibrary({ crops, selectedCrop, onSelectCrop }: CropLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCrops = useMemo(() => {
    return crops.filter((crop) => {
      const matchesSearch = (crop.name || crop.id)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [crops, searchQuery])

  const handleClearSearch = (): void => {
    setSearchQuery('')
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sprout className="w-5 h-5 text-leaf-600" />
        <h2 className="text-xl font-semibold text-soil-900">
          Crop Library
        </h2>
      </div>

      <p className="text-sm text-soil-600 mb-4">
        Select a crop to plant in your garden
      </p>

      {/* Search Input */}
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search crops..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
          }}
          className="w-full px-3 py-2 border border-soil-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-soil-100 rounded"
            aria-label="Clear search"
            type="button"
          >
            <X className="w-4 h-4 text-soil-600" />
          </button>
        )}
      </div>

      {/* Crop Count */}
      <div className="text-xs text-soil-600 mb-2">
        {filteredCrops.length} {filteredCrops.length === 1 ? 'crop' : 'crops'}
      </div>

      <div className="space-y-2">
        {filteredCrops.map((crop) => {
          const isSelected = selectedCrop?.id === crop.id

          return (
            <button
              key={crop.id}
              onClick={() => {
                onSelectCrop(crop)
              }}
              className={`
                w-full text-left p-3 rounded-lg border-2 transition-all
                ${isSelected
                  ? 'border-leaf-500 bg-leaf-50'
                  : 'border-soil-200 hover:border-soil-400 bg-white'
                }
              `}
              type="button"
              aria-pressed={isSelected}
              aria-label={`Select ${crop.name || crop.id} for planting`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-soil-900">
                    {crop.name || crop.id}
                  </div>
                  <div className="text-xs text-soil-600 mt-1">
                    {crop.sfg_density} per sq ft
                  </div>
                </div>

                {isSelected && (
                  <Check className="w-5 h-5 text-leaf-600 flex-shrink-0" aria-hidden="true" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {selectedCrop && (
        <div className="mt-4 p-3 bg-leaf-50 rounded border border-leaf-200">
          <p className="text-sm text-leaf-900 font-medium">
            Selected: {selectedCrop.name || selectedCrop.id}
          </p>
          <p className="text-xs text-leaf-700 mt-1">
            Click an empty square to plant
          </p>
        </div>
      )}
    </div>
  )
}
