import { AlertTriangle, Droplets, Trash2 } from 'lucide-react'
import type { Crop, GardenProfile } from '@/types'
import { isCropViable, parseLocalDate } from '@/utils/dateEngine'
import { calculateHarvestDate, formatHarvestDate, getDaysUntilHarvest } from '@/utils/harvestDate'
import { getRowWaterAverage, getDripLineColor, getWaterLabel } from '@/utils/waterScoring'
import { CompassRose } from './CompassRose'

interface GardenSquareProps {
  crop?: Crop | null
  onClick?: () => void
  /** Whether the crop is viable for current season (if planted) */
  isViable?: boolean
  /** Days until estimated harvest (optional) */
  daysUntil?: number | null
  /** Full formatted harvest date string (optional) */
  harvestDateString?: string | null
}

/**
 * Single square in the garden bed
 * Displays crop info if planted, or shows as empty
 */
function GardenSquare({ crop, onClick, isViable = true, daysUntil = null, harvestDateString = null }: GardenSquareProps) {
  // Determine background color based on crop and viability
  const bgColor = crop
    ? isViable
      ? 'bg-leaf-100 hover:bg-leaf-200 border-leaf-400'
      : 'bg-orange-100 hover:bg-orange-200 border-orange-400'
    : 'bg-soil-50 hover:bg-soil-100 border-soil-400'

  // Construct label with harvest info if available
  let label = crop ? `Planted: ${crop.name || crop.id}` : 'Empty square'
  if (crop && !isViable) label += ' (out of season)'
  if (crop && daysUntil !== null) label += ` - ${daysUntil}d to harvest`

  return (
    <button
      onClick={onClick}
      className={`
        aspect-square border rounded
        flex flex-col items-center justify-center p-0.5
        transition-colors relative
        ${bgColor}
      `}
      type="button"
      title={label}
      aria-label={label}
    >
      {crop && (
        <>
          {!isViable && (
            <AlertTriangle
              className="absolute top-0 right-0 w-2 h-2 text-orange-600"
              aria-label="Warning: Out of season"
            />
          )}
          {crop.emoji && (
            <span className="text-5xl leading-none" aria-hidden="true">
              {crop.emoji}
            </span>
          )}
          <span className="text-[10px] font-semibold text-soil-900 text-center leading-tight">
            {crop.name || crop.id}
          </span>
          <span className="text-[8px] text-soil-600">
            {crop.sfg_density}/sq ft &middot; {crop.height_inches}&quot;
            {crop.trellisable && ' T'}
          </span>
          {harvestDateString && (
            <span className="text-[9px] bg-white/80 px-0.5 rounded text-emerald-800 font-medium mt-0.5 border border-emerald-200">
              {harvestDateString}
            </span>
          )}
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

  /** Compass orientation in degrees (0=N at top) */
  orientation?: number

  /** Callback when orientation changes */
  onOrientationChange?: (degrees: number) => void
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
  showDelete = false,
  orientation = 0,
  onOrientationChange
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

  // Calculate drip line data for each row
  const rowCount = height
  const dripLines = Array.from({ length: rowCount }, (_, rowIndex) => {
    const avg = getRowWaterAverage(bedSquares, width, rowIndex)
    return {
      avg,
      color: getDripLineColor(avg),
      label: getWaterLabel(avg),
    }
  })

  return (
    <div className="w-full max-w-4xl">
      <div className="mb-2 text-center relative">
        <h2 className="text-lg font-bold text-soil-800">{displayName}</h2>
        <p className="text-xs text-soil-600">{cellCount.toString()} Square Foot Gardening cells</p>
        {onOrientationChange && (
          <div className="flex justify-center mt-1">
            <CompassRose
              orientation={orientation}
              onOrientationChange={onOrientationChange}
            />
          </div>
        )}
        {showDelete && onDelete && (
          <button
            onClick={onDelete}
            className="absolute top-0 right-0 p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete this bed"
            type="button"
            aria-label={`Delete ${displayName}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex gap-1">
        {/* Drip line indicators (left side) */}
        <div
          className="flex flex-col gap-0.5 py-1"
          aria-label="Drip line water indicators"
        >
          {dripLines.map((drip, rowIndex) => (
            <div
              key={rowIndex}
              className={`flex items-center gap-0.5 rounded-l ${drip.color} px-1 flex-1`}
              title={`Row ${(rowIndex + 1).toString()}: ${drip.avg !== null ? `avg ${drip.avg.toFixed(1)} water need` : 'empty'}`}
              aria-label={`Row ${(rowIndex + 1).toString()}: ${drip.label}`}
            >
              <Droplets className="w-3 h-3 text-gray-800 flex-shrink-0" />
              <span className="text-[8px] text-gray-800 whitespace-nowrap">
                Row {(rowIndex + 1).toString()}
              </span>
            </div>
          ))}
        </div>

        {/* Garden grid */}
        <div
          className={`grid ${gridColsClass} gap-0.5 p-1 bg-soil-200 rounded-lg shadow-lg flex-1`}
          style={{ gridTemplateColumns: `repeat(${width.toString()}, minmax(0, 1fr))` }}
          role="grid"
          aria-label={`${width.toString()} by ${height.toString()} foot garden bed with ${cellCount.toString()} squares`}
        >
          {bedSquares.map((crop, index) => {
            // Calculate harvest data if crop exists
            let daysUntil: number | null = null
            let harvestDateString: string | null = null

            if (crop && gardenProfile?.targetPlantingDate) {
              const targetDate = parseLocalDate(gardenProfile.targetPlantingDate)
              const harvestDate = calculateHarvestDate(targetDate, crop.days_to_maturity)
              const rawDays = getDaysUntilHarvest(harvestDate)
              // Only show positive days remaining
              daysUntil = Math.max(0, rawDays)
              harvestDateString = formatHarvestDate(harvestDate)
            }

            return (
              <GardenSquare
                key={index}
                crop={crop}
                onClick={() => onSquareClick?.(index)}
                isViable={viabilityMap[index]}
                daysUntil={daysUntil}
                harvestDateString={harvestDateString}
              />
            )
          })}
        </div>
      </div>

      <p className="text-[10px] text-gray-500 italic mt-1 text-center">
        *This assumes Earthline Brown PC 1-GPH tubing with 12&quot; emitter spacing
      </p>
    </div>
  )
}
