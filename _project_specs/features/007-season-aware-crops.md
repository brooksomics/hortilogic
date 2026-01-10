# Feature 007: Season-Aware Crop Selection

## Context
The app has viability logic (`isCropViable()` in `dateEngine.ts`) that determines which crops can be planted based on frost dates and planting windows. However, this logic is not exposed in the Crop Library UI, forcing users to mentally calculate which crops are in season. This creates a clunky experience where users have to guess which crops are appropriate for their current planting timeframe.

## Problem Statement
Currently:
- Hardiness Zone is used as a proxy for location (not user-friendly)
- No way to specify "when I plan to start planting from seed"
- Crop Library shows all crops without visual indication of seasonality
- No way to filter out crops that aren't currently plantable

This makes the app less useful for real-world garden planning.

## Requirements

### 1. Enhanced Settings
- Add **Location** field (optional string, e.g., "Denver, CO" or "Escondido, CA")
  - More user-friendly than hardiness zone alone
  - Provides context for gardeners
- Add **Target Planting Date** field (ISO date string, defaults to today)
  - "When do you plan to start planting from seed?"
  - Used as reference date for viability calculations
  - Can be changed at any time (e.g., planning for next season)

### 2. Visual Viability Indicators in Crop Library
For each crop displayed, show visual status based on `isCropViable(crop, profile, targetDate)`:
- **Viable (Green)**: Crop is within its planting window
  - Green border (`border-green-500`)
  - Green background tint (`bg-green-50`)
  - CheckCircle icon
  - Aria-label: "Plantable now"
- **Marginal (Orange)**: Crop is outside ideal window but could work with season extension
  - Orange border (`border-orange-400`)
  - Orange background tint (`bg-orange-50`)
  - AlertCircle icon
  - Aria-label: "Requires season extension"
- **Not Viable (Gray/Red)**: Crop is well outside planting window
  - Gray border (`border-gray-300`)
  - Reduced opacity (`opacity-60`)
  - XCircle icon
  - Aria-label: "Out of season"

### 3. Season Filter
- Add toggle/checkbox: "Hide out-of-season crops"
- When enabled, only show crops with viable/marginal status
- Filter state persists in component (not LocalStorage for MVP)

### 4. Real-time Reactivity
- Changing frost dates in Settings immediately updates crop viability colors
- Changing target planting date immediately updates crop viability colors
- No page reload required

## Acceptance Criteria
1. User can set a "Location" name in Settings (e.g., "My Backyard in Austin")
2. User can set a "Target Planting Date" in Settings (defaults to today's date)
3. Crops in Library display color-coded borders and icons based on viability
4. User can toggle "Hide out-of-season crops" to filter the library
5. Viability indicators update immediately when Settings change
6. Viability status is accessible (icons + text labels, not just color)
7. Settings persist to LocalStorage

## Implementation Notes
- **Priority**: HIGH - Major UX improvement that makes the app actually useful
- **Dependencies**:
  - Depends on F004 (User Settings) being re-enabled (see TODO-009)
  - Enhances F006 (Expanded Crop Database) - better with more crops
- **Estimated Complexity**: Medium (M)

## Test Cases
| Scenario | Input | Expected Output |
|----------|-------|-----------------|
| Set target date to March 15 (before LFD April 15) | View lettuce (plantable -4 to +2 weeks) | Lettuce shows green (viable) |
| Set target date to July 1 (after planting window) | View lettuce | Lettuce shows gray (not viable) |
| Toggle "Hide out-of-season" ON | Library filtered | Only green/orange crops visible |
| Change LFD from April 15 to March 1 | No page reload | Crop colors update immediately |
| Change Target Planting Date | Move from March to June | Crop viability colors update |
| Screen reader navigation | Navigate crop list | Status announced as text ("Plantable now", "Out of season") |
| Reload page after setting location | Check LocalStorage | Location and target date persist |

## Architecture Considerations
- **Data Model**: Extend `GardenProfile` with:
  - `location?: string` (optional, for display only)
  - `targetPlantingDate: string` (ISO date, defaults to today)
- **Helper Functions**: Create `src/utils/cropViabilityHelper.ts`:
  - `getCropViabilityStatus(crop, profile, date): 'viable' | 'marginal' | 'not-viable'`
  - `getViabilityStyles(status): { className, icon, label }`
- **Component Updates**:
  - `Settings.tsx`: Add location and target date fields
  - `CropLibrary.tsx`: Add viability indicators and filter toggle
  - `App.tsx`: Pass `currentProfile` and `targetDate` to CropLibrary
- **Accessibility**:
  - Use semantic color tokens for theming
  - Include icon + text label for each status (not just color)
  - Add legend/key explaining color coding

## Design Decisions
- **Global vs Per-Layout Target Date**:
  - MVP: Global setting (simpler)
  - Future: Could be per-layout (e.g., "Spring 2026" targets March 1, "Fall 2026" targets August 15)
- **Marginal Status Logic**:
  - For MVP: Show orange for crops just outside window (±1 week tolerance)
  - Future: Could factor in season_extension_weeks to determine marginal threshold
- **Filter Persistence**:
  - MVP: Filter state not persisted (resets on page load)
  - Future: Save filter preference to LocalStorage

## Future Enhancements (Out of Scope)
- Auto-detect location from browser geolocation API
- USDA Zone lookup by ZIP code to pre-fill frost dates
- Per-layout target planting dates (instead of global)
- Succession planting recommendations (e.g., "Plant lettuce every 2 weeks")
- Calendar view showing planting windows for all crops
- "Notify me when X is in season" reminders
- Export planting schedule as calendar (.ics) file

## Success Metrics
- User can identify plantable crops at a glance (no mental calculation)
- Reduced cognitive load when planning seasonal gardens
- Increased user retention (app becomes more useful)
- Positive feedback: "This makes planning so much easier!"
