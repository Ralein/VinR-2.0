"""Pydantic schemas for events endpoints — enriched with location data."""

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class EventResponse(BaseModel):
    """A single event from search results (Google Places or Eventbrite)."""
    event_id: str
    name: str
    description: str | None = None
    venue: str | None = None
    address: str | None = None
    date: str | None = None
    start_time: str | None = None
    category: str | None = None
    distance_miles: float | None = None
    url: str | None = None
    is_virtual: bool = False
    image_url: str | None = None

    # ── New enriched fields ──
    latitude: float | None = None
    longitude: float | None = None
    google_maps_url: str | None = None
    source: str | None = None          # "google_places" | "eventbrite"
    photo_url: str | None = None       # Google Places photo or Eventbrite logo
    rating: float | None = None        # Google Places rating (1-5)
    rating_count: int | None = None    # Total user ratings
    opening_hours: list[str] | None = None  # e.g. ["Mon: 9AM-5PM", ...]
    place_id: str | None = None        # Google Places ID for deep linking


class EventSearchResponse(BaseModel):
    """Search results for events."""
    events: list[EventResponse]
    total: int
    cached: bool = False
    location_name: str | None = None   # Reverse-geocoded area name


class EventBookmarkCreate(BaseModel):
    """Bookmark an event."""
    event_id: str
    event_data: dict  # Full event payload for offline access


class EventBookmarkResponse(BaseModel):
    """Bookmarked event response."""
    id: UUID
    user_id: str
    event_id: str
    event_data: dict
    created_at: datetime

    model_config = {"from_attributes": True}
