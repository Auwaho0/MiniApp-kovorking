import { Booking } from "@/entities/booking/model/types";
import {
  dateKey,
  daysInMonth,
  firstWeekdayMonday,
  getDateKeyMoscow,
  getSlotOccupancy,
} from "@/shared/lib/date";
import { hapticLight } from "@/shared/lib/telegram";
import { TIME_SLOTS } from "@/shared/config/constants";
import type { MonthRef } from "@/widgets/MonthTabs/ui/MonthTabs";

type Props = {
  month: MonthRef;
  bookings: Booking[];
  onDayClick: (date: string, dayBookings: Booking[]) => void;
};

function bookingsForDay(bookings: Booking[], date: string) {
  return bookings.filter((b) => {
    const start = getDateKeyMoscow(b.startAt);
    const end = getDateKeyMoscow(b.endAt);
    return date >= start && date <= end;
  });
}

export function MonthGrid({ month, bookings, onDayClick }: Props) {
  const total = daysInMonth(month.year, month.month);
  const offset = firstWeekdayMonday(month.year, month.month);
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];

  return (
    <div className="px-2 pb-4">
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const key = dateKey(month.year, month.month, day);
          const list = bookingsForDay(bookings, key);

          const occupancy = getSlotOccupancy(key, list, TIME_SLOTS);
          const busyCount = occupancy.filter((o) => o.booking).length;
          const totalSlots = occupancy.length;
          const isFull = busyCount === totalSlots;
          const isPartial = busyCount > 0 && !isFull;

          return (
            <button
              key={i}
              onClick={() => {
                hapticLight();
                onDayClick(key, list);
              }}
              className={`flex aspect-[3/4] flex-col items-center justify-start rounded-lg p-1 text-xs
                transition active:scale-95 ${isFull
                  ? "bg-tg-secondary"
                  : isPartial
                    ? "bg-tg-secondary/50"
                    : "bg-tg-bg ring-1 ring-tg-secondary"
                }`}
            >
              <span className="font-medium text-tg-text">{day}</span>
              <div className="mt-auto text-[10px] text-tg-hint">
                {busyCount}/{totalSlots}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}