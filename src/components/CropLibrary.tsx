import { useState, useMemo } from 'react'
import { Sprout, Check, X } from 'lucide-react'
import type { Crop, GardenProfile } from '@/types'
import { getCropViabilityStatus, getViabilityStyles } from '@/utils/cropViabilityHelper'

interface CropLibraryProps {
  /** Available crops to display */
  crops: Crop[]

  /** Currently selected crop (if any) */
  selectedCrop: Crop | null

  /** Callback when a crop is selected */
  onSelectCrop: (crop: Crop) => void

  /** Optional garden profile for viability indicators */
  currentProfile?: GardenProfile | null
}

/**
 * Crop Library sidebar component
 * Displays available crops and allows selection for planting
 */
export function CropLibrary({ crops, selectedCrop, onSelectCrop, currentProfile }: CropLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [hideOutOfSeason, setHideOutOfSeason] = useState(false)

  const filteredCrops = useMemo(() => {
    return crops.filter((crop) => {
      const matchesSearch = (crop.name || crop.id)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())

      // Filter by season if profile and toggle enabled
      if (hideOutOfSeason && currentProfile) {
        const targetDate = currentProfile.targetPlantingDate
          ? new Date(currentProfile.targetPlantingDate)
          : new Date()
        const status = getCropViabilityStatus(crop, currentProfile, targetDate)
        const matchesSeason = status === 'viable' || status === 'marginal'
        return matchesSearch && matchesSeason
      }

      return matchesSearch
    })
  }, [crops, searchQuery, hideOutOfSeason, currentProfile])

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

      {/* Season Filter Toggle */}
      {currentProfile && (
        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm text-soil-700 cursor-pointer">
            <input
              type="checkbox"
              checked={hideOutOfSeason}
              onChange={(e) => {
                setHideOutOfSeason(e.target.checked)
              }}
              className="rounded border-soil-300 text-leaf-600 focus:ring-leaf-500"
              aria-label="Hide out-of-season crops"
            />
            <span>Hide out-of-season crops</span>
          </label>
        </div>
      )}

      {/* Crop Count */}
      <div className="text-xs text-soil-600 mb-2">
        {filteredCrops.length} {filteredCrops.length === 1 ? 'crop' : 'crops'}
      </div>

      <div className="space-y-2">
        {filteredCrops.map((crop) => {
          const isSelected = selectedCrop?.id === crop.id

          // Get viability status and styles
          let viabilityStyles = null
          let viabilityStatus = null
          let ViabilityIcon = null
          if (currentProfile) {
            const targetDate = currentProfile.targetPlantingDate
              ? new Date(currentProfile.targetPlantingDate)
              : new Date()
            viabilityStatus = getCropViabilityStatus(crop, currentProfile, targetDate)
            viabilityStyles = getViabilityStyles(viabilityStatus)
            ViabilityIcon = viabilityStyles.icon
          }

          // Determine border class
          const borderClass = isSelected
            ? 'border-leaf-500 bg-leaf-50'
            : viabilityStyles
              ? viabilityStyles.className
              : 'border-soil-200 hover:border-soil-400 bg-white'

          // Create aria-label with viability info
          const ariaLabel = viabilityStyles
            ? `Select ${crop.name || crop.id} for planting - ${viabilityStyles.label}`
            : `Select ${crop.name || crop.id} for planting`

          return (
            <button
              key={crop.id}
              onClick={() => {
                onSelectCrop(crop)
              }}
              className={`
                w-full text-left p-3 rounded-lg border-2 transition-all
                ${borderClass}
              `}
              type="button"
              aria-pressed={isSelected}
              aria-label={ariaLabel}
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

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Viability Icon */}
                  {ViabilityIcon && (
                    <ViabilityIcon className="w-4 h-4 viability-icon" aria-hidden="true" />
                  )}

                  {/* Selection Check */}
                  {isSelected && (
                    <Check className="w-5 h-5 text-leaf-600" aria-hidden="true" />
                  )}
                </div>
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
