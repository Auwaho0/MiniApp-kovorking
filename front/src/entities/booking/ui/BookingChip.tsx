import type { Booking } from "../model/types";

export function BookingChip({ booking, onClick }: { booking: Booking; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg px-3 py-2 text-left text-sm text-white active:opacity-80"
      style={{ background: booking.background }}
    >
      <div className="font-medium">@{booking.username}</div>
      {booking.description && (
        <div className="line-clamp-1 text-xs opacity-90">{booking.description}</div>
      )}
    </button>
  );
}