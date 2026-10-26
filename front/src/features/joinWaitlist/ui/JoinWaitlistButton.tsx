import { useMutation, useQueryClient } from "@tanstack/react-query";
import { waitlistApi } from "@/entities/waitlist/api/waitlistApi";
import { Button } from "@/shared/ui/Button";
import { useLoadingStore } from "@/shared/model/loadingStore";
import { hapticError, hapticSuccess } from "@/shared/lib/telegram";

export function JoinWaitlistButton({
  date,
  alreadyIn,
  entryId,
}: {
  date: string;
  alreadyIn: boolean;
  entryId?: string;
}) {
  const qc = useQueryClient();
  const { start, success, error } = useLoadingStore();

  const add = useMutation({
    mutationFn: () => waitlistApi.add(date),
    onMutate: () => start("Добавляем..."),
    onSuccess: () => {
      hapticSuccess();
      success("Вы в листе ожидания");
      qc.invalidateQueries({ queryKey: ["waitlist"] });
    },
    onError: (e: Error) => {
      hapticError();
      error(e.message);
    },
  });

  const remove = useMutation({
    mutationFn: () => waitlistApi.remove(entryId!),
    onMutate: () => start("Убираем..."),
    onSuccess: () => {
      hapticSuccess();
      success("Удалено из листа");
      qc.invalidateQueries({ queryKey: ["waitlist"] });
    },
    onError: (e: Error) => {
      hapticError();
      error(e.message);
    },
  });

  if (alreadyIn) {
    return (
      <Button variant="secondary" onClick={() => remove.mutate()}>
        Вы в листе ожидания · Убрать
      </Button>
    );
  }

  return (
    <Button variant="secondary" onClick={() => add.mutate()}>
      ⏳ В лист ожидания
    </Button>
  );
}