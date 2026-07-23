"""Streak Service — Business logic for 21-day streak tracking."""

from datetime import date, timedelta
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.streak import Streak, DailyCompletion


async def get_active_streak(db: AsyncSession, user_id: UUID) -> Streak | None:
    """Get the user's most recent active streak."""
    result = await db.execute(
        select(Streak)
        .where(Streak.user_id == user_id)
        .order_by(Streak.created_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


async def complete_day(
    db: AsyncSession,
    streak_id: UUID,
    reflection_note: str | None = None,
    mood_rating: int | None = None,
) -> DailyCompletion:
    """
    Mark today as completed for a streak.
    - Increments plan-specific counters via UnifiedStreakService
    - Saves a record of the DailyCompletion
    """
    # 1. Fetch the streak first to find the plan_id and user_id
    streak = await db.get(Streak, streak_id)
    if not streak:
        raise ValueError("Streak not found")

    today = date.today()

    # 2. Check if already completed today (Journey specifically)
    existing = await db.execute(
        select(DailyCompletion).where(
            DailyCompletion.streak_id == streak_id,
            DailyCompletion.completed_at >= today,
        )
    )
    if existing.scalar_one_or_none():
        raise ValueError("Journey already marked complete for today")

    # 3. Save the detail record
    day_number = streak.total_days_completed + 1
    completion = DailyCompletion(
        streak_id=streak_id,
        day_number=day_number,
        reflection_note=reflection_note,
        mood_rating=mood_rating,
    )
    db.add(completion)

    # 4. Use unified service to update counters for both User and Streak models
    from app.services.unified_streak_service import update_user_streak
    await update_user_streak(
        db, 
        str(streak.user_id), 
        activity_type="journey", 
        plan_id=str(streak.plan_id)
    )

    return completion


def detect_milestone(current_streak: int) -> str | None:
    """Check if current streak hits a milestone."""
    milestones = {
        5: "🌱 You're sprouting! 5 days strong.",
        10: "🌿 Halfway hero! Habits are forming in your brain.",
        15: "🌸 Almost there! You're in the top 5% of people who stick with this.",
        21: "🏆 YOU ARE A WINNER! 21 days. New you.",
    }
    return milestones.get(current_streak)
