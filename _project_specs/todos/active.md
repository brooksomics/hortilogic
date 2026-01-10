# Active Todos

Current work in progress. Each todo follows the atomic todo format from base/SKILL.md.

---

## [TODO-012] Settings Not Persisting - Profile Updates Lost on Modal Close

**Status:** in-progress
**Priority:** critical
**Estimate:** S

### Description
Settings modal does not persist changes when "Save" is clicked. After clicking Save and reopening Settings, all fields revert to default values. This breaks core functionality as users cannot configure their garden profile (frost dates, zone, location, target planting date).

### User Story
"As a gardener, when I click 'Save' in Settings after changing my hardiness zone, frost dates, or target planting date, I expect those changes to persist so that when I reopen Settings, my saved values are displayed - not the defaults."

### Acceptance Criteria
- [ ] **Settings Persist**: Changes made in Settings modal are saved to localStorage
- [ ] **Settings Reload**: Reopening Settings shows previously saved values, not defaults
- [ ] **Profile Updates**: GardenProfile in localStorage is updated with new values
- [ ] **Real-time Updates**: Crop viability indicators update immediately when settings change
- [ ] **All Fields Persist**: Location, target planting date, frost dates, zone, season extension all save correctly

### Validation
- Manual: Change zone from 5b to 10a, click Save, reopen Settings → should show 10a
- Manual: Change target planting date to Feb 1, click Save, reopen Settings → should show Feb 1
- Manual: Change frost dates, click Save, verify crop viability colors update
- Automated: Add integration test for Settings persistence flow

### Test Cases
| Input | Expected Output | Notes |
|-------|-----------------|-------|
| Open Settings, change zone to 10a, click Save | localStorage updated with zone 10a | Profile persists |
| Reopen Settings after saving zone 10a | Zone field shows 10a (not 5b) | Values reload from storage |
| Change LFD from May 15 to Feb 1, click Save | Crop viability updates immediately | Real-time reactivity |
| Change target planting date, click Save, reload page | Date persists after page reload | Survives browser refresh |
| Click Save with validation error | Error shown, values NOT saved | Invalid data rejected |

### Dependencies
- Depends on: useProfiles hook (src/hooks/useProfiles.ts)
- Depends on: useGardenInteractions hook (src/hooks/useGardenInteractions.ts)
- Related to: TODO-011 (Settings enhancements just added)

### TDD Execution Log
| Phase | Command | Result | Timestamp |
|-------|---------|--------|-----------|
| RED | - | - | - |
| GREEN | - | - | - |
| VALIDATE | - | - | - |
| COMPLETE | - | - | - |

### Technical Notes
**Suspected Root Cause:**
- Settings modal calls `onSave(formData)` on submit
- `onSave` is passed from `useGardenInteractions.handleSettingsSave`
- `handleSettingsSave` calls `updateProfile(activeLayout.profileId, updatedProfile)`
- Possible issue: profile not getting updated in localStorage, or wrong profile ID being used

**Investigation Steps:**
1. Check if `handleSettingsSave` is actually calling `updateProfile` (add console.log)
2. Verify `updateProfile` in `useProfiles.ts` is updating localStorage correctly
3. Check if `getProfile` is returning stale cached data instead of updated profile
4. Verify `activeLayout.profileId` matches the profile being updated
5. Check if React state is updating to trigger re-render with new profile

**Potential Fixes:**
- Ensure `updateProfile` triggers re-render by updating profileStorage state
- Verify localStorage is being written (check browser DevTools → Application → Local Storage)
- Check if profile reference is updating correctly in App.tsx
- May need to force re-fetch profile after save

**Files to Check:**
- `src/hooks/useProfiles.ts` - updateProfile implementation
- `src/hooks/useGardenInteractions.ts` - handleSettingsSave
- `src/components/SettingsModal.tsx` - onSave callback
- `src/App.tsx` - how profile is passed to Settings

**Estimated effort:** 30-60 minutes (small bug fix)

---

<!-- Moved TODO-011 to completed.md (2026-01-10) -->
