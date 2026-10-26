import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { qk } from "@/shared/api/keys";
import { bookingApi } from "../api/bookingApi";

export function useBookings(month: string) {
  return useQuery({
    queryKey: qk.bookings(month),
    queryFn: () => bookingApi.list(month),
    // Данные свежие 10 минут — за это время переключение месяцев
    // никогда не идёт в сеть.
    staleTime: 10 * 60 * 1000,
    // Кэш живёт час — даже после возврата из другого таба.
    gcTime: 60 * 60 * 1000,
    // При переключении на новый месяц — React Query отдаёт
    // данные прошлого как placeholder. data никогда не undefined
    // после первой загрузки → skeleton больше не появится.
    placeholderData: keepPreviousData,
  });
}

export function useMyBookings() {
  return useQuery({
    queryKey: qk.myBookings,
    queryFn: bookingApi.mine,
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}