import { useState, useEffect } from 'react'
import { Sprout, Sparkles } from 'lucide-react'
import { GardenBed } from './components/GardenBed'
import { CropLibrary } from './components/CropLibrary'
import { LayoutSelector } from './components/LayoutSelector'
import { LayoutActionModal } from './components/LayoutActionModal'
import { useLayoutManager } from './hooks/useLayoutManager'
import { useProfiles } from './hooks/useProfiles'
import { migrateToLayoutsSchema } from './utils/storageMigration'
import { autoFillBed } from './utils/companionEngine'
import { CORE_50_CROPS } from './data/crops'
import type { Crop } from './types'

function App() {
  // Run migration on app load
  useEffect(() => {
    migrateToLayoutsSchema()
  }, [])

  // Layout management
  const {
    layouts,
    activeLayoutId,
    activeLayout,
    currentBed,
    createLayout,
    switchLayout,
    renameLayout,
    deleteLayout,
    duplicateLayout,
    plantCrop,
    removeCrop,
    clearBed,
  } = useLayoutManager()

  const { getProfile, defaultProfileId } = useProfiles()

  // Get garden profile for active layout (with fallback to default profile)
  const gardenProfile = activeLayout
    ? (getProfile(activeLayout.profileId) || getProfile(defaultProfileId) || null)
    : null

  // UI State
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null)
  const [layoutModalMode, setLayoutModalMode] = useState<'create' | 'rename' | 'delete' | null>(null)
  const [targetLayoutId, setTargetLayoutId] = useState<string | null>(null)

  // Layout action handlers
  const handleCreateLayout = () => {
    setLayoutModalMode('create')
  }

  const handleRenameLayout = (layoutId: string) => {
    setTargetLayoutId(layoutId)
    setLayoutModalMode('rename')
  }

  const handleDuplicateLayout = (layoutId: string) => {
    const layout = layouts[layoutId]
    if (layout) {
      duplicateLayout(layoutId, `${layout.name} (Copy)`)
    }
  }

  const handleDeleteLayout = (layoutId: string) => {
    setTargetLayoutId(layoutId)
    setLayoutModalMode('delete')
  }

  const handleLayoutModalConfirm = (name: string) => {
    if (layoutModalMode === 'create') {
      createLayout(name)
    } else if (layoutModalMode === 'rename' && targetLayoutId) {
      renameLayout(targetLayoutId, name)
    } else if (layoutModalMode === 'delete' && targetLayoutId) {
      deleteLayout(targetLayoutId)
    }
    setLayoutModalMode(null)
    setTargetLayoutId(null)
  }

  const handleLayoutModalClose = () => {
    setLayoutModalMode(null)
    setTargetLayoutId(null)
  }

  // Automagic fill handler
  const handleAutoFill = () => {
    if (!gardenProfile || !activeLayout) {
      // Garden not fully initialized yet, skip silently
      return
    }

    const newBed = autoFillBed(currentBed, CORE_50_CROPS, gardenProfile, new Date())

    // Replace entire bed in one operation to avoid multiple renders
    newBed.forEach((crop, index) => {
      const currentCrop = currentBed[index]
      if (crop && !currentCrop) {
        plantCrop(index, crop)
      }
    })
  }

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
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1" />
            <Sprout className="w-12 h-12 text-leaf-600" />
            <div className="flex-1 flex justify-end items-center gap-3">
              <LayoutSelector
                layouts={layouts}
                activeLayoutId={activeLayoutId}
                onSwitch={switchLayout}
                onCreate={handleCreateLayout}
                onRename={handleRenameLayout}
                onDuplicate={handleDuplicateLayout}
                onDelete={handleDeleteLayout}
              />
              {/* Settings button temporarily disabled - profile editing to be added in future update */}
            </div>
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
              crops={CORE_50_CROPS}
              selectedCrop={selectedCrop}
              onSelectCrop={setSelectedCrop}
            />

            {/* Controls */}
            <div className="mt-4 bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-soil-900 mb-3">
                Controls
              </h3>

              <button
                onClick={handleAutoFill}
                className="w-full bg-leaf-600 hover:bg-leaf-700 text-white font-medium px-4 py-2 rounded transition-colors flex items-center justify-center gap-2 mb-3"
                type="button"
              >
                <Sparkles className="w-4 h-4" />
                Automagic Fill
              </button>

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
                ✓ Feature 003 Complete
              </h3>
              <div className="space-y-2 text-sm text-soil-700">
                <p>✓ Companion planting rules (friends & enemies)</p>
                <p>✓ Automagic solver with constraint satisfaction</p>
                <p>✓ Respects seasonality AND compatibility</p>
                <p>✓ Preserves existing manual plantings</p>
                <p>✓ Click &quot;Automagic Fill&quot; to try it!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Modal - Disabled in Phase 4, will be re-enabled in future update */}
        {/* Profile editing functionality to be added in future enhancement */}

        {/* Layout Action Modal */}
        {layoutModalMode && (
          <LayoutActionModal
            isOpen={true}
            mode={layoutModalMode}
            currentName={targetLayoutId ? layouts[targetLayoutId]?.name : ''}
            onConfirm={handleLayoutModalConfirm}
            onClose={handleLayoutModalClose}
          />
        )}
      </div>
    </div>
  )
}

export default App
