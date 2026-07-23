"""Streak Pydantic schemas."""

from pydantic import BaseModel, field_validator
from datetime import datetime, date
from uuid import UUID


class DayCompleteRequest(BaseModel):
    reflection_note: str | None = None
    mood_rating: int | None = None  # 1-5


class DailyCompletionResponse(BaseModel):
    id: str
    day_number: int
    completed_at: datetime
    habit_completed: bool | None
    reflection_note: str | None
    mood_rating: int | None

    model_config = {"from_attributes": True}

    @field_validator("id", mode="before")
    @classmethod
    def cast_to_str(cls, v):
        return str(v)


class StreakResponse(BaseModel):
    id: str
    user_id: str
    plan_id: str
    current_streak: int
    longest_streak: int
    total_days_completed: int
    start_date: date
    last_completed_date: date | None
    daily_completions: list[DailyCompletionResponse] = []
    created_at: datetime
    is_completed_today: bool = False
    global_streak: int = 0

    model_config = {"from_attributes": True}

    @field_validator("id", "user_id", "plan_id", mode="before")
    @classmethod
    def cast_to_str(cls, v):
        return str(v)


class StreakSummary(BaseModel):
    """Lightweight streak info for dashboard."""
    current_streak: int
    longest_streak: int
    global_streak: int = 0
    total_days_completed: int
    start_date: date
    is_completed_today: bool = False
