from datetime import datetime, time
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from ..database import get_session
from ..deps import get_current_user
from ..models import Booking
from ..schemas import BookingCreate, booking_to_dict
from ..telegram_api import send_message

router = APIRouter()
MSK = ZoneInfo("Europe/Moscow")

# Рабочие часы и минимальная длительность — синхронизированы с фронтом
# (front/src/shared/config/constants.ts)
WORK_START = time(10, 0)
WORK_END = time(21, 0)
MIN_DURATION_MIN = 60


def _month_range(month: str) -> tuple[datetime, datetime]:
    try:
        y, m = month.split("-")
        start = datetime(int(y), int(m), 1, tzinfo=MSK)
    except Exception:
        raise HTTPException(400, "bad month")
    if m == "12":
        end = datetime(int(y) + 1, 1, 1, tzinfo=MSK)
    else:
        end = datetime(int(y), int(m) + 1, 1, tzinfo=MSK)
    return start, end


@router.get("/bookings")
async def list_bookings(
    month: str = Query(...),
    _: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[dict]:
    start, end = _month_range(month)
    stmt = select(Booking).where(
        and_(Booking.start_at < end, Booking.end_at >= start)
    ).order_by(Booking.start_at)
    rows = (await session.execute(stmt)).scalars().all()
    return [booking_to_dict(b) for b in rows]


@router.get("/bookings/me")
async def my_bookings(
    user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[dict]:
    stmt = select(Booking).where(
        Booking.user_id == user["id"]
    ).order_by(Booking.start_at)
    rows = (await session.execute(stmt)).scalars().all()
    return [booking_to_dict(b) for b in rows]


@router.post("/bookings")
async def create_booking(
    payload: BookingCreate,
    user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    # 1) Базовая проверка порядка
    if payload.end_at <= payload.start_at:
        raise HTTPException(400, "end_at must be after start_at")

    # 2) Приводим к МСК и проверяем:
    #    - запись не переходит через полночь
    #    - в пределах рабочих часов
    #    - длительность >= MIN_DURATION_MIN
    start_msk = payload.start_at.astimezone(MSK)
    end_msk = payload.end_at.astimezone(MSK)

    if start_msk.date() != end_msk.date():
        raise HTTPException(400, "Запись должна быть в пределах одного дня")

    if start_msk.time() < WORK_START or end_msk.time() > WORK_END:
        raise HTTPException(400, "Вне рабочих часов (10:00–21:00 МСК)")

    if (end_msk - start_msk).total_seconds() < MIN_DURATION_MIN * 60:
        raise HTTPException(400, f"Минимум {MIN_DURATION_MIN} минут")

    # 3) Пересечение с существующей записью
    overlap_stmt = select(Booking).where(
        and_(Booking.start_at < payload.end_at, Booking.end_at > payload.start_at)
    )
    if (await session.execute(overlap_stmt)).scalars().first():
        raise HTTPException(409, "Этот интервал уже занят")

    # 4) Создание
    booking = Booking(
        user_id=user["id"],
        username=user["username"],
        start_at=payload.start_at,
        end_at=payload.end_at,
        description=payload.description,
        background=payload.background,
    )
    session.add(booking)
    await session.commit()
    await session.refresh(booking)
    return booking_to_dict(booking)


@router.delete("/bookings/{booking_id}")
async def delete_booking(
    booking_id: str,
    user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    booking = await session.get(Booking, booking_id)
    if not booking:
        raise HTTPException(404, "not found")

    is_admin = user["id"] in settings.admin_ids
    is_owner = booking.user_id == user["id"]
    if not is_admin and not is_owner:
        raise HTTPException(403, "forbidden")

    owner_id = booking.user_id
    date_str = booking.start_at.astimezone(MSK).strftime("%d.%m.%Y")

    await session.delete(booking)
    await session.commit()

    if is_admin and owner_id != user["id"]:
        await send_message(
            owner_id,
            f"❌ Ваша запись на <b>{date_str}</b> отменена администратором.",
            "Открыть Mini App",
            settings.MINI_APP_URL,
        )
    return {"ok": True}