import { Compass } from 'lucide-react'

interface CompassRoseProps {
  /** Current orientation in degrees (0=N, 90=E, 180=S, 270=W) */
  orientation: number
  /** Callback when orientation changes */
  onOrientationChange: (degrees: number) => void
}

const DIRECTIONS = [
  { label: 'N', degrees: 0 },
  { label: 'E', degrees: 90 },
  { label: 'S', degrees: 180 },
  { label: 'W', degrees: 270 },
] as const

/**
 * Interactive compass rose for setting garden bed orientation.
 * Click a cardinal direction to set which way the top of the grid faces.
 */
export function CompassRose({ orientation, onOrientationChange }: CompassRoseProps) {
  const activeLabel = DIRECTIONS.find(d => d.degrees === orientation)?.label ?? 'N'

  return (
    <div
      className="flex items-center gap-2"
      role="group"
      aria-label="Bed compass orientation"
    >
      <Compass className="w-4 h-4 text-soil-600 flex-shrink-0" />
      <div className="flex gap-0.5">
        {DIRECTIONS.map(({ label, degrees }) => (
          <button
            key={label}
            onClick={() => { onOrientationChange(degrees) }}
            className={`
              w-7 h-7 text-xs font-bold rounded transition-colors
              ${degrees === orientation
                ? 'bg-leaf-600 text-white'
                : 'bg-soil-100 text-soil-700 hover:bg-soil-200'
              }
            `}
            type="button"
            aria-label={`Set top of bed facing ${label === 'N' ? 'North' : label === 'E' ? 'East' : label === 'S' ? 'South' : 'West'}`}
            aria-pressed={degrees === orientation}
          >
            {label}
          </button>
        ))}
      </div>
      <span className="text-[10px] text-soil-500">
        {activeLabel} at top
      </span>
    </div>
  )
}
