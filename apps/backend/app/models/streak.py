"""Streak and DailyCompletion ORM models."""

import uuid
from datetime import datetime, date
from sqlalchemy import String, DateTime, Date, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Streak(Base):
    __tablename__ = "streaks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[str] = mapped_column(
        String(255), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    plan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("plans.id", ondelete="CASCADE"), nullable=False
    )
    current_streak: Mapped[int] = mapped_column(Integer, default=0)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0)
    total_days_completed: Mapped[int] = mapped_column(Integer, default=0)
    start_date: Mapped[date] = mapped_column(Date, default=date.today)
    last_completed_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )

    # Relationships
    user = relationship("User", back_populates="streaks")
    daily_completions = relationship(
        "DailyCompletion", back_populates="streak", lazy="selectin", order_by="DailyCompletion.day_number"
    )


class DailyCompletion(Base):
    __tablename__ = "daily_completions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    streak_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("streaks.id", ondelete="CASCADE"), nullable=False, index=True
    )
    day_number: Mapped[int] = mapped_column(Integer, nullable=False)
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )
    habit_completed: Mapped[bool | None] = mapped_column(default=True)
    reflection_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    mood_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)  # 1-5

    # Relationships
    streak = relationship("Streak", back_populates="daily_completions")
