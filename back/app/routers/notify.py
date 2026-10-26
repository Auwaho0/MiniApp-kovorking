from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from ..database import get_session
from ..deps import require_admin
from ..models import WaitlistEntry
from ..schemas import NotifyPayload
from ..telegram_api import send_message

router = APIRouter()


@router.post("/notify")
async def notify_waitlist(
    payload: NotifyPayload,
    _: dict = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
) -> dict:
    try:
        d = date.fromisoformat(payload.date)
    except ValueError:
        raise HTTPException(400, "bad date")

    stmt = select(WaitlistEntry).where(WaitlistEntry.date == d)
    entries = (await session.execute(stmt)).scalars().all()

    sent = 0
    for e in entries:
        ok = await send_message(
            e.user_id,
            f"🦋 Освободилось место на <b>{d.strftime('%d.%m.%Y')}</b>! Успейте записаться.",
            "Открыть Mini App",
            settings.MINI_APP_URL,
        )
        if ok:
            sent += 1
            await session.delete(e)

    await session.commit()
    return {"sent": sent, "total": len(entries)}