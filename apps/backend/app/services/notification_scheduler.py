"""Notification Scheduler — Celery tasks for smart notifications.

Handles 5 notification types:
1. Daily reminder at user's chosen time
2. Streak at risk (11 PM if day not completed)
3. Milestone upcoming (day before 5/10/15/21)
4. Post-milestone celebration
5. Re-engagement (3+ lapsed days)
"""

from datetime import datetime, timedelta, timezone, date
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.streak import Streak
from app.models.push_token import PushToken
from app.models.notification_preferences import NotificationPreferences
from app.services.notification_service import send_push_notification

from celery import shared_task
import asyncio
import random

MILESTONES = [5, 10, 15, 21]

# Notification templates (personalized with {name} and {day})
DAILY_REMINDER_TEMPLATES = [
    "Hey {name}, your 21-day streak is waiting. Day {day} — don't break the chain! 🔥",
    "{name}, today is Day {day}. You've come too far to stop now. Let's go! 💪",
    "Day {day} is yours, {name}. Check in and keep building. 🏆",
    "Your streak needs you, {name}! Day {day} — make it count. ⚡",
]

STREAK_AT_RISK_TEMPLATES = [
    "⚠️ {name}, Day {day} isn't checked yet. You've got 1 hour!",
    "⚠️ Don't lose your streak! Day {day} is almost over, {name}.",
    "⚠️ Quick — Day {day} ends soon. 60 seconds is all it takes, {name}.",
]

MILESTONE_UPCOMING_TEMPLATES = {
    5: "Tomorrow you hit 5 days, {name}. 🌱 Legendary.",
    10: "Tomorrow is Day 10, {name}. 🌿 Halfway to a new you.",
    15: "Tomorrow you reach 15 days, {name}. 🌸 Almost there!",
    21: "Tomorrow is THE day, {name}. Day 21. 🏆 History in the making.",
}

POST_MILESTONE_TEMPLATES = {
    5: "🌱 You hit 5 days, {name}! The old you wouldn't believe this.",
    10: "🌿 10 days strong! Habits are literally rewiring your brain, {name}.",
    15: "🌸 15 days! You're in the top 5% of people who stick with this, {name}.",
    21: "🏆 21 DAYS! YOU ARE A WINNER, {name}! New identity unlocked.",
}

RE_ENGAGEMENT_TEMPLATES = [
    "VinR misses you, {name}. Start fresh — no judgment. 💙",
    "Hey {name}, we're still here for you. Come back whenever you're ready. 🤗",
    "It's been a few days, {name}. One check-in can restart everything. 🌅",
]


import random


def _pick_template(templates: list[str] | str, name: str, day: int = 0) -> str:
    """Pick a random template and fill in placeholders."""
    if isinstance(templates, str):
        template = templates
    else:
        template = random.choice(templates)
    return template.format(name=name or "friend", day=day)


async def send_daily_reminders():
    """
    Send daily reminder notifications to users whose reminder time has arrived.
    Called periodically (every 15 minutes) by the scheduler.
    """
    now = datetime.now(timezone.utc)

    async with AsyncSessionLocal() as db:
        # Get users with active push tokens and daily reminders enabled
        result = await db.execute(
            select(User, PushToken, NotificationPreferences, Streak)
            .join(PushToken, PushToken.user_id == User.id)
            .outerjoin(
                NotificationPreferences,
                NotificationPreferences.user_id == User.id
            )
            .outerjoin(Streak, Streak.user_id == User.id)
            .where(PushToken.active == True)
        )

        rows = result.all()

        for user, push_token, prefs, streak in rows:
            # Skip if daily reminders disabled
            if prefs and not prefs.daily_reminder_enabled:
                continue

            # Skip if snoozed
            if prefs and prefs.snooze_until and prefs.snooze_until > now:
                continue

            # Check if it's the right time (within 15-min window)
            reminder_time = prefs.daily_reminder_time if prefs else None
            if reminder_time is None:
                from datetime import time
                reminder_time = time(8, 0)

            # Simple time window check (UTC for now)
            if not (reminder_time.hour == now.hour and
                    abs(reminder_time.minute - now.minute) <= 15):
                continue

            # Skip if already completed today
            if streak and streak.last_completed_date == date.today():
                continue

            day = (streak.current_streak + 1) if streak else 1
            body = _pick_template(DAILY_REMINDER_TEMPLATES, user.name, day)

            await send_push_notification(
                token=push_token.token,
                title="VinR Daily Reminder",
                body=body,
                data={"screen": "journey", "action": "mark_complete"},
                channel_id="streaks",
            )


async def send_streak_at_risk_notifications():
    """
    Send 'streak at risk' warning at 11 PM for users who haven't completed today.
    Called once around 11 PM UTC.
    """
    async with AsyncSessionLocal() as db:
        now = datetime.now(timezone.utc)

        result = await db.execute(
            select(User, PushToken, NotificationPreferences, Streak)
            .join(PushToken, PushToken.user_id == User.id)
            .outerjoin(
                NotificationPreferences,
                NotificationPreferences.user_id == User.id
            )
            .join(Streak, Streak.user_id == User.id)
            .where(PushToken.active == True)
            .where(Streak.current_streak > 0)
        )

        rows = result.all()

        for user, push_token, prefs, streak in rows:
            if prefs and not prefs.streak_at_risk_enabled:
                continue
            if prefs and prefs.snooze_until and prefs.snooze_until > now:
                continue

            # Only if not completed today
            if streak.last_completed_date == date.today():
                continue

            day = streak.current_streak + 1
            body = _pick_template(STREAK_AT_RISK_TEMPLATES, user.name, day)

            await send_push_notification(
                token=push_token.token,
                title="⚠️ Streak at Risk!",
                body=body,
                data={"screen": "journey", "action": "mark_complete"},
                channel_id="streaks",
            )


async def send_milestone_notifications():
    """
    Send milestone upcoming and post-milestone notifications.
    Called daily.
    """
    async with AsyncSessionLocal() as db:
        now = datetime.now(timezone.utc)

        result = await db.execute(
            select(User, PushToken, NotificationPreferences, Streak)
            .join(PushToken, PushToken.user_id == User.id)
            .outerjoin(
                NotificationPreferences,
                NotificationPreferences.user_id == User.id
            )
            .join(Streak, Streak.user_id == User.id)
            .where(PushToken.active == True)
            .where(Streak.current_streak > 0)
        )

        rows = result.all()

        for user, push_token, prefs, streak in rows:
            if prefs and not prefs.milestone_enabled:
                continue
            if prefs and prefs.snooze_until and prefs.snooze_until > now:
                continue

            current_day = streak.current_streak
            next_day = current_day + 1

            # Milestone upcoming (tomorrow they hit a milestone)
            if next_day in MILESTONES:
                template = MILESTONE_UPCOMING_TEMPLATES[next_day]
                body = _pick_template(template, user.name, next_day)
                await send_push_notification(
                    token=push_token.token,
                    title="🎯 Milestone Ahead!",
                    body=body,
                    data={"screen": "journey"},
                    channel_id="milestones",
                )

            # Post-milestone (they just hit a milestone today)
            if current_day in MILESTONES and streak.last_completed_date == date.today():
                template = POST_MILESTONE_TEMPLATES[current_day]
                body = _pick_template(template, user.name, current_day)
                await send_push_notification(
                    token=push_token.token,
                    title="🏆 Milestone Reached!",
                    body=body,
                    data={"screen": "journey", "action": "celebration"},
                    channel_id="milestones",
                )


async def send_re_engagement_notifications():
    """
    Send re-engagement notification to users who haven't checked in for 3+ days.
    Called daily.
    """
    async with AsyncSessionLocal() as db:
        now = datetime.now(timezone.utc)
        three_days_ago = date.today() - timedelta(days=3)

        result = await db.execute(
            select(User, PushToken, NotificationPreferences, Streak)
            .join(PushToken, PushToken.user_id == User.id)
            .outerjoin(
                NotificationPreferences,
                NotificationPreferences.user_id == User.id
            )
            .outerjoin(Streak, Streak.user_id == User.id)
            .where(PushToken.active == True)
        )

        rows = result.all()

        for user, push_token, prefs, streak in rows:
            if prefs and not prefs.re_engagement_enabled:
                continue
            if prefs and prefs.snooze_until and prefs.snooze_until > now:
                continue

            # Check if lapsed 3+ days
            if streak and streak.last_completed_date:
                if streak.last_completed_date >= three_days_ago:
                    continue  # Still active
            elif not streak:
                # No streak at all — check if user is recent
                if user.created_at.date() >= three_days_ago:
                    continue  # New user, give them time

            body = _pick_template(RE_ENGAGEMENT_TEMPLATES, user.name)

            await send_push_notification(
                token=push_token.token,
                title="We miss you 💙",
                body=body,
                data={"screen": "checkin"},
                channel_id="streaks",
            )

# --- Celery Tasks ---

@shared_task
def send_daily_reminders_task():
    """Wrapper for async daily reminders."""
    asyncio.run(send_daily_reminders())


@shared_task
def send_streak_at_risk_notifications_task():
    """Wrapper for async streak warnings."""
    asyncio.run(send_streak_at_risk_notifications())


@shared_task
def send_milestone_notifications_task():
    """Wrapper for async milestone notifications."""
    asyncio.run(send_milestone_notifications())


@shared_task
def send_re_engagement_notifications_task():
    """Wrapper for async re-engagement notifications."""
    asyncio.run(send_re_engagement_notifications())
