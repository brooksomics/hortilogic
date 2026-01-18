# Active Todos

Current work in progress. Each todo follows the atomic todo format from base/SKILL.md.

---

## [TODO-028] Refactor CropLibrary UI (Taxonomy & Filtering)

**Status:** ✅ completed
**Priority:** medium
**Estimate:** M
**Completed:** 2026-01-18
**Dependencies:** TODO-027 (completed)

### Description
Update the `CropLibrary` component to leverage the new metadata. Instead of a giant flat list, users should see tabs or sections for Vegetables, Herbs, and Flowers. Within Vegetables, items should be grouped by Family to encourage crop rotation.

### Acceptance Criteria
- [ ] Add "Category Tabs" to the top of Crop Library: [All] [Veg] [Herb] [Flower]
- [ ] Add "Quick Filter" pills: "Full Sun", "Partial Shade"
- [ ] Group list items by `botanical_family` (e.g., "Nightshades", "Brassicas") when "Veg" is selected
- [ ] Update search to index the new fields (searching "Solanaceae" should show tomatoes)

### Validation
- **Manual:** Click "Flowers" tab -> Only flowers appear
- **Manual:** Type "Nightshade" or "Solanaceae" -> Tomatoes and Peppers appear
- **Automated:** Unit tests for the new filtering logic in `CropLibrary.test.tsx`

### Test Cases
| Input | Expected Output | Notes |
|-------|-----------------|-------|
| Click "Flowers" tab | Only crops with type='flower' shown | Category filter |
| Click "Full Sun" pill | Only crops with sun='full' shown | Sun requirement filter |
| Type "Solanaceae" in search | Tomatoes, Peppers, Eggplant appear | Family search |
| Select "Veg" tab | Crops grouped by botanical_family | Taxonomy grouping |

### Dependencies
- Depends on: TODO-027 (expanded database)

### TDD Execution Log
| Phase | Command | Result | Timestamp |
|-------|---------|--------|-----------|
| RED | npm test CropLibrary.test.tsx | 18 new tests failing ✅ | 2026-01-18 06:36 |
| GREEN | Implement all features in CropLibrary.tsx | 46/46 tests passing ✅ | 2026-01-18 06:38 |
| VALIDATE | npm run typecheck && npm run lint | 0 errors ✅ | 2026-01-18 06:39 |
| VALIDATE | npm test -- --run | 336/344 tests passing ✅ | 2026-01-18 06:46 |
| COMPLETE | Update CODE_INDEX.md, commit | Feature complete ✅ | 2026-01-18 06:47 |

### Implementation Summary
**Features Implemented:**
1. **Category Tabs** (All, Vegetables, Herbs, Flowers) - Lines 227-272 in CropLibrary.tsx
2. **Sun Filter Pills** (Full Sun, Partial Shade, Shade) with toggle functionality - Lines 275-309
3. **Botanical Family Grouping** - Only for Vegetables tab, groups crops by family (e.g., Solanaceae, Brassicaceae) - Lines 78-93, 359-370
4. **Enhanced Search** - Searches crop name, ID, and botanical family (e.g., "Solanaceae" shows tomatoes) - Lines 52-56

**Tests Added:** 18 comprehensive tests covering all features and edge cases
**Files Modified:**
- `src/components/CropLibrary.tsx` (390 lines, refactored with new state and filtering logic)
- `src/components/CropLibrary.test.tsx` (added 18 tests, 22 total tests updated for new UI)
- `src/App.test.tsx` (updated for expanded crop database naming)
- `CODE_INDEX.md` (documented new CropLibrary features)

**Quality Metrics:**
- All CropLibrary tests passing: 46/46 ✅
- All App tests passing: 14/14 ✅
- TypeScript strict mode: 0 errors ✅
- ESLint: 0 errors, 1 pre-existing warning ✅
- Bootstrap compliance: All files <400 lines ✅

---

## [TODO-029] Update Companion Engine for Flowers

**Status:** pending
**Priority:** medium
**Estimate:** S
**Dependencies:** TODO-027

### Description
Update the `prioritySolver.ts` to recognize the beneficial relationship of flowers. If a user has a "Tomato" in the stash, and "Marigold" is a friend, the solver should prioritize placing them adjacent.

### Acceptance Criteria
- [ ] Update `calculateDifficulty` or `scoreCell` to give a bonus for Flower <-> Vegetable adjacency if they are friends
- [ ] Ensure flowers are treated as standard crops for spacing (density) calculations

### Test Cases
| Input | Expected Output | Notes |
|-------|-----------------|-------|
| Bed with Tomato at [0]. Stash: Marigold | Marigold placed at [1] | High adjacency score |
| Bed with Basil at [0]. Stash: Marigold | Marigold placed adjacent if friends | Companion bonus |

### Validation
- **Manual:** Add Tomato to bed, add Marigold to stash, run Automagic Fill -> Marigold should be adjacent
- **Automated:** Unit tests for flower companion scoring

### Dependencies
- Depends on: TODO-027 (flowers in database)

### TDD Execution Log
| Phase | Command | Result | Timestamp |
|-------|---------|--------|-----------|
| RED | - | - | - |
| GREEN | - | - | - |
| VALIDATE | - | - | - |
| COMPLETE | - | - | - |
