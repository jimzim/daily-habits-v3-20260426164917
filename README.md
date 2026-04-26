# Daily Habits — v3

A polished, native-quality habit tracker built with Expo. One codebase ships to **iOS, Android, and web** with native primitives where they belong (bottom sheet, swipe-to-delete, haptics) and graceful web equivalents (centered modal, hover-delete with two-tap confirm).

| Variant | Where it runs | Persistence |
|---|---|---|
| iOS | Expo native build, iPhone simulator | AsyncStorage |
| Android | Expo native build, Android emulator | AsyncStorage |
| Web | `expo export --platform web` → static `dist/` → Vercel | In-memory (ephemeral) |

**Live web URL:** https://dist-three-ashy-26.vercel.app

---

## Setup

```bash
npm install --include=dev --legacy-peer-deps
```

The `--include=dev` flag is required on machines where `NODE_ENV=production` is set in the shell. The `--legacy-peer-deps` flag is required because Expo SDK 54 + Expo Router 6 have a transitive `react-dom` peer mismatch that npm strict mode rejects but is harmless in practice.

---

## Scripts

| Command | What it does |
|---|---|
| `npm start` | Interactive Expo dev server (pick a platform) |
| `npm run ios` | Boot iOS simulator and run dev server |
| `npm run android` | Boot Android emulator and run dev server |
| `npm run web` | Run web dev server on port 8081 |
| `npm run typecheck` | `tsc --noEmit` strict TypeScript check |
| `npm run lint` | `expo lint` (ESLint with Expo config) |
| `npm run build:web` | `expo export --platform web` → `dist/` |

---

## End-to-end testing

### Native (Maestro, iOS + Android)

```bash
maestro test -p ios .maestro/                 # iOS
xcrun simctl shutdown all && \
  maestro test -p android .maestro/           # Android (kill iOS sim first!)
```

Three flows live in `.maestro/`:

- `add_habit_via_sheet.yaml` — open sheet, type, save
- `mark_habit_complete.yaml` — tap row, verify today cell selected
- `swipe_to_delete.yaml` — swipe left, confirm delete

### Web (Playwright)

```bash
npm run build:web                             # produce dist/
npx playwright test                           # 3 specs against dist/
```

Playwright auto-starts `npx serve dist -p 4242` and tears it down after the suite. Workers default to 4.

---

## Architecture

```
app/
  _layout.tsx          SafeAreaProvider + RootProviders + StatusBar + Stack
  index.tsx            Header + (EmptyState | HabitList) + AddHabitFAB + AddHabitSheet
src/
  components/
    Header.tsx         Date + "X of Y done" subtitle
    EmptyState.tsx     Calm leaf icon + tagline
    DayGrid.tsx        7 rounded squares, animated fill on completion
    HabitRow.native.tsx Swipeable + spring checkmark + haptics
    HabitRow.web.tsx    Hover-delete + two-tap confirm + checkmark animation
    HabitList.tsx       FlatList of HabitRow
    AddHabitFAB.tsx     Floating action button (safe-area aware)
    AddHabitSheet.native.tsx  @gorhom/bottom-sheet
    AddHabitSheet.web.tsx     <Modal> with backdrop + Esc-to-close
    RootProviders.native.tsx  GestureHandlerRootView + BottomSheetModalProvider
    RootProviders.web.tsx     Pass-through fragment (no native deps)
  hooks/
    useHabits.ts       load/persist/add/toggle/delete (in-memory + storage adapter)
  lib/
    types.ts           Habit, ISODate, date helpers
    storage.native.ts  AsyncStorage CRUD
    storage.web.ts     In-memory Map shim
    haptics.native.ts  expo-haptics light/medium wrappers
    haptics.web.ts     no-op shims
    theme.ts           palette + type scale + spacing tokens
.maestro/              Maestro YAML flows
tests/web/             Playwright specs
```

### Hybrid platform contract

This codebase is **hybrid** — it must produce a fully native iOS/Android app *and* a working static web bundle. The contract:

- Native-only modules (`@gorhom/bottom-sheet`, `react-native-gesture-handler` Swipeable, `expo-haptics`, `@react-native-async-storage/async-storage`) are isolated behind `.native.tsx` / `.web.tsx` file splits. Metro's resolver automatically picks the correct file at bundle time. The web bundle never sees the native imports.
- TypeScript can't follow Metro's platform-extension resolution out of the box, so each split has a sibling `.d.ts` declaration file describing the shared interface.
- The `RootProviders` wrapper isolates `GestureHandlerRootView` + `BottomSheetModalProvider` from the web bundle entirely.

To verify the web bundle stays clean:

```bash
npm run build:web
grep -oE '(@gorhom/bottom-sheet|BottomSheet|Swipeable|gorhom|impactAsync)' \
  dist/_expo/static/js/web/entry-*.js | sort -u
# expected output: empty
```

---

## PRD-mandated quality bar

- Touch targets ≥44pt (FAB is 60pt; Save/Cancel buttons are 44pt min)
- Safe-area handling for iPhone notch and home indicator (`useSafeAreaInsets()` on FAB)
- Spring physics on completion (Reanimated `withSpring`, ~250ms)
- Day-cell fill animates with ease-out cubic (240ms), no pop
- Checkmark overlay: 200ms in, 800ms hold, 200ms out
- Light haptic on complete, medium haptic on delete (native only)
- Web bundle clean of native-only imports (verified via the grep above)

---

## Deployment

- **Web:** `npm run build:web && npx vercel deploy dist --prod` → Vercel
- **iOS:** `eas build --platform ios --profile preview`
- **Android:** `eas build --platform android --profile preview`

The Vercel deploy and the GitHub push are intentionally independent of Maestro test outcomes (PRD #56 TERMINAL-001) — the web variant ships even if a native test cap fires.
