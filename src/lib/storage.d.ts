import type { Habit } from './types';

export declare function loadHabits(): Promise<Habit[]>;
export declare function saveHabits(habits: Habit[]): Promise<void>;
export declare function clearHabits(): Promise<void>;
