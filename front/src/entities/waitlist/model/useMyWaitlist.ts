import { useQuery } from "@tanstack/react-query";
import { qk } from "@/shared/api/keys";
import { waitlistApi } from "../api/waitlistApi";

export function useMyWaitlist() {
  return useQuery({
    queryKey: qk.myWaitlist,
    queryFn: waitlistApi.mine,
    staleTime: 30_000,
  });
}