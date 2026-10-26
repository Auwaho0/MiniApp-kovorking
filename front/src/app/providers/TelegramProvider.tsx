import { ReactNode, useEffect } from "react";
import { initTelegram } from "@/shared/lib/telegram";

export function TelegramProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    initTelegram();
  }, []);
  return <>{children}</>;
}