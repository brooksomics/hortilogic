# Feature 004: User Configuration & Settings

## Context
While the logic engine (F001) supports variable frost dates, the UI currently hardcodes them.
This feature provides a "Settings" modal allowing the user to configure their specific environment (Zip Code, Frost Dates, Season Extension).

## Requirements

### 1. Data & State
- Update `GardenProfile` interface (if needed) to ensure it captures:
  - `name`: string (e.g. "Backyard Bed")
  - `hardiness_zone`: string (e.g. "10b")
  - `last_frost_date`: string (ISO)
  - `first_frost_date`: string (ISO)
  - `season_extension_weeks`: number (0-8)
- Update `useGarden` hook to persist these settings to LocalStorage separately from the Bed layout.

### 2. Settings UI Component
- Create a `SettingsModal` component (Dialog/Overlay).
- **Inputs:**
  - Date Pickers for First/Last Frost.
  - Number Input for "Season Extension" (e.g., "I use hoop houses: +2 weeks").
  - (Optional) "Autofill from Zone" helper (can be mocked for now).
- **Access:** Add a "⚙️ Settings" button to the main header.

### 3. Integration
- When settings change, the `GardenBed` and `CropLibrary` must re-render immediately.
- Visual indicators (Green/Orange/Red) on the grid must update based on the new dates.

## Acceptance Criteria
1. User can open Settings and change "Last Frost Date" from May 15 to Jan 15.
2. Changing the date immediately updates the "Viability" status of crops in the Library.
3. Settings persist on page reload (LocalStorage).

## Implementation Notes
- **Priority**: HIGH - This unlocks the parametric engine for user-specific locations
- **Dependencies**: Builds on F001 (Core Logic) and F002 (Interactive Grid)
- **Estimated Complexity**: Medium (M)

## Test Cases
| Scenario | Input | Expected Output |
|----------|-------|-----------------|
| Change Last Frost Date | Set to Jan 15 (Escondido) | Viability indicators update in real-time |
| Season Extension | Add +2 weeks | Planting windows extend by 2 weeks |
| Settings Persistence | Reload page | Settings retained from LocalStorage |
| Invalid Date | Set Last Frost after First Frost | Show validation error |
| Reset to Defaults | Click "Reset" | Return to zone-based defaults |

## Architecture Considerations
- Settings should be stored separately from bed layout in LocalStorage
- Consider using a modal library (Headless UI, Radix) for accessibility
- Date pickers should be touch-friendly for mobile
- Settings changes should trigger React state updates to force re-render

## Future Enhancements (Out of Scope)
- Auto-detect location from browser geolocation API
- USDA Zone lookup by ZIP code
- Historical frost date data integration
- Multiple garden profile support
