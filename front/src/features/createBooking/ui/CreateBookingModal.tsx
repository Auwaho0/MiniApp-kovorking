import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/shared/ui/Modal";
import { Input } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";
import { BG_PALETTE, TIME_SLOTS } from "@/shared/config/constants";
import { bookingApi } from "@/entities/booking/api/bookingApi";
import { moscowToUtcIso } from "@/shared/lib/date";
import { useLoadingStore } from "@/shared/model/loadingStore";
import { hapticError, hapticSuccess } from "@/shared/lib/telegram";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Дата в формате "YYYY-MM-DD" (московская) */
  initialDate: string;
  /** Предвыбранный слот (например, когда юзер тапнул «Записаться» на конкретном) */
  initialSlotId?: string;
};

export function CreateBookingModal({
  open,
  onClose,
  initialDate,
  initialSlotId,
}: Props) {
  const [slotId, setSlotId] = useState<string | null>(initialSlotId ?? null);
  const [description, setDescription] = useState("");
  const [background, setBackground] = useState(BG_PALETTE[0]);

  const qc = useQueryClient();
  const { start, success, error } = useLoadingStore();

  const mutation = useMutation({
    mutationFn: bookingApi.create,
    onMutate: () => start("Создаём запись..."),
    onSuccess: () => {
      hapticSuccess();
      success("Запись создана");
      qc.invalidateQueries({ queryKey: ["bookings"] });
      onClose();
    },
    onError: (e: Error) => {
      hapticError();
      error(e.message);
    },
  });

  const submit = () => {
    if (!slotId) {
      hapticError();
      error("Выберите слот");
      return;
    }
    const slot = TIME_SLOTS.find((s) => s.id === slotId);
    if (!slot) return;

    mutation.mutate({
      startAt: moscowToUtcIso(initialDate, slot.start),
      endAt: moscowToUtcIso(initialDate, slot.end),
      description: description.trim() || undefined,
      background,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Новая запись">
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-xs text-tg-hint">Слот</label>
          <div className="grid grid-cols-1 gap-2">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => setSlotId(slot.id)}
                className={`rounded-xl px-4 py-3 text-left text-[15px] font-medium transition active:scale-[0.98] ${
                  slotId === slot.id
                    ? "bg-tg-button text-tg-button-text"
                    : "bg-tg-secondary text-tg-text"
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-tg-hint">Описание</label>
          <Input
            placeholder="Например: консультация, обсуждение эскиза..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-xs text-tg-hint">Цвет</label>
          <div className="flex flex-wrap gap-2">
            {BG_PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setBackground(c)}
                className="h-8 w-8 rounded-full transition active:scale-90"
                style={{
                  background: c,
                  outline: background === c ? `2px solid ${c}` : "none",
                  outlineOffset: 2,
                }}
                aria-label={`Цвет ${c}`}
              />
            ))}
          </div>
        </div>

        <Button onClick={submit} disabled={!slotId || mutation.isPending}>
          {mutation.isPending ? "Записываем..." : "Записаться"}
        </Button>
      </div>
    </Modal>
  );
}