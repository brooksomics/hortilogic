import { useEffect } from 'react'
import { Sprout, Settings } from 'lucide-react'
import { GardenBed } from './components/GardenBed'
import { CropLibrary } from './components/CropLibrary'
import { GardenControls } from './components/GardenControls'
import { GardenInstructions } from './components/GardenInstructions'
import { LayoutSelector } from './components/LayoutSelector'
import { LayoutActionModal } from './components/LayoutActionModal'
import { SettingsModal } from './components/SettingsModal'
import { useLayoutManager } from './hooks/useLayoutManager'
import { useLayoutActions } from './hooks/useLayoutActions'
import { useGardenInteractions } from './hooks/useGardenInteractions'
import { useProfiles } from './hooks/useProfiles'
import { migrateToLayoutsSchema } from './utils/storageMigration'
import { CORE_50_CROPS } from './data/crops'

function App() {
  // Run migration on app load
  useEffect(() => {
    migrateToLayoutsSchema()
  }, [])

  // Profile management (must come before layout management to avoid Split Brain bug)
  const { getProfile, updateProfile, defaultProfileId } = useProfiles()

  // Layout management
  const layoutManager = useLayoutManager(defaultProfileId)
  const {
    layouts,
    activeLayoutId,
    activeLayout,
    currentBed,
    switchLayout,
    plantCrop,
    removeCrop,
    clearBed,
    setBed,
  } = layoutManager

  const {
    layoutModalMode,
    targetLayoutId,
    handleCreateLayout,
    handleRenameLayout,
    handleDuplicateLayout,
    handleDeleteLayout,
    handleLayoutModalConfirm,
    handleLayoutModalClose,
  } = useLayoutActions(layoutManager)

  // Get garden profile for active layout (with fallback to default profile)
  const gardenProfile = activeLayout
    ? (getProfile(activeLayout.profileId) || getProfile(defaultProfileId) || null)
    : null

  // Garden interactions
  const {
    selectedCrop,
    setSelectedCrop,
    isSettingsOpen,
    handleAutoFill,
    handleSquareClick,
    handleSettingsSave,
    handleSettingsClose,
    openSettings,
  } = useGardenInteractions({
    currentBed,
    gardenProfile,
    activeLayout,
    setBed,
    plantCrop,
    removeCrop,
    updateProfile,
  })

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
              <button
                onClick={openSettings}
                className="p-2 rounded-lg hover:bg-leaf-100 transition-colors"
                title="Settings"
                type="button"
              >
                <Settings className="w-5 h-5 text-soil-700" />
              </button>
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
              currentProfile={gardenProfile}
            />
            <GardenControls
              onAutoFill={handleAutoFill}
              onClearBed={clearBed}
              gardenProfile={gardenProfile}
            />
          </div>

          {/* Main: Garden Bed */}
          <div className="order-1 lg:order-2">
            <GardenBed
              squares={currentBed}
              onSquareClick={handleSquareClick}
              gardenProfile={gardenProfile}
            />
            <GardenInstructions selectedCrop={selectedCrop} />

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

        {/* Settings Modal */}
        {gardenProfile && (
          <SettingsModal
            isOpen={isSettingsOpen}
            profile={gardenProfile}
            onSave={handleSettingsSave}
            onClose={handleSettingsClose}
          />
        )}

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
