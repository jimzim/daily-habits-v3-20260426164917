// ISO date string in the form YYYY-MM-DD, in the user's local timezone.
export type ISODate = string;

export type Habit = {
  id: string;
  name: string;
  createdAt: number; // epoch ms
  completions: ISODate[]; // dates this habit was marked done
};

export type CompletionRecord = {
  habitId: string;
  date: ISODate;
};

const pad = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

export function toISODate(d: Date): ISODate {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO(): ISODate {
  return toISODate(new Date());
}

// Returns the last `count` ISO dates ending today, oldest first.
export function lastNDates(count: number): ISODate[] {
  const out: ISODate[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push(toISODate(d));
  }
  return out;
}

const DOW_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

export function dayLetterFor(date: ISODate): string {
  // ISODate "YYYY-MM-DD" parsed in local time.
  const [y, m, d] = date.split('-').map(Number);
  const local = new Date(y, m - 1, d);
  return DOW_LETTERS[local.getDay()];
}

export function isToday(date: ISODate): boolean {
  return date === todayISO();
}

export function formatHeaderDate(d: Date = new Date()): string {
  // e.g. "Sunday, April 26"
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function newHabitId(): string {
  // Avoid uuid dep — short randomised id is fine for local-only data.
  return `h_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
