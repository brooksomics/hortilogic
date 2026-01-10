# Active Todos

Current work in progress. Each todo follows the atomic todo format from base/SKILL.md.

---

## [TODO-018] Multi-Box Automagic Fill

**Status:** in-progress
**Priority:** medium
**Estimate:** S

### Description
Update the `handleAutoFill` logic to iterate through all boxes in the current layout. The solver must respect the specific dimensions of each box when calculating neighbors.

### User Story
"As a gardener with multiple garden beds of different sizes, when I click the Automagic Fill button, I expect all my beds to be filled with compatible crops that respect each bed's unique dimensions and companion planting rules."

### Acceptance Criteria
- [ ] "Automagic Fill" button triggers solver for ALL boxes in layout
- [ ] Solver uses specific width/height of each box for neighbor checks
- [ ] Crops are distributed across all available empty slots
- [ ] Performance check: ensure 3+ boxes doesn't cause UI freeze
- [ ] Each box maintains its own crop compatibility based on its dimensions

### Validation
- Manual: Create 3 empty boxes (4x8, 2x4, 3x3), click Automagic Fill, verify all fill with valid crops
- Manual: Performance test with 5 boxes (~100 cells), verify no UI freeze
- Automated: Unit test autoFillBed with different dimensions

### Test Cases
| Input | Expected Output | Notes |
|-------|-----------------|-------|
| 3 empty boxes (4x8, 2x4, 3x3) + Automagic Fill | All boxes filled with compatible crops | Multi-box solver |
| Performance test: 5 boxes, 100+ cells | Fill completes in <2 seconds | No UI freeze |
| Box with width=2 | Neighbor calc uses width=2 (not 4) | Dimension awareness |
| Mixed filled/empty boxes | Only empty cells filled, existing preserved | Non-destructive |

### Dependencies
- Depends on: TODO-016 (dynamic grid with neighbor updates) complete ✅
- Depends on: TODO-017 (box management UI) complete ✅
- Blocks: None
- Related: F008 (Multi-Box feature spec)

### TDD Execution Log
| Phase | Command | Result | Timestamp |
|-------|---------|--------|-----------|
| RED | npm test -- useGardenInteractions.test.ts --run | 1 failed (expected 1 to be 3) ✅ | 2026-01-10 22:00 |
| GREEN | Implement setAllBoxes + update handleAutoFill | 3 tests passing ✅ | 2026-01-10 22:05 |
| VALIDATE | npm test -- --run | 201 tests passing (198 + 3 new) ✅ | 2026-01-10 22:10 |
| COMPLETE | git commit + push | ✅ | 2026-01-10 22:15 |

### Technical Notes
**Implementation Plan:**
1. Update `handleAutoFill` in `useGardenInteractions.ts` to iterate through all boxes
2. For each box, call `autoFillBed` with box-specific width and height
3. Update each box's cells using the existing box update pattern
4. Ensure performance: process boxes sequentially, use single state update at end

**Files to Modify:**
- `src/hooks/useGardenInteractions.ts` - Update handleAutoFill logic
- `src/hooks/useLayoutManager.ts` - May need updateBox method
- Tests to verify multi-box filling

**Estimated effort:** 30-60 minutes

---

<!-- TODO-016 and TODO-017 moved to completed.md (2026-01-10) -->
<!-- TODO-012 moved to completed.md (2026-01-10) -->
