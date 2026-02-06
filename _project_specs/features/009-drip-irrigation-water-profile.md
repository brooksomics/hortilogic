# Feature 009: Drip Irrigation Water Profile Optimization

## Context
Raised bed gardeners commonly use drip emitter tubing (e.g., 1/2" pressure-compensating drip line with 12" emitter spacing) to irrigate their beds. A single run of tubing delivers uniform water along an entire row. An optional inline valve can throttle the flow to the whole line, but every plant on that line receives the same amount of water.

This creates a real-world physical constraint: **all crops on the same row should have similar water needs.** Placing drought-tolerant rosemary on the same drip line as water-hungry celery wastes water and stresses one or both plants.

Currently, the solver optimizes for companion planting friendliness (friends/enemies adjacency), crop diversity, flower density, and seasonal viability. Friendliness is not a reliable proxy for water needs -- tomato and basil are companions but have different water preferences. Adding a water profile enables a second, orthogonal optimization axis that directly maps to how drip irrigation physically works.

## Problem Statement
Currently:
- The `Crop` interface has no water-related field
- The solver has no concept of row-level constraints (only cell-level adjacency)
- Users must mentally group crops by water needs when planting along drip lines
- Mismatched water needs on a single drip line leads to over- or under-watering
- No visual indication of how drip tubing maps to the garden grid

This limits the app's usefulness for gardeners using drip irrigation (the majority of raised bed growers).

## Requirements

### 1. Data Model Update (TODO-030)
- Add `water_need` field to the `Crop` interface:
  ```typescript
  water_need: 1 | 2 | 3 | 4 | 5
  // 1 = drought-tolerant (rosemary, thyme, lavender)
  // 2 = low (carrots, onions, garlic)
  // 3 = moderate (tomatoes, peppers, beans)
  // 4 = high (lettuce, basil, celery, cucumbers)
  // 5 = very high (watercress, mint in wet soil)
  ```
- Populate `water_need` for all crops in `CROP_DATABASE`
- Add data integrity tests (every crop has a valid water_need 1-5)

### 2. Row-Aware Water Scoring in Solver (TODO-031)
- Add a **row-level variance penalty** to the solver scoring:
  - After placing a crop, compute the water_need variance across the row
  - Penalize placements that increase row variance beyond a threshold
  - Weight: configurable, but default to meaningful influence without overriding companion scoring
- Both `companionEngine.ts` and `prioritySolver.ts` must incorporate this
- The constraint is row-level (horizontal), not cell-level adjacency

### 3. Drip Line Visualization UI (TODO-032)
- Render horizontal drip line indicators on the garden grid (one per row)
- Color-code rows by average water intensity (e.g., blue gradient: light=low, dark=high)
- Show inline valve icon at the start of each row
- Display assumption note below each bed:
  `*Drip layout assumes Earthline Brown PC 1-GPH tubing with 12" emitter spacing`
- Optional: show per-row water need summary on hover/tap (e.g., "Row 2: avg 3.2 water need")

## Acceptance Criteria
1. Every crop in the database has a `water_need` score (1-5)
2. The solver penalizes placing crops with very different water needs on the same row
3. The grid UI shows drip lines overlaid on each row
4. Rows are color-coded by water intensity
5. An assumption note about the drip tubing is displayed below each bed
6. Existing companion planting, diversity, and flower density optimizations still work
7. All tests pass with coverage >= 80%

## Implementation Notes
- **Priority**: MEDIUM - Significant user value for drip irrigation gardeners
- **Dependencies**:
  - No blocking dependencies (all prerequisite features complete)
  - Enhances F003 (Automagic Solver) - solver gains water awareness
  - Enhances F008 (Multi-Box) - each bed gets its own drip visualization
- **Estimated Complexity**: MEDIUM-LARGE (M-L)
  - TODO-030 (data): S-M (schema change + populating 200 crops)
  - TODO-031 (solver): M (new row-level constraint pattern)
  - TODO-032 (UI): M (visualization + color coding)

## Physical Model Reference
- **Tubing**: DIG Earthline Brown PC 1-GPH Pressure Compensating Drip Line
- **Emitter spacing**: 12 inches (1 per square foot in SFG)
- **Key property**: Pressure-compensating means uniform delivery along the entire run
- **Inline valve**: Small valve at the start of each run to throttle the entire line
- **Implication**: Each row = one drip run = uniform water delivery = crops should match

## Architecture Considerations
- **Data Model**: Add `water_need: 1 | 2 | 3 | 4 | 5` to `Crop` interface in `src/types/garden.ts`
- **Solver**: Row variance is a new constraint pattern (existing constraints are cell-level adjacency). Implementation approach:
  - Compute `rowWaterVariance(row_cells)` helper
  - Add variance penalty to `scoreCropForCell()` in companionEngine and `scoreCell()` in prioritySolver
  - Penalty formula: `-(variance * WATER_VARIANCE_WEIGHT)` where weight balances against companion score
- **UI Components**:
  - `DripLineOverlay` or inline rendering in `GardenBed.tsx`
  - Water intensity color scale (CSS gradient or Tailwind opacity classes)
  - Assumption footnote as a `<p>` below each bed

## Future Enhancements (Out of Scope)
- Per-row valve position tracking (actual GPH settings)
- Integration with smart irrigation controllers (Rachio, etc.)
- Soil moisture sensor data
- Evapotranspiration-based watering calculations
- Vertical drip runs (column-based irrigation)
- Micro-sprinkler zone support
- Water budget/cost estimation
