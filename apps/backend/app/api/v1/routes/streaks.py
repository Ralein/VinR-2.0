"""Streak routes — 21-day streak tracking."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.streak import Streak
from app.schemas.streak import StreakResponse, StreakSummary, DayCompleteRequest
from app.services.streak_service import get_active_streak, complete_day, detect_milestone

router = APIRouter(prefix="/streaks", tags=["streaks"])


@router.get("/active", response_model=StreakResponse | None)
async def get_active(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the user's currently active streak."""
    user_id = current_user["sub"]
    streak = await get_active_streak(db, user_id)
    if streak:
        # Calculate if completed today
        from datetime import date
        from app.models.user import User
        is_done = streak.last_completed_date == date.today()
        # Get global streak from user
        user_result = await db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()
        global_streak = user.app_streak_count if user else 0
        # Build response with extra fields
        streak_data = StreakResponse.model_validate(streak)
        streak_data.is_completed_today = is_done
        streak_data.global_streak = global_streak
        return streak_data
    return None


@router.get("/history", response_model=list[StreakSummary])
async def get_history(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all past streaks for the user."""
    user_id = current_user["sub"]
    result = await db.execute(
        select(Streak)
        .where(Streak.user_id == user_id)
        .order_by(Streak.created_at.desc())
    )
    streaks = result.scalars().all()
    from app.models.user import User
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    global_streak = user.app_streak_count if user else 0

    return [
        StreakSummary(
            current_streak=s.current_streak,
            longest_streak=s.longest_streak,
            global_streak=global_streak,
            total_days_completed=s.total_days_completed,
            start_date=s.start_date,
        )
        for s in streaks
    ]


@router.post("/{streak_id}/complete-day")
async def mark_day_complete(
    streak_id: UUID,
    request: DayCompleteRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark today as completed for a streak."""
    try:
        completion = await complete_day(
            db=db,
            streak_id=streak_id,
            reflection_note=request.reflection_note,
            mood_rating=request.mood_rating,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Check for milestone
    streak = await db.get(Streak, streak_id)
    milestone = detect_milestone(streak.current_streak) if streak else None

    # Update Global Streak as well
    from app.services.unified_streak_service import update_user_streak
    streak_result = await update_user_streak(db, str(current_user["sub"]), activity_type="journey", plan_id=str(streak.plan_id))

    return {
        "success": True,
        "day_number": completion.day_number,
        "current_streak": streak.current_streak if streak else 0,
        "global_streak": streak_result.get("global_streak") if streak_result else 0,
        "milestone": milestone,
    }
