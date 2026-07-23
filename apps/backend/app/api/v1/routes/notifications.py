"""Notification routes — push token registration + preferences."""

from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.push_token import PushToken
from app.models.notification_preferences import NotificationPreferences
from app.schemas.notification_preferences import (
    NotificationPreferencesResponse,
    NotificationPreferencesUpdate,
    SnoozeRequest,
)

router = APIRouter(prefix="/notifications", tags=["notifications"])


class RegisterTokenRequest(BaseModel):
    token: str
    platform: str  # ios, android


@router.post("/register-token")
async def register_push_token(
    request: RegisterTokenRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Register or update a push notification token for the current user."""
    user_id = current_user["sub"]

    # Deactivate old tokens for this user on same platform
    await db.execute(
        update(PushToken)
        .where(PushToken.user_id == user_id, PushToken.platform == request.platform)
        .values(active=False)
    )

    # Register new token
    push_token = PushToken(
        user_id=user_id,
        token=request.token,
        platform=request.platform,
        active=True,
    )
    db.add(push_token)

    # Create default notification preferences if not exists
    result = await db.execute(
        select(NotificationPreferences).where(
            NotificationPreferences.user_id == user_id
        )
    )
    if not result.scalar_one_or_none():
        prefs = NotificationPreferences(user_id=user_id)
        db.add(prefs)

    return {"success": True}


@router.get("/preferences", response_model=NotificationPreferencesResponse)
async def get_notification_preferences(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the current user's notification preferences."""
    user_id = current_user["sub"]

    result = await db.execute(
        select(NotificationPreferences).where(
            NotificationPreferences.user_id == user_id
        )
    )
    prefs = result.scalar_one_or_none()

    if not prefs:
        # Create defaults
        prefs = NotificationPreferences(user_id=user_id)
        db.add(prefs)
        await db.flush()
        await db.refresh(prefs)

    return prefs


@router.put("/preferences", response_model=NotificationPreferencesResponse)
async def update_notification_preferences(
    request: NotificationPreferencesUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the current user's notification preferences."""
    user_id = current_user["sub"]

    result = await db.execute(
        select(NotificationPreferences).where(
            NotificationPreferences.user_id == user_id
        )
    )
    prefs = result.scalar_one_or_none()

    if not prefs:
        prefs = NotificationPreferences(user_id=user_id)
        db.add(prefs)
        await db.flush()

    # Update only provided fields
    update_data = request.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(prefs, key, value)

    await db.flush()
    await db.refresh(prefs)
    return prefs


@router.post("/snooze")
async def snooze_notifications(
    request: SnoozeRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Snooze all notifications for N hours."""
    user_id = current_user["sub"]

    result = await db.execute(
        select(NotificationPreferences).where(
            NotificationPreferences.user_id == user_id
        )
    )
    prefs = result.scalar_one_or_none()

    if not prefs:
        prefs = NotificationPreferences(user_id=user_id)
        db.add(prefs)
        await db.flush()

    prefs.snooze_until = datetime.now(timezone.utc) + timedelta(hours=request.hours)
    await db.flush()

    return {
        "success": True,
        "snooze_until": prefs.snooze_until.isoformat(),
    }
