import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Habit } from './types';

const KEY = 'daily-habits-v3:habits';

export async function loadHabits(): Promise<Habit[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Habit[];
  } catch {
    return [];
  }
}

export async function saveHabits(habits: Habit[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(habits));
}

export async function clearHabits(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
