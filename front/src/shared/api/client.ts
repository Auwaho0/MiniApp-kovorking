import { API_URL } from "../config/env";
import { getTgUser } from "../lib/telegram";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const user = getTgUser();
  if (!user) {
    throw new Error("Откройте приложение в Telegram");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": String(user.id),
      "X-Username": user.username ?? "",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { detail?: string }).detail ?? `HTTP ${res.status}`);
  }
  return res.json();
}