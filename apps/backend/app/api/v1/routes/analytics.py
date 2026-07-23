"""Analytics routes — Mood trends, emotion distribution, and insights."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.analytics import (
    AnalyticsSummary,
    AnalyticsTrendsResponse,
    MoodTrendPoint,
    EmotionSlice,
    StreakCorrelation,
    InsightCard,
)
from app.services.analytics_service import (
    get_summary,
    get_mood_trends,
    get_emotion_distribution,
    get_streak_correlation,
    generate_insights,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
async def analytics_summary(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the user's overall analytics summary."""
    user_id = current_user["sub"]
    data = await get_summary(db, user_id)
    return AnalyticsSummary(**data)


@router.get("/trends", response_model=AnalyticsTrendsResponse)
async def analytics_trends(
    period: str = Query("30d", pattern=r"^\d+d$"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get mood trends, emotion distribution, streak correlation, and insights.

    Period format: Nd (e.g. 30d, 14d, 7d)
    """
    user_id = current_user["sub"]
    days = int(period.replace("d", ""))

    mood_trends = await get_mood_trends(db, user_id, days)
    emotion_dist = await get_emotion_distribution(db, user_id, days)
    correlation = await get_streak_correlation(db, user_id)
    insights = await generate_insights(db, user_id)

    return AnalyticsTrendsResponse(
        mood_trends=[MoodTrendPoint(**t) for t in mood_trends],
        emotion_distribution=[EmotionSlice(**e) for e in emotion_dist],
        streak_correlation=StreakCorrelation(**correlation),
        insights=[InsightCard(**i) for i in insights],
    )
