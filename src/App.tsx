import { useEffect, useState } from 'react'
import { Sprout, Settings, Plus } from 'lucide-react'
import { GardenBed } from './components/GardenBed'
import { CropLibrary } from './components/CropLibrary'
import { GardenControls } from './components/GardenControls'
import { GardenInstructions } from './components/GardenInstructions'
import { LayoutSelector } from './components/LayoutSelector'
import { LayoutActionModal } from './components/LayoutActionModal'
import { BoxActionModal, type BoxData, type BoxActionMode } from './components/BoxActionModal'
import { SettingsModal } from './components/SettingsModal'
import { useLayoutManager } from './hooks/useLayoutManager'
import { useLayoutActions } from './hooks/useLayoutActions'
import { useGardenInteractions } from './hooks/useGardenInteractions'
import { useProfiles } from './hooks/useProfiles'
import { migrateToLayoutsSchema, migrateToMultiBoxSchema } from './utils/storageMigration'
import { CORE_50_CROPS } from './data/crops'

function App() {
  // Run migrations on app load
  useEffect(() => {
    // First migrate from legacy schema to layouts (if needed)
    migrateToLayoutsSchema()
    // Then migrate from single-bed to multi-box schema (if needed)
    migrateToMultiBoxSchema()
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
    addBox,
    removeBox,
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

  // Box modal state
  const [isBoxModalOpen, setIsBoxModalOpen] = useState(false)
  const [boxModalMode, setBoxModalMode] = useState<BoxActionMode>('add')
  const [targetBoxId, setTargetBoxId] = useState<string>('')
  const [targetBoxName, setTargetBoxName] = useState<string>('')

  // Box modal handlers
  const handleAddBoxClick = () => {
    setBoxModalMode('add')
    setIsBoxModalOpen(true)
  }

  const handleDeleteBoxClick = (boxId: string, boxName: string) => {
    setTargetBoxId(boxId)
    setTargetBoxName(boxName)
    setBoxModalMode('delete')
    setIsBoxModalOpen(true)
  }

  const handleBoxModalConfirm = (data?: BoxData) => {
    if (boxModalMode === 'add' && data) {
      addBox(data.name, data.width, data.height)
    } else if (boxModalMode === 'delete' && targetBoxId) {
      removeBox(targetBoxId)
    }
    setIsBoxModalOpen(false)
    setTargetBoxId('')
    setTargetBoxName('')
  }

  const handleBoxModalClose = () => {
    setIsBoxModalOpen(false)
    setTargetBoxId('')
    setTargetBoxName('')
  }

  // Calculate total area for all boxes
  const totalArea = activeLayout?.boxes.reduce(
    (sum, box) => sum + box.width * box.height,
    0
  ) ?? 0

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

          {/* Main: Garden Bed(s) */}
          <div className="order-1 lg:order-2 space-y-8">
            {/* Total Area Summary */}
            <div className="bg-white rounded-lg shadow-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-soil-900">
                  {activeLayout?.boxes.length ?? 0} {activeLayout?.boxes.length === 1 ? 'Bed' : 'Beds'}
                </h3>
                <p className="text-sm text-soil-600">
                  Total: {totalArea} sq ft
                </p>
              </div>
              <button
                onClick={handleAddBoxClick}
                className="flex items-center gap-2 px-4 py-2 bg-leaf-600 hover:bg-leaf-700 text-white rounded-lg transition-colors"
                type="button"
              >
                <Plus className="w-5 h-5" />
                Add Bed
              </button>
            </div>

            {/* Garden Beds */}
            {activeLayout?.boxes.map((box, boxIndex) => (
              <GardenBed
                key={box.id}
                squares={box.cells}
                onSquareClick={(cellIndex) => {
                  // For now, only support clicking on first box (backward compatibility)
                  if (boxIndex === 0) {
                    handleSquareClick(cellIndex)
                  }
                }}
                gardenProfile={gardenProfile}
                width={box.width}
                height={box.height}
                bedName={box.name}
                onDelete={() => handleDeleteBoxClick(box.id, box.name)}
                showDelete={activeLayout.boxes.length > 1}
              />
            ))}
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

        {/* Box Action Modal */}
        <BoxActionModal
          isOpen={isBoxModalOpen}
          mode={boxModalMode}
          boxName={targetBoxName}
          onConfirm={handleBoxModalConfirm}
          onClose={handleBoxModalClose}
        />
      </div>
    </div>
  )
}

export default App
