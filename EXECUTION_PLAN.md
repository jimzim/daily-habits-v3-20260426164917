# Daily Habits — v3 — Execution Plan

**Build ID:** `daily-habits-v3-20260426231457`
**Platform:** native (`subPlatforms: ["ios", "android", "web"]`)
**Effort:** xhigh
**Total tasks:** 47 (preserved from extract phase — none added or removed)

---

## 1. Executive Summary

A polished, native-quality habit tracker shipped from one Expo codebase to **iOS, Android, and web**. The bar is Things 3 / Streaks / Apple Reminders — calm palette (`#FAFAF7` light, accent `#0E7C7B`), generous whitespace, system fonts, spring animations, and native primitives that are NOT downgraded for the web variant.

**Key tech choices** (PRD-locked):

- **Expo SDK 52+** with **Expo Router v4** (TypeScript template, file-based routing)
- **react-native-web** for the Expo web variant (REQUIRED — `expo export --platform web` fails without it)
- **AsyncStorage** on native via `.native.ts` file split; **in-memory Map** via `.web.ts` shim
- **`@gorhom/bottom-sheet`** on native for AddHabit; centered modal on web (Platform-branched component)
- **`react-native-gesture-handler` Swipeable** on native for delete; hover-icon with two-tap confirm on web
- **`react-native-reanimated` v3** for spring animations + slide-out
- **`expo-haptics`** on native (light on complete, medium on delete); no-op `.web.ts` on web
- **Maestro** for iOS + Android e2e; **Playwright** for web e2e
- **EAS Build** + **Vercel** for distribution

**Hybrid contract:** No `@gorhom/bottom-sheet` import reaches the web bundle. No `Swipeable` reaches the web bundle. Storage and haptics use file splits, not Platform branches in callers.

**Terminal-step independence (PRD #56):** GitHub repo push (#43) and Vercel deploy (#44) depend only on the wire-up (#23) and clean web export (#33). They do NOT depend on Maestro outcome. Maestro iOS (#41), Maestro Android (#42), and Playwright (#40) run after terminal tasks land — their results are recorded as `subPlatformsTested[]` annotations on the Step 6 report, not as gates on deployment.

---

## 2. Tech Defaults

| Concern | Choice |
|---|---|
| Framework | Expo SDK 52+, React Native 0.83+ |
| Language | TypeScript (strict) |
| Router | Expo Router v4 (typed routes) |
| Web target | `react-native-web` + `expo export --platform web` → `dist/` → Vercel |
| Persistence | `@react-native-async-storage/async-storage` (native), in-memory Map (web) |
| State | `useHabits` hook (local React state + storage adapter) — no Zustand needed for this scope |
| Animation | `react-native-reanimated` v3 (spring on completion), `LayoutAnimation` for list insert |
| Gestures | `react-native-gesture-handler` Swipeable (native only) |
| Bottom sheet | `@gorhom/bottom-sheet` (native only) |
| Haptics | `expo-haptics` (native only) |
| Safe areas | `react-native-safe-area-context` |
| Theming | NativeWind not required for this PRD — uses StyleSheet + theme tokens (PRD specifies plain RN primitives + a token file `theme.ts`) |
| Native e2e | Maestro (named-element selectors, `hideKeyboard:` after type) |
| Web e2e | Playwright (`testID` ↔ `data-testid` via react-native-web) |
| Unit tests | Out of scope for this PRD — Maestro + Playwright cover the user stories |
| Native distribution | EAS Build profile `preview` |
| Web distribution | `vercel deploy dist/ --prod` |

---

## 3. Platform Verification Strategy

After each batch, verify on the relevant subset:

| Batch | iOS Sim | Android Emu | Web (`expo start --web`) |
|---|---|---|---|
| 0 (Foundation) | ✅ | ✅ | ✅ |
| 1 (Data layer) | ✅ | — | ✅ (file-split picks `.web.ts`) |
| 2 (Core components) | ✅ | ✅ | ✅ |
| 3 (Habit row variants) | ✅ | ✅ | ✅ |
| 4 (List + AddHabit) | ✅ | ✅ | ✅ |
| 5 (Wire-up + audit) | ✅ | ✅ | ✅ |
| 6 (Animations + haptics + web UX) | ✅ | ✅ | ✅ |
| 7 (Pre-flight + Playwright scaffold) | ✅ | — | ✅ (export must be clean) |
| 8 (Maestro flows) | ✅ | ✅ | — |
| 9 (Terminal + docs) | — | — | ✅ (Vercel deploy) |
| 10 (Final verification) | ✅ | ✅ | ✅ |

**Note on iOS / Android device discovery:** Always shut down the iOS simulator before invoking Maestro on Android (`xcrun simctl shutdown all` then `adb devices` shows exactly one device) — otherwise Maestro hangs at the device-picker prompt.

---

## 4. Batches

### Batch 0 — Project foundation + Maestro scaffold (PRE-VERIFY all 3 sub-platforms)

**Tasks:** #1, #2, #3, #4, #5, #6, #7, #34

**Builds:** Fresh Expo TypeScript project; all PRD deps installed (`react-native-gesture-handler`, `@gorhom/bottom-sheet`, `react-native-reanimated`, `@react-native-async-storage/async-storage`, `expo-haptics`, `react-native-safe-area-context`, `react-native-web`, `react-native-svg` if needed for empty-state icon); babel reanimated plugin; `app.json` (name, slug, scheme, platforms `["ios","android","web"]`); `theme.ts` (palette `#FAFAF7` / `#0E7C7B`, type scale 28/17/13, spacing tokens, radii); `_layout.tsx` providers (`SafeAreaProvider` always; `GestureHandlerRootView` + `BottomSheetModalProvider` native-only via Platform branch); first-launch sanity check on iOS Sim. Maestro CLI installed and `launch.yaml` smoke flow created.

**Validation checkpoint:**
- `npx tsc --noEmit` passes
- `npx eslint . --ext .ts,.tsx` passes
- iOS Sim launches → blank Expo Router shell renders without crash
- Android Emulator launches → same
- `npx expo start --web` serves a route without bundler errors
- `maestro test .maestro/launch.yaml` reaches the first screen

### Batch 1 — Data layer (types, storage file-split, haptics file-split, hook)

**Tasks:** #8, #9, #10, #11, #12, #13

**Builds:** `lib/types.ts` (`Habit`, `CompletionRecord`, ISO-date helpers); `lib/storage.native.ts` (AsyncStorage-backed CRUD + load); `lib/storage.web.ts` (in-memory `Map`, ephemeral — explicitly NOT surfaced in UI); `lib/haptics.native.ts` (light/medium wrappers around `expo-haptics`); `lib/haptics.web.ts` (no-op shim with same surface); `useHabits` hook exposing `{ habits, addHabit, toggleToday, deleteHabit, isLoaded }` with persist-on-change.

**Validation checkpoint:**
- File-split resolution works: importing `'./lib/storage'` picks `.native.ts` on iOS/Android, `.web.ts` on web
- Type check + lint pass
- iOS Sim: hook loads empty state cleanly, no AsyncStorage errors
- Web: hook loads in-memory state cleanly, no `window`/`document` errors

### Batch 2 — Static visual components (no interaction yet)

**Tasks:** #14, #15, #16, #20

**Builds:** `Header.tsx` (date "Sunday, April 26" 28pt semibold + "X of Y done" 13pt dim; subtitle hidden when 0 habits); `EmptyState.tsx` (centered, calm icon, "Start a daily habit" / "Tap the + below to add your first one", no buttons); `DayGrid.tsx` (7 rounded squares, ~16pt, 4pt gaps, today's cell with thicker border, "M T W T F S S" labels 11pt dim — see DayGrid + Pressable note in §6); `AddHabitFAB.tsx` (circular, accent, subtle shadow, ≥44pt touch target).

**Validation checkpoint:**
- Components render in isolation on iOS, Android, web — visually matching PRD type scale and palette
- No flexbox-collapse on iOS (see §6 width-bug note — DayGrid in particular)
- Take an iOS Sim screenshot of `Header + EmptyState + FAB` to confirm visual fidelity before moving on

### Batch 3 — HabitRow native and web variants

**Tasks:** #17, #18

**Builds:** `HabitRow.native.tsx` (gesture-handler Swipeable; tap-to-toggle; left swipe reveals red-bg + trash icon + "Delete"; threshold release confirms; mid-swipe Delete tap also confirms); `HabitRow.web.tsx` (tap-to-toggle; on-row hover reveals trash icon button accent-bordered; click → "Tap again to delete" inline confirm). Both render Habit name (17pt regular) + DayGrid.

**Validation checkpoint:**
- iOS: swipe gesture works, red reveal smooth
- Android: same gesture behavior, Android styling acceptable
- Web: hover-icon appears, tap-again confirm works, NO `Swipeable` import in web bundle

### Batch 4 — HabitList + AddHabit sheet/modal + validation

**Tasks:** #19, #21, #22, #25

**Builds:** `HabitList.tsx` (FlatList of HabitRow with platform-resolved variant); `AddHabitSheet.native.tsx` (`@gorhom/bottom-sheet`, "Add habit" header, pre-focused TextInput, Cancel/Save); `AddHabitSheet.web.tsx` (centered modal in View with overlay backdrop, same content, Esc closes); Save button disabled when input is empty/whitespace.

**Validation checkpoint:**
- iOS: bottom sheet snaps up, keyboard auto-shows, Save disabled on empty
- Android: bottom sheet renders, keyboard auto-shows
- Web: modal renders centered with backdrop, NO `@gorhom/bottom-sheet` import in web bundle
- Empty Save prevented on all three

### Batch 5 — Main screen wire-up + testID audit

**Tasks:** #23, #24

**Builds:** `app/index.tsx` composes `Header + (EmptyState | HabitList) + AddHabitFAB + AddHabitSheet`; FAB opens sheet/modal; saving calls `addHabit`; tapping a row calls `toggleToday`; swipe/hover-delete calls `deleteHabit`. **Audit pass:** every interactive element has `testID` (auto-mapped to `data-testid` by react-native-web) — `add-habit-fab`, `add-habit-input`, `add-habit-save`, `add-habit-cancel`, `habit-row-N`, `habit-row-N-today-cell`, `habit-row-N-delete`. Today's cell sets `accessibilityState={{ selected: completed }}` so Maestro can assert the `completed` test attribute.

**Validation checkpoint:**
- Full add → mark → delete flow works manually on iOS Sim
- Same on Android Emulator
- Same on web (modal + hover-delete)
- Spot-check: `grep -r "testID=" src/` lists every required ID

### Batch 6 — Animations + haptics + web hover-confirm UX

**Tasks:** #26, #27, #28, #29, #30, #31, #32

**Builds:** Reanimated spring on completion checkmark (~250ms); day-cell fill ease-in (no pop); checkmark fade overlay (200ms in, 800ms hold, 200ms out); `LayoutAnimation` slide-in for new habits at top of list; slide-out for delete; `expo-haptics` light on complete and medium on delete (native only, file-split haptics module); web hover-delete two-tap inline confirm ("Tap again to delete" with ~3s timeout).

**Validation checkpoint:**
- iOS: animations feel native (spring physics, not linear ramps); haptics fire
- Android: animations smooth, haptics fire
- Web: no haptic errors, hover-delete confirm UX works
- Take iOS Sim screenshots BEFORE/DURING/AFTER mark + delete — verify visually, do not trust test results alone (PRD-#59 visual-verification rule)

### Batch 7 — Web export pre-flight + Playwright scaffolding

**Tasks:** #33, #38, #39

**Builds:** Run `npx expo export --platform web` and confirm `dist/` is non-empty + index.html resolves; `playwright.config.ts` (serves the static `dist/` build via a tiny `serve` script on a random port, headless Chromium); `tests/web/add-habit.spec.ts`, `mark-complete.spec.ts`, `hover-delete.spec.ts` — using the SAME testIDs as Maestro flows (`data-testid="add-habit-fab"` etc).

**Validation checkpoint:**
- `npx expo export --platform web` exits 0 and produces `dist/index.html` + `_expo/` assets
- `npx playwright test --list` shows 3 specs
- Specs run green against the local `dist/` build

### Batch 8 — Maestro flows

**Tasks:** #35, #36, #37

**Builds:** `.maestro/add_habit_via_sheet.yaml` (tap fab → tap input → input "Drink water" → `hideKeyboard:` → tap save → `assertVisible: "Drink water"`); `.maestro/mark_habit_complete.yaml` (precondition: 1 habit; tap `habit-row-0` → assert `habit-row-0-today-cell` has `completed`); `.maestro/swipe_to_delete.yaml` (precondition: 1 habit; swipe-left named-element on `habit-row-0` → tap `habit-row-0-delete` → `notVisible:` row).

Per the build pipeline default this PRD is iOS+Android, so each flow is one YAML that works on both — Maestro selectors use `id:` (testID) which maps to both platforms. Iff platform-specific quirks emerge (e.g., Android back button) we'll suffix `-android.yaml`, but PRD does not require split flows up front.

**Validation checkpoint:**
- `maestro test .maestro/add_habit_via_sheet.yaml` passes on iOS Sim
- Same flow passes on Android Emu (after `xcrun simctl shutdown all`)
- All 3 flows pass on iOS; spot-check 1 on Android (full Android run happens in Batch 10)

### Batch 9 — Terminal phase: GitHub repo + Vercel deploy + README

**Tasks:** #43, #44, #45

**Builds:** Initialize GitHub repo + initial source push; `vercel deploy dist/ --prod` (deploys the web export from Batch 7); `README.md` with setup instructions, all npm scripts, EAS build commands, Maestro test instructions, Playwright instructions, and architecture overview (folder layout, file-split convention, hybrid platform contract).

**Critical (PRD #56 TERMINAL-001):** These tasks **do not** depend on Maestro or Playwright execution outcome. They are listed AFTER all build tasks but BEFORE test execution in the dependency graph. The web variant ships and the source pushes even if iOS Maestro hits its 7-min cap or wedges.

**Validation checkpoint:**
- GitHub repo URL captured
- Vercel preview/prod URL captured and reachable in a browser
- README renders correctly on GitHub

### Batch 10 — Final verification + test execution + PRD verification

**Tasks:** #47, #40, #41, #42, #46

**Order within the batch (dependency-driven):**

1. **#47 FINAL-1 build verification** — typecheck + lint + `expo export --platform web` clean build (this also exercises a fresh `npm install`)
2. **#40 Playwright web** — runs against `dist/` from #47
3. **#41 Maestro iOS** (cap 7m, fail-soft per PRD #56) — three flows on iOS Sim
4. **#42 Maestro Android** (cap 7m, fail-soft) — same three flows on Android Emu (kill iOS Sim first)
5. **#46 PRD Feature Verification** — walk every PRD acceptance bullet across iOS / Android / web and record `subPlatformsTested[]` for the Step 6 report

**Final-batch deliverables (PRD-mandated):**

- `README.md` — already in Batch 9; verified fresh
- Maestro e2e tests exercising real user flows on native — three flows from Batch 8
- Playwright e2e tests for the Expo web build — three specs from Batch 7
- App store assets — at minimum `assets/icon.png`, `assets/splash.png`, and a `docs/store-screenshots.md` placeholder noting screenshots are captured manually from iOS Sim post-final-build
- PRD Feature Verification on all three platforms — task #46
- **Clean build test:**
  ```bash
  rm -rf node_modules .expo dist
  npm install --include=dev
  npx expo export --platform web          # Web build passes
  npx tsc --noEmit                        # Types pass
  npx eslint . --ext .ts,.tsx             # Lint passes
  # EAS cloud build (only if EAS credentials configured):
  # eas build --platform all --profile preview --non-interactive
  ```

---

## 5. Validation Checkpoints (run after every batch)

```bash
npx tsc --noEmit                          # TypeScript strict
npx eslint . --ext .ts,.tsx               # Lint
```

Plus the platform-specific bullets in §3.

---

## 6. Build Commands Reference

```bash
# Development
npx expo start                          # Dev server (interactive)
npx expo start --web                    # Web dev server
npx expo run:ios                        # Build + run iOS simulator
npx expo run:android                    # Build + run Android emulator

# Type checking & lint
npx tsc --noEmit
npx eslint . --ext .ts,.tsx

# Web export (pre-flight before Playwright)
npx expo export --platform web          # Outputs dist/

# E2E
maestro test .maestro/                  # Native e2e (kill iOS Sim before Android: xcrun simctl shutdown all)
maestro test -p android .maestro/       # Force Android
npx playwright test                     # Web e2e (against dist/)

# Native build / submit
eas build --platform ios --profile preview
eas build --platform android --profile preview
eas submit --platform ios

# Web deploy
vercel deploy dist/ --prod
```

---

## 7. Known React Native Gotchas (relevant to this PRD)

- **iOS flexbox 0-width bug** — never combine `width: '100%'` + `alignSelf: 'stretch'`. The FAB and Save button must have explicit `height` (≥44pt). DayGrid cells must have explicit width — wrap the `Pressable` cell in a parent `View` with explicit `width` if Pressable's style-function ignores width (see Pressable Style Function Width Bug in fix patterns).
- **Pressable style function** — for the 7-day grid, set width on a wrapping View, not on the Pressable's style-function return.
- **Gesture Handler** — `_layout.tsx` must wrap native children in `<GestureHandlerRootView style={{ flex: 1 }}>`. Web does not need this and must not import from `react-native-gesture-handler` directly in web-bundle code paths.
- **Reanimated** — `babel.config.js` MUST include `'react-native-reanimated/plugin'` as the LAST plugin in the array. Forgetting this breaks worklets silently in dev and crashes in prod.
- **`@gorhom/bottom-sheet`** — wrap the screen in `BottomSheetModalProvider` (native only). Never import from this package in `.web.tsx` files — Platform branches are not enough; use a `.native.tsx` / `.web.tsx` file split for the AddHabitSheet so the web bundle never sees it.
- **Safe areas** — use `useSafeAreaInsets()` for the FAB bottom offset (otherwise it sits on the home indicator on iPhone) and for the Header top padding.
- **Font loading** — system fonts are used (San Francisco / Roboto / system-ui) so no `expo-font` calls needed; expo-splash-screen still hides on first render.
- **StatusBar** — light-mode only for v3; set bar style once in `_layout.tsx`.
- **react-native-web testID mapping** — `react-native-web` auto-maps `testID` → `data-testid`. Adding `data-testid` separately is redundant. Maestro uses `id: <testID>` syntax.
- **Maestro `hideKeyboard:`** — always emit after `inputText:` on text inputs, otherwise the keyboard occludes the Save button on iOS.
- **AsyncStorage on web** — DO NOT import `@react-native-async-storage/async-storage` in `.web.ts` — use the in-memory Map shim. The file-split picks the right one automatically.
- **Android Maestro** — `xcrun simctl shutdown all` BEFORE running `maestro test -p android .maestro/`. Otherwise Maestro hangs on the device-picker prompt and the build wedges.

---

## 8. Notes on terminal-step independence

The pipeline guarantees these tasks ship even if Maestro fails or wedges:

- **#43 GitHub repo push** — depends on #23 (wire-up) + #33 (clean web export). Does NOT depend on Maestro.
- **#44 Vercel deploy** — depends on #33 (clean web export) + #43 (repo exists). Does NOT depend on Maestro.

Maestro outcome (`#41`, `#42`) is recorded as `subPlatformsTested[]` / `subPlatformsSkipped[]` annotations in the Step 6 report (PRD #56 MAESTRO-003), not as a gate on shipping. Vercel URL and GitHub URL are captured before Maestro runs.
