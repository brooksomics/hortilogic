# Backlog

Future work, prioritized. Move to active.md when starting.

---

<!-- TODO-012 moved to active.md (2026-01-10) -->
<!-- TODO-011 moved to active.md (2026-01-10) -->

---

<!-- TODO-019 moved to active.md (2026-01-10) -->

<!-- TODO-020 moved to active.md (2026-01-10) -->

---

<!-- TODO-021 moved to active.md (2026-01-10) -->

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

<!-- TODO-015 moved to completed.md (2026-01-10) -->
<!-- TODO-016 moved to completed.md (2026-01-10) -->
<!-- TODO-017 moved to completed.md (2026-01-10) -->
<!-- TODO-018 moved to completed.md (2026-01-10) -->
