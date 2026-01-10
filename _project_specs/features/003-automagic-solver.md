# Feature 003: The "Automagic" Solver

## Context
The core value prop: A "Feeling Lucky" button that intelligently fills empty grid slots.
This transforms the app from a passive layout tool into an active recommendation engine.

## Requirements

### 1. Data Structure Updates
- Update `Crop` interface to include simple companion rules:
  ```typescript
  companions: {
    friends: string[]; // List of Crop IDs
    enemies: string[]; // List of Crop IDs (Hard constraint)
  }
  ```

- Update your Mock Data to include a few constraints (e.g., "Beans" hate "Onions").

### 2. The Neighbor Logic (Adjacency Check)

- Implement `getNeighbors(grid, cellIndex)`: Returns the Crop IDs of the 4 adjacent cells (Up, Down, Left, Right).
- Implement `checkCompanionConstraints(candidateCrop, neighborCropIds)`:
  - Returns `FALSE` if any neighbor is in the `candidateCrop.enemies` list.
  - Returns `TRUE` otherwise.

### 3. The Solver Algorithm (`autoFillBed`)

- **Input:** Current Grid State, Garden Profile, Crop Library.
- **Process:**
  1. Identify all `Empty` cells.
  2. Filter Crop Library for `isCropViable` (Seasonality check from F001).
  3. **Sort** the viable list by a simple heuristic (e.g., Random shuffle for "Feeling Lucky" or "Crop Priority" if available).
  4. Iterate through empty cells:
     - Check neighbors.
     - If compatible: Plant crop.
     - If conflict: Try next crop in list.
     - If no fit: Leave empty.

### 4. UI Implementation

- Add an "✨ Automagic Fill" button to the toolbar.
- When clicked, it runs the solver and updates the grid state in one batch.

## Acceptance Criteria

1. Clicking "Automagic" fills empty squares with *only* seasonally valid crops.
2. The solver **never** places "Enemies" next to each other (e.g., if you have Beans, it won't put Onions next to them).
3. Existing manual plantings (from F002) are preserved (not overwritten).
