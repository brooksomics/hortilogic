import { memo } from 'react'
import { ThumbsDown } from 'lucide-react'
import type { Crop } from '../types/garden'
import { getViabilityStyles } from '@/utils/cropViabilityHelper'
import type { ViabilityStatus } from '@/utils/cropViabilityHelper'
import { calculateHarvestDate, formatHarvestDate, getDaysUntilHarvest } from '@/utils/harvestDate'

interface CropCardProps {
  /** The crop to display */
  crop: Crop
  /** Whether this crop is selected for painting */
  isSelected: boolean
  /** Current quantity in stash */
  stashQty: number
  /** Precomputed viability status (null when no profile) */
  viabilityStatus: ViabilityStatus | null
  /** Planting date used for harvest estimates (null when no profile) */
  harvestBaseDate: Date | null
  /** Whether the crop is marked as disliked */
  isDisliked: boolean
  /** Callback when the crop is selected */
  onSelectCrop: (crop: Crop) => void
  /** Add crop to stash */
  onAddToStash?: (cropId: string, amount: number) => void
  /** Remove crop from stash */
  onRemoveFromStash?: (cropId: string, amount: number) => void
  /** Callback when the crop is marked/unmarked as disliked */
  onToggleDislikedCrop?: (cropId: string) => void
}

function formatHarvestEstimate(baseDate: Date, daysToMaturity: number): string {
  const harvestDate = calculateHarvestDate(baseDate, daysToMaturity)
  const daysUntil = getDaysUntilHarvest(harvestDate)
  return `${formatHarvestDate(harvestDate)} (${Math.max(0, daysUntil).toString()} days)`
}

function DislikeButton({ crop, isDisliked, onToggle }: {
  crop: Crop
  isDisliked: boolean
  onToggle: (cropId: string) => void
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onToggle(crop.id)
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
  )
}

function StashControls({ crop, stashQty, onAdd, onRemove }: {
  crop: Crop
  stashQty: number
  onAdd: (cropId: string, amount: number) => void
  onRemove: (cropId: string, amount: number) => void
}) {
  return (
    <div className="flex items-center justify-between bg-soil-50 rounded p-1">
      <span className="text-xs text-soil-600 px-2">Stash:</span>
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove(crop.id, 1)
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
            onAdd(crop.id, 1)
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
  )
}

/**
 * A single crop card in the Crop Library.
 * Memoized so typing in the library search box only re-renders
 * cards whose props actually changed (hortilogic-18g).
 */
export const CropCard = memo(function CropCard({
  crop,
  isSelected,
  stashQty,
  viabilityStatus,
  harvestBaseDate,
  isDisliked,
  onSelectCrop,
  onAddToStash,
  onRemoveFromStash,
  onToggleDislikedCrop
}: CropCardProps) {
  const viabilityStyles = viabilityStatus ? getViabilityStyles(viabilityStatus) : null
  const ViabilityIcon = viabilityStyles ? viabilityStyles.icon : null

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

  return (
    <div
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
              {crop.sfg_density} per sq ft &middot; {crop.height_inches}&quot;
              {crop.trellisable && ' (trellisable)'}
            </div>
            {harvestBaseDate && (
              <div className="text-xs font-medium text-emerald-700 mt-1">
                Est. harvest: {formatHarvestEstimate(harvestBaseDate, crop.days_to_maturity)}
              </div>
            )}
          </div>

          {/* Viability Icon */}
          {ViabilityIcon && (
            <ViabilityIcon className="w-4 h-4 viability-icon mr-1" aria-hidden="true" />
          )}
        </button>

        {/* Don't Like Button */}
        {onToggleDislikedCrop && (
          <DislikeButton crop={crop} isDisliked={isDisliked} onToggle={onToggleDislikedCrop} />
        )}
      </div>

      {/* Stash Controls */}
      {onAddToStash && onRemoveFromStash && (
        <StashControls crop={crop} stashQty={stashQty} onAdd={onAddToStash} onRemove={onRemoveFromStash} />
      )}
    </div>
  )
})
