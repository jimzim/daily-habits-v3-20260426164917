import type { Habit } from '@/lib/types';

export type HabitRowProps = {
  habit: Habit;
  index: number;
  completed: boolean;
  onToggle: (id: string) => boolean;
  onDelete: (id: string) => void;
};

export declare function HabitRow(props: HabitRowProps): JSX.Element;
