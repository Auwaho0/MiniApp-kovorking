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
import { formatMoscow, getSlotOccupancy } from "@/shared/lib/date";
import { TIME_SLOTS } from "@/shared/config/constants";

type Props = {
  open: boolean;
  date: string | null;
  bookings: Booking[];
  onClose: () => void;
};

export function DayBookingsModal({ open, date, bookings, onClose }: Props) {
  const { data: me } = useMe();
  const { data: myWaitlist } = useMyWaitlist();
  const [createSlotId, setCreateSlotId] = useState<string | null>(null);

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

  const slots = getSlotOccupancy(date, bookings, TIME_SLOTS);
  const busyCount = slots.filter((s) => s.booking).length;
  const allBusy = busyCount === slots.length;

  const myEntry = myWaitlist?.find((w) => w.date === date);
  const isAdmin = me?.isAdmin ?? false;

  return (
    <>
      <Modal open={open} onClose={onClose} title={dateTitle}>
        <div className="space-y-2">
          {slots.map(({ slot, booking }) => {
            const isMine = booking?.userId === me?.id;
            const canDelete = booking && (isAdmin || isMine);

            return (
              <div
                key={slot.id}
                className="rounded-xl border border-tg-secondary p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-semibold text-tg-text">
                    {slot.label}
                  </div>
                  {booking ? (
                    <span className="text-xs text-tg-hint">занято</span>
                  ) : (
                    <span className="text-xs text-emerald-500">свободно</span>
                  )}
                </div>

                {booking ? (
                  <div className="space-y-2">
                    <BookingChip booking={booking} />
                    {canDelete && (
                      <DeleteBookingButton id={booking.id} onDone={onClose} />
                    )}
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => setCreateSlotId(slot.id)}
                  >
                    ➕ Записаться
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {(allBusy || isAdmin) && (
          <div className="mt-4 space-y-2 border-t border-tg-secondary pt-4">
            {allBusy && (
              <JoinWaitlistButton
                date={date}
                alreadyIn={!!myEntry}
                entryId={myEntry?.id}
              />
            )}
            {isAdmin && <NotifyWaitlistButton date={date} />}
          </div>
        )}
      </Modal>

      <CreateBookingModal
        open={createSlotId !== null}
        onClose={() => setCreateSlotId(null)}
        initialDate={date}
        initialSlotId={createSlotId ?? undefined}
      />
    </>
  );
}