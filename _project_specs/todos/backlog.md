# Backlog

Future work, prioritized. Move to active.md when starting.

---

<!-- TODO-012 moved to active.md (2026-01-10) -->
<!-- TODO-011 moved to active.md (2026-01-10) -->

---

## [TODO-019] Garden Stash State Management (Planning Cart)

**Status:** pending
**Priority:** high
**Estimate:** M

### Description
Implement a "Garden Stash" (or "Planning Cart") concept to solve the quantity problem. Instead of users clicking crops to immediately place them, they specify *what* they want and *how many* before deciding *where* they go. This transforms the app from a "random filler" tool to an "intelligent layout assistant" by allowing users to build a wish list that the solver distributes optimally.

**Solving the Quantity Hiccup:**
- Current: User clicks "Tomato" once → solver places 1 sq ft
- Problem: User wants 4 tomato plants (4 sq ft) but can only specify 1 at a time
- Solution: User adds "4x Tomato" to Stash → solver places all 4 intelligently

### Acceptance Criteria
- [ ] Add `stash` state to `useGardenInteractions` hook as `Record<string, number>` (crop ID → quantity)
- [ ] Update `CropLibrary` component to show quantity steppers (+/- buttons) instead of single-click selection
- [ ] Add "Stash Summary" panel/footer showing:
  - Each crop in stash with quantity (e.g., "4x Tomato", "8x Carrot")
  - Total area calculation (e.g., "Total: 12 / 32 sq ft used")
  - Clear/Reset button
- [ ] Persist stash to LocalStorage (survive page refresh)
- [ ] Add visual feedback when adding/removing from stash
- [ ] Disable "+" button when stash total exceeds available bed space
- [ ] Add unit tests for stash state management (add, remove, clear, total calculation)

### Validation
- Manual: Click "+" on Tomato 4 times, verify "4x Tomato" shows in summary
- Manual: Verify total area updates correctly (4 tomatoes = 4 sq ft)
- Manual: Refresh page, verify stash persists
- Manual: Try adding 50 crops to 32 sq ft bed, verify "+" disables when full
- Automated: Unit tests for stash operations with ≥80% coverage

### Test Cases
| Input | Expected Output | Notes |
|-------|-----------------|-------|
| Click "+" on Tomato 4 times | Stash shows "4x Tomato" | Add to stash |
| Click "-" on Tomato (from 4) | Stash shows "3x Tomato" | Remove from stash |
| Click "-" until 0 | Crop removed from stash list | Auto-cleanup |
| Add 4 Tomato + 8 Carrot | Total shows "12 / 32 sq ft" | Area calculation |
| Refresh page with stash data | Stash persists from LocalStorage | Persistence |
| Stash total = 32, bed size = 32 | "+" buttons disabled | Overflow prevention |
| Click "Clear Stash" button | All crops removed, total = 0 | Reset functionality |
| useGardenInteractions.addToStash("tomato", 3) | stash["tomato"] === 3 | Hook API |
| useGardenInteractions.removeFromStash("tomato") | stash["tomato"] === undefined | Hook API |
| calculateStashTotal(stash, cropDB) | Returns sum of (quantity * sqft) | Helper function |

### Dependencies
- Depends on: F002 (Interactive Garden Bed) complete ✅
- Depends on: F005 (Layout Management) complete ✅
- Blocks: TODO-020 (Priority Solver needs stash data)
- Related: F003 (Automagic Fill) - replaces current random fill logic

### TDD Execution Log
| Phase | Command | Result | Timestamp |
|-------|---------|--------|-----------||
| RED | - | - | - |
| GREEN | - | - | - |
| VALIDATE | - | - | - |
| COMPLETE | - | - | - |

### Technical Notes
**State Structure:**
```typescript
interface GardenStash {
  [cropId: string]: number; // e.g., {"tomato": 4, "carrot": 8}
}

interface StashHook {
  stash: GardenStash;
  addToStash: (cropId: string, amount?: number) => void; // default +1
  removeFromStash: (cropId: string, amount?: number) => void; // default -1
  clearStash: () => void;
  getTotalArea: () => number;
  canAddCrop: (cropId: string) => boolean; // check if space available
}
```

**LocalStorage Persistence:**
- Key: `hortilogic_stash_${layoutId}` (stash is per-layout)
- Auto-save on every stash mutation
- Clear stash when switching layouts or deleting layouts

**UI Component Hierarchy:**
```
App.tsx
├── CropLibrary.tsx (updated with +/- steppers)
└── StashSummary.tsx (new component)
    ├── StashItem.tsx (each crop row)
    └── StashTotals.tsx (area calculation, Clear button)
```

**Area Calculation Logic:**
```typescript
function calculateStashTotal(stash: GardenStash, crops: Crop[]): number {
  return Object.entries(stash).reduce((total, [cropId, qty]) => {
    const crop = crops.find(c => c.id === cropId);
    return total + (crop ? qty * crop.sqftPerPlant : 0);
  }, 0);
}
```

**Overflow Prevention:**
- Get current bed total area: `width * height` (for each box in multi-box layouts)
- Before adding to stash, check: `currentStashTotal + cropSqft <= totalBedArea`
- Show visual warning if user tries to exceed capacity

**Accessibility:**
- Stepper buttons must have aria-labels: "Add tomato to stash", "Remove tomato from stash"
- Stash summary must announce changes to screen readers

**Estimated effort:** 90-120 minutes

---

## [TODO-020] Priority Solver Logic (Smart Placement Engine)

**Status:** pending
**Priority:** high
**Estimate:** L

### Description
Refactor the `autoFillBed` function to accept a prioritized stash list instead of randomly selecting crops. Implement a "Best Fit" algorithm that places each crop in the location with the highest neighbor compatibility score. This transforms the solver from random chaos to intelligent layout design based on companion planting principles.

**Current Behavior:**
- Solver picks random crops from library
- No consideration of user preferences
- Places crops randomly in empty cells

**New Behavior:**
- Solver uses user's stash as the wishlist
- Sorts crops by "difficulty" (large/picky crops first)
- Places each crop in the spot with max friendly neighbors and zero enemy conflicts

### Acceptance Criteria
- [ ] Refactor `autoFillBed` to accept `stash: GardenStash` parameter
- [ ] Implement crop priority sorting: sort by constraint difficulty (large/picky crops first)
- [ ] Implement "Best Fit" placement algorithm:
  - For each crop in priority order, scan all empty cells
  - Score each cell by neighbor compatibility (friends = +1, enemies = -1000, neutral = 0)
  - Place crop in highest-scoring valid cell
  - Skip crop if no valid placement found (all spots have enemy neighbors)
- [ ] Handle multi-box layouts (iterate through all boxes)
- [ ] Return placement report: `{placed: CropPlacement[], failed: {cropId: string, reason: string}[]}`
- [ ] Add comprehensive unit tests for priority sorting and scoring logic
- [ ] Performance: algorithm must complete in <2 seconds for 100-cell garden

### Validation
- Manual: Add 4 Tomato to stash, click "Distribute Stash", verify all 4 placed near basil/carrots (friends)
- Manual: Add 10 crops with complex constraints, verify no enemies placed adjacent
- Manual: Fill stash with 50 crops for 32-cell bed, verify solver places 32 and reports 18 failed
- Automated: Unit tests for scoring, sorting, and placement with ≥80% coverage

### Test Cases
| Input | Expected Output | Notes |
|-------|-----------------|-------|
| Stash: 4x Tomato, empty 4x8 bed | All 4 tomatoes placed | Basic placement |
| Stash: 2x Tomato, 2x Basil | Basil placed adjacent to tomatoes (friends) | Companion placement |
| Stash: 2x Tomato, 2x Brassica | No adjacent placement (enemies) | Enemy avoidance |
| Stash: 50 crops, 32 cells | 32 placed, 18 in failedPlacements | Overflow handling |
| sortByPriority([lettuce, tomato, carrot]) | [tomato, lettuce, carrot] | Priority sort (large first) |
| scoreCell(index, "tomato", bed) | Number (friends +1, enemies -1000) | Scoring algorithm |
| Empty bed, stash with only crops that hate each other | Some placed far apart, some failed | Complex constraint solving |
| Multi-box: 3 boxes with different sizes | Crops distributed across all boxes | Multi-box support |
| Performance: 100-cell bed, 100 crops | Completes in <2 seconds | Performance requirement |

### Dependencies
- Depends on: TODO-019 (Stash state) complete
- Depends on: Existing companion plant data (`src/utils/companionEngine.ts`)
- Blocks: TODO-021 (Integration layer needs this solver)
- Related: F003 (Automagic Fill) - replaces current implementation

### TDD Execution Log
| Phase | Command | Result | Timestamp |
|-------|---------|--------|-----------||
| RED | - | - | - |
| GREEN | - | - | - |
| VALIDATE | - | - | - |
| COMPLETE | - | - | - |

### Technical Notes
**Algorithm Pseudocode:**
```typescript
function autoFillFromStash(
  bed: GardenCell[],
  stash: GardenStash,
  crops: Crop[],
  width: number
): PlacementResult {
  const priorityList = sortByPriority(stash, crops);
  const placed: CropPlacement[] = [];
  const failed: FailedPlacement[] = [];

  for (const {cropId, quantity} of priorityList) {
    for (let i = 0; i < quantity; i++) {
      const bestCell = findBestCell(bed, cropId, width);

      if (bestCell !== null) {
        bed[bestCell] = cropId;
        placed.push({cropId, cellIndex: bestCell});
      } else {
        failed.push({cropId, reason: "No valid placement (all spots blocked by enemies)"});
      }
    }
  }

  return {placed, failed};
}

function sortByPriority(stash: GardenStash, crops: Crop[]): PriorityCrop[] {
  // Priority factors:
  // 1. Crops with more enemies (harder to place)
  // 2. Larger crops (sqftPerPlant > 1)
  // 3. Crops with specific requirements (e.g., needs trellis)
  return Object.entries(stash)
    .map(([cropId, qty]) => ({cropId, qty, crop: crops.find(c => c.id === cropId)!}))
    .sort((a, b) => {
      const aScore = calculateDifficulty(a.crop);
      const bScore = calculateDifficulty(b.crop);
      return bScore - aScore; // Higher difficulty first
    });
}

function calculateDifficulty(crop: Crop): number {
  let score = 0;
  score += crop.enemies.length * 10; // More enemies = harder to place
  score += crop.sqftPerPlant > 1 ? 5 : 0; // Large crops harder
  score += crop.friends.length === 0 ? 3 : 0; // No friends = fewer good spots
  return score;
}

function findBestCell(bed: GardenCell[], cropId: string, width: number): number | null {
  const emptyCells = bed
    .map((cell, index) => cell === null ? index : null)
    .filter(index => index !== null) as number[];

  if (emptyCells.length === 0) return null;

  let bestCell: number | null = null;
  let bestScore = -Infinity;

  for (const cellIndex of emptyCells) {
    const score = scoreCell(cellIndex, cropId, bed, width);

    // Reject cells with enemy neighbors
    if (score <= -1000) continue;

    if (score > bestScore) {
      bestScore = score;
      bestCell = cellIndex;
    }
  }

  return bestCell;
}

function scoreCell(cellIndex: number, cropId: string, bed: GardenCell[], width: number): number {
  const neighbors = getNeighbors(cellIndex, width, bed.length);
  const crop = getCropById(cropId);
  let score = 0;

  for (const neighborIndex of neighbors) {
    const neighborCrop = bed[neighborIndex];
    if (neighborCrop === null) continue;

    if (crop.enemies.includes(neighborCrop)) {
      score -= 1000; // HARD REJECT enemies
    } else if (crop.friends.includes(neighborCrop)) {
      score += 1; // Prefer friends
    }
    // Neutral neighbors = 0 (no penalty, no bonus)
  }

  return score;
}
```

**Multi-Box Handling:**
```typescript
function autoFillAllBoxes(
  layout: GardenLayout,
  stash: GardenStash
): BoxPlacementResult[] {
  const results: BoxPlacementResult[] = [];

  for (const box of layout.boxes) {
    const result = autoFillFromStash(box.bed, stash, crops, box.width);
    results.push({boxId: box.id, ...result});
  }

  return results;
}
```

**Performance Optimization:**
- For large beds (>100 cells), limit scoring to first N candidates
- Use memoization for neighbor lookups (neighbors don't change during placement)
- Consider A* or greedy heuristic for beds >200 cells

**Edge Cases:**
- Stash has 10 crops but only 5 empty cells → place 5, fail 5
- All crops in stash are enemies of existing bed crops → all fail
- Empty bed + empty stash → return empty result (no-op)
- Multi-box with different sizes → each box scored independently

**Estimated effort:** 150-180 minutes

---

## [TODO-021] Integration & Controls (Distribute Stash UI)

**Status:** pending
**Priority:** high
**Estimate:** M

### Description
Connect the Garden Stash UI to the new Priority Solver and update the user controls. Replace the "Automagic Fill" button with "Distribute Stash" button. Add a toggle for "Fill remaining gaps?" to optionally fill empty cells with compatible companions after placing the stash.

**UX Flow:**
1. User builds stash using +/- controls in Crop Library
2. Stash Summary shows total area and crops
3. User clicks "Distribute Stash" button
4. Solver places stash crops optimally
5. (Optional) If "Fill remaining gaps" is ON, solver fills leftover cells with compatible crops
6. User sees placement report (successes and failures)

### Acceptance Criteria
- [ ] Move "Automagic Fill" button to Stash Summary component
- [ ] Rename button to "Distribute Stash" (or "Place My Garden")
- [ ] Disable button when stash is empty
- [ ] Add toggle: "Fill remaining gaps?" (default: OFF)
- [ ] Connect `handleDistributeStash` to call new `autoFillFromStash` solver
- [ ] Display placement report after distribution:
  - Success message: "Placed 12 crops successfully!"
  - Failure warning: "Could not place 3 crops due to space/conflicts"
  - List failed crops with reasons
- [ ] Clear stash after successful distribution (or keep and allow retry?)
- [ ] Add loading spinner during solver execution (for large beds)
- [ ] Add "Undo" button to revert last distribution
- [ ] Update unit tests for new handler logic

### Validation
- Manual: Add 4 Tomato to stash, click "Distribute", verify all placed and stash cleared
- Manual: Add 50 crops to 32-cell bed, verify placement report shows 32 placed / 18 failed
- Manual: Toggle "Fill gaps" ON, distribute 10 crops, verify remaining cells filled with companions
- Manual: Test undo button reverts to previous bed state
- Automated: Integration tests for full stash → distribute → clear workflow

### Test Cases
| Input | Expected Output | Notes |
|-------|-----------------|-------|
| Empty stash | "Distribute Stash" button disabled | Validation |
| Stash with 4 Tomato | Button enabled | Validation |
| Click "Distribute" with valid stash | Crops placed, success message shown | Happy path |
| Click "Distribute" with overfilled stash | Partial placement, failure warning shown | Overflow handling |
| Toggle "Fill gaps" ON, distribute 10 crops in 32 cells | 10 stash crops + 22 gap-fill crops placed | Gap fill feature |
| Toggle "Fill gaps" OFF, distribute 10 crops | Only 10 placed, 22 cells remain empty | Gap fill disabled |
| Click "Undo" after distribution | Bed reverts to pre-distribution state | Undo functionality |
| Large bed (100 cells), 100 crops | Loading spinner shown, completes in <2s | Performance & UX |
| Placement fails for 5 crops | Report lists each crop with reason | Error reporting |
| Successful distribution | Stash cleared (optional behavior - TBD) | Post-distribution state |

### Dependencies
- Depends on: TODO-019 (Stash state) complete
- Depends on: TODO-020 (Priority Solver) complete
- Blocks: None (completes the Garden Stash feature)
- Related: F003 (Automagic Fill) - replaces/enhances original feature

### TDD Execution Log
| Phase | Command | Result | Timestamp |
|-------|---------|--------|-----------||
| RED | - | - | - |
| GREEN | - | - | - |
| VALIDATE | - | - | - |
| COMPLETE | - | - | - |

### Technical Notes
**Handler Implementation:**
```typescript
function handleDistributeStash() {
  if (Object.keys(stash).length === 0) return; // Button should be disabled anyway

  setIsLoading(true);

  // Phase 1: Place stash crops
  const stashResult = autoFillFromStash(
    currentLayout.boxes[0].bed,
    stash,
    crops,
    currentLayout.boxes[0].width
  );

  // Phase 2: Fill gaps (if enabled)
  let gapFillResult = null;
  if (shouldFillGaps) {
    const remainingSpace = countEmptyCells(currentLayout.boxes[0].bed);
    gapFillResult = autoFillGaps(currentLayout.boxes[0].bed, crops, remainingSpace);
  }

  // Update bed state
  setBed(currentLayout.boxes[0].bed); // Use batch update from TODO-009

  // Show results
  showPlacementReport(stashResult, gapFillResult);

  // Clear stash (or keep for retry? - TBD based on user testing)
  clearStash();

  setIsLoading(false);
}
```

**Placement Report UI:**
```tsx
<PlacementReport>
  {result.placed.length > 0 && (
    <SuccessMessage>
      ✓ Placed {result.placed.length} crops successfully!
    </SuccessMessage>
  )}

  {result.failed.length > 0 && (
    <WarningMessage>
      ⚠ Could not place {result.failed.length} crops:
      <ul>
        {result.failed.map(f => (
          <li key={f.cropId}>
            {getCropName(f.cropId)}: {f.reason}
          </li>
        ))}
      </ul>
    </WarningMessage>
  )}
</PlacementReport>
```

**Gap Fill Logic:**
```typescript
function autoFillGaps(bed: GardenCell[], crops: Crop[], maxFills: number): PlacementResult {
  // Similar to current autoFillBed, but:
  // 1. Only fills empty cells (doesn't overwrite stash placements)
  // 2. Strongly prefers crops that are friends with existing neighbors
  // 3. Stops after maxFills placements

  const placed: CropPlacement[] = [];
  const availableCrops = crops.filter(c => /* viable for current season */);

  for (let i = 0; i < bed.length && placed.length < maxFills; i++) {
    if (bed[i] !== null) continue; // Skip filled cells

    const compatibleCrops = availableCrops.filter(crop => {
      const score = scoreCell(i, crop.id, bed, width);
      return score >= 0; // No enemies
    });

    if (compatibleCrops.length > 0) {
      // Pick crop with highest neighbor score
      const bestCrop = compatibleCrops.reduce((best, crop) => {
        const score = scoreCell(i, crop.id, bed, width);
        return score > scoreCell(i, best.id, bed, width) ? crop : best;
      });

      bed[i] = bestCrop.id;
      placed.push({cropId: bestCrop.id, cellIndex: i});
    }
  }

  return {placed, failed: []};
}
```

**Undo Implementation:**
```typescript
// Store bed state before distribution
const [bedHistory, setBedHistory] = useState<GardenCell[][]>([]);

function handleDistributeStash() {
  // Save current state to history
  setBedHistory([...bedHistory, [...currentLayout.boxes[0].bed]]);

  // ... perform distribution ...
}

function handleUndo() {
  if (bedHistory.length === 0) return;

  const previousBed = bedHistory[bedHistory.length - 1];
  setBed(previousBed);
  setBedHistory(bedHistory.slice(0, -1));
}
```

**Stash Clearing Decision:**
- **Option A (Clear on success):** Good for "one-shot" planning. User builds stash, distributes, starts fresh.
- **Option B (Keep stash):** Good for iterative refinement. User can click "Distribute" multiple times to try different arrangements.
- **Recommendation:** Start with Option A, add "Keep Stash" checkbox in TODO-022 if users request it.

**Accessibility:**
- "Distribute Stash" button must have descriptive aria-label
- Loading spinner must have aria-live="polite" announcement
- Placement report must be keyboard-navigable
- Undo button must have keyboard shortcut (Cmd+Z / Ctrl+Z)

**Estimated effort:** 90-120 minutes

---

## [TODO-007] Code Quality Improvements from F004 Review

**Status:** pending
**Priority:** low
**Estimate:** S

### Description
Quality improvements identified during Feature 004 code review. These are minor enhancements that don't block functionality but improve maintainability and UX.

### Acceptance Criteria
- [ ] Extract magic number (max season extension weeks) to named constant
- [ ] Review date validation edge case (same-day frost dates)
- [ ] Add click-to-close on modal overlay
- [ ] Fix pre-existing TypeScript errors in test files

### Validation
- Manual: Open Settings, test edge cases
- Automated: All existing tests still pass

### Test Cases
| Input | Expected Output | Notes |
|-------|-----------------|-------|
| Extract MAX_SEASON_EXTENSION_WEEKS | Constant used in validation | Maintainability |
| Set Last Frost = First Frost (same day) | Verify if valid or invalid | Edge case review |
| Click outside Settings modal | Modal closes | UX enhancement |
| Run typecheck | Zero errors | Type safety |

### Dependencies
- Depends on: F004 (User Settings) complete
- Blocks: None

### TDD Execution Log
| Phase | Command | Result | Timestamp |
|-------|---------|--------|-----------||
| RED | - | - | - |
| GREEN | - | - | - |
| VALIDATE | - | - | - |
| COMPLETE | - | - | - |

### Technical Notes
**From F004 Code Review:**

**Medium Issues (3):**
1. Date validation uses `>=` which blocks same-day frost dates - review if `>` is better
2. Magic number `8` for max season extension - extract to `MAX_SEASON_EXTENSION_WEEKS`
3. Pre-existing TypeScript errors in test files (HTMLElement | undefined checks)

**Low Issues (3):**
1. Modal overlay doesn't close on click - add onClick handler to overlay div
2. Form state persists on cancel (minor) - already resets via useEffect on isOpen
3. Season extension help text could include examples (0=outdoors, 2-4=row covers, 6-8=greenhouse)

**Estimated effort:** 30-60 minutes total

---

## [TODO-008] Code Quality Improvements from F005 Phase 1-4 Review

**Status:** partially-complete
**Priority:** low
**Estimate:** M-L

### Description
Quality improvements identified during Feature 005 Phase 1-4 code reviews (migration foundation, layout manager, UI components, and App integration). These are minor enhancements that improve code quality and reduce duplication but don't block Phase 5 or future features.

### Acceptance Criteria
- [✅] Extract shared UUID generation to `src/utils/uuid.ts`
- [ ] Extract shared `createDefaultProfile()` to single location
- [ ] Extract layout helper functions to `src/utils/layoutHelpers.ts`
- [✅] Consider using `crypto.randomUUID()` for cryptographically secure UUIDs
- [ ] Add profile validation helper for date ranges
- [✅] Add layout name and cell index validation
- [ ] Add optional migration success logging
- [ ] Extract shared test helpers to `src/test/helpers.ts`
- [ ] Split useLayoutManager.test.ts into multiple focused files
- [ ] Fix object mutation in duplicateLayout (use object spread)
- [ ] Fix flaky timestamp test in useLayoutManager.test.ts
- [ ] Split LayoutSelector.test.tsx into multiple focused files
- [ ] Add useMemo to sortedLayouts in LayoutSelector.tsx
- [ ] Add prop validation for currentName in LayoutActionModal
- [ ] Extract layout handlers from App.tsx to useLayoutActions hook
- [ ] Add error handling to migration useEffect in App.tsx
- [ ] Create TODO-010 for re-enabling Settings with profile management

### Validation
- Manual: Verify UUID uniqueness, profile validation works
- Automated: All existing tests still pass after refactoring

### Test Cases
| Input | Expected Output | Notes |
|-------|-----------------|-------|
| Extract shared utilities | No duplication, all tests pass | DRY principle |
| Use crypto.randomUUID() | Secure UUIDs generated | Better quality |
| Validate profile dates | Last frost < First frost checked | Data integrity |
| Test helpers reused | Cleaner test files | Maintainability |

### Dependencies
- Depends on: F005 Phase 1 (Migration Foundation) complete
- Blocks: None
- Can be done anytime before v1.0 release

### TDD Execution Log
| Phase | Command | Result | Timestamp |
|-------|---------|--------|-----------|
| RED | - | - | - |
| GREEN | - | - | - |
| VALIDATE | - | - | - |
| COMPLETE | - | - | - |

### Technical Notes
**From F005 Phase 1 Code Review:**

**Medium Issues (3):**
1. **UUID Generation** - `generateUUID()` duplicated in storageMigration.ts and useProfiles.ts
   - Fix: Extract to `src/utils/uuid.ts`
   - Consider: Use `crypto.randomUUID()` (Node 19+) or `uuid` package for better quality

2. **Default Profile** - `createDefaultProfile()` duplicated in storageMigration.ts and useProfiles.ts
   - Fix: Centralize in useProfiles or create shared utility

3. **Code Duplication** - Multiple helper functions duplicated
   - Impact: Violates DRY principle, harder to maintain

**Low Issues (3):**
1. **Test Helpers** - `getLayout()` and `getProfile()` could be shared test utilities
2. **Migration Logging** - Add optional success logging for debugging
3. **Profile Validation** - Add validation for date range consistency

---

**From F005 Phase 2 Code Review:**

**Medium Issues (4):**
1. **File Size** - useLayoutManager.ts is 274 lines (exceeds 200 line limit)
   - Fix: Extract helpers to `src/utils/layoutHelpers.ts` (generateUUID, createEmptyBed, createNewLayout, touchLayout)

2. **Test File Size** - useLayoutManager.test.ts is 357 lines (exceeds 200 line limit)
   - Fix: Split into useLayoutManager.crud.test.ts, useLayoutManager.bed.test.ts, useLayoutManager.persistence.test.ts

3. **Object Mutation** - duplicateLayout mutates object after creation (line 203)
   - Fix: Use object spread: `{ ...createNewLayout(...), bed: [...original.bed] }`

4. **Missing Validation** - No input validation for layout names or cell indices
   - Fix: Add validateLayoutName() and validateCellIndex() helpers

**Low Issues (3):**
1. **Error Handling** - Uses console.error/warn instead of throwing errors (harder to test)
2. **Flaky Test** - Timestamp test uses setTimeout without proper async/await (line 204-219)
3. **UUID Quality** - Math.random() not cryptographically secure (acceptable for local IDs)

---

**From F005 Phase 3 Code Review:**

**Medium Issues (2):**
1. **Test File Size** - LayoutSelector.test.tsx is 276 lines (exceeds 200 line limit by 38%)
   - Fix: Split into LayoutSelector.rendering.test.tsx, LayoutSelector.actions.test.tsx, LayoutSelector.keyboard.test.tsx

2. **Performance Optimization** - sortedLayouts recalculated on every render (LayoutSelector.tsx:35-37)
   - Fix: Use useMemo to cache sorted result

**Low Issues (3):**
1. **Verbose Arrow Functions** - Multiple explicit braces due to lint rules (acceptable tradeoff)
2. **Missing Prop Validation** - No runtime validation for currentName in delete mode
3. **Test Robustness** - Sort order test checks presence but not exact order

---

**From F005 Phase 4 Code Review:**

**Medium Issues (3):**
1. **File Size** - App.tsx is 310 lines (exceeds 200 line limit by 55%)
   - Fix: Extract layout handlers to `src/hooks/useLayoutActions.ts`

2. **Multiple State Updates** - handleAutoFill calls plantCrop in forEach loop
   - Note: React 18 batches updates automatically, acceptable for now but could optimize

3. **Settings Disabled** - Profile editing functionality temporarily removed
   - Fix: Create TODO-010 for re-enabling Settings with profile management

**Low Issues (3):**
1. **No Error Handling** - Migration useEffect has no try-catch
2. **Duplicate Handler Patterns** - Could abstract openLayoutModal(mode, layoutId)
3. **Missing Loading State** - No indicator during migration (brief, not critical)

**Estimated effort:** 150-250 minutes total

---

## [TODO-009] Critical Fixes from Code Audit (Settings, Performance, File Size)

**Status:** ✅ completed (2026-01-10)
**Priority:** high
**Estimate:** M

### Description
Address three critical issues identified in code audit: (1) Re-enable Settings functionality so users can change frost dates, (2) Fix autofill performance bottleneck causing multiple re-renders, (3) Refactor files exceeding 200-line Bootstrap limit.

**See completed.md for full implementation details.**

### Acceptance Criteria
- [ ] **Settings Re-enabled:** Users can click Settings button and change frost dates
- [ ] **Settings Integration:** Settings modal updates active layout's profile (not just default)
- [ ] **Batch Update Method:** Add `setBed(bed)` to useLayoutManager for single-transaction updates
- [ ] **Autofill Performance:** handleAutoFill uses setBed instead of forEach plantCrop
- [ ] **App.tsx Refactor:** Extract handlers to useLayoutActions hook (reduce from 257 to <200 lines)
- [ ] **Test Files Split:** Split useLayoutManager.test.ts (379→<200) and LayoutSelector.test.tsx (307→<200)

### Validation
- Manual: Click Settings, change dates, verify viability updates, click Autofill 20+ times (no stutter)
- Automated: All 158 tests pass, coverage ≥80%, lint+typecheck clean

### Test Cases
| Input | Expected Output | Notes |
|-------|-----------------|-------|
| Click Settings button | Modal opens | Critical - currently disabled |
| Change frost dates in Settings | Active profile updates, viability recalculates | Must work for active layout |
| Click Autofill with 20 empty squares | Single state update, no UI stutter | Performance fix |
| Check App.tsx line count | ≤200 lines | Bootstrap compliance |
| Check test file line counts | ≤200 lines each | Bootstrap compliance |
| Run full test suite | 158+ tests pass | No regressions |

### Dependencies
- Depends on: F005 (Layouts) complete ✅
- Relates to: TODO-008 (broader quality improvements)
- Blocks: Future features requiring Settings

### TDD Execution Log
| Phase | Command | Result | Timestamp |
|-------|---------|--------|-----------|
| RED | - | - | - |
| GREEN | - | - | - |
| VALIDATE | - | - | - |
| COMPLETE | - | - | - |

### Technical Notes
**From Code Audit (2026-01-10):**

**Critical Issue: Settings Unreachable**
- `src/App.tsx:136` - Settings button commented out
- Users cannot change frost dates, breaking parametric garden planner
- App defaults to Denver/SF dates - unusable for other locations

**High Issue: Autofill Performance**
- `src/App.tsx:96-102` - forEach loop calls plantCrop individually
- Each plantCrop triggers setLayoutStorage → re-render + localStorage write
- 20 empty squares = 20 separate state updates = UI stutter
- **Solution:** Add `setBed(bed)` method, update entire bed in one transaction

**Medium Issue: Bootstrap Violations**
- App.tsx: 257 lines (exceeds 200 by 28%)
- useLayoutManager.test.ts: 379 lines (exceeds 200 by 89%)
- LayoutSelector.test.tsx: 307 lines (exceeds 200 by 53%)
- **Solution:** Extract useLayoutActions hook, split test files by responsibility

**Estimated effort:** 120-180 minutes total

---

## [TODO-013] Auto-Populate Frost Dates from Hardiness Zone

**Status:** pending
**Priority:** medium
**Estimate:** S

### Description
Currently, users must manually enter their frost dates even after typing their Hardiness Zone. This feature adds a lookup map so that entering a standard zone (e.g., "10a") automatically pre-fills the First and Last Frost dates with reasonable defaults. For warm zones (like Escondido's 10a), it should default to a "Frost Free" year (e.g., LFD: Jan 1, FFD: Dec 31) to unlock the full calendar.

### Acceptance Criteria
- [ ] Create a `ZONE_FROST_DEFAULTS` constant mapping zones (3a-13b) to approximate frost dates
- [ ] Update `SettingsModal`: When user changes "Hardiness Zone", auto-update frost dates if they haven't been manually edited yet
- [ ] Handle warm zones (10+) by setting "Year Round" dates (LFD: Jan 1, FFD: Dec 31)
- [ ] Add visual feedback (e.g., "Dates auto-set for Zone 10a")
- [ ] Allow user to override these defaults manually

### Validation
- Manual: Open Settings, type "10a", verify dates jump to Jan 1/Dec 31
- Manual: Type "5b", verify dates jump to ~May 15/Oct 1
- Automated: Unit test helper function `getDefaultsForZone(zone)`

### Test Cases
| Input | Expected Output | Notes |
|-------|-----------------|-------|
| Enter "10a" in Zone field | LFD: Jan 1, FFD: Dec 31 auto-filled | Warm zone (frost-free) |
| Enter "5b" in Zone field | LFD: ~May 15, FFD: ~Oct 1 auto-filled | Mid-range zone |
| Enter "3a" in Zone field | LFD: ~Jun 1, FFD: ~Sep 15 auto-filled | Cold zone |
| Manually edit frost date after auto-fill | User override persists | User control |
| getDefaultsForZone("10a") | Returns {lfd: "01-01", ffd: "12-31"} | Helper function |

### Dependencies
- Depends on: F004 (User Settings) complete ✅
- Blocks: None
- Related: TODO-014 (Address-based lookup builds on this)

### TDD Execution Log
| Phase | Command | Result | Timestamp |
|-------|---------|--------|-----------|
| RED | - | - | - |
| GREEN | - | - | - |
| VALIDATE | - | - | - |
| COMPLETE | - | - | - |

### Technical Notes
**USDA Hardiness Zone Frost Date Approximations:**
- Zones 10-13: Frost-free (Jan 1 - Dec 31)
- Zone 9a/9b: Jan 15 - Dec 15
- Zone 8a/8b: Mar 1 - Nov 15
- Zone 7a/7b: Apr 1 - Oct 31
- Zone 6a/6b: Apr 15 - Oct 15
- Zone 5a/5b: May 1 - Oct 1
- Zone 4a/4b: May 15 - Sep 15
- Zone 3a/3b: Jun 1 - Sep 1

**Implementation:**
- Create `src/utils/zoneFrostDefaults.ts` with lookup map
- Add helper `getDefaultsForZone(zone: string): {lfd: string, ffd: string} | null`
- Update `SettingsModal` to call helper on zone change
- Add state flag to track if dates have been manually edited

---

## [TODO-014] Auto-Detect Zone & Frost Dates from Address

**Status:** pending
**Priority:** low
**Estimate:** L

### Description
Instead of asking users to know their USDA Hardiness Zone, allow them to enter a street address or ZIP code. The system should query an external service to resolve the location to a USDA Zone and precise frost data, then auto-populate the entire Garden Profile.

### Acceptance Criteria
- [ ] Add "Search by Address/ZIP" input field to Settings
- [ ] Integrate with a geolocation service (e.g., OpenWeatherMap, NOAA, or specialized Gardening API) to get coordinates
- [ ] Map coordinates to USDA Hardiness Zone
- [ ] Map coordinates/Zone to precise historical frost dates (not just zone averages)
- [ ] Handle API failures gracefully (fallback to manual entry)
- [ ] Display loading state during API lookup
- [ ] Cache results to avoid repeated API calls

### Validation
- Manual: Enter "92025" (Escondido), verify Zone 10a and correct frost dates populate
- Manual: Enter "80202" (Denver), verify Zone 5b/6a populate
- Manual: Enter invalid ZIP, verify error message and fallback to manual entry
- Automated: Mock API responses and test parsing logic

### Test Cases
| Input | Expected Output | Notes |
|-------|-----------------|-------|
| Enter ZIP "92025" | Zone 10a, Jan 1/Dec 31 auto-filled | Escondido, CA |
| Enter ZIP "80202" | Zone 5b, Apr 15/Oct 15 auto-filled | Denver, CO |
| Enter invalid ZIP "00000" | Error message, no auto-fill | API error handling |
| API request timeout | "Unable to fetch data" message, manual entry available | Graceful degradation |
| Repeat same ZIP lookup | Uses cached result (no API call) | Performance optimization |

### Dependencies
- Depends on: F004 (User Settings) complete ✅
- Depends on: TODO-013 (Zone defaults) recommended but not blocking
- Blocks: None
- Note: Requires API keys/external service setup (Phase 3+)

### TDD Execution Log
| Phase | Command | Result | Timestamp |
|-------|---------|--------|-----------|
| RED | - | - | - |
| GREEN | - | - | - |
| VALIDATE | - | - | - |
| COMPLETE | - | - | - |

### Technical Notes
**Potential APIs:**
1. **USDA Plant Hardiness Zone API** (if available)
   - Free, official data
   - May require coordinates from geocoding first

2. **OpenWeatherMap Geocoding API**
   - Free tier: 60 calls/min
   - Returns lat/lon from address/ZIP
   - Combine with zone map overlay

3. **Garden.org or Almanac.com APIs** (if available)
   - Gardening-specific, may include frost dates directly
   - Check licensing/terms

4. **Custom Solution:**
   - Use free geocoding API (e.g., OpenStreetMap Nominatim)
   - Overlay coordinates on USDA zone shapefile (public domain)
   - Use zone → frost date lookup (TODO-013)

**Implementation Strategy:**
- Create `src/services/locationLookup.ts` with API client
- Add `fetchZoneByAddress(address: string): Promise<ZoneLookupResult>`
- Store API key in `.env` (not committed)
- Add loading spinner and error states to Settings UI
- Implement simple in-memory cache (or LocalStorage cache with expiry)

**Security Considerations:**
- API key must NOT be in `VITE_*` env vars (client-exposed!)
- For client-side app, consider using free/public APIs only
- Alternatively, add serverless function (Vercel/Netlify) as proxy

**Estimated effort:** 180-240 minutes (includes API research, integration, error handling)

---

## [TODO-015] Multi-Box Data Schema Refactor

**Status:** pending
**Priority:** medium
**Estimate:** M

### Description
Refactor the `GardenLayout` type to support multiple boxes instead of a single flat bed array. Create migration utility to convert existing single-bed layouts into a multi-box structure (wrapping old data in a "Main Bed").

### Acceptance Criteria
- [ ] `GardenBox` interface defined with id, name, dimensions, and cells
- [ ] `GardenLayout` updated to hold `boxes: GardenBox[]`
- [ ] `migrateToMultiBoxSchema` utility created
- [ ] Existing user data migrates automatically on load without data loss
- [ ] `useLayoutManager` updated to handle box operations (add/remove box)

### Validation
- Automated: Test migration function with legacy data input
- Manual: Load app with old data, verify "Main Bed" exists with previous crops

### Test Cases
| Input | Expected Output | Notes |
|-------|-----------------|-------|
| Legacy layout with bed array | Migrates to boxes array with single "Main Bed" | Data preservation |
| migrateToMultiBoxSchema() | Returns GardenBox[] | Migration function |
| Load app with old LocalStorage | Automatic migration, no errors | User experience |

### Dependencies
- Depends on: F005 (Layout Management) complete ✅
- Blocks: TODO-016, TODO-017, TODO-018
- Related: F008 (Multi-Box feature spec)

### TDD Execution Log
| Phase | Command | Result | Timestamp |
|-------|---------|--------|-----------|
| RED | - | - | - |
| GREEN | - | - | - |
| VALIDATE | - | - | - |
| COMPLETE | - | - | - |

---

## [TODO-016] Dynamic Grid Component

**Status:** pending
**Priority:** medium
**Estimate:** M

### Description
Update the `GardenBed` component to render dynamic grid dimensions based on props, rather than the hardcoded 4x8 layout.

### Acceptance Criteria
- [ ] `GardenBed` accepts `width` and `height` props
- [ ] Grid CSS updates dynamically (e.g., `grid-cols-4` vs `grid-cols-2`)
- [ ] Neighbor calculations in `utils/companionEngine` updated to respect variable widths
- [ ] App renders a list of GardenBed components (one per box)

### Validation
- Manual: Create a 2x2 box and a 4x8 box, verify they render correctly
- Automated: Unit tests for `getNeighbors` with different grid widths

### Test Cases
| Input | Expected Output | Notes |
|-------|-----------------|-------|
| GardenBed width=2, height=4 | 2-column, 4-row grid (8 cells) | Dynamic rendering |
| GardenBed width=6, height=3 | 6-column, 3-row grid (18 cells) | Custom dimensions |
| getNeighbors(0, width=2) | Returns [1] only (not [1, 2]) | Correct neighbor calc |
| Multiple boxes in layout | All boxes render with correct grids | Multi-box display |

### Dependencies
- Depends on: TODO-015 (data schema) complete
- Blocks: TODO-017 (Box Management UI)
- Related: F008 (Multi-Box feature spec)

### TDD Execution Log
| Phase | Command | Result | Timestamp |
|-------|---------|--------|-----------|
| RED | - | - | - |
| GREEN | - | - | - |
| VALIDATE | - | - | - |
| COMPLETE | - | - | - |

---

## [TODO-017] Box Management UI

**Status:** pending
**Priority:** medium
**Estimate:** M

### Description
Add UI controls to manage the boxes within a layout. Users need to add new boxes with custom sizes and remove existing ones.

### Acceptance Criteria
- [ ] "Add Bed" button added to main UI
- [ ] Modal dialog to enter Name, Width (ft), and Height (ft)
- [ ] Delete button per bed (with confirmation)
- [ ] Layout total summary updates (e.g., "Total Area: 64 sq ft")

### Validation
- Manual: Click "Add Bed", enter "Herb Box" (2x4), verify it appears below existing bed

### Test Cases
| Input | Expected Output | Notes |
|-------|-----------------|-------|
| Click "Add Bed" | Modal opens with Name/Width/Height fields | UI interaction |
| Submit "Herb Box", width=2, height=4 | New 2x4 box appears | Box creation |
| Click delete on box | Confirmation dialog appears | Safety |
| Confirm delete | Box removed from layout | Deletion |
| Layout with 4x8 + 2x4 boxes | Summary shows "Total: 40 sq ft" | Area calculation |

### Dependencies
- Depends on: TODO-016 (dynamic grid) complete
- Blocks: None (enables full multi-box experience)
- Related: F008 (Multi-Box feature spec)

### TDD Execution Log
| Phase | Command | Result | Timestamp |
|-------|---------|--------|-----------|
| RED | - | - | - |
| GREEN | - | - | - |
| VALIDATE | - | - | - |
| COMPLETE | - | - | - |

---

## [TODO-018] Multi-Box Automagic Fill

**Status:** pending
**Priority:** medium
**Estimate:** S

### Description
Update the `handleAutoFill` logic to iterate through all boxes in the current layout. The solver must respect the specific dimensions of each box when calculating neighbors.

### Acceptance Criteria
- [ ] "Automagic Fill" button triggers solver for ALL boxes in layout
- [ ] Solver uses specific width/height of each box for neighbor checks
- [ ] Crops are distributed across all available empty slots
- [ ] Performance check: ensure 3+ boxes doesn't cause UI freeze

### Validation
- Manual: Create 3 empty boxes, click Automagic Fill, verify all fill with valid crops

### Test Cases
| Input | Expected Output | Notes |
|-------|-----------------|-------|
| 3 empty boxes (4x8, 2x4, 3x3) + Automagic Fill | All boxes filled with compatible crops | Multi-box solver |
| Performance test: 5 boxes, 100+ cells | Fill completes in <2 seconds | No UI freeze |
| Box with width=2 | Neighbor calc uses width=2 (not 4) | Dimension awareness |

### Dependencies
- Depends on: TODO-016 (dynamic grid with neighbor updates) complete
- Blocks: None
- Related: F008 (Multi-Box feature spec)

### TDD Execution Log
| Phase | Command | Result | Timestamp |
|-------|---------|--------|-----------|
| RED | - | - | - |
| GREEN | - | - | - |
| VALIDATE | - | - | - |
| COMPLETE | - | - | - |
