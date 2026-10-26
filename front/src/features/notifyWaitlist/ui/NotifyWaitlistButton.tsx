import { useMutation } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import { Button } from "@/shared/ui/Button";
import { useLoadingStore } from "@/shared/model/loadingStore";
import { hapticError, hapticSuccess } from "@/shared/lib/telegram";

export function NotifyWaitlistButton({ date }: { date: string }) {
  const { start, success, error } = useLoadingStore();

  const m = useMutation({
    mutationFn: () =>
      api<{ sent: number; total: number }>("/api/notify", {
        method: "POST",
        body: JSON.stringify({ date }),
      }),
    onMutate: () => start("Отправляем уведомления..."),
    onSuccess: (res) => {
      hapticSuccess();
      success(res.sent > 0 ? `Отправлено: ${res.sent}` : "Никто не ждёт");
    },
    onError: (e: Error) => {
      hapticError();
      error(e.message);
    },
  });

  return (
    <Button variant="secondary" onClick={() => m.mutate()}>
      🔔 Оповестить лист ожидания
    </Button>
  );
}