"""Analytics Service — Mood trends, emotion distribution, and insight generation."""

from datetime import date, timedelta
from collections import Counter
from sqlalchemy import select, func, case, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.checkin import Checkin, Plan
from app.models.streak import Streak, DailyCompletion
from app.models.journal import JournalEntry


# Map mood tags to numeric scores (1–5)
MOOD_SCORE_MAP = {
    "happy": 5,
    "grateful": 5,
    "calm": 4,
    "hopeful": 4,
    "okay": 3,
    "neutral": 3,
    "uncertain": 3,
    "anxious": 2,
    "stressed": 2,
    "lonely": 2,
    "sad": 1,
    "angry": 1,
    "overwhelmed": 1,
    "crisis": 1,
}


def mood_tag_to_score(mood_tag: str) -> int:
    """Convert a mood tag string to a 1–5 numeric score."""
    return MOOD_SCORE_MAP.get(mood_tag.lower(), 3)


async def get_summary(db: AsyncSession, user_id: str) -> dict:
    """
    Get a user's overall analytics summary.

    Returns total check-ins, days completed, best streak,
    journal entries, and meditation count.
    """
    # Total check-ins
    checkin_count = await db.scalar(
        select(func.count(Checkin.id)).where(Checkin.user_id == user_id)
    ) or 0

    # Total days completed (across all streaks)
    days_completed = await db.scalar(
        select(func.coalesce(func.sum(Streak.total_days_completed), 0))
        .where(Streak.user_id == user_id)
    ) or 0

    # Best streak
    best_streak = await db.scalar(
        select(func.coalesce(func.max(Streak.longest_streak), 0))
        .where(Streak.user_id == user_id)
    ) or 0

    # Journal entries count
    journal_count = await db.scalar(
        select(func.count(JournalEntry.id)).where(JournalEntry.user_id == user_id)
    ) or 0

    # Meditation sessions (from daily completions with mood_rating)
    meditation_count = await db.scalar(
        select(func.count(DailyCompletion.id))
        .join(Streak, DailyCompletion.streak_id == Streak.id)
        .where(Streak.user_id == user_id)
    ) or 0

    return {
        "total_checkins": checkin_count,
        "total_days_completed": days_completed,
        "best_streak": best_streak,
        "journal_entries": journal_count,
        "meditations": meditation_count,
    }


async def get_mood_trends(
    db: AsyncSession, user_id: str, days: int = 30
) -> list[dict]:
    """
    Get daily mood data for the last N days.

    Returns a list of {date, mood_score, is_streak_day} entries.
    Days without check-ins are omitted.
    """
    cutoff = date.today() - timedelta(days=days)

    # Get check-ins in period
    result = await db.execute(
        select(Checkin.mood_tag, func.date(Checkin.created_at).label("day"))
        .where(
            and_(
                Checkin.user_id == user_id,
                func.date(Checkin.created_at) >= cutoff,
            )
        )
        .order_by(func.date(Checkin.created_at))
    )
    rows = result.all()

    # Get streak completion dates in period
    completion_result = await db.execute(
        select(func.date(DailyCompletion.completed_at).label("day"))
        .join(Streak, DailyCompletion.streak_id == Streak.id)
        .where(
            and_(
                Streak.user_id == user_id,
                func.date(DailyCompletion.completed_at) >= cutoff,
            )
        )
    )
    streak_dates = {row.day for row in completion_result.all()}

    # Aggregate by day (average if multiple checkins per day)
    day_scores: dict[date, list[int]] = {}
    for row in rows:
        d = row.day
        score = mood_tag_to_score(row.mood_tag)
        day_scores.setdefault(d, []).append(score)

    trends = []
    for d, scores in sorted(day_scores.items()):
        avg_score = round(sum(scores) / len(scores), 1)
        trends.append({
            "date": d.isoformat(),
            "mood_score": avg_score,
            "is_streak_day": d in streak_dates,
        })

    return trends


async def get_emotion_distribution(
    db: AsyncSession, user_id: str, days: int = 30
) -> list[dict]:
    """
    Get emotion frequency distribution for the last N days.

    Returns list of {emotion, count, percentage}.
    """
    cutoff = date.today() - timedelta(days=days)

    result = await db.execute(
        select(Checkin.mood_tag, func.count(Checkin.id).label("cnt"))
        .where(
            and_(
                Checkin.user_id == user_id,
                func.date(Checkin.created_at) >= cutoff,
            )
        )
        .group_by(Checkin.mood_tag)
        .order_by(func.count(Checkin.id).desc())
    )
    rows = result.all()

    total = sum(row.cnt for row in rows)
    if total == 0:
        return []

    return [
        {
            "emotion": row.mood_tag,
            "count": row.cnt,
            "percentage": round(row.cnt / total * 100, 1),
        }
        for row in rows[:5]  # Top 5 emotions
    ]


async def get_streak_correlation(db: AsyncSession, user_id: str) -> dict:
    """
    Calculate mood correlation with streak activity.

    Compares average mood on days with streak activity vs. without.
    """
    cutoff = date.today() - timedelta(days=60)

    # All check-ins with dates
    result = await db.execute(
        select(Checkin.mood_tag, func.date(Checkin.created_at).label("day"))
        .where(
            and_(
                Checkin.user_id == user_id,
                func.date(Checkin.created_at) >= cutoff,
            )
        )
    )
    checkins = result.all()

    # Streak completion dates
    comp_result = await db.execute(
        select(func.date(DailyCompletion.completed_at).label("day"))
        .join(Streak, DailyCompletion.streak_id == Streak.id)
        .where(
            and_(
                Streak.user_id == user_id,
                func.date(DailyCompletion.completed_at) >= cutoff,
            )
        )
    )
    streak_dates = {row.day for row in comp_result.all()}

    streak_day_scores = []
    off_day_scores = []

    for row in checkins:
        score = mood_tag_to_score(row.mood_tag)
        if row.day in streak_dates:
            streak_day_scores.append(score)
        else:
            off_day_scores.append(score)

    avg_streak = (
        round(sum(streak_day_scores) / len(streak_day_scores), 2)
        if streak_day_scores
        else 0
    )
    avg_off = (
        round(sum(off_day_scores) / len(off_day_scores), 2)
        if off_day_scores
        else 0
    )

    improvement = round(((avg_streak - avg_off) / max(avg_off, 1)) * 100, 1)

    return {
        "avg_mood_streak_days": avg_streak,
        "avg_mood_off_days": avg_off,
        "improvement_percent": max(improvement, 0),
    }


async def generate_insights(db: AsyncSession, user_id: str) -> list[dict]:
    """
    Generate AI-style insight cards from user data.

    Returns 2–3 personalized insight strings.
    """
    insights = []

    # Streak correlation insight
    correlation = await get_streak_correlation(db, user_id)
    if correlation["improvement_percent"] > 0:
        insights.append({
            "emoji": "📈",
            "text": f"You feel {correlation['improvement_percent']:.0f}% better on days you complete your habit.",
        })

    # Most common emotion
    distribution = await get_emotion_distribution(db, user_id, days=14)
    if distribution:
        top = distribution[0]
        insights.append({
            "emoji": "🎯",
            "text": f"Your most frequent mood this week is \"{top['emotion']}\" ({top['percentage']:.0f}% of check-ins).",
        })

    # Checkin frequency
    summary = await get_summary(db, user_id)
    if summary["total_checkins"] > 0:
        insights.append({
            "emoji": "🔥",
            "text": f"You've completed {summary['total_days_completed']} streak days across {summary['total_checkins']} check-ins. Keep going!",
        })

    return insights[:3]
