# Feature 001: Core Logic Engine (Universal)

## Context
A desktop-first React application for high-density garden planning.
The core requirement is a "Parametric Scheduling Engine" that calculates planting dates relative to a user's Frost Dates, not hard-coded calendar months.

## Requirements

### 1. Data Structures (Types)
- Define `GardenProfile` interface:
  - `last_frost_date`: string (ISO Date)
  - `first_frost_date`: string (ISO Date)
  - `season_extension_weeks`: number (default 0)
- Define `Crop` interface:
  - `id`: string
  - `sfg_density`: number (plants per sq ft)
  - `planting_strategy`: object containing:
    - `start_window_start`: number (Weeks relative to Last Frost. Negative = before, Positive = after)
    - `start_window_end`: number

### 2. The Logic Engine (Pure Functions)
- `calculatePlantingDate(lfd: Date, offsetWeeks: number): Date`
- `isCropViable(crop: Crop, currentProfile: GardenProfile, targetDate: Date): boolean`

### 3. Visualization (The Bed)
- A 4'x8' CSS Grid component (32 cells).
- Cells must accept a "Crop" object and display its name and density.

## Acceptance Criteria (Tests)
1. `calculatePlantingDate` correctly subtracts weeks from a given LFD.
2. `isCropViable` returns TRUE if the target date falls within the calculated window.
3. `isCropViable` returns TRUE if `season_extension_weeks` shifts the date into the valid window.
