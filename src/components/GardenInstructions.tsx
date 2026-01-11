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
        <li>Click an empty square to plant it manually</li>
        <li>Click a planted square to remove the crop</li>
        <li>Green squares are in season, orange squares are out of season</li>
      </ol>

      <div className="mt-4 pt-4 border-t border-soil-200">
        <h4 className="font-semibold text-soil-900 mb-2">Garden Stash</h4>
        <p className="text-sm text-soil-700 mb-2">
          Add crops to your Stash by clicking the + button in the Crop Library.
          The Stash is a planning area where you can queue up crops before placing them.
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-soil-700 ml-2">
          <li>Click &quot;Distribute Stash&quot; to let the solver place your queued crops optimally</li>
          <li>Toggle &quot;Fill remaining gaps?&quot; to automatically fill empty spaces with compatible companion crops</li>
        </ul>
      </div>

      <div className="mt-4 pt-4 border-t border-soil-200">
        <h4 className="font-semibold text-soil-900 mb-2">Automagic Fill</h4>
        <p className="text-sm text-soil-700">
          Click &quot;Automagic Fill&quot; in the Controls panel to automatically fill your entire garden
          with compatible crops that respect companion planting rules and seasonality.
        </p>
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
