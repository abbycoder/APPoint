import {
  Appointment,
  AppointmentStatus,
  Assignment,
  UnavailablePeriod,
} from "../types";

export const REMINDER_LEAD_MINUTES = 15;

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function dayLabel(date: Date): string {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, tomorrow)) return "Tomorrow";
  if (isSameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatClock(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function minutesUntil(date: Date, from: Date = new Date()): number {
  return Math.round((date.getTime() - from.getTime()) / 60000);
}

export function getStatus(
  datetime: string,
  now: Date = new Date(),
): AppointmentStatus {
  const target = new Date(datetime);
  const diff = minutesUntil(target, now);
  if (diff < 0) return "past";
  if (diff <= REMINDER_LEAD_MINUTES) return "soon";
  return "upcoming";
}

export function sortByDatetime<T extends { datetime: string }>(list: T[]): T[] {
  return [...list].sort(
    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
  );
}

/** Groups appointments by calendar day, preserving chronological order of the groups. */
export function groupByDay(
  list: Appointment[],
): { date: Date; items: Appointment[] }[] {
  const sorted = sortByDatetime(list);
  const groups: { date: Date; items: Appointment[] }[] = [];

  for (const appt of sorted) {
    const apptDate = new Date(appt.datetime);
    const existing = groups.find((g) => isSameDay(g.date, apptDate));
    if (existing) {
      existing.items.push(appt);
    } else {
      groups.push({ date: apptDate, items: [appt] });
    }
  }

  return groups;
}

export interface CalendarDay {
  date: Date;
  inMonth: boolean;
}

/** Builds a fixed 6-week (42-day) grid for the month containing `monthDate`, starting on Sunday. */
export function getMonthGrid(monthDate: Date): CalendarDay[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const gridStart = new Date(year, month, 1 - firstOfMonth.getDay());

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    return { date, inMonth: date.getMonth() === month };
  });
}

export function appointmentsOnDay(
  list: Appointment[],
  day: Date,
): Appointment[] {
  return sortByDatetime(
    list.filter((a) => isSameDay(new Date(a.datetime), day)),
  );
}

export function assignmentsOnDay(list: Assignment[], day: Date): Assignment[] {
  return sortByDatetime(
    list.filter((a) => isSameDay(new Date(a.datetime), day)),
  );
}

/** Filters any datetime-bearing list down to entries in the same calendar month as `month`. */
export function itemsInMonth<T extends { datetime: string }>(
  list: T[],
  month: Date,
): T[] {
  return list.filter((item) => {
    const d = new Date(item.datetime);
    return (
      d.getFullYear() === month.getFullYear() &&
      d.getMonth() === month.getMonth()
    );
  });
}

/** Formats a Date as `YYYY-MM-DDTHH:mm` for use in <input type="datetime-local">. */
export function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

/** Formats a Date as `YYYY-MM-DD` for use in <input type="date">. */
export function toDateOnlyValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parses a `YYYY-MM-DD` string as a local-time Date (avoids UTC off-by-one issues). */
export function parseDateOnly(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isWithinPeriod(date: Date, period: UnavailablePeriod): boolean {
  const day = startOfDay(date).getTime();
  return (
    day >= parseDateOnly(period.from).getTime() &&
    day <= parseDateOnly(period.to).getTime()
  );
}

export function findUnavailablePeriod(
  date: Date,
  periods: UnavailablePeriod[],
): UnavailablePeriod | undefined {
  return periods.find((p) => isWithinPeriod(date, p));
}

/** Finds an existing appointment at the exact same minute, excluding `excludeId` (the one being edited). */
export function findTimeConflict(
  datetime: string,
  appointments: Appointment[],
  excludeId?: string,
): Appointment | undefined {
  const target = new Date(datetime).getTime();
  return appointments.find(
    (a) => a.id !== excludeId && new Date(a.datetime).getTime() === target,
  );
}
