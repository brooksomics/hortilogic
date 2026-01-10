import { useState, useEffect } from 'react'
import { Sprout } from 'lucide-react'
import { GardenBed } from './components/GardenBed'
import { CropLibrary } from './components/CropLibrary'
import { useGarden } from './hooks/useGarden'
import type { Crop, GardenProfile } from './types'

// Sample crops with planting strategies
const sampleCrops: Crop[] = [
  {
    id: 'lettuce',
    name: 'Lettuce',
    sfg_density: 4,
    planting_strategy: { start_window_start: -4, start_window_end: 2 }
  },
  {
    id: 'tomato',
    name: 'Tomato',
    sfg_density: 1,
    planting_strategy: { start_window_start: 0, start_window_end: 4 }
  },
  {
    id: 'carrot',
    name: 'Carrot',
    sfg_density: 16,
    planting_strategy: { start_window_start: -2, start_window_end: 4 }
  },
  {
    id: 'peas',
    name: 'Sugar Snap Peas',
    sfg_density: 8,
    planting_strategy: { start_window_start: -8, start_window_end: -2 }
  },
  {
    id: 'radish',
    name: 'Radish',
    sfg_density: 16,
    planting_strategy: { start_window_start: -4, start_window_end: 8 }
  }
]

// Default garden profile (Denver, CO frost dates)
const defaultProfile: GardenProfile = {
  last_frost_date: '2024-05-15',
  first_frost_date: '2024-10-01',
  season_extension_weeks: 0
}

function App() {
  const { currentBed, gardenProfile, plantCrop, removeCrop, clearBed, setGardenProfile } = useGarden()
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null)

  // Initialize garden profile if not set
  useEffect(() => {
    if (!gardenProfile) {
      setGardenProfile(defaultProfile)
    }
  }, [gardenProfile, setGardenProfile])

  // Handle square click - plant or remove crop
  const handleSquareClick = (index: number) => {
    const existingCrop = currentBed[index]

    if (existingCrop) {
      // Remove crop if square is occupied
      removeCrop(index)
    } else if (selectedCrop) {
      // Plant selected crop if square is empty
      plantCrop(index, selectedCrop)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-leaf-50 to-soil-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Sprout className="w-12 h-12 text-leaf-600" />
          </div>
          <h1 className="text-4xl font-bold text-soil-900 mb-2">
            HortiLogic
          </h1>
          <p className="text-lg text-soil-700">
            Interactive Garden Planner
          </p>
        </div>

        {/* Main Layout: Sidebar + Garden Bed */}
        <div className="grid lg:grid-cols-[300px_1fr] gap-8 max-w-7xl mx-auto">
          {/* Sidebar: Crop Library */}
          <div className="order-2 lg:order-1">
            <CropLibrary
              crops={sampleCrops}
              selectedCrop={selectedCrop}
              onSelectCrop={setSelectedCrop}
            />

            {/* Controls */}
            <div className="mt-4 bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-soil-900 mb-3">
                Controls
              </h3>

              <button
                onClick={clearBed}
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
          </div>

          {/* Main: Garden Bed */}
          <div className="order-1 lg:order-2">
            <GardenBed
              squares={currentBed}
              onSquareClick={handleSquareClick}
              gardenProfile={gardenProfile}
            />

            {/* Instructions */}
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

            {/* Feature Status */}
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-soil-900 mb-3">
                ✓ Feature 002 Complete
              </h3>
              <div className="space-y-2 text-sm text-soil-700">
                <p>✓ State management with LocalStorage persistence</p>
                <p>✓ Interactive crop selection</p>
                <p>✓ Click-to-plant functionality</p>
                <p>✓ Visual viability feedback (green/warning)</p>
                <p>✓ Reload page to verify persistence!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
