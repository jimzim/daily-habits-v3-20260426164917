# Daily Habits — v3

**Version:** 3.0 | 2026-04-26
**Platform:** React Native — Expo (iPhone, Android, web from one codebase)

A beautiful, native-feeling habit tracker. Add habits, mark them done with a satisfying tap, watch your 7-day grid fill in, swipe to delete. Should feel like Things 3 or Streaks — calm, deliberate, polished — not like a generic CRUD app.

---

## Design language (read this first)

This app should feel **finished**, not "smoke test quality." The reference points are Things 3, Streaks, Apple Reminders. Specifically:

- **Calm color palette.** Soft off-white background (`#FAFAF7` light / `#0F1115` dark), single accent color used sparingly (a deep teal `#0E7C7B` works well, or pick something equally restrained). Don't use pure white or pure black.
- **System fonts, real type scale.** Use San Francisco on iOS, Roboto on Android, system-ui on web. Title 28pt semibold, habit name 17pt regular, secondary text 13pt regular with reduced opacity. No more than 3 type sizes on screen.
- **Generous whitespace.** Comfortable line-heights (1.4 for body), real padding around content (24px horizontal min on phone), let things breathe.
- **Animation matters.** Marking a habit complete should animate the checkmark in (spring, ~250ms). The day-cell fill should ease in, not pop. Use `LayoutAnimation` or `react-native-reanimated` for any state-change visual.
- **Native primitives where they belong.** Swipe-to-delete uses `react-native-gesture-handler` Swipeable on native, with a satisfying red-background reveal. Bottom sheets / modals use `@gorhom/bottom-sheet` on native. Web gets equivalent functionality via different primitives but the native variants must NOT be downgraded to web's lowest common denominator.
- **Haptics on native.** Light impact when marking a habit complete. Medium impact when deleting. Use `expo-haptics`.

---

## User stories

### Adding a habit

- As a user, I tap a **prominent "+" button** at the bottom of the screen to add a new habit
  - [ ] Button is a circular floating action button, accent-colored, with a subtle shadow
  - [ ] Tapping it opens a bottom sheet (native) / centered modal (web) with a text input pre-focused
  - [ ] Sheet has clear "Add habit" header and Cancel / Save actions
  - [ ] Saving with empty input is impossible (Save button disabled)
  - [ ] Saving animates the new habit into the list at the top

### Marking habits done

- As a user, I tap anywhere on a habit row to mark it done for today
  - [ ] Today's day-cell fills with the accent color, animated (spring, ~250ms)
  - [ ] A checkmark fades in over the row briefly (200ms in, 800ms hold, 200ms out)
  - [ ] Light haptic feedback fires on native
  - [ ] Tapping again un-marks (toggle), reverses the animation

- As a user, I see my **last 7 days at a glance** as a horizontal grid on each habit row
  - [ ] 7 small rounded squares, ~16pt each, with 4pt gaps
  - [ ] Filled = done that day (accent color), empty = not done (subtle border, no fill)
  - [ ] Today's cell has a slightly thicker border to distinguish it
  - [ ] Day-of-week letter ("M T W T F S S") under each cell, dim, 11pt

### Deleting a habit

- As a user, I swipe a habit left to reveal a Delete action (native)
  - [ ] Smooth swipe driven by gesture-handler Swipeable
  - [ ] Red background reveals as I swipe with a trash icon and "Delete" label
  - [ ] Releasing past threshold deletes with a slide-out animation and medium haptic
  - [ ] Tapping the Delete button (mid-swipe) also confirms

- As a user on web, I see a small subtle delete icon on each row that slides in on hover
  - [ ] Trash icon button, accent-bordered, appears on row hover
  - [ ] Click confirms with a brief inline confirmation ("Tap again to delete") to prevent misclicks

### Empty state

- As a first-time user with no habits, I see a friendly empty state
  - [ ] Centered, vertically balanced
  - [ ] A small line illustration or large icon (a plant, a sun, a leaf — anything calm)
  - [ ] Title: "Start a daily habit"
  - [ ] Subtitle: "Tap the + below to add your first one"
  - [ ] No buttons in the empty state itself — the FAB does the work

### Header

- As a user, I see today's date prominently at the top
  - [ ] e.g. "Sunday, April 26" — 28pt semibold
  - [ ] Below that, a subtitle showing today's progress: "2 of 4 done" — 13pt, dim
  - [ ] If no habits yet: subtitle hidden

---

## Hybrid platform notes (lightweight)

This is a hybrid app — same codebase to iOS + Android + web. The native variants must NOT be downgraded for web compatibility. Specifically:

- Use `@gorhom/bottom-sheet` on iOS and Android. On web, render a centered modal in a `View` with overlay backdrop instead. Branch via `Platform.OS === 'web'` in the AddHabit component.
- Use gesture-handler `Swipeable` on iOS and Android for delete. On web, use the hover-icon pattern described above. Branch via `Platform.OS === 'web'` in the HabitRow component.
- Use AsyncStorage on native (`@react-native-async-storage/async-storage`). On web, use a simple in-memory Map (storage is ephemeral on web — that's fine, mention it nowhere in the UI). Use a `.web.ts` file split for the storage module.
- Use `expo-haptics` on native, no-op on web. Branch inline.

The web variant should still look beautiful — it just trades a bottom sheet for a modal and a swipe for a hover icon.

---

## Project structure

```
src/
  app/
    _layout.tsx            # SafeAreaProvider + GestureHandlerRootView (native)
    index.tsx              # Main screen
  components/
    Header.tsx             # Date + progress subtitle
    HabitList.tsx          # FlatList of HabitRow
    HabitRow.tsx           # Habit name + 7-day grid + tap-to-complete + swipe (native) / hover-delete (web)
    DayGrid.tsx            # The 7-day completion squares
    AddHabitFAB.tsx        # Floating action button
    AddHabitSheet.tsx      # Bottom sheet on native, modal on web
    EmptyState.tsx         # First-launch friendly empty state
  lib/
    storage.native.ts      # AsyncStorage-backed
    storage.web.ts         # In-memory Map
    types.ts               # Habit, CompletionRecord
    haptics.ts             # Wrapper around expo-haptics, no-op on web
    theme.ts               # Color palette, type scale, spacing tokens
```

---

## Technology stack

- Expo SDK with Expo Router (TypeScript template)
- `react-native` (View, Text, Pressable, TextInput, FlatList, Animated)
- `react-native-web` for the web variant
- `react-native-safe-area-context` for safe areas
- `react-native-gesture-handler` for Swipeable on native
- `@gorhom/bottom-sheet` for the add-habit sheet on native
- `react-native-reanimated` for animations (spring on completion, slide-out on delete)
- `@react-native-async-storage/async-storage` for native persistence (web uses in-memory shim)
- `expo-haptics` for native haptic feedback
- Maestro for native testing (iOS + Android)
- Playwright for web testing
- Vercel for web deploy

---

## Testing

### Maestro (iOS + Android, 7-min cap per platform)

1. **`add_habit_via_sheet`** — Open sheet, type, save
   - [ ] Tap `add-habit-fab`
   - [ ] (Sheet appears) tap `add-habit-input`, type "Drink water", `hideKeyboard:`
   - [ ] Tap `add-habit-save`
   - [ ] Assert habit row visible with text "Drink water"

2. **`mark_habit_complete`** — Tap to complete, verify cell fills
   - [ ] Add a habit (precondition)
   - [ ] Tap `habit-row-0`
   - [ ] Assert `habit-row-0-today-cell` has the `completed` test attribute

3. **`swipe_to_delete`** — Swipe-left, confirm
   - [ ] Add a habit
   - [ ] Swipe left on `habit-row-0` (use named-element swipe per knowledge file)
   - [ ] Tap `habit-row-0-delete`
   - [ ] Assert habit row no longer visible

### Playwright (web)

1. **`add_habit.spec.ts`** — Click FAB, fill modal, save
2. **`mark_complete.spec.ts`** — Click row, verify today cell visually completed
3. **`hover_delete.spec.ts`** — Hover row, click delete icon, confirm

All interactive elements get BOTH `testID` and `data-testid`. Expo's `react-native-web` exposes the former as the latter automatically.

---

## Quality bar

- Touch targets ≥44pt on native, ≥44px on web
- Safe-area handling for iPhone notch and home indicator
- Animations feel native — spring physics, not linear ramps
- Type hierarchy is consistent across screens
- Color contrast meets WCAG AA on both light and dark backgrounds (this app is light-mode only for v3, dark mode is v4)
- Pre-flight `expo export --platform web` runs clean before any Playwright run
- Maestro flows use named-element selectors and `hideKeyboard:` after text input
- Vercel deploy + GitHub push run independently of Maestro outcome (PRD #56)

---

## Deployment

| Variant | Artifact | Deploy |
|---|---|---|
| iOS | Expo iOS bundle (Maestro-tested via Expo Go) | GitHub repo |
| Android | Expo Android bundle (Maestro-tested via emulator) | GitHub repo |
| Web | `expo export --platform web` static export | Vercel preview URL |

Step 6 final report includes: Vercel URL, GitHub URL, `subPlatformsTested: ["ios", "android", "web"]`.

---

## Success criteria

- [ ] All user stories pass acceptance criteria on iOS, Android, and web
- [ ] App **looks and feels native-quality** on iOS — bottom sheet, swipe-to-delete, haptics, spring animations all working
- [ ] App **looks and feels native-quality** on Android — same primitives, just Android styling
- [ ] Web variant looks polished even without native primitives — modal, hover-delete, no haptics is fine
- [ ] All Maestro iOS flows pass
- [ ] All Maestro Android flows pass
- [ ] All Playwright web flows pass
- [ ] Vercel URL reachable; GitHub repo created
- [ ] No `@gorhom/bottom-sheet` import reaching the web bundle (Platform-branched)
- [ ] No `react-native-gesture-handler` Swipeable reaching the web bundle (Platform-branched)
- [ ] AsyncStorage uses `.native.ts` / `.web.ts` file split (no Platform branch needed in callers)
- [ ] Pre-flight web export passes locally before Playwright

---

## Known gotchas (PRD #59 territory — read these knowledge files)

The new knowledge files in `prompts/knowledge/` cover these — read them before starting e2e:

- `hybrid-web-platform-guards.md` — Native-only imports need Platform branches OR `.web.ts(x)` splits
- `expo-web-export-verification.md` — Run `expo export --platform web` LOCALLY before deploying
- `maestro-debugging-patterns.md` — `hideKeyboard:` after typing, named-element swipe syntax, screenshot-based debugging

Additional notes:

- Mac Studio runner: `npm install` may skip devDeps. Use `npm install --include=dev` for Playwright + jest + similar.
- `react-native-gesture-handler` requires `GestureHandlerRootView` wrapping the root layout on native.
- `@gorhom/bottom-sheet` requires `BottomSheetModalProvider` wrapping the screen that uses it.
- `react-native-reanimated` requires `'react-native-reanimated/plugin'` in `babel.config.js` plugins array.
- For Vercel deploy, target the `dist/` static export, not the source repo.
- Use bounded `until`-loop polling for native build readiness (PRD #56), not `ScheduleWakeup`.
