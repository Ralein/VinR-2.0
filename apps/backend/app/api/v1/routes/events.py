"""Events routes — search nearby wellness events and bookmark management."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.events import BookmarkedEvent
from app.schemas.events import (
    EventResponse,
    EventSearchResponse,
    EventBookmarkCreate,
    EventBookmarkResponse,
)
from app.services.events_service import search_events, personalize_events

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=EventSearchResponse)
async def search_nearby_events(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    radius: int = Query(25, ge=1, le=100, description="Radius in miles"),
    keyword: str | None = Query(None, description="Search keyword (e.g. yoga, meditation)"),
    emotion: str | None = Query(None, description="User's current emotion for personalization"),
    current_user: dict = Depends(get_current_user),
):
    """Search for nearby wellness events from Google Places + Eventbrite."""
    events = await search_events(lat, lon, radius, keyword)

    # Personalize based on emotion
    if emotion:
        events = personalize_events(events, emotion)

    event_responses = [EventResponse(**e) for e in events]
    return EventSearchResponse(
        events=event_responses,
        total=len(event_responses),
    )


@router.post("/bookmark", response_model=EventBookmarkResponse)
async def bookmark_event(
    request: EventBookmarkCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Bookmark an event for later."""
    user_id = current_user["sub"]

    # Check if already bookmarked
    existing = await db.execute(
        select(BookmarkedEvent)
        .where(BookmarkedEvent.user_id == user_id)
        .where(BookmarkedEvent.event_id == request.event_id)
    )
    bookmark = existing.scalar_one_or_none()
    if bookmark:
        return bookmark

    bookmark = BookmarkedEvent(
        user_id=user_id,
        event_id=request.event_id,
        event_data=request.event_data,
    )
    db.add(bookmark)
    await db.flush()
    await db.refresh(bookmark)

    return bookmark


@router.get("/bookmarks", response_model=list[EventBookmarkResponse])
async def get_bookmarked_events(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user's bookmarked events."""
    user_id = current_user["sub"]

    result = await db.execute(
        select(BookmarkedEvent)
        .where(BookmarkedEvent.user_id == user_id)
        .order_by(BookmarkedEvent.created_at.desc())
    )

    return result.scalars().all()


@router.delete("/bookmark/{event_id}")
async def remove_bookmark(
    event_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a bookmarked event."""
    user_id = current_user["sub"]

    result = await db.execute(
        select(BookmarkedEvent)
        .where(BookmarkedEvent.user_id == user_id)
        .where(BookmarkedEvent.event_id == event_id)
    )
    bookmark = result.scalar_one_or_none()

    if bookmark:
        await db.delete(bookmark)
        return {"message": "Bookmark removed"}

    return {"message": "Bookmark not found"}
