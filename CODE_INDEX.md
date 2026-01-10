# Code Capability Index

**Purpose:** Prevent semantic duplication by cataloging what the codebase CAN DO.

**Before creating any new function, CHECK HERE FIRST.**

Last updated: 2026-01-10 (TODO-016 complete - Multi-Box Dynamic Rendering)

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
| `renameLayout()` | hooks/useLayoutManager.ts:141 | Rename existing layout |
| `deleteLayout()` | hooks/useLayoutManager.ts:157 | Delete layout (prevents deleting last one) |
| `duplicateLayout()` | hooks/useLayoutManager.ts:194 | Copy layout with all box data |

**Key Concepts:**
- Multiple layouts per user (e.g., "Spring 2026", "Fall 2026")
- **Multi-box support**: Each layout can contain multiple garden boxes of varying sizes
- Each box has: id, name, width (columns), height (rows), and cells array
- Default box: "Main Bed" (8x4 = 32 cells)
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

## UI Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `App` | App.tsx | Main application with layout management and multi-box rendering |
| `GardenBed` | components/GardenBed.tsx | Dynamic grid display with variable dimensions (e.g., 2x4, 4x8, 3x3) |
| `CropLibrary` | components/CropLibrary.tsx | Crop selection sidebar with search and viability filtering |
| `LayoutSelector` | components/LayoutSelector.tsx | Dropdown for switching/managing layouts |
| `LayoutActionModal` | components/LayoutActionModal.tsx | Modal for create/rename/delete layout actions |
| `SettingsModal` | components/SettingsModal.tsx | Garden profile settings editor |

**Component Responsibilities:**
- **App**: Multi-box rendering, layout management integration, state coordination, migrations, Core 50 crop database
- **GardenBed**: Dynamic grid rendering with custom width/height, click handlers, viability colors, accessibility labels
- **CropLibrary**: Crop list, search filtering, crop count display, selection UI
- **LayoutSelector**: Layout dropdown, CRUD action buttons, sorting
- **LayoutActionModal**: Reusable modal for layout operations (3 modes)
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
