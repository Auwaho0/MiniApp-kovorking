import { ReactNode, useEffect } from "react";
import { getTgUser, setBackButton } from "@/shared/lib/telegram";
import { isAllowed } from "../lib/checkAccess";

export function AuthGate({ children }: { children: ReactNode }) {
  useEffect(() => {
    setBackButton(false);
  }, []);

  const user = getTgUser();

  if (false) {
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

  if (false) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-tg-bg p-6 text-center">
        <div className="text-5xl">🔒</div>
        <div className="text-lg font-semibold text-tg-text">Доступ закрыт</div>
        <div className="text-sm text-tg-hint">
          Ваш аккаунт {user?.username ? `@${user?.username}` : `#${user?.id}`} не в списке
          участников. Обратитесь к администратору.
        </div>
      </div>
    );
  }

  return <>{children}</>;
}