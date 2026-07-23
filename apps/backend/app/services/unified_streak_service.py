"""Unified Streak Service — Manages both Global App Streaks and Plan-Specific progress."""

from datetime import date, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.streak import Streak, DailyCompletion

async def update_user_streak(
    db: AsyncSession, 
    user_id: str, 
    activity_type: str = "general", # 'general', 'journey', 'checkin', 'journal'
    plan_id: str | None = None
):
    """
    Increments the user's global streak and plan-specific streak if applicable.
    
    Logic:
    - If user hasn't active today:
        - If last_activity was yesterday: Increment Global Streak.
        - If last_activity was >yesterday: Reset Global Streak to 1.
        - Update last_activity_date = today.
    - If activity_type is 'journey' or 'checkin' (which sets a plan):
        - Find or create a Streak record for the plan.
        - Increment plan's current_streak (with same consecutive-day logic).
    """
    today = date.today()
    
    # 1. Update Global App Streak
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    
    if not user:
        return None

    is_new_day_activity = False
    if not user.last_activity_date:
        user.app_streak_count = 1
        user.longest_app_streak = 1
        user.last_activity_date = today
        is_new_day_activity = True
    elif user.last_activity_date < today:
        is_new_day_activity = True
        if user.last_activity_date == today - timedelta(days=1):
            # Consecutive day
            user.app_streak_count += 1
            if user.app_streak_count > user.longest_app_streak:
                user.longest_app_streak = user.app_streak_count
        else:
            # Streak broken
            user.app_streak_count = 1
        user.last_activity_date = today

    # 2. Update Plan Specific Streak (Journey)
    # If activity is "journey", we increment the progress on the 21-day plan
    current_plan_streak = None
    if activity_type in ["journey", "checkin"] and plan_id:
        # Find the streak object for this plan
        streak_result = await db.execute(
            select(Streak).where(Streak.user_id == user_id, Streak.plan_id == plan_id)
        )
        streak = streak_result.scalar_one_or_none()
        
        if streak:
            if streak.last_completed_date < today:
                if streak.last_completed_date == today - timedelta(days=1):
                    streak.current_streak += 1
                else:
                    streak.current_streak = 1
                
                streak.total_days_completed += 1
                streak.last_completed_date = today
                if streak.current_streak > streak.longest_streak:
                    streak.longest_streak = streak.current_streak
            current_plan_streak = streak
        else:
            # First time for this plan
            new_streak = Streak(
                user_id=user_id,
                plan_id=plan_id,
                current_streak=1,
                longest_streak=1,
                total_days_completed=1,
                last_completed_date=today
            )
            db.add(new_streak)
            current_plan_streak = new_streak

    await db.flush()
    return {
        "global_streak": user.app_streak_count,
        "is_new_day": is_new_day_activity,
        "plan_streak": current_plan_streak.current_streak if current_plan_streak else None
    }
