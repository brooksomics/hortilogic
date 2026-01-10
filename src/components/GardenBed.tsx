import type { Crop } from '@/types'

interface GardenSquareProps {
  crop?: Crop | null
  onClick?: () => void
}

/**
 * Single square in the garden bed
 * Displays crop info if planted, or shows as empty
 */
function GardenSquare({ crop, onClick }: GardenSquareProps) {
  return (
    <button
      onClick={onClick}
      className={`
        aspect-square border-2 border-soil-400 rounded
        flex flex-col items-center justify-center p-2
        transition-colors
        ${crop
          ? 'bg-leaf-100 hover:bg-leaf-200'
          : 'bg-soil-50 hover:bg-soil-100'
        }
      `}
      type="button"
      aria-label={crop ? `Planted: ${crop.name || crop.id}` : 'Empty square'}
    >
      {crop && (
        <>
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
}

/**
 * 4'x8' Square Foot Garden bed represented as a CSS Grid of 32 cells
 * Layout: 4 rows x 8 columns = 32 one-foot squares
 */
export function GardenBed({ squares = Array(32).fill(null), onSquareClick }: GardenBedProps) {
  // Ensure we have exactly 32 squares
  const bedSquares = [...squares.slice(0, 32), ...Array(Math.max(0, 32 - squares.length)).fill(null)]

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold text-soil-800">Garden Bed (4' × 8')</h2>
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
          />
        ))}
      </div>
    </div>
  )
}
