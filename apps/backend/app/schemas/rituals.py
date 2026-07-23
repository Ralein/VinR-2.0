"""Ritual Pydantic response schemas."""

from pydantic import BaseModel


class BreathingSuggestion(BaseModel):
    name: str
    technique: str
    duration_seconds: int
    instructions: str


class StreakStatus(BaseModel):
    current_streak: int
    total_days: int
    message: str


class SleepSuggestion(BaseModel):
    genre: str
    message: str


class MorningRitualResponse(BaseModel):
    greeting: str
    affirmation: str
    streak_status: StreakStatus | None = None
    daily_habit: dict | None = None
    gratitude_prompt: str
    breathing_suggestion: BreathingSuggestion


class EveningWindDownResponse(BaseModel):
    greeting: str
    has_checked_in: bool = False
    habit_completed: bool = False
    current_streak: int = 0
    gratitude_prompt: str
    sleep_suggestion: SleepSuggestion
    breathing_suggestion: BreathingSuggestion
class AfternoonRitualResponse(BaseModel):
    greeting: str
    affirmation: str
    streak_status: StreakStatus | None = None
    daily_habit: dict | None = None
    gratitude_prompt: str
    breathing_suggestion: BreathingSuggestion
