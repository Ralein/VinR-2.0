"""Bookmarked events model — saves events users want to attend."""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.core.database import Base


class BookmarkedEvent(Base):
    """User-bookmarked events from Eventbrite or other sources."""
    __tablename__ = "bookmarked_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=False, index=True)
    event_id = Column(String, nullable=False)  # External event ID
    event_data = Column(JSONB, nullable=False)  # Full event payload (name, venue, date, etc.)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
