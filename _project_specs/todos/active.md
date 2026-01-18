# Active Todos

Current work in progress. Each todo follows the atomic todo format from base/SKILL.md.

---

## [TODO-029] Update Companion Engine for Flowers

**Status:** ✅ completed
**Priority:** medium
**Estimate:** S
**Completed:** 2026-01-18
**Dependencies:** TODO-027 (completed)

### Description
Update the `prioritySolver.ts` to recognize the beneficial relationship of flowers. If a user has a "Tomato" in the stash, and "Marigold" is a friend, the solver should prioritize placing them adjacent.

### Acceptance Criteria
- [✅] Update `scoreCell` to give a bonus for Flower <-> Vegetable adjacency if they are friends
- [✅] Ensure flowers are treated as standard crops for spacing (density) calculations

### Test Cases
| Input | Expected Output | Notes |
|-------|-----------------|-------|
| Bed with Tomato at [0]. Stash: Marigold | Marigold placed at [1] | High adjacency score (+2 bonus) |
| Bed with Basil at [0]. Stash: Marigold | Marigold placed adjacent if friends | Companion bonus (+1, no flower bonus) |

### Validation
- **Manual:** Add Tomato to bed, add Marigold to stash, run Automagic Fill -> Marigold should be adjacent ✅
- **Automated:** Unit tests for flower companion scoring ✅

### Dependencies
- Depends on: TODO-027 (flowers in database) ✅

### TDD Execution Log
| Phase | Command | Result | Timestamp |
|-------|---------|--------|-----------|
| RED | npm test prioritySolver.test.ts | 4 new tests failing ✅ | 2026-01-18 07:04 |
| GREEN | Implement flower-vegetable bonus in scoreCell() | 19/19 tests passing ✅ | 2026-01-18 07:06 |
| VALIDATE | npm run typecheck && npm run lint | 0 errors, 1 pre-existing warning ✅ | 2026-01-18 07:07 |
| VALIDATE | npm test prioritySolver.test.ts | 19/19 tests passing ✅ | 2026-01-18 07:07 |
| COMPLETE | Update CODE_INDEX.md, active.md | Feature complete ✅ | 2026-01-18 07:09 |

### Implementation Summary
**Features Implemented:**
1. **Enhanced Scoring in `scoreCell()`** - Added flower-vegetable mutualism bonus (lines 69-80 in prioritySolver.ts)
   - Standard friend bonus: +1 point
   - Flower-Vegetable bonus: Additional +1 point (total +2)
   - Only applies when one crop is a flower and the other is a vegetable
   - Encourages beneficial companion planting with flowers

**Tests Added:** 4 comprehensive tests covering all scenarios
- Flower-vegetable friendship bonus
- Vegetable-flower friendship bonus
- Herb-vegetable friendship (no flower bonus)
- Vegetable-vegetable friendship (no flower bonus)

**Files Modified:**
- `src/utils/prioritySolver.ts` (enhanced scoreCell function)
- `src/utils/prioritySolver.test.ts` (added 4 new tests, fixed 2 affected tests)
- `CODE_INDEX.md` (documented new flower-vegetable bonus capability)

**Quality Metrics:**
- All prioritySolver tests passing: 19/19 ✅
- TypeScript strict mode: 0 errors ✅
- ESLint: 0 errors, 1 pre-existing warning ✅
- Bootstrap compliance: All changes <20 lines per function ✅

**Key Benefits:**
1. **Improved Companion Planting**: Flowers like Marigold now get prioritized next to vegetables they benefit (e.g., Tomatoes)
2. **Ecological Accuracy**: Reflects real-world permaculture practices where flowers attract pollinators and repel pests
3. **User Value**: Automagic Fill will now create more beneficial garden layouts with flower-vegetable pairings
4. **Backward Compatible**: Existing scoring still works; flower bonus is additive only
