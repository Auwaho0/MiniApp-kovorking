from datetime import datetime

from pydantic import BaseModel, Field


class BookingCreate(BaseModel):
    start_at: datetime = Field(alias="startAt")
    end_at: datetime = Field(alias="endAt")
    description: str | None = None
    background: str = "#3b82f6"

    model_config = {"populate_by_name": True}


class NotifyPayload(BaseModel):
    date: str


class WaitlistCreate(BaseModel):
    date: str


def booking_to_dict(b) -> dict:
    return {
        "id": b.id,
        "userId": b.user_id,
        "username": b.username,
        "startAt": b.start_at.isoformat(),
        "endAt": b.end_at.isoformat(),
        "description": b.description,
        "background": b.background,
        "createdAt": b.created_at.isoformat(),
    }


def waitlist_to_dict(w) -> dict:
    return {
        "id": w.id,
        "userId": w.user_id,
        "username": w.username,
        "date": w.date.isoformat(),
        "createdAt": w.created_at.isoformat(),
    }