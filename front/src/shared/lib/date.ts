import type { TimeSlot } from "@/shared/config/constants";

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
function mskTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Moscow",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

/** Совпадает ли интервал записи с слотом (точно, без пересечений) */
export function bookingMatchesSlot(
  booking: { startAt: string; endAt: string },
  slot: TimeSlot,
): boolean {
  return mskTime(booking.startAt) === slot.start && mskTime(booking.endAt) === slot.end;
}

/**
 * Занятость слотов на конкретный день.
 * date — "YYYY-MM-DD" (московская дата).
 * Возвращает пары «слот + запись, которая его занимает (или null)».
 */
export function getSlotOccupancy<T extends { startAt: string; endAt: string }>(
  date: string,
  bookings: T[],
  slots: TimeSlot[],
): Array<{ slot: TimeSlot; booking: T | null }> {
  const dayBookings = bookings.filter((b) => getDateKeyMoscow(b.startAt) === date);

  return slots.map((slot) => {
    const match = dayBookings.find((b) => bookingMatchesSlot(b, slot));
    return { slot, booking: match ?? null };
  });
}