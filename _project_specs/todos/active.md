# Active Todos

Current work in progress. Each todo follows the atomic todo format from base/SKILL.md.

---

## [TODO-022] Refactor to React Context (Stop Prop Drilling)

**Status:** completed
**Priority:** critical
**Estimate:** L

### Description
Refactored application state management from prop drilling to React Context. App.tsx no longer manually passes state through multiple component layers. All state is now centralized in GardenProvider and accessible via useGardenContext().

**The Solution:**
- Created `GardenProvider` wrapping the app
- Components consume `useGardenContext()` directly
- Cleaner component hierarchy, easier feature additions

### Acceptance Criteria
- [✅] Create `src/context/GardenContext.tsx` with GardenProvider
- [✅] Move useLayoutManager state to context
- [✅] Move useGardenInteractions state to context
- [✅] Move useProfiles state to context
- [✅] Wrap App in `<GardenProvider>` (main.tsx)
- [✅] Refactor App.tsx to consume context directly
- [✅] All 251 tests pass
- [✅] Update CODE_INDEX.md with context architecture

### Results
- **All 251 tests passing** ✅
- **App.tsx simplified**: 257 lines (down from ~295 with complex hook orchestration)
- **Prop drilling eliminated**: Components access state directly via context
- **Centralized state management**: All hooks managed in single GardenProvider
- **Future-proof**: Adding new state is trivial (just add to context)

### TDD Execution Log
| Phase | Command | Result | Timestamp |
|-------|---------|--------|-----------|
| GREEN | Create GardenContext, refactor App.tsx | Files created/updated | 2026-01-11 |
| GREEN | Update main.tsx, App.test.tsx, splitbrain tests | Wrapped in GardenProvider | 2026-01-11 |
| VALIDATE | npm test -- --run | 251 tests PASS ✅ | 2026-01-11 |
| COMPLETE | Update CODE_INDEX.md | Documented context architecture | 2026-01-11 |

### Technical Notes
**Files Changed:**
1. **Created**: `src/context/GardenContext.tsx` (237 lines)
   - GardenProvider component
   - useGardenContext hook
   - GardenContextValue interface

2. **Modified**: `src/main.tsx`
   - Wrapped App in GardenProvider

3. **Modified**: `src/App.tsx`
   - Removed all hook initialization (useLayoutManager, useGardenInteractions, useProfiles, migrations)
   - Added single useGardenContext() call
   - Eliminated prop drilling

4. **Modified**: `src/App.test.tsx`
   - Added renderApp() helper with GardenProvider wrapper
   - All tests passing

5. **Modified**: `src/components/SettingsModal.splitbrain.test.tsx`
   - Added renderApp() helper
   - Fixed context requirement

6. **Modified**: `CODE_INDEX.md`
   - Added "React Context Architecture" section
   - Documented usage patterns and benefits

**Benefits Achieved:**
1. ✅ Eliminated 20+ props from App.tsx
2. ✅ Made adding new state trivial (just add to context)
3. ✅ Components are self-contained
4. ✅ Follows React best practices for complex state
5. ✅ All tests passing (no regressions)

---

**Next Priority TODOs (from backlog.md):**
- TODO-023: Solver Determinism (Remove Math.random()) - **CRITICAL**
- TODO-024: Zod Validation for LocalStorage - **CRITICAL**
- TODO-025: Debounce LocalStorage Writes - **HIGH**
