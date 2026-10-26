import { useMyBookings } from "@/entities/booking/model/useBookings";
import { BookingChip } from "@/entities/booking/ui/BookingChip";
import { DeleteBookingButton } from "@/features/deleteBooking/ui/DeleteBookingButton";
import { formatMoscow } from "@/shared/lib/date";

export function MyBookingsPage() {
  const { data, isLoading } = useMyBookings();

  if (isLoading) {
    return <div className="p-6 text-center text-tg-hint">Загрузка...</div>;
  }

  const list = data ?? [];
  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <div className="text-5xl">📭</div>
        <p className="mt-4 text-tg-hint">У вас пока нет записей</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-4 pb-24 pt-4">
      <h1 className="text-xl font-semibold text-tg-text">Мои записи</h1>
      {list.map((b) => (
        <div key={b.id} className="space-y-2">
          <div className="text-xs text-tg-hint">
            {formatMoscow(b.startAt, { day: "numeric", month: "long" })} —{" "}
            {formatMoscow(b.endAt, { day: "numeric", month: "long" })}
          </div>
          <BookingChip booking={b} />
          <DeleteBookingButton id={b.id} />
        </div>
      ))}
    </div>
  );
}