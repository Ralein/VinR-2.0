"""Pydantic schemas for media endpoints."""

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


# --- Audio Library ---

class AudioTrack(BaseModel):
    """A single audio track in the library."""
    id: str
    title: str
    artist: str | None = None
    category: str  # sleep, breathing, meditation, affirmation
    duration_label: str  # e.g. "5 min", "30 min"
    duration_seconds: int
    thumbnail_emoji: str  # emoji for display
    url: str | None = None  # S3 pre-signed URL (None if no S3 configured)


class AudioLibraryResponse(BaseModel):
    """Audio library response for a category."""
    category: str
    tracks: list[AudioTrack]


# --- YouTube ---

class YouTubeResult(BaseModel):
    """A single YouTube video result."""
    video_id: str
    title: str
    channel: str
    thumbnail_url: str
    duration: str | None = None


class YouTubeSearchResponse(BaseModel):
    """YouTube search results."""
    genre: str
    content_type: str  # music or motivation
    results: list[YouTubeResult]


# --- Sessions ---

class MediaSessionCreate(BaseModel):
    """Log a listening session."""
    media_type: str = Field(..., description="sleep, breathing, meditation, affirmation, youtube")
    media_id: str = Field(..., description="Track ID or YouTube video ID")
    duration_seconds: int | None = Field(None, ge=0)
    completed: bool = False


class MediaSessionResponse(BaseModel):
    """Response for a logged session."""
    id: UUID
    user_id: str
    media_type: str
    media_id: str
    duration_seconds: int | None
    completed: bool
    created_at: datetime

    model_config = {"from_attributes": True}
