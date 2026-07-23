"""Analytics Pydantic response schemas."""

from pydantic import BaseModel


class AnalyticsSummary(BaseModel):
    """Overall user stats summary."""
    total_checkins: int = 0
    total_days_completed: int = 0
    best_streak: int = 0
    journal_entries: int = 0
    meditations: int = 0


class MoodTrendPoint(BaseModel):
    """Single day mood data point."""
    date: str
    mood_score: float
    is_streak_day: bool = False


class EmotionSlice(BaseModel):
    """Emotion distribution slice for donut chart."""
    emotion: str
    count: int
    percentage: float


class StreakCorrelation(BaseModel):
    """Mood comparison: streak days vs off days."""
    avg_mood_streak_days: float = 0
    avg_mood_off_days: float = 0
    improvement_percent: float = 0


class InsightCard(BaseModel):
    """AI-generated insight card."""
    emoji: str
    text: str


class AnalyticsTrendsResponse(BaseModel):
    """Full trends response combining all analytics data."""
    mood_trends: list[MoodTrendPoint] = []
    emotion_distribution: list[EmotionSlice] = []
    streak_correlation: StreakCorrelation = StreakCorrelation()
    insights: list[InsightCard] = []
