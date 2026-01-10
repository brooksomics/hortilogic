# Feature 002: Interactive Garden Bed

## Context
Now that the core logic types exist, we need the visual interface.
This feature implements the 4'x8' "Square Foot Gardening" grid and allows the user to "plant" crops into specific cells.

## Requirements

### 1. State Management (The Garden Store)
- Create a `useGarden` hook (backed by LocalStorage) that manages:
  - `currentBed`: The state of the 32 cells (occupied vs empty).
  - `gardenProfile`: The user's frost dates (default to null/standard for now).
- Actions: `plantCrop(cellIndex, cropId)`, `removeCrop(cellIndex)`, `clearBed()`.

### 2. The Crop Library (UI)
- A simple sidebar or drawer displaying a list of "Test Crops" (Hardcoded array of ~5 crops from F001).
- Clicking a crop sets it as the "Active Selection."

### 3. The Grid Component (Interactive)
- Render a CSS Grid (4 columns x 8 rows).
- **Empty State:** Clicking an empty cell "plants" the Active Selection.
- **Occupied State:** Visualizes the crop name and `sfg_density` (e.g., "Carrots x16").
- **Visual Feedback:** - If the crop is "In Season" (using F001 logic), show green.
  - If "Out of Season" (based on Frost Date), show a warning color/icon.

## Acceptance Criteria
1. User can click a "Carrot" button, then click a grid cell, and see "Carrots" appear there.
2. Reloading the page **preserves the grid state** (LocalStorage).
3. "Planting" a crop triggers the `isCropViable` check from Feature 001 (console log or visual warning is fine for now).
