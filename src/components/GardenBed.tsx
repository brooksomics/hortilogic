import { AlertTriangle } from 'lucide-react'
import type { Crop, GardenProfile } from '@/types'
import { isCropViable } from '@/utils/dateEngine'

interface GardenSquareProps {
  crop?: Crop | null
  onClick?: () => void
  /** Whether the crop is viable for current season (if planted) */
  isViable?: boolean
}

/**
 * Single square in the garden bed
 * Displays crop info if planted, or shows as empty
 */
function GardenSquare({ crop, onClick, isViable = true }: GardenSquareProps) {
  // Determine background color based on crop and viability
  const bgColor = crop
    ? isViable
      ? 'bg-leaf-100 hover:bg-leaf-200 border-leaf-400'
      : 'bg-orange-100 hover:bg-orange-200 border-orange-400'
    : 'bg-soil-50 hover:bg-soil-100 border-soil-400'

  return (
    <button
      onClick={onClick}
      className={`
        aspect-square border-2 rounded
        flex flex-col items-center justify-center p-2
        transition-colors relative
        ${bgColor}
      `}
      type="button"
      aria-label={
        crop
          ? `Planted: ${crop.name || crop.id}${!isViable ? ' (out of season)' : ''}`
          : 'Empty square'
      }
    >
      {crop && (
        <>
          {!isViable && (
            <AlertTriangle
              className="absolute top-1 right-1 w-3 h-3 text-orange-600"
              aria-label="Warning: Out of season"
            />
          )}
          <span className="text-sm font-semibold text-soil-900 text-center">
            {crop.name || crop.id}
          </span>
          <span className="text-xs text-soil-600 mt-1">
            {crop.sfg_density}/sq ft
          </span>
        </>
      )}
    </button>
  )
}

interface GardenBedProps {
  /** Array of 32 crops (or null for empty squares) */
  squares?: (Crop | null)[]

  /** Optional callback when a square is clicked */
  onSquareClick?: (index: number) => void

  /** Garden profile with frost dates for viability checking */
  gardenProfile?: GardenProfile | null

  /** Target date for viability check (defaults to today) */
  checkDate?: Date
}

/**
 * 4'x8' Square Foot Garden bed represented as a CSS Grid of 32 cells
 * Layout: 4 rows x 8 columns = 32 one-foot squares
 */
export function GardenBed({
  squares = Array(32).fill(null) as (Crop | null)[],
  onSquareClick,
  gardenProfile = null,
  checkDate = new Date()
}: GardenBedProps) {
  // Ensure we have exactly 32 squares
  const bedSquares: (Crop | null)[] = [
    ...squares.slice(0, 32),
    ...Array(Math.max(0, 32 - squares.length)).fill(null) as (Crop | null)[]
  ]

  // Calculate viability for each planted crop
  const viabilityMap = bedSquares.map(crop => {
    if (!crop || !gardenProfile) return true // Default to viable if no profile set
    return isCropViable(crop, gardenProfile, checkDate)
  })

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold text-soil-800">Garden Bed (4&apos; × 8&apos;)</h2>
        <p className="text-soil-600">32 Square Foot Gardening cells</p>
      </div>

      <div
        className="grid grid-cols-8 gap-2 p-4 bg-soil-200 rounded-lg shadow-lg"
        role="grid"
        aria-label="4 by 8 foot garden bed with 32 squares"
      >
        {bedSquares.map((crop, index) => (
          <GardenSquare
            key={index}
            crop={crop}
            onClick={() => onSquareClick?.(index)}
            isViable={viabilityMap[index]}
          />
        ))}
      </div>
    </div>
  )
}
