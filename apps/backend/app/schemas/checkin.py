"""Check-in and Plan Pydantic schemas."""

from pydantic import BaseModel, Field
from datetime import datetime


class ReliefItem(BaseModel):
    """A single immediate relief or daily habit technique."""
    id: str
    name: str
    emoji: str
    category: str  # breathing|grounding|movement|meditation|social|creative
    duration: str
    instructions: list[str]
    scienceNote: str = ""
    source: str = ""


class CheckinRequest(BaseModel):
    mood_tag: str
    text: str | None = None


class PlanResponse(BaseModel):
    """Complete AI-generated plan response."""
    isEmergency: bool = False
    primaryEmotion: str = ""
    emotionSummary: str = ""
    supportMessage: str = ""
    immediateRelief: list[ReliefItem] = Field(default_factory=list)
    dailyHabits: list[ReliefItem] = Field(default_factory=list)
    affirmation: str = ""
    gratitudePrompt: str = ""
    therapistNote: str = ""


class CheckinResponse(BaseModel):
    """Full check-in response with plan and streak info."""
    checkin_id: str
    plan: PlanResponse
    streak_id: str | None = None
    current_streak: int = 0
    global_streak: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}
