"""Ritual Service — Personalized morning/evening content."""

from datetime import date, timedelta
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.checkin import Checkin, Plan
from app.models.streak import Streak, DailyCompletion
from app.models.journal import JournalEntry
from app.models.user import User
from app.services.analytics_service import mood_tag_to_score


async def get_morning_ritual(db: AsyncSession, user_id: str) -> dict:
    """
    Build a personalized morning ritual.

    Includes: greeting, affirmation, streak status, daily habit,
    gratitude prompt, and breathing suggestion.
    """
    # Get user name
    user = await db.get(User, user_id)
    name = user.name if user and user.name else "friend"

    # Get active streak
    streak_result = await db.execute(
        select(Streak)
        .where(Streak.user_id == user_id)
        .order_by(Streak.created_at.desc())
        .limit(1)
    )
    streak = streak_result.scalar_one_or_none()

    streak_status = None
    daily_habit = None
    if streak:
        streak_status = {
            "current_streak": streak.current_streak,
            "total_days": streak.total_days_completed,
            "message": _get_streak_message(streak.current_streak),
        }

        # Get today's habit from the associated plan
        plan_result = await db.execute(
            select(Plan)
            .where(Plan.id == streak.plan_id)
        )
        plan = plan_result.scalar_one_or_none()
        if plan and plan.daily_habits:
            habits = plan.daily_habits if isinstance(plan.daily_habits, list) else []
            if habits:
                # Cycle through habits based on day number
                idx = streak.total_days_completed % len(habits)
                daily_habit = habits[idx]

    # Get latest affirmation from most recent plan
    latest_plan = await db.execute(
        select(Plan.affirmation)
        .where(Plan.user_id == user_id)
        .order_by(Plan.created_at.desc())
        .limit(1)
    )
    affirmation_row = latest_plan.first()
    affirmation = (
        affirmation_row.affirmation
        if affirmation_row and affirmation_row.affirmation
        else "I am capable of amazing things. Today is full of possibility."
    )

    # Gratitude prompt
    gratitude_prompts = [
        "What's one thing you're looking forward to today?",
        "Name someone who makes your life better.",
        "What's a small comfort you're grateful for?",
        "What skill or ability are you thankful to have?",
        "What made you smile yesterday?",
        "What's a place that brings you peace?",
        "Who believed in you when you needed it most?",
    ]
    prompt_idx = date.today().toordinal() % len(gratitude_prompts)

    return {
        "greeting": f"Good morning, {name}.",
        "affirmation": affirmation,
        "streak_status": streak_status,
        "daily_habit": daily_habit,
        "gratitude_prompt": gratitude_prompts[prompt_idx],
        "breathing_suggestion": {
            "name": "Morning Energizer",
            "technique": "coherent",
            "duration_seconds": 120,
            "instructions": "Breathe in for 5 seconds, out for 5 seconds. Repeat for 2 minutes.",
        },
    }


async def get_afternoon_ritual(db: AsyncSession, user_id: str) -> dict:
    """
    Build a personalized mid-day / afternoon ritual.

    Focuses on recharging, mid-day reflection, and momentum.
    """
    user = await db.get(User, user_id)
    name = user.name if user and user.name else "friend"

    # Get active streak & habit
    streak_result = await db.execute(
        select(Streak)
        .where(Streak.user_id == user_id)
        .order_by(Streak.created_at.desc())
        .limit(1)
    )
    streak = streak_result.scalar_one_or_none()

    streak_status = None
    daily_habit = None
    if streak:
        streak_status = {
            "current_streak": streak.current_streak,
            "total_days": streak.total_days_completed,
            "message": f"Keep it up, {name}! You're on a {streak.current_streak} day journey.",
        }
        plan_result = await db.execute(select(Plan).where(Plan.id == streak.plan_id))
        plan = plan_result.scalar_one_or_none()
        if plan and plan.daily_habits:
            habits = plan.daily_habits if isinstance(plan.daily_habits, list) else []
            if habits:
                idx = streak.total_days_completed % len(habits)
                daily_habit = habits[idx]

    # Get latest affirmation
    latest_plan = await db.execute(
        select(Plan.affirmation)
        .where(Plan.user_id == user_id)
        .order_by(Plan.created_at.desc())
        .limit(1)
    )
    affirmation_row = latest_plan.first()
    affirmation = (
        affirmation_row.affirmation
        if affirmation_row and affirmation_row.affirmation
        else "I am focused, present, and capable of handling whatever comes my way."
    )

    # Afternoon gratitude / reflection prompts
    afternoon_prompts = [
        "What's one win you've had so far today?",
        "Name a small thing that went better than expected.",
        "What's helping you stay focused right now?",
        "Who has made your day a little easier?",
        "What's a piece of beauty you've noticed today?",
        "How have you shown kindness to yourself so far?",
        "What are you proud of accomplishing before noon?",
    ]
    prompt_idx = date.today().toordinal() % len(afternoon_prompts)

    return {
        "greeting": f"Good afternoon, {name}.",
        "affirmation": affirmation,
        "streak_status": streak_status,
        "daily_habit": daily_habit,
        "gratitude_prompt": afternoon_prompts[prompt_idx],
        "breathing_suggestion": {
            "name": "Mid-day Recharge",
            "technique": "box",
            "duration_seconds": 180,
            "instructions": "4-4-4-4: Inhale 4, Hold 4, Exhale 4, Hold 4. Resets the nervous system.",
        },
    }



async def get_evening_winddown(db: AsyncSession, user_id: str) -> dict:
    """
    Build a personalized evening wind-down.

    Includes: mood check (has today been checked?), habit completion status,
    gratitude prompt, sleep music suggestion, and breathing guide.
    """
    user = await db.get(User, user_id)
    name = user.name if user and user.name else "friend"

    today = date.today()

    # Check if user already checked in today
    today_checkin = await db.execute(
        select(Checkin)
        .where(
            and_(
                Checkin.user_id == user_id,
                func.date(Checkin.created_at) == today,
            )
        )
        .limit(1)
    )
    has_checked_in = today_checkin.scalar_one_or_none() is not None

    # Check if today's habit is completed
    streak_result = await db.execute(
        select(Streak)
        .where(Streak.user_id == user_id)
        .order_by(Streak.created_at.desc())
        .limit(1)
    )
    streak = streak_result.scalar_one_or_none()

    habit_completed = False
    if streak:
        comp = await db.execute(
            select(DailyCompletion)
            .where(
                and_(
                    DailyCompletion.streak_id == streak.id,
                    func.date(DailyCompletion.completed_at) == today,
                )
            )
        )
        habit_completed = comp.scalar_one_or_none() is not None

    # Get gratitude prompt for evening
    evening_prompts = [
        "What went well today, even if it was small?",
        "Who showed you kindness today?",
        "What's one thing you learned today?",
        "What challenge did you handle well today?",
        "What moment brought you unexpected joy?",
        "What are you proud of from today?",
        "What would you like to carry into tomorrow?",
    ]
    prompt_idx = today.toordinal() % len(evening_prompts)

    return {
        "greeting": f"Good evening, {name}.",
        "has_checked_in": has_checked_in,
        "habit_completed": habit_completed,
        "current_streak": streak.current_streak if streak else 0,
        "gratitude_prompt": evening_prompts[prompt_idx],
        "breathing_suggestion": {
            "name": "4-7-8 Sleep Breath",
            "technique": "478",
            "duration_seconds": 300,
            "instructions": "Inhale 4 seconds, hold 7 seconds, exhale 8 seconds. Repeat 4–8 cycles.",
        },
    }


def _get_streak_message(current_streak: int) -> str:
    """Get an encouraging streak message."""
    if current_streak == 0:
        return "Start fresh today — no judgment, just forward."
    elif current_streak < 5:
        return f"Day {current_streak} — you're building momentum."
    elif current_streak < 10:
        return f"Day {current_streak} — you're on a roll."
    elif current_streak < 15:
        return f"Day {current_streak} — halfway to a powerful habit."
    elif current_streak < 21:
        return f"Day {current_streak} — almost there. Keep going."
    else:
        return f"Day {current_streak} — you are unstoppable."
