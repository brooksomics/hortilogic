# Active Todos

Current work in progress. Each todo follows the atomic todo format from base/SKILL.md.

---

## [TODO-009] Critical Fixes from Code Audit (Settings, Performance, File Size)

**Status:** ✅ completed
**Priority:** high
**Estimate:** M
**Started:** 2026-01-10
**Completed:** 2026-01-10

### Description
Address three critical issues identified in code audit: (1) Re-enable Settings functionality so users can change frost dates, (2) Fix autofill performance bottleneck causing multiple re-renders, (3) Refactor files exceeding 200-line Bootstrap limit.

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
