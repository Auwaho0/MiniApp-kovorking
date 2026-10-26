from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_session
from ..deps import get_current_user
from ..models import WaitlistEntry
from ..schemas import WaitlistCreate, waitlist_to_dict

router = APIRouter()


@router.get("/waitlist/me")
async def my_waitlist(
    user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[dict]:
    stmt = select(WaitlistEntry).where(WaitlistEntry.user_id == user["id"])
    rows = (await session.execute(stmt)).scalars().all()
    return [waitlist_to_dict(w) for w in rows]


@router.post("/waitlist")
async def add_waitlist(
    payload: WaitlistCreate,
    user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    try:
        d = date.fromisoformat(payload.date)
    except ValueError:
        raise HTTPException(400, "bad date")

    exists = await session.execute(
        select(WaitlistEntry).where(
            WaitlistEntry.user_id == user["id"], WaitlistEntry.date == d
        )
    )
    if exists.scalar_one_or_none():
        raise HTTPException(409, "already in waitlist")

    entry = WaitlistEntry(
        user_id=user["id"],
        username=user["username"],
        date=d,
    )
    session.add(entry)
    await session.commit()
    await session.refresh(entry)
    return waitlist_to_dict(entry)


@router.delete("/waitlist/{entry_id}")
async def remove_waitlist(
    entry_id: str,
    user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    entry = await session.get(WaitlistEntry, entry_id)
    if not entry:
        raise HTTPException(404, "not found")
    if entry.user_id != user["id"]:
        raise HTTPException(403, "forbidden")
    await session.delete(entry)
    await session.commit()
    return {"ok": True}