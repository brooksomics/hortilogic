# Active Todos

Current work in progress. Each todo follows the atomic todo format from base/SKILL.md.

---

## [TODO-026] V2 Data Schema Migration

**Status:** pending
**Priority:** high
**Estimate:** S

### Description
Update the `Crop` interface in `src/types/garden.ts` to support the new "Smart Crop" metadata. This is a breaking change for the type system, so we must also update the existing `crops.ts` with placeholder values to ensure the build passes before we do the full data population.

### Acceptance Criteria
- [ ] Update `Crop` interface with new fields:
  - `type`: 'vegetable' | 'herb' | 'flower'
  - `botanical_family`: string (botanical family)
  - `sun`: 'full' | 'partial' | 'shade'
  - `days_to_maturity`: number (optional for MVP, but good to have)
- [ ] Update `CROP_DATABASE` in `src/data/crops.ts` to include these fields (using real data)
- [ ] Verify application builds and runs without TypeScript errors

### Validation
- **Automated:** `npm run typecheck` must pass
- **Automated:** Existing unit tests for `crops.ts` must pass

### Test Cases
| Input | Expected Output | Notes |
|-------|-----------------|-------|
| `npm run typecheck` | 0 errors | Type safety check |
| `npm test crops.test.ts` | All tests pass | Data validation |
| App loads in browser | No runtime errors | Integration check |

### Dependencies
- Blocks: TODO-027, TODO-028, TODO-029

### TDD Execution Log
| Phase | Command | Result | Timestamp |
|-------|---------|--------|-----------|
| RED | - | - | - |
| GREEN | - | - | - |
| VALIDATE | - | - | - |
| COMPLETE | - | - | - |

---

## [TODO-027] Populate Expanded Crop Database

**Status:** pending
**Priority:** high
**Estimate:** L
**Dependencies:** TODO-026

### Description
Replace the current 50-crop database with a comprehensive dataset of 100-200 crops (targeting 200, minimum 100). This involves expanding the list to include more varieties, flowers, and herbs, and ensuring all "friend/enemy" references use valid IDs.

### Acceptance Criteria
- [ ] `CORE_50_CROPS` renamed to `CROP_DATABASE`
- [ ] Database contains 100-200 crops (targeting 200)
- [ ] Database contains at least 10 common flowers (Marigold, Nasturtium, Borage, Calendula, Alyssum, etc.)
- [ ] Database contains at least 15 common herbs
- [ ] All `botanical_family` fields are populated correctly (e.g., Tomato = Solanaceae)
- [ ] All `friends` and `enemies` arrays only contain IDs that actually exist in the database (integrity check)
- [ ] All crops have accurate `type`, `sun`, and `days_to_maturity` values

### Test Cases
| Input | Expected Output | Notes |
|-------|-----------------|-------|
| `CROP_DATABASE.length` | >= 100 (target 200) | Database size |
| `CROP_DATABASE.filter(c => c.type === 'flower').length` | >= 10 | Flowers added |
| `CROP_DATABASE.filter(c => c.type === 'herb').length` | >= 15 | Herbs added |
| `CROP_DATABASE.find(c => c.id === 'marigold')` | Returns crop object | Verify flowers |
| `CROP_DATABASE.find(c => c.id === 'tomato').botanical_family` | "Solanaceae" | Verify metadata |
| Integrity Check | All companion IDs exist in DB | Prevent broken links |

### Validation
- **Manual:** Browse crop library, verify data accuracy
- **Automated:** Unit tests for data integrity (all companion IDs valid)

### Dependencies
- Depends on: TODO-026 (schema migration)
- Blocks: TODO-028, TODO-029

### TDD Execution Log
| Phase | Command | Result | Timestamp |
|-------|---------|--------|-----------|
| RED | - | - | - |
| GREEN | - | - | - |
| VALIDATE | - | - | - |
| COMPLETE | - | - | - |

---

## [TODO-028] Refactor CropLibrary UI (Taxonomy & Filtering)

**Status:** pending
**Priority:** medium
**Estimate:** M
**Dependencies:** TODO-027

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
| RED | - | - | - |
| GREEN | - | - | - |
| VALIDATE | - | - | - |
| COMPLETE | - | - | - |

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
