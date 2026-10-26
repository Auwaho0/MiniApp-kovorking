import {
  MIN_DURATION_MIN,
  WORK_END_HOUR,
  WORK_START_HOUR,
} from "@/shared/config/constants";


const MSK_OFFSET_MIN = 180; // UTC+3

export function nowMoscow(): Date {
  const now = new Date();
  return new Date(now.getTime() + (now.getTimezoneOffset() + MSK_OFFSET_MIN) * 60000);
}

export function formatMoscow(iso: string, opts: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("ru-RU", { timeZone: "Europe/Moscow", ...opts }).format(
    new Date(iso),
  );
}

export function moscowToday(): { year: number; month: number; day: number } {
  const d = nowMoscow();
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

export function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function firstWeekdayMonday(year: number, month: number): number {
  const jsDay = new Date(year, month - 1, 1).getDay();
  return (jsDay + 6) % 7;
}

export function moscowToUtcIso(date: string, time: string): string {
  return new Date(`${date}T${time}:00+03:00`).toISOString();
}

export function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getDateKeyMoscow(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

export const WEEKDAYS_RU = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];


/** Время "HH:MM" из ISO-строки в московском часовом поясе */
export function mskTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Moscow",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

/** "HH:MM" → минуты от начала суток */
export function timeToMin(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Минуты от начала суток → "HH:MM" */
export function minToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** "10:00 – 11:30" из двух ISO-строк */
export function formatTimeRange(startIso: string, endIso: string): string {
  return `${mskTime(startIso)} – ${mskTime(endIso)}`;
}

/**
 * Пересекается ли интервал [startTime, endTime] с записями дня.
 * dayBookings — записи этого дня (проверка по МСК).
 */
export function hasOverlapWithBookings(
  startTime: string,
  endTime: string,
  dayBookings: Array<{ startAt: string; endAt: string }>,
): boolean {
  const aStart = timeToMin(startTime);
  const aEnd = timeToMin(endTime);
  return dayBookings.some((b) => {
    const bStart = timeToMin(mskTime(b.startAt));
    const bEnd = timeToMin(mskTime(b.endAt));
    return aStart < bEnd && aEnd > bStart;
  });
}

/**
 * Есть ли в дне хотя бы одно свободное окно >= minDuration.
 * Используется для листа ожидания.
 */
export function hasFreeWindow(
  dayBookings: Array<{ startAt: string; endAt: string }>,
  minDuration = MIN_DURATION_MIN,
): boolean {
  const workStart = WORK_START_HOUR * 60;
  const workEnd = WORK_END_HOUR * 60;

  const busy = dayBookings
    .map((b) => ({
      start: Math.max(workStart, timeToMin(mskTime(b.startAt))),
      end: Math.min(workEnd, timeToMin(mskTime(b.endAt))),
    }))
    .filter((b) => b.end > b.start)
    .sort((a, b) => a.start - b.start);

  let cursor = workStart;
  for (const b of busy) {
    if (b.start > cursor && b.start - cursor >= minDuration) return true;
    cursor = Math.max(cursor, b.end);
    if (cursor >= workEnd) break;
  }
  return workEnd - cursor >= minDuration;
}