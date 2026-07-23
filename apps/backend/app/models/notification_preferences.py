"""Notification Preferences ORM model."""

import uuid
from datetime import datetime, time
from sqlalchemy import String, Boolean, DateTime, Time, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class NotificationPreferences(Base):
    __tablename__ = "notification_preferences"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[str] = mapped_column(
        String(255), ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, unique=True, index=True
    )

    # Daily reminder
    daily_reminder_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    daily_reminder_time: Mapped[time] = mapped_column(
        Time, default=time(8, 0)  # 8:00 AM default
    )

    # Streak at risk (11 PM warning)
    streak_at_risk_enabled: Mapped[bool] = mapped_column(Boolean, default=True)

    # Milestone notifications
    milestone_enabled: Mapped[bool] = mapped_column(Boolean, default=True)

    # Re-engagement (3+ lapsed days)
    re_engagement_enabled: Mapped[bool] = mapped_column(Boolean, default=True)

    # Snooze
    snooze_until: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    user = relationship("User", back_populates="notification_preferences")
