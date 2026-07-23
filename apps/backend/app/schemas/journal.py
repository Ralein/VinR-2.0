"""Pydantic schemas for journal entries."""

from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel, Field


class JournalEntryCreate(BaseModel):
    """Create a new journal entry."""
    gratitude_items: list[str] = Field(
        ..., min_length=1, max_length=5,
        description="List of 1-5 gratitude items"
    )
    reflection_text: str | None = Field(
        None, max_length=2000,
        description="Free-form reflection text"
    )
    mood_at_entry: int | None = Field(
        None, ge=1, le=5,
        description="Mood rating 1-5"
    )


class JournalEntryResponse(BaseModel):
    """Journal entry response with AI reflection."""
    id: UUID
    user_id: str
    date: date
    gratitude_items: list[str]
    reflection_text: str | None = None
    mood_at_entry: int | None = None
    ai_response: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class JournalCalendarResponse(BaseModel):
    """Minimal response for calendar dots — just dates with entries."""
    dates: list[date]


class WeeklyInsightResponse(BaseModel):
    """Weekly AI-generated insight from journal entries."""
    insight: str
    week_start: date
    week_end: date
    entry_count: int
