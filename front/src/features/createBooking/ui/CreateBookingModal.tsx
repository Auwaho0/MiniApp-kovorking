import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/shared/ui/Modal";
import { Input } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";
import {
  BG_PALETTE,
  MIN_DURATION_MIN,
  TIME_STEP_MIN,
  WORK_END_HOUR,
  WORK_START_HOUR,
} from "@/shared/config/constants";
import { bookingApi } from "@/entities/booking/api/bookingApi";
import {
  formatTimeRange,
  hasOverlapWithBookings,
  minToTime,
  moscowToUtcIso,
  mskTime,
  timeToMin,
} from "@/shared/lib/date";
import { useLoadingStore } from "@/shared/model/loadingStore";
import { hapticError, hapticSuccess } from "@/shared/lib/telegram";
import type { Booking } from "@/entities/booking/model/types";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Дата в формате "YYYY-MM-DD" (МСК) */
  initialDate: string;
  /** Записи этого дня — для валидации пересечений */
  dayBookings: Booking[];
};

const DEFAULT_START = "10:00";
const DEFAULT_END = "11:00";

export function CreateBookingModal({
  open,
  onClose,
  initialDate,
  dayBookings,
}: Props) {
  const [startTime, setStartTime] = useState(DEFAULT_START);
  const [endTime, setEndTime] = useState(DEFAULT_END);
  const [description, setDescription] = useState("");
  const [background, setBackground] = useState(BG_PALETTE[0]);

  const qc = useQueryClient();
  const { start, success, error } = useLoadingStore();

  // Ограничения пикеров
  const startMin = minToTime(WORK_START_HOUR * 60);
  const startMax = minToTime((WORK_END_HOUR * 60) - MIN_DURATION_MIN);
  const endMin = useMemo(() => {
    const candidate = timeToMin(startTime) + MIN_DURATION_MIN;
    return minToTime(Math.min(candidate, WORK_END_HOUR * 60));
  }, [startTime]);
  const endMax = minToTime(WORK_END_HOUR * 60);

  const validation = useMemo(() => {
    const s = timeToMin(startTime);
    const e = timeToMin(endTime);
    if (e <= s) return "Конец должен быть позже начала";
    if (e - s < MIN_DURATION_MIN)
      return `Минимум ${MIN_DURATION_MIN} минут`;
    if (e > WORK_END_HOUR * 60) return "Вне рабочих часов";
    if (hasOverlapWithBookings(startTime, endTime, dayBookings))
      return "Пересекается с существующей записью";
    return null;
  }, [startTime, endTime, dayBookings]);

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
    if (validation) {
      hapticError();
      error(validation);
      return;
    }
    mutation.mutate({
      startAt: moscowToUtcIso(initialDate, startTime),
      endAt: moscowToUtcIso(initialDate, endTime),
      description: description.trim() || undefined,
      background,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Новая запись">
      <div className="space-y-4">
        {/* Пикеры времени */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-tg-hint">Начало</label>
            <input
              type="time"
              step={TIME_STEP_MIN * 60}
              min={startMin}
              max={startMax}
              value={startTime}
              onChange={(e) => {
                const v = e.target.value;
                setStartTime(v);
                // Подтянуть end, если стал меньше start + MIN_DURATION
                const minEnd = timeToMin(v) + MIN_DURATION_MIN;
                if (timeToMin(endTime) < minEnd) {
                  setEndTime(minToTime(Math.min(minEnd, WORK_END_HOUR * 60)));
                }
              }}
              className="w-full rounded-xl bg-tg-secondary px-4 py-3 text-[15px] text-tg-text
                         outline-none focus:ring-2 focus:ring-tg-button/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-tg-hint">Конец</label>
            <input
              type="time"
              step={TIME_STEP_MIN * 60}
              min={endMin}
              max={endMax}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full rounded-xl bg-tg-secondary px-4 py-3 text-[15px] text-tg-text
                         outline-none focus:ring-2 focus:ring-tg-button/40"
            />
          </div>
        </div>

        {/* Подсказка / ошибка */}
        {validation ? (
          <div className="text-sm text-red-500">{validation}</div>
        ) : (
          <div className="text-xs text-tg-hint">
            {formatTimeRange(
              moscowToUtcIso(initialDate, startTime),
              moscowToUtcIso(initialDate, endTime),
            )}{" "}
            · {timeToMin(endTime) - timeToMin(startTime)} мин
          </div>
        )}

        {/* Занятые интервалы */}
        {dayBookings.length > 0 && (
          <div>
            <div className="mb-1 text-xs text-tg-hint">Занято в этот день</div>
            <div className="space-y-1">
              {dayBookings.map((b) => (
                <div
                  key={b.id}
                  className="rounded-lg bg-tg-secondary px-3 py-1.5 text-xs text-tg-text"
                >
                  {mskTime(b.startAt)} – {mskTime(b.endAt)} · @{b.username}
                </div>
              ))}
            </div>
          </div>
        )}

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

        <Button
          onClick={submit}
          disabled={!!validation || mutation.isPending}
        >
          {mutation.isPending ? "Записываем..." : "Записаться"}
        </Button>
      </div>
    </Modal>
  );
}