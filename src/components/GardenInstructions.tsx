import type { Crop } from '../types'

interface GardenInstructionsProps {
  selectedCrop: Crop | null
}

export function GardenInstructions({ selectedCrop }: GardenInstructionsProps) {
  return (
    <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-soil-900 mb-3">
        How to Use
      </h3>
      <ol className="list-decimal list-inside space-y-2 text-soil-700">
        <li>Select a crop from the Crop Library</li>
        <li>Click an empty square to plant it</li>
        <li>Click a planted square to remove the crop</li>
        <li>Green squares are in season, orange squares are out of season</li>
      </ol>

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
