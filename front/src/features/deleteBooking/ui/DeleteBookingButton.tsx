import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingApi } from "@/entities/booking/api/bookingApi";
import { Button } from "@/shared/ui/Button";
import { useLoadingStore } from "@/shared/model/loadingStore";
import { hapticError, hapticSuccess } from "@/shared/lib/telegram";

export function DeleteBookingButton({ id, onDone }: { id: string; onDone?: () => void }) {
  const qc = useQueryClient();
  const { start, success, error } = useLoadingStore();

  const m = useMutation({
    mutationFn: () => bookingApi.remove(id),
    onMutate: () => start("Удаляем..."),
    onSuccess: () => {
      hapticSuccess();
      success("Удалено");
      qc.invalidateQueries({ queryKey: ["bookings"] });
      onDone?.();
    },
    onError: (e: Error) => {
      hapticError();
      error(e.message);
    },
  });

  return (
    <Button variant="danger" onClick={() => m.mutate()}>
      Удалить
    </Button>
  );
}