# Code Capability Index

**Purpose:** Prevent semantic duplication by cataloging what the codebase CAN DO.

**Before creating any new function, CHECK HERE FIRST.**

Last updated: 2026-01-10 (TODO-018 complete - Multi-Box Automagic Fill)

---

## Date & Time Calculations

| Function | Location | Purpose |
|----------|----------|---------|
| `getLastFrostDate()` | utils/dateEngine.ts:5 | Calculate last spring frost date from USDA zone |
| `getFirstFrostDate()` | utils/dateEngine.ts:17 | Calculate first fall frost date from USDA zone |
| `getViabilityWindow()` | utils/dateEngine.ts:29 | Get planting window dates for a crop |
| `isCropViable()` | utils/dateEngine.ts:44 | Check if crop can be planted on target date |

**Key Concepts:**
- Frost dates calculated from USDA hardiness zones
- Planting windows relative to last frost date (weeks offset)
- Viability checking considers seasonality

---

## Companion Planting & Constraints

| Function | Location | Purpose |
|----------|----------|---------|
| `getNeighbors()` | utils/companionEngine.ts:13 | Get crops in 4 adjacent cells (Up/Down/Left/Right) with dynamic grid dimensions |
| `checkCompanionConstraints()` | utils/companionEngine.ts:65 | Check if crop compatible with neighbor crop IDs |
| `autoFillBed()` | utils/companionEngine.ts:103 | Constraint satisfaction solver for garden bed with custom dimensions |

**Key Concepts:**
- Companion rules: friends (beneficial) and enemies (incompatible)
- Neighbor checking: 4-directional adjacency only (not diagonals)
- **Dynamic dimensions**: Supports variable grid sizes (e.g., 4x8, 2x4, 3x3)
- Constraint satisfaction: respects both viability AND compatibility
- Preserves existing manual plantings
- **Deterministic (TODO-023)**: Uses seeded RNG based on layout.id for reproducible results

---

## Deterministic Random Number Generation (TODO-023)

| Class/Function | Location | Purpose |
|----------------|----------|---------|
| `SeededRandom` | utils/seededRandom.ts:14 | Deterministic RNG using Linear Congruential Generator (LCG) |
| `next()` | utils/seededRandom.ts:48 | Generate next random number (0-1) |
| `shuffle()` | utils/seededRandom.ts:59 | Fisher-Yates shuffle with seeded randomness |
| `choice()` | utils/seededRandom.ts:72 | Select random element from array |
| `randInt()` | utils/seededRandom.ts:83 | Generate random integer in range |

**Key Concepts:**
- **Determinism**: Same seed always produces same sequence of random numbers
- **Reproducibility**: Clicking "Automagic Fill" multiple times on same layout produces identical results
- **Debuggability**: Bugs in solver are reproducible with same layout ID
- **User trust**: Users can rely on consistent behavior
- **Seed source**: All solver functions use `activeLayout.id` as seed

**Usage:**
```typescript
// Create RNG with seed
const rng = new SeededRandom('my-seed')

// Generate random numbers
const value = rng.next() // 0.123...

// Shuffle array deterministically
const shuffled = rng.shuffle([1, 2, 3, 4, 5])

// Pick random element
const choice = rng.choice(['a', 'b', 'c'])
```

**Solver Integration:**
- `autoFillBed()` - Uses layout.id as seed for crop shuffling
- `autoFillFromStash()` - Uses layout.id for tie-breaking in cell selection
- `autoFillGaps()` - Uses layout.id for tie-breaking in gap filling
- `autoFillAllBoxes()` - Passes layout.id to autoFillFromStash

**Benefits:**
1. Same empty bed + same seed → same autofill result every time
2. Different seeds → different layouts (variety)
3. Reproducible bugs and test cases
4. No unexpected layout shifts when clicking "Fill" again

---

## Layout Management (Feature 005 + Feature 008)

| Function | Location | Purpose |
|----------|----------|---------|
| `useLayoutManager()` | hooks/useLayoutManager.ts | Manage multiple garden layouts with CRUD operations |
| `useProfiles()` | hooks/useProfiles.ts | Access garden profiles (zones, frost dates) |
| `migrateToLayoutsSchema()` | utils/storageMigration.ts:79 | Migrate from single to multi-layout storage schema |
| `migrateToMultiBoxSchema()` | utils/storageMigration.ts:175 | Migrate from single-bed to multi-box storage schema |
| `createLayout()` | hooks/useLayoutManager.ts:121 | Create new blank layout and switch to it |
| `switchLayout()` | hooks/useLayoutManager.ts:129 | Switch active layout |
| `renameLayout()` | hooks/useLayoutManager.ts:154 | Rename existing layout |
| `deleteLayout()` | hooks/useLayoutManager.ts:170 | Delete layout (prevents deleting last one) |
| `duplicateLayout()` | hooks/useLayoutManager.ts:200 | Copy layout with all box data |
| `addBox()` | hooks/useLayoutManager.ts:315 | Add a new garden box to active layout |
| `removeBox()` | hooks/useLayoutManager.ts:339 | Remove a box from active layout (prevents removing last box) |
| `setAllBoxes()` | hooks/useLayoutManager.ts:303 | Update all boxes in active layout (for multi-box batch operations) |

**Key Concepts:**
- Multiple layouts per user (e.g., "Spring 2026", "Fall 2026")
- **Multi-box support**: Each layout can contain multiple garden boxes of varying sizes
- Each box has: id, name, width (columns), height (rows), and cells array
- Default box: "Main Bed" (8x4 = 32 cells)
- **Multi-box operations**: Automagic Fill processes ALL boxes in parallel with correct dimensions
- Profiles shared across layouts (same location, different seasons)
- Migration chain: Legacy → Multi-layout (v1) → Multi-box (v2)
- LocalStorage keys: `hortilogic:layouts` (v2), `hortilogic:profiles`
- Version numbers enable future schema migrations

---

## Garden State Management

| Function | Location | Purpose |
|----------|----------|---------|
| `useGarden()` | hooks/useGarden.ts | Main garden state hook with LocalStorage persistence |
| `plantCrop()` | hooks/useGarden.ts:31 | Plant a crop at specific cell index |
| `removeCrop()` | hooks/useGarden.ts:49 | Remove crop from cell |
| `clearBed()` | hooks/useGarden.ts:67 | Clear all crops from bed |
| `setGardenProfile()` | hooks/useGarden.ts:75 | Update garden profile (zone, frost dates) |
| `autoFill()` | hooks/useGarden.ts:92 | Auto-fill empty cells with viable crops |
| `useLocalStorage()` | hooks/useLocalStorage.ts | Generic LocalStorage persistence hook |

**Key Concepts:**
- State persisted to LocalStorage under "hortilogic-garden" key
- Garden profile: USDA zone, frost dates
- Garden bed: 32 cells (4×8 grid), 1 sq ft each
- Cells can be null (empty) or contain Crop object

---

## React Context Architecture (TODO-022)

| Context/Hook | Location | Purpose |
|--------------|----------|---------|
| `GardenProvider` | context/GardenContext.tsx | Root provider wrapping entire app with garden state |
| `useGardenContext()` | context/GardenContext.tsx:233 | Hook to access all garden state and actions |
| `GardenContextValue` | context/GardenContext.tsx:20 | TypeScript interface for context value |

**Key Concepts:**
- **Eliminates prop drilling**: Components access state directly via context instead of receiving props from App.tsx
- **Centralized state**: All hooks (useLayoutManager, useGardenInteractions, useProfiles) managed in GardenProvider
- **Single source of truth**: Context provides unified interface to all garden functionality
- **Simplified App.tsx**: Reduced from ~295 lines with complex hook orchestration to 257 lines of clean UI logic

**Context Value Sections:**
1. **Profile Management**: getProfile, updateProfile, defaultProfileId
2. **Layout Management**: layouts, activeLayout, switchLayout, plantCrop, removeCrop, clearBed, setAllBoxes, addBox, removeBox
3. **Layout Actions**: Modal state and handlers for create/rename/duplicate/delete
4. **Garden Interactions**: selectedCrop, handleAutoFill, handleSquareClick, settings modal state
5. **Stash Management**: stash CRUD, distribution, placement results, undo/redo
6. **History**: undo, canUndo

**Usage Pattern:**
```typescript
// Before (App.tsx with prop drilling)
const layoutManager = useLayoutManager(defaultProfileId)
const { activeLayout, plantCrop, removeCrop } = layoutManager
const interactions = useGardenInteractions({ activeLayout, plantCrop, ... })
// Pass props to children...

// After (components access context directly)
function MyComponent() {
  const { activeLayout, plantCrop, removeCrop } = useGardenContext()
  // Use directly, no props needed
}
```

**Testing:**
- Wrap test components in `<GardenProvider>` for integration tests
- See `App.test.tsx` and `SettingsModal.splitbrain.test.tsx` for examples

---

## UI Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `App` | App.tsx | Main application with layout management and multi-box rendering |
| `GardenBed` | components/GardenBed.tsx | Dynamic grid display with variable dimensions (e.g., 2x4, 4x8, 3x3) |
| `CropLibrary` | components/CropLibrary.tsx | Crop selection sidebar with search and viability filtering |
| `LayoutSelector` | components/LayoutSelector.tsx | Dropdown for switching/managing layouts |
| `LayoutActionModal` | components/LayoutActionModal.tsx | Modal for create/rename/delete layout actions |
| `BoxActionModal` | components/BoxActionModal.tsx | Modal for add/delete garden box actions |
| `SettingsModal` | components/SettingsModal.tsx | Garden profile settings editor |

**Component Responsibilities:**
- **App**: Multi-box rendering, consumes GardenContext for all state/actions, box modal management, renders layout selector and settings
- **GardenBed**: Dynamic grid rendering with custom width/height, click handlers, viability colors, accessibility labels, delete button
- **CropLibrary**: Crop list, search filtering, crop count display, selection UI
- **LayoutSelector**: Layout dropdown, CRUD action buttons, sorting
- **LayoutActionModal**: Reusable modal for layout operations (3 modes: create/rename/delete)
- **BoxActionModal**: Reusable modal for box operations (2 modes: add/delete)
- **SettingsModal**: Profile editing (currently disabled, to be re-enabled)

**UI Patterns:**
- Semantic color tokens: `leaf-*` (green), `soil-*` (brown), `frost-*` (blue)
- Lucide React icons: Sprout, Sparkles
- Tailwind utility classes
- Accessible labels on all interactive elements

---

## Type Definitions

| Type | Location | Purpose |
|------|----------|---------|
| `Crop` | types/garden.ts:36 | Crop definition with spacing, planting strategy, companions |
| `PlantingStrategy` | types/garden.ts:22 | Planting window (weeks relative to frost date) |
| `CompanionRules` | types/garden.ts:10 | Friends and enemies for companion planting |
| `GardenProfile` | types/garden.ts:53 | USDA zone and frost dates |
| `GardenLayout` | types/garden.ts:77 | Layout with ID, name, bed, timestamps, profileId |
| `LayoutStorage` | types/garden.ts:88 | Multi-layout storage schema (version 1) |
| `ProfileStorage` | types/garden.ts:95 | Profile storage schema (version 1) |
| `LegacyGardenState` | types/garden.ts:102 | Old single-layout schema (for migration) |

**Type Relationships:**
```
ProfileStorage → Record<string, GardenProfile>
LayoutStorage → Record<string, GardenLayout>
GardenLayout → references GardenProfile by ID
GardenLayout.bed → array of (Crop | null)[32]
Migration: LegacyGardenState → LayoutStorage + ProfileStorage
```

---

## Crop Database (TODO-006)

| Data | Location | Purpose |
|------|----------|---------|
| `CORE_50_CROPS` | data/crops.ts | 50 common garden crops with companion rules |
| `CROPS_BY_ID` | data/crops.ts | Lookup object for quick crop retrieval by ID |

**Core 50 Crop Database:**
- 10 Leafy Greens (Lettuce, Spinach, Kale, Arugula, etc.)
- 6 Nightshades (Tomato, Cherry Tomato, Pepper, Eggplant, etc.)
- 8 Brassicas (Broccoli, Cauliflower, Cabbage, etc.)
- 6 Legumes (Peas, Green Beans, Fava Beans, etc.)
- 8 Root Vegetables (Carrot, Beet, Onion, Garlic, etc.)
- 6 Cucurbits (Cucumber, Zucchini, Pumpkin, etc.)
- 6 Herbs (Basil, Cilantro, Parsley, Dill, etc.)

**Data Sources:**
- University Extension Companion Planting Guides
- "Carrots Love Tomatoes" by Louise Riotte
- Mother Earth News Companion Planting Chart

**Search & Filter Capabilities:**
- Text search by crop name (case-insensitive)
- Crop count display (e.g., "23 of 50 crops")
- Clear search button

---

## Search Patterns

**To find existing capabilities, search for:**

| What You Need | Search For |
|---------------|------------|
| Date calculations | `getLastFrostDate`, `getViabilityWindow` |
| Viability checking | `isCropViable` |
| Neighbor logic | `getNeighbors`, `isCompatibleWithNeighbors` |
| Constraint solving | `autoFillBed` |
| Layout management | `useLayoutManager`, `createLayout`, `switchLayout` |
| Profile management | `useProfiles`, `getProfile` |
| State management | `useGarden`, `useLocalStorage` |
| Migration | `migrateToLayoutsSchema` |
| Planting actions | `plantCrop`, `removeCrop`, `clearBed` |
| Crop database | `CORE_50_CROPS`, `CROPS_BY_ID` |
| Crop search/filtering | `CropLibrary` (search state), `filteredCrops` |
| UI rendering | `GardenBed`, `CropLibrary`, `LayoutSelector` |

---

## Adding New Capabilities

**Before creating new functions:**

1. ✓ Read this index
2. ✓ Search with Grep for similar keywords
3. ✓ Check if existing function can be extended
4. ✓ Only create new if nothing suitable exists
5. ✓ Update this index after creating

**Example workflow:**
```
User: "Add crop rotation validation"

Claude:
1. Check CODE_INDEX.md → search "rotation" → not found
2. Grep for "rotation" → no results
3. Check if autoFillBed can be extended → no, different concern
4. Create new rotationEngine.ts
5. Update CODE_INDEX.md with new capability
```

---

## Anti-Patterns (Don't Do This)

- ❌ Creating `validateCropCompatibility()` when `isCompatibleWithNeighbors()` exists
- ❌ Creating `getFrostDateForZone()` when `getLastFrostDate()` exists
- ❌ Creating `checkIfPlantable()` when `isCropViable()` exists
- ❌ Creating new state hook when `useGarden()` covers it

**When in doubt:** Search first, extend second, create last.

---

## Maintenance

**Update this index when:**
- Adding new utility functions
- Creating new engines/modules
- Adding new hooks
- Major refactoring changes function names/locations

**Frequency:** Every feature completion or major change.
