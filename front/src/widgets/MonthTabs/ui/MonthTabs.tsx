import { hapticLight } from "@/shared/lib/telegram";
import { MONTH_NAMES, WEEKDAYS_RU } from "@/shared/lib/date";

export type MonthRef = { year: number; month: number };

type Props = {
  current: MonthRef;
  next: MonthRef;
  selected: MonthRef;
  onSelect: (m: MonthRef) => void;
};

const eq = (a: MonthRef, b: MonthRef) => a.year === b.year && a.month === b.month;

export function MonthTabs({ current, next, selected, onSelect }: Props) {
  return (
    <>
      <div className="sticky top-0 z-20 flex gap-2 bg-tg-bg px-4 pb-2 pt-3">
        {[current, next].map((m) => {
          const active = eq(m, selected);
          return (
            <button
              key={`${m.year}-${m.month}`}
              onClick={() => {
                hapticLight();
                onSelect(m);
              }}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition active:scale-[0.97]
              ${active ? "bg-tg-button text-tg-button-text" : "bg-tg-secondary text-tg-text"}`}
            >
              {MONTH_NAMES[m.month - 1]} {m.year}
            </button>
          );
        })}
      </div>
      <div className="mb-1 grid grid-cols-7 gap-1 px-2">
        {WEEKDAYS_RU.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-tg-hint">
            {d}
          </div>
        ))}
      </div>
    </>
  );
}