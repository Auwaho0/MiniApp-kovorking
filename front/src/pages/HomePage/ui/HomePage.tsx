import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MonthTabs, MonthRef } from "@/widgets/MonthTabs/ui/MonthTabs";
import { MonthGrid } from "@/widgets/MonthGrid/ui/MonthGrid";
import { MonthGridSkeleton } from "@/widgets/MonthGrid/ui/MonthGridSkeleton";
import { DayBookingsModal } from "@/widgets/DayBookingsModal/ui/DayBookingsModal";
import { useMonths } from "@/entities/month/model/useMonths";
import { useBookings } from "@/entities/booking/model/useBookings";
import { monthKey } from "@/shared/lib/date";
import { qk } from "@/shared/api/keys";
import { bookingApi } from "@/entities/booking/api/bookingApi";
import { Booking } from "@/entities/booking/model/types";

export function HomePage() {
  const { current, next } = useMonths();
  const [selected, setSelected] = useState<MonthRef>(current);

  const qc = useQueryClient();
  const currentKey = monthKey(current.year, current.month);
  const nextKey = monthKey(next.year, next.month);

  // Префетч обоих месяцев при монтировании.
  // Даже если юзер кликнет следующий месяц мгновенно — там уже данные.
  useEffect(() => {
    qc.prefetchQuery({
      queryKey: qk.bookings(currentKey),
      queryFn: () => bookingApi.list(currentKey),
      staleTime: 10 * 60 * 1000,
    });
    qc.prefetchQuery({
      queryKey: qk.bookings(nextKey),
      queryFn: () => bookingApi.list(nextKey),
      staleTime: 10 * 60 * 1000,
    });
  }, [qc, currentKey, nextKey]);

  const selectedKey = monthKey(selected.year, selected.month);
  const { data, isPending, isPlaceholderData } = useBookings(selectedKey);

  const [day, setDay] = useState<string | null>(null);
  const [dayBookings, setDayBookings] = useState<Booking[]>([]);

  return (
    <div className="pb-20">
      <MonthTabs
        current={current}
        next={next}
        selected={selected}
        onSelect={setSelected}
      />

      {/* Skeleton — только на самой первой загрузке.
          После этого data никогда не undefined (keepPreviousData). */}
      {isPending && !data ? (
        <MonthGridSkeleton />
      ) : (
        <div
          className="transition-opacity duration-150"
          style={{ opacity: isPlaceholderData ? 0.55 : 1 }}
        >
          <MonthGrid
            month={selected}
            bookings={data ?? []}
            onDayClick={(d, list) => {
              setDay(d);
              setDayBookings(list);
            }}
          />
        </div>
      )}

      <DayBookingsModal
        open={!!day}
        date={day}
        bookings={dayBookings}
        onClose={() => setDay(null)}
      />
    </div>
  );
}