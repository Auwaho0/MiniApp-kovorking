import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/Button";
import { BookingChip } from "@/entities/booking/ui/BookingChip";
import { Booking } from "@/entities/booking/model/types";
import { useMe } from "@/entities/user/model/useMe";
import { useMyWaitlist } from "@/entities/waitlist/model/useMyWaitlist";
import { DeleteBookingButton } from "@/features/deleteBooking/ui/DeleteBookingButton";
import { NotifyWaitlistButton } from "@/features/notifyWaitlist/ui/NotifyWaitlistButton";
import { JoinWaitlistButton } from "@/features/joinWaitlist/ui/JoinWaitlistButton";
import { CreateBookingModal } from "@/features/createBooking/ui/CreateBookingModal";
import { setBackButton } from "@/shared/lib/telegram";
import {
  formatMoscow,
  formatTimeRange,
  hasFreeWindow,
} from "@/shared/lib/date";

type Props = {
  open: boolean;
  date: string | null;
  bookings: Booking[];
  onClose: () => void;
};

export function DayBookingsModal({ open, date, bookings, onClose }: Props) {
  const { data: me } = useMe();
  const { data: myWaitlist } = useMyWaitlist();
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setBackButton(true, onClose);
    return () => setBackButton(false, onClose);
  }, [open, onClose]);

  const dateTitle = useMemo(() => {
    if (!date) return "";
    const d = new Date(`${date}T12:00:00+03:00`);
    return formatMoscow(d.toISOString(), {
      day: "numeric",
      month: "long",
      weekday: "long",
    });
  }, [date]);

  if (!date) return null;

  const sorted = [...bookings].sort((a, b) =>
    a.startAt.localeCompare(b.startAt),
  );

  const myEntry = myWaitlist?.find((w) => w.date === date);
  const isAdmin = me?.isAdmin ?? false;
  const hasFree = hasFreeWindow(sorted);

  return (
    <>
      <Modal open={open} onClose={onClose} title={dateTitle}>
        <div className="space-y-3">
          {sorted.length === 0 ? (
            <p className="text-sm text-tg-hint">Пока никто не записан.</p>
          ) : (
            sorted.map((b) => {
              const isMine = b.userId === me?.id;
              const canDelete = isAdmin || isMine;
              return (
                <div key={b.id} className="space-y-2">
                  <div className="text-xs text-tg-hint">
                    {formatTimeRange(b.startAt, b.endAt)}
                  </div>
                  <BookingChip booking={b} />
                  {canDelete && (
                    <DeleteBookingButton id={b.id} onDone={onClose} />
                  )}
                </div>
              );
            })
          )}

          <div className="space-y-2 pt-2 border-t border-tg-secondary">
            <Button onClick={() => setCreateOpen(true)}>➕ Записаться</Button>
            {!hasFree && (
              <JoinWaitlistButton
                date={date}
                alreadyIn={!!myEntry}
                entryId={myEntry?.id}
              />
            )}
            {isAdmin && <NotifyWaitlistButton date={date} />}
          </div>
        </div>
      </Modal>

      <CreateBookingModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        initialDate={date}
        dayBookings={sorted}
      />
    </>
  );
}