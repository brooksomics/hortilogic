# Feature 008: Multi-Box & Custom Dimensions

## Context
Currently, the app is hardcoded to a single 4'x8' raised bed. Users often have multiple beds of varying sizes (e.g., two 4x8s, or a 4x4 and a 2x10). This feature enables "Garden Layouts" to contain multiple distinct boxes, each with custom dimensions.

## Problem Statement
Currently:
- Each layout assumes a single 4'x8' bed (32 cells in fixed grid)
- Users with multiple beds must create separate layouts for each bed
- No way to manage beds of different sizes (e.g., 2x4 herb bed, 6x3 veggie bed)
- Automagic Fill only works on the single hardcoded bed
- Users cannot model their real garden setup (e.g., "I have three 4x8 beds and one 2x2 herb spiral")

This limits the app's usefulness for real-world gardeners with complex garden setups.

## Requirements

### 1. Data Structure Updates
- Refactor `GardenLayout` interface:
  - Remove `bed: (Crop | null)[]`
  - Add `boxes: GardenBox[]`
- Define `GardenBox` interface:
  - `id`: string (UUID)
  - `name`: string (e.g., "North Bed", "Herb Box")
  - `width`: number (in feet/columns)
  - `height`: number (in feet/rows)
  - `cells`: (Crop | null)[] (length = width * height)

### 2. Box Management UI
- Add "Add Bed" button to the Layout view
- Modal to define box details: Name, Width (ft), Height (ft)
- Ability to delete or rename specific boxes
- Display total garden area summary (e.g., "Total: 64 sq ft across 2 beds")

### 3. Dynamic Rendering
- Update `GardenBed` component to accept `width` and `height` props instead of assuming 4x8
- Render CSS Grid dynamically based on these props (`grid-template-columns: repeat(width, 1fr)`)
- Render list of `GardenBed` components, one for each box in the layout
- Display box name/dimensions above each rendered bed

### 4. Updated Automagic Solver
- Update `autoFillBed` to accept dimensions (cols/rows) for accurate neighbor calculation
- Solver iterates through *all* boxes in the layout, filling them according to the same companion rules
- Performance check: ensure 3+ boxes doesn't cause UI freeze
- (Future) Crop rotation balancing across boxes

## Migration Strategy
- Convert existing layouts automatically on first load:
  - Create a single `GardenBox` (4x8) named "Main Bed"
  - Copy existing `bed` array data to this box's `cells`
  - Remove old `bed` property
- Migration runs once per user via `storageMigration.ts` (version bump)

## Acceptance Criteria
1. User can click "Add Bed" and create a new bed with custom dimensions (e.g., 2x4 or 6x3)
2. Multiple beds display as separate grids on the screen
3. Each bed can be renamed or deleted independently
4. Automagic Fill operates on all beds in the current layout
5. Existing user data migrates seamlessly without data loss
6. Total garden area displays correctly (sum of all bed areas)
7. Beds with different dimensions render with correct grid layouts

## Implementation Notes
- **Priority**: MEDIUM - Significant feature, but not blocking core functionality
- **Dependencies**:
  - Requires F005 (Layout Management) complete ✅
  - Enhances F003 (Automagic Solver) - solver now works across multiple beds
- **Estimated Complexity**: LARGE (L) - Significant refactor of data model and UI

## Test Cases
| Scenario | Input | Expected Output |
|----------|-------|-----------------|
| Add new bed | Click "Add Bed", enter "Herb Box" (2x4) | New 2x4 grid appears below existing bed |
| Delete bed | Click delete on "Herb Box" | Bed removed, data deleted |
| Rename bed | Edit "Main Bed" to "North Veggie" | Name updates in UI |
| Automagic Fill multi-bed | 2 empty beds (4x8, 2x4) | Both beds fill with valid companion crops |
| Migration from old schema | Load app with legacy single-bed data | Data appears in "Main Bed" box, no data loss |
| Custom dimensions | Create 3x3 bed | Grid renders correctly (9 cells in 3-column layout) |
| Total area calculation | 4x8 + 2x4 beds | Displays "Total: 40 sq ft across 2 beds" |
| Dynamic neighbor calc | Plant crops in 2x10 bed | Companion logic uses correct row width (2) |

## Architecture Considerations
- **Data Model Changes**:
  - New `GardenBox` interface in `src/types/index.ts`
  - Update `GardenLayout` to use `boxes: GardenBox[]`
  - Migration function in `src/utils/storageMigration.ts`
- **Component Updates**:
  - `GardenBed.tsx`: Accept `width` and `height` props, dynamic grid rendering
  - `App.tsx`: Render multiple `GardenBed` components in list
  - New `BoxManager.tsx`: UI for adding/deleting/renaming beds
- **Utility Updates**:
  - `companionEngine.ts`: Accept dimensions for neighbor calculation
  - `useLayoutManager.ts`: Add methods for box CRUD operations
  - Helper: `createEmptyBox(name, width, height): GardenBox`
- **Accessibility**:
  - Each bed landmark with accessible name
  - Add/delete actions keyboard accessible
  - Screen reader announces bed count and dimensions

## Design Decisions
- **Bed Dimension Constraints**:
  - MVP: Allow 1-12 ft width, 1-12 ft height (prevents absurdly large grids)
  - Future: Could add validation for max total cells (e.g., 200 cells across all beds)
- **Bed Ordering**:
  - MVP: Beds displayed in creation order (top to bottom)
  - Future: Drag-and-drop reordering, or spatial layout mode (2D positioning)
- **Crop Movement Between Beds**:
  - MVP: No drag-and-drop between beds (can only plant/clear within a bed)
  - Future: Enable moving crops between beds
- **Automagic Fill Strategy**:
  - MVP: Fill all beds in sequence (bed 1, then bed 2, etc.)
  - Future: Optimize across beds (e.g., put tall crops in north bed)

## Future Enhancements (Out of Scope)
- Drag-and-drop to move crops between beds
- Visual garden map (2D spatial layout of beds)
- Per-bed profiles (e.g., "Shady bed" vs "Full sun bed")
- Bed templates (quick-add common sizes: 4x8, 4x4, etc.)
- Import bed layout from image/drawing
- 3D garden visualization
- Crop rotation recommendations across beds (e.g., "Move tomatoes to Bed 2 next year")
- Bed-level notes/tags (e.g., "Needs compost", "Gets afternoon shade")

## Success Metrics
- User can model their real garden setup (multiple beds of varying sizes)
- Automagic Fill works seamlessly across all beds
- Migration completes without user intervention or data loss
- Reduced feature requests for "multiple bed support"
- Positive feedback: "Finally! I can plan my whole garden in one layout!"
