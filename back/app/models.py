import uuid
from datetime import date, datetime

from sqlalchemy import BigInteger, Date, DateTime, Index, String, Text, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Booking(Base):
    __tablename__ = "bookings"
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[int] = mapped_column(BigInteger, index=True)
    username: Mapped[str] = mapped_column(String(64))
    start_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    end_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    background: Mapped[str] = mapped_column(String(16), default="#3b82f6")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    __table_args__ = (Index("ix_bookings_range", "start_at", "end_at"),)


class WaitlistEntry(Base):
    __tablename__ = "waitlist_entries"
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[int] = mapped_column(BigInteger, index=True)
    username: Mapped[str] = mapped_column(String(64))
    date: Mapped[date] = mapped_column(Date, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )