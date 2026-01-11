import { AlertTriangle, Trash2 } from 'lucide-react'
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
  /** Array of crops (or null for empty squares) */
  squares?: (Crop | null)[]

  /** Optional callback when a square is clicked */
  onSquareClick?: (index: number) => void

  /** Garden profile with frost dates for viability checking */
  gardenProfile?: GardenProfile | null

  /** Target date for viability check (defaults to today) */
  checkDate?: Date

  /** Width of the bed in feet/columns (defaults to 8) */
  width?: number

  /** Height of the bed in feet/rows (defaults to 4) */
  height?: number

  /** Optional name/title for the bed */
  bedName?: string

  /** Optional callback when delete button is clicked */
  onDelete?: () => void

  /** Whether to show delete button (default: false) */
  showDelete?: boolean
}

/**
 * Square Foot Garden bed represented as a CSS Grid
 * Supports dynamic dimensions (e.g., 4x8, 2x4, 3x3)
 */
export function GardenBed({
  squares,
  onSquareClick,
  gardenProfile = null,
  checkDate = new Date(),
  width = 8,
  height = 4,
  bedName,
  onDelete,
  showDelete = false
}: GardenBedProps) {
  const totalCells = width * height
  const defaultSquares = Array(totalCells).fill(null) as (Crop | null)[]

  // Ensure we have the right number of squares
  const bedSquares: (Crop | null)[] = squares
    ? [
        ...squares.slice(0, totalCells),
        ...Array(Math.max(0, totalCells - squares.length)).fill(null) as (Crop | null)[]
      ]
    : defaultSquares

  // Calculate viability for each planted crop
  const viabilityMap = bedSquares.map(crop => {
    if (!crop || !gardenProfile) return true // Default to viable if no profile set
    return isCropViable(crop, gardenProfile, checkDate)
  })

  // Generate Tailwind grid-cols class dynamically
  const gridColsClass = `grid-cols-${width.toString()}`

  // Display name - use bedName prop or default format
  const displayName = bedName || `Garden Bed (${width.toString()}' × ${height.toString()}')`
  const cellCount = totalCells

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-4 text-center relative">
        <h2 className="text-2xl font-bold text-soil-800">{displayName}</h2>
        <p className="text-soil-600">{cellCount.toString()} Square Foot Gardening cells</p>
        {showDelete && onDelete && (
          <button
            onClick={onDelete}
            className="absolute top-0 right-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete this bed"
            type="button"
            aria-label={`Delete ${displayName}`}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div
        className={`grid ${gridColsClass} gap-2 p-4 bg-soil-200 rounded-lg shadow-lg`}
        style={{ gridTemplateColumns: `repeat(${width.toString()}, minmax(0, 1fr))` }}
        role="grid"
        aria-label={`${width.toString()} by ${height.toString()} foot garden bed with ${cellCount.toString()} squares`}
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
