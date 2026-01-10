# Backlog

Future work, prioritized. Move to active.md when starting.

---

## [TODO-005] Implement Feature 005: Layout Management (Save/Load)

**Status:** pending
**Priority:** medium
**Estimate:** M-L

### Description
Enable users to manage multiple garden layouts (e.g., "Spring 2026" vs "Fall 2026"). Currently only supports one "Current Bed" - need full save/load/switch functionality.

### Acceptance Criteria
- [ ] User can create new blank layout named "Fall 2026"
- [ ] User can switch between "Spring" and "Fall" layouts without losing data
- [ ] Active layout persists on reload
- [ ] User can duplicate layouts for succession planning
- [ ] User can rename layouts
- [ ] User can delete layouts (with confirmation)
- [ ] Existing users' data migrates automatically without data loss

### Validation
- Manual: Create multiple layouts, switch between them, reload page
- Automated: Test layout CRUD operations, migration, persistence

### Test Cases
| Input | Expected Output | Notes |
|-------|-----------------|-------|
| Create "Fall 2026" | New empty layout created | Layout management |
| Switch to "Spring" | Spring layout displayed, Fall preserved | No data loss |
| Duplicate "Spring" | "Spring Copy" with identical crops | Succession planning |
| Rename layout | Layout renamed, data intact | Update metadata |
| Delete layout | Layout removed, switch to default | Confirmation dialog |
| Reload page | Active layout restored | Persistence |
| Load old schema | Auto-migrate to new schema | Backward compatibility |

### Dependencies
- Depends on: None (independent feature)
- Blocks: None
- Recommended order: After F004 (Settings) for better UX

### TDD Execution Log
| Phase | Command | Result | Timestamp |
|-------|---------|--------|-----------|
| RED | - | - | - |
| GREEN | - | - | - |
| VALIDATE | - | - | - |
| COMPLETE | - | - | - |

### Technical Notes
- Migrate LocalStorage schema from single object to layouts map
- Use UUID or timestamp-based IDs for layouts
- Implement migration utility for existing users
- Add version number to storage schema
- Layout selector in header (dropdown component)
- Prevent deleting last remaining layout (keep at least 1)
- Consider export/import for backup (future enhancement)

---

## [TODO-006] Expand Crop Database (Core 50)

**Status:** pending
**Priority:** medium
**Estimate:** S-M

### Description
Move from 5 sample crops (Lettuce, Tomato, Carrot, Peas, Radish) to a comprehensive "Core 50" crop database with real planting data and companion rules.

### Acceptance Criteria
- [ ] Create crops.json with 50 common garden crops
- [ ] Each crop has complete companion planting data
- [ ] Each crop has accurate planting windows by zone
- [ ] Crop library UI handles 50+ crops gracefully
- [ ] Search/filter functionality for finding crops

### Validation
- Manual: Browse crop library, verify data accuracy
- Automated: Test crop data loading, filtering

### Test Cases
| Input | Expected Output | Notes |
|-------|-----------------|-------|
| Load crops.json | 50 crops available | Data file |
| Search "tom" | Find Tomato, Cherry Tomato | Filter works |
| Check companions | Accurate friend/enemy data | Validate rules |
| Select Zone 10b | Only show viable crops for zone | Filter by zone |

### Dependencies
- Depends on: None
- Blocks: None

### TDD Execution Log
| Phase | Command | Result | Timestamp |
|-------|---------|--------|-----------|
| RED | - | - | - |
| GREEN | - | - | - |
| VALIDATE | - | - | - |
| COMPLETE | - | - | - |

### Technical Notes
- Create src/data/crops.json (or crops.ts for type safety)
- Add search input to CropLibrary component
- Consider virtual scrolling for performance with 50+ items
- Source companion planting data from reliable gardening references
- Include common names and varieties

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

**Status:** pending
**Priority:** low
**Estimate:** M-L

### Description
Quality improvements identified during Feature 005 Phase 1-4 code reviews (migration foundation, layout manager, UI components, and App integration). These are minor enhancements that improve code quality and reduce duplication but don't block Phase 5 or future features.

### Acceptance Criteria
- [ ] Extract shared UUID generation to `src/utils/uuid.ts`
- [ ] Extract shared `createDefaultProfile()` to single location
- [ ] Extract layout helper functions to `src/utils/layoutHelpers.ts`
- [ ] Consider using `crypto.randomUUID()` for cryptographically secure UUIDs
- [ ] Add profile validation helper for date ranges
- [ ] Add layout name and cell index validation
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
