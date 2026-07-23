"""Pydantic schemas for notification preferences."""

from datetime import time, datetime
from uuid import UUID
from pydantic import BaseModel, Field


class NotificationPreferencesResponse(BaseModel):
    """Response schema for notification preferences."""
    id: UUID
    user_id: str
    daily_reminder_enabled: bool
    daily_reminder_time: time
    streak_at_risk_enabled: bool
    milestone_enabled: bool
    re_engagement_enabled: bool
    snooze_until: datetime | None = None

    model_config = {"from_attributes": True}


class NotificationPreferencesUpdate(BaseModel):
    """Update schema — all fields optional."""
    daily_reminder_enabled: bool | None = None
    daily_reminder_time: time | None = None
    streak_at_risk_enabled: bool | None = None
    milestone_enabled: bool | None = None
    re_engagement_enabled: bool | None = None


class SnoozeRequest(BaseModel):
    """Snooze notifications for N hours."""
    hours: int = Field(default=2, ge=1, le=24)
