"""Media routes — audio library, YouTube proxy, session logging."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.media import MediaSession
from app.schemas.media import (
    AudioLibraryResponse,
    AudioTrack,
    YouTubeSearchResponse,
    YouTubeResult,
    MediaSessionCreate,
    MediaSessionResponse,
)
from app.models.journal import JournalEntry
from app.models.checkin import Checkin
from sqlalchemy import select, desc
from app.services.media_service import get_audio_library, search_youtube, search_youtube_reels

router = APIRouter(prefix="/media", tags=["media"])


@router.get("/audio", response_model=AudioLibraryResponse)
async def get_audio_tracks(
    category: str = Query(
        ..., pattern=r"^(sleep|breathing|meditation|affirmation)$",
        description="Audio category: sleep, breathing, meditation, affirmation"
    ),
    current_user: dict = Depends(get_current_user),
):
    """Get audio tracks for a specific category."""
    tracks = await get_audio_library(category)
    audio_tracks = [AudioTrack(category=category, **t) for t in tracks]
    return AudioLibraryResponse(category=category, tracks=audio_tracks)


@router.get("/youtube", response_model=YouTubeSearchResponse)
async def youtube_search(
    genre: str = Query(..., description="Music genre (Pop, R&B, etc.)"),
    type: str = Query("music", pattern=r"^(music|motivation)$", description="Content type"),
    current_user: dict = Depends(get_current_user),
):
    """Search YouTube for curated content based on user's genre preference."""
    results = await search_youtube(genre, type)
    youtube_results = [YouTubeResult(**r) for r in results]
    return YouTubeSearchResponse(genre=genre, content_type=type, results=youtube_results)


@router.get("/glint")
async def get_glint(
    focus_areas: list[str] = Query(None, description="User's selected focus areas"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get curated YouTube shorts/reels based on user's focus areas and recent emotional context."""
    user_id = current_user["sub"]
    
    # 1. Fetch recent journals for context
    journal_result = await db.execute(
        select(JournalEntry)
        .where(JournalEntry.user_id == user_id)
        .order_by(desc(JournalEntry.created_at))
        .limit(2)
    )
    journals = journal_result.scalars().all()
    journal_context = " ".join([j.reflection_text for j in journals if j.reflection_text])
    
    # 2. Fetch recent checkins for mood context
    checkin_result = await db.execute(
        select(Checkin)
        .where(Checkin.user_id == user_id)
        .order_by(desc(Checkin.created_at))
        .limit(3)
    )
    checkins = checkin_result.scalars().all()
    mood_context = ", ".join([c.mood_tag for c in checkins if c.mood_tag])
    
    # 3. Use focus areas (fall back to Stress Relief if empty)
    areas = focus_areas if focus_areas else ["Stress Relief"]
    
    # 4. Search for reels using the combined context
    results = await search_youtube_reels(
        focus_areas=areas,
        mood_context=mood_context,
        journal_context=journal_context,
        max_results=12
    )
    
    return {"glints": results}


@router.post("/session", response_model=MediaSessionResponse)
async def log_media_session(
    request: MediaSessionCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Log a media listening session for analytics."""
    user_id = current_user["sub"]

    session = MediaSession(
        user_id=user_id,
        media_type=request.media_type,
        media_id=request.media_id,
        duration_seconds=request.duration_seconds,
        completed=request.completed,
    )
    db.add(session)
    await db.flush()
    await db.refresh(session)

    return session
