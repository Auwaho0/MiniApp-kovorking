import { Booking } from "@/entities/booking/model/types";
import {
  dateKey,
  daysInMonth,
  firstWeekdayMonday,
  getDateKeyMoscow,
  WEEKDAYS_RU,
} from "@/shared/lib/date";
import { hapticLight } from "@/shared/lib/telegram";
import type { MonthRef } from "@/widgets/MonthTabs/ui/MonthTabs";

type Props = {
  month: MonthRef;
  bookings: Booking[];
  onDayClick: (date: string, dayBookings: Booking[]) => void;
};

function bookingsForDay(bookings: Booking[], date: string) {
  return bookings.filter((b) => getDateKeyMoscow(b.startAt) === date);
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
      <div className="mb-1 grid grid-cols-7 gap-1 px-2">
        {WEEKDAYS_RU.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-tg-hint">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const key = dateKey(month.year, month.month, day);
          const list = bookingsForDay(bookings, key);
          const busy = list.length > 0;

          return (
            <button
              key={i}
              onClick={() => {
                hapticLight();
                onDayClick(key, list);
              }}
              className={`flex aspect-[3/4] flex-col items-center justify-start rounded-lg p-1 text-xs
                transition active:scale-95 ${busy
                  ? "bg-tg-secondary"
                  : "bg-tg-bg ring-1 ring-tg-secondary"
                }`}
            >
              <span className="font-medium text-tg-text">{day}</span>
              <div className="mt-auto flex gap-0.5 pb-0.5">
                {list.slice(0, 3).map((b) => (
                  <div
                    key={b.id}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: b.background }}
                  />
                ))}
                {list.length > 3 && (
                  <div className="h-1.5 w-1.5 rounded-full bg-tg-hint" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}