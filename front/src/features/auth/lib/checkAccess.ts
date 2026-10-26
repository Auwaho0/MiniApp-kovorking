import { ALLOWED_USERS } from "@/shared/config/auth";

export type TgUser = {
  id: number;
  username?: string;
  first_name?: string;
};

export function isAllowed(user: TgUser | null): boolean {
  if (!user) return false;
  const uname = user.username?.toLowerCase();
  return ALLOWED_USERS.some((allowed) => {
    if (allowed.id !== undefined && allowed.id === user.id) return true;
    if (
      allowed.username !== undefined &&
      uname !== undefined &&
      allowed.username.toLowerCase() === uname
    )
      return true;
    return false;
  });
}