import { useMemo } from "react";
import { getTgUser } from "@/shared/lib/telegram";
import { ADMIN_IDS } from "@/shared/config/auth";
import type { Me } from "./types";

export function useMe(): {
  data: Me | null;
  isLoading: false;
  error: null;
} {
  const u = getTgUser();

  const me = useMemo<Me | null>(() => {
    if (!u) return null;
    return {
      id: u.id,
      username: u.username,
      firstName: u.first_name,
      isAdmin: ADMIN_IDS.has(u.id),
    };
  }, [u]);

  return { data: me, isLoading: false, error: null };
}