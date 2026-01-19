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

      <div className="space-y-4">
        {/* Step 1: Setup */}
        <div>
          <h4 className="font-semibold text-soil-900 mb-2">Step 1: Setup Your Garden</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-soil-700 ml-2">
            <li>Define your bed layout (click &quot;Add Bed&quot; for multiple beds)</li>
            <li>Set your location and frost dates in Settings (⚙️)</li>
            <li>Choose your target planting date</li>
          </ul>
        </div>

        {/* Step 2: Select */}
        <div className="pt-4 border-t border-soil-200">
          <h4 className="font-semibold text-soil-900 mb-2">Step 2: Select Your Crops</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-soil-700 ml-2">
            <li>Browse the Crop Library and add desired crops to your Stash (+)</li>
            <li>Mark crops you don&apos;t like (👎) to exclude them from automatic filling</li>
            <li>Or select a crop and click any square to plant it manually</li>
            <li>Click planted squares to remove crops</li>
          </ul>
        </div>

        {/* Step 3: Optimize */}
        <div className="pt-4 border-t border-soil-200">
          <h4 className="font-semibold text-soil-900 mb-2">Step 3: Optimize Placement</h4>
          <p className="text-sm text-soil-700 mb-2">
            <strong>Distribute Stash:</strong> The solver places your queued crops in optimal locations
            by scoring every empty spot based on companion planting rules (friends = +1, enemies = -1000).
          </p>
          <p className="text-sm text-soil-700 mb-2">
            <strong>Fill Remaining Gaps:</strong> After distributing your stash, automatically fills
            empty spaces with seasonal crops that have the highest compatibility scores with their neighbors.
          </p>
          <p className="text-sm text-soil-700">
            <strong>Automagic Fill:</strong> Bypasses your stash and fills the entire garden with
            optimally-scored seasonal crops (respecting your &quot;Don&apos;t Like&quot; preferences).
          </p>
        </div>

        {/* Visual Indicators */}
        <div className="pt-4 border-t border-soil-200">
          <h4 className="font-semibold text-soil-900 mb-2">Visual Indicators</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-soil-700 ml-2">
            <li>🟢 Green border = crop is in season for your target planting date</li>
            <li>🟠 Orange border = crop is out of season</li>
          </ul>
        </div>
      </div>

      {selectedCrop && (
        <div className="mt-4 p-3 bg-leaf-50 rounded border border-leaf-200">
          <p className="text-sm text-leaf-900 font-medium">
            Selected: {selectedCrop.name || selectedCrop.id}
          </p>
          <p className="text-xs text-leaf-700 mt-1">
            Click any empty square in any bed to plant
          </p>
        </div>
      )}
    </div>
  )
}
