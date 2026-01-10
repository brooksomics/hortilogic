# Code Capability Index

**Purpose:** Prevent semantic duplication by cataloging what the codebase CAN DO.

**Before creating any new function, CHECK HERE FIRST.**

Last updated: 2026-01-09 (Feature 003 complete)

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
| `getNeighbors()` | utils/companionEngine.ts:5 | Get crops in 4 adjacent cells (Up/Down/Left/Right) |
| `isCompatibleWithNeighbors()` | utils/companionEngine.ts:27 | Check if crop compatible with adjacent crops |
| `autoFillBed()` | utils/companionEngine.ts:57 | Constraint satisfaction solver for garden bed |

**Key Concepts:**
- Companion rules: friends (beneficial) and enemies (incompatible)
- Neighbor checking: 4-directional adjacency only (not diagonals)
- Constraint satisfaction: respects both viability AND compatibility
- Preserves existing manual plantings

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
| `App` | App.tsx | Main application with sidebar and grid layout |
| `GardenBed` | components/GardenBed.tsx | 4×8 interactive grid display |
| `CropLibrary` | components/CropLibrary.tsx | Crop selection sidebar with viability indicators |

**Component Responsibilities:**
- **App**: Layout, state management, sample crop data
- **GardenBed**: Grid rendering, click handlers, viability colors
- **CropLibrary**: Crop list, selection UI, viability badges

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
| `GardenBed` | types/garden.ts:67 | Array of 32 cells (Crop or null) |

**Type Relationships:**
```
GardenProfile → used to calculate viability
Crop → contains PlantingStrategy + CompanionRules
GardenBed → array of (Crop | null)
```

---

## Sample Data

| Data | Location | Purpose |
|------|----------|---------|
| `sampleCrops` | App.tsx:9 | 5 example crops with companion rules |
| `defaultProfile` | App.tsx:46 | Zone 9b (San Francisco) profile |

**Sample Crops Included:**
- Lettuce, Tomato, Carrot, Peas, Radish
- Each has companions (friends/enemies)
- Seasonality varies (early spring to summer)

---

## Search Patterns

**To find existing capabilities, search for:**

| What You Need | Search For |
|---------------|------------|
| Date calculations | `getLastFrostDate`, `getViabilityWindow` |
| Viability checking | `isCropViable` |
| Neighbor logic | `getNeighbors`, `isCompatibleWithNeighbors` |
| Constraint solving | `autoFillBed` |
| State management | `useGarden`, `useLocalStorage` |
| Planting actions | `plantCrop`, `removeCrop`, `clearBed` |
| UI rendering | `GardenBed`, `CropLibrary` |

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
