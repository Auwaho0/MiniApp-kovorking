import { api } from "@/shared/api/client";
import type { WaitlistEntry } from "../model/types";

export const waitlistApi = {
  mine: () => api<WaitlistEntry[]>("/api/waitlist/me"),
  add: (date: string) =>
    api<WaitlistEntry>("/api/waitlist", { method: "POST", body: JSON.stringify({ date }) }),
  remove: (id: string) =>
    api<{ ok: boolean }>(`/api/waitlist/${id}`, { method: "DELETE" }),
};