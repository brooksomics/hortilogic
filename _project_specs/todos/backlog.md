# Backlog

Future work, prioritized. Move to active.md when starting.

---

## [TODO-004] Implement Feature 004: User Configuration & Settings

**Status:** pending
**Priority:** high
**Estimate:** M

### Description
Unlock the parametric engine by allowing users to configure their own frost dates, hardiness zone, and season extension settings. Currently hardcoded to Denver/San Francisco dates - need to make it work for any location (e.g., Escondido).

### Acceptance Criteria
- [ ] User can open Settings modal and change "Last Frost Date" from May 15 to Jan 15
- [ ] Changing frost dates immediately updates "Viability" status of crops in Library
- [ ] Settings persist on page reload (LocalStorage)
- [ ] Date validation prevents Last Frost after First Frost
- [ ] Season extension field accepts 0-8 weeks

### Validation
- Manual: Open Settings, change dates, verify crop viability indicators update
- Automated: Test Settings modal, profile updates, LocalStorage persistence

### Test Cases
| Input | Expected Output | Notes |
|-------|-----------------|-------|
| Change Last Frost to Jan 15 | Viability updates in real-time | Escondido climate |
| Add +2 weeks season extension | Planting windows extend by 2 weeks | Hoop house scenario |
| Reload page | Settings retained | LocalStorage persistence |
| Set Last Frost after First Frost | Validation error shown | Invalid date range |
| Reset to defaults | Return to zone defaults | Reset button |

### Dependencies
- Depends on: F001 (Core Logic), F002 (Interactive Grid)
- Blocks: None

### TDD Execution Log
| Phase | Command | Result | Timestamp |
|-------|---------|--------|-----------|
| RED | - | - | - |
| GREEN | - | - | - |
| VALIDATE | - | - | - |
| COMPLETE | - | - | - |

### Technical Notes
- Create SettingsModal component (use Headless UI or Radix for accessibility)
- Update GardenProfile interface with name, season_extension_weeks
- Store settings separately from bed layout in LocalStorage
- Use HTML5 date inputs or date picker library
- Settings changes should trigger React re-render

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
