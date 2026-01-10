# Feature 005: Layout Management (Save/Load)

## Context
Currently, we only store one "Current Bed." Users need to manage multiple layouts (e.g., "Spring Plan" vs "Fall Plan").

## Requirements

### 1. Storage Schema Update
- Migrate LocalStorage structure from single object to:
  ```typescript
  interface StorageSchema {
    activeLayoutId: string;
    layouts: Record<string, GardenLayout>; // Keyed by ID
    profiles: Record<string, GardenProfile>; // Support multiple profiles later
  }

  interface GardenLayout {
    id: string;
    name: string;
    createdAt: string; // ISO timestamp
    updatedAt: string; // ISO timestamp
    bed: (Crop | null)[];
    profileId?: string; // Reference to garden profile (future)
  }
  ```

### 2. UI Updates
- Add a "Layout Selector" dropdown to the header.
- Add "New Layout", "Rename", and "Delete" actions.
- Add "Duplicate Layout" (useful for succession planning).

### 3. Migration Strategy
- Detect old LocalStorage schema on first load.
- Auto-migrate existing "currentBed" to a layout named "My Garden".
- Preserve all existing data during migration.

## Acceptance Criteria
1. User can create a new blank layout named "Fall 2026".
2. User can switch between "Spring" and "Fall" layouts without losing data.
3. Active layout persists on reload.
4. User can duplicate "Spring" layout to create "Spring Copy" for experimentation.
5. User can rename layouts.
6. User can delete layouts (with confirmation if it's the active one).
7. Existing users' data migrates automatically without data loss.

## Implementation Notes
- **Priority**: MEDIUM - Enables multi-season planning
- **Dependencies**: Can be built independently of F004, but F004 should go first
- **Estimated Complexity**: Medium-Large (M-L)

## Test Cases
| Scenario | Input | Expected Output |
|----------|-------|-----------------|
| Create New Layout | Click "New Layout", enter "Fall 2026" | New empty layout created and activated |
| Switch Layouts | Select "Spring" from dropdown | Spring layout displayed, Fall preserved |
| Duplicate Layout | Duplicate "Spring" | "Spring Copy" created with identical crops |
| Rename Layout | Rename "Spring Copy" to "Test Plan" | Layout renamed, data preserved |
| Delete Layout | Delete "Test Plan" | Layout removed, switch to default |
| Delete Active Layout | Delete currently active layout | Show confirmation, switch to another layout |
| Migration | Load with old schema | Auto-migrate to new schema, data intact |
| Persistence | Reload page | Active layout ID and all layouts restored |

## Architecture Considerations
- Use UUID or timestamp-based IDs for layouts
- Implement defensive migration code (validate old schema before migration)
- Consider "Export/Import" functionality for backup (future)
- Layout selector should show creation date or last modified
- Prevent deleting the last remaining layout (always keep at least one)

## Migration Checklist
- [ ] Create migration utility function
- [ ] Test migration with various old schema states
- [ ] Add version number to storage schema
- [ ] Log migration events to console for debugging
- [ ] Provide fallback if migration fails

## Future Enhancements (Out of Scope)
- Export/Import layouts as JSON files
- Cloud sync for layouts (requires backend)
- Layout templates (e.g., "Container Garden", "Raised Bed 4x8")
- Layout history/undo functionality
- Sharing layouts with other users
- Seasonal succession planning wizard
