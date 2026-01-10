import { Sparkles } from 'lucide-react'
import type { GardenProfile } from '../types'

interface GardenControlsProps {
  onAutoFill: () => void
  onClearBed: () => void
  gardenProfile: GardenProfile | null
}

export function GardenControls({ onAutoFill, onClearBed, gardenProfile }: GardenControlsProps) {
  return (
    <div className="mt-4 bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-soil-900 mb-3">
        Controls
      </h3>

      <button
        onClick={onAutoFill}
        className="w-full bg-leaf-600 hover:bg-leaf-700 text-white font-medium px-4 py-2 rounded transition-colors flex items-center justify-center gap-2 mb-3"
        type="button"
      >
        <Sparkles className="w-4 h-4" />
        Automagic Fill
      </button>

      <button
        onClick={onClearBed}
        className="w-full bg-soil-600 hover:bg-soil-700 text-white font-medium px-4 py-2 rounded transition-colors"
        type="button"
      >
        Clear All Crops
      </button>

      <div className="mt-4 text-sm text-soil-600">
        <p>
          <strong>Last Frost:</strong> {gardenProfile?.last_frost_date}
        </p>
        <p className="mt-1">
          <strong>First Frost:</strong> {gardenProfile?.first_frost_date}
        </p>
      </div>
    </div>
  )
}
