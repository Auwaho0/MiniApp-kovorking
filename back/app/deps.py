from fastapi import Depends, Header, HTTPException

from .config import settings


async def get_current_user(
    x_user_id: int = Header(..., alias="X-User-Id"),
    x_username: str | None = Header(default=None, alias="X-Username"),
) -> dict:
    """
    Авторизация на фронтенде, бэкенд просто читает заголовки.
    ⚠️ Не защищает от прямых HTTP-запросов с подделанным X-User-Id.
    """
    if x_user_id <= 0:
        raise HTTPException(401, "invalid user id")
    return {
        "id": x_user_id,
        "username": x_username or f"user{x_user_id}",
    }


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user["id"] not in settings.admin_ids:
        raise HTTPException(403, "admin only")
    return user