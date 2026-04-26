import type { Habit } from './types';

// Ephemeral in-memory store for web. Storage being non-persistent is
// intentional and not surfaced in the UI.
const store = new Map<string, Habit[]>();
const KEY = 'habits';

export async function loadHabits(): Promise<Habit[]> {
  return store.get(KEY) ?? [];
}

export async function saveHabits(habits: Habit[]): Promise<void> {
  store.set(KEY, habits);
}

export async function clearHabits(): Promise<void> {
  store.delete(KEY);
}
