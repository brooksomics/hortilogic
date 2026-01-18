import { useState, useMemo } from 'react'
import { Sprout, X, ThumbsDown } from 'lucide-react'
import type { Crop, GardenProfile, GardenStash } from '../types/garden'
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

  /** Current stash for quantities */
  stash?: GardenStash

  /** Add crop to stash */
  onAddToStash?: (cropId: string, amount: number) => void

  /** Remove crop from stash */
  onRemoveFromStash?: (cropId: string, amount: number) => void

  /** List of disliked crop IDs */
  dislikedCropIds?: string[]

  /** Callback when a crop is marked/unmarked as disliked */
  onToggleDislikedCrop?: (cropId: string) => void
}

type CropCategory = 'all' | 'vegetable' | 'herb' | 'flower'
type SunRequirement = 'full' | 'partial' | 'shade' | null

/**
 * Crop Library sidebar component
 * Displays available crops and allows selection for planting
 */
export function CropLibrary({
  crops,
  selectedCrop,
  onSelectCrop,
  currentProfile,
  stash,
  onAddToStash,
  onRemoveFromStash,
  dislikedCropIds,
  onToggleDislikedCrop
}: CropLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [hideOutOfSeason, setHideOutOfSeason] = useState(false)
  const [activeCategory, setActiveCategory] = useState<CropCategory>('all')
  const [activeSunFilter, setActiveSunFilter] = useState<SunRequirement>(null)

  const filteredCrops = useMemo(() => {
    return crops.filter((crop) => {
      // Search by name, id, or botanical family
      const matchesSearch = (crop.name || crop.id)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        crop.botanical_family.toLowerCase().includes(searchQuery.toLowerCase())

      // Filter by category
      const matchesCategory = activeCategory === 'all' || crop.type === activeCategory

      // Filter by sun requirement
      const matchesSun = activeSunFilter === null || crop.sun === activeSunFilter

      // Filter by season if profile and toggle enabled
      if (hideOutOfSeason && currentProfile) {
        const targetDate = currentProfile.targetPlantingDate
          ? new Date(currentProfile.targetPlantingDate)
          : new Date()
        const status = getCropViabilityStatus(crop, currentProfile, targetDate)
        const matchesSeason = status === 'viable' || status === 'marginal'
        return matchesSearch && matchesCategory && matchesSun && matchesSeason
      }

      return matchesSearch && matchesCategory && matchesSun
    })
  }, [crops, searchQuery, hideOutOfSeason, currentProfile, activeCategory, activeSunFilter])

  // Group crops by botanical family (only for vegetables)
  const groupedCrops = useMemo(() => {
    if (activeCategory !== 'vegetable') {
      return null
    }

    const groups: Record<string, Crop[]> = {}
    filteredCrops.forEach((crop) => {
      const family = crop.botanical_family
      if (!groups[family]) {
        groups[family] = []
      }
      groups[family].push(crop)
    })

    return groups
  }, [filteredCrops, activeCategory])

  const handleClearSearch = (): void => {
    setSearchQuery('')
  }

  const handleCategoryClick = (category: CropCategory): void => {
    setActiveCategory(category)
  }

  const handleSunFilterClick = (sun: SunRequirement): void => {
    // Toggle off if clicking the same filter
    setActiveSunFilter(activeSunFilter === sun ? null : sun)
  }

  const renderCropCard = (crop: Crop) => {
    const isSelected = selectedCrop?.id === crop.id

    // Current quantity in stash
    const stashQty = stash ? (stash[crop.id] || 0) : 0

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
        : 'border-soil-200 bg-white'

    // Create aria-label with viability info
    const ariaLabel = viabilityStyles
      ? `Select ${crop.name || crop.id} for planting - ${viabilityStyles.label}`
      : `Select ${crop.name || crop.id} for planting`

    const isDisliked = dislikedCropIds?.includes(crop.id) ?? false

    return (
      <div
        key={crop.id}
        className={`
          w-full p-3 rounded-lg border-2 transition-all group
          ${borderClass}
        `}
        data-testid={`crop-card-${crop.id}`}
      >
        <div className="flex items-center justify-between mb-2">
          {/* Crop Info Header - Clickable to select for painting */}
          <button
            onClick={() => { onSelectCrop(crop); }}
            className="flex items-center gap-2 flex-1 text-left"
            type="button"
            aria-pressed={isSelected}
            aria-label={ariaLabel}
          >
            {crop.emoji && (
              <span className="text-2xl flex-shrink-0" aria-hidden="true">
                {crop.emoji}
              </span>
            )}
            <div className="flex-1">
              <div className="font-semibold text-soil-900">
                {crop.name || crop.id}
              </div>
              <div className="text-xs text-soil-600 mt-1">
                {crop.sfg_density} per sq ft
              </div>
            </div>

            {/* Viability Icon */}
            {ViabilityIcon && (
              <ViabilityIcon className="w-4 h-4 viability-icon mr-1" aria-hidden="true" />
            )}
          </button>

          {/* Don't Like Button */}
          {onToggleDislikedCrop && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleDislikedCrop(crop.id)
              }}
              className={`
                p-1.5 rounded transition-colors
                ${isDisliked
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-soil-400 hover:bg-soil-100 hover:text-soil-600'
                }
              `}
              aria-label={
                isDisliked
                  ? `Unmark ${crop.name || crop.id} as don't like`
                  : `Mark ${crop.name || crop.id} as don't like`
              }
              type="button"
            >
              <ThumbsDown
                className={`w-4 h-4 ${isDisliked ? 'fill-current' : ''}`}
                aria-hidden="true"
              />
            </button>
          )}
        </div>

        {/* Stash Controls */}
        {onAddToStash && onRemoveFromStash && (
          <div className="flex items-center justify-between bg-soil-50 rounded p-1">
            <span className="text-xs text-soil-600 px-2">Stash:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveFromStash(crop.id, 1)
                }}
                className="w-6 h-6 flex items-center justify-center rounded bg-white border border-soil-300 text-soil-700 hover:bg-soil-100 disabled:opacity-50"
                disabled={stashQty === 0}
                aria-label={`Remove ${crop.name ?? crop.id} from stash`}
                type="button"
              >
                -
              </button>
              <span className="w-6 text-center text-sm font-medium text-soil-900">
                {stashQty}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onAddToStash(crop.id, 1)
                }}
                className="w-6 h-6 flex items-center justify-center rounded bg-white border border-soil-300 text-soil-700 hover:bg-soil-100 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Add ${crop.name ?? crop.id} to stash`}
                type="button"
                disabled={false} // Todo: connect to canAddToStash
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sprout className="w-5 h-5 text-leaf-600" />
        <h2 className="text-xl font-semibold text-soil-900">
          Crop Library
        </h2>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { handleCategoryClick('all') }}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeCategory === 'all'
              ? 'bg-leaf-600 text-white'
              : 'bg-soil-100 text-soil-700 hover:bg-soil-200'
          }`}
          type="button"
        >
          All
        </button>
        <button
          onClick={() => { handleCategoryClick('vegetable') }}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeCategory === 'vegetable'
              ? 'bg-leaf-600 text-white'
              : 'bg-soil-100 text-soil-700 hover:bg-soil-200'
          }`}
          type="button"
        >
          Vegetables
        </button>
        <button
          onClick={() => { handleCategoryClick('herb') }}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeCategory === 'herb'
              ? 'bg-leaf-600 text-white'
              : 'bg-soil-100 text-soil-700 hover:bg-soil-200'
          }`}
          type="button"
        >
          Herbs
        </button>
        <button
          onClick={() => { handleCategoryClick('flower') }}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeCategory === 'flower'
              ? 'bg-leaf-600 text-white'
              : 'bg-soil-100 text-soil-700 hover:bg-soil-200'
          }`}
          type="button"
        >
          Flowers
        </button>
      </div>

      {/* Sun Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => { handleSunFilterClick('full') }}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            activeSunFilter === 'full'
              ? 'bg-amber-500 text-white'
              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
          }`}
          type="button"
        >
          ☀️ Full Sun
        </button>
        <button
          onClick={() => { handleSunFilterClick('partial') }}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            activeSunFilter === 'partial'
              ? 'bg-sky-500 text-white'
              : 'bg-sky-100 text-sky-800 hover:bg-sky-200'
          }`}
          type="button"
        >
          ⛅ Partial Shade
        </button>
        <button
          onClick={() => { handleSunFilterClick('shade') }}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            activeSunFilter === 'shade'
              ? 'bg-slate-600 text-white'
              : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
          }`}
          type="button"
        >
          🌙 Shade
        </button>
      </div>

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

      {/* Crop List */}
      <div className="space-y-2">
        {groupedCrops ? (
          // Grouped view (for Vegetables tab)
          Object.entries(groupedCrops).sort(([a], [b]) => a.localeCompare(b)).map(([family, cropsInFamily]) => (
            <div key={family} data-testid={`family-group-${family}`} className="mb-4">
              <h3 className="text-sm font-semibold text-soil-800 mb-2 px-2">
                {family}
              </h3>
              <div className="space-y-2">
                {cropsInFamily.map(renderCropCard)}
              </div>
            </div>
          ))
        ) : (
          // Flat list (for All, Herbs, Flowers tabs)
          filteredCrops.map(renderCropCard)
        )}
      </div>

      {selectedCrop && (
        <div className="mt-4 p-3 bg-leaf-50 rounded border border-leaf-200">
          <p className="text-sm text-leaf-900 font-medium">
            Selected for Painting: {selectedCrop.name || selectedCrop.id}
          </p>
          <p className="text-xs text-leaf-700 mt-1">
            Click empty squares to plant manually, or use Stash to plan.
          </p>
        </div>
      )}
    </div>
  )
}
