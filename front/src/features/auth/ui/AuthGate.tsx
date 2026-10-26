import { ReactNode, useEffect } from "react";
import { getTg, getTgUser, setBackButton } from "@/shared/lib/telegram";
import { isAllowed } from "../lib/checkAccess";

/**
 * В dev-сборке (vite dev) и вне Telegram — пропускаем без проверки,
 * чтобы можно было отлаживать в обычном браузере.
 * В production-билде (!import.meta.env.DEV) проверка срабатывает всегда.
 */
const DEV_BYPASS = import.meta.env.DEV;

export function AuthGate({ children }: { children: ReactNode }) {
  useEffect(() => {
    setBackButton(false);
  }, []);

  if (DEV_BYPASS && !getTg()) {
    return <>{children}</>;
  }

  if (!getTg()) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-tg-bg p-6 text-center">
        <div className="text-5xl">📱</div>
        <div className="text-lg font-semibold text-tg-text">Откройте в Telegram</div>
        <div className="text-sm text-tg-hint">
          Это приложение работает только внутри Telegram Mini App.
        </div>
      </div>
    );
  }

  const user = getTgUser();

  if (!isAllowed(user)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-tg-bg p-6 text-center">
        <div className="text-5xl">🔒</div>
        <div className="text-lg font-semibold text-tg-text">Доступ закрыт</div>
        <div className="text-sm text-tg-hint">
          Аккаунт {user?.username ? `@${user.username}` : `#${user?.id ?? "?"}`} не
          в списке участников. Обратитесь к администратору.
        </div>
      </div>
    );
  }

  return <>{children}</>;
}