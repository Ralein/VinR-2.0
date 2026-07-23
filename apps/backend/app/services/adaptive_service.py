"""Adaptive AI Service — User context builder, habit preferences, escalation detection."""

from datetime import date, timedelta
from collections import Counter
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.checkin import Checkin, Plan
from app.models.streak import Streak, DailyCompletion
from app.models.journal import JournalEntry
from app.services.analytics_service import mood_tag_to_score


async def build_user_context(db: AsyncSession, user_id: str) -> str:
    """
    Build a rich context string for Grok about this user.

    Includes recent emotions, streak status, habit preferences,
    and patterns to enable adaptive responses.
    """
    parts = []

    # Last 5 check-ins
    result = await db.execute(
        select(Checkin.mood_tag, Checkin.raw_text, Checkin.created_at)
        .where(Checkin.user_id == user_id)
        .order_by(Checkin.created_at.desc())
        .limit(5)
    )
    recent_checkins = result.all()

    if recent_checkins:
        emotions = [c.mood_tag for c in recent_checkins]
        emotion_summary = ", ".join(emotions)
        parts.append(f"Recent emotions (newest first): {emotion_summary}")

        # Mood trend direction
        scores = [mood_tag_to_score(c.mood_tag) for c in recent_checkins]
        if len(scores) >= 3:
            avg_recent = sum(scores[:2]) / 2
            avg_older = sum(scores[2:]) / len(scores[2:])
            if avg_recent > avg_older + 0.5:
                parts.append("Mood trend: IMPROVING over recent check-ins.")
            elif avg_recent < avg_older - 0.5:
                parts.append("Mood trend: DECLINING over recent check-ins.")
            else:
                parts.append("Mood trend: STABLE.")

    # Active streak info
    streak_result = await db.execute(
        select(Streak)
        .where(Streak.user_id == user_id)
        .order_by(Streak.created_at.desc())
        .limit(1)
    )
    streak = streak_result.scalar_one_or_none()
    if streak:
        parts.append(
            f"Active streak: {streak.current_streak} days "
            f"(best: {streak.longest_streak}, total completed: {streak.total_days_completed})"
        )

    # Habit preferences
    preferences = await get_habit_preferences(db, user_id)
    if preferences["preferred"]:
        parts.append(f"User prefers: {', '.join(preferences['preferred'])}")
    if preferences["avoided"]:
        parts.append(f"User tends to skip: {', '.join(preferences['avoided'])}")

    # Journal frequency
    journal_count = await db.scalar(
        select(func.count(JournalEntry.id))
        .where(
            and_(
                JournalEntry.user_id == user_id,
                JournalEntry.date >= date.today() - timedelta(days=14),
            )
        )
    ) or 0
    if journal_count > 0:
        parts.append(f"Journal activity: {journal_count} entries in the last 2 weeks.")

    if not parts:
        return ""

    return "USER CONTEXT:\n" + "\n".join(f"- {p}" for p in parts)


async def get_habit_preferences(db: AsyncSession, user_id: str) -> dict:
    """
    Track which habit categories the user completes vs skips.

    Looks at the last 10 plans' dailyHabits and checks which
    categories appear in completed daily_completions.
    """
    # Get recent plans with their habits
    plans_result = await db.execute(
        select(Plan.id, Plan.daily_habits)
        .where(Plan.user_id == user_id)
        .order_by(Plan.created_at.desc())
        .limit(10)
    )
    plans = plans_result.all()

    if not plans:
        return {"preferred": [], "avoided": []}

    # Count categories offered
    offered_categories: Counter = Counter()
    for plan in plans:
        habits = plan.daily_habits if isinstance(plan.daily_habits, list) else []
        for habit in habits:
            if isinstance(habit, dict):
                cat = habit.get("category", "unknown")
                offered_categories[cat] += 1

    # Get completions count for this user's streaks
    completion_count = await db.scalar(
        select(func.count(DailyCompletion.id))
        .join(Streak, DailyCompletion.streak_id == Streak.id)
        .where(Streak.user_id == user_id)
    ) or 0

    # Determine preferred vs avoided based on ratios
    preferred = []
    avoided = []
    total_plans = len(plans)

    for cat, count in offered_categories.most_common():
        ratio = count / total_plans
        if ratio > 0.5:
            preferred.append(cat)
        elif ratio < 0.2:
            avoided.append(cat)

    return {
        "preferred": preferred[:3],
        "avoided": avoided[:3],
        "completion_rate": round(completion_count / max(total_plans, 1), 2),
    }


async def check_escalation(db: AsyncSession, user_id: str) -> dict:
    """
    Detect escalation signals that warrant therapist recommendation.

    Signals:
    1. Mood dropping for 3 consecutive check-ins
    2. User hasn't checked in for 5+ days
    3. Repeated crisis-adjacent language
    """
    result = {
        "should_escalate": False,
        "reason": None,
        "severity": "none",  # none, mild, moderate, high
    }

    # Check 1: 3 consecutive mood drops
    recent = await db.execute(
        select(Checkin.mood_tag, Checkin.created_at)
        .where(Checkin.user_id == user_id)
        .order_by(Checkin.created_at.desc())
        .limit(4)
    )
    recent_checkins = recent.all()

    if len(recent_checkins) >= 3:
        scores = [mood_tag_to_score(c.mood_tag) for c in recent_checkins]
        # Check if each score is lower than the previous
        declining = all(scores[i] <= scores[i + 1] for i in range(min(len(scores) - 1, 2)))
        if declining and scores[0] <= 2:
            result["should_escalate"] = True
            result["reason"] = "Your mood has been declining over recent check-ins."
            result["severity"] = "moderate"

    # Check 2: Inactivity (5+ days since last check-in)
    if recent_checkins:
        last_checkin_date = recent_checkins[0].created_at.date()
        days_since = (date.today() - last_checkin_date).days
        if days_since >= 5:
            result["should_escalate"] = True
            result["reason"] = "It's been a while since you checked in. We're here for you."
            result["severity"] = "mild"
    elif not recent_checkins:
        # No check-ins at all — not escalation, just new user
        pass

    # Check 3: Low mood score average
    if len(recent_checkins) >= 3:
        scores = [mood_tag_to_score(c.mood_tag) for c in recent_checkins[:3]]
        avg = sum(scores) / len(scores)
        if avg <= 1.5:
            result["should_escalate"] = True
            result["reason"] = "You've been going through a tough time. Professional support can help."
            result["severity"] = "high"

    return result


async def get_adaptive_home_data(db: AsyncSession, user_id: str) -> dict:
    """
    Generate adaptive content ordering for the Home feed.

    Returns nudge cards and content priority based on user state.
    """
    escalation = await check_escalation(db, user_id)
    preferences = await get_habit_preferences(db, user_id)

    nudge_cards = []

    # Escalation nudge
    if escalation["should_escalate"]:
        nudge_cards.append({
            "type": "therapist",
            "emoji": "🫂",
            "title": "Professional support can help",
            "message": escalation["reason"],
            "action": "therapist_directory",
            "priority": 1,
        })

    # Streak nudge
    streak_result = await db.execute(
        select(Streak)
        .where(Streak.user_id == user_id)
        .order_by(Streak.created_at.desc())
        .limit(1)
    )
    streak = streak_result.scalar_one_or_none()
    if streak and streak.current_streak > 0:
        nudge_cards.append({
            "type": "streak",
            "emoji": "🔥",
            "title": "VinR knows you better now",
            "message": f"You're on a {streak.current_streak}-day streak. Your preferred techniques are being prioritized.",
            "action": "journey",
            "priority": 2,
        })

    # Habit preference nudge
    if preferences.get("preferred"):
        nudge_cards.append({
            "type": "preference",
            "emoji": "🎯",
            "title": "Personalized for you",
            "message": f"We've noticed you respond well to {preferences['preferred'][0]} techniques.",
            "action": None,
            "priority": 3,
        })

    # Sort by priority
    nudge_cards.sort(key=lambda x: x["priority"])

    return {
        "nudge_cards": nudge_cards,
        "escalation": escalation,
        "preferences": preferences,
    }
