# Active Todos

Current work in progress. Each todo follows the atomic todo format from base/SKILL.md.

---

## TODO-025: Limit Flower Density in Automagic Fill

**Feature:** F003 (Automagic Solver)
**Priority:** Medium
**Type:** Enhancement
**Created:** 2026-01-19
**Status:** In Progress

### Problem Statement

The `autoFillBed` function plants too many flowers (pollinators) when filling empty spots. Flowers are primarily for mutualism/companion planting, not the main crop. We need a heuristic to limit flowers to approximately 10-15% of the total garden bed area.

### Acceptance Criteria

1. **Flower Limit Heuristic**: Flowers (crops with `type === 'flower'`) should not exceed 15% of total cells
2. **Algorithm Constraint**: The solver should track flower count during placement and skip/penalize flowers once limit is reached
3. **No Regressions**: Existing companion planting, viability, and variety optimization logic should continue working
4. **Test Coverage**: New test case validates flower density constraint

### Technical Approach

**Files to Modify:**
- `src/utils/companionEngine.ts` - Add flower tracking and limit logic
- `src/utils/companionEngine.test.ts` - Add test case for flower density

**Implementation Plan:**
1. Calculate `maxFlowers = Math.floor(totalCells * 0.15)` (15% threshold)
2. Track `flowerCount` during cell iteration
3. Skip crops with `type === 'flower'` when `flowerCount >= maxFlowers`

### Test Cases

| Test Case | Input | Expected Output | Status |
|-----------|-------|-----------------|--------|
| TC-025.1: Flower density limit | Grid: 32 cells, Crops: 5 flowers with high scores + 2 vegetables | Flowers ≤ 15% of grid (≤5 cells) | ⏳ Pending |
| TC-025.2: Limit doesn't block vegetables | Grid: 32 cells, Crops: flowers + vegetables | Vegetables still planted after flower limit reached | ⏳ Pending |
| TC-025.3: Existing crops preserved | Grid: 10 pre-planted flowers + 22 empty, Crops: more flowers | Total flowers ≤ 15% including existing | ⏳ Pending |

### TDD Execution Log

#### Phase 1: RED (Write Failing Tests)
- [x] Create test scenario with flower-heavy crop library
- [x] Assert flower count ≤ 15% of total cells
- [x] Verify test FAILS (proves it catches the issue)
  - TC-025.1: Expected ≤4 flowers, got 23 ✓ FAILED (proves test works)
  - TC-025.2: Expected ≤4 flowers, got 22 ✓ FAILED (proves test works)
  - TC-025.3: Expected ≤4 flowers, got 20 ✓ FAILED (proves test works)

#### Phase 2: GREEN (Implement Minimum Code)
- [x] Add `maxFlowers` calculation (line 170: `Math.floor(totalCells * 0.15)`)
- [x] Track `flowerCount` in placement loop (line 173: initial count + increment)
- [x] Skip flower crops when limit reached (line 191-193: skip condition)
- [x] Verify test PASSES
  - All 32 tests in companionEngine.test.ts PASSED ✓
  - All 3 flower density tests PASSED ✓

#### Phase 3: REFACTOR (Clean Up)
- [x] Review code for simplicity (≤20 lines/function)
  - Implementation: 7 lines added (within limits) ✓
  - No new functions created (inline logic) ✓
- [x] Ensure tests still pass ✓

#### Phase 4: VALIDATE
- [x] Run full test suite (no regressions)
  - 367 tests passed across 25 test files ✓
- [x] Run linter ✓
- [x] Run typecheck ✓

### Dependencies
None

### Blockers
None

### Notes
- 15% threshold is a heuristic, can be adjusted based on user feedback
- Existing flowers already in grid should count toward the limit
- This prevents flower domination while still allowing mutualism benefits

### Exit Condition
<promise>FLOWER LIMIT IMPLEMENTED</promise>
