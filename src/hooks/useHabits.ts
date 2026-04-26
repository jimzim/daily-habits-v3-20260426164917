import { useCallback, useEffect, useRef, useState } from 'react';
import { loadHabits, saveHabits } from '@/lib/storage';
import { type Habit, newHabitId, todayISO } from '@/lib/types';

export type UseHabits = {
  habits: Habit[];
  isLoaded: boolean;
  addHabit: (name: string) => Habit | null;
  toggleToday: (habitId: string) => boolean; // returns true if newly completed
  deleteHabit: (habitId: string) => void;
  isCompletedToday: (habitId: string) => boolean;
  doneCountToday: () => number;
};

export function useHabits(): UseHabits {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    loadHabits().then((loaded) => {
      if (!active) return;
      setHabits(loaded);
      setIsLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  // Persist on every change after initial load.
  useEffect(() => {
    if (!isLoaded) return;
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      void saveHabits(habits);
    }, 50);
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, [habits, isLoaded]);

  const addHabit = useCallback((rawName: string): Habit | null => {
    const name = rawName.trim();
    if (!name) return null;
    const habit: Habit = {
      id: newHabitId(),
      name,
      createdAt: Date.now(),
      completions: [],
    };
    setHabits((prev) => [habit, ...prev]);
    return habit;
  }, []);

  const toggleToday = useCallback((habitId: string): boolean => {
    const today = todayISO();
    let nowCompleted = false;
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const has = h.completions.includes(today);
        nowCompleted = !has;
        const completions = has
          ? h.completions.filter((d) => d !== today)
          : [...h.completions, today];
        return { ...h, completions };
      }),
    );
    return nowCompleted;
  }, []);

  const deleteHabit = useCallback((habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  }, []);

  const isCompletedToday = useCallback(
    (habitId: string) => {
      const today = todayISO();
      const h = habits.find((h) => h.id === habitId);
      return !!h && h.completions.includes(today);
    },
    [habits],
  );

  const doneCountToday = useCallback(() => {
    const today = todayISO();
    return habits.filter((h) => h.completions.includes(today)).length;
  }, [habits]);

  return {
    habits,
    isLoaded,
    addHabit,
    toggleToday,
    deleteHabit,
    isCompletedToday,
    doneCountToday,
  };
}
