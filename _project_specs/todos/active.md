# Active Todos

Current work in progress. Each todo follows the atomic todo format from base/SKILL.md.

---

## [TODO-021] Integration & Controls (Distribute Stash UI)

**Status:** in-progress
**Priority:** high
**Estimate:** M

### Description
Connect the Garden Stash UI to the new Priority Solver and update the user controls. Replace the "Automagic Fill" button with "Distribute Stash" button. Add a toggle for "Fill remaining gaps?" to optionally fill empty cells with compatible companions after placing the stash.

**UX Flow:**
1. User builds stash using +/- controls in Crop Library
2. Stash Summary shows total area and crops
3. User clicks "Distribute Stash" button
4. Solver places stash crops optimally
5. (Optional) If "Fill remaining gaps" is ON, solver fills leftover cells with compatible crops
6. User sees placement report (successes and failures)

### Acceptance Criteria
- [ ] Move "Automagic Fill" button to Stash Summary component
- [ ] Rename button to "Distribute Stash" (or "Place My Garden")
- [ ] Disable button when stash is empty
- [ ] Add toggle: "Fill remaining gaps?" (default: OFF)
- [ ] Connect `handleDistributeStash` to call new `autoFillFromStash` solver
- [ ] Display placement report after distribution:
  - Success message: "Placed 12 crops successfully!"
  - Failure warning: "Could not place 3 crops due to space/conflicts"
  - List failed crops with reasons
- [ ] Clear stash after successful distribution (or keep and allow retry?)
- [ ] Add loading spinner during solver execution (for large beds)
- [ ] Add "Undo" button to revert last distribution
- [ ] Update unit tests for new handler logic

### Validation
- Manual: Add 4 Tomato to stash, click "Distribute", verify all placed and stash cleared
- Manual: Add 50 crops to 32-cell bed, verify placement report shows 32 placed / 18 failed
- Manual: Toggle "Fill gaps" ON, distribute 10 crops, verify remaining cells filled with companions
- Manual: Test undo button reverts to previous bed state
- Automated: Integration tests for full stash → distribute → clear workflow

### Test Cases
| Input | Expected Output | Notes |
|-------|-----------------|-------|
| Empty stash | "Distribute Stash" button disabled | Validation |
| Stash with 4 Tomato | Button enabled | Validation |
| Click "Distribute" with valid stash | Crops placed, success message shown | Happy path |
| Click "Distribute" with overfilled stash | Partial placement, failure warning shown | Overflow handling |
| Toggle "Fill gaps" ON, distribute 10 crops in 32 cells | 10 stash crops + 22 gap-fill crops placed | Gap fill feature |
| Toggle "Fill gaps" OFF, distribute 10 crops | Only 10 placed, 22 cells remain empty | Gap fill disabled |
| Click "Undo" after distribution | Bed reverts to pre-distribution state | Undo functionality |

### Dependencies
- Depends on: TODO-019 (Stash state) complete
- Depends on: TODO-020 (Priority Solver) complete
- Blocks: None (completes the Garden Stash feature)

### Technical Notes
**Handler Implementation:**
```typescript
function handleDistributeStash() {
  if (Object.keys(stash).length === 0) return; // Button should be disabled anyway

  setIsLoading(true);

  // Phase 1: Place stash crops
  const stashResult = autoFillFromStash(
    currentLayout.boxes[0].bed, // Iterate all boxes using autoFillAllBoxes
    stash,
    crops,
    currentLayout.boxes[0].width
  );
  
  // NOTE: TODO-020 added `autoFillAllBoxes`, use that instead.

  // Phase 2: Fill gaps (if enabled)
  // ... gap fill logic ...

  // Update bed state
  setAllBoxes(newLayout.boxes); // Batch update

  // Show results
  showPlacementReport(stashResult, gapFillResult);
  clearStash();
  setIsLoading(false);
}
```
