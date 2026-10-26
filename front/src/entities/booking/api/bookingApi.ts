import { api } from "@/shared/api/client";
import type { Booking, CreateBookingPayload } from "../model/types";

export const bookingApi = {
  list: (month: string) => api<Booking[]>(`/api/bookings?month=${month}`),
  mine: () => api<Booking[]>("/api/bookings/me"),
  create: (p: CreateBookingPayload) =>
    api<Booking>("/api/bookings", { method: "POST", body: JSON.stringify(p) }),
  remove: (id: string) =>
    api<{ ok: boolean }>(`/api/bookings/${id}`, { method: "DELETE" }),
};