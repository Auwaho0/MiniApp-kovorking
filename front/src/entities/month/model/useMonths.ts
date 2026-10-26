import { useMemo } from "react";
import { moscowToday } from "@/shared/lib/date";

export function useMonths() {
  return useMemo(() => {
    const { year, month } = moscowToday();
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    return {
      current: { year, month },
      next: { year: nextYear, month: nextMonth },
    };
  }, []);
}